@echo off
echo Instalando dependencias...
npm install

echo Construindo aplicacao...
npm run build-win

echo Build concluido! Verifique a pasta 'dist' para o instalador.
pause
