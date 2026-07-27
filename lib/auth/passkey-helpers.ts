"use client";

/**
 * Utilitário para gerenciamento de Biometria Nativa (Passkeys / Touch ID / Face ID) via WebAuthn
 */

// Verifica se o dispositivo e o navegador possuem suporte a biometria nativa
export async function isPasskeySupported(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!window.PublicKeyCredential) return false;

  try {
    const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    return available;
  } catch (err) {
    console.warn("Erro ao checar suporte a WebAuthn/Passkey:", err);
    return false;
  }
}

/**
 * Registra a biometria (Touch ID / Face ID / Android Fingerprint) do dispositivo atual
 */
export async function registerPasskey(userName: string): Promise<{ success: boolean; error?: string }> {
  const supported = await isPasskeySupported();
  if (!supported) {
    return { success: false, error: "Este navegador ou dispositivo não possui suporte a leitor de biometria nativa." };
  }

  try {
    // Desafio aleatório seguro de 32 bytes
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const userIdBuffer = new TextEncoder().encode(userName);

    const createOptions: PublicKeyCredentialCreationOptions = {
      challenge,
      rp: {
        name: "PlataformaShop",
        id: window.location.hostname,
      },
      user: {
        id: userIdBuffer,
        name: userName,
        displayName: userName,
      },
      pubKeyCredParams: [
        { alg: -7, type: "public-key" },  // ES256
        { alg: -257, type: "public-key" }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform", // Força o leitor do próprio dispositivo (TouchID/FaceID)
        userVerification: "required",
        residentKey: "preferred",
      },
      timeout: 60000,
    };

    const credential = (await navigator.credentials.create({
      publicKey: createOptions,
    })) as PublicKeyCredential | null;

    if (!credential) {
      return { success: false, error: "Não foi possível registrar a biometria." };
    }

    // Salva identificação de biometria no localStorage do navegador para acesso ultra-rápido
    const credentialId = Array.from(new Uint8Array(credential.rawId))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    localStorage.setItem(`ps_passkey_${userName}`, credentialId);

    return { success: true };
  } catch (err: any) {
    console.error("Erro durante o registro de Passkey:", err);
    if (err.name === "NotAllowedError") {
      return { success: false, error: "Leitura biométrica cancelada pelo usuário." };
    }
    return { success: false, error: err.message || "Falha ao registrar biometria no dispositivo." };
  }
}

/**
 * Autentica o usuário usando a biometria registrada no dispositivo
 */
export async function authenticatePasskey(userName: string): Promise<{ success: boolean; error?: string }> {
  const supported = await isPasskeySupported();
  if (!supported) {
    return { success: false, error: "Biometria não disponível neste dispositivo." };
  }

  const credentialIdHex = localStorage.getItem(`ps_passkey_${userName}`);
  if (!credentialIdHex) {
    return { success: false, error: "Nenhuma biometria cadastrada para esta conta neste navegador." };
  }

  try {
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    // Converte hex id de volta para Uint8Array
    const rawIdMatch = credentialIdHex.match(/.{1,2}/g);
    const rawIdBytes = rawIdMatch ? new Uint8Array(rawIdMatch.map((byte) => parseInt(byte, 16))) : new Uint8Array();

    const getOptions: PublicKeyCredentialRequestOptions = {
      challenge,
      allowCredentials: [
        {
          id: rawIdBytes,
          type: "public-key",
          transports: ["internal"],
        },
      ],
      userVerification: "required",
      timeout: 60000,
    };

    const assertion = (await navigator.credentials.get({
      publicKey: getOptions,
    })) as PublicKeyCredential | null;

    if (!assertion) {
      return { success: false, error: "Falha na verificação biométrica." };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Erro na verificação biométrica:", err);
    if (err.name === "NotAllowedError") {
      return { success: false, error: "Leitura biométrica cancelada." };
    }
    return { success: false, error: err.message || "Falha na autenticação por biometria." };
  }
}
