"use client";

import { useEffect, useRef } from "react";
import { trackAnalyticsEvent } from "@/lib/analytics";

type ProfileViewTrackerProps = {
  profileId: string;
  slug: string;
};

export default function ProfileViewTracker({
  profileId,
  slug,
}: ProfileViewTrackerProps) {
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (hasTrackedRef.current) {
      return;
    }

    hasTrackedRef.current = true;

    void trackAnalyticsEvent({
      profileId,
      eventType: "profile_view",
      pageType: "profile",
      metadata: {
        slug,
        path: `/${slug}`,
      },
    });
  }, [profileId, slug]);

  return null;
}