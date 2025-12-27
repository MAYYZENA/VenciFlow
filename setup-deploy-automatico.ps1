# CONFIGURACAO DEPLOY AUTOMATICO - GitHub -> Hostinger

Write-Host "CONFIGURANDO DEPLOY AUTOMATICO" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Yellow

# Verificar se esta no diretorio correto
if (!(Test-Path "package.json")) {
    Write-Host "Erro: Execute este script dentro da pasta do projeto VenciFlow" -ForegroundColor Red
    exit 1
}

Write-Host "Diretorio do projeto: $(Get-Location)" -ForegroundColor Cyan

# Verificar se .github/workflows existe
if (!(Test-Path ".github\workflows")) {
    Write-Host "Criando estrutura .github/workflows..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path ".github\workflows" -Force | Out-Null
}

# Verificar se workflow ja existe
if (Test-Path ".github\workflows\deploy.yml") {
    Write-Host "Workflow ja existe!" -ForegroundColor Green
} else {
    Write-Host "Workflow nao encontrado. Criando..." -ForegroundColor Red
}

# Criar arquivo .env.example para referencia
Write-Host "Criando arquivo de referencia .env.example..." -ForegroundColor Yellow
$envContent = @"
# Configuracoes de Deploy para Hostinger
FTP_SERVER=seu-dominio.com
FTP_USERNAME=usuario-ftp
FTP_PASSWORD=sua-senha-ftp

# Configuracoes do Firebase (se necessario)
FIREBASE_API_KEY=sua-api-key
FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
FIREBASE_PROJECT_ID=seu-projeto-id
"@

$envContent | Out-File -FilePath ".env.example" -Encoding UTF8

Write-Host "" -ForegroundColor White
Write-Host "PROXIMOS PASSOS:" -ForegroundColor Green
Write-Host "===============" -ForegroundColor Yellow
Write-Host "" -ForegroundColor White
Write-Host "1. CONFIGURAR SECRETS NO GITHUB:" -ForegroundColor Cyan
Write-Host "   - Va para: https://github.com/SEU-USUARIO/VenciFlow/settings/secrets/actions" -ForegroundColor White
Write-Host "   - Clique em 'New repository secret'" -ForegroundColor White
Write-Host "   - Adicione os secrets (nomes EXATOS, sem espacos):" -ForegroundColor Yellow
Write-Host "     - FTP_SERVER = seu-dominio.com" -ForegroundColor White
Write-Host "     - FTP_USERNAME = seu-usuario-ftp" -ForegroundColor White
Write-Host "     - FTP_PASSWORD = sua-senha-ftp" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "   REGRAS PARA NOMES:" -ForegroundColor Yellow
Write-Host "   - Apenas letras, numeros e _ (sublinhado)" -ForegroundColor White
Write-Host "   - Nao use espacos, hifens ou caracteres especiais" -ForegroundColor White
Write-Host "   - Deve comecar com letra ou _" -ForegroundColor White
Write-Host "   - Exemplo CORRETO: FTP_SERVER" -ForegroundColor Green
Write-Host "   - Exemplo ERRADO: FTP SERVER, ftp-server" -ForegroundColor Red
Write-Host "" -ForegroundColor White
Write-Host "2. FAZER PRIMEIRO DEPLOY:" -ForegroundColor Cyan
Write-Host "   - git add ." -ForegroundColor White
Write-Host "   - git commit -m 'Add automated deploy'" -ForegroundColor White
Write-Host "   - git push origin main" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "3. VERIFICAR STATUS:" -ForegroundColor Cyan
Write-Host "   - Va para a aba 'Actions' no GitHub" -ForegroundColor White
Write-Host "   - Veja o progresso do deploy" -ForegroundColor White
Write-Host "" -ForegroundColor White

Write-Host "CONFIGURACAO CONCLUIDA!" -ForegroundColor Green
Write-Host "Agora todo push no GitHub fara deploy automatico no Hostinger!" -ForegroundColor Green
Write-Host "" -ForegroundColor White
Write-Host "DOCUMENTACAO: DEPLOY-AUTOMATICO.md" -ForegroundColor Cyan