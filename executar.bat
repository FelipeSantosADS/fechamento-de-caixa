@echo off
echo ========================================
echo   EXECUTANDO POSTO GASOLINA CAIXA
echo ========================================
echo.

echo Verificando instalacao...
if not exist node_modules (
    echo ERRO: Dependencias nao instaladas!
    echo Execute primeiro: instalar.bat
    echo.
    pause
    exit /b 1
)

echo Iniciando aplicacao...
echo.
echo Para fechar o programa, feche esta janela ou pressione Ctrl+C
echo.
npm run dev

pause
