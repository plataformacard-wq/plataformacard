import { createClient } from '@supabase/supabase-js';

// ==========================================
// CONFIGURAÇÕES DA MIGRAÇÃO
// ==========================================
// Preencha as chaves abaixo no dia em que for rodar o script localmente.
// NÃO comite essas chaves num repositório público!

// SUPABASE VELHO (Origem) - Onde as imagens estão agora
const OLD_SUPABASE_URL = "https://[SEU_VELHO_PROJECT_ID].supabase.co";

// SUPABASE NOVO (Destino) - Onde as imagens e os dados vão ficar
const NEW_SUPABASE_URL = "https://[SEU_NOVO_PROJECT_ID].supabase.co";
const NEW_SUPABASE_SERVICE_KEY = "sua-nova-service-role-key-aqui";

// Bucket alvo (certifique-se de que ele existe no novo Supabase e é público)
const BUCKET_NAME = "products"; 

// ==========================================

const newSupabase = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_SERVICE_KEY);

async function downloadImage(url: string): Promise<Blob | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Falha no download: ${response.statusText}`);
    return await response.blob();
  } catch (error) {
    console.error(`Erro ao baixar a imagem ${url}:`, error);
    return null;
  }
}

async function uploadImageToNewBucket(blob: Blob, oldUrl: string): Promise<string | null> {
  try {
    // Tenta preservar o nome original extraindo da URL
    const urlParts = oldUrl.split('/');
    const fileNameRaw = urlParts[urlParts.length - 1];
    const originalFileName = fileNameRaw.split('?')[0]; 
    
    // Gera um nome único para evitar conflitos
    const newFileName = `${Date.now()}_${originalFileName}`;
    const filePath = `migrated/${newFileName}`;

    const { data, error } = await newSupabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, blob, {
        upsert: true,
        contentType: blob.type
      });

    if (error) {
      console.error(`Erro no upload de ${oldUrl}:`, error);
      return null;
    }

    // Retorna a URL pública
    const { data: publicData } = newSupabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
    return publicData.publicUrl;
  } catch (error) {
    console.error(`Erro inesperado no upload de ${oldUrl}:`, error);
    return null;
  }
}

async function runMigration() {
  console.log("Iniciando varredura de produtos no NOVO banco de dados...");

  // Busca todos os produtos no banco NOVO (que já foram importados pelo Excel)
  const { data: products, error } = await newSupabase
    .from("products")
    .select("id, image_url, image_urls");

  if (error) {
    console.error("Erro ao buscar produtos:", error);
    return;
  }

  if (!products || products.length === 0) {
    console.log("Nenhum produto encontrado no novo banco.");
    return;
  }

  console.log(`Encontrados ${products.length} produtos. Iniciando migração das imagens...`);

  let countSuccess = 0;
  let countFailed = 0;

  for (const product of products) {
    let updated = false;
    let newMainUrl = product.image_url;
    let newGalleryUrls = product.image_urls ? [...product.image_urls] : [];

    // Processar Imagem Principal
    if (product.image_url && product.image_url.includes(OLD_SUPABASE_URL)) {
      console.log(`\n[Prod ${product.id}] Baixando imagem principal...`);
      const blob = await downloadImage(product.image_url);
      if (blob) {
        const uploadedUrl = await uploadImageToNewBucket(blob, product.image_url);
        if (uploadedUrl) {
          newMainUrl = uploadedUrl;
          updated = true;
          console.log(`  -> Nova URL: ${uploadedUrl}`);
        } else {
          countFailed++;
        }
      } else {
        countFailed++;
      }
    }

    // Processar Galeria
    if (Array.isArray(product.image_urls) && product.image_urls.length > 0) {
      for (let i = 0; i < product.image_urls.length; i++) {
        const oldGalleryUrl = product.image_urls[i];
        if (oldGalleryUrl && oldGalleryUrl.includes(OLD_SUPABASE_URL)) {
          console.log(`[Prod ${product.id}] Baixando imagem da galeria (${i+1}/${product.image_urls.length})...`);
          const blob = await downloadImage(oldGalleryUrl);
          if (blob) {
            const uploadedUrl = await uploadImageToNewBucket(blob, oldGalleryUrl);
            if (uploadedUrl) {
              newGalleryUrls[i] = uploadedUrl;
              updated = true;
              console.log(`  -> Nova Galeria URL: ${uploadedUrl}`);
            } else {
              countFailed++;
            }
          } else {
            countFailed++;
          }
        }
      }
    }

    // Se houve alguma alteração neste produto, fazemos o UPDATE no novo banco
    if (updated) {
      console.log(`[Prod ${product.id}] Atualizando URLs no banco de dados...`);
      const { error: updateError } = await newSupabase
        .from("products")
        .update({
          image_url: newMainUrl,
          image_urls: newGalleryUrls
        })
        .eq("id", product.id);

      if (updateError) {
        console.error(`  -> Erro ao atualizar produto ${product.id}:`, updateError);
        countFailed++;
      } else {
        countSuccess++;
        console.log(`  -> Produto ${product.id} atualizado com sucesso!`);
      }
    }
  }

  console.log("\n=================================");
  console.log("MIGRAÇÃO DE IMAGENS CONCLUÍDA!");
  console.log(`Sucessos (Produtos atualizados): ${countSuccess}`);
  console.log(`Falhas (Imagens com erro): ${countFailed}`);
  console.log("=================================");
}

// runMigration();
