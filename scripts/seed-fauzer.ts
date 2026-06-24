import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Carrega as variáveis de ambiente
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY ausente em .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function main() {
  console.log("🚀 Iniciando Seed de Teste para o usuário Fauzer Cruz...");

  // 1. Procurar o perfil do Fauzer Cruz
  const { data: profiles, error: profileErr } = await supabase
    .from('profiles')
    .select('id, full_name, user_id')
    .ilike('full_name', '%Fauzer Cruz%')
    .limit(1);

  if (profileErr) {
    console.error("Erro ao buscar perfil:", profileErr.message);
    return;
  }

  if (!profiles || profiles.length === 0) {
    console.error("❌ Nenhum perfil encontrado contendo 'Fauzer Cruz'. Por favor, certifique-se de que ele já fez login ou seu nome está correto.");
    return;
  }

  const fauzerId = profiles[0].id;
  const authUserId = profiles[0].user_id || profiles[0].id; // Fallback se id == user_id
  console.log(`✅ Perfil encontrado: ${profiles[0].full_name} (ID: ${fauzerId})`);

  // 2. Criar Catálogo de Testes
  console.log("📦 Criando Catálogo de Testes UI...");
  const { data: catalog, error: catalogErr } = await supabase
    .from('catalogs')
    .insert({
      owner_id: fauzerId,
      name: 'Catálogo UI de Testes',
      description: 'Catálogo gerado automaticamente para testes do novo Layout de Modais, Carrossel e Trava de Iframe.'
    })
    .select()
    .single();

  if (catalogErr || !catalog) {
    console.error("Erro ao criar catálogo:", catalogErr?.message);
    return;
  }
  console.log(`✅ Catálogo criado: ${catalog.name} (${catalog.id})`);

  // 3. Criar Categoria de Testes
  const { data: category, error: catErr } = await supabase
    .from('categories')
    .insert({ catalog_id: catalog.id, name: '🛑 TESTES UI (Pode Apagar)', description: 'Categoria de testes gerada automaticamente.', sort_order: 999 })
    .select()
    .single();

  if (catErr || !category) {
    console.error("Erro ao criar categoria de testes:", catErr?.message);
    return;
  }
  
  const catVarejo = category.id;
  const catAtacado = category.id;
  const catEspeciais = category.id;

  // 5. Criar Produtos com diversidade para testar TUDO
  const productsToInsert = [
    // --- Varejo (Testando Modal, Highlight, e Preços simples) ---
    {
      category_id: catVarejo,
      name: 'Camiseta Básica de Algodão',
      description: 'Camiseta confortável para o dia a dia. <b>Alta qualidade</b> e costura reforçada. <br/> Ideal para testar a descrição expandida no mobile (acordeão).',
      price: 89.90,
      compare_at_price: 129.90,
      sku: 'CAM-AL-001',
      has_retail: true,
      has_wholesale: false,
      image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80',
      is_active: true,
      is_in_stock: true,
      show_highlight: true,
      highlight_text: 'Oferta Especial',
      show_colors: true,
      colors: ['#000000', '#FFFFFF', '#1e3a8a'],
      type: 'product',
      specs_title: 'Detalhes do Produto',
      specs: [{ chave: 'Material', valor: '100% Algodão' }, { chave: 'Modelagem', valor: 'Slim Fit' }]
    },
    {
      category_id: catVarejo,
      name: 'Tênis Esportivo Premium (Galeria)',
      description: 'Este produto testa a <strong>GALERIA DE MÚLTIPLAS IMAGENS</strong>. Clique para abrir o modal e veja se as miniaturas aparecem abaixo da imagem principal e se o controle de navegação funciona.',
      price: 349.90,
      sku: 'TEN-ESP-900',
      has_retail: true,
      has_wholesale: false,
      image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
      image_urls: [
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80'
      ],
      is_active: true,
      is_in_stock: true,
      type: 'product'
    },

    // --- Atacado (Testando Modalidade Mista e B2B) ---
    {
      category_id: catAtacado,
      name: 'Lote de Copos Térmicos (B2B Exclusivo)',
      description: 'Vendido apenas no atacado. O sistema não deve exibir preço de varejo, apenas o preço de atacado e a etiqueta de quantidade mínima.',
      price: 0,
      wholesale_price: 45.00,
      wholesale_min_quantity: 50,
      has_retail: false,
      has_wholesale: true,
      image_url: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=600&q=80',
      is_active: true,
      is_in_stock: true,
      type: 'product'
    },
    {
      category_id: catAtacado,
      name: 'Mochila Executiva (Varejo + Atacado)',
      description: 'Mochila impermeável. Permite que o usuário clique na caixa "Preço de Atacado" ou "Preço de Varejo" no Modal para ver a alteração de valores.',
      price: 199.90,
      has_retail: true,
      wholesale_price: 129.90,
      wholesale_min_quantity: 10,
      has_wholesale: true,
      image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
      is_active: true,
      is_in_stock: true,
      type: 'product'
    },

    // --- Casos Especiais (Serviço e Esgotado) ---
    {
      category_id: catEspeciais,
      name: 'Consultoria de Marketing Digital',
      description: 'Exemplo de Serviço. O botão deve dizer "Ver Serviço" e não deve ter a etiqueta vermelha de esgotado, mas deve mostrar a flag de "Serviço".',
      price: 1500.00,
      has_retail: true,
      has_wholesale: false,
      image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
      is_active: true,
      is_in_stock: true,
      type: 'service' // Isso é chave para testar
    },
    {
      category_id: catEspeciais,
      name: 'Fone de Ouvido Noise Cancelling (ESGOTADO)',
      description: 'Deve aparecer cinza, com tarja vermelha de esgotado, e o botão do WhatsApp deve estar bloqueado com o cadeado.',
      price: 899.90,
      has_retail: true,
      has_wholesale: false,
      image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
      is_active: true,
      is_in_stock: false, // ESGOTADO
      type: 'product'
    }
  ];

  const { error: prodErr } = await supabase
    .from('products')
    .insert(productsToInsert);

  if (prodErr) {
    console.error("Erro ao criar produtos:", prodErr.message);
    return;
  }
  console.log(`✅ ${productsToInsert.length} produtos variados criados com sucesso!`);

  console.log("-----------------------------------------");
  console.log(`🚀 TESTE PRONTO! Acesse o catálogo atual do Fauzer Cruz.`);
  console.log(`Os produtos estão na categoria "🛑 TESTES UI (Pode Apagar)"`);
  console.log("-----------------------------------------");
  process.exit(0);
}

main();
