@echo off
echo ========================================
echo   INSTALADOR - POSTO GASOLINA CAIXA
echo ========================================
echo.

echo [1/4] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao encontrado!
    echo.
    echo Por favor, instale o Node.js:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)
echo ✓ Node.js encontrado

echo.
echo [2/4] Limpando instalacao anterior...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
echo ✓ Limpeza concluida

echo.
echo [3/4] Instalando dependencias...
echo Isso pode demorar alguns minutos...
npm install
if %errorlevel% neq 0 (
    echo ERRO: Falha na instalacao das dependencias!
    echo.
    echo Tente executar manualmente:
    echo npm install
    echo.
    pause
    exit /b 1
)
echo ✓ Dependencias instaladas

echo.
echo [4/4] Testando Electron...
npx electron --version
if %errorlevel% neq 0 (
    echo ERRO: Electron nao foi instalado corretamente!
    pause
    exit /b 1
)
echo ✓ Electron funcionando

echo.
echo ========================================
echo   INSTALACAO CONCLUIDA COM SUCESSO!
echo ========================================
echo.
echo Para executar o programa:
echo   npm run dev
echo.
echo Para gerar executavel:
echo   npm run build-win
echo.
pause
