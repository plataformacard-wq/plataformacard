/**
 * Utilitários para Validação Matemática e Consulta Pública de CNPJ (BrasilAPI)
 */

export interface CnpjLookupResult {
  success: boolean;
  error?: string;
  data?: {
    cnpj: string;
    razaoSocial: string;
    nomeFantasia: string;
    situacaoCadastral: string;
    isAtiva: boolean;
    cnaeDescricao?: string;
    cidade?: string;
    uf?: string;
    telefone?: string;
  };
}

/**
 * Validação Matemática Oficial do Algoritmo de CNPJ (Dígitos Verificadores - Módulo 11)
 */
export function validateCnpj(cnpj: string): boolean {
  const clean = cnpj.replace(/\D/g, "");

  if (clean.length !== 14) return false;

  // Rejeita sequências de dígitos repetidos conhecidos (ex: 00000000000000, 11111111111111)
  if (/^(\d)\1{13}$/.test(clean)) return false;

  // Validação do 1º Dígito Verificador
  let tamanho = clean.length - 2;
  let numeros = clean.substring(0, tamanho);
  const digitos = clean.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i), 10) * pos--;
    if (pos < 2) pos = 9;
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0), 10)) return false;

  // Validação do 2º Dígito Verificador
  tamanho = tamanho + 1;
  numeros = clean.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i), 10) * pos--;
    if (pos < 2) pos = 9;
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(1), 10)) return false;

  return true;
}

/**
 * Formatação de Máscara de CNPJ: 00.000.000/0000-00
 */
export function formatCnpj(value: string): string {
  const clean = value.replace(/\D/g, "").slice(0, 14);
  if (!clean) return "";

  return clean
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

/**
 * Consulta Gratuita à base da Receita Federal via BrasilAPI com timeout seguro
 */
export async function fetchCnpjData(cnpj: string): Promise<CnpjLookupResult> {
  const clean = cnpj.replace(/\D/g, "");

  if (clean.length !== 14) {
    return { success: false, error: "CNPJ deve conter 14 dígitos." };
  }

  if (!validateCnpj(clean)) {
    return { success: false, error: "Número de CNPJ matematicamente inválido." };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6 segundos de timeout

    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${clean}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 404) {
        return { success: false, error: "CNPJ não encontrado na base da Receita Federal." };
      }
      return { success: false, error: "Serviço de consulta momentaneamente indisponível." };
    }

    const data = await response.json();
    const situacao = (data.descricao_situacao_cadastral || "").toUpperCase();
    const isAtiva = situacao === "ATIVA";

    let phone = "";
    if (data.ddd_telefone_1) {
      phone = data.ddd_telefone_1.replace(/\D/g, "");
    }

    return {
      success: true,
      data: {
        cnpj: clean,
        razaoSocial: data.razao_social || "",
        nomeFantasia: data.nome_fantasia || data.razao_social || "",
        situacaoCadastral: data.descricao_situacao_cadastral || "Desconhecida",
        isAtiva,
        cnaeDescricao: data.cnae_fiscal_descricao || undefined,
        cidade: data.municipio || undefined,
        uf: data.uf || undefined,
        telefone: phone || undefined,
      },
    };
  } catch (err: any) {
    if (err.name === "AbortError") {
      return { success: false, error: "Tempo de resposta da consulta esgotado." };
    }
    return { success: false, error: "Falha de rede ao consultar CNPJ." };
  }
}
