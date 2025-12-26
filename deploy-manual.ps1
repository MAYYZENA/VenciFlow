# DEPLOY MANUAL PARA HOSTINGER
# Edite as credenciais abaixo e execute o script

# SUAS CREDENCIAIS - EDITE AQUI
$ftpServer = "ftp.seudominio.com"  # Substitua pelo seu domínio real
$ftpUsername = "u444696894"        # Seu usuário FTP
$ftpPassword = "Gabri1515@"         # Sua senha FTP

Write-Host "=== DEPLOY MANUAL VENCIFLOW ===" -ForegroundColor Green
Write-Host "Servidor: $ftpServer" -ForegroundColor Yellow
Write-Host "Usuario: $ftpUsername" -ForegroundColor Yellow

# Verificar arquivo ZIP
$zipFile = "sistema-fefo-deploy-20251225-2353.zip"
if (!(Test-Path $zipFile)) {
    Write-Host "ERRO: ZIP nao encontrado" -ForegroundColor Red
    exit 1
}

# Testar conexao
Write-Host "Testando conexao FTP..." -ForegroundColor Blue
try {
    $ftpRequest = [System.Net.FtpWebRequest]::Create("ftp://$ftpServer")
    $ftpRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUsername, $ftpPassword)
    $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectory
    $ftpRequest.GetResponse().Close()
    Write-Host "Conexao OK!" -ForegroundColor Green
} catch {
    Write-Host "ERRO conexao FTP" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

# Upload
Write-Host "Iniciando upload..." -ForegroundColor Blue
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
        Write-Host "OK: $relativePath" -ForegroundColor Green

    } catch {
        Write-Host "ERRO: $relativePath" -ForegroundColor Red
    }
}

Remove-Item $tempFolder -Recurse -Force

Write-Host "DEPLOY FINALIZADO!" -ForegroundColor Green
Write-Host "$filesUploaded arquivos enviados" -ForegroundColor Cyan
Write-Host "Site: https://$ftpServer" -ForegroundColor Yellow