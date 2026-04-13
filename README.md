# 🧹 Tok Clean - Sistema de Gestão

Sistema completo de gestão empresarial para a Tok Clean com autenticação, CRUD de clientes/produtos, vendas e relatórios.

## 📋 Funcionalidades

✅ **Login com Autenticação**
- Diferentes níveis de acesso (Admin/Funcionário)
- Logout seguro
- Tokens JWT

✅ **Gestão de Clientes**
- Cadastro, edição e exclusão
- Busca avançada
- Histórico de cadastros

✅ **Gestão de Produtos/Serviços**
- CRUD completo
- Controle de estoque
- Lista de preços

✅ **Controle de Vendas**
- Registrar vendas com múltiplos produtos
- Valor total automático
- Atualização automática de estoque
- Histórico de vendas

✅ **Dashboard**
- Total de clientes
- Total de produtos
- Total de vendas
- Faturamento do mês
- Vendas recentes

✅ **Relatórios**
- Vendas por data
- Produtos mais vendidos
- Análises gerenciais

✅ **Histórico/Logs** (Admin)
- Rastreamento de ações
- Quem fez, quando e o quê
- Auditoria completa

---

## 🚀 Como Iniciar

### 1️⃣ **Instalar Dependências do Backend**

```bash
cd backend
npm install
```

### 2️⃣ **Iniciar o Servidor Backend**

```bash
npm start
# O servidor rodará em http://localhost:3000
```

Você verá:
```
Servidor rodando em http://localhost:3000
```

### 3️⃣ **Abrir Frontend**

Abra o arquivo `frontend/index.html` no navegador, ou:

```bash
# Se usar Python (opcional)
cd frontend
python3 -m http.server 8000
# Acesse em http://localhost:8000
```

---

## 📝 Credenciais Padrão

**Email:** `admin@tokclean.com`  
**Senha:** `admin123`  
**Nível:** Admin

> ⚠️ Altere a senha após o primeiro login!

---

## 📁 Estrutura do Projeto

```
tok clean/
├── backend/
│   ├── server.js          (Servidor Express)
│   ├── database.js        (SQLite - Banco de Dados)
│   ├── auth.js            (Autenticação e Middlewares)
│   ├── routes.js          (Todas as APIs)
│   ├── package.json
│   └── tokclean.db        (Banco criado automaticamente)
│
└── frontend/
    └── index.html         (App SPA completa)
```

---

## 🔌 APIs Disponíveis

### Autenticação
- `POST /api/login` - Fazer login
- `POST /api/registrar` - Criar novo usuário (admin only)

### Clientes
- `GET /api/clientes` - Listar todos
- `POST /api/clientes` - Criar novo
- `PUT /api/clientes/:id` - Editar
- `DELETE /api/clientes/:id` - Deletar
- `GET /api/clientes/buscar/:termo` - Buscar

### Produtos
- `GET /api/produtos` - Listar todos
- `POST /api/produtos` - Criar novo
- `PUT /api/produtos/:id` - Editar
- `DELETE /api/produtos/:id` - Deletar

### Vendas
- `GET /api/vendas` - Listar vendas
- `GET /api/vendas/itens/:vendaId` - Detalhes da venda
- `POST /api/vendas` - Criar venda

### Dashboard
- `GET /api/dashboard` - Estatísticas

### Relatórios
- `GET /api/relatorio/vendas-por-data` - Vendas por data
- `GET /api/relatorio/produtos-vendidos` - Produtos mais vendidos

### Logs
- `GET /api/logs` - Histórico (admin only)

---

## 💾 Banco de Dados

O banco SQLite é criado automaticamente em `backend/tokclean.db` com as tabelas:

- **usuarios** - Funcionários do sistema
- **clientes** - Clientes cadastrados
- **produtos** - Produtos/serviços
- **vendas** - Pedidos/vendas
- **itens_venda** - Itens de cada venda
- **logs** - Histórico de ações

---

## 🔐 Segurança

✅ Senhas criptografadas com bcrypt  
✅ Autenticação com JWT  
✅ Controle de acesso por nível  
✅ Logs de auditoria  
✅ CORS configurado  

---

## 📱 Responsividade

A interface é **totalmente responsiva** e funciona em:
- Desktop
- Tablet
- Mobile

---

## 🛠️ Tecnologias Utilizadas

**Backend:**
- Node.js
- Express.js
- SQLite3
- JWT (JSON Web Tokens)
- bcrypt (Criptografia)

**Frontend:**
- HTML5
- CSS3 (Grid, Flexbox)
- JavaScript vanilla (ES6+)

---

## 🚨 Troubleshooting

### Erro: "Não consegue conectar ao servidor"
- Verifique se o backend está rodando em `http://localhost:3000`
- Verifique se o backend finalizou a instalação (`npm install`)

### Erro: "Email já cadastrado"
- O email já existe no banco de dados
- Use outro email ou delete o usuário anterior

### Estoque não atualiza na venda
- Verifique se o estoque do produto é > 0
- Verifique se a quantidade solicitada é válida

---

## 📞 Suporte

Para dúvidas ou melhorias, verifique o código nos arquivos:
- `backend/routes.js` - Lógica das APIs
- `frontend/index.html` - Interface

---

**Desenvolvido com ❤️ para Tok Clean**
