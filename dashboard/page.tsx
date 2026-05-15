"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function DashboardPage() {
  const supabase = createClient();
  const [nome, setNome] = useState("");
  const [slug, setSlug] = useState<string | null>(null);
  const [productCount, setProductCount] = useState<number | null>(null);
  const [profileViews, setProfileViews] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, full_name, slug, organization_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile) {
        setNome(profile.full_name ?? "");
        setSlug(profile.slug ?? null);

        // Conta produtos
        const { count } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("organization_id", profile.organization_id)
          .is("deleted_at", null);
        setProductCount(count ?? 0);

        // Visitas via RPC
        const { data: analytics } = await supabase.rpc(
          "get_profile_analytics_summary",
          { p_profile_id: profile.id }
        );
        if (analytics) {
          const row = Array.isArray(analytics) ? analytics[0] : analytics;
          setProfileViews(Number(row?.profile_views ?? 0));
        }
      }

      setLoading(false);
    }
    load();
  }, []);

  const cards = [
    {
      href: "/dashboard/perfil",
      icon: "👤",
      title: "Perfil",
      desc: "Edite nome, bio, avatar, WhatsApp e link do cartão.",
      action: "Editar perfil →",
    },
    {
      href: "/dashboard/catalogo",
      icon: "📦",
      title: "Catálogo",
      desc: "Gerencie produtos, categorias e reordene o catálogo.",
      action: "Abrir catálogo →",
    },
    {
      href: "/dashboard/analytics",
      icon: "📊",
      title: "Analytics",
      desc: "Visitas, cliques no catálogo e conversas iniciadas.",
      action: "Ver métricas →",
    },
    ...(slug
      ? [
          {
            href: `/p/${slug}`,
            icon: "🪪",
            title: "Meu cartão",
            desc: "Veja como seu cartão aparece para os clientes.",
            action: "Abrir cartão →",
            external: true,
          },
        ]
      : []),
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "var(--dash-text-primary)" }}>
          {nome ? `Olá, ${nome.split(" ")[0]} 👋` : "Dashboard"}
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--dash-text-secondary)" }}>
          Gerencie seu cartão digital e catálogo de produtos.
        </p>
      </div>

      {/* Stats rápidas */}
      {!loading && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <div
            className="rounded-2xl border p-5 shadow-sm transition-colors"
            style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
          >
            <p className="text-sm" style={{ color: "var(--dash-text-secondary)" }}>
              Produtos cadastrados
            </p>
            <p className="mt-2 text-3xl font-bold" style={{ color: "var(--dash-text-primary)" }}>
              {productCount ?? "—"}
            </p>
          </div>
          <div
            className="rounded-2xl border p-5 shadow-sm transition-colors"
            style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
          >
            <p className="text-sm" style={{ color: "var(--dash-text-secondary)" }}>
              Visitas no cartão
            </p>
            <p className="mt-2 text-3xl font-bold" style={{ color: "var(--dash-text-primary)" }}>
              {profileViews ?? "—"}
            </p>
          </div>
        </div>
      )}

      {/* Cards de navegação */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            target={c.external ? "_blank" : undefined}
            rel={c.external ? "noreferrer" : undefined}
            className="group block rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md hover:opacity-90"
            style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
          >
            <span className="text-2xl">{c.icon}</span>
            <h2 className="mt-3 text-base font-semibold" style={{ color: "var(--dash-text-primary)" }}>
              {c.title}
            </h2>
            <p className="mt-1 text-sm" style={{ color: "var(--dash-text-secondary)" }}>
              {c.desc}
            </p>
            <p className="mt-4 text-sm font-medium" style={{ color: "var(--dash-text-primary)" }}>
              {c.action}
            </p>
          </Link>
        ))}
      </section>
    </div>
  );
}