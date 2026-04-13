const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, 'tokclean.db');
const db = new sqlite3.Database(dbPath);

// Criar tabelas se não existirem
db.serialize(() => {
  // Tabela de usuários (funcionários)
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL,
      nivel TEXT DEFAULT 'funcionario',
      ativo INTEGER DEFAULT 1,
      data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabela de clientes
  db.run(`
    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT UNIQUE,
      telefone TEXT,
      data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
      criado_por INTEGER,
      FOREIGN KEY(criado_por) REFERENCES usuarios(id)
    )
  `);

  // Tabela de produtos/serviços
  db.run(`
    CREATE TABLE IF NOT EXISTS produtos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      descricao TEXT,
      preco REAL NOT NULL,
      quantidade_estoque INTEGER DEFAULT 0,
      data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
      criado_por INTEGER,
      FOREIGN KEY(criado_por) REFERENCES usuarios(id)
    )
  `);

  // Tabela de vendas/pedidos
  db.run(`
    CREATE TABLE IF NOT EXISTS vendas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER NOT NULL,
      usuario_id INTEGER NOT NULL,
      data_venda DATETIME DEFAULT CURRENT_TIMESTAMP,
      valor_total REAL,
      FOREIGN KEY(cliente_id) REFERENCES clientes(id),
      FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
    )
  `);

  // Tabela de itens de venda
  db.run(`
    CREATE TABLE IF NOT EXISTS itens_venda (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      venda_id INTEGER NOT NULL,
      produto_id INTEGER NOT NULL,
      quantidade INTEGER NOT NULL,
      preco_unitario REAL,
      subtotal REAL,
      FOREIGN KEY(venda_id) REFERENCES vendas(id),
      FOREIGN KEY(produto_id) REFERENCES produtos(id)
    )
  `);

  // Tabela de histórico/logs
  db.run(`
    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      acao TEXT NOT NULL,
      tabela TEXT,
      registro_id INTEGER,
      descricao TEXT,
      data_log DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
    )
  `);

  // Verificar se há usuário admin padrão, senão criar
  db.get('SELECT * FROM usuarios WHERE nivel = "admin"', async (err, row) => {
    if (!row) {
      const senhaHash = await bcrypt.hash('admin123', 10);
      db.run(
        'INSERT INTO usuarios (nome, email, senha, nivel) VALUES (?, ?, ?, ?)',
        ['Administrador', 'admin@tokclean.com', senhaHash, 'admin']
      );
    }
  });
});

module.exports = db;
