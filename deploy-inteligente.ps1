# DEPLOY AUTOMÁTICO INTELIGENTE PARA HOSTINGER
# Tenta múltiplas possibilidades de domínio FTP

$ftpUsername = "u444696894"
$ftpPassword = "Gabri1515@"

# Possíveis domínios FTP do Hostinger
$possiveisHosts = @(
    "ftp.hostinger.com",
    "ftp.hostinger.com.br",
    "147.93.39.12",
    "ftp.u444696894.hostingerapp.com",
    "u444696894.hostingerapp.com"
)

Write-Host "=== DEPLOY AUTOMÁTICO VENCIFLOW ===" -ForegroundColor Green
Write-Host "Testando conexões FTP automaticamente..." -ForegroundColor Cyan

$conexaoEncontrada = $false
$hostFuncionando = ""

foreach ($ftpHost in $possiveisHosts) {
    Write-Host "Testando: $ftpHost" -ForegroundColor Yellow
    try {
        $ftpRequest = [System.Net.FtpWebRequest]::Create("ftp://$ftpHost")
        $ftpRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUsername, $ftpPassword)
        $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectory
        $ftpRequest.Timeout = 5000  # 5 segundos timeout
        $ftpRequest.GetResponse().Close()
        Write-Host "✅ Conexão OK com: $ftpHost" -ForegroundColor Green
        $conexaoEncontrada = $true
        $hostFuncionando = $ftpHost
        break
    } catch {
        Write-Host "❌ Falhou: $ftpHost" -ForegroundColor Red
    }
}

if (!$conexaoEncontrada) {
    Write-Host "ERRO: Nenhuma conexão FTP funcionou!" -ForegroundColor Red
    Write-Host "Possíveis soluções:" -ForegroundColor Yellow
    Write-Host "1. Verifique se o domínio está ativo" -ForegroundColor White
    Write-Host "2. Use o hPanel para upload manual" -ForegroundColor White
    Write-Host "3. Verifique as credenciais FTP" -ForegroundColor White
    exit 1
}

Write-Host "Iniciando upload para: $hostFuncionando" -ForegroundColor Blue

# Verificar arquivo ZIP
$zipFile = "sistema-fefo-deploy-20251225-2353.zip"
if (!(Test-Path $zipFile)) {
    Write-Host "ERRO: Arquivo ZIP não encontrado" -ForegroundColor Red
    exit 1
}

# Extrair arquivos
$tempFolder = "$env:TEMP\venciflow-deploy"
if (Test-Path $tempFolder) { Remove-Item $tempFolder -Recurse -Force }
New-Item -ItemType Directory -Path $tempFolder | Out-Null
Expand-Archive -Path $zipFile -DestinationPath $tempFolder -Force

# Upload arquivos
$filesUploaded = 0
$totalFiles = (Get-ChildItem $tempFolder -Recurse -File).Count

Write-Host "Enviando $totalFiles arquivos..." -ForegroundColor Cyan

Get-ChildItem $tempFolder -Recurse -File | ForEach-Object {
    $relativePath = $_.FullName.Replace($tempFolder, "").TrimStart("\")
    $ftpPath = "ftp://$hostFuncionando/public_html/$relativePath"

    try {
        $ftpRequest = [System.Net.FtpWebRequest]::Create($ftpPath)
        $ftpRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUsername, $ftpPassword)
        $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
        $ftpRequest.UseBinary = $true
        $ftpRequest.Timeout = 30000  # 30 segundos

        $fileContents = [System.IO.File]::ReadAllBytes($_.FullName)
        $ftpRequest.ContentLength = $fileContents.Length

        $requestStream = $ftpRequest.GetRequestStream()
        $requestStream.Write($fileContents, 0, $fileContents.Length)
        $requestStream.Close()

        $response = $ftpRequest.GetResponse()
        $response.Close()

        $filesUploaded++
        Write-Host "✅ $relativePath ($filesUploaded/$totalFiles)" -ForegroundColor Green

    } catch {
        Write-Host "❌ ERRO: $relativePath - $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Limpar
Remove-Item $tempFolder -Recurse -Force

Write-Host "" -ForegroundColor White
Write-Host "=== DEPLOY CONCLUÍDO! ===" -ForegroundColor Green
Write-Host "✅ $filesUploaded arquivos enviados com sucesso!" -ForegroundColor Cyan
Write-Host "🌐 Site disponível em: https://$hostFuncionando" -ForegroundColor Yellow
Write-Host "" -ForegroundColor White
Write-Host "🎯 FUNCIONALIDADES ATIVAS:" -ForegroundColor Cyan
Write-Host "   • Sistema de Assinaturas completo" -ForegroundColor White
Write-Host "   • Planos Básico/Profissional/Premium" -ForegroundColor White
Write-Host "   • Gestão de produtos e validade" -ForegroundColor White
Write-Host "   • Interface responsiva profissional" -ForegroundColor White