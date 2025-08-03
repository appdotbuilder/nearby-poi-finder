
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { trpc } from '@/utils/trpc';
import type { POIWithDistance, POICategory } from '../../server/src/schema';
import { MapPin, Phone, Globe, Star, Navigation, AlertCircle, RefreshCw } from 'lucide-react';

// Category configuration with Indonesian labels and emojis
const categoryConfig: Record<POICategory, { label: string; emoji: string; color: string }> = {
  'Layanan': { label: 'Layanan', emoji: '🏥', color: 'bg-blue-100 text-blue-800' },
  'Kuliner': { label: 'Kuliner', emoji: '🍽️', color: 'bg-orange-100 text-orange-800' },
  'Belanja': { label: 'Belanja', emoji: '🛒', color: 'bg-green-100 text-green-800' },
  'Wisata': { label: 'Wisata', emoji: '🏛️', color: 'bg-purple-100 text-purple-800' }
};

function App() {
  const [nearbyPOIs, setNearbyPOIs] = useState<POIWithDistance[]>([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<POICategory | 'all'>('all');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isLoadingPOIs, setIsLoadingPOIs] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [searchRadius] = useState(5000); // 5km default radius

  // Get user's current location
  const getCurrentLocation = useCallback(() => {
    setIsLoadingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation tidak didukung oleh browser ini');
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        setIsLoadingLocation(false);
      },
      (error: GeolocationPositionError) => {
        let errorMessage = 'Gagal mendapatkan lokasi';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Akses lokasi ditolak. Silakan izinkan akses lokasi di browser.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Lokasi tidak tersedia';
            break;
          case error.TIMEOUT:
            errorMessage = 'Waktu habis saat mencari lokasi';
            break;
        }
        setLocationError(errorMessage);
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  }, []);

  // Load nearby POIs
  const loadNearbyPOIs = useCallback(async () => {
    if (!userLocation) return;

    setIsLoadingPOIs(true);
    try {
      const result = await trpc.getNearbyPOIs.query({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        radius: searchRadius,
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        limit: 20
      });
      setNearbyPOIs(result);
    } catch (error) {
      console.error('Failed to load nearby POIs:', error);
    } finally {
      setIsLoadingPOIs(false);
    }
  }, [userLocation, selectedCategory, searchRadius]);

  // Initialize location on mount
  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  // Load POIs when location or category changes
  useEffect(() => {
    if (userLocation) {
      loadNearbyPOIs();
    }
  }, [loadNearbyPOIs]);

  // Format distance for display
  const formatDistance = (distance: number): string => {
    if (distance < 1000) {
      return `${Math.round(distance)} m`;
    }
    return `${(distance / 1000).toFixed(1)} km`;
  };

  // Format rating stars
  const renderRating = (rating: number | null) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-1">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <span className="text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  // Filter POIs by selected category
  const filteredPOIs = selectedCategory === 'all' 
    ? nearbyPOIs 
    : nearbyPOIs.filter((poi: POIWithDistance) => poi.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-4 max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            📍 Tempat Menarik di Sekitar
          </h1>
          <p className="text-gray-600 text-sm">
            Temukan layanan, kuliner, belanja, dan wisata terdekat
          </p>
        </div>

        {/* Location Status */}
        <Card className="mb-4">
          <CardContent className="p-4">
            {isLoadingLocation && (
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="text-sm">Mencari lokasi Anda...</span>
              </div>
            )}
            
            {locationError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {locationError}
                </AlertDescription>
              </Alert>
            )}
            
            {userLocation && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-700">Lokasi ditemukan</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={getCurrentLocation}
                  disabled={isLoadingLocation}
                >
                  Perbarui
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {locationError && !userLocation && (
          <div className="text-center py-8">
            <Button onClick={getCurrentLocation} disabled={isLoadingLocation}>
              {isLoadingLocation ? 'Mencari...' : 'Coba Lagi'}
            </Button>
          </div>
        )}

        {userLocation && (
          <>
            {/* Category Tabs */}
            <Tabs 
              value={selectedCategory} 
              onValueChange={(value: string) => setSelectedCategory(value as POICategory | 'all')}
              className="mb-6"
            >
              <TabsList className="grid w-full grid-cols-5 h-auto p-1">
                <TabsTrigger value="all" className="text-xs py-2">
                  🏢 Semua
                </TabsTrigger>
                {Object.entries(categoryConfig).map(([category, config]) => (
                  <TabsTrigger key={category} value={category} className="text-xs py-2">
                    {config.emoji} {config.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={selectedCategory} className="mt-4">
                {/* Loading State */}
                {isLoadingPOIs && (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i: number) => (
                      <Card key={i}>
                        <CardContent className="p-4">
                          <Skeleton className="h-4 w-3/4 mb-2" />
                          <Skeleton className="h-3 w-full mb-2" />
                          <Skeleton className="h-3 w-1/2" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* POI List */}
                {!isLoadingPOIs && (
                  <div className="space-y-4">
                    {filteredPOIs.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-2">📍</div>
                        <p className="text-gray-500">
                          Tidak ada tempat menarik ditemukan di sekitar Anda
                        </p>
                      </div>
                    ) : (
                      filteredPOIs.map((poi: POIWithDistance) => (
                        <Card key={poi.id} className="hover:shadow-md transition-shadow">
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-lg leading-tight">
                                  {poi.name}
                                </CardTitle>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge className={categoryConfig[poi.category].color}>
                                    {categoryConfig[poi.category].emoji} {categoryConfig[poi.category].label}
                                  </Badge>
                                  <div className="flex items-center gap-1 text-blue-600">
                                    <MapPin className="h-3 w-3" />
                                    <span className="text-xs font-medium">
                                      {formatDistance(poi.distance)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              {poi.rating && renderRating(poi.rating)}
                            </div>
                          </CardHeader>
                          
                          <CardContent className="pt-0">
                            {poi.description && (
                              <CardDescription className="mb-3 text-sm">
                                {poi.description}
                              </CardDescription>
                            )}
                            
                            <div className="space-y-2 text-xs text-gray-600">
                              <div className="flex items-start gap-2">
                                <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                <span className="flex-1">{poi.address}</span>
                              </div>
                              
                              {poi.phone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-3 w-3 flex-shrink-0" />
                                  <a 
                                    href={`tel:${poi.phone}`}
                                    className="text-blue-600 hover:underline"
                                  >
                                    {poi.phone}
                                  </a>
                                </div>
                              )}
                              
                              {poi.website && (
                                <div className="flex items-center gap-2">
                                  <Globe className="h-3 w-3 flex-shrink-0" />
                                  <a 
                                    href={poi.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline truncate"
                                  >
                                    Kunjungi Website
                                  </a>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
