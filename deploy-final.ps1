# Deploy Hostinger Simples
Write-Host "=== DEPLOY VENCIFLOW PARA HOSTINGER ===" -ForegroundColor Green

# Verificar arquivo ZIP
$zipFile = "sistema-fefo-deploy-20251225-2353.zip"
if (!(Test-Path $zipFile)) {
    Write-Host "ERRO: Arquivo ZIP nao encontrado" -ForegroundColor Red
    exit 1
}

Write-Host "Arquivo ZIP encontrado!" -ForegroundColor Green

# Solicitar credenciais
Write-Host "Digite suas credenciais FTP:" -ForegroundColor Yellow
$ftpServer = Read-Host "Servidor FTP"
$ftpUsername = Read-Host "Usuario FTP"
$ftpPassword = Read-Host "Senha FTP"

Write-Host "Testando conexao..." -ForegroundColor Blue

# Testar FTP
try {
    $ftpRequest = [System.Net.FtpWebRequest]::Create("ftp://$ftpServer")
    $ftpRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUsername, $ftpPassword)
    $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectory
    $ftpRequest.GetResponse().Close()
    Write-Host "Conexao FTP OK!" -ForegroundColor Green
} catch {
    Write-Host "ERRO na conexao FTP" -ForegroundColor Red
    exit 1
}

Write-Host "Iniciando upload..." -ForegroundColor Blue

# Extrair e fazer upload
$tempFolder = "$env:TEMP\venciflow-deploy"
Expand-Archive -Path $zipFile -DestinationPath $tempFolder -Force

$filesUploaded = 0
Get-ChildItem $tempFolder -Recurse -File | ForEach-Object {
    $relativePath = $_.FullName.Replace($tempFolder, "").TrimStart("\")
    $ftpPath = "ftp://$ftpServer/public_html/$relativePath"

    try {
        $ftpRequest = [System.Net.FtpWebRequest]::Create($ftpPath)
        $ftpRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUsername, $ftpPassword)
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
        Write-Host "Upload: $relativePath ($filesUploaded)" -ForegroundColor Green

    } catch {
        Write-Host "ERRO upload: $relativePath" -ForegroundColor Red
    }
}

Remove-Item $tempFolder -Recurse -Force

Write-Host "DEPLOY CONCLUIDO!" -ForegroundColor Green
Write-Host "$filesUploaded arquivos enviados" -ForegroundColor Cyan
Write-Host "Acesse: https://$ftpServer" -ForegroundColor Yellow