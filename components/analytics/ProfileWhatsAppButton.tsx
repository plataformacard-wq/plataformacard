"use client";

import { trackAnalyticsEvent } from "@/lib/analytics";

type ProfileWhatsAppButtonProps = {
  profileId: string;
  slug: string;
  whatsapp: string;
};

export default function ProfileWhatsAppButton({
  profileId,
  slug,
  whatsapp,
}: ProfileWhatsAppButtonProps) {
  const whatsappUrl = `https://wa.me/${whatsapp.replace(/\D/g, "")}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noreferrer"
      onClick={() => {
        void trackAnalyticsEvent({
          profileId,
          eventType: "whatsapp_profile_click",
          pageType: "profile",
          metadata: {
            slug,
            path: `/p/${slug}`,
          },
        });
      }}
      className="rounded-xl bg-green-600 py-3 font-semibold text-white hover:bg-green-700"
    >
      Falar no WhatsApp
    </a>
  );
}