#!/bin/bash
# ============================================================
#  empaquetar.sh — Script de empaquetado Cine-Verse
#  Uso: bash empaquetar.sh
#  Genera: cine-verse-entrega.zip (listo para entregar)
# ============================================================

set -e

PROYECTO="cine-verse"
ZIP_NAME="cine-verse-entrega.zip"
FECHA=$(date +"%Y%m%d_%H%M")

echo "🎬 Empaquetando $PROYECTO..."
echo ""

# Verificar que estamos en la carpeta correcta
if [ ! -f "package.json" ]; then
  echo "❌ Error: Ejecuta este script desde la raíz del proyecto ($PROYECTO/)"
  exit 1
fi

# Eliminar zip anterior si existe
if [ -f "$ZIP_NAME" ]; then
  rm "$ZIP_NAME"
  echo "🗑️  Eliminado zip anterior."
fi

# Crear el zip excluyendo directorios no deseados
zip -r "$ZIP_NAME" . \
  --exclude "*.git*" \
  --exclude "node_modules/*" \
  --exclude "dist/*" \
  --exclude ".DS_Store" \
  --exclude "*.log" \
  --exclude ".env.local" \
  --exclude "__pycache__/*"

echo ""
echo "✅ ¡Empaquetado exitoso!"
echo "📦 Archivo: $ZIP_NAME"
echo "📏 Tamaño: $(du -sh $ZIP_NAME | cut -f1)"
echo ""
echo "📋 Contenido del zip:"
unzip -l "$ZIP_NAME" | head -40
echo ""
echo "💡 Recuerda verificar antes de entregar:"
echo "   1. Reemplaza 'TU_API_KEY_AQUI' en src/components/CineBot.jsx"
echo "   2. Reemplaza las credenciales de EmailJS en src/services/emailService.js"
echo "   3. Ejecuta el script database.sql en tu proyecto de Supabase"
echo "   4. Crea el usuario admin en Supabase:"
echo "      UPDATE public.usuarios SET rol = 'admin' WHERE email = 'TU_EMAIL';"
