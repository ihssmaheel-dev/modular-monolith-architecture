import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { from, lastValueFrom, type Observable } from "rxjs";
import { DatabaseService } from "../../infrastructure/database";
import { NO_DATABASE_TRANSACTION_KEY } from "../decorators/database-transaction.decorator";

@Injectable()
export class DatabaseTransactionInterceptor implements NestInterceptor {
  constructor(
    private readonly database: DatabaseService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (this.shouldSkip(context)) return next.handle();
    return from(this.database.runTransaction(() => lastValueFrom(next.handle())));
  }

  private shouldSkip(context: ExecutionContext): boolean {
    if (context.getType() !== "http") return true;
    return Boolean(
      this.reflector.getAllAndOverride<boolean>(NO_DATABASE_TRANSACTION_KEY, [
        context.getHandler(),
        context.getClass(),
      ]),
    );
  }
}
