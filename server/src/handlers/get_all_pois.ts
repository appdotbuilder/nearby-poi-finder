
import { type PointOfInterest } from '../schema';

export const getAllPOIs = async (): Promise<PointOfInterest[]> => {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is fetching all active points of interest from the database.
    // It should return all POIs that are marked as active.
    
    // For now, return dummy data for all categories
    const dummyPOIs: PointOfInterest[] = [
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
        }
    ];

    return dummyPOIs;
};
