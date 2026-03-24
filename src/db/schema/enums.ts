import { pgEnum } from "drizzle-orm/pg-core";

export const transactionType = pgEnum('transaction_type', ['income', 'expense', 'mixed']);