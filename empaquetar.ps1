# ============================================================
#  empaquetar.ps1 — Script de empaquetado Cine-Verse (Windows)
#  Uso: PowerShell -ExecutionPolicy Bypass -File empaquetar.ps1
#  Genera: cine-verse-entrega.zip (listo para entregar)
# ============================================================

$ProjectName = "cine-verse"
$ZipName = "cine-verse-entrega.zip"
$Source = Get-Location

Write-Host "🎬 Empaquetando $ProjectName..." -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en la carpeta correcta
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Ejecuta este script desde la raíz del proyecto ($ProjectName/)" -ForegroundColor Red
    exit 1
}

# Eliminar zip anterior si existe
if (Test-Path $ZipName) {
    Remove-Item $ZipName
    Write-Host "🗑️  Eliminado zip anterior." -ForegroundColor Yellow
}

# Directorios a excluir
$Excludes = @("node_modules", "dist", ".git", ".DS_Store", "*.log")

# Recopilar archivos a incluir (excluyendo directorios no deseados)
$Files = Get-ChildItem -Recurse -File | Where-Object {
    $path = $_.FullName
    $include = $true
    foreach ($ex in $Excludes) {
        if ($path -like "*\$ex*" -or $path -like "*/$ex*") {
            $include = $false
            break
        }
    }
    $include
}

Write-Host "📁 Archivos encontrados: $($Files.Count)" -ForegroundColor Green

# Crear zip
Compress-Archive -Path $Files.FullName -DestinationPath $ZipName -Force

$Size = (Get-Item $ZipName).length / 1KB
Write-Host ""
Write-Host "✅ ¡Empaquetado exitoso!" -ForegroundColor Green
Write-Host "📦 Archivo: $ZipName" -ForegroundColor Cyan
Write-Host "📏 Tamaño: $([math]::Round($Size, 1)) KB" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Recuerda verificar antes de entregar:" -ForegroundColor Yellow
Write-Host "   1. Reemplaza 'TU_API_KEY_AQUI' en src/components/CineBot.jsx"
Write-Host "   2. Configura EmailJS en src/services/emailService.js"
Write-Host "   3. Ejecuta database.sql en Supabase SQL Editor"
Write-Host "   4. UPDATE public.usuarios SET rol = 'admin' WHERE email = 'TU_EMAIL';"
