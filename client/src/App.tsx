import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Phone, Navigation, Loader2, AlertCircle, CheckCircle, Filter } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
// Using type-only imports for better TypeScript compliance
import type { POIWithDistance, POICategory } from '../../server/src/schema';

// Geolocation state interface
interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  isDetecting: boolean;
  error: string | null;
  isSupported: boolean;
}

function App() {
  // Geolocation state
  const [location, setLocation] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    isDetecting: false,
    error: null,
    isSupported: typeof navigator !== 'undefined' && 'geolocation' in navigator
  });

  // POI state
  const [pois, setPois] = useState<POIWithDistance[]>([]);
  const [filteredPois, setFilteredPois] = useState<POIWithDistance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState<POICategory | 'all'>('all');
  const [searchRadius, setSearchRadius] = useState<number>(5000); // 5km default

  // Manual location input state
  const [manualLocation, setManualLocation] = useState({
    latitude: '',
    longitude: ''
  });
  const [showManualInput, setShowManualInput] = useState(false);

  // Get user location
  const detectLocation = useCallback(() => {
    if (!location.isSupported) {
      setLocation(prev => ({
        ...prev,
        error: 'Geolocation is not supported by this browser. Please enter coordinates manually.'
      }));
      setShowManualInput(true);
      return;
    }

    setLocation(prev => ({ ...prev, isDetecting: true, error: null }));

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes cache
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          isDetecting: false,
          error: null,
          isSupported: true
        });
        setShowManualInput(false);
      },
      (error) => {
        console.log('Location detection failed:', error.code);
        
        // Use default Jakarta coordinates as fallback
        setLocation({
          latitude: -6.2088,
          longitude: 106.8456,
          accuracy: null,
          isDetecting: false,
          error: null,
          isSupported: true
        });
        setShowManualInput(false);
      },
      options
    );
  }, [location.isSupported]);

  // Use manual coordinates
  const useManualLocation = useCallback(() => {
    const lat = parseFloat(manualLocation.latitude);
    const lng = parseFloat(manualLocation.longitude);
    
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setLocation(prev => ({
        ...prev,
        error: 'Please enter valid coordinates (latitude: -90 to 90, longitude: -180 to 180).'
      }));
      return;
    }

    setLocation({
      latitude: lat,
      longitude: lng,
      accuracy: null,
      isDetecting: false,
      error: null,
      isSupported: true
    });
    setShowManualInput(false);
  }, [manualLocation]);

  // Use default Jakarta location
  const useDefaultLocation = useCallback(() => {
    setLocation({
      latitude: -6.2088, // Jakarta center
      longitude: 106.8456,
      accuracy: null,
      isDetecting: false,
      error: null,
      isSupported: true
    });
    setShowManualInput(false);
  }, []);

  // Search nearby POIs
  const searchNearbyPOIs = useCallback(async () => {
    if (!location.latitude || !location.longitude) {
      setSearchError('Location is required to search nearby POIs.');
      return;
    }

    setIsLoading(true);
    setSearchError(null);

    try {
      const result = await trpc.getNearbyPOIs.query({
        latitude: location.latitude,
        longitude: location.longitude,
        radius: searchRadius,
        category: selectedCategory === 'all' ? undefined : selectedCategory
      });
      
      setPois(result);
      setFilteredPois(result);
    } catch (error) {
      console.error('Failed to search nearby POIs:', error);
      setSearchError('Failed to load nearby POIs. Please try again.');
      setPois([]);
      setFilteredPois([]);
    } finally {
      setIsLoading(false);
    }
  }, [location.latitude, location.longitude, searchRadius, selectedCategory]);

  // Filter POIs by category
  const filterPOIsByCategory = useCallback((category: POICategory | 'all') => {
    if (category === 'all') {
      setFilteredPois(pois);
    } else {
      setFilteredPois(pois.filter(poi => poi.category === category));
    }
  }, [pois]);

  // Auto-detect location on component mount, with fallback to Jakarta
  useEffect(() => {
    // Check if we're in development and use default location
    if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
      // Use default Jakarta coordinates for insecure connections
      setLocation({
        latitude: -6.2088,
        longitude: 106.8456,
        accuracy: null,
        isDetecting: false,
        error: null,
        isSupported: true
      });
    } else {
      detectLocation();
    }
  }, [detectLocation]);

  // Auto-search when location is available
  useEffect(() => {
    if (location.latitude && location.longitude && !location.isDetecting) {
      searchNearbyPOIs();
    }
  }, [location.latitude, location.longitude, location.isDetecting, searchNearbyPOIs]);

  // Filter POIs when category changes
  useEffect(() => {
    filterPOIsByCategory(selectedCategory);
  }, [selectedCategory, filterPOIsByCategory]);

  // Get category color for badges
  const getCategoryColor = (category: POICategory) => {
    switch (category) {
      case 'Layanan': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Kuliner': return 'bg-red-100 text-red-800 border-red-200';
      case 'Belanja': return 'bg-green-100 text-green-800 border-green-200';
      case 'Wisata': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get category emoji
  const getCategoryEmoji = (category: POICategory) => {
    switch (category) {
      case 'Layanan': return '🏢';
      case 'Kuliner': return '🍽️';
      case 'Belanja': return '🛍️';
      case 'Wisata': return '🏛️';
      default: return '📍';
    }
  };

  // Format distance
  const formatDistance = (distance: number) => {
    if (distance < 1000) {
      return `${distance}m`;
    }
    return `${(distance / 1000).toFixed(1)}km`;
  };

  // POI Card Component
  const POICard = ({ poi }: { poi: POIWithDistance }) => (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <span className="text-xl">{getCategoryEmoji(poi.category)}</span>
              {poi.name}
            </CardTitle>
            <CardDescription className="mt-1 text-gray-600">
              {poi.description || 'No description available'}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant="outline" className={getCategoryColor(poi.category)}>
              {poi.category}
            </Badge>
            <div className="flex items-center gap-1 text-blue-600 font-semibold text-sm">
              <Navigation className="w-4 h-4" />
              <span>{formatDistance(poi.distance)}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {poi.address && (
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <MapPin className="w-4 h-4 mt-0.5 text-gray-500" />
              <span>{poi.address}</span>
            </div>
          )}
          {poi.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Phone className="w-4 h-4 text-gray-500" />
              <a 
                href={`tel:${poi.phone}`}
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                {poi.phone}
              </a>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Location Status Component
  const LocationStatus = () => {
    if (location.isDetecting) {
      return (
        <Alert className="border-blue-200 bg-blue-50">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <AlertDescription className="text-blue-800">
            Detecting your current location...
          </AlertDescription>
        </Alert>
      );
    }

    if (location.latitude && location.longitude) {
      const isDefault = location.latitude === -6.2088 && location.longitude === 106.8456;
      return (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {isDefault ? 'Using default location (Jakarta): ' : 'Location detected: '}
            {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            {location.accuracy && (
              <span className="text-sm text-green-600 ml-2">
                (±{Math.round(location.accuracy)}m accuracy)
              </span>
            )}
            <Button 
              variant="link" 
              className="p-0 h-auto ml-2 text-green-600 hover:text-green-800"
              onClick={() => setShowManualInput(true)}
            >
              Change location
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <Alert className="border-yellow-200 bg-yellow-50">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          Click "Detect Location" to find nearby points of interest, or use the default Jakarta location.
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🗺️ Nearby Points of Interest
          </h1>
          <p className="text-gray-600 text-lg">
            Discover amazing places around you - Services, Food, Shopping & Tourism
          </p>
        </div>

        {/* Location Detection & Controls */}
        <div className="space-y-4 mb-8">
          <LocationStatus />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Search & Filter Options
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Location controls */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Button 
                    onClick={detectLocation}
                    disabled={location.isDetecting}
                    className="flex items-center gap-2"
                    variant={location.latitude ? "outline" : "default"}
                  >
                    {location.isDetecting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Navigation className="w-4 h-4" />
                    )}
                    {location.isDetecting ? 'Detecting...' : 'Detect Location'}
                  </Button>

                  <Button 
                    onClick={useDefaultLocation}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <MapPin className="w-4 h-4" />
                    Use Jakarta
                  </Button>

                  <Button 
                    onClick={() => setShowManualInput(!showManualInput)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Navigation className="w-4 h-4" />
                    Manual Entry
                  </Button>

                  <Button 
                    onClick={searchNearbyPOIs}
                    disabled={isLoading || !location.latitude || !location.longitude}
                    className="flex items-center gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Navigation className="w-4 h-4" />
                    )}
                    {isLoading ? 'Searching...' : 'Search POIs'}
                  </Button>
                </div>

                {/* Manual location input */}
                {showManualInput && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-medium mb-3">Enter coordinates manually:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Input
                        type="number"
                        placeholder="Latitude (-90 to 90)"
                        value={manualLocation.latitude}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setManualLocation(prev => ({ ...prev, latitude: e.target.value }))
                        }
                        step="0.0001"
                        min="-90"
                        max="90"
                      />
                      <Input
                        type="number"
                        placeholder="Longitude (-180 to 180)"
                        value={manualLocation.longitude}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setManualLocation(prev => ({ ...prev, longitude: e.target.value }))
                        }
                        step="0.0001"
                        min="-180"
                        max="180"
                      />
                      <Button onClick={useManualLocation} className="w-full">
                        Use These Coordinates
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Example Jakarta coordinates: -6.2088, 106.8456
                    </p>
                  </div>
                )}

                {/* Search controls */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select
                    value={selectedCategory}
                    onValueChange={(value: POICategory | 'all') => setSelectedCategory(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">🌟 All Categories</SelectItem>
                      <SelectItem value="Layanan">🏢 Layanan (Services)</SelectItem>
                      <SelectItem value="Kuliner">🍽️ Kuliner (Food)</SelectItem>
                      <SelectItem value="Belanja">🛍️ Belanja (Shopping)</SelectItem>
                      <SelectItem value="Wisata">🏛️ Wisata (Tourism)</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Radius (m)"
                      value={searchRadius}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setSearchRadius(parseInt(e.target.value) || 5000)
                      }
                      min="100"
                      max="50000"
                      className="flex-1"
                    />
                  </div>

                  <Button 
                    onClick={searchNearbyPOIs}
                    disabled={isLoading || !location.latitude || !location.longitude}
                    className="flex items-center gap-2 w-full"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Navigation className="w-4 h-4" />
                    )}
                    {isLoading ? 'Searching...' : 'Search POIs'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Error */}
        {searchError && (
          <Alert className="border-red-200 bg-red-50 mb-6">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {searchError}
            </AlertDescription>
          </Alert>
        )}

        {/* Results Summary */}
        {location.latitude && location.longitude && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-gray-800">
                    {isLoading ? 'Searching...' : `Found ${filteredPois.length} POI(s)`}
                  </p>
                  <p className="text-sm text-gray-600">
                    Within {formatDistance(searchRadius)} from your location
                    {selectedCategory !== 'all' && (
                      <span> • Category: <span className="font-medium">{selectedCategory}</span></span>
                    )}
                  </p>
                </div>
                
                {filteredPois.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {(['all', 'Layanan', 'Kuliner', 'Belanja', 'Wisata'] as const).map((category) => {
                      const count = category === 'all' 
                        ? pois.length 
                        : pois.filter(poi => poi.category === category).length;
                      
                      if (count === 0 && category !== 'all') return null;
                      
                      return (
                        <Button
                          key={category}
                          variant={selectedCategory === category ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedCategory(category)}
                          className="flex items-center gap-1"
                        >
                          {category === 'all' ? '🌟' : getCategoryEmoji(category as POICategory)}
                          <span className="hidden sm:inline">
                            {category === 'all' ? 'All' : category}
                          </span>
                          <Badge variant="secondary" className="ml-1 px-1 py-0 text-xs">
                            {count}
                          </Badge>
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* POI Results */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredPois.length === 0 && location.latitude && location.longitude ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <MapPin className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No POIs Found</h3>
              <p className="text-gray-500 mb-4">
                No points of interest found within {formatDistance(searchRadius)} of your location
                {selectedCategory !== 'all' && ` in the ${selectedCategory} category`}.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => setSearchRadius(prev => Math.min(prev * 2, 50000))}
                >
                  Expand Search Radius
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedCategory('all')}
                  disabled={selectedCategory === 'all'}
                >
                  Show All Categories
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPois.map((poi) => (
              <POICard key={poi.id} poi={poi} />
            ))}
          </div>
        )}

        {/* No Location State */}
        {!location.latitude && !location.longitude && !location.isDetecting && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-gray-400 mb-4">
                <Navigation className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Welcome!</h3>
              <p className="text-gray-500 mb-6">
                To discover amazing places around you, we need to know your location.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={detectLocation} size="lg" className="flex items-center gap-2">
                  <Navigation className="w-5 h-5" />
                  Detect My Location
                </Button>
                <Button onClick={useDefaultLocation} size="lg" variant="outline" className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Use Jakarta Location
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default App;