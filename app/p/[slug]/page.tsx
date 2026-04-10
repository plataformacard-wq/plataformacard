import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import ProfileViewTracker from "@/components/analytics/ProfileViewTracker";
import ProfileWhatsAppButton from "@/components/analytics/ProfileWhatsAppButton";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = true;
export const revalidate = 0;

export default async function Page(props: PageProps) {
  const supabase = await createClient();

  const { slug } = await props.params;

  if (
  slug === "login" ||
  slug === "cadastro" ||
  slug === "dashboard" ||
  slug === "admin" ||
  slug === "auth" ||
  slug === "recuperar-senha" ||
  slug === "reset-senha" ||
  slug === "test"
) {
  notFound();
}

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, slug, organization_id, full_name, bio, avatar_url, whatsapp")
    .eq("slug", slug)
    .maybeSingle();
  
    if (!profile) {
  notFound();
}

const safeProfile = profile!;
    
  return (
    <main className="min-h-screen bg-neutral-100 flex items-center justify-center px-4">
      <ProfileViewTracker profileId={safeProfile.id} slug={slug} />
      <div className="w-full max-w-xl rounded-3xl border bg-white shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-neutral-900 to-neutral-700" />

        <div className="px-6 pb-10 -mt-12 text-center">
          {safeProfile.avatar_url ? (
            <img
              src={safeProfile.avatar_url}
              alt={safeProfile.full_name}
              className="mx-auto h-54 w-54 rounded-full border-4 border-white object-cover"
            />
          ) : (
            <div className="mx-auto flex h-54 w-54 items-center justify-center rounded-full border-4 border-white bg-neutral-200 text-sm text-neutral-500">
              Sem foto
            </div>
          )}

          <h1 className="mt-4 text-2xl font-bold text-neutral-900">
            {safeProfile.full_name}
          </h1>

          {safeProfile.bio && (
            <p className="mt-2 text-sm text-neutral-600">{safeProfile.bio}</p>
          )}

          <div className="mt-6 flex flex-col gap-3">
            {safeProfile.whatsapp && (
              <ProfileWhatsAppButton
                profileId={safeProfile.id}
                slug={slug}
                whatsapp={safeProfile.whatsapp}
              />
            )}

        <Link
  href={`/p/${slug}/catalogo`}
  className="rounded-xl bg-neutral-900 py-3 font-semibold text-white hover:bg-neutral-800"
>
  Ver catálogo
</Link>
          </div>
        </div>
      </div>
    </main>
  );
}