"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function RedirectLogic() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  useEffect(() => {
    if (code) {
      console.log("Código de autenticação detectado na Home, redirecionando para callback...");
      router.push(`/auth/callback?code=${code}`);
    }
  }, [code, router]);

  return null;
}

export function AuthRedirectHandler() {
  return (
    <Suspense fallback={null}>
      <RedirectLogic />
    </Suspense>
  );
}
