# 🚀 DEPLOY DIRETO PARA HOSTINGER
# Script simplificado para upload imediato

Write-Host "=== DEPLOY VENCIFLOW PARA HOSTINGER ===" -ForegroundColor Green
Write-Host "Sistema de Assinaturas v1.1.0" -ForegroundColor Cyan
Write-Host ""

# Verificar se arquivo ZIP existe
$zipFile = "sistema-fefo-deploy-20251225-2353.zip"
if (!(Test-Path $zipFile)) {
    Write-Host "❌ Arquivo ZIP não encontrado: $zipFile" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Arquivo ZIP encontrado: $zipFile" -ForegroundColor Green
Write-Host ""

# Solicitar credenciais FTP
Write-Host "📝 Digite suas credenciais do Hostinger FTP:" -ForegroundColor Yellow
Write-Host "(Pegue no hPanel → Arquivos → Contas FTP)" -ForegroundColor Gray
Write-Host ""

$ftpServer = Read-Host "Servidor FTP (ex: ftp.seudominio.com)"
$ftpUsername = Read-Host "Usuário FTP (ex: u123456789)"
$ftpPassword = Read-Host "Senha FTP" -AsSecureString
$ftpPasswordText = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($ftpPassword))

Write-Host ""
Write-Host "🔍 Verificando conexão..." -ForegroundColor Blue

# Testar conexão FTP
try {
    $ftpRequest = [System.Net.FtpWebRequest]::Create("ftp://$ftpServer")
    $ftpRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUsername, $ftpPasswordText)
    $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectory
    $ftpRequest.GetResponse().Close()
    Write-Host "✅ Conexão FTP estabelecida!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro na conexão FTP. Verifique as credenciais." -ForegroundColor Red
    Write-Host "Erro: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📤 Iniciando upload..." -ForegroundColor Blue

# Criar pasta temporária para extração
$tempFolder = "$env:TEMP\venciflow-deploy"
if (Test-Path $tempFolder) {
    Remove-Item $tempFolder -Recurse -Force
}
New-Item -ItemType Directory -Path $tempFolder | Out-Null

# Extrair ZIP
Write-Host "📦 Extraindo arquivos..." -ForegroundColor Yellow
Expand-Archive -Path $zipFile -DestinationPath $tempFolder -Force

# Upload dos arquivos via FTP
$filesUploaded = 0
$totalFiles = (Get-ChildItem $tempFolder -Recurse -File).Count

Get-ChildItem $tempFolder -Recurse -File | ForEach-Object {
    $relativePath = $_.FullName.Replace($tempFolder, "").TrimStart("\")
    $ftpPath = "ftp://$ftpServer/public_html/$relativePath"

    try {
        $ftpRequest = [System.Net.FtpWebRequest]::Create($ftpPath)
        $ftpRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUsername, $ftpPasswordText)
        $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
        $ftpRequest.UseBinary = $true

        $fileContents = [System.IO.File]::ReadAllBytes($_.FullName)
        $ftpRequest.ContentLength = $fileContents.Length

        $requestStream = $ftpRequest.GetRequestStream()
        $requestStream.Write($fileContents, 0, $fileContents.Length)
        $requestStream.Close()

        $response = $ftpRequest.GetResponse()
        $response.Close()

        $filesUploaded++
        Write-Host "✅ Upload: $relativePath ($filesUploaded/$totalFiles)" -ForegroundColor Green

    } catch {
        Write-Host "❌ Erro no upload: $relativePath" -ForegroundColor Red
        Write-Host "Erro: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Limpar pasta temporária
Remove-Item $tempFolder -Recurse -Force

Write-Host ""
Write-Host "=== DEPLOY CONCLUÍDO ===" -ForegroundColor Green
Write-Host "✅ $filesUploaded arquivos enviados com sucesso!" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Acesse seu site em: https://$ftpServer" -ForegroundColor Yellow
Write-Host ""
Write-Host "🎯 FUNCIONALIDADES DISPONÍVEIS:" -ForegroundColor Cyan
Write-Host "   • Sistema de Assinaturas (menu lateral)" -ForegroundColor White
Write-Host "   • Planos Básico/Profissional/Premium" -ForegroundColor White
Write-Host "   • Gestão completa de produtos" -ForegroundColor White
Write-Host "   • Interface responsiva" -ForegroundColor White
Write-Host ""
Write-Host "⚠️ PRÓXIMO PASSO: Configure o gateway de pagamento!" -ForegroundColor Yellow