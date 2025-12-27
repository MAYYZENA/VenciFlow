# VALIDADOR DE NOMES DE SECRETS

Write-Host "VALIDANDO NOMES DE SECRETS PARA GITHUB" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Yellow

# Lista de secrets necessários
$secretsNecessarios = @(
    "FTP_SERVER",
    "FTP_USERNAME",
    "FTP_PASSWORD"
)

Write-Host "Secrets necessarios:" -ForegroundColor Cyan
foreach ($secret in $secretsNecessarios) {
    Write-Host "  - $secret" -ForegroundColor White
}

Write-Host "" -ForegroundColor White
Write-Host "Verificando regras do GitHub..." -ForegroundColor Cyan

$validos = 0
foreach ($secret in $secretsNecessarios) {
    $isValid = $true
    $erros = @()

    # Regra 1: Não pode ter espaços
    if ($secret -match "\s") {
        $isValid = $false
        $erros += "Contem espacos"
    }

    # Regra 2: Apenas letras, números e _
    if ($secret -notmatch "^[a-zA-Z0-9_]+$") {
        $isValid = $false
        $erros += "Caracteres invalidos (apenas letras, numeros e _)"
    }

    # Regra 3: Deve começar com letra ou _
    if ($secret -notmatch "^[a-zA-Z_]") {
        $isValid = $false
        $erros += "Nao comeca com letra ou _"
    }

    if ($isValid) {
        Write-Host "  [OK] $secret - VALIDO" -ForegroundColor Green
        $validos++
    } else {
        Write-Host "  [ERRO] $secret - INVALIDO" -ForegroundColor Red
        foreach ($erro in $erros) {
            Write-Host "     - $erro" -ForegroundColor Red
        }
    }
}

Write-Host "" -ForegroundColor White
Write-Host "RESULTADO:" -ForegroundColor Cyan
if ($validos -eq $secretsNecessarios.Count) {
    Write-Host "  [SUCESSO] TODOS OS SECRETS SAO VALIDOS!" -ForegroundColor Green
    Write-Host "  Pronto para configurar no GitHub!" -ForegroundColor Green
} else {
    Write-Host "  [FALHA] $validos/$($secretsNecessarios.Count) secrets validos" -ForegroundColor Red
    Write-Host "  Corrija os nomes antes de configurar" -ForegroundColor Yellow
}

Write-Host "" -ForegroundColor White
Write-Host "DICA: Use estes nomes EXATAMENTE como mostrado acima" -ForegroundColor Cyan
