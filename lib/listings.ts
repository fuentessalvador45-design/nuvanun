import { getSupabaseClient, isSupabaseConfigured } from "./supabase";

const storageKey = "nuvanun:listings";
const listingImagesBucket = "listing-images";

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

export type Listing = {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
  zone: string;
  description: string;
  contact: string;
  imageUrls: string[];
  attendsTo?: string[];
};

export type NewListingInput = {
  title: string;
  category: string;
  subcategory?: string;
  zone: string;
  description: string;
  contact: string;
  images: File[];
  attendsTo?: string[];
};

const mockListings: Listing[] = [
  {
    id: "mock-fotografia-local",
    title: "Servicio de fotografia local",
    category: "Profesionales",
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
    zone: "Roma Norte",
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
    zone: "Del Valle",
    description:
      "Paquetes de fotos para perfiles, productos y presencia digital local.",
    contact: "contenido@nuvanun.local",
    imageUrls: [],
  },
];

export async function getListings(): Promise<Listing[]> {
  const remoteListings = await getRemoteListings();

  return dedupeListings([
    ...getStoredListings(),
    ...remoteListings,
    ...mockListings,
  ]).map(normalizeListing);
}

export async function getListingById(id: string): Promise<Listing | null> {
  const listings = await getListings();
  return listings.find((listing) => listing.id === id) ?? null;
}

export async function createListing(input: NewListingInput): Promise<Listing> {
  const images = input.images.slice(0, 3);
  const remoteListing = await tryCreateRemoteListing(input, images);

  if (remoteListing) {
    storeListing(remoteListing);
    return remoteListing;
  }

  const imageUrls = await Promise.all(images.map(readFileAsDataUrl));
  const listing: Listing = {
    id: `local-${crypto.randomUUID()}`,
    title: input.title,
    category: input.category,
    subcategory: input.subcategory,
    zone: input.zone,
    description: input.description,
    contact: input.contact,
    imageUrls,
    attendsTo: input.attendsTo ?? [],
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
      return [];
    }

    return data
      .map(mapRemoteListing)
      .filter((listing): listing is Listing => Boolean(listing));
  } catch {
    return [];
  }
}

async function tryCreateRemoteListing(
  input: NewListingInput,
  images: File[],
): Promise<Listing | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const imageUrls = await uploadListingImages(images);
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("listings")
      .insert({
        title: input.title,
        category: input.category,
        subcategory: input.subcategory,
        zone: input.zone,
        description: input.description,
        contact: input.contact,
        image_urls: imageUrls,
      })
      .select("*")
      .single();

    if (error || !data) {
      return null;
    }

    return mapRemoteListing(data);
  } catch {
    return null;
  }
}

async function uploadListingImages(images: File[]): Promise<string[]> {
  const supabase = getSupabaseClient();

  return Promise.all(
    images.slice(0, 3).map(async (image) => {
      const path = `listings/${crypto.randomUUID()}.${getFileExtension(image)}`;
      const { error } = await supabase.storage
        .from(listingImagesBucket)
        .upload(path, image, {
          contentType: image.type || "image/jpeg",
          upsert: false,
        });

      if (error) {
        throw error;
      }

      const { data } = supabase.storage
        .from(listingImagesBucket)
        .getPublicUrl(path);

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
  return {
    ...listing,
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
  const zone = getString(record.zone);
  const description = getString(record.description);
  const contact = getString(record.contact);

  if (!id || !title || !category || !zone || !description || !contact) {
    return null;
  }

  return normalizeListing({
    id,
    title,
    category,
    subcategory: getString(record.subcategory) || undefined,
    zone,
    description,
    contact,
    imageUrls: getStringArray(record.image_urls),
    attendsTo: getStringArray(record.attends_to),
  });
}

function getString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function getStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
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
