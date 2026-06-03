"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ListingImage } from "@/app/listing-image";
import {
  formatListingLocation,
  getListingById,
  type Listing,
} from "@/lib/listings";

export function ListingDetail({ id }: { id: string }) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadListing() {
      try {
        const loadedListing = await getListingById(id);

        if (isMounted) {
          setListing(loadedListing);
        }
      } catch {
        if (isMounted) {
          setError("No pudimos cargar este anuncio. Intenta de nuevo mas tarde.");
        }
      } finally {
        if (isMounted) {
          setLoaded(true);
        }
      }
    }

    loadListing();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (!loaded) {
    return (
      <div className="rounded-lg border border-white/10 bg-[#1A1A22] p-5 text-sm text-zinc-400">
        Cargando anuncio...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-400/30 bg-red-950/20 p-5">
        <p className="text-sm font-semibold text-red-100">{error}</p>
        <Link
          href="/"
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-[#7B3FE4] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#9F6BFF]"
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="rounded-lg border border-white/10 bg-[#1A1A22] p-5">
        <p className="text-sm font-semibold text-white">
          Anuncio no encontrado
        </p>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Puede que el anuncio ya no exista o que el enlace sea incorrecto.
        </p>
        <Link
          href="/"
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-[#7B3FE4] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#9F6BFF]"
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <article className="rounded-lg border border-white/10 bg-[#1A1A22] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.34)] sm:p-6">
      {listing.imageUrls.length > 0 && (
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          {listing.imageUrls.map((imageUrl, index) => (
            <div
              key={imageUrl}
              className="relative aspect-[4/3] overflow-hidden rounded-md border border-white/10 bg-[#0B0B0F]"
            >
              <ListingImage
                src={imageUrl}
                alt={`${listing.title} foto ${index + 1}`}
                sizes="(max-width: 640px) 100vw, 33vw"
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <span className="rounded-full border border-[#7B3FE4]/40 px-3 py-1 text-xs font-semibold text-[#C7A8FF]">
          {listing.category}
        </span>
        {listing.subcategory && (
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-zinc-400">
            {listing.subcategory}
          </span>
        )}
        <Link
          href={`/?q=${encodeURIComponent(listing.city)}`}
          className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-zinc-400 transition hover:border-[#9F6BFF]/70 hover:text-[#C7A8FF]"
        >
          {formatListingLocation(listing)}
        </Link>
        {(listing.attendsTo ?? []).map((option) => (
          <span
            key={option}
            className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-zinc-400"
          >
            {option}
          </span>
        ))}
      </div>

      <h1 className="mt-5 text-3xl font-semibold leading-tight text-white sm:text-4xl">
        {listing.title}
      </h1>

      <p className="mt-5 text-base leading-7 text-zinc-300">
        {listing.description}
      </p>

      <div className="mt-6 rounded-md border border-[#7B3FE4]/35 bg-[#0B0B0F] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9F6BFF]">
          Contacto
        </p>
        <p className="mt-2 break-words text-sm font-semibold text-white">
          {listing.contact}
        </p>
      </div>
    </article>
  );
}
