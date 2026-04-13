# 📊 Diagrama do Banco de Dados - Tok Clean

## Estrutura das Tabelas

```
┌─────────────────────────────────────────────────────────────┐
│                          BANCO SQLite                        │
│                        (tokclean.db)                         │
└─────────────────────────────────────────────────────────────┘


┌──────────────────────┐
│     USUARIOS         │  (Funcionários)
├──────────────────────┤
│ id (PK)              │
│ nome                 │
│ email (UNIQUE)       │
│ senha (hash bcrypt)  │
│ nivel (admin/func)   │
│ ativo                │
│ data_cadastro        │
└──────────────────────┘
         ↓ (cria)
         
┌──────────────────────┐        ┌──────────────────────────┐
│    CLIENTES          │        │      VENDAS              │
├──────────────────────┤        ├──────────────────────────┤
│ id (PK)              │        │ id (PK)                  │
│ nome                 │←─────→ │ cliente_id (FK)          │
│ email (UNIQUE)       │        │ usuario_id (FK)          │
│ telefone             │        │ data_venda               │
│ data_cadastro        │        │ valor_total              │
│ criado_por (FK)      │        └──────────────────────────┘
└──────────────────────┘               ↓ (contém)
         ↓ (relacionado)       
                          ┌──────────────────────────────┐
┌──────────────────────┐  │    ITENS_VENDA               │
│    PRODUTOS          │  ├──────────────────────────────┤
├──────────────────────┤  │ id (PK)                      │
│ id (PK)              │  │ venda_id (FK → vendas)       │
│ nome                 │──│ produto_id (FK → produtos)   │
│ descricao            │  │ quantidade                   │
│ preco                │  │ preco_unitario               │
│ quantidade_estoque   │  │ subtotal                     │
│ data_cadastro        │  └──────────────────────────────┘
│ criado_por (FK)      │
└──────────────────────┘

         ↑ (rastreia)
         |
┌──────────────────────┐
│       LOGS           │  (Histórico/Auditoria)
├──────────────────────┤
│ id (PK)              │
│ usuario_id (FK)      │
│ acao (CREATE/READ...)│
│ tabela               │
│ registro_id          │
│ descricao            │
│ data_log             │
└──────────────────────┘
```

---

## Relacionamentos

### 1️⃣ **USUARIOS → CLIENTES**
- Um usuário pode criar múltiplos clientes
- `clientes.criado_por` → `usuarios.id`

### 2️⃣ **USUARIOS → PRODUTOS**
- Um usuário pode criar múltiplos produtos
- `produtos.criado_por` → `usuarios.id`

### 3️⃣ **CLIENTES → VENDAS**
- Um cliente pode ter múltiplas vendas
- `vendas.cliente_id` → `clientes.id`

### 4️⃣ **USUARIOS → VENDAS**
- Um usuário vende para múltiplos clientes
- `vendas.usuario_id` → `usuarios.id`

### 5️⃣ **VENDAS → ITENS_VENDA**
- Uma venda tem múltiplos itens
- `itens_venda.venda_id` → `vendas.id`

### 6️⃣ **PRODUTOS → ITENS_VENDA**
- Um produto aparece em múltiplos itens de venda
- `itens_venda.produto_id` → `produtos.id`
- O estoque em `produtos.quantidade_estoque` é decrementado

### 7️⃣ **USUARIOS → LOGS**
- Cada ação é registrada por um usuário
- `logs.usuario_id` → `usuarios.id`

---

## Esquema SQL

```sql
-- TABELA DE USUÁRIOS
CREATE TABLE usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha TEXT NOT NULL,
  nivel TEXT DEFAULT 'funcionario
  ativo INTEGER DEFAULT 1,
  data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- TABELA DE CLIENTES
CREATE TABLE clientes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT UNIQUE,
  telefone TEXT,
  data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
  criado_por INTEGER,
  FOREIGN KEY(criado_por) REFERENCES usuarios(id)
);

-- TABELA DE PRODUTOS/SERVIÇOS
CREATE TABLE produtos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  descricao TEXT,
  preco REAL NOT NULL,
  quantidade_estoque INTEGER DEFAULT 0,
  data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
  criado_por INTEGER,
  FOREIGN KEY(criado_por) REFERENCES usuarios(id)
);

-- TABELA DE VENDAS
CREATE TABLE vendas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER NOT NULL,
  usuario_id INTEGER NOT NULL,
  data_venda DATETIME DEFAULT CURRENT_TIMESTAMP,
  valor_total REAL,
  FOREIGN KEY(cliente_id) REFERENCES clientes(id),
  FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
);

-- TABELA DE ITENS DE VENDA
CREATE TABLE itens_venda (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  venda_id INTEGER NOT NULL,
  produto_id INTEGER NOT NULL,
  quantidade INTEGER NOT NULL,
  preco_unitario REAL,
  subtotal REAL,
  FOREIGN KEY(venda_id) REFERENCES vendas(id),
  FOREIGN KEY(produto_id) REFERENCES produtos(id)
);

-- TABELA DE LOGS/HISTÓRICO
CREATE TABLE logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  acao TEXT NOT NULL,
  tabela TEXT,
  registro_id INTEGER,
  descricao TEXT,
  data_log DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
);
```

---

## Fluxo de Dados - Uma Venda Completa

```
1. ADMIN CRIA USUÁRIO
   usuarios ← nome, email, senha

2. FUNCIONÁRIO FAZ LOGIN
   JWT token gerado
   Permissões: CRUD clientes, CRUD produtos, CRIAR vendas

3. CADASTRA CLIENTE
   clientes ← nome, email, telefone, criado_por=usuario_id

4. CADASTRA PRODUTO
   produtos ← nome, preco, quantidade_estoque=100, criado_por=usuario_id

5. CRIA VENDA
   a) Seleciona cliente
      vendas ← cliente_id, usuario_id, data_venda, valor_total=0
   
   b) Adiciona itens
      itens_venda ← venda_id, produto_id, quantidade, preco_unitario, subtotal
      UPDATE produtos SET quantidade_estoque = quantidade_estoque - quantidade
   
   c) Calcula total
      UPDATE vendas SET valor_total = SUM(itens_venda.subtotal)

6. SYSTÈME REGISTRA AÇÃO
   logs ← usuario_id, acao='CREATE', tabela='vendas', registro_id=venda_id, descricao='...'

7. ADMIN VÊ HISTÓRICO
   SELECT * FROM logs WHERE data_log >= DATE_SUB(NOW(), INTERVAL 7 DAY)
```

---

## Índices Recomendados (Performance)

```sql
CREATE INDEX idx_clientes_criado_por ON clientes(criado_por);
CREATE INDEX idx_produtos_criado_por ON produtos(criado_por);
CREATE INDEX idx_vendas_cliente ON vendas(cliente_id);
CREATE INDEX idx_vendas_usuario ON vendas(usuario_id);
CREATE INDEX idx_itens_venda_venda ON itens_venda(venda_id);
CREATE INDEX idx_itens_venda_produto ON itens_venda(produto_id);
CREATE INDEX idx_logs_usuario ON logs(usuario_id);
CREATE INDEX idx_logs_data ON logs(data_log);
```

---

## Dados de Exemplo

### Usuário
```json
{
  "id": 1,
  "nome": "João Admin",
  "email": "admin@tokclean.com",
  "nivel": "admin",
  "ativo": 1
}
```

### Cliente
```json
{
  "id": 1,
  "nome": "Empresa XYZ",
  "email": "contato@xyz.com",
  "telefone": "11987654321",
  "criado_por": 1,
  "data_cadastro": "2024-04-13"
}
```

### Produto
```json
{
  "id": 1,
  "nome": "Limpeza Comercial",
  "descricao": "Limpeza completa com desinfecção",
  "preco": 150.00,
  "quantidade_estoque": 10,
  "criado_por": 1
}
```

### Venda
```json
{
  "id": 1,
  "cliente_id": 1,
  "usuario_id": 1,
  "data_venda": "2024-04-13T10:30:00",
  "valor_total": 300.00
}
```

### Item de Venda
```json
{
  "id": 1,
  "venda_id": 1,
  "produto_id": 1,
  "quantidade": 2,
  "preco_unitario": 150.00,
  "subtotal": 300.00
}
```

---

**Este diagrama é a base de toda a lógica do sistema Tok Clean!** 📊
