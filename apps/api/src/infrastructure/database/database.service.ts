import { Injectable, OnApplicationShutdown } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { ok, err, Result } from "neverthrow";
import { ClsService } from "nestjs-cls";
import { PinoLoggerService } from "../logger/logger.service";

export interface TransactionError {
  code: "TRANSACTION_FAILED" | "TRANSACTION_ABORTED";
  message: string;
}

@Injectable()
export class DatabaseService implements OnApplicationShutdown {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly logger: PinoLoggerService,
    private readonly cls: ClsService,
  ) {}

  getConnection(): Connection {
    return this.connection;
  }

  isConnected(): boolean {
    return this.connection.readyState === 1;
  }

  async withTransaction<T>(
    fn: () => Promise<T>,
  ): Promise<Result<T, TransactionError>> {
    const session = await this.connection.startSession();
    
    // Check if we are inside a CLS context (e.g., HTTP request or worker job)
    if (!this.cls.isActive()) {
      return this.runTransaction(session, fn);
    }

    // Clone the current context so concurrent transactions in the same request don't collide
    const context = { ...this.cls.get(), mongoSession: session };
    return this.cls.runWith(context, () => this.runTransaction(session, fn));
  }

  private async runTransaction<T>(session: any, fn: () => Promise<T>): Promise<Result<T, TransactionError>> {
    try {
      session.startTransaction();
      const result = await fn();
      await session.commitTransaction();
      return ok(result);
    } catch (error) {
      await session.abortTransaction();
      this.logger.error(
        { error: error instanceof Error ? error.message : String(error) },
        "Transaction failed",
      );
      return err({
        code: "TRANSACTION_FAILED",
        message: "api.error.transactionFailed",
      });
    } finally {
      session.endSession();
    }
  }

  async onApplicationShutdown() {
    if (this.isConnected()) {
      await this.connection.close();
      this.logger.info({}, "MongoDB connection closed");
    }
  }
}
