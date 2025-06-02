-- AddForeignKey
ALTER TABLE "specialists" ADD CONSTRAINT "specialists_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
