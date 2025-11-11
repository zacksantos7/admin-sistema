# Sistema Administrativo Prime Life

Sistema administrativo completo para gerenciar clientes captados pelo quiz de vendas da Prime Life, com integração ao Supabase e geração automática de carteirinhas digitais.

## 🎯 Funcionalidades

### Dashboard Administrativo
- **Painel de Controle**: Visualização em tempo real de clientes ativos e pendentes
- **Listagem Completa**: Exibição de todos os clientes com seus dados e dependentes
- **Filtros e Busca**: Sistema de busca por nome, CPF ou plano
- **Gestão de Status**: Atualização manual de status (ativo/pendente)

### Integração com Supabase
- **Sincronização Automática**: Puxa dados automaticamente do quiz via Supabase
- **Sincronização Manual**: Botão para sincronizar dados sob demanda
- **Atualização em Tempo Real**: Sistema preparado para receber atualizações em tempo real

### Carteirinhas Digitais
- **Geração Automática**: Cria carteirinhas para clientes ativos e seus dependentes
- **QR Code**: Cada carteirinha possui QR Code único com dados do cliente
- **Download**: Permite baixar carteirinhas em formato PNG de alta qualidade
- **Design Moderno**: Layout profissional com gradiente rosa da marca Prime Life

## 🗄️ Estrutura do Banco de Dados

### Tabela: clientes
- id, nome, cpf, dataNascimento, telefone, cep, numero
- planoId, planoNome, planoPreco
- status (ativo/pendente)
- numeroCartao, validade
- createdAt, updatedAt

### Tabela: dependentes
- id, clienteId, nome, cpf, dataNascimento
- telefone, cep, numero
- numeroCartao, validade
- createdAt, updatedAt

## 🔧 Configuração

### Variáveis de Ambiente Necessárias

O sistema requer as seguintes credenciais do Supabase:

- `SUPABASE_URL`: URL do projeto Supabase
- `SUPABASE_ANON_KEY`: Chave anônima do Supabase

Essas variáveis já foram configuradas através do painel de gerenciamento.

## 📋 Estrutura do Projeto

```
sistema-admin-primelife/
├── client/
│   └── src/
│       ├── pages/
│       │   ├── Dashboard.tsx      # Painel principal
│       │   └── Carteirinhas.tsx   # Geração de carteirinhas
│       └── components/
│           └── DashboardLayout.tsx # Layout com sidebar
├── server/
│   ├── db.ts                      # Funções de banco de dados
│   ├── routers.ts                 # Rotas tRPC
│   ├── supabase.ts                # Cliente Supabase
│   └── sync-realtime.ts           # Sincronização em tempo real
└── drizzle/
    └── schema.ts                  # Schema do banco de dados
```

## 🚀 Como Usar

### 1. Sincronizar Dados do Quiz
- Acesse o Dashboard
- Clique no botão "Sincronizar Supabase"
- Os dados do quiz serão importados automaticamente

### 2. Gerenciar Clientes
- Visualize todos os clientes na lista
- Use a busca para filtrar por nome, CPF ou plano
- Alterne entre abas: Todos, Ativos, Pendentes
- Clique em "Ativar" para aprovar clientes pendentes

### 3. Gerar Carteirinhas
- Acesse a página "Carteirinhas" no menu lateral
- Selecione um cliente ativo
- Clique em "Gerar Carteirinha"
- Visualize a carteirinha com QR Code
- Clique em "Baixar Carteirinha" para salvar em PNG

### 4. Carteirinhas de Dependentes
- Na lista de clientes, expanda para ver dependentes
- Cada dependente tem seu próprio botão "Gerar"
- As carteirinhas de dependentes são marcadas com badge "Dependente"

## 🎨 Design

O sistema utiliza:
- **Cores**: Gradiente rosa (#f1054b) da marca Prime Life
- **Layout**: Dashboard com sidebar responsiva
- **Componentes**: shadcn/ui + Tailwind CSS
- **Tipografia**: Sistema de fontes moderno e legível

## 🔐 Autenticação

O sistema utiliza autenticação Manus OAuth:
- Login obrigatório para acessar o sistema
- Sessão persistente
- Logout seguro

## 📊 Fluxo de Dados

1. **Quiz** → Envia dados para Supabase
2. **Supabase** → Armazena submissões do quiz
3. **Sistema Admin** → Sincroniza dados do Supabase
4. **Banco Local** → Armazena clientes e dependentes
5. **Carteirinhas** → Geradas sob demanda para clientes ativos

## 🛠️ Tecnologias

- **Frontend**: React 19 + TypeScript + Tailwind CSS 4
- **Backend**: Express + tRPC + Drizzle ORM
- **Banco de Dados**: MySQL/TiDB
- **Integração**: Supabase Client
- **Carteirinhas**: QRCode + html2canvas

## 📝 Notas Importantes

- Apenas clientes com status "ativo" podem gerar carteirinhas
- Ao ativar um cliente, números de cartão e validade são gerados automaticamente
- A sincronização com Supabase não duplica clientes (verifica CPF)
- Carteirinhas podem ser geradas múltiplas vezes para o mesmo cliente
- O sistema está preparado para sincronização em tempo real (implementação em `sync-realtime.ts`)

## 🎯 Próximos Passos Sugeridos

1. Ativar sincronização em tempo real no servidor
2. Adicionar relatórios e estatísticas
3. Implementar notificações para novos clientes
4. Adicionar histórico de ativações
5. Criar sistema de envio de carteirinhas por email/WhatsApp
