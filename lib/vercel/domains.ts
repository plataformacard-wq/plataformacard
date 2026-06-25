const VERCEL_API_URL = "https://api.vercel.com/v9/projects";

export interface VercelDomainResponse {
  name: string;
  verified: boolean;
  status?: "Pending Verification" | "Verified" | "Error";
  createdAt?: number;
  verification?: {
    type: string;
    domain: string;
    value: string;
    reason: string;
  }[];
}

function getAuthHeaders() {
  const projectId = process.env.VERCEL_PROJECT_ID;
  const token = process.env.VERCEL_API_TOKEN;

  if (!projectId || !token) {
    throw new Error("Faltam variáveis de ambiente VERCEL_PROJECT_ID ou VERCEL_API_TOKEN");
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    projectId,
  };
}

export async function addDomainToVercel(domain: string): Promise<VercelDomainResponse> {
  const { projectId, ...headers } = getAuthHeaders();

  const response = await fetch(`${VERCEL_API_URL}/${projectId}/domains`, {
    method: "POST",
    headers,
    body: JSON.stringify({ name: domain }),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    const errorMsg = errorBody.error?.message || response.statusText;
    
    // Se o domínio já existir no projeto, ignoramos o erro e seguimos em frente
    if (errorMsg.includes("already in use")) {
      return await checkDomainStatus(domain);
    }
    
    throw new Error(`Erro ao adicionar domínio na Vercel: ${errorMsg}`);
  }

  return await response.json();
}

export async function removeDomainFromVercel(domain: string): Promise<void> {
  const { projectId, ...headers } = getAuthHeaders();

  const response = await fetch(`${VERCEL_API_URL}/${projectId}/domains/${domain}`, {
    method: "DELETE",
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(`Erro ao remover domínio na Vercel: ${errorBody.error?.message || response.statusText}`);
  }
}

export async function checkDomainStatus(domain: string): Promise<VercelDomainResponse> {
  const { projectId, ...headers } = getAuthHeaders();

  const response = await fetch(`${VERCEL_API_URL}/${projectId}/domains/${domain}`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(`Erro ao checar status do domínio na Vercel: ${errorBody.error?.message || response.statusText}`);
  }

  let data = await response.json();

  // Se o domínio ainda não está verificado, forçamos a Vercel a realizar uma nova checagem (POST /verify)
  // Isso resolve casos onde o DNS já propagou, mas a Vercel está com o status em cache
  if (data && !data.verified) {
    try {
      const verifyResponse = await fetch(`${VERCEL_API_URL}/${projectId}/domains/${domain}/verify`, {
        method: "POST",
        headers,
      });
      if (verifyResponse.ok) {
        data = await verifyResponse.json();
      }
    } catch (e) {
      console.error("Erro ao forçar verificação do domínio:", e);
    }
  }

  return data;
}
