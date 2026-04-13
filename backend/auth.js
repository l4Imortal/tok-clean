const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('./database');

const SECRET_KEY = 'tokclean-secret-key-2024';

// Middleware para verificar JWT
const verificarToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ erro: 'Token inválido' });
    }
    req.usuario = decoded;
    next();
  });
};

// Middleware para verificar se é admin
const verificarAdmin = (req, res, next) => {
  if (req.usuario.nivel !== 'admin') {
    return res.status(403).json({ erro: 'Acesso negado. Apenas para admins.' });
  }
  next();
};

// Função para fazer login
const fazerLogin = (email, senha, callback) => {
  db.get('SELECT * FROM usuarios WHERE email = ?', [email], async (err, usuario) => {
    if (err) return callback({ erro: 'Erro no banco de dados' });
    if (!usuario) return callback({ erro: 'Usuário não encontrado' });

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) return callback({ erro: 'Senha incorreta' });

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, nivel: usuario.nivel },
      SECRET_KEY,
      { expiresIn: '24h' }
    );

    callback(null, { token, usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, nivel: usuario.nivel } });
  });
};

// Função para registrar novo usuário (admin only)
const registrarUsuario = (nome, email, senha, nivel, callback) => {
  bcrypt.hash(senha, 10, (err, hash) => {
    if (err) return callback({ erro: 'Erro ao criptografar senha' });

    db.run(
      'INSERT INTO usuarios (nome, email, senha, nivel) VALUES (?, ?, ?, ?)',
      [nome, email, hash, nivel],
      function(err) {
        if (err) return callback({ erro: 'Email já cadastrado' });
        callback(null, { mensagem: 'Usuário criado com sucesso' });
      }
    );
  });
};

// Função para registrar ação (log)
const registrarLog = (usuarioId, acao, tabela, registroId, descricao, callback) => {
  db.run(
    'INSERT INTO logs (usuario_id, acao, tabela, registro_id, descricao) VALUES (?, ?, ?, ?, ?)',
    [usuarioId, acao, tabela, registroId, descricao],
    callback
  );
};

module.exports = {
  verificarToken,
  verificarAdmin,
  fazerLogin,
  registrarUsuario,
  registrarLog,
  SECRET_KEY
};
