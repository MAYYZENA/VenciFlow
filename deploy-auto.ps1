# Script de Deploy Automático - VenciFlow
# Execute este script para deploy automático

Write-Host "=== DEPLOY AUTOMÁTICO VENCIFLOW ===" -ForegroundColor Green
Write-Host "Sistema de Assinaturas v1.1.0" -ForegroundColor Cyan
Write-Host ""

# Verificar arquivos necessários
$arquivosNecessarios = @("index.html", "app.js", "style.css", "sistema-fefo-deploy-20251225-2353.zip")
$arquivosFaltando = @()

foreach ($arquivo in $arquivosNecessarios) {
    if (!(Test-Path $arquivo)) {
        $arquivosFaltando += $arquivo
    }
}

if ($arquivosFaltando.Count -gt 0) {
    Write-Host "❌ Arquivos faltando:" -ForegroundColor Red
    $arquivosFaltando | ForEach-Object { Write-Host "   - $_" -ForegroundColor Yellow }
    exit 1
}

Write-Host "✅ Todos os arquivos necessários encontrados!" -ForegroundColor Green
Write-Host ""

# Menu de opções de deploy
Write-Host "Escolha o método de deploy:" -ForegroundColor Cyan
Write-Host "1. Hostinger (FTP)" -ForegroundColor White
Write-Host "2. GitHub Pages" -ForegroundColor White
Write-Host "3. Netlify/Vercel (Upload manual)" -ForegroundColor White
Write-Host "4. Apenas preparar ZIP" -ForegroundColor White
Write-Host ""

$opcao = Read-Host "Digite o número da opção"

switch ($opcao) {
    "1" {
        Write-Host "📁 Executando deploy via FTP..." -ForegroundColor Blue
        if (Test-Path "upload-ftp-hostinger.ps1") {
            & ".\upload-ftp-hostinger.ps1"
        } else {
            Write-Host "❌ Script FTP não encontrado. Configure suas credenciais primeiro." -ForegroundColor Red
        }
    }
    "2" {
        Write-Host "📁 Executando deploy para GitHub Pages..." -ForegroundColor Blue
        Write-Host "Comandos a executar:" -ForegroundColor Yellow
        Write-Host "git add ." -ForegroundColor White
        Write-Host "git commit -m 'VenciFlow v1.1.0 - Sistema de Assinaturas'" -ForegroundColor White
        Write-Host "git push origin main" -ForegroundColor White
        Write-Host ""
        Write-Host "⚠️  Execute estes comandos manualmente!" -ForegroundColor Red
    }
    "3" {
        Write-Host "📁 Preparado para Netlify/Vercel..." -ForegroundColor Blue
        Write-Host "Arquivo pronto: sistema-fefo-deploy-20251225-2353.zip" -ForegroundColor Green
        Write-Host "Arraste este arquivo no painel do Netlify/Vercel" -ForegroundColor Yellow
    }
    "4" {
        Write-Host "📦 ZIP já preparado!" -ForegroundColor Green
        Write-Host "Arquivo: sistema-fefo-deploy-20251225-2353.zip" -ForegroundColor Cyan
        Write-Host "Tamanho: $([math]::Round((Get-Item 'sistema-fefo-deploy-20251225-2353.zip').Length / 1KB, 2)) KB" -ForegroundColor Cyan
    }
    default {
        Write-Host "❌ Opção inválida!" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== DEPLOY CONCLUÍDO ===" -ForegroundColor Green
Write-Host "Sistema VenciFlow com Assinaturas pronto para produção!" -ForegroundColor Cyan</content>
<parameter name="filePath">c:\Users\casa\Desktop\sistema-fefo\deploy-auto.ps1