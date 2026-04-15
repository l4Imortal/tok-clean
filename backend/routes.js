const express = require('express');
const router = express.Router();
const db = require('./database');
const bcrypt = require('bcrypt');
const { verificarToken, verificarAdmin, fazerLogin, registrarUsuario, registrarLog } = require('./auth');

// ===== AUTENTICAÇÃO =====
router.post('/login', (req, res) => {
  const { email, senha } = req.body;
  fazerLogin(email, senha, (err, result) => {
    if (err) return res.status(400).json(err);
    res.json(result);
  });
});

router.post('/registrar', verificarToken, verificarAdmin, (req, res) => {
  const { nome, email, senha, nivel } = req.body;
  registrarUsuario(nome, email, senha, nivel, (err) => {
    if (err) return res.status(400).json(err);
    registrarLog(req.usuario.id, 'CREATE', 'usuarios', null, `Novo usuário: ${nome}`);
    res.json({ mensagem: 'Usuário criado com sucesso' });
  });
});

router.get('/usuarios', verificarToken, verificarAdmin, (req, res) => {
  try {
    const stmt = db.prepare('SELECT id, nome, email, nivel, ativo, data_cadastro FROM usuarios');
    const rows = stmt.all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

router.put('/usuarios/:id', verificarToken, verificarAdmin, (req, res) => {
  const { nome, email, senha, nivel } = req.body;
  const userId = req.params.id;

  if (!nome) {
    return res.status(400).json({ erro: 'Nome é obrigatório' });
  }

  try {
    if (senha) {
      const senhaHash = bcrypt.hashSync(senha, 10);
      const stmt = db.prepare('UPDATE usuarios SET nome = ?, email = ?, nivel = ?, senha = ? WHERE id = ?');
      stmt.run(nome, email, nivel, senhaHash, userId);
    } else {
      const stmt = db.prepare('UPDATE usuarios SET nome = ?, email = ?, nivel = ? WHERE id = ?');
      stmt.run(nome, email, nivel, userId);
    }
    registrarLog(req.usuario.id, 'UPDATE', 'usuarios', userId, `Usuário: ${nome}`);
    res.json({ mensagem: 'Usuário atualizado' });
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
});

router.delete('/usuarios/:id', verificarToken, verificarAdmin, (req, res) => {
  const userId = req.params.id;
  
  if (userId == req.usuario.id) {
    return res.status(403).json({ erro: 'Você não pode deletar sua própria conta!' });
  }

  try {
    const stmt = db.prepare('DELETE FROM usuarios WHERE id = ?');
    stmt.run(userId);
    registrarLog(req.usuario.id, 'DELETE', 'usuarios', userId, 'Usuário deletado');
    res.json({ mensagem: 'Usuário deletado' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ===== CLIENTES =====
router.get('/clientes', verificarToken, (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM clientes ORDER BY data_cadastro DESC');
    const rows = stmt.all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

router.post('/clientes', verificarToken, (req, res) => {
  const { nome, email, telefone } = req.body;
  try {
    const stmt = db.prepare('INSERT INTO clientes (nome, email, telefone, criado_por) VALUES (?, ?, ?, ?)');
    const result = stmt.run(nome, email, telefone, req.usuario.id);
    registrarLog(req.usuario.id, 'CREATE', 'clientes', result.lastInsertRowid, `Cliente: ${nome}`);
    res.json({ id: result.lastInsertRowid, mensagem: 'Cliente cadastrado' });
  } catch (err) {
    res.status(400).json({ erro: 'Email já cadastrado' });
  }
});

router.put('/clientes/:id', verificarToken, (req, res) => {
  const { nome, email, telefone } = req.body;
  try {
    const stmt = db.prepare('UPDATE clientes SET nome = ?, email = ?, telefone = ? WHERE id = ?');
    stmt.run(nome, email, telefone, req.params.id);
    registrarLog(req.usuario.id, 'UPDATE', 'clientes', req.params.id, `Cliente: ${nome}`);
    res.json({ mensagem: 'Cliente atualizado' });
  } catch (err) {
    res.status(400).json({ erro: 'Email já cadastrado' });
  }
});

router.delete('/clientes/:id', verificarToken, verificarAdmin, (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM clientes WHERE id = ?');
    stmt.run(req.params.id);
    registrarLog(req.usuario.id, 'DELETE', 'clientes', req.params.id, 'Cliente deletado');
    res.json({ mensagem: 'Cliente deletado' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

router.get('/clientes/buscar/:termo', verificarToken, (req, res) => {
  const termo = `%${req.params.termo}%`;
  try {
    const stmt = db.prepare('SELECT * FROM clientes WHERE nome LIKE ? OR email LIKE ? OR telefone LIKE ? ORDER BY nome');
    const rows = stmt.all(termo, termo, termo);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ===== PRODUTOS =====
router.get('/produtos', verificarToken, (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM produtos ORDER BY nome');
    const rows = stmt.all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

router.post('/produtos', verificarToken, (req, res) => {
  const { nome, descricao, preco, quantidade_estoque } = req.body;
  try {
    const stmt = db.prepare('INSERT INTO produtos (nome, descricao, preco, quantidade_estoque, criado_por) VALUES (?, ?, ?, ?, ?)');
    const result = stmt.run(nome, descricao, preco, quantidade_estoque, req.usuario.id);
    registrarLog(req.usuario.id, 'CREATE', 'produtos', result.lastInsertRowid, `Produto: ${nome}`);
    res.json({ id: result.lastInsertRowid, mensagem: 'Produto cadastrado' });
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
});

router.put('/produtos/:id', verificarToken, (req, res) => {
  const { nome, descricao, preco, quantidade_estoque } = req.body;
  try {
    const stmt = db.prepare('UPDATE produtos SET nome = ?, descricao = ?, preco = ?, quantidade_estoque = ? WHERE id = ?');
    stmt.run(nome, descricao, preco, quantidade_estoque, req.params.id);
    registrarLog(req.usuario.id, 'UPDATE', 'produtos', req.params.id, `Produto: ${nome}`);
    res.json({ mensagem: 'Produto atualizado' });
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
});

router.delete('/produtos/:id', verificarToken, verificarAdmin, (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM produtos WHERE id = ?');
    stmt.run(req.params.id);
    registrarLog(req.usuario.id, 'DELETE', 'produtos', req.params.id, 'Produto deletado');
    res.json({ mensagem: 'Produto deletado' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ===== VENDAS =====
router.get('/vendas', verificarToken, (req, res) => {
  const sql = `
    SELECT v.*, c.nome as cliente_nome, u.nome as usuario_nome
    FROM vendas v
    JOIN clientes c ON v.cliente_id = c.id
    JOIN usuarios u ON v.usuario_id = u.id
    ORDER BY v.data_venda DESC
  `;
  try {
    const stmt = db.prepare(sql);
    const rows = stmt.all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

router.get('/vendas/itens/:vendaId', verificarToken, (req, res) => {
  const sql = `
    SELECT iv.*, p.nome as produto_nome
    FROM itens_venda iv
    JOIN produtos p ON iv.produto_id = p.id
    WHERE iv.venda_id = ?
  `;
  try {
    const stmt = db.prepare(sql);
    const rows = stmt.all(req.params.vendaId);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

router.post('/vendas', verificarToken, (req, res) => {
  const { cliente_id, itens } = req.body;
  
  let valor_total = 0;
  itens.forEach(item => {
    valor_total += item.subtotal;
  });

  try {
    const stmt = db.prepare('INSERT INTO vendas (cliente_id, usuario_id, valor_total) VALUES (?, ?, ?)');
    const result = stmt.run(cliente_id, req.usuario.id, valor_total);
    const ventaId = result.lastInsertRowid;

    // Inserir itens
    const itemStmt = db.prepare('INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unitario, subtotal) VALUES (?, ?, ?, ?, ?)');
    const estoqueStmt = db.prepare('UPDATE produtos SET quantidade_estoque = quantidade_estoque - ? WHERE id = ?');

    itens.forEach(item => {
      itemStmt.run(ventaId, item.produto_id, item.quantidade, item.preco_unitario, item.subtotal);
      estoqueStmt.run(item.quantidade, item.produto_id);
    });

    registrarLog(req.usuario.id, 'CREATE', 'vendas', ventaId, `Venda: R$ ${valor_total.toFixed(2)}`);
    res.json({ id: ventaId, mensagem: 'Venda registrada' });
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
});

// ===== DASHBOARD =====
router.get('/dashboard', verificarToken, (req, res) => {
  const today = new Date();
  const mesAtual = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0');

  try {
    const clientesStmt = db.prepare('SELECT COUNT(*) as total FROM clientes');
    const clientes = clientesStmt.get().total;

    const produtosStmt = db.prepare('SELECT COUNT(*) as total FROM produtos');
    const produtos = produtosStmt.get().total;

    const vendasStmt = db.prepare('SELECT COUNT(*) as total FROM vendas');
    const vendas = vendasStmt.get().total;

    const faturamentoStmt = db.prepare("SELECT SUM(valor_total) as total FROM vendas WHERE strftime('%Y-%m', data_venda) = ?");
    const faturamento = faturamentoStmt.get(mesAtual).total || 0;

    res.json({ 
      total_clientes: clientes,
      total_produtos: produtos,
      total_vendas: vendas,
      faturamento_mes: faturamento
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ===== RELATÓRIOS =====
router.get('/relatorio/vendas-por-data', verificarToken, (req, res) => {
  const sql = `
    SELECT DATE(data_venda) as data, COUNT(*) as quantidade, SUM(valor_total) as total
    FROM vendas
    GROUP BY DATE(data_venda)
    ORDER BY data DESC
  `;
  try {
    const stmt = db.prepare(sql);
    const rows = stmt.all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

router.get('/relatorio/produtos-vendidos', verificarToken, (req, res) => {
  const sql = `
    SELECT p.nome, SUM(iv.quantidade) as quantidade_vendida, SUM(iv.quantidade * iv.preco_unitario) as total
    FROM itens_venda iv
    JOIN produtos p ON iv.produto_id = p.id
    GROUP BY p.id
    ORDER BY quantidade_vendida DESC
  `;
  try {
    const stmt = db.prepare(sql);
    const rows = stmt.all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});
// ===== HISTÓRICO/LOGS =====
router.get('/logs', verificarToken, verificarAdmin, (req, res) => {
  const sql = `
    SELECT l.*, u.nome as usuario_nome
    FROM logs l
    JOIN usuarios u ON l.usuario_id = u.id
    ORDER BY l.data_log DESC
    LIMIT 100
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(rows);
  });
});

module.exports = router;
