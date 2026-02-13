# Script PowerShell per trovare Git e fare deploy
Write-Host "=== Ricerca Git e Deploy ===" -ForegroundColor Cyan
Write-Host ""

# Percorsi comuni dove Git potrebbe essere installato
$gitPaths = @(
    "git",
    "C:\Program Files\Git\cmd\git.exe",
    "C:\Program Files (x86)\Git\cmd\git.exe",
    "$env:LOCALAPPDATA\Programs\Git\cmd\git.exe",
    "$env:ProgramFiles\Git\cmd\git.exe",
    "C:\Program Files\Git\bin\git.exe",
    "C:\Program Files (x86)\Git\bin\git.exe"
)

# Cerca anche GitHub Desktop che include Git
$githubDesktopPaths = @(
    "$env:LOCALAPPDATA\GitHubDesktop\resources\app\git\cmd\git.exe",
    "$env:ProgramFiles\GitHub Desktop\resources\app\git\cmd\git.exe"
)

$allPaths = $gitPaths + $githubDesktopPaths
$foundGit = $null

foreach ($path in $allPaths) {
    try {
        if ($path -eq "git") {
            $result = & git --version 2>&1
            if ($LASTEXITCODE -eq 0) {
                $foundGit = "git"
                break
            }
        } elseif (Test-Path $path) {
            $result = & $path --version 2>&1
            if ($LASTEXITCODE -eq 0) {
                $foundGit = $path
                break
            }
        }
    } catch {
        continue
    }
}

if (-not $foundGit) {
    Write-Host "ERRORE: Git non trovato!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Per favore installa Git da:" -ForegroundColor Yellow
    Write-Host "https://git-scm.com/download/win" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "OPPURE usa GitHub Desktop:" -ForegroundColor Yellow
    Write-Host "https://desktop.github.com/" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Dopo l'installazione, riavvia il terminale e riprova." -ForegroundColor Yellow
    Read-Host "Premi INVIO per uscire"
    exit 1
}

Write-Host "Git trovato: $foundGit" -ForegroundColor Green
Write-Host "Versione: $(& $foundGit --version)" -ForegroundColor Green
Write-Host ""

# Funzione per eseguire comandi git
function Invoke-Git {
    param([string]$Command)
    if ($foundGit -eq "git") {
        Invoke-Expression "git $Command"
    } else {
        & $foundGit $Command.Split(' ')
    }
}

# Cambia nella directory del progetto
Set-Location $PSScriptRoot

# Inizializza git se non esiste
if (-not (Test-Path .git)) {
    Write-Host "Inizializzazione repository git..." -ForegroundColor Yellow
    Invoke-Git "init"
}

# Aggiungi remote se non esiste
$remoteCheck = Invoke-Git "remote get-url origin" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Aggiunta remote origin..." -ForegroundColor Yellow
    Invoke-Git "remote add origin https://github.com/LCtech96/LaFavarotta.git"
} else {
    Write-Host "Remote origin già configurata" -ForegroundColor Green
}

# Aggiungi tutti i file
Write-Host "Aggiunta file modificati..." -ForegroundColor Yellow
Invoke-Git "add ."

# Commit
Write-Host "Creazione commit..." -ForegroundColor Yellow
$commitMessage = "Aggiunte immagini statiche da public folder e aggiornate immagini copertina/profilo"
Invoke-Git "commit -m `"$commitMessage`""

# Imposta branch main
Invoke-Git "branch -M main"

# Push
Write-Host "Push su GitHub..." -ForegroundColor Yellow
Invoke-Git "push -u origin main"

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
    Write-Host "Potrebbe essere necessario autenticarsi con GitHub." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Prova a:" -ForegroundColor Yellow
    Write-Host "1. Eseguire: git config --global user.name 'TuoNome'" -ForegroundColor White
    Write-Host "2. Eseguire: git config --global user.email 'tua@email.com'" -ForegroundColor White
    Write-Host "3. Usare un Personal Access Token invece della password" -ForegroundColor White
}

Read-Host "`nPremi INVIO per uscire"
