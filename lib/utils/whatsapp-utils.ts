export type WhatsAppMessageData = {
  item_name: string;
  item_price: string;
  item_sku?: string;
  item_url?: string;
  item_type: "produto" | "serviço";
  item_category?: string;
  seller_name: string;
};

export function formatWhatsAppMessage(template: string | null | undefined, data: WhatsAppMessageData): string {
  if (!template || !template.trim()) {
    // Fallback padrão se não houver template
    const { item_name, item_price, item_type, item_sku } = data;
    const term = item_type === 'serviço' ? 'serviço' : 'produto';
    return `Olá! Tenho interesse no ${term} *${item_name}*${item_price ? ` (${item_price})` : ""}.${item_sku ? `\nReferência: ${item_sku}` : ""}`;
  }

  let message = template;

  // Mapeamento de Tags (Suporta português e inglês para flexibilidade)
  const tagMap: Record<string, string | undefined> = {
    "{item_nome}": data.item_name,
    "{nome}": data.item_name,
    "{item_preco}": data.item_price,
    "{preco}": data.item_price,
    "{item_sku}": data.item_sku || "",
    "{sku}": data.item_sku || "",
    "{item_url}": data.item_url || "",
    "{link}": data.item_url || "",
    "{categoria}": data.item_category || "Sem categoria",
    // Aliases retroativos (mantidos para compatibilidade com templates já salvos)
    "{tipo}": data.item_type,
    "{vendedor}": data.seller_name,
  };

  Object.entries(tagMap).forEach(([tag, value]) => {
    // Regex global e case-insensitive para substituir todas as ocorrências
    const regex = new RegExp(tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    message = message.replace(regex, value || "");
  });

  return message;
}
