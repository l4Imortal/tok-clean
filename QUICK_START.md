# 🚀 GUIA RÁPIDO - Tok Clean

## ⚡ 3 Passos para Começar

### Passo 1: Instalar Dependências
```bash
cd backend
npm install
```

### Passo 2: Iniciar o Servidor
```bash
npm start
```
**Esperado:** `Servidor rodando em http://localhost:3000`

### Passo 3: Abrir no Navegador
Abra o arquivo: `frontend/index.html`

---

## 🔓 Login

**Email:** `admin@tokclean.com`
**Senha:** `admin123`

---

## 📊 O que você pode fazer:

### 1. Dashboard 📈
- Ver total de clientes
- Ver total de produtos
- Ver total de vendas
- Ver faturamento do mês

### 2. Gestionar Clientes 👥
- Adicionar novo cliente
- Editar cliente
- Deletar cliente
- Buscar clientes

### 3. Gestionar Produtos 📦
- Adicionar produto
- Editar produto
- Deletar produto
- Controlar estoque

### 4. Registrar Vendas 💼
- Selecionar cliente
- Selecionar produtos
- Quantidade automática
- Preço total automático
- Estoque atualiza sozinho!

### 5. Ver Relatórios 📑
- Vendas por data
- Produtos mais vendidos

### 6. Admin Tools 🔧 (só para admin)
- Criar novos usuários
- Ver histórico de ações
- Auditoria completa

---

## 🗂️ Arquivos do Projeto

```
tok clean/
├── 📄 README.md              ← Documentação completa
├── 📄 QUICK_START.md         ← Este arquivo
├── 🔧 setup.sh               ← Script de instalação
│
├── backend/
│   ├── server.js             ← Servidor principal
│   ├── database.js           ← SQLite e tabelas
│   ├── auth.js               ← Autenticação JWT
│   ├── routes.js             ← Todas as APIs
│   ├── package.json          ← Dependências
│   ├── .env                  ← Variáveis de ambiente
│   └── tokclean.db           ← Banco (criado automaticamente)
│
└── frontend/
    └── index.html            ← App SPA (abra no navegador!)
```

---

## 🆘 Problemas Comuns?

❌ **"Cannot connect to server"**
- Verifique se o backend está rodando
- Verifique se está na porta 3000

❌ **"npm not found"**
- Instale Node.js: https://nodejs.org/

❌ **"Email já cadastrado"**
- Use outro email no cadastro

---

## 💡 Dicas

✨ **Dashboard** - Sempre veja o panorama geral do negócio
✨ **Buscar** - Use a busca para encontrar clientes rapidamente
✨ **Estoque** - Atenção com produtos com poucos itens (marcados em amarelo)
✨ **Admin** - Só admins veem histórico e outros usuários
✨ **Mobile** - Tudo funciona em celular!

---

## 🔐 Segurança

- Senhas são criptografadas 🔒
- Tokens JWT = acesso temporário ⏰
- Histórico de quem fez o quê 📋
- Níveis de acesso (admin/funcionário) 🛡️

---

**Bom trabalho! 🎉**
