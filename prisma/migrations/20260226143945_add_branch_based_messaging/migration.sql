-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "receiverBranchId" TEXT,
ADD COLUMN     "senderBranchId" TEXT,
ADD COLUMN     "targetType" TEXT NOT NULL DEFAULT 'USER';

-- CreateIndex
CREATE INDEX "Message_organizationId_receiverBranchId_idx" ON "Message"("organizationId", "receiverBranchId");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderBranchId_fkey" FOREIGN KEY ("senderBranchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_receiverBranchId_fkey" FOREIGN KEY ("receiverBranchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
