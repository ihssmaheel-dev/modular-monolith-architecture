import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { ok, err, Result } from "neverthrow";
import { PinoLoggerService } from "../logger/logger.service";

export interface TransactionError {
  code: "TRANSACTION_FAILED" | "TRANSACTION_ABORTED";
  message: string;
}

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly logger: PinoLoggerService,
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

  async onModuleDestroy() {
    if (this.isConnected()) {
      await this.connection.close();
      this.logger.info({}, "MongoDB connection closed");
    }
  }
}
