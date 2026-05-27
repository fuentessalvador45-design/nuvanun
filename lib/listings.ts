const storageKey = "nuvanun:listings";

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
  return [...getStoredListings(), ...mockListings].map(normalizeListing);
}

export async function getListingById(id: string): Promise<Listing | null> {
  const listings = await getListings();
  return listings.find((listing) => listing.id === id) ?? null;
}

export async function createListing(input: NewListingInput): Promise<Listing> {
  const imageUrls = await Promise.all(input.images.map(readFileAsDataUrl));
  const listing: Listing = {
    id: `local-${Date.now()}`,
    title: input.title,
    category: input.category,
    subcategory: input.subcategory,
    zone: input.zone,
    description: input.description,
    contact: input.contact,
    imageUrls,
    attendsTo: input.attendsTo ?? [],
  };
  const storedListings = getStoredListings();

  window.localStorage.setItem(
    storageKey,
    JSON.stringify([listing, ...storedListings]),
  );

  return listing;
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

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
