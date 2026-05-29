import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Encuentros Oaxaca | NUVANUN",
  description:
    "Conecta con personas en Oaxaca. Publica anuncios y encuentra nuevas conexiones en NUVANUN.",
};

export default function EncuentrosOaxacaPage() {
  return (
    <main className="min-h-screen bg-[#0B0B0F] text-[#FFFFFF]">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between py-2">
          <Link
            href="/"
            className="text-sm font-semibold tracking-[0.28em] text-white"
            aria-label="NUVANUN inicio"
          >
            NUVANUN
          </Link>
          <Link
            href="/publish"
            className="rounded-full border border-[#7B3FE4]/45 px-4 py-2 text-xs font-semibold text-white transition hover:border-[#9F6BFF] hover:bg-[#1A1A22]"
          >
            Publicar
          </Link>
        </header>

        <div className="flex flex-1 items-center py-16 sm:py-20">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.22em] text-[#9F6BFF]">
              Fluye. Publica. Conecta.
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
              Encuentros Oaxaca
            </h1>
            <p className="mt-5 text-xl font-medium leading-8 text-zinc-100 sm:text-2xl">
              Conecta con personas en Oaxaca
            </p>
            <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg">
              NUVANUN te ayuda a descubrir encuentros en Oaxaca de forma simple
              y directa. Explora anuncios locales, comparte lo que buscas y
              encuentra contactos para crear nuevas conexiones en la ciudad y
              sus alrededores.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/"
                className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#7B3FE4] px-5 py-3 text-sm font-semibold text-white shadow-[0_0_28px_rgba(123,63,228,0.28)] transition hover:bg-[#9F6BFF]"
              >
                Ir a la Home
              </Link>
              <Link
                href="/publish"
                className="inline-flex min-h-12 items-center justify-center rounded-md border border-[#7B3FE4]/45 px-5 py-3 text-sm font-semibold text-white transition hover:border-[#9F6BFF] hover:bg-[#1A1A22]"
              >
                Publicar anuncio
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
