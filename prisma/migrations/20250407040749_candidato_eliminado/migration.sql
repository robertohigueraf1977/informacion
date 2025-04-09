/*
  Warnings:

  - You are about to drop the column `candidatoId` on the `votos` table. All the data in the column will be lost.
  - You are about to drop the `candidatos` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "votos" DROP CONSTRAINT "votos_candidatoId_fkey";

-- AlterTable
ALTER TABLE "votos" DROP COLUMN "candidatoId";

-- DropTable
DROP TABLE "candidatos";
