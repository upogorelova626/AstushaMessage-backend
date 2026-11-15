-- CreateTable
CREATE TABLE "MessagePin" (
    "messageId" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "pinnedById" TEXT NOT NULL,
    "pinnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "MessagePin_pkey" PRIMARY KEY ("messageId")
);

-- CreateIndex
CREATE INDEX "MessagePin_chatId_pinnedAt_idx" ON "MessagePin"("chatId", "pinnedAt" DESC);

-- CreateIndex
CREATE INDEX "MessagePin_expiresAt_idx" ON "MessagePin"("expiresAt");

-- AddForeignKey
ALTER TABLE "MessagePin" ADD CONSTRAINT "MessagePin_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessagePin" ADD CONSTRAINT "MessagePin_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
