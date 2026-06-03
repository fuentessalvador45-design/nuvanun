import { getSupabaseClient, isSupabaseConfigured } from "./supabase";

const storageKey = "nuvanun:listings";
const listingImagesBucket = "listing-images";
export const maxListingImages = 5;

export const listingCategories = ["Contactos", "Profesionales", "Contenido"];

export const contactSubcategories = [
  "Hombre busca mujer",
  "Mujer busca hombre",
  "Hombre busca hombre",
  "Mujer busca mujer",
  "Pareja busca pareja",
  "Pareja busca hombre",
  "Pareja busca mujer",
];

export const contentSubcategories = ["Fotos", "Video"];

export const professionalAttendsToOptions = ["Mujeres", "Hombres", "Parejas"];

export const locationCities = [
  "Oaxaca de Juárez",
  "Santa Cruz Xoxocotlán",
  "Santa Lucía del Camino",
  "San Jacinto Amilpas",
  "Tlacolula",
  "Etla",
  "Juchitán",
  "Salina Cruz",
  "Puerto Escondido",
  "Huatulco",
  "Tuxtepec",
  "Otro",
];

export type Listing = {
  id: string;
  ownerId?: string;
  title: string;
  category: string;
  subcategory?: string;
  city: string;
  zone: string;
  description: string;
  contact: string;
  imageUrls: string[];
  attendsTo?: string[];
  userStatus?: "invitado" | "registrado";
  nombreVisible?: string;
  emailContact?: string;
  phoneContact?: string;
  contactMethod?: string;
  isFeatured?: boolean;
};

export type NewListingInput = {
  title: string;
  category: string;
  subcategory?: string;
  city: string;
  zone: string;
  description: string;
  contact: string;
  images: File[];
  attendsTo?: string[];
  ownerId?: string;
  userStatus?: "invitado" | "registrado";
  nombreVisible?: string;
  emailContact?: string;
  phoneContact?: string;
  contactMethod?: string;
};

const mockListings: Listing[] = [
  {
    id: "mock-fotografia-local",
    title: "Servicio de fotografia local",
    category: "Profesionales",
    city: "Oaxaca de Juárez",
    zone: "Centro",
    description:
      "Sesiones para eventos pequenos, retratos y contenido para negocios locales.",
    contact: "fotografia@nuvanun.local",
    imageUrls: [],
    attendsTo: ["Mujeres", "Hombres", "Parejas"],
  },
  {
    id: "mock-contacto-cafe",
    title: "Busco conectar para salir por cafe",
    category: "Contactos",
    subcategory: "Mujer busca hombre",
    city: "Oaxaca de Juárez",
    zone: "Reforma",
    description:
      "Plan tranquilo para conversar, caminar y conocer personas cercanas.",
    contact: "@contacto.local",
    imageUrls: [],
  },
  {
    id: "mock-contenido-fotos",
    title: "Contenido visual para redes",
    category: "Contenido",
    subcategory: "Fotos",
    city: "Santa Lucía del Camino",
    zone: "Centro",
    description:
      "Paquetes de fotos para perfiles, productos y presencia digital local.",
    contact: "contenido@nuvanun.local",
    imageUrls: [],
  },
];

export async function getListings(): Promise<Listing[]> {
  if (isSupabaseConfigured()) {
    const remoteListings = await getRemoteListings();

    return dedupeListings([...remoteListings, ...mockListings]).map(
      normalizeListing,
    );
  }

  return dedupeListings([
    ...getStoredListings(),
    ...mockListings,
  ]).map(normalizeListing);
}

export async function getListingById(id: string): Promise<Listing | null> {
  const listings = await getListings();
  return listings.find((listing) => listing.id === id) ?? null;
}

export async function getListingsByOwnerId(ownerId: string): Promise<Listing[]> {
  const listings = await getListings();

  return listings.filter((listing) => listing.ownerId === ownerId);
}

export async function createListing(input: NewListingInput): Promise<Listing> {
  const images = input.images.slice(0, maxListingImages);

  if (isSupabaseConfigured()) {
    return createRemoteListing(input, images);
  }

  const imageUrls = await Promise.all(images.map(readFileAsDataUrl));
  const listing: Listing = {
    id: `local-${crypto.randomUUID()}`,
    title: input.title,
    ownerId: input.ownerId,
    category: input.category,
    subcategory: input.subcategory,
    city: input.city,
    zone: input.zone,
    description: input.description,
    contact: input.contact,
    imageUrls,
    attendsTo: input.attendsTo ?? [],
    userStatus: input.userStatus ?? "invitado",
    nombreVisible: input.nombreVisible,
    emailContact: input.emailContact,
    phoneContact: input.phoneContact,
    contactMethod: input.contactMethod,
  };

  storeListing(listing);

  return listing;
}

async function getRemoteListings(): Promise<Listing[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from("listings").select("*");

    if (error || !data) {
      throw new Error(getSupabaseErrorMessage(error, "leer anuncios"));
    }

    return data
      .map(mapRemoteListing)
      .filter((listing): listing is Listing => Boolean(listing));
  } catch (error) {
    throw new Error(getUnknownErrorMessage(error, "leer anuncios"));
  }
}

async function createRemoteListing(
  input: NewListingInput,
  images: File[],
): Promise<Listing> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase no esta configurado.");
  }

  try {
    const imageUrls = await uploadListingImages(images);
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("listings")
      .insert({
        owner_id: input.ownerId,
        title: input.title,
        category: input.category,
        subcategory: input.subcategory,
        city: input.city,
        zone: input.zone,
        description: input.description,
        contact: input.contact,
        image_urls: imageUrls,
        attends_to: input.attendsTo ?? [],
        user_status: input.userStatus ?? "invitado",
        nombre_visible: input.nombreVisible,
        email_contact: input.emailContact,
        phone_contact: input.phoneContact,
        contact_method: input.contactMethod,
      })
      .select("*")
      .single();

    if (!error && data) {
      const listing = withInputMetadata(mapRemoteListing(data), input);

      if (listing) {
        return listing;
      }

      throw new Error("Supabase devolvio un anuncio con campos incompletos.");
    }

    throw new Error(getSupabaseErrorMessage(error, "publicar el anuncio"));
  } catch (error) {
    throw new Error(getUnknownErrorMessage(error, "publicar el anuncio"));
  }
}

async function uploadListingImages(images: File[]): Promise<string[]> {
  const supabase = getSupabaseClient();

  return Promise.all(
    images.slice(0, maxListingImages).map(async (image) => {
      const path = `listings/${crypto.randomUUID()}.${getFileExtension(image)}`;
      const { error } = await supabase.storage
        .from(listingImagesBucket)
        .upload(path, image, {
          contentType: image.type || "image/jpeg",
          upsert: false,
        });

      if (error) {
        throw new Error(
          `No se pudo subir "${image.name}" al bucket ${listingImagesBucket}: ${getSupabaseErrorMessage(error, "subir la foto")}`,
        );
      }

      const { data } = supabase.storage
        .from(listingImagesBucket)
        .getPublicUrl(path);

      if (!data.publicUrl) {
        throw new Error(
          `Supabase no devolvio URL publica para "${image.name}" en ${listingImagesBucket}.`,
        );
      }

      return data.publicUrl;
    }),
  );
}

function storeListing(listing: Listing) {
  const storedListings = getStoredListings();

  try {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify([listing, ...storedListings]),
    );
  } catch {
    throw new Error(
      "No se pudo guardar el anuncio. Reduce el tamano o la cantidad de fotos e intenta de nuevo.",
    );
  }
}

function getStoredListings() {
  if (typeof window === "undefined") {
    return [];
  }

  const storedListings = window.localStorage.getItem(storageKey);

  if (!storedListings) {
    return [];
  }

  try {
    return (JSON.parse(storedListings) as Listing[]).map(normalizeListing);
  } catch {
    return [];
  }
}

function normalizeListing(listing: Listing): Listing {
  const parsedLocation = parseLegacyLocation(listing.zone);
  const city = listing.city || parsedLocation.city || listing.zone;
  const zone = listing.city ? listing.zone : parsedLocation.zone;

  return {
    ...listing,
    city,
    zone,
    imageUrls: Array.isArray(listing.imageUrls) ? listing.imageUrls : [],
    attendsTo: Array.isArray(listing.attendsTo) ? listing.attendsTo : [],
  };
}

function dedupeListings(listings: Listing[]) {
  const seenIds = new Set<string>();

  return listings.filter((listing) => {
    if (seenIds.has(listing.id)) {
      return false;
    }

    seenIds.add(listing.id);
    return true;
  });
}

function mapRemoteListing(record: Record<string, unknown>): Listing | null {
  const id = getString(record.id);
  const title = getString(record.title);
  const category = getString(record.category);
  const city = getString(record.city);
  const zone = getString(record.zone);
  const description = getString(record.description);
  const contact = getString(record.contact);

  if (!id || !title || !category || !description || !contact) {
    return null;
  }

  return normalizeListing({
    id,
    ownerId: getString(record.owner_id) || getString(record.user_id) || undefined,
    title,
    category,
    subcategory: getString(record.subcategory) || undefined,
    city,
    zone,
    description,
    contact,
    imageUrls: getStringArray(record.image_urls),
    attendsTo: getStringArray(record.attends_to),
    userStatus: getUserStatus(record.user_status),
    nombreVisible: getString(record.nombre_visible) || undefined,
    emailContact: getString(record.email_contact) || undefined,
    phoneContact: getString(record.phone_contact) || undefined,
    contactMethod: getString(record.contact_method) || undefined,
    isFeatured: record.is_featured === true,
  });
}

function withInputMetadata(
  listing: Listing | null,
  input: NewListingInput,
): Listing | null {
  if (!listing) {
    return null;
  }

  return {
    ...listing,
    ownerId: listing.ownerId ?? input.ownerId,
    userStatus: listing.userStatus ?? input.userStatus ?? "invitado",
    nombreVisible: listing.nombreVisible ?? input.nombreVisible,
    emailContact: listing.emailContact ?? input.emailContact,
    phoneContact: listing.phoneContact ?? input.phoneContact,
    contactMethod: listing.contactMethod ?? input.contactMethod,
  };
}

export function formatListingLocation(listing: Pick<Listing, "city" | "zone">) {
  return [listing.city, listing.zone].filter(Boolean).join(" · ");
}

function parseLegacyLocation(location: string) {
  const [city = "", ...zoneParts] = location.split(" · ");

  return {
    city,
    zone: zoneParts.join(" · "),
  };
}

function getString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function getStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function getUserStatus(value: unknown) {
  if (value === "registrado" || value === "invitado") {
    return value;
  }

  return undefined;
}

function getSupabaseErrorMessage(error: unknown, action: string) {
  if (error && typeof error === "object" && "message" in error) {
    const message = String(error.message);

    if (message) {
      return `Supabase no pudo ${action}: ${message}`;
    }
  }

  return `Supabase no pudo ${action}.`;
}

function getUnknownErrorMessage(error: unknown, action: string) {
  if (error instanceof Error) {
    return error.message;
  }

  return `Supabase no pudo ${action}.`;
}

function getFileExtension(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension && /^[a-z0-9]+$/.test(extension)) {
    return extension;
  }

  return "jpg";
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
