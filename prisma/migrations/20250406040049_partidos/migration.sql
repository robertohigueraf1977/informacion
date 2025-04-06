/*
  Warnings:

  - You are about to drop the `Voto` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Voto" DROP CONSTRAINT "Voto_casillaId_fkey";

-- DropTable
DROP TABLE "Voto";

-- CreateTable
CREATE TABLE "candidatos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,

    CONSTRAINT "candidatos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partidos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "siglas" TEXT NOT NULL,

    CONSTRAINT "partidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "votos" (
    "id" SERIAL NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "casillaId" INTEGER NOT NULL,
    "candidatoId" INTEGER,
    "partidoId" INTEGER,

    CONSTRAINT "votos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "votos" ADD CONSTRAINT "votos_casillaId_fkey" FOREIGN KEY ("casillaId") REFERENCES "Casilla"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votos" ADD CONSTRAINT "votos_candidatoId_fkey" FOREIGN KEY ("candidatoId") REFERENCES "candidatos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votos" ADD CONSTRAINT "votos_partidoId_fkey" FOREIGN KEY ("partidoId") REFERENCES "partidos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
