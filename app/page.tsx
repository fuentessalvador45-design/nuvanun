import Link from "next/link";
import { ListingList } from "./listing-list";

const categories = [
  {
    title: "Contactos",
    description: "Conexiones locales.",
  },
  {
    title: "Profesionales",
    description: "Servicios cercanos.",
  },
  {
    title: "Contenido",
    description: "Presencia visual.",
  },
];

const steps = [
  {
    title: "Publica",
    description: "Crea tu anuncio en minutos.",
  },
  {
    title: "Conecta",
    description: "Haz visible tu propuesta local.",
  },
  {
    title: "Fluye",
    description: "Mantén todo simple y directo.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0B0B0F] text-[#FFFFFF]">
      <section className="mx-auto w-full max-w-6xl px-5 py-5 sm:px-8 lg:px-10">
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
            className="hidden rounded-full border border-[#7B3FE4]/45 px-4 py-2 text-xs font-semibold text-white transition hover:border-[#9F6BFF] hover:bg-[#1A1A22] sm:inline-flex"
          >
            Publicar
          </Link>
        </header>

        <div className="py-10 text-center sm:py-14">
          <div className="mx-auto max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.46em] text-[#C7A8FF] sm:text-sm">
              NUVANUN
            </p>
            <h1 className="mt-5 text-3xl font-semibold tracking-normal text-white sm:text-5xl">
              PUBLICA • CONECTA • FLUYE
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-zinc-300 sm:text-base">
              Anuncios locales en una experiencia oscura, directa y facil de
              explorar.
            </p>

            <div className="mt-7 flex justify-center">
              <Link
                href="/publish"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-[#7B3FE4] px-6 py-3 text-sm font-semibold text-white shadow-[0_0_28px_rgba(123,63,228,0.28)] transition hover:bg-[#9F6BFF] sm:w-auto"
              >
                Publicar anuncio
              </Link>
            </div>
          </div>
        </div>

        <section className="py-6 sm:py-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#9F6BFF]">
                Anuncios
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Publicaciones recientes
              </h2>
            </div>
            <Link
              href="/publish"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#7B3FE4]/45 px-4 py-2 text-sm font-semibold text-white transition hover:border-[#9F6BFF] hover:bg-[#1A1A22]"
            >
              Crear anuncio
            </Link>
          </div>

          <ListingList />
        </section>

        <section id="categorias" className="scroll-mt-8 py-10 sm:py-12">
          <div className="grid gap-3 sm:grid-cols-3">
            {categories.map((category) => (
              <article
                key={category.title}
                className="rounded-lg border border-white/10 bg-[#121218] p-4 shadow-[0_18px_45px_rgba(0,0,0,0.22)] transition hover:border-[#7B3FE4]/60"
              >
                <h2 className="text-base font-semibold text-white">
                  {category.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  {category.description}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {steps.map((step, index) => (
              <article key={step.title} className="border-t border-white/10 pt-4">
                <span className="text-xs font-semibold text-[#7B3FE4]">
                  0{index + 1}
                </span>
                <h2 className="mt-2 text-base font-semibold text-white">
                  {step.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
