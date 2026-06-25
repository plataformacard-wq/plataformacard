import { ImageResponse } from 'next/og';
import { createClient } from "@supabase/supabase-js";

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default async function Icon() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { data } = await supabase
        .from('platform_config')
        .select('value')
        .eq('key', 'fallback_favicon_url')
        .maybeSingle();

      if (data?.value) {
        const response = await fetch(data.value);
        if (response.ok) {
          const buffer = await response.arrayBuffer();
          return new Response(buffer, {
            headers: {
              "Content-Type": response.headers.get("Content-Type") || "image/png",
              "Cache-Control": "public, max-age=3600"
            }
          });
        }
      }
    }
  } catch (err) {
    console.error("Erro ao carregar fallback favicon:", err);
  }

  // Fallback do Fallback: O clássico 'P' azul
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 20,
          background: '#0ea5e9', // Sky blue
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '4px',
          fontWeight: 800,
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        P
      </div>
    ),
    { ...size }
  );
}
