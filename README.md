# 🏪 Sistema de Fechamento de Caixa - Posto de Gasolina

Sistema desktop desenvolvido em Electron para gerenciamento de fechamento de caixa em postos de gasolina.

## 🚀 Características

- **Interface Desktop Nativa**: Aplicação para Windows, Linux e macOS
- **Armazenamento Local Seguro**: Dados salvos em pasta específica
- **Sistema Multi-usuário**: Funcionários e gerentes com diferentes permissões
- **Backup Automático**: Sistema de backup integrado
- **Relatórios Completos**: Fechamentos diários e mensais
- **Controle por Turnos**: 5 turnos diferentes de trabalho

## 🛠️ Desenvolvimento no VS Code

### Pré-requisitos
- **Node.js** 16+ instalado
- **VS Code** com extensões recomendadas
- **Git** para controle de versão

### Configuração Inicial

1. **Clone/Abra o projeto no VS Code**
2. **Instale as extensões recomendadas** (VS Code irá sugerir automaticamente)
3. **Instale as dependências**:
   \`\`\`bash
   npm install
   \`\`\`

### 🎯 Comandos Disponíveis

#### Via Terminal Integrado (Ctrl+`)
\`\`\`bash
# Desenvolvimento
npm run dev

# Build para Windows
npm run build-win

# Build para Linux
npm run build-linux

# Limpar projeto
npm run clean

# Lint do código
npm run lint
npm run lint:fix
\`\`\`

#### Via Command Palette (Ctrl+Shift+P)
- `Tasks: Run Task` → Escolha a tarefa desejada
- `Debug: Start Debugging` → Para debug completo

### 🐛 Debug no VS Code

1. **Pressione F5** ou vá em `Run and Debug`
2. **Escolha "Electron: All"** para debug completo
3. **Breakpoints** funcionam tanto no main quanto no renderer

### ⚡ Atalhos Úteis

| Atalho | Ação |
|--------|------|
| `Ctrl+Shift+P` | Command Palette |
| `Ctrl+`` | Terminal Integrado |
| `F5` | Iniciar Debug |
| `Ctrl+Shift+F5` | Restart Debug |
| `Ctrl+K Ctrl+S` | Atalhos do Teclado |

## 📁 Estrutura do Projeto

\`\`\`
posto-gasolina-caixa/
├── .vscode/                 # Configurações do VS Code
│   ├── settings.json        # Configurações do workspace
│   ├── launch.json          # Configurações de debug
│   ├── tasks.json           # Tarefas automatizadas
│   └── extensions.json      # Extensões recomendadas
├── src/                     # Código fonte
│   ├── main.js             # Processo principal do Electron
│   ├── preload.js          # Bridge segura para APIs
│   ├── index.html          # Interface principal
│   ├── app.js              # Lógica da aplicação
│   └── styles.css          # Estilos da aplicação
├── assets/                  # Recursos (ícones, imagens)
├── dist/                    # Build final (gerado)
├── package.json            # Configurações do projeto
└── README.md               # Este arquivo
\`\`\`

## 🎨 Extensões Recomendadas

O VS Code irá sugerir automaticamente as seguintes extensões:

- **ESLint** - Linting de JavaScript
- **Prettier** - Formatação de código
- **Path Intellisense** - Autocomplete de caminhos
- **Auto Rename Tag** - Renomear tags HTML automaticamente
- **JavaScript Debugger** - Debug avançado

## 🔧 Configurações do VS Code

### Formatação Automática
- **Salvar**: Formata automaticamente ao salvar
- **Paste**: Formata ao colar código
- **Type**: Formata enquanto digita

### Debug Integrado
- **Breakpoints**: Clique na margem esquerda
- **Watch**: Monitore variáveis
- **Call Stack**: Veja a pilha de chamadas
- **Console**: Execute comandos durante debug

## 📦 Build e Distribuição

### Desenvolvimento
\`\`\`bash
# Executar em modo desenvolvimento
npm run dev
\`\`\`

### Produção
\`\`\`bash
# Build para Windows (gera .exe)
npm run build-win

# Build para todas as plataformas
npm run build
\`\`\`

### Arquivos Gerados
- **Windows**: `dist/Posto Gasolina - Sistema de Caixa Setup.exe`
- **Portable**: `dist/Posto Gasolina - Sistema de Caixa.exe`

## 🗂️ Dados da Aplicação

**Localização**: `%USERPROFILE%\Documents\PostoGasolina_Dados\`

**Estrutura**:
\`\`\`
PostoGasolina_Dados/
├── employees.json           # Dados dos funcionários
├── closings_[id].json      # Fechamentos por funcionário
└── backups/                # Backups automáticos
\`\`\`

## 🔐 Sistema de Login

**Usuário Padrão**:
- **Nome**: Gerente
- **PIN**: 1234
- **Função**: Gerente

## 🚀 Funcionalidades

### ✅ Implementadas
- [x] Sistema de login com PIN
- [x] Cadastro de funcionários
- [x] Fechamento diário por turno
- [x] Controle de cartões por bandeira
- [x] Relatórios mensais
- [x] Backup automático
- [x] Exportação de dados
- [x] Interface responsiva

### 🔄 Em Desenvolvimento
- [ ] Impressão de relatórios
- [ ] Gráficos de performance
- [ ] Sincronização em nuvem
- [ ] App mobile companion

## 🐛 Troubleshooting

### Problemas Comuns

**Erro ao instalar dependências**:
\`\`\`bash
npm cache clean --force
npm install
\`\`\`

**Electron não inicia**:
\`\`\`bash
npm run rebuild
\`\`\`

**Build falha**:
\`\`\`bash
npm run clean
npm install
npm run build-win
\`\`\`

## 📞 Suporte

Para suporte técnico:
1. Verifique os **logs** em `%APPDATA%\posto-gasolina-caixa\logs\`
2. Consulte a **documentação**
3. Abra uma **issue** no repositório

## 📄 Licença

MIT License - Veja o arquivo LICENSE para detalhes.
