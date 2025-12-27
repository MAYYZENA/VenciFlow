# TESTE DE CONEXAO FTP
Write-Host "TESTE DE CONEXAO FTP" -ForegroundColor Green
Write-Host "===================" -ForegroundColor Yellow

# Credenciais FTP
$ftpServer = "ftp://147.93.39.12"
$ftpUser = "u444696894"
$ftpPass = "Gabri1515@"

Write-Host "Servidor: $ftpServer" -ForegroundColor Cyan
Write-Host "Usuario: $ftpUser" -ForegroundColor Cyan
Write-Host "" -ForegroundColor White

# Teste de conexão
Write-Host "Testando conexao..." -ForegroundColor White
try {
    $testRequest = [System.Net.FtpWebRequest]::Create($ftpServer)
    $testRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)
    $testRequest.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectory
    $testRequest.Timeout = 10000

    $response = $testRequest.GetResponse()
    $response.Close()

    Write-Host "SUCESSO: Conexao FTP funcionando!" -ForegroundColor Green
    Write-Host "" -ForegroundColor White
    Write-Host "CONCLUSAO: Credenciais FTP estao corretas" -ForegroundColor Green
    Write-Host "PROBLEMA: Workflow do GitHub Actions" -ForegroundColor Cyan
}
catch {
    Write-Host "ERRO: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "" -ForegroundColor White
    Write-Host "CONCLUSAO: Problema nas credenciais FTP" -ForegroundColor Red
    Write-Host "VERIFICAR:" -ForegroundColor Yellow
    Write-Host "  - Usuario e senha corretos" -ForegroundColor Yellow
    Write-Host "  - Servidor FTP acessivel" -ForegroundColor Yellow
    Write-Host "  - Porta 21 nao bloqueada" -ForegroundColor Yellow
}