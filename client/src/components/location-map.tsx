import { useState, useEffect } from 'react';
import { LatLngExpression } from 'leaflet';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { MapPin } from 'lucide-react';

interface LocationMapProps {
  onLocationSelect?: (lat: number, lng: number) => void;
  markers?: Array<{
    position: LatLngExpression;
    title: string;
    description?: string;
  }>;
}

export function LocationMap({
  onLocationSelect,
  markers = []
}: LocationMapProps) {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Zoek direct tijdens het typen
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        searchLocation();
      } else {
        setSearchResults([]);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searchLocation = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=nl&limit=5&type=city,town,village`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching location:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    onLocationSelect?.(lat, lng);
    setSearchResults([]);
    setShowSearch(false);
    setSearchQuery('');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button 
          onClick={() => setShowSearch(!showSearch)}
          variant="outline"
          size="sm"
        >
          <MapPin className="h-4 w-4 mr-2" />
          Andere locatie zoeken
        </Button>
      </div>

      {showSearch && (
        <div className="space-y-2">
          <div className="relative">
            <Input
              placeholder="Zoek een plaatsnaam in Nederland..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                Zoeken...
              </div>
            )}
          </div>

          {searchResults.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-2">
              {searchResults.map((result) => (
                <div
                  key={result.place_id}
                  className="p-2 hover:bg-gray-100 cursor-pointer rounded text-sm"
                  onClick={() => handleLocationSelect(parseFloat(result.lat), parseFloat(result.lon))}
                >
                  {result.display_name}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        {markers.map((marker, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-bold text-lg mb-2">{marker.title}</h3>
            {marker.description && (
              <p className="text-gray-600 mb-2">{marker.description}</p>
            )}
            <div className="text-sm text-gray-500">
              {Array.isArray(marker.position) && (
                <>
                  Lat: {marker.position[0].toFixed(4)}, 
                  Lng: {marker.position[1].toFixed(4)}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 