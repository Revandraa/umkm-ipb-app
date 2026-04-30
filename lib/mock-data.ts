export type Role = "mahasiswa" | "umkm" | "umkm-register" | "admin"

export const kantinLocations = [
  { id: "all", name: "Semua Kantin" },
  { id: "kantin-stevia", name: "Kantin Stevia" },
  { id: "kantin-fema", name: "Kantin FEMA" },
  { id: "kantin-faperta", name: "Kantin Fakultas Pertanian" },
  { id: "kantin-pusat", name: "Kantin Pusat IPB" },
  { id: "food-court", name: "Food Court Dramaga" },
  { id: "gku", name: "GKU IPB" },
  { id: "rektorat", name: "Gedung Rektorat" },
  { id: "asrama", name: "Asrama Mahasiswa" },
  { id: "fmipa", name: "Kantin FMIPA" },
]

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  stock: number
  category: string
  image: string
  isAvailable: boolean
}

export interface UMKM {
  id: string
  name: string
  description: string
  owner: string
  location: string
  rating: number
  isApproved: boolean
  isPending: boolean
  createdAt: string
  image: string
  menu: MenuItem[]
}

export const mockUMKMs: UMKM[] = [
  {
    id: "1",
    name: "Warung Nasi Bakar Bu Tini",
    description: "Nasi bakar dengan berbagai pilihan lauk, cita rasa tradisional Sunda yang autentik.",
    owner: "Bu Tini",
    location: "Kantin Fakultas Pertanian",
    rating: 4.8,
    isApproved: true,
    isPending: false,
    createdAt: "2024-01-15",
    image: "/stores/warung-nasi-bakar.jpg",
    menu: [
      {
        id: "m1",
        name: "Nasi Bakar Ayam",
        description: "Nasi bakar dengan ayam suwir bumbu pedas",
        price: 18000,
        stock: 25,
        category: "Makanan Utama",
        image: "/food/nasi-bakar.jpg",
        isAvailable: true,
      },
      {
        id: "m2",
        name: "Nasi Bakar Ikan Peda",
        description: "Nasi bakar dengan ikan peda sambal",
        price: 20000,
        stock: 15,
        category: "Makanan Utama",
        image: "/food/nasi-bakar-ikan.jpg",
        isAvailable: true,
      },
      {
        id: "m3",
        name: "Es Teh Manis",
        description: "Teh manis segar",
        price: 5000,
        stock: 50,
        category: "Minuman",
        image: "/food/es-teh.jpg",
        isAvailable: true,
      },
    ],
  },
  {
    id: "2",
    name: "Mie Ayam Pak Joko",
    description: "Mie ayam legendaris kampus sejak 2010, dengan kuah kaldu spesial.",
    owner: "Pak Joko",
    location: "Kantin Pusat IPB",
    rating: 4.9,
    isApproved: true,
    isPending: false,
    createdAt: "2024-02-20",
    image: "/stores/mie-ayam-pak-joko.jpg",
    menu: [
      {
        id: "m4",
        name: "Mie Ayam Biasa",
        description: "Mie ayam dengan topping ayam cincang",
        price: 15000,
        stock: 30,
        category: "Makanan Utama",
        image: "/food/mie-ayam.jpg",
        isAvailable: true,
      },
      {
        id: "m5",
        name: "Mie Ayam Komplit",
        description: "Mie ayam dengan bakso dan pangsit",
        price: 22000,
        stock: 20,
        category: "Makanan Utama",
        image: "/food/mie-ayam-komplit.jpg",
        isAvailable: true,
      },
      {
        id: "m6",
        name: "Bakso Urat",
        description: "Bakso urat premium",
        price: 12000,
        stock: 0,
        category: "Makanan Utama",
        image: "/food/bakso.jpg",
        isAvailable: false,
      },
    ],
  },
  {
    id: "3",
    name: "Sate Kambing Madura",
    description: "Sate kambing asli Madura dengan bumbu kacang khas.",
    owner: "H. Mahmud",
    location: "Food Court Dramaga",
    rating: 4.7,
    isApproved: true,
    isPending: false,
    createdAt: "2024-03-10",
    image: "/stores/sate-kambing-madura.jpg",
    menu: [
      {
        id: "m7",
        name: "Sate Kambing (10 tusuk)",
        description: "Sate kambing empuk dengan bumbu kacang",
        price: 35000,
        stock: 15,
        category: "Makanan Utama",
        image: "/food/sate-kambing.jpg",
        isAvailable: true,
      },
      {
        id: "m8",
        name: "Sate Ayam (10 tusuk)",
        description: "Sate ayam dengan bumbu kacang",
        price: 25000,
        stock: 25,
        category: "Makanan Utama",
        image: "/food/sate-ayam.jpg",
        isAvailable: true,
      },
      {
        id: "m9",
        name: "Lontong",
        description: "Lontong untuk pelengkap sate",
        price: 5000,
        stock: 40,
        category: "Pelengkap",
        image: "/food/lontong.jpg",
        isAvailable: true,
      },
    ],
  },
  {
    id: "4",
    name: "Kedai Kopi Mahasiswa",
    description: "Kopi specialty dengan harga mahasiswa, tempat nongkrong favorit.",
    owner: "Rizky Pratama",
    location: "Gedung Rektorat",
    rating: 4.6,
    isApproved: true,
    isPending: false,
    createdAt: "2024-04-05",
    image: "/stores/kedai-kopi.jpg",
    menu: [
      {
        id: "m10",
        name: "Kopi Arabica",
        description: "Kopi arabica single origin",
        price: 18000,
        stock: 30,
        category: "Minuman",
        image: "/food/kopi-arabica.jpg",
        isAvailable: true,
      },
      {
        id: "m11",
        name: "Es Kopi Susu",
        description: "Kopi susu dengan gula aren",
        price: 15000,
        stock: 40,
        category: "Minuman",
        image: "/food/es-kopi-susu.jpg",
        isAvailable: true,
      },
      {
        id: "m12",
        name: "Roti Bakar",
        description: "Roti bakar dengan berbagai topping",
        price: 12000,
        stock: 20,
        category: "Makanan Ringan",
        image: "/food/roti-bakar.jpg",
        isAvailable: true,
      },
    ],
  },
]

export const pendingUMKMs: UMKM[] = [
  {
    id: "5",
    name: "Ayam Geprek Mas Andi",
    description: "Ayam geprek dengan level pedas yang bisa dipilih, cocok untuk pecinta pedas.",
    owner: "Mas Andi",
    location: "Kantin FMIPA",
    rating: 0,
    isApproved: false,
    isPending: true,
    createdAt: "2024-12-01",
    image: "/stores/ayam-geprek.jpg",
    menu: [
      {
        id: "m13",
        name: "Ayam Geprek Original",
        description: "Ayam geprek dengan sambal bawang",
        price: 17000,
        stock: 30,
        category: "Makanan Utama",
        image: "/food/ayam-geprek.jpg",
        isAvailable: true,
      },
    ],
  },
  {
    id: "6",
    name: "Juice Corner Sehat",
    description: "Berbagai jus buah segar untuk gaya hidup sehat mahasiswa.",
    owner: "Dewi Lestari",
    location: "GKU IPB",
    rating: 0,
    isApproved: false,
    isPending: true,
    createdAt: "2024-12-05",
    image: "/stores/juice-corner.jpg",
    menu: [
      {
        id: "m14",
        name: "Jus Alpukat",
        description: "Jus alpukat segar dengan susu",
        price: 12000,
        stock: 25,
        category: "Minuman",
        image: "/food/jus-alpukat.jpg",
        isAvailable: true,
      },
    ],
  },
  {
    id: "7",
    name: "Martabak Mini Enak",
    description: "Martabak mini dengan berbagai topping, pas untuk camilan.",
    owner: "Pak Sugianto",
    location: "Asrama Mahasiswa",
    rating: 0,
    isApproved: false,
    isPending: true,
    createdAt: "2024-12-08",
    image: "/stores/martabak-mini.jpg",
    menu: [
      {
        id: "m15",
        name: "Martabak Coklat Keju",
        description: "Martabak mini dengan topping coklat dan keju",
        price: 15000,
        stock: 20,
        category: "Makanan Ringan",
        image: "/food/martabak.jpg",
        isAvailable: true,
      },
    ],
  },
]

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}
