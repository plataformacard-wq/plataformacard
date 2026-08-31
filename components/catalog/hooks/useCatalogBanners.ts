import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

interface UseCatalogBannersProps {
  catalogId?: string | null;
  banners?: any[] | null;
  showBanners?: boolean;
}

export function useCatalogBanners({
  catalogId,
  banners,
  showBanners,
}: UseCatalogBannersProps) {
  const [localBanners, setLocalBanners] = useState<any[] | null>(banners || null);
  const [localShowBanners, setLocalShowBanners] = useState<boolean>(showBanners !== false);

  useEffect(() => {
    setLocalShowBanners(showBanners !== false);
  }, [showBanners]);

  useEffect(() => {
    if (banners) {
      setLocalBanners(banners);
      return;
    }
    if (!catalogId) return;

    const fetchBanners = async () => {
      const { data } = await supabase
        .from("catalogs")
        .select("banners, show_banners")
        .eq("id", catalogId)
        .maybeSingle();
      if (data) {
        if (data.banners) setLocalBanners(data.banners);
        else setLocalBanners([]);
        setLocalShowBanners(data.show_banners !== false);
      }
    };
    fetchBanners();
  }, [catalogId, banners]);

  return {
    localBanners,
    localShowBanners,
  };
}
