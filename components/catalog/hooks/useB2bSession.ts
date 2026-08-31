"use client";

import { useState, useEffect, useCallback } from "react";

export function useB2bSession(slug: string) {
  const [b2bToken, setB2bToken] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string>("");
  const [b2bClient, setB2bClient] = useState<any | null>(null);
  const [b2bPrices, setB2bPrices] = useState<Record<string, number>>({});
  const [anchorPrices, setAnchorPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(false);

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isFastOrderOpen, setIsFastOrderOpen] = useState(false);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [maskedPhone, setMaskedPhone] = useState<string>("");

  // Obter ou gerar Device ID único do navegador
  const getOrCreateDeviceId = (): string => {
    if (typeof window === "undefined") return "";
    let id = localStorage.getItem("b2b_device_id");
    if (!id) {
      id = "dev_" + Math.random().toString(36).substring(2, 15) + "_" + Date.now();
      localStorage.setItem("b2b_device_id", id);
    }
    return id;
  };

  const fetchB2bClient = useCallback(
    async (token: string, devId: string) => {
      setLoading(true);
      try {
        const res = await fetch(`/api/b2b/clients?token=${encodeURIComponent(token)}&deviceId=${encodeURIComponent(devId)}`);
        const data = await res.json();

        if (data.success && data.client) {
          if (data.requiresVerification) {
            // Dispositivo precisa de confirmação OTP
            setB2bClient(data.client);
            setMaskedPhone(data.maskedPhone || "WhatsApp cadastrado");
            setIsVerificationOpen(true);
            setB2bPrices({});
            setAnchorPrices({});
          } else {
            // Dispositivo já autorizado
            setB2bClient(data.client);
            setB2bPrices(data.prices || {});
            setAnchorPrices(data.anchorPrices || {});
            setIsVerificationOpen(false);
          }
        } else {
          // Token inválido ou expirado
          localStorage.removeItem(`b2b_token_${slug}`);
          setB2bToken(null);
          setB2bClient(null);
          setAnchorPrices({});
          setIsVerificationOpen(false);
        }
      } catch (err) {
        console.error("Erro ao validar sessão B2B:", err);
      } finally {
        setLoading(false);
      }
    },
    [slug]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const devId = getOrCreateDeviceId();
    setDeviceId(devId);

    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get("b2b_token") || urlParams.get("b2b");
    const tokenFromStorage = localStorage.getItem(`b2b_token_${slug}`);
    const token = tokenFromUrl || tokenFromStorage;

    // URL Sanitizer: Limpar o token da barra de endereço imediatamente
    if (tokenFromUrl) {
      urlParams.delete("b2b_token");
      urlParams.delete("b2b");
      const remainingSearch = urlParams.toString();
      const newUrl =
        window.location.pathname + (remainingSearch ? `?${remainingSearch}` : "") + window.location.hash;
      window.history.replaceState(null, "", newUrl);
    }

    if (token) {
      setB2bToken(token);
      localStorage.setItem(`b2b_token_${slug}`, token);
      fetchB2bClient(token, devId);
    }
  }, [slug, fetchB2bClient]);

  const handleVerifiedDevice = (data: {
    client: any;
    prices: Record<string, number>;
    anchorPrices: Record<string, number>;
  }) => {
    setB2bClient(data.client);
    setB2bPrices(data.prices || {});
    setAnchorPrices(data.anchorPrices || {});
    setIsVerificationOpen(false);
  };

  const handleCloseVerification = () => {
    setIsVerificationOpen(false);
    // Se cancelou a verificação, removemos o token local para evitar bloquear o catálogo normal
    localStorage.removeItem(`b2b_token_${slug}`);
    setB2bToken(null);
    setB2bClient(null);
  };

  const handleLogoutB2b = () => {
    localStorage.removeItem(`b2b_token_${slug}`);
    setB2bToken(null);
    setB2bClient(null);
    setB2bPrices({});
    setAnchorPrices({});
    window.location.href = `/${slug}`;
  };

  return {
    b2bToken,
    deviceId,
    b2bClient,
    b2bPrices,
    anchorPrices,
    loading,
    isRegisterOpen,
    setIsRegisterOpen,
    isFastOrderOpen,
    setIsFastOrderOpen,
    isVerificationOpen,
    setIsVerificationOpen,
    maskedPhone,
    handleVerifiedDevice,
    handleCloseVerification,
    handleLogoutB2b,
  };
}
