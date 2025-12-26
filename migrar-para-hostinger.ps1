# Script de Migracao para Hostinger
# Execute este script no PowerShell para preparar os arquivos

Write-Host "Iniciando migracao para Hostinger Premium..." -ForegroundColor Green

# Arquivos essenciais para upload
$arquivosEssenciais = @(
    "index.html",
    "landing.html",
    "app.js",
    "script.js",
    "sw.js",
    "style.css",
    "manifest.json",
    "package.json"
)

# Pastas para incluir
$pastasIncluir = @(
    "assets",
    "css",
    "js",
    "p"
)

# Criar pasta de migracao
$migracaoPath = "migracao-hostinger"
if (!(Test-Path $migracaoPath)) {
    New-Item -ItemType Directory -Path $migracaoPath | Out-Null
}

Write-Host "Copiando arquivos essenciais..." -ForegroundColor Yellow

# Copiar arquivos essenciais
foreach ($arquivo in $arquivosEssenciais) {
    if (Test-Path $arquivo) {
        Copy-Item $arquivo -Destination $migracaoPath
        Write-Host "OK: $arquivo" -ForegroundColor Green
    } else {
        Write-Host "AVISO: $arquivo nao encontrado" -ForegroundColor Yellow
    }
}

# Copiar pastas
foreach ($pasta in $pastasIncluir) {
    if (Test-Path $pasta) {
        Copy-Item $pasta -Destination $migracaoPath -Recurse
        Write-Host "OK: Pasta $pasta" -ForegroundColor Green
    } else {
        Write-Host "AVISO: Pasta $pasta nao encontrada" -ForegroundColor Yellow
    }
}

# Criar arquivo .htaccess para otimizacao
Write-Host "Criando arquivo .htaccess..." -ForegroundColor Yellow
$htaccess = @"
# Otimizacoes para Hostinger Premium
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType image/jpg "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 month"
    ExpiresByType image/gif "access plus 1 month"
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/pdf "access plus 1 week"
    ExpiresByType text/javascript "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>

# Redirecionamento HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
"@

$htaccess | Out-File -FilePath "$migracaoPath\.htaccess" -Encoding UTF8

# Compactar tudo em ZIP
Write-Host "Compactando arquivos..." -ForegroundColor Yellow
$zipPath = "sistema-fefo-hostinger.zip"
if (Test-Path $zipPath) {
    Remove-Item $zipPath
}

Compress-Archive -Path "$migracaoPath\*" -DestinationPath $zipPath

Write-Host "Arquivo compactado: $zipPath" -ForegroundColor Green
Write-Host "Tamanho do arquivo:" (Get-Item $zipPath).Length "bytes" -ForegroundColor Cyan

Write-Host "`nMIGRACAO PREPARADA COM SUCESSO!" -ForegroundColor Green
Write-Host "`nPROXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host "1. Faca upload do arquivo $zipPath para o Hostinger" -ForegroundColor White
Write-Host "2. Extraia na pasta public_html" -ForegroundColor White
Write-Host "3. Configure seu dominio no hPanel" -ForegroundColor White
Write-Host "4. Teste o sistema em https://seudominio.com" -ForegroundColor White

Write-Host "`nDICAS PARA HOSTINGER PREMIUM:" -ForegroundColor Cyan
Write-Host "- Use o CDN integrado para melhor performance" -ForegroundColor White
Write-Host "- Configure backups automaticos" -ForegroundColor White
Write-Host "- Aproveite o suporte 24/7 prioritario" -ForegroundColor White