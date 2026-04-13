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
  db.all('SELECT id, nome, email, nivel, ativo, data_cadastro FROM usuarios', [], (err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(rows);
  });
});

router.put('/usuarios/:id', verificarToken, verificarAdmin, (req, res) => {
  const { nome, email, senha, nivel } = req.body;
  const userId = req.params.id;

  if (!nome) {
    return res.status(400).json({ erro: 'Nome é obrigatório' });
  }

  if (senha) {
    const senhaHash = bcrypt.hashSync(senha, 10);
    db.run(
      'UPDATE usuarios SET nome = ?, email = ?, nivel = ?, senha = ? WHERE id = ?',
      [nome, email, nivel, senhaHash, userId],
      (err) => {
        if (err) return res.status(400).json({ erro: err.message });
        registrarLog(req.usuario.id, 'UPDATE', 'usuarios', userId, `Usuário: ${nome}`);
        res.json({ mensagem: 'Usuário atualizado' });
      }
    );
  } else {
    db.run(
      'UPDATE usuarios SET nome = ?, email = ?, nivel = ? WHERE id = ?',
      [nome, email, nivel, userId],
      (err) => {
        if (err) return res.status(400).json({ erro: err.message });
        registrarLog(req.usuario.id, 'UPDATE', 'usuarios', userId, `Usuário: ${nome}`);
        res.json({ mensagem: 'Usuário atualizado' });
      }
    );
  }
});

router.delete('/usuarios/:id', verificarToken, verificarAdmin, (req, res) => {
  const userId = req.params.id;
  
  if (userId == req.usuario.id) {
    return res.status(403).json({ erro: 'Você não pode deletar sua própria conta!' });
  }

  db.run('DELETE FROM usuarios WHERE id = ?', [userId], (err) => {
    if (err) return res.status(500).json({ erro: err.message });
    registrarLog(req.usuario.id, 'DELETE', 'usuarios', userId, 'Usuário deletado');
    res.json({ mensagem: 'Usuário deletado' });
  });
});

// ===== CLIENTES =====
router.get('/clientes', verificarToken, (req, res) => {
  db.all('SELECT * FROM clientes ORDER BY data_cadastro DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(rows);
  });
});

router.post('/clientes', verificarToken, (req, res) => {
  const { nome, email, telefone } = req.body;
  db.run(
    'INSERT INTO clientes (nome, email, telefone, criado_por) VALUES (?, ?, ?, ?)',
    [nome, email, telefone, req.usuario.id],
    function(err) {
      if (err) return res.status(400).json({ erro: 'Email já cadastrado' });
      registrarLog(req.usuario.id, 'CREATE', 'clientes', this.lastID, `Cliente: ${nome}`);
      res.json({ id: this.lastID, mensagem: 'Cliente cadastrado' });
    }
  );
});

router.put('/clientes/:id', verificarToken, (req, res) => {
  const { nome, email, telefone } = req.body;
  db.run(
    'UPDATE clientes SET nome = ?, email = ?, telefone = ? WHERE id = ?',
    [nome, email, telefone, req.params.id],
    (err) => {
      if (err) return res.status(400).json({ erro: 'Email já cadastrado' });
      registrarLog(req.usuario.id, 'UPDATE', 'clientes', req.params.id, `Cliente: ${nome}`);
      res.json({ mensagem: 'Cliente atualizado' });
    }
  );
});

router.delete('/clientes/:id', verificarToken, verificarAdmin, (req, res) => {
  db.run('DELETE FROM clientes WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ erro: err.message });
    registrarLog(req.usuario.id, 'DELETE', 'clientes', req.params.id, 'Cliente deletado');
    res.json({ mensagem: 'Cliente deletado' });
  });
});

router.get('/clientes/buscar/:termo', verificarToken, (req, res) => {
  const termo = `%${req.params.termo}%`;
  db.all(
    'SELECT * FROM clientes WHERE nome LIKE ? OR email LIKE ? OR telefone LIKE ? ORDER BY nome',
    [termo, termo, termo],
    (err, rows) => {
      if (err) return res.status(500).json({ erro: err.message });
      res.json(rows);
    }
  );
});

// ===== PRODUTOS =====
router.get('/produtos', verificarToken, (req, res) => {
  db.all('SELECT * FROM produtos ORDER BY nome', [], (err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(rows);
  });
});

router.post('/produtos', verificarToken, (req, res) => {
  const { nome, descricao, preco, quantidade_estoque } = req.body;
  db.run(
    'INSERT INTO produtos (nome, descricao, preco, quantidade_estoque, criado_por) VALUES (?, ?, ?, ?, ?)',
    [nome, descricao, preco, quantidade_estoque, req.usuario.id],
    function(err) {
      if (err) return res.status(400).json({ erro: err.message });
      registrarLog(req.usuario.id, 'CREATE', 'produtos', this.lastID, `Produto: ${nome}`);
      res.json({ id: this.lastID, mensagem: 'Produto cadastrado' });
    }
  );
});

router.put('/produtos/:id', verificarToken, (req, res) => {
  const { nome, descricao, preco, quantidade_estoque } = req.body;
  db.run(
    'UPDATE produtos SET nome = ?, descricao = ?, preco = ?, quantidade_estoque = ? WHERE id = ?',
    [nome, descricao, preco, quantidade_estoque, req.params.id],
    (err) => {
      if (err) return res.status(400).json({ erro: err.message });
      registrarLog(req.usuario.id, 'UPDATE', 'produtos', req.params.id, `Produto: ${nome}`);
      res.json({ mensagem: 'Produto atualizado' });
    }
  );
});

router.delete('/produtos/:id', verificarToken, verificarAdmin, (req, res) => {
  db.run('DELETE FROM produtos WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ erro: err.message });
    registrarLog(req.usuario.id, 'DELETE', 'produtos', req.params.id, 'Produto deletado');
    res.json({ mensagem: 'Produto deletado' });
  });
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
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(rows);
  });
});

router.get('/vendas/itens/:vendaId', verificarToken, (req, res) => {
  const sql = `
    SELECT iv.*, p.nome as produto_nome
    FROM itens_venda iv
    JOIN produtos p ON iv.produto_id = p.id
    WHERE iv.venda_id = ?
  `;
  db.all(sql, [req.params.vendaId], (err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(rows);
  });
});

router.post('/vendas', verificarToken, (req, res) => {
  const { cliente_id, itens } = req.body;
  
  let valor_total = 0;
  itens.forEach(item => {
    valor_total += item.subtotal;
  });

  db.run(
    'INSERT INTO vendas (cliente_id, usuario_id, valor_total) VALUES (?, ?, ?)',
    [cliente_id, req.usuario.id, valor_total],
    function(err) {
      if (err) return res.status(400).json({ erro: err.message });
      
      const ventaId = this.lastID;
      let processados = 0;

      // Inserir itens
      itens.forEach(item => {
        db.run(
          'INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unitario, subtotal) VALUES (?, ?, ?, ?, ?)',
          [ventaId, item.produto_id, item.quantidade, item.preco_unitario, item.subtotal],
          (err) => {
            if (!err) {
              // Atualizar estoque
              db.run(
                'UPDATE produtos SET quantidade_estoque = quantidade_estoque - ? WHERE id = ?',
                [item.quantidade, item.produto_id]
              );
            }
            processados++;
            if (processados === itens.length) {
              registrarLog(req.usuario.id, 'CREATE', 'vendas', ventaId, `Venda: R$ ${valor_total.toFixed(2)}`);
              res.json({ id: ventaId, mensagem: 'Venda registrada' });
            }
          }
        );
      });
    }
  );
});

// ===== DASHBOARD =====
router.get('/dashboard', verificarToken, (req, res) => {
  const today = new Date();
  const mesAtual = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0');

  Promise.all([
    new Promise((resolve) => {
      db.get('SELECT COUNT(*) as total FROM clientes', [], (err, row) => {
        resolve(row?.total || 0);
      });
    }),
    new Promise((resolve) => {
      db.get('SELECT COUNT(*) as total FROM produtos', [], (err, row) => {
        resolve(row?.total || 0);
      });
    }),
    new Promise((resolve) => {
      db.get('SELECT COUNT(*) as total FROM vendas', [], (err, row) => {
        resolve(row?.total || 0);
      });
    }),
    new Promise((resolve) => {
      db.get(
        'SELECT SUM(valor_total) as total FROM vendas WHERE strftime("%Y-%m", data_venda) = ?',
        [mesAtual],
        (err, row) => {
          resolve(row?.total || 0);
        }
      );
    })
  ]).then(([clientes, produtos, vendas, faturamento]) => {
    res.json({ 
      total_clientes: clientes,
      total_produtos: produtos,
      total_vendas: vendas,
      faturamento_mes: faturamento
    });
  });
});

// ===== RELATÓRIOS =====
router.get('/relatorio/vendas-por-data', verificarToken, (req, res) => {
  const sql = `
    SELECT DATE(data_venda) as data, COUNT(*) as quantidade, SUM(valor_total) as total
    FROM vendas
    GROUP BY DATE(data_venda)
    ORDER BY data DESC
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(rows);
  });
});

router.get('/relatorio/produtos-vendidos', verificarToken, (req, res) => {
  const sql = `
    SELECT p.nome, SUM(iv.quantidade) as quantidade_vendida, SUM(iv.subtotal) as total
    FROM itens_venda iv
    JOIN produtos p ON iv.produto_id = p.id
    GROUP BY p.id
    ORDER BY quantidade_vendida DESC
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(rows);
  });
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
