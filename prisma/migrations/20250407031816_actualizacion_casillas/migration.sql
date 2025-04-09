/*
  Warnings:

  - You are about to drop the column `latitud` on the `Casilla` table. All the data in the column will be lost.
  - You are about to drop the column `longitud` on the `Casilla` table. All the data in the column will be lost.
  - You are about to drop the column `tipo` on the `Casilla` table. All the data in the column will be lost.
  - You are about to drop the column `ubicacion` on the `Casilla` table. All the data in the column will be lost.
  - You are about to drop the column `siglas` on the `partidos` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[seccionId]` on the table `Casilla` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Casilla" DROP COLUMN "latitud",
DROP COLUMN "longitud",
DROP COLUMN "tipo",
DROP COLUMN "ubicacion";

-- AlterTable
ALTER TABLE "partidos" DROP COLUMN "siglas";

-- CreateIndex
CREATE UNIQUE INDEX "Casilla_seccionId_key" ON "Casilla"("seccionId");
