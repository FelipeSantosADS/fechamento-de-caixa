# 🚀 Como Executar o Sistema

## ⚡ Método Rápido (Recomendado)

### 1. Instalar Dependências
\`\`\`bash
# Execute o arquivo:
instalar.bat
\`\`\`

### 2. Executar o Sistema
\`\`\`bash
# Execute o arquivo:
executar.bat
\`\`\`

### 3. Gerar Executável (Opcional)
\`\`\`bash
# Execute o arquivo:
gerar-exe.bat
\`\`\`

## 🛠️ Método Manual

### Pré-requisitos
- **Node.js** instalado (https://nodejs.org/)
- **VS Code** (opcional, mas recomendado)

### Passo a Passo

1. **Abrir terminal no VS Code** (`Ctrl+``)

2. **Instalar dependências**:
   \`\`\`bash
   npm install
   \`\`\`

3. **Executar em desenvolvimento**:
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Gerar executável** (opcional):
   \`\`\`bash
   npm run build-win
   \`\`\`

## 🐛 Resolução de Problemas

### Erro: "Node.js não encontrado"
- Instale o Node.js: https://nodejs.org/
- Reinicie o terminal/VS Code

### Erro: "npm não é reconhecido"
- Reinicie o computador após instalar Node.js
- Verifique se Node.js está no PATH

### Erro: "Electron não inicia"
\`\`\`bash
# Limpar e reinstalar
npm run clean
npm install
\`\`\`

### Erro: "Permissão negada"
- Execute como Administrador
- Ou use: `npm install --no-optional`

### Erro: "Porta em uso"
- Feche outras instâncias do Electron
- Reinicie o terminal

## 📁 Estrutura de Arquivos

\`\`\`
posto-gasolina-caixa/
├── instalar.bat         # Instalar dependências
├── executar.bat         # Executar sistema
├── gerar-exe.bat        # Gerar executável
├── src/                 # Código fonte
│   ├── main.js         # Processo principal
│   ├── preload.js      # Bridge segura
│   └── index.html      # Interface
├── package.json        # Configurações
└── dist/               # Executável (após build)
\`\`\`

## ✅ Teste de Funcionamento

Após executar, você deve ver:
1. **Tela de carregamento** com ícone do posto
2. **Interface principal** com botões de teste
3. **Informações do sistema** carregadas
4. **Botões funcionando**: Salvar, Carregar, Abrir Pasta

## 📞 Suporte

Se ainda não funcionar:
1. Verifique se Node.js está instalado: `node --version`
2. Verifique se npm funciona: `npm --version`
3. Execute `instalar.bat` como Administrador
4. Reinicie o computador se necessário

## 🎯 Próximos Passos

Após o sistema funcionar:
1. Teste os botões na interface
2. Verifique se a pasta de dados é criada
3. Implemente as funcionalidades do posto
