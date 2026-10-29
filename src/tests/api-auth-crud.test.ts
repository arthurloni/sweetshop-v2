import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import http from 'node:http';
import { createApp } from '../../server';
import {
  deleteAdminByUsername,
  ensureAdminAccount,
  listAppliedMigrations,
  listFeedbacks,
  listProducts,
} from '../db/postgres';
import { createPatisserieSvgDataUri } from '../utils/imageCanvas';

async function runTests() {
  console.log('=== Iniciando Testes de Migração, Banco PostgreSQL, Autenticação e CRUD ===');

  // 1. Verificar migrações versionadas e preservação dos dados existentes
  const migrations = await listAppliedMigrations();
  assert.ok(
    migrations.includes('001_initial_schema'),
    'Migração 001_initial_schema deve estar registrada'
  );
  assert.ok(
    migrations.includes('002_create_admins_table'),
    'Migração 002_create_admins_table deve estar registrada'
  );
  console.log('✔ Migrações versionadas verificadas:', migrations.join(', '));

  const initialProducts = await listProducts();
  const initialFeedbacks = await listFeedbacks();
  assert.ok(
    initialProducts.length >= 1,
    `Esperado pelo menos 1 produto preservado no banco, encontrado: ${initialProducts.length}`
  );
  assert.ok(
    initialFeedbacks.length >= 1,
    `Esperado pelo menos 1 avaliação preservada no banco, encontrado: ${initialFeedbacks.length}`
  );
  console.log(
    `✔ Preservação de dados confirmada: ${initialProducts.length} produtos e ${initialFeedbacks.length} avaliações.`
  );

  // Gerar credenciais efêmeras aleatórias apenas para a execução do teste (sem credenciais fixas no código)
  const ephemeralAdminUser = `test_admin_${crypto.randomBytes(6).toString('hex')}`;
  const ephemeralAdminPass = crypto.randomBytes(18).toString('base64url');
  await ensureAdminAccount(ephemeralAdminUser, ephemeralAdminPass);

  const app = createApp();
  const server = http.createServer(app);

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Não foi possível obter porta de teste.');
  }
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    // 2. Testar endpoints públicos (GET /api/products e GET /api/feedbacks)
    const getProdsRes = await fetch(`${baseUrl}/api/products`);
    assert.equal(getProdsRes.status, 200);
    const prodsJson = await getProdsRes.json();
    assert.equal(prodsJson.length, initialProducts.length);
    console.log('✔ GET /api/products público funcionando.');

    // 3. Testar bloqueio de visitante não autenticado nas rotas administrativas (401)
    const unauthPostProd = await fetch(`${baseUrl}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Produto Invasor',
        price: 10,
        imageUrl: 'data:image/svg+xml;utf8,<svg></svg>',
      }),
    });
    assert.equal(
      unauthPostProd.status,
      401,
      'Visitante não autenticado DEVE receber 401 ao tentar criar produto'
    );

    const firstProdId = initialProducts[0].id;
    const unauthPutProd = await fetch(`${baseUrl}/api/products/${firstProdId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(initialProducts[0]),
    });
    assert.equal(
      unauthPutProd.status,
      401,
      'Visitante não autenticado DEVE receber 401 ao tentar editar produto'
    );

    const unauthDelProd = await fetch(`${baseUrl}/api/products/${firstProdId}`, {
      method: 'DELETE',
    });
    assert.equal(
      unauthDelProd.status,
      401,
      'Visitante não autenticado DEVE receber 401 ao tentar excluir produto'
    );

    const firstFbId = initialFeedbacks[0].id;
    const unauthPutFb = await fetch(`${baseUrl}/api/feedbacks/${firstFbId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorName: 'Teste', rating: 5, comment: 'Alterado' }),
    });
    assert.equal(
      unauthPutFb.status,
      401,
      'Visitante não autenticado DEVE receber 401 ao tentar moderar/editar avaliação'
    );

    const unauthDelFb = await fetch(`${baseUrl}/api/feedbacks/${firstFbId}`, {
      method: 'DELETE',
    });
    assert.equal(
      unauthDelFb.status,
      401,
      'Visitante não autenticado DEVE receber 401 ao tentar excluir avaliação'
    );
    console.log(
      '✔ Bloqueio de segurança (401 Unauthorized) validado em todas as rotas administrativas.'
    );

    // 4. Testar tentativa de login com senha incorreta (401) e senha correta (200)
    const badLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: ephemeralAdminUser, password: 'wrong_password' }),
    });
    assert.equal(badLoginRes.status, 401);

    const goodLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: ephemeralAdminUser, password: ephemeralAdminPass }),
    });
    assert.equal(goodLoginRes.status, 200);
    const loginData = await goodLoginRes.json();
    assert.ok(loginData.token, 'Token de sessão deve ser retornado no login');
    assert.equal(loginData.admin.username, ephemeralAdminUser);

    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${loginData.token}`,
    };

    const meRes = await fetch(`${baseUrl}/api/auth/me`, { headers: authHeaders });
    assert.equal(meRes.status, 200);
    const meData = await meRes.json();
    assert.equal(meData.authenticated, true);
    console.log('✔ Autenticação de administrador e validação de sessão (/api/auth/me) aprovadas.');

    // 5. Testar CRUD completo de Produto com Administrador Autenticado
    const sampleSvg = createPatisserieSvgDataUri('Tartelete de Teste', 'Doces', 'strawberry');
    const createProdRes = await fetch(`${baseUrl}/api/products`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: 'Tartelete de Teste',
        price: 14.5,
        imageUrl: sampleSvg,
        category: 'Doces',
        imageSize: '500x500',
        description: 'Item temporário para teste automatizado.',
        manufacturedDate: '2026-10-28',
        redirectUrl: '',
      }),
    });
    assert.equal(createProdRes.status, 201);
    const createdProduct = await createProdRes.json();
    assert.equal(createdProduct.name, 'Tartelete de Teste');

    const updateProdRes = await fetch(`${baseUrl}/api/products/${createdProduct.id}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        name: 'Tartelete de Morango Atualizada',
        price: 16.0,
        imageUrl: sampleSvg,
        category: 'Doces',
        imageSize: '800x800',
        description: 'Descrição atualizada no teste.',
        manufacturedDate: '2026-10-28',
        redirectUrl: '',
      }),
    });
    assert.equal(updateProdRes.status, 200);
    const updatedProduct = await updateProdRes.json();
    assert.equal(updatedProduct.name, 'Tartelete de Morango Atualizada');
    assert.equal(updatedProduct.price, 16);

    const deleteProdRes = await fetch(`${baseUrl}/api/products/${createdProduct.id}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    assert.equal(deleteProdRes.status, 200);
    console.log('✔ Operações CRUD de Produtos por administrador autenticado aprovadas.');

    // 6. Testar envio público de Avaliação + Moderação Administrativa (PUT/DELETE)
    const createFbRes = await fetch(`${baseUrl}/api/feedbacks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        authorName: 'Cliente Teste',
        rating: 5,
        comment: 'Avaliação temporária de teste.',
      }),
    });
    assert.equal(createFbRes.status, 201);
    const createdFb = await createFbRes.json();

    const updateFbRes = await fetch(`${baseUrl}/api/feedbacks/${createdFb.id}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        authorName: 'Cliente Teste Moderado',
        rating: 4,
        comment: 'Avaliação moderada pela administração.',
      }),
    });
    assert.equal(updateFbRes.status, 200);

    const deleteFbRes = await fetch(`${baseUrl}/api/feedbacks/${createdFb.id}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    assert.equal(deleteFbRes.status, 200);
    console.log('✔ Publicação pública e moderação administrativa de avaliações aprovadas.');

    // 7. Testar roteamento SPA Angular (/, /cardapio) e assets oficiais (Logo e Cardápios 01, 02, 03)
    const homeRes = await fetch(`${baseUrl}/`);
    assert.equal(homeRes.status, 200);
    const homeHtml = await homeRes.text();
    assert.ok(homeHtml.includes('<app-root>'), 'Rota / deve servir o bundle Angular (<app-root>)');

    const menuRouteRes = await fetch(`${baseUrl}/cardapio`);
    assert.equal(menuRouteRes.status, 200);
    const menuHtml = await menuRouteRes.text();
    assert.ok(menuHtml.includes('<app-root>'), 'Rota /cardapio deve servir o bundle Angular (<app-root>)');

    for (const assetPath of [
      '/assets/LOGO_465ec8e3.jpeg',
      '/assets/CARDAPIO01_1efd2637.jpeg',
      '/assets/CARDAPIO02_e94365ca.jpeg',
      '/assets/CARDAPIO03_9fa23d90.jpeg',
    ]) {
      const assetRes = await fetch(`${baseUrl}${assetPath}`);
      assert.equal(assetRes.status, 200, `Asset ${assetPath} deve retornar 200 OK`);
    }
    console.log('✔ Rotas SPA (/ e /cardapio) e assets oficiais validados.');

    // Confirmar que a quantidade final de registros permanece idêntica à inicial
    const finalProducts = await listProducts();
    const finalFeedbacks = await listFeedbacks();
    assert.equal(finalProducts.length, initialProducts.length);
    assert.equal(finalFeedbacks.length, initialFeedbacks.length);
    console.log('=== TODOS OS TESTES PASSARAM COM SUCESSO! ===');
  } finally {
    await deleteAdminByUsername(ephemeralAdminUser);
    server.close();
  }
}

runTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('FALHA NOS TESTES:', err);
    process.exit(1);
  });
