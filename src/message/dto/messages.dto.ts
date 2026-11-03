import { Message } from '../../generated/prisma/client.js';

export class GetMessagesResponse {
  items: Message[];
  hasMore: boolean;
  nextCursor: string | null;
}
