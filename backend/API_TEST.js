/*
    SERVIDOR DEVE ESTAR RODANDO EM http://localhost:3000
    Execute isto no console do navegador (F12) para testar as APIs:
*/

// ===== TESTE DE AUTENTICAÇÃO =====

// 1. Fazer login e obter token
fetch('http://localhost:3000/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    email: 'admin@tokclean.com', 
    senha: 'admin123' 
  })
})
.then(r => r.json())
.then(data => {
  console.log('✅ Login sucesso!', data);
  localStorage.setItem('token', data.token);
});

// 2. Obter lista de clientes (após login)
const token = localStorage.getItem('token');
fetch('http://localhost:3000/api/clientes', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(data => console.log('👥 Clientes:', data));

// 3. Criar novo cliente
fetch('http://localhost:3000/api/clientes', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` 
  },
  body: JSON.stringify({
    nome: 'Exemplo Empresa LTDA',
    email: 'empresa@example.com',
    telefone: '11999999999'
  })
})
.then(r => r.json())
.then(data => console.log('✅ Cliente criado:', data));

// 4. Criar produto
fetch('http://localhost:3000/api/produtos', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` 
  },
  body: JSON.stringify({
    nome: 'Serviço de Limpeza Premium',
    descricao: 'Limpeza completa com desinfecção',
    preco: 150.00,
    quantidade_estoque: 20
  })
})
.then(r => r.json())
.then(data => console.log('✅ Produto criado:', data));

// 5. Ver Dashboard
fetch('http://localhost:3000/api/dashboard', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(data => console.log('📊 Dashboard:', data));

// 6. Listar vendas
fetch('http://localhost:3000/api/vendas', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(data => console.log('💼 Vendas:', data));

// 7. Relatório de produtos mais vendidos
fetch('http://localhost:3000/api/relatorio/produtos-vendidos', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(data => console.log('📈 Produtos Vendidos:', data));

// 8. Histórico/Logs (admin only)
fetch('http://localhost:3000/api/logs', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(data => console.log('📋 Logs:', data));
