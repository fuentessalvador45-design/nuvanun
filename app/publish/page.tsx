"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AuthStatus } from "@/app/auth-status";
import { useAuth } from "@/app/auth-provider";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  contactSubcategories,
  contentSubcategories,
  createListing,
  formatListingLocation,
  listingCategories,
  locationCities,
  maxListingImages,
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
    name: "contact",
    label: "Contacto",
    placeholder: "Telefono, email o red social",
    type: "text",
  },
] as const;

type ListingForm = Omit<Listing, "id" | "imageUrls">;
type SelectedImage = {
  file: File;
  previewUrl: string;
};
type PublishAction = "guest" | "registered";
type ContactMethod = "Correo" | "WhatsApp" | "Ambos";
type RegisterForm = {
  nombreVisible: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  contactMethod: ContactMethod;
};

const ageConfirmationMessage =
  "Para publicar anuncios en NUVANUN debes confirmar que eres mayor de edad.";
const maxListingImagesMessage = "Máximo 5 fotos por anuncio.";

const initialForm: ListingForm = {
  title: "",
  category: "Contactos",
  subcategory: "",
  city: "",
  zone: "",
  description: "",
  contact: "",
  attendsTo: [],
};

const initialRegisterForm: RegisterForm = {
  nombreVisible: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
  contactMethod: "Ambos",
};

export default function PublishPage() {
  const router = useRouter();
  const { accessLevel, user } = useAuth();
  const [form, setForm] = useState<ListingForm>(initialForm);
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [coverImageIndex, setCoverImageIndex] = useState(0);
  const [isAgeConfirmed, setIsAgeConfirmed] = useState(false);
  const [isRegisterSectionOpen, setIsRegisterSectionOpen] = useState(false);
  const [registerForm, setRegisterForm] =
    useState<RegisterForm>(initialRegisterForm);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingAction, setSubmittingAction] =
    useState<PublishAction | null>(null);
  const previewUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((previewUrl) =>
        URL.revokeObjectURL(previewUrl),
      );
    };
  }, []);

  useEffect(() => {
    previewUrlsRef.current = images.map((image) => image.previewUrl);
  }, [images]);

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

  function updateRegisterField(
    field: keyof RegisterForm,
    value: string | ContactMethod,
  ) {
    setRegisterForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
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

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const availableSlots = maxListingImages - images.length;

    if (availableSlots <= 0) {
      setError(maxListingImagesMessage);
      event.target.value = "";
      return;
    }

    const selectedFiles = Array.from(event.target.files ?? []);
    const files = selectedFiles.slice(0, availableSlots);

    if (files.length === 0) {
      event.target.value = "";
      return;
    }

    setImages((currentImages) => [
      ...currentImages,
      ...files.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    ]);
    setError(
      selectedFiles.length > availableSlots ? maxListingImagesMessage : "",
    );
    event.target.value = "";
  }

  function removeImage(index: number) {
    const imageToRemove = images[index];

    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.previewUrl);
    }

    const nextImages = images.filter((_, imageIndex) => imageIndex !== index);

    setImages(nextImages);
    setCoverImageIndex((currentIndex) => {
      if (nextImages.length <= 1 || currentIndex === index) {
        return 0;
      }

      return currentIndex > index ? currentIndex - 1 : currentIndex;
    });
    setError("");
  }

  function getOrderedImages() {
    if (images.length <= 1) {
      return images.map((image) => image.file);
    }

    const coverImage = images[coverImageIndex];

    if (!coverImage) {
      return images.map((image) => image.file);
    }

    return [
      coverImage.file,
      ...images
        .filter((_, imageIndex) => imageIndex !== coverImageIndex)
        .map((image) => image.file),
    ];
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const nativeEvent = event.nativeEvent as SubmitEvent;
    const submitter = nativeEvent.submitter as HTMLButtonElement | null;
    const action = submitter?.value === "registered" ? "registered" : "guest";

    if (!isAgeConfirmed) {
      setError(ageConfirmationMessage);
      return;
    }

    setIsSubmitting(true);
    setSubmittingAction(action);

    const trimmedForm = {
      title: form.title.trim(),
      category: form.category.trim(),
      subcategory: form.subcategory?.trim(),
      city: form.city.trim(),
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
      !trimmedForm.city ||
      !trimmedForm.description ||
      !trimmedForm.contact ||
      (needsSubcategory && !trimmedForm.subcategory)
    ) {
      setError("Completa todos los campos para publicar.");
      setIsSubmitting(false);
      setSubmittingAction(null);
      return;
    }

    const trimmedRegisterForm = {
      nombreVisible: registerForm.nombreVisible.trim(),
      email: registerForm.email.trim(),
      password: registerForm.password,
      confirmPassword: registerForm.confirmPassword,
      phone: registerForm.phone.trim(),
      contactMethod: registerForm.contactMethod,
    };

    if (action === "registered") {
      if (
        !trimmedRegisterForm.nombreVisible ||
        !trimmedRegisterForm.email ||
        !trimmedRegisterForm.password ||
        !trimmedRegisterForm.confirmPassword
      ) {
        setError("Completa los datos de registro para crear tu cuenta.");
        setIsSubmitting(false);
        setSubmittingAction(null);
        return;
      }

      if (trimmedRegisterForm.password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres.");
        setIsSubmitting(false);
        setSubmittingAction(null);
        return;
      }

      if (trimmedRegisterForm.password !== trimmedRegisterForm.confirmPassword) {
        setError("Las contraseñas no coinciden.");
        setIsSubmitting(false);
        setSubmittingAction(null);
        return;
      }
    }

    try {
      const shouldAssociateWithUser = Boolean(user) || action === "registered";
      const registeredUserId =
        action === "registered" && !user
          ? await createAccountIfAvailable(trimmedRegisterForm)
          : undefined;
      const listing = await createListing({
        ...trimmedForm,
        images: getOrderedImages(),
        attendsTo: form.attendsTo,
        ownerId: shouldAssociateWithUser
          ? user?.id ?? registeredUserId
          : undefined,
        userStatus: shouldAssociateWithUser ? "registrado" : "invitado",
        nombreVisible:
          action === "registered" ? trimmedRegisterForm.nombreVisible : undefined,
        emailContact:
          action === "registered" ? trimmedRegisterForm.email : undefined,
        phoneContact:
          action === "registered" ? trimmedRegisterForm.phone : undefined,
        contactMethod:
          action === "registered"
            ? trimmedRegisterForm.contactMethod
            : inferContactMethod(trimmedForm.contact),
      });
      router.push(`/listing/${listing.id}`);
    } catch (caughtError) {
      if (caughtError instanceof Error) {
        setError(caughtError.message);
      } else {
        setError(
          "No se pudo publicar el anuncio. Si agregaste fotos, intenta con archivos mas ligeros.",
        );
      }
      setIsSubmitting(false);
      setSubmittingAction(null);
    }
  }

  async function createAccountIfAvailable(accountForm: {
    nombreVisible: string;
    email: string;
    password: string;
    phone: string;
    contactMethod: ContactMethod;
  }) {
    if (!supabase || !isSupabaseConfigured()) {
      return undefined;
    }

    const { data, error: authError } = await supabase.auth.signUp({
      email: accountForm.email,
      password: accountForm.password,
      options: {
        data: {
          full_name: accountForm.nombreVisible,
          phone: accountForm.phone,
          preferred_contact_method: accountForm.contactMethod,
        },
      },
    });

    if (authError) {
      throw new Error(authError.message || "No se pudo crear la cuenta.");
    }

    return data.user?.id;
  }

  function inferContactMethod(contact: string): ContactMethod | undefined {
    const normalizedContact = contact.toLowerCase();
    const hasEmail = /\S+@\S+\.\S+/.test(normalizedContact);
    const hasPhone =
      /whatsapp|wa\.me/.test(normalizedContact) ||
      normalizedContact.replace(/\D/g, "").length >= 8;

    if (hasEmail && hasPhone) {
      return "Ambos";
    }

    if (hasEmail) {
      return "Correo";
    }

    if (hasPhone) {
      return "WhatsApp";
    }

    return undefined;
  }

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
              href="/"
              className="rounded-full border border-[#7B3FE4]/45 px-4 py-2 text-xs font-semibold text-white transition hover:border-[#9F6BFF] hover:bg-[#1A1A22]"
            >
              Inicio
            </Link>
            <AuthStatus />
          </div>
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
            <div className="mt-5 max-w-lg rounded-md border border-white/10 bg-[#15151D] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C7A8FF]">
                Estado de cuenta
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-300">
                {accessLevel === "guest" &&
                  "Invitado: puedes publicar y navegar sin iniciar sesion."}
                {accessLevel === "registered" &&
                  "Registrado: este anuncio quedara preparado para asociarse a tu usuario."}
                {accessLevel === "verified" &&
                  "Verificado: tu perfil esta listo para futuras funciones de confianza."}
              </p>
            </div>
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

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-white">
                  Ciudad o Municipio
                </span>
                <select
                  value={form.city}
                  onChange={(event) => updateField("city", event.target.value)}
                  className="mt-2 min-h-12 w-full rounded-md border border-white/10 bg-[#0B0B0F] px-4 text-sm text-white outline-none transition focus:border-[#9F6BFF]"
                >
                  <option value="">Selecciona una opción</option>
                  {locationCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-white">
                  Colonia o Zona
                </span>
                <input
                  type="text"
                  value={form.zone}
                  onChange={(event) => updateField("zone", event.target.value)}
                  placeholder="Ej. Centro, Reforma, Volcanes, Candiani, San Felipe"
                  className="mt-2 min-h-12 w-full rounded-md border border-white/10 bg-[#0B0B0F] px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#9F6BFF]"
                />
              </label>
            </div>

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
                disabled={images.length >= maxListingImages}
                className="mt-2 min-h-12 w-full rounded-md border border-white/10 bg-[#0B0B0F] px-4 py-3 text-sm text-zinc-300 outline-none transition file:mr-4 file:rounded-md file:border-0 file:bg-[#7B3FE4] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#9F6BFF] focus:border-[#9F6BFF]"
              />
              <span className="mt-2 block text-xs leading-5 text-zinc-500">
                Sube hasta 5 fotos. La primera será la portada principal.
              </span>
              <span className="mt-1 block text-xs font-semibold text-zinc-400">
                {images.length}/{maxListingImages} fotos seleccionadas
              </span>
            </label>

            {images.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-white">
                  Selecciona la foto principal del anuncio
                </p>
                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  La foto marcada como Portada será la primera que aparecerá en
                  el anuncio.
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {images.map((image, index) => {
                    const isCover = coverImageIndex === index;

                    return (
                      <div key={image.previewUrl} className="space-y-2">
                        <button
                          type="button"
                          onClick={() => setCoverImageIndex(index)}
                          className={`relative aspect-square w-full overflow-hidden rounded-md border bg-[#0B0B0F] text-left transition ${
                            isCover
                              ? "border-[#9F6BFF] ring-2 ring-[#7B3FE4]/45"
                              : "border-white/10 hover:border-[#7B3FE4]/65"
                          }`}
                          aria-pressed={isCover}
                          aria-label={`Seleccionar foto ${index + 1} como portada`}
                        >
                          <Image
                            src={image.previewUrl}
                            alt={`Foto seleccionada ${index + 1}`}
                            fill
                            sizes="(max-width: 640px) 50vw, 160px"
                            unoptimized
                            className="object-cover"
                          />
                          {isCover && (
                            <span className="absolute left-2 top-2 rounded-full bg-[#7B3FE4] px-2 py-1 text-[11px] font-semibold text-white shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
                              Portada
                            </span>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="min-h-10 w-full rounded-md border border-white/10 px-3 text-xs font-semibold text-zinc-300 transition hover:border-red-300/60 hover:bg-red-950/30 hover:text-red-100"
                        >
                          Quitar foto
                        </button>
                      </div>
                    );
                  })}
                </div>
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
              {(form.category || form.city || form.zone) && (
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#9F6BFF]">
                  {[
                    form.category,
                    form.subcategory,
                    formatListingLocation({
                      city: form.city,
                      zone: form.zone,
                    }),
                  ]
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

            <label className="mt-5 flex items-start gap-3 rounded-md border border-white/10 bg-[#0B0B0F] p-4 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={isAgeConfirmed}
                onChange={(event) => {
                  setIsAgeConfirmed(event.target.checked);

                  if (event.target.checked && error === ageConfirmationMessage) {
                    setError("");
                  }
                }}
                className="mt-1 h-4 w-4 shrink-0 accent-[#7B3FE4]"
              />
              <span>
                <span className="block font-semibold text-white">
                  Confirmo que tengo 18 años o más.
                </span>
                <span className="mt-1 block leading-5 text-zinc-500">
                  Para publicar anuncios en NUVANUN debes confirmar que eres
                  mayor de edad.
                </span>
              </span>
            </label>

            <div className="mt-6 grid gap-3 lg:grid-cols-2">
              <section className="rounded-md border border-[#7B3FE4]/45 bg-[#0B0B0F] p-4">
                <p className="text-sm font-semibold text-white">
                  Registrarme y publicar
                </p>
                <p className="mt-2 text-xs leading-5 text-zinc-400">
                  Crea tu cuenta para guardar tus datos de contacto y preparar
                  futuras funciones como mis anuncios, edición y verificación.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterSectionOpen(true);

                    if (!isAgeConfirmed) {
                      setError(ageConfirmationMessage);
                    }
                  }}
                  disabled={isSubmitting}
                  className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-md bg-[#7B3FE4] px-5 py-3 text-sm font-semibold text-white shadow-[0_0_28px_rgba(123,63,228,0.26)] transition hover:bg-[#9F6BFF] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Registrarme y publicar
                </button>
              </section>

              <section className="rounded-md border border-white/10 bg-[#0B0B0F] p-4">
                <p className="text-sm font-semibold text-white">
                  Publicar sin registro
                </p>
                <p className="mt-2 text-xs leading-5 text-zinc-400">
                  Publicación rápida sin crear cuenta. No podrás administrar
                  este anuncio después.
                </p>
                <button
                  type="submit"
                  name="publishAction"
                  value="guest"
                  onClick={() => {
                    if (!isAgeConfirmed) {
                      setError(ageConfirmationMessage);
                    }
                  }}
                  disabled={!isAgeConfirmed || isSubmitting}
                  className={`mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-md border border-[#7B3FE4]/45 px-5 py-3 text-sm font-semibold text-white transition hover:border-[#9F6BFF] hover:bg-[#1A1A22] disabled:cursor-not-allowed disabled:opacity-60 ${
                    !isAgeConfirmed ? "pointer-events-none" : ""
                  }`}
                >
                  {isSubmitting && submittingAction === "guest"
                    ? "Publicando..."
                    : "Publicar sin registro"}
                </button>
              </section>
            </div>

            {isRegisterSectionOpen && (
              <section className="mt-4 rounded-md border border-[#7B3FE4]/35 bg-[#0B0B0F] p-4">
                <p className="text-sm font-semibold text-white">
                  Datos para crear tu cuenta
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-medium text-white">
                      Nombre visible
                    </span>
                    <input
                      type="text"
                      value={registerForm.nombreVisible}
                      onChange={(event) =>
                        updateRegisterField("nombreVisible", event.target.value)
                      }
                      className="mt-2 min-h-12 w-full rounded-md border border-white/10 bg-[#15151D] px-4 text-sm text-white outline-none transition focus:border-[#9F6BFF]"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-white">
                      Correo electrónico
                    </span>
                    <input
                      type="email"
                      value={registerForm.email}
                      onChange={(event) =>
                        updateRegisterField("email", event.target.value)
                      }
                      className="mt-2 min-h-12 w-full rounded-md border border-white/10 bg-[#15151D] px-4 text-sm text-white outline-none transition focus:border-[#9F6BFF]"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-white">
                      Contraseña
                    </span>
                    <input
                      type="password"
                      value={registerForm.password}
                      onChange={(event) =>
                        updateRegisterField("password", event.target.value)
                      }
                      className="mt-2 min-h-12 w-full rounded-md border border-white/10 bg-[#15151D] px-4 text-sm text-white outline-none transition focus:border-[#9F6BFF]"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-white">
                      Confirmar contraseña
                    </span>
                    <input
                      type="password"
                      value={registerForm.confirmPassword}
                      onChange={(event) =>
                        updateRegisterField(
                          "confirmPassword",
                          event.target.value,
                        )
                      }
                      className="mt-2 min-h-12 w-full rounded-md border border-white/10 bg-[#15151D] px-4 text-sm text-white outline-none transition focus:border-[#9F6BFF]"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-white">
                      Teléfono / WhatsApp opcional
                    </span>
                    <input
                      type="tel"
                      value={registerForm.phone}
                      onChange={(event) =>
                        updateRegisterField("phone", event.target.value)
                      }
                      className="mt-2 min-h-12 w-full rounded-md border border-white/10 bg-[#15151D] px-4 text-sm text-white outline-none transition focus:border-[#9F6BFF]"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-white">
                      Método de contacto
                    </span>
                    <select
                      value={registerForm.contactMethod}
                      onChange={(event) =>
                        updateRegisterField(
                          "contactMethod",
                          event.target.value as ContactMethod,
                        )
                      }
                      className="mt-2 min-h-12 w-full rounded-md border border-white/10 bg-[#15151D] px-4 text-sm text-white outline-none transition focus:border-[#9F6BFF]"
                    >
                      <option value="Correo">Correo</option>
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Ambos">Ambos</option>
                    </select>
                  </label>
                </div>
                <button
                  type="submit"
                  name="publishAction"
                  value="registered"
                  disabled={!isAgeConfirmed || isSubmitting}
                  className={`mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-md bg-[#7B3FE4] px-5 py-3 text-sm font-semibold text-white shadow-[0_0_28px_rgba(123,63,228,0.26)] transition hover:bg-[#9F6BFF] disabled:cursor-not-allowed disabled:opacity-60 ${
                    !isAgeConfirmed ? "pointer-events-none" : ""
                  }`}
                >
                  {isSubmitting && submittingAction === "registered"
                    ? "Creando cuenta..."
                    : "Crear cuenta y publicar"}
                </button>
              </section>
            )}

            <Link
              href="/"
              className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-md border border-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:border-[#9F6BFF] hover:bg-[#0B0B0F]"
            >
              Cancelar
            </Link>
          </form>
        </div>
      </section>
    </main>
  );
}
