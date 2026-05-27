import Link from "next/link";
import { ListingList } from "./listing-list";

const categories = [
  {
    title: "Contactos",
    description: "Encuentra personas cercanas y crea conexiones locales con claridad.",
  },
  {
    title: "Profesionales",
    description: "Descubre servicios, oficios y perfiles disponibles en tu zona.",
  },
  {
    title: "Contenido",
    description: "Comparte anuncios, novedades y oportunidades para tu comunidad.",
  },
];

const steps = [
  {
    title: "Fluye",
    description: "Organiza tu anuncio con una estructura limpia y facil de leer.",
  },
  {
    title: "Publica",
    description: "Muestra lo que ofreces o necesitas con una presencia confiable.",
  },
  {
    title: "Conecta",
    description: "Abre conversaciones directas con personas de tu comunidad.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0B0B0F] text-[#FFFFFF]">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8 lg:px-10">
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

        <div className="flex flex-1 flex-col justify-center py-16 sm:py-20">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.22em] text-[#9F6BFF]">
              Fluye. Publica. Conecta.
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
              Anuncios locales con una experiencia simple, moderna y confiable
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-zinc-300 sm:text-lg">
              NUVANUN conecta personas, servicios y oportunidades en un espacio
              oscuro, fluido y facil de explorar.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/publish"
                className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#7B3FE4] px-5 py-3 text-sm font-semibold text-white shadow-[0_0_28px_rgba(123,63,228,0.28)] transition hover:bg-[#9F6BFF]"
              >
                Publicar anuncio
              </Link>
              <a
                href="#categorias"
                className="inline-flex min-h-12 items-center justify-center rounded-md border border-[#7B3FE4]/45 px-5 py-3 text-sm font-semibold text-white transition hover:border-[#9F6BFF] hover:bg-[#1A1A22]"
              >
                Explorar
              </a>
            </div>
          </div>
        </div>

        <section id="categorias" className="scroll-mt-8 py-12 sm:py-16">
          <div className="mb-6">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#9F6BFF]">
              Descubre
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Categorias
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {categories.map((category) => (
              <article
                key={category.title}
                className="rounded-lg border border-white/10 bg-[#1A1A22] p-5 transition hover:border-[#7B3FE4]/60"
              >
                <h3 className="text-lg font-semibold text-white">
                  {category.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  {category.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="mb-6">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#9F6BFF]">
              Proceso
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Como funciona
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {steps.map((step, index) => (
              <article
                key={step.title}
                className="border-t border-white/10 pt-5"
              >
                <span className="text-sm font-semibold text-[#7B3FE4]">
                  0{index + 1}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="py-12 sm:py-16">
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
      </section>
    </main>
  );
}
