"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { type ChangeEvent, type FormEvent, useState } from "react";
import {
  contactSubcategories,
  contentSubcategories,
  createListing,
  listingCategories,
  professionalAttendsToOptions,
  type Listing,
} from "@/lib/listings";

const fields = [
  {
    name: "title",
    label: "Titulo del anuncio",
    placeholder: "Ej. Servicio de fotografia local",
    type: "text",
  },
  {
    name: "zone",
    label: "Zona",
    placeholder: "Ciudad o colonia",
    type: "text",
  },
  {
    name: "contact",
    label: "Contacto",
    placeholder: "Telefono, email o red social",
    type: "text",
  },
] as const;

type ListingForm = Omit<Listing, "id" | "imageUrls">;

const initialForm: ListingForm = {
  title: "",
  category: "Contactos",
  subcategory: "",
  zone: "",
  description: "",
  contact: "",
  attendsTo: [],
};

export default function PublishPage() {
  const router = useRouter();
  const [form, setForm] = useState<ListingForm>(initialForm);
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: keyof ListingForm, value: string) {
    setForm((currentForm) => {
      if (field === "category") {
        return {
          ...currentForm,
          category: value,
          subcategory: "",
          attendsTo: [],
        };
      }

      return { ...currentForm, [field]: value };
    });
  }

  function toggleAttendsTo(option: string) {
    setForm((currentForm) => {
      const attendsTo = currentForm.attendsTo ?? [];

      return {
        ...currentForm,
        attendsTo: attendsTo.includes(option)
          ? attendsTo.filter((item) => item !== option)
          : [...attendsTo, option],
      };
    });
  }

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).slice(0, 3);

    if (files.length === 0) {
      previewUrls.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
      setImages([]);
      setPreviewUrls([]);
      return;
    }

    previewUrls.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
    setImages(files);
    setPreviewUrls(files.map((file) => URL.createObjectURL(file)));
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    const trimmedForm = {
      title: form.title.trim(),
      category: form.category.trim(),
      subcategory: form.subcategory?.trim(),
      zone: form.zone.trim(),
      description: form.description.trim(),
      contact: form.contact.trim(),
    };

    const needsSubcategory =
      trimmedForm.category === "Contactos" ||
      trimmedForm.category === "Contenido";

    if (
      !trimmedForm.title ||
      !trimmedForm.category ||
      !trimmedForm.zone ||
      !trimmedForm.description ||
      !trimmedForm.contact ||
      (needsSubcategory && !trimmedForm.subcategory)
    ) {
      setError("Completa todos los campos para publicar.");
      setIsSubmitting(false);
      return;
    }

    try {
      const listing = await createListing({
        ...trimmedForm,
        images,
        attendsTo: form.attendsTo,
      });
      router.push(`/listing/${listing.id}`);
    } catch {
      setError(
        "No se pudo publicar el anuncio. Revisa la conexion e intenta de nuevo.",
      );
      setIsSubmitting(false);
    }
  }

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
            href="/"
            className="rounded-full border border-[#7B3FE4]/45 px-4 py-2 text-xs font-semibold text-white transition hover:border-[#9F6BFF] hover:bg-[#1A1A22]"
          >
            Inicio
          </Link>
        </header>

        <div className="grid flex-1 items-center gap-8 py-12 lg:grid-cols-[0.85fr_1.15fr] lg:py-16">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-[#9F6BFF]">
              Fluye. Publica. Conecta.
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Publica tu anuncio en NUVANUN
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-zinc-300">
              Prepara la informacion principal de tu anuncio. Las fotos y datos
              se guardan temporalmente en este navegador.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-lg border border-white/10 bg-[#1A1A22] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.34)] sm:p-6"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map((field) => (
                <label key={field.label} className="block">
                  <span className="text-sm font-medium text-white">
                    {field.label}
                  </span>
                  <input
                    type={field.type}
                    value={form[field.name]}
                    onChange={(event) =>
                      updateField(field.name, event.target.value)
                    }
                    placeholder={field.placeholder}
                    className="mt-2 min-h-12 w-full rounded-md border border-white/10 bg-[#0B0B0F] px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#9F6BFF]"
                  />
                </label>
              ))}
            </div>

            <label className="mt-4 block">
              <span className="text-sm font-medium text-white">
                Categoria
              </span>
              <select
                value={form.category}
                onChange={(event) => updateField("category", event.target.value)}
                className="mt-2 min-h-12 w-full rounded-md border border-white/10 bg-[#0B0B0F] px-4 text-sm text-white outline-none transition focus:border-[#9F6BFF]"
              >
                {listingCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            {form.category !== "Profesionales" && (
              <label className="mt-4 block">
                <span className="text-sm font-medium text-white">
                  Subcategoria
                </span>
                <select
                  value={form.subcategory ?? ""}
                  onChange={(event) =>
                    updateField("subcategory", event.target.value)
                  }
                  className="mt-2 min-h-12 w-full rounded-md border border-white/10 bg-[#0B0B0F] px-4 text-sm text-white outline-none transition focus:border-[#9F6BFF]"
                >
                  <option value="">Selecciona una opcion</option>
                  {(form.category === "Contactos"
                    ? contactSubcategories
                    : contentSubcategories
                  ).map((subcategory) => (
                    <option key={subcategory} value={subcategory}>
                      {subcategory}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {form.category === "Profesionales" && (
              <div className="mt-4">
                <p className="text-sm font-medium text-white">Atiende a</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  {professionalAttendsToOptions.map((option) => (
                    <label
                      key={option}
                      className="flex min-h-11 items-center gap-3 rounded-md border border-white/10 bg-[#0B0B0F] px-4 text-sm text-zinc-300"
                    >
                      <input
                        type="checkbox"
                        checked={(form.attendsTo ?? []).includes(option)}
                        onChange={() => toggleAttendsTo(option)}
                        className="h-4 w-4 accent-[#7B3FE4]"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <label className="mt-4 block">
              <span className="text-sm font-medium text-white">
                Descripcion
              </span>
              <textarea
                placeholder="Describe lo que ofreces o necesitas de forma clara."
                rows={6}
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                className="mt-2 w-full resize-none rounded-md border border-white/10 bg-[#0B0B0F] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-zinc-600 focus:border-[#9F6BFF]"
              />
            </label>

            <label className="mt-4 block">
              <span className="text-sm font-medium text-white">
                Fotos del anuncio
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="mt-2 min-h-12 w-full rounded-md border border-white/10 bg-[#0B0B0F] px-4 py-3 text-sm text-zinc-300 outline-none transition file:mr-4 file:rounded-md file:border-0 file:bg-[#7B3FE4] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#9F6BFF] focus:border-[#9F6BFF]"
              />
              <span className="mt-2 block text-xs leading-5 text-zinc-500">
                Hasta 3 fotos. Se mostraran en el anuncio publicado.
              </span>
            </label>

            {previewUrls.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {previewUrls.map((imageUrl, index) => (
                  <div
                    key={imageUrl}
                    className="relative aspect-square overflow-hidden rounded-md border border-white/10 bg-[#0B0B0F]"
                  >
                    <Image
                      src={imageUrl}
                      alt={`Foto seleccionada ${index + 1}`}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 rounded-md border border-[#7B3FE4]/35 bg-[#0B0B0F] p-4">
              <p className="text-sm font-semibold text-white">
                {form.title || "Vista previa del anuncio"}
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                {form.description ||
                  "Tu anuncio aparecera con el estilo oscuro premium de NUVANUN, usando acentos violeta y contenido facil de escanear."}
              </p>
              {(form.category || form.zone) && (
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#9F6BFF]">
                  {[form.category, form.subcategory, form.zone]
                    .filter(Boolean)
                    .join(" / ")}
                </p>
              )}
              {form.category === "Profesionales" &&
                (form.attendsTo ?? []).length > 0 && (
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                    Atiende a {(form.attendsTo ?? []).join(", ")}
                  </p>
                )}
            </div>

            {error && (
              <p className="mt-4 rounded-md border border-red-400/30 bg-red-950/30 px-4 py-3 text-sm text-red-200">
                {error}
              </p>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex min-h-12 flex-1 items-center justify-center rounded-md bg-[#7B3FE4] px-5 py-3 text-sm font-semibold text-white shadow-[0_0_28px_rgba(123,63,228,0.26)] transition hover:bg-[#9F6BFF] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Publicando..." : "Publicar anuncio"}
              </button>
              <Link
                href="/"
                className="inline-flex min-h-12 items-center justify-center rounded-md border border-[#7B3FE4]/45 px-5 py-3 text-sm font-semibold text-white transition hover:border-[#9F6BFF] hover:bg-[#0B0B0F]"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
