import type { Request } from 'express';
import type { CurrentUserPayload } from './current-user.type.js';

export interface AuthenticatedRequest extends Request {
  cookies: Record<string, string | undefined>;
  user: CurrentUserPayload;
}
