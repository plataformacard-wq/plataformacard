"use server";

import dns from "dns/promises";

export type DNSCheckResult = {
  success: boolean;
  valueFound?: string | string[];
  error?: string;
};

/**
 * Faz uma verificação nativa de DNS a partir do servidor Node.js
 * @param domain O domínio ou host a ser verificado (ex: plataformashop.com.br ou www.plataformashop.com.br)
 * @param type O tipo de registro ('A' ou 'CNAME')
 * @param expectedValue O valor esperado (ex: '76.76.21.21' ou 'cname.vercel-dns.com')
 */
export async function checkNativeDNS(domain: string, type: string, expectedValue: string): Promise<DNSCheckResult> {
  try {
    if (type === "A") {
      const addresses = await dns.resolve4(domain);
      // Checa se algum dos IPs retornados bate com o esperado (ou se é 76.76.21.21 / 216.198.79.1 comuns da Vercel)
      const success = addresses.includes(expectedValue) || addresses.some(ip => ip === "76.76.21.21" || ip === "216.198.79.1");
      return { success, valueFound: addresses };
    } 
    
    if (type === "CNAME") {
      const addresses = await dns.resolveCname(domain);
      // O DNS CNAME costuma retornar com ou sem o ponto final
      const normalizedExpected = expectedValue.toLowerCase().replace(/\.$/, "");
      
      const success = addresses.some(addr => {
        const normalizedAddr = addr.toLowerCase().replace(/\.$/, "");
        return normalizedAddr === normalizedExpected || normalizedAddr.includes("vercel-dns");
      });
      return { success, valueFound: addresses };
    }

    return { success: false, error: "Tipo de registro não suportado para verificação rápida." };
  } catch (error: any) {
    // Código ENOTFOUND significa que não achou o registro
    return { success: false, error: error.code || error.message };
  }
}
