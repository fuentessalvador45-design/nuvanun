"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ListingImage } from "@/app/listing-image";
import {
  formatListingLocation,
  getListings,
  listingCategories,
  type Listing,
} from "@/lib/listings";

export function ListingList() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todos");

  useEffect(() => {
    const query = new URLSearchParams(window.location.search).get("q");

    if (!query) {
      return;
    }

    const timeoutId = window.setTimeout(() => setSearch(query), 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadListings() {
      try {
        const loadedListings = await getListings();

        if (isMounted) {
          setListings(loadedListings);
        }
      } catch {
        if (isMounted) {
          setError("No pudimos cargar los anuncios. Intenta de nuevo mas tarde.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadListings();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-white/10 bg-[#1A1A22] p-5 text-sm text-zinc-400 shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
        Cargando anuncios...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-400/30 bg-red-950/20 p-5 text-sm text-red-100">
        {error}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="rounded-lg border border-white/10 bg-[#1A1A22] p-5 text-sm text-zinc-400 shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
        Todavia no hay anuncios publicados.
      </div>
    );
  }

  const normalizedSearch = search.trim().toLowerCase();
  const filteredListings = listings.filter((listing) => {
    const matchesCategory =
      categoryFilter === "Todos" || listing.category === categoryFilter;
    const searchableText = [
      listing.title,
      listing.category,
      listing.subcategory,
      listing.city,
      listing.zone,
      formatListingLocation(listing),
      listing.description,
      listing.contact,
      ...(listing.attendsTo ?? []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return matchesCategory && searchableText.includes(normalizedSearch);
  });

  function handleLocationFilter(city: string) {
    setSearch(city);
    window.history.replaceState(null, "", `/?q=${encodeURIComponent(city)}`);
  }

  return (
    <div>
      <div className="mb-5 grid gap-3 rounded-lg border border-white/10 bg-[#14141C] p-3 shadow-[0_18px_45px_rgba(0,0,0,0.2)] sm:grid-cols-[1fr_220px] sm:p-4">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por titulo, zona o descripcion"
          className="min-h-11 rounded-md border border-white/10 bg-[#0B0B0F] px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#9F6BFF]"
        />
        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          className="min-h-11 rounded-md border border-white/10 bg-[#0B0B0F] px-4 text-sm text-white outline-none transition focus:border-[#9F6BFF]"
        >
          <option value="Todos">Todas las categorias</option>
          {listingCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {filteredListings.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-[#1A1A22] p-5 text-sm text-zinc-400 shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
          No hay anuncios que coincidan con tu busqueda.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredListings.map((listing) => (
            <article
              key={listing.id}
              className="overflow-hidden rounded-lg border border-white/10 bg-[#15151D] shadow-[0_20px_55px_rgba(0,0,0,0.3)] transition hover:-translate-y-0.5 hover:border-[#7B3FE4]/70 hover:bg-[#1B1B25]"
            >
              <Link href={`/listing/${listing.id}`} className="block">
                <div className="relative aspect-[16/11] border-b border-white/10 bg-[#0B0B0F]">
                  {listing.isFeatured && (
                    <span className="absolute left-3 top-3 z-10 rounded-full border border-[#9F6BFF]/35 bg-[#0B0B0F]/80 px-3 py-1 text-xs font-semibold text-[#C7A8FF] backdrop-blur">
                      Destacado
                    </span>
                  )}
                  <ListingImage
                    src={listing.imageUrls[0]}
                    alt={listing.title}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    fallbackLabel="Sin foto principal"
                  />
                </div>
              </Link>
              <div className="p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleLocationFilter(listing.city)}
                    className="rounded-full border border-white/10 bg-[#0B0B0F]/70 px-3 py-1 text-left text-xs font-semibold text-zinc-200 transition hover:border-[#9F6BFF]/70 hover:text-[#C7A8FF]"
                  >
                    {formatListingLocation(listing)}
                  </button>
                  <span className="rounded-full border border-[#7B3FE4]/40 px-3 py-1 text-xs font-semibold text-[#C7A8FF]">
                    {listing.category}
                  </span>
                  {listing.subcategory && (
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-zinc-400">
                      {listing.subcategory}
                    </span>
                  )}
                </div>
                <Link href={`/listing/${listing.id}`} className="block">
                  <h3 className="mt-4 text-lg font-semibold leading-snug text-white">
                    {listing.title}
                  </h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-400">
                    {listing.description}
                  </p>
                  <p className="mt-5 text-sm font-semibold text-[#9F6BFF]">
                    Ver detalle
                  </p>
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
