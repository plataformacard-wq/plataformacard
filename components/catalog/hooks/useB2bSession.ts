"use client";

import { useState, useEffect, useCallback } from "react";

export function useB2bSession(slug: string) {
  const [b2bToken, setB2bToken] = useState<string | null>(null);
  const [b2bClient, setB2bClient] = useState<any | null>(null);
  const [b2bPrices, setB2bPrices] = useState<Record<string, number>>({});
  const [anchorPrices, setAnchorPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(false);

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isFastOrderOpen, setIsFastOrderOpen] = useState(false);

  const fetchB2bClient = useCallback(async (token: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/b2b/clients?token=${token}`);
      const data = await res.json();
      if (data.success && data.client) {
        setB2bClient(data.client);
        setB2bPrices(data.prices || {});
        setAnchorPrices(data.anchorPrices || {});
      } else {
        localStorage.removeItem(`b2b_token_${slug}`);
        setB2bToken(null);
        setB2bClient(null);
        setAnchorPrices({});
      }
    } catch (err) {
      console.error("Erro ao validar token B2B:", err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("b2b") || localStorage.getItem(`b2b_token_${slug}`);

    if (token) {
      setB2bToken(token);
      localStorage.setItem(`b2b_token_${slug}`, token);
      fetchB2bClient(token);
    }
  }, [slug, fetchB2bClient]);

  const handleLogoutB2b = () => {
    localStorage.removeItem(`b2b_token_${slug}`);
    setB2bToken(null);
    setB2bClient(null);
    window.location.href = `/${slug}`;
  };

  return {
    b2bToken,
    b2bClient,
    b2bPrices,
    anchorPrices,
    loading,
    isRegisterOpen,
    setIsRegisterOpen,
    isFastOrderOpen,
    setIsFastOrderOpen,
    handleLogoutB2b,
  };
}
