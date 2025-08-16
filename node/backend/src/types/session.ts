import { Transaction } from './Transaction';
import 'express-session';

/**
 * Session data structure for storing user's transaction data
 */
interface SpendingSessionData {
  /** Array of parsed transactions */
  transactions: Transaction[];
  /** Mapping of canonical store names to their variations */
  storeMappings: { [canonicalName: string]: string[] };
}

declare module 'express-session' {
  interface SessionData {
    data?: SpendingSessionData;
  }
}