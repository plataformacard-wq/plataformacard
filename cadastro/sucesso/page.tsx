import Link from "next/link";

export default function CadastroSucessoPage() {
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">

        <div className="text-center">

          <h1 className="text-2xl font-bold">
            Cadastro realizado
          </h1>

          <p className="mt-4 text-sm text-zinc-300 leading-relaxed">
            Enviamos um link de confirmação para o seu email.
            <br />
            Verifique sua caixa de entrada para ativar sua conta.
          </p>

          <p className="mt-3 text-xs text-zinc-400">
            Se não encontrar o email, verifique também a pasta de spam ou lixo eletrônico.
          </p>

        </div>

        <div className="mt-8 flex flex-col gap-3">

          <Link
            href="/entrar"
            className="w-full rounded-xl bg-white px-4 py-3 text-center text-sm font-semibold text-zinc-950 transition hover:opacity-90"
          >
            Ir para o login
          </Link>

          <Link
            href="/cadastro"
            className="w-full rounded-xl border border-white/20 px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-white/10"
          >
            Criar outra conta
          </Link>

        </div>

      </div>
    </main>
  );
}