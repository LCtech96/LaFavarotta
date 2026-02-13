# Script per commit e deploy
# Esegui questo script dalla cartella del progetto

Write-Host "=== Commit e Deploy Script ===" -ForegroundColor Cyan

# Verifica se git è disponibile
$gitPath = $null
$possiblePaths = @(
    "git",
    "C:\Program Files\Git\bin\git.exe",
    "C:\Program Files (x86)\Git\bin\git.exe",
    "$env:LOCALAPPDATA\Programs\Git\bin\git.exe"
)

foreach ($path in $possiblePaths) {
    try {
        $result = & $path --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            $gitPath = $path
            Write-Host "Git trovato: $gitPath" -ForegroundColor Green
            break
        }
    } catch {
        continue
    }
}

if (-not $gitPath) {
    Write-Host "ERRORE: Git non trovato!" -ForegroundColor Red
    Write-Host "Per favore installa Git da: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Oppure esegui manualmente questi comandi:" -ForegroundColor Yellow
    Write-Host "  git init" -ForegroundColor White
    Write-Host "  git remote add origin https://github.com/LCtech96/LaFavarotta.git" -ForegroundColor White
    Write-Host "  git add ." -ForegroundColor White
    Write-Host "  git commit -m 'Aggiunte immagini statiche da public folder e aggiornate immagini copertina/profilo'" -ForegroundColor White
    Write-Host "  git branch -M main" -ForegroundColor White
    Write-Host "  git push -u origin main" -ForegroundColor White
    exit 1
}

# Cambia nella directory del progetto
Set-Location $PSScriptRoot

# Inizializza git se non esiste
if (-not (Test-Path .git)) {
    Write-Host "Inizializzazione repository git..." -ForegroundColor Yellow
    & $gitPath init
}

# Aggiungi remote se non esiste
$remoteExists = & $gitPath remote get-url origin 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Aggiunta remote origin..." -ForegroundColor Yellow
    & $gitPath remote add origin https://github.com/LCtech96/LaFavarotta.git
} else {
    Write-Host "Remote origin già configurata: $remoteExists" -ForegroundColor Green
}

# Aggiungi tutti i file
Write-Host "Aggiunta file modificati..." -ForegroundColor Yellow
& $gitPath add .

# Commit
Write-Host "Creazione commit..." -ForegroundColor Yellow
$commitMessage = "Aggiunte immagini statiche da public folder e aggiornate immagini copertina/profilo"
& $gitPath commit -m $commitMessage

# Imposta branch main
& $gitPath branch -M main

# Push
Write-Host "Push su GitHub..." -ForegroundColor Yellow
& $gitPath push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=== SUCCESSO! ===" -ForegroundColor Green
    Write-Host "Le modifiche sono state inviate su GitHub." -ForegroundColor Green
    Write-Host "Se Vercel è collegato al repository, il deploy sarà automatico." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Verifica il deploy su: https://la-favarotta-3bia.vercel.app" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "ERRORE durante il push!" -ForegroundColor Red
    Write-Host "Controlla le credenziali git o esegui manualmente:" -ForegroundColor Yellow
    Write-Host "  git push -u origin main" -ForegroundColor White
}
