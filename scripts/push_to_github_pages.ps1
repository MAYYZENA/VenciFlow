Param(
    [string]$message = "Deploy: publicar no GitHub Pages",
    [switch]$Force,
    [switch]$AutoYes
)

function Fail($msg) {
    Write-Host $msg -ForegroundColor Red
    exit 1
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Fail "Git não está instalado ou não está no PATH."
}

$cwd = Get-Location
Write-Host "Repositório: $cwd"

$remoteUrl = git remote get-url origin 2>$null
if (-not $remoteUrl) {
    Fail "Não foi possível obter a URL remota 'origin'. Configure o remote e tente novamente."
}

$confirm = 's'
if (-not $AutoYes) {
    $confirm = Read-Host "Deseja publicar o conteúdo do site para a branch 'gh-pages'? (s/n)"
}
if ($confirm -ne 's' -and $confirm -ne 'S') {
    Write-Host "Operação cancelada pelo usuário." -ForegroundColor Yellow
    exit 0
}

Write-Host "Preparando arquivos de site em pasta temporária..." -ForegroundColor Cyan

$tempDir = Join-Path $env:TEMP ("fefo-deploy-" + (Get-Random))
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Copiar arquivos para pasta temporária (excluir controles e pastas de dev)
$excludes = @('.git', '.github', 'node_modules', 'out', '.vscode')

foreach ($item in Get-ChildItem -Force) {
    if ($excludes -contains $item.Name) { continue }
    $dest = Join-Path $tempDir $item.Name
    if ($item.PSIsContainer) {
        robocopy $item.FullName $dest /E /NFL /NDL /NJH /NJS | Out-Null
    } else {
        Copy-Item $item.FullName $dest -Force
    }
}

Write-Host "Inicializando repositório temporário..." -ForegroundColor Cyan
Push-Location $tempDir
git init -q
git checkout -b gh-pages
git remote add origin $remoteUrl

git add -A
try {
    git commit -m "$message" -q
} catch {
    Write-Host "Aviso: nenhum arquivo para commitar ou commit falhou." -ForegroundColor Yellow
}

Write-Host "Fazendo push para origin/gh-pages (tentativa segura)..." -ForegroundColor Cyan
$pushOutput = git push origin gh-pages 2>&1
$pushExit = $LASTEXITCODE

if ($pushExit -eq 0) {
    Write-Host "Push concluído sem forçar." -ForegroundColor Green
} else {
    Write-Host "Push falhou ou não é fast-forward." -ForegroundColor Yellow
    Write-Host $pushOutput
    $forceConfirm = 'n'
    if ($AutoYes) { $forceConfirm = 's' }
    else { $forceConfirm = Read-Host "Deseja forçar o push para 'gh-pages' (isso sobrescreverá a branch remota)? (s/n)" }
    if ($forceConfirm -eq 's' -or $forceConfirm -eq 'S') {
        Write-Host "Forçando push..." -ForegroundColor Cyan
        git push origin gh-pages --force
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Push forçado concluído." -ForegroundColor Green
        } else {
            Fail "Push forçado falhou. Verifique permissões e estado do repositório remoto."
        }
    } else {
        Write-Host "Operação abortada pelo usuário. A branch 'gh-pages' não foi alterada." -ForegroundColor Yellow
    }
}

Pop-Location

Write-Host "Removendo pasta temporária..." -ForegroundColor Cyan
Remove-Item -Recurse -Force $tempDir

Write-Host "Processo finalizado. Verifique a branch 'gh-pages' no repositório remoto." -ForegroundColor Green
