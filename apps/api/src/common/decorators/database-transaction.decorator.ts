import { SetMetadata } from "@nestjs/common";

export const NO_DATABASE_TRANSACTION_KEY = "no_database_transaction";
export const DATABASE_TRANSACTION_KEY = "database_transaction";

/** Opts a short HTTP mutation into an interceptor-managed transaction. */
export const DatabaseTransaction = () => SetMetadata(DATABASE_TRANSACTION_KEY, true);

/** Marks long-lived HTTP streams that must not hold a database connection. */
export const NoDatabaseTransaction = () => SetMetadata(NO_DATABASE_TRANSACTION_KEY, true);
