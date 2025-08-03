
import { type GetPOIsByCategoryInput, type PointOfInterest } from '../schema';

export const getPOIsByCategory = async (input: GetPOIsByCategoryInput): Promise<PointOfInterest[]> => {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is fetching points of interest filtered by category.
    // It should:
    // 1. Query the database for POIs matching the specified category
    // 2. Filter only active POIs
    // 3. Apply pagination using limit and offset
    // 4. Return the filtered results

    // For now, return dummy data based on category
    const dummyPOIsByCategory: Record<string, PointOfInterest[]> = {
        'Layanan': [
            {
                id: 1,
                name: "Rumah Sakit Umum",
                description: "Layanan kesehatan 24 jam",
                category: "Layanan",
                latitude: -6.2088,
                longitude: 106.8456,
                address: "Jl. Kesehatan No. 123",
                phone: "+62-21-1234567",
                website: null,
                rating: 4.5,
                image_url: null,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: 5,
                name: "Kantor Pos",
                description: "Layanan pos dan pengiriman paket",
                category: "Layanan",
                latitude: -6.2100,
                longitude: 106.8470,
                address: "Jl. Pos Indonesia No. 89",
                phone: "+62-21-5551234",
                website: "https://posindonesia.co.id",
                rating: 3.8,
                image_url: null,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            }
        ],
        'Kuliner': [
            {
                id: 2,
                name: "Warung Nasi Padang Sederhana",
                description: "Masakan Padang autentik dengan cita rasa tradisional",
                category: "Kuliner",
                latitude: -6.2095,
                longitude: 106.8440,
                address: "Jl. Raya Kuliner No. 45",
                phone: "+62-21-7654321",
                website: null,
                rating: 4.2,
                image_url: null,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: 6,
                name: "Kafe Modern",
                description: "Kafe dengan suasana modern dan kopi specialty",
                category: "Kuliner",
                latitude: -6.2080,
                longitude: 106.8465,
                address: "Jl. Kopi Nikmat No. 67",
                phone: "+62-21-8887654",
                website: "https://kafemodern.com",
                rating: 4.6,
                image_url: null,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            }
        ],
        'Belanja': [
            {
                id: 3,
                name: "Minimarket 24 Jam",
                description: "Toko swalayan dengan produk lengkap",
                category: "Belanja",
                latitude: -6.2085,
                longitude: 106.8475,
                address: "Jl. Belanja Raya No. 78",
                phone: "+62-21-9876543",
                website: null,
                rating: 4.0,
                image_url: null,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: 7,
                name: "Pasar Tradisional",
                description: "Pasar dengan berbagai kebutuhan sehari-hari",
                category: "Belanja",
                latitude: -6.2110,
                longitude: 106.8450,
                address: "Jl. Pasar Lama No. 12",
                phone: null,
                website: null,
                rating: 3.5,
                image_url: null,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            }
        ],
        'Wisata': [
            {
                id: 4,
                name: "Taman Kota Hijau",
                description: "Taman rekreasi keluarga dengan fasilitas lengkap",
                category: "Wisata",
                latitude: -6.2120,
                longitude: 106.8430,
                address: "Jl. Wisata Indah No. 12",
                phone: null,
                website: "https://tamankotahijau.id",
                rating: 4.8,
                image_url: null,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: 8,
                name: "Museum Sejarah",
                description: "Museum dengan koleksi sejarah lokal",
                category: "Wisata",
                latitude: -6.2075,
                longitude: 106.8485,
                address: "Jl. Sejarah No. 34",
                phone: "+62-21-3334567",
                website: "https://museumsejarah.id",
                rating: 4.3,
                image_url: null,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            }
        ]
    };

    const categoryPOIs = dummyPOIsByCategory[input.category] || [];
    
    // Apply pagination
    return categoryPOIs.slice(input.offset, input.offset + input.limit);
};
