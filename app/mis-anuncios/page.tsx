"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthStatus } from "@/app/auth-status";
import { useAuth } from "@/app/auth-provider";
import {
  formatListingLocation,
  getListingsByOwnerId,
  type Listing,
} from "@/lib/listings";

export default function MisAnunciosPage() {
  const { accessLevel, isLoading: isAuthLoading, user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      return;
    }

    let isMounted = true;
    const userId = user.id;

    async function loadListings() {
      setIsLoadingListings(true);
      setError("");

      try {
        const loadedListings = await getListingsByOwnerId(userId);

        if (isMounted) {
          setListings(loadedListings);
        }
      } catch {
        if (isMounted) {
          setError("No pudimos cargar tus anuncios. Intenta de nuevo mas tarde.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingListings(false);
        }
      }
    }

    loadListings();

    return () => {
      isMounted = false;
    };
  }, [user]);

  return (
    <main className="min-h-screen bg-[#0B0B0F] text-[#FFFFFF]">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between gap-4 py-2">
          <Link
            href="/"
            className="text-sm font-semibold tracking-[0.28em] text-white"
            aria-label="NUVANUN inicio"
          >
            NUVANUN
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/publish"
              className="rounded-full border border-[#7B3FE4]/45 px-4 py-2 text-xs font-semibold text-white transition hover:border-[#9F6BFF] hover:bg-[#1A1A22]"
            >
              Publicar
            </Link>
            <AuthStatus />
          </div>
        </header>

        <div className="flex flex-1 flex-col py-12 sm:py-16">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-[#9F6BFF]">
                Cuenta
              </p>
              <h1 className="mt-3 text-3xl font-semibold leading-tight text-white sm:text-4xl">
                Mis anuncios
              </h1>
            </div>
            <Link
              href="/"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-[#9F6BFF] hover:bg-[#1A1A22]"
            >
              Volver al inicio
            </Link>
          </div>

          {isAuthLoading && (
            <div className="rounded-lg border border-white/10 bg-[#1A1A22] p-5 text-sm text-zinc-400">
              Cargando sesion...
            </div>
          )}

          {!isAuthLoading && !user && (
            <section className="rounded-lg border border-white/10 bg-[#1A1A22] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.34)] sm:p-6">
              <p className="text-base font-semibold text-white">
                Registro con Google próximamente
              </p>
              <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">
                Esta sección permitirá administrar tus anuncios cuando el
                registro esté activo.
              </p>
              <button
                type="button"
                disabled
                className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-md bg-[#7B3FE4] px-5 py-3 text-sm font-semibold text-white shadow-[0_0_28px_rgba(123,63,228,0.26)] transition hover:bg-[#9F6BFF] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                Registro con Google próximamente
              </button>
            </section>
          )}

          {!isAuthLoading && user && (
            <section>
              {isLoadingListings && (
                <div className="rounded-lg border border-white/10 bg-[#1A1A22] p-5 text-sm text-zinc-400">
                  Cargando tus anuncios...
                </div>
              )}

              {error && (
                <div className="rounded-lg border border-red-400/30 bg-red-950/20 p-5 text-sm text-red-100">
                  {error}
                </div>
              )}

              {!isLoadingListings && !error && listings.length === 0 && (
                <div className="rounded-lg border border-white/10 bg-[#1A1A22] p-5 text-sm text-zinc-400">
                  Todavia no tienes anuncios asociados a esta cuenta.
                </div>
              )}

              {!isLoadingListings && !error && listings.length > 0 && (
                <div className="grid gap-5 sm:grid-cols-2">
                  {listings.map((listing) => (
                    <article
                      key={listing.id}
                      className="overflow-hidden rounded-lg border border-white/10 bg-[#15151D] shadow-[0_20px_55px_rgba(0,0,0,0.3)]"
                    >
                      <div className="relative aspect-[16/10] border-b border-white/10 bg-[#0B0B0F]">
                        {listing.imageUrls[0] ? (
                          <Image
                            src={listing.imageUrls[0]}
                            alt={listing.title}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full flex-col items-center justify-center px-5 text-center">
                            <span className="text-xs font-semibold uppercase tracking-[0.36em] text-[#7B3FE4]">
                              NUVANUN
                            </span>
                            <span className="mt-3 text-sm text-zinc-500">
                              Sin foto principal
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full border border-[#7B3FE4]/40 px-3 py-1 text-xs font-semibold text-[#C7A8FF]">
                            {listing.category}
                          </span>
                          <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-zinc-400">
                            {formatListingLocation(listing)}
                          </span>
                          <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-zinc-400">
                            {getListingStatus(listing, accessLevel)}
                          </span>
                        </div>
                        <h2 className="mt-4 text-lg font-semibold leading-snug text-white">
                          {listing.title}
                        </h2>
                        <Link
                          href={`/listing/${listing.id}`}
                          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md border border-[#7B3FE4]/45 px-4 py-2 text-sm font-semibold text-white transition hover:border-[#9F6BFF] hover:bg-[#1A1A22]"
                        >
                          Ver anuncio
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </section>
    </main>
  );
}

function getListingStatus(
  listing: Listing,
  accessLevel: "guest" | "registered" | "verified",
) {
  if (listing.userStatus === "invitado") {
    return "invitado";
  }

  return accessLevel === "verified" ? "verificado" : "registrado";
}
