# Script para Testar Site Após Migração
# Execute este script para verificar se tudo está funcionando

Write-Host "=== TESTE DO SISTEMA FEFO APOS MIGRACAO ===" -ForegroundColor Green

# Substitua pela sua URL real
$url = "https://app.venciflow.com"  # DOMÍNIO DO USUÁRIO

Write-Host "Testando URL: $url" -ForegroundColor Yellow

try {
    # Teste básico de conectividade
    $response = Invoke-WebRequest -Uri $url -TimeoutSec 30 -UseBasicParsing

    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Site responde corretamente (Status: $($response.StatusCode))" -ForegroundColor Green

        # Verificar SSL
        if ($url -like "https://*") {
            Write-Host "✅ SSL configurado (HTTPS)" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Considere configurar HTTPS" -ForegroundColor Yellow
        }

        # Verificar conteúdo básico
        $content = $response.Content
        if ($content -like "*Sistema FEFO*") {
            Write-Host "✅ Conteúdo do Sistema FEFO encontrado" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Conteúdo pode não estar carregando corretamente" -ForegroundColor Yellow
        }

        # Verificar Firebase
        if ($content -like "*firebase*") {
            Write-Host "✅ Firebase detectado no código" -ForegroundColor Green
        }

    } else {
        Write-Host "❌ Erro HTTP: $($response.StatusCode)" -ForegroundColor Red
    }

} catch {
    Write-Host "❌ Erro ao acessar o site: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Possíveis causas:" -ForegroundColor Yellow
    Write-Host "- Domínio ainda propagando (aguarde 24-48h)" -ForegroundColor White
    Write-Host "- Arquivos não foram extraídos corretamente" -ForegroundColor White
    Write-Host "- Configuração de domínio incorreta" -ForegroundColor White
}

Write-Host "`n=== PROXIMOS PASSOS ===" -ForegroundColor Cyan
Write-Host "1. Se o teste falhou, verifique os arquivos na public_html" -ForegroundColor White
Write-Host "2. Certifique-se que o domínio está apontando para Hostinger" -ForegroundColor White
Write-Host "3. Aguarde 24-48h para propagação completa do DNS" -ForegroundColor White
Write-Host "4. Teste novamente em diferentes dispositivos" -ForegroundColor White

Write-Host "`n=== OTIMIZACOES RECOMENDADAS ===" -ForegroundColor Green
Write-Host "- Ative o CDN Cloudflare no hPanel" -ForegroundColor White
Write-Host "- Configure backup automático semanal" -ForegroundColor White
Write-Host "- Teste velocidade no Google PageSpeed Insights" -ForegroundColor White
Write-Host "- Configure monitoramento de uptime" -ForegroundColor White

Write-Host "`n🎉 BOA SORTE COM SEU SISTEMA FEFO PROFISSIONAL!" -ForegroundColor Magenta