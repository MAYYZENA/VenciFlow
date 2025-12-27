# Teste de conexão FTP
Write-Host "TESTANDO CONEXAO FTP" -ForegroundColor Green
Write-Host "====================" -ForegroundColor Yellow

# Credenciais de teste
$ftpServer = "ftp://147.93.39.12"
$ftpUser = "u444696894"
$ftpPass = "Gabri1515@"

Write-Host "Servidor: $ftpServer" -ForegroundColor Cyan
Write-Host "Usuario: $ftpUser" -ForegroundColor Cyan
Write-Host "Testando conexao..." -ForegroundColor White

try {
    # Criar cliente FTP
    $ftpRequest = [System.Net.FtpWebRequest]::Create($ftpServer)
    $ftpRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)
    $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectory
    $ftpRequest.UseBinary = $true
    $ftpRequest.KeepAlive = $false
    $ftpRequest.Timeout = 30000

    # Tentar conectar
    $response = $ftpRequest.GetResponse()
    $response.Close()

    Write-Host "CONEXAO FTP BEM SUCEDIDA!" -ForegroundColor Green
    Write-Host "Credenciais corretas!" -ForegroundColor Green

} catch {
    Write-Host "ERRO NA CONEXAO FTP:" -ForegroundColor Red
    Write-Host "Detalhes: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "" -ForegroundColor White
    Write-Host "Possiveis causas:" -ForegroundColor Yellow
    Write-Host "- Credenciais incorretas" -ForegroundColor Yellow
    Write-Host "- Servidor FTP bloqueado" -ForegroundColor Yellow
    Write-Host "- Porta FTP bloqueada (21)" -ForegroundColor Yellow
    Write-Host "- Firewall bloqueando" -ForegroundColor Yellow
}