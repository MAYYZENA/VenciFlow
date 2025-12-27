# Script de Upload FTP para Hostinger
# Substitua as credenciais abaixo pelas suas

# Configurações FTP (pegue no hPanel → Arquivos → Contas FTP)
$ftpServer = "ftp.seudominio.com"  # Substitua pelo seu domínio
$ftpUsername = "u123456789"        # Substitua pelo seu usuário FTP
$ftpPassword = "sua-senha-aqui"    # Substitua pela sua senha FTP
$localFolder = "migracao-hostinger"  # Pasta com os arquivos preparados

Write-Host "=== UPLOAD FTP PARA HOSTINGER ===" -ForegroundColor Green
Write-Host "Servidor: $ftpServer" -ForegroundColor Yellow
Write-Host "Usuario: $ftpUsername" -ForegroundColor Yellow

# Verificar se WinSCP está instalado
$winscpPath = "C:\Program Files (x86)\WinSCP\WinSCP.com"
if (!(Test-Path $winscpPath)) {
    Write-Host "WinSCP nao encontrado. Baixe em: https://winscp.net/" -ForegroundColor Red
    Write-Host "Ou use o metodo alternativo com FileZilla" -ForegroundColor Yellow
    exit
}

# Criar script WinSCP
$winscpScript = @"
option batch abort
option confirm off
open ftp://$ftpUsername`:$ftpPassword@$ftpServer/
cd /public_html
rmdir assets
rmdir css
rmdir js
put $localFolder\*
put $localFolder\assets\*
put $localFolder\css\*
put $localFolder\js\*
close
exit
"@

# Salvar script temporário
$scriptPath = "$env:TEMP\hostinger-upload.txt"
$winscpScript | Out-File -FilePath $scriptPath -Encoding ASCII

# Executar upload
Write-Host "Iniciando upload..." -ForegroundColor Green
& $winscpPath /script=$scriptPath /log="$env:TEMP\hostinger-upload.log"

# Verificar resultado
if ($LASTEXITCODE -eq 0) {
    Write-Host "UPLOAD CONCLUIDO COM SUCESSO!" -ForegroundColor Green
    Write-Host "Verifique seu site em: https://$ftpServer" -ForegroundColor Cyan
} else {
    Write-Host "ERRO NO UPLOAD. Verifique o log: $env:TEMP\hostinger-upload.log" -ForegroundColor Red
}

# Limpar arquivo temporário
Remove-Item $scriptPath