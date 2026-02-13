@echo off
echo === Commit e Deploy Script ===
echo.

cd /d "%~dp0"

REM Verifica se git esiste
where git >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERRORE: Git non trovato nel PATH!
    echo.
    echo Per favore:
    echo 1. Riavvia il terminale dopo l'installazione di Git
    echo 2. Oppure aggiungi Git al PATH manualmente
    echo.
    echo Comandi manuali da eseguire:
    echo   git init
    echo   git remote add origin https://github.com/LCtech96/LaFavarotta.git
    echo   git add .
    echo   git commit -m "Aggiunte immagini statiche da public folder e aggiornate immagini copertina/profilo"
    echo   git branch -M main
    echo   git push -u origin main
    pause
    exit /b 1
)

echo Git trovato!
echo.

REM Inizializza git se non esiste
if not exist .git (
    echo Inizializzazione repository git...
    git init
)

REM Aggiungi remote se non esiste
git remote get-url origin >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Aggiunta remote origin...
    git remote add origin https://github.com/LCtech96/LaFavarotta.git
) else (
    echo Remote origin gia configurata.
)

REM Aggiungi tutti i file
echo Aggiunta file modificati...
git add .

REM Commit
echo Creazione commit...
git commit -m "Aggiunte immagini statiche da public folder e aggiornate immagini copertina/profilo"

REM Imposta branch main
git branch -M main

REM Push
echo Push su GitHub...
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo === SUCCESSO! ===
    echo Le modifiche sono state inviate su GitHub.
    echo Se Vercel e collegato al repository, il deploy sara automatico.
    echo.
    echo Verifica il deploy su: https://la-favarotta-3bia.vercel.app
) else (
    echo.
    echo ERRORE durante il push!
    echo Controlla le credenziali git o esegui manualmente:
    echo   git push -u origin main
)

pause
