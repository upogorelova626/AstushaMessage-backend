-- CreateTable
CREATE TABLE "ChatFolder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatFolder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatFolderItem" (
    "folderId" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatFolderItem_pkey" PRIMARY KEY ("folderId","chatId")
);

-- CreateIndex
CREATE INDEX "ChatFolder_userId_idx" ON "ChatFolder"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ChatFolder_userId_name_key" ON "ChatFolder"("userId", "name");

-- CreateIndex
CREATE INDEX "ChatFolderItem_chatId_idx" ON "ChatFolderItem"("chatId");

-- AddForeignKey
ALTER TABLE "ChatFolderItem" ADD CONSTRAINT "ChatFolderItem_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "ChatFolder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatFolderItem" ADD CONSTRAINT "ChatFolderItem_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
