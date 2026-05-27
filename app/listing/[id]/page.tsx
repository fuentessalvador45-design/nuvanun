import Link from "next/link";
import { ListingDetail } from "./listing-detail";

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-[#0B0B0F] text-[#FFFFFF]">
      <section className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-5 py-6 sm:px-8 lg:px-10">
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

        <div className="flex flex-1 flex-col justify-center py-12 sm:py-16">
          <Link
            href="/"
            className="mb-6 text-sm font-semibold text-[#9F6BFF] transition hover:text-[#C7A8FF]"
          >
            Volver a anuncios
          </Link>
          <ListingDetail id={id} />
        </div>
      </section>
    </main>
  );
}
