/*
  Warnings:

  - Added the required column `siglas` to the `partidos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Casilla" ADD COLUMN "tipo" TEXT NOT NULL DEFAULT 'BASICA';

-- First add the column as nullable
ALTER TABLE "partidos" ADD COLUMN "siglas" TEXT;

-- Update existing records to set default values based on the nombre field
UPDATE "partidos" SET "siglas" = SUBSTRING(nombre FROM 1 FOR 3);

-- Now make the column not null
ALTER TABLE "partidos" ALTER COLUMN "siglas" SET NOT NULL;
