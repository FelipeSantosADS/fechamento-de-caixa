@echo off
echo ========================================
echo   GERANDO EXECUTAVEL
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

echo Gerando executavel para Windows...
echo Isso pode demorar alguns minutos...
echo.
npm run build-win

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   EXECUTAVEL GERADO COM SUCESSO!
    echo ========================================
    echo.
    echo Verifique a pasta 'dist' para encontrar:
    echo - Instalador: Posto Gasolina - Sistema de Caixa Setup.exe
    echo.
    if exist dist (
        echo Abrindo pasta dist...
        explorer dist
    )
) else (
    echo.
    echo ERRO: Falha ao gerar executavel!
    echo Verifique os erros acima.
)

echo.
pause
