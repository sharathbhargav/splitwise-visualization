import { SessionData } from './Transaction';
import 'express-session';

declare module 'express-session' {
  interface SessionData {
    data?: {
      transactions: SessionData['transactions'];
      storeMappings: SessionData['storeMappings'];
    };
  }
}
