import { Injectable, OnApplicationShutdown } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import type { ClientSession, Connection } from "mongoose";
import { err, ok, type Result } from "neverthrow";
import { ClsService } from "nestjs-cls";
import { PinoLoggerService } from "../logger/logger.service";
import type { TransactionError } from "./database.types";

@Injectable()
export class DatabaseService implements OnApplicationShutdown {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly logger: PinoLoggerService,
    private readonly cls: ClsService,
  ) {}

  isConnected(): boolean {
    return this.connection.readyState === 1;
  }

  async withTransaction<T>(fn: () => Promise<T>): Promise<Result<T, TransactionError>> {
    return this.useSession((session) => this.runTransaction(session, fn));
  }

  async withResultTransaction<T, E>(
    fn: () => Promise<Result<T, E>>,
  ): Promise<Result<T, E | TransactionError>> {
    return this.useSession((session) => this.runResultTransaction(session, fn));
  }

  private async runTransaction<T>(
    session: ClientSession,
    fn: () => Promise<T>,
  ): Promise<Result<T, never>> {
    session.startTransaction();
    try {
      const result = await fn();
      await session.commitTransaction();
      return ok(result);
    } catch (error) {
      await this.abortTransaction(session);
      throw error;
    }
  }

  private async runResultTransaction<T, E>(
    session: ClientSession,
    fn: () => Promise<Result<T, E>>,
  ): Promise<Result<T, E>> {
    session.startTransaction();
    try {
      const result = await fn();
      if (result.isErr()) {
        await this.abortTransaction(session);
        return err(result.error);
      }
      await session.commitTransaction();
      return ok(result.value);
    } catch (error) {
      await this.abortTransaction(session);
      throw error;
    }
  }

  private async useSession<T, E>(
    callback: (session: ClientSession) => Promise<Result<T, E>>,
  ): Promise<Result<T, E | TransactionError>> {
    let session: ClientSession | undefined;
    try {
      const activeSession = await this.connection.startSession();
      session = activeSession;
      const current = this.cls.isActive() ? this.cls.get() : {};
      const context = Object.assign({}, current, { mongoSession: activeSession });
      return await this.cls.runWith(context, () => callback(activeSession));
    } catch (error) {
      this.logTransactionFailure(error);
      return err({ type: "TRANSACTION_FAILED" });
    } finally {
      if (session) await this.endSession(session);
    }
  }

  private async abortTransaction(session: ClientSession): Promise<void> {
    try {
      await session.abortTransaction();
    } catch (error) {
      this.logger.error({ error: errorMessage(error) }, "Transaction abort failed");
    }
  }

  private async endSession(session: ClientSession): Promise<void> {
    try {
      await session.endSession();
    } catch (error) {
      this.logger.error({ error: errorMessage(error) }, "Database session cleanup failed");
    }
  }

  private logTransactionFailure(error: unknown): void {
    this.logger.error({ error: errorMessage(error) }, "Transaction failed");
  }

  async onApplicationShutdown(): Promise<void> {
    if (this.isConnected()) {
      await this.connection.close();
      this.logger.info({}, "MongoDB connection closed");
    }
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
