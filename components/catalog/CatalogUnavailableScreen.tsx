"use client";

import React from "react";
import { Store, AlertCircle } from "lucide-react";
import Image from "next/image";

type ProfileRow = {
  full_name?: string | null;
  avatar_url?: string | null;
};

export default function CatalogUnavailableScreen({ profile }: { profile?: ProfileRow }) {
  const name = profile?.full_name || "Este catálogo";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse 90% 55% at 50% -5%, rgba(255,100,100,0.05) 0%, #0a0a0a 65%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.05)",
          borderRadius: 32,
          boxShadow: "0 40px 100px rgba(0,0,0,0.8)",
          overflow: "hidden",
          textAlign: "center",
          padding: "48px 32px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            {profile?.avatar_url ? (
               <Image
                 src={profile.avatar_url}
                 alt={name}
                 fill
                 sizes="80px"
                 style={{ objectFit: "cover", borderRadius: "50%", opacity: 0.5, filter: "grayscale(100%)" }}
               />
            ) : (
              <Store size={32} color="rgba(255,255,255,0.4)" />
            )}
            
            {/* Status indicator */}
            <div style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "#0a0a0a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <AlertCircle size={14} color="#ef4444" />
            </div>
          </div>
        </div>

        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#fff",
            marginBottom: 12,
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
          }}
        >
          Temporariamente<br/>Indisponível
        </h1>
        
        <p
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.45)",
            lineHeight: 1.6,
            marginBottom: 0,
          }}
        >
          O catálogo de <strong>{name}</strong> encontra-se indisponível no momento. Por favor, tente acessar novamente mais tarde.
        </p>
      </div>
      
      {/* Rodapé */}
      <footer
        style={{
          marginTop: 36,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.22)",
            letterSpacing: "0.05em",
          }}
        >
          Powered by anotameucontato.com.br
        </span>
      </footer>
    </main>
  );
}
