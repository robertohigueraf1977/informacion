/*
  Warnings:

  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_USER', 'ADMIN', 'EDITOR', 'USER');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "distritoFederalId" INTEGER,
ADD COLUMN     "distritoLocalId" INTEGER,
ADD COLUMN     "emailVerified" TIMESTAMP(3),
ADD COLUMN     "image" TEXT,
ADD COLUMN     "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mfaSecret" TEXT,
ADD COLUMN     "municipioId" INTEGER,
DROP COLUMN "role",
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'USER';

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "DistritoLocal" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DistritoLocal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DistritoFederal" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DistritoFederal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Municipio" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Municipio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Seccion" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "municipioId" INTEGER NOT NULL,
    "distritoLocalId" INTEGER NOT NULL,
    "distritoFederalId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Seccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sector" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sector_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Persona" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellidoPaterno" TEXT NOT NULL,
    "apellidoMaterno" TEXT,
    "fechaNacimiento" TIMESTAMP(3),
    "curp" TEXT,
    "claveElector" TEXT,
    "seccionId" INTEGER,
    "telefono" TEXT,
    "email" TEXT,
    "sectorId" INTEGER,
    "referente" BOOLEAN NOT NULL DEFAULT false,
    "referidoPorId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Persona_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Domicilio" (
    "id" SERIAL NOT NULL,
    "calle" TEXT NOT NULL,
    "numero" TEXT,
    "colonia" TEXT,
    "localidad" TEXT,
    "codigoPostal" TEXT,
    "referencias" TEXT,
    "latitud" DOUBLE PRECISION,
    "longitud" DOUBLE PRECISION,
    "personaId" INTEGER NOT NULL,
    "seccionId" INTEGER,
    "municipioId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Domicilio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Casilla" (
    "id" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "ubicacion" TEXT,
    "direccion" TEXT,
    "latitud" DOUBLE PRECISION,
    "longitud" DOUBLE PRECISION,
    "seccionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Casilla_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Voto" (
    "id" SERIAL NOT NULL,
    "candidato" TEXT NOT NULL,
    "partido" TEXT,
    "cantidad" INTEGER NOT NULL,
    "casillaTipo" TEXT NOT NULL,
    "casillaNumero" INTEGER NOT NULL,
    "casillaId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Voto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tarea" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL,
    "completada" BOOLEAN NOT NULL DEFAULT false,
    "personaId" INTEGER,
    "creadorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tarea_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Municipio_nombre_key" ON "Municipio"("nombre");

-- CreateIndex
CREATE INDEX "idx_seccion_nombre" ON "Seccion"("nombre");

-- CreateIndex
CREATE INDEX "idx_seccion_nombre_distritos" ON "Seccion"("nombre", "distritoLocalId", "distritoFederalId");

-- CreateIndex
CREATE INDEX "Seccion_municipioId_idx" ON "Seccion"("municipioId");

-- CreateIndex
CREATE INDEX "Seccion_distritoLocalId_idx" ON "Seccion"("distritoLocalId");

-- CreateIndex
CREATE INDEX "Seccion_distritoFederalId_idx" ON "Seccion"("distritoFederalId");

-- CreateIndex
CREATE INDEX "Seccion_createdAt_idx" ON "Seccion"("createdAt");

-- CreateIndex
CREATE INDEX "Seccion_updatedAt_idx" ON "Seccion"("updatedAt");

-- CreateIndex
CREATE INDEX "Sector_nombre_idx" ON "Sector"("nombre");

-- CreateIndex
CREATE INDEX "Sector_createdAt_idx" ON "Sector"("createdAt");

-- CreateIndex
CREATE INDEX "Sector_updatedAt_idx" ON "Sector"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Persona_curp_key" ON "Persona"("curp");

-- CreateIndex
CREATE UNIQUE INDEX "Persona_claveElector_key" ON "Persona"("claveElector");

-- CreateIndex
CREATE INDEX "Persona_nombre_idx" ON "Persona"("nombre");

-- CreateIndex
CREATE INDEX "Persona_apellidoPaterno_idx" ON "Persona"("apellidoPaterno");

-- CreateIndex
CREATE INDEX "Persona_apellidoMaterno_idx" ON "Persona"("apellidoMaterno");

-- CreateIndex
CREATE INDEX "Persona_email_idx" ON "Persona"("email");

-- CreateIndex
CREATE INDEX "Persona_telefono_idx" ON "Persona"("telefono");

-- CreateIndex
CREATE INDEX "Persona_seccionId_idx" ON "Persona"("seccionId");

-- CreateIndex
CREATE INDEX "Persona_sectorId_idx" ON "Persona"("sectorId");

-- CreateIndex
CREATE INDEX "Persona_referidoPorId_idx" ON "Persona"("referidoPorId");

-- CreateIndex
CREATE INDEX "Persona_createdAt_idx" ON "Persona"("createdAt");

-- CreateIndex
CREATE INDEX "Persona_updatedAt_idx" ON "Persona"("updatedAt");

-- CreateIndex
CREATE INDEX "idx_persona_nombre_completo" ON "Persona"("nombre", "apellidoPaterno", "apellidoMaterno");

-- CreateIndex
CREATE INDEX "Persona_referente_idx" ON "Persona"("referente");

-- CreateIndex
CREATE INDEX "idx_persona_nombre_referente" ON "Persona"("nombre", "referente");

-- CreateIndex
CREATE INDEX "idx_persona_seccion_referente" ON "Persona"("seccionId", "referente");

-- CreateIndex
CREATE INDEX "idx_persona_nombre_completo_referente" ON "Persona"("nombre", "apellidoPaterno", "apellidoMaterno", "referente");

-- CreateIndex
CREATE UNIQUE INDEX "Domicilio_personaId_key" ON "Domicilio"("personaId");

-- CreateIndex
CREATE INDEX "Domicilio_personaId_idx" ON "Domicilio"("personaId");

-- CreateIndex
CREATE INDEX "Domicilio_seccionId_idx" ON "Domicilio"("seccionId");

-- CreateIndex
CREATE INDEX "Domicilio_municipioId_idx" ON "Domicilio"("municipioId");

-- CreateIndex
CREATE INDEX "Domicilio_colonia_idx" ON "Domicilio"("colonia");

-- CreateIndex
CREATE INDEX "Domicilio_localidad_idx" ON "Domicilio"("localidad");

-- CreateIndex
CREATE INDEX "Domicilio_createdAt_idx" ON "Domicilio"("createdAt");

-- CreateIndex
CREATE INDEX "Domicilio_updatedAt_idx" ON "Domicilio"("updatedAt");

-- CreateIndex
CREATE INDEX "Tarea_personaId_idx" ON "Tarea"("personaId");

-- CreateIndex
CREATE INDEX "Tarea_creadorId_idx" ON "Tarea"("creadorId");

-- CreateIndex
CREATE INDEX "Tarea_fecha_idx" ON "Tarea"("fecha");

-- CreateIndex
CREATE INDEX "Tarea_completada_idx" ON "Tarea"("completada");

-- CreateIndex
CREATE INDEX "Tarea_createdAt_idx" ON "Tarea"("createdAt");

-- CreateIndex
CREATE INDEX "Tarea_updatedAt_idx" ON "Tarea"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_municipioId_fkey" FOREIGN KEY ("municipioId") REFERENCES "Municipio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_distritoLocalId_fkey" FOREIGN KEY ("distritoLocalId") REFERENCES "DistritoLocal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_distritoFederalId_fkey" FOREIGN KEY ("distritoFederalId") REFERENCES "DistritoFederal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seccion" ADD CONSTRAINT "Seccion_municipioId_fkey" FOREIGN KEY ("municipioId") REFERENCES "Municipio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seccion" ADD CONSTRAINT "Seccion_distritoLocalId_fkey" FOREIGN KEY ("distritoLocalId") REFERENCES "DistritoLocal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seccion" ADD CONSTRAINT "Seccion_distritoFederalId_fkey" FOREIGN KEY ("distritoFederalId") REFERENCES "DistritoFederal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Persona" ADD CONSTRAINT "Persona_seccionId_fkey" FOREIGN KEY ("seccionId") REFERENCES "Seccion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Persona" ADD CONSTRAINT "Persona_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "Sector"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Persona" ADD CONSTRAINT "Persona_referidoPorId_fkey" FOREIGN KEY ("referidoPorId") REFERENCES "Persona"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Domicilio" ADD CONSTRAINT "Domicilio_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "Persona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Domicilio" ADD CONSTRAINT "Domicilio_seccionId_fkey" FOREIGN KEY ("seccionId") REFERENCES "Seccion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Domicilio" ADD CONSTRAINT "Domicilio_municipioId_fkey" FOREIGN KEY ("municipioId") REFERENCES "Municipio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Casilla" ADD CONSTRAINT "Casilla_seccionId_fkey" FOREIGN KEY ("seccionId") REFERENCES "Seccion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voto" ADD CONSTRAINT "Voto_casillaId_fkey" FOREIGN KEY ("casillaId") REFERENCES "Casilla"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tarea" ADD CONSTRAINT "Tarea_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "Persona"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tarea" ADD CONSTRAINT "Tarea_creadorId_fkey" FOREIGN KEY ("creadorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
