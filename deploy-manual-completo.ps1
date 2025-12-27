# DEPLOY MANUAL COMPLETO - UPLOAD PARA HOSTINGER
Write-Host "DEPLOY MANUAL COMPLETO" -ForegroundColor Green
Write-Host "======================" -ForegroundColor Yellow

# Credenciais FTP
$ftpServer = "ftp://147.93.39.12"
$ftpUser = "u444696894"
$ftpPass = "Gabri1515@"
$remotePath = "/public_html"

Write-Host "Servidor FTP: $ftpServer" -ForegroundColor Cyan
Write-Host "Usuario: $ftpUser" -ForegroundColor Cyan
Write-Host "Diretorio remoto: $remotePath" -ForegroundColor Cyan
Write-Host "" -ForegroundColor White

# Lista completa de arquivos para upload (apenas os essenciais)
$filesToUpload = @(
    "index.html",
    "landing.html",
    "app.js",
    "script.js",
    "dashboard.js",
    "webhooks.js",
    "style.css",
    "manifest.json",
    "sw.js",
    "pagseguro-integration.js",
    "payment-config.js"
)

# Verificar se arquivos existem
Write-Host "Verificando arquivos..." -ForegroundColor White
$existingFiles = @()
$missingFiles = @()

foreach ($file in $filesToUpload) {
    if (Test-Path $file) {
        $existingFiles += $file
        Write-Host "  OK: $file" -ForegroundColor Green
    } else {
        $missingFiles += $file
        Write-Host "  FALTA: $file" -ForegroundColor Red
    }
}

Write-Host "" -ForegroundColor White
Write-Host "Arquivos para upload: $($existingFiles.Count)" -ForegroundColor Cyan
Write-Host "Arquivos faltando: $($missingFiles.Count)" -ForegroundColor Yellow
Write-Host "" -ForegroundColor White

# Função para upload de arquivo
function Upload-File {
    param([string]$localFile, [string]$remoteFile)

    try {
        $ftpRequest = [System.Net.FtpWebRequest]::Create("$ftpServer$remotePath/$remoteFile")
        $ftpRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)
        $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
        $ftpRequest.UseBinary = $true
        $ftpRequest.KeepAlive = $false
        $ftpRequest.Timeout = 30000

        $fileContents = [System.IO.File]::ReadAllBytes($localFile)
        $ftpRequest.ContentLength = $fileContents.Length

        $requestStream = $ftpRequest.GetRequestStream()
        $requestStream.Write($fileContents, 0, $fileContents.Length)
        $requestStream.Close()

        $response = $ftpRequest.GetResponse()
        $response.Close()

        return $true
    }
    catch {
        Write-Host "  ERRO no upload de $localFile : $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Teste de conexão
Write-Host "Testando conexao FTP..." -ForegroundColor White
try {
    $testRequest = [System.Net.FtpWebRequest]::Create($ftpServer)
    $testRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)
    $testRequest.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectory
    $testRequest.Timeout = 15000

    $response = $testRequest.GetResponse()
    $response.Close()

    Write-Host "Conexao FTP: OK" -ForegroundColor Green
    $connectionOk = $true
}
catch {
    Write-Host "Conexao FTP: FALHA - $($_.Exception.Message)" -ForegroundColor Red
    $connectionOk = $false
}

if (-not $connectionOk) {
    Write-Host "" -ForegroundColor White
    Write-Host "DEPLOY CANCELADO - Problema de conexao FTP" -ForegroundColor Red
    exit 1
}

# Upload dos arquivos
Write-Host "" -ForegroundColor White
Write-Host "Iniciando upload..." -ForegroundColor White

$successCount = 0
$totalFiles = $existingFiles.Count

foreach ($file in $existingFiles) {
    Write-Host "Enviando: $file ..." -NoNewline
    if (Upload-File -localFile $file -remoteFile $file) {
        Write-Host " OK" -ForegroundColor Green
        $successCount++
    } else {
        Write-Host " FALHA" -ForegroundColor Red
    }
}

# Upload de pastas importantes
Write-Host "" -ForegroundColor White
Write-Host "Enviando pastas..." -ForegroundColor White

$foldersToUpload = @("assets", "css", "js", "p")
foreach ($folder in $foldersToUpload) {
    if (Test-Path $folder) {
        Write-Host "Pasta: $folder"
        $folderFiles = Get-ChildItem -Path $folder -File -Recurse
        foreach ($file in $folderFiles) {
            $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "").Replace("\", "/")
            Write-Host "  $relativePath ..." -NoNewline
            if (Upload-File -localFile $file.FullName -remoteFile $relativePath) {
                Write-Host " OK" -ForegroundColor Green
                $successCount++
            } else {
                Write-Host " FALHA" -ForegroundColor Red
            }
        }
    }
}

# Resultado final
Write-Host "" -ForegroundColor White
Write-Host "RESULTADO DO DEPLOY:" -ForegroundColor Cyan
Write-Host "  Arquivos enviados: $successCount" -ForegroundColor White
Write-Host "  Sucesso: $(if ($successCount -gt 0) { 'SIM' } else { 'NAO' })" -ForegroundColor $(if ($successCount -gt 0) { 'Green' } else { 'Red' })

if ($successCount -gt 0) {
    Write-Host "" -ForegroundColor White
    Write-Host "DEPLOY CONCLUIDO!" -ForegroundColor Green
    Write-Host "Verifique seu site no Hostinger" -ForegroundColor Green
    Write-Host "URL: http://seudominio.com" -ForegroundColor Cyan
} else {
    Write-Host "" -ForegroundColor White
    Write-Host "DEPLOY FALHADO!" -ForegroundColor Red
    Write-Host "Verifique as credenciais e conexao" -ForegroundColor Yellow
}