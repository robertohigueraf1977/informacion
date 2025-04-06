#!/bin/bash

# Ejecutar el script de seed con TypeScript
echo "Creando superusuario..."
npx ts-node prisma/seed.ts

echo "Proceso completado."

