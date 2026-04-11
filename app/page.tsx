import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-neutral-50 flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center">

        <span className="inline-flex rounded-full bg-black px-4 py-1.5 text-sm font-medium text-white">
          PlataformaCard
        </span>

        <h1 className="mt-6 text-4xl font-bold tracking-tight text-neutral-900">
          Seu cartão digital profissional
        </h1>

        <p className="mt-4 text-lg text-neutral-600">
          Crie seu perfil, compartilhe seu catálogo e conecte-se com seus clientes de forma simples e elegante.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/cadastro"
            className="rounded-xl bg-black px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
          >
            Criar minha conta
          </Link>

          <Link
            href="/entrar"
            className="rounded-xl border border-neutral-300 bg-white px-6 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
          >
            Já tenho conta → Entrar
          </Link>
        </div>

      </div>
    </main>
  );
}