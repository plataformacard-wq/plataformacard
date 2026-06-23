export const sanitizeText = (text: string | null | undefined) => {
  if (!text) return "";
  return text
    .replace(/\s*-\s*EDITADO\s*$/gi, "")
    .replace(/\u00ad/g, "") // Soft hyphen
    .replace(/&shy;/g, "")  // Soft hyphen (HTML)
    .replace(/\u00a0/g, " ") // NBSP
    .replace(/&nbsp;/g, " ") // NBSP (HTML)
    .replace(/\s+/g, " ")    // Double spaces
    .replace(/ENPLACAMENTO/gi, "EMPLACAMENTO") // Consertar typo comum
    .replace(/E[NM]PLACA\s+MENTO/gi, "EMPLACAMENTO") // Consertar "EMPLACA MENTO" separado
    .trim();
};

export const formatPrice = (price: number | null | undefined) => {
  if (price === null || price === undefined) return null;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price);
};
