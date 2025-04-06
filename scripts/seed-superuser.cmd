@echo off
echo Creando superusuario...
npx ts-node prisma/seed.ts
echo Proceso completado.
pause

