import React, { useState, useEffect, useRef } from 'react';

// Declare Google Maps types for TypeScript
declare global {
  interface Window {
    google: typeof google;
  }
}

interface LocationFinderProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Location {
  id: string;
  name: string;
  address: string;
  rating: number;
  place_id: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types: string[];
}

const LocationFinder: React.FC<LocationFinderProps> = ({ isOpen, onClose }) => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'gym' | 'park'>('park');
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const infoWindowsRef = useRef<any[]>([]);

  // Initialize Google Maps
  useEffect(() => {
    const initializeMap = () => {
      console.log('Initializing map...', { isOpen, hasMapRef: !!mapRef.current, hasGoogle: !!window.google });
      
      if (isOpen && mapRef.current && !mapInstanceRef.current && window.google) {
        try {
          const map = new window.google.maps.Map(mapRef.current, {
            zoom: 15,
            center: userLocation || { lat: 37.7749, lng: -122.4194 }, // Default to San Francisco
            mapTypeId: window.google.maps.MapTypeId.ROADMAP,
          });
          mapInstanceRef.current = map;
          console.log('Map initialized successfully');
        } catch (error) {
          console.error('Error initializing map:', error);
          setError('Failed to initialize map. Please refresh the page.');
        }
      }
    };

    if (isOpen) {
      // Check if Google Maps is already loaded
      if (window.google) {
        console.log('Google Maps already loaded');
        initializeMap();
      } else {
        console.log('Waiting for Google Maps to load...');
        // Wait for Google Maps to load
        const checkGoogleMaps = setInterval(() => {
          if (window.google) {
            console.log('Google Maps loaded');
            clearInterval(checkGoogleMaps);
            initializeMap();
          }
        }, 100);

        // Cleanup interval after 10 seconds
        setTimeout(() => {
          clearInterval(checkGoogleMaps);
          if (!window.google) {
            setError('Google Maps failed to load. Please check your internet connection and refresh the page.');
          }
        }, 10000);
      }
    }
  }, [isOpen, userLocation]);

  // Get user's current location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(location);
        
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter(location);
          mapInstanceRef.current.setZoom(15);
        }
        
        setLoading(false);
      },
      (error) => {
        setError('Unable to retrieve your location. Please enable location access.');
        setLoading(false);
        console.error('Geolocation error:', error);
      }
    );
  };

  // Search for nearby locations using text query
  const searchNearbyLocations = async () => {
    if (!userLocation) {
      setError('Please allow location access first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (!window.google) {
        setError('Google Maps API not loaded. Please refresh the page.');
        setLoading(false);
        return;
      }

      console.log('Searching for locations:', { 
        userLocation, 
        selectedType, 
        hasMapInstance: !!mapInstanceRef.current 
      });

      // Use text search for parks with exact query
      const service = new window.google.maps.places.PlacesService(mapInstanceRef.current!);
      const query = 'parks near me';
      
      const request = {
        query: query,
        location: new window.google.maps.LatLng(userLocation.lat, userLocation.lng),
        radius: 15000, // 15km radius for better coverage
        fields: ['name', 'place_id', 'geometry', 'formatted_address', 'rating', 'types', 'photos'],
        type: 'park' // Specify park type
      };

      console.log('Text search request:', request);

      service.textSearch(request, (results, status) => {
        console.log('Text search results:', { results, status, statusText: window.google.maps.places.PlacesServiceStatus });
        
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          const locationData = results.map((place) => ({
            id: place.place_id || Math.random().toString(),
            name: place.name || 'Unknown',
            address: place.formatted_address || place.vicinity || 'Address not available',
            rating: place.rating || 0,
            place_id: place.place_id || '',
            geometry: {
              location: {
                lat: place.geometry?.location?.lat() || 0,
                lng: place.geometry?.location?.lng() || 0,
              },
            },
            types: place.types || [],
          }));

          setLocations(locationData);
          addMarkersToMap(locationData);
        } else {
          console.log('Search failed with status:', status);
          if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            // Try alternative search with different query
            console.log('Trying alternative park search...');
            const altRequest = {
              query: 'public parks recreation areas',
              location: new window.google.maps.LatLng(userLocation.lat, userLocation.lng),
              radius: 20000, // 20km radius
              fields: ['name', 'place_id', 'geometry', 'formatted_address', 'rating', 'types']
            };
            
            service.textSearch(altRequest, (altResults, altStatus) => {
              console.log('Alternative search results:', { altResults, altStatus });
              if (altStatus === window.google.maps.places.PlacesServiceStatus.OK && altResults) {
                const locationData = altResults.map((place) => ({
                  id: place.place_id || Math.random().toString(),
                  name: place.name || 'Unknown',
                  address: place.formatted_address || place.vicinity || 'Address not available',
                  rating: place.rating || 0,
                  place_id: place.place_id || '',
                  geometry: {
                    location: {
                      lat: place.geometry?.location?.lat() || 0,
                      lng: place.geometry?.location?.lng() || 0,
                    },
                  },
                  types: place.types || [],
                }));

                setLocations(locationData);
                addMarkersToMap(locationData);
                setLoading(false);
              } else {
                setError('No parks found nearby. Try a different area or check your location.');
                setLoading(false);
              }
            });
          } else if (status === window.google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT) {
            setError('Search limit exceeded. Please try again later.');
            setLoading(false);
          } else if (status === window.google.maps.places.PlacesServiceStatus.REQUEST_DENIED) {
            setError('Search request denied. Please check your API key permissions.');
            setLoading(false);
          } else {
            setError(`Search failed: ${status}. Please try again.`);
            setLoading(false);
          }
        }
      });
    } catch (err) {
      setError('Failed to search for locations. Please check your internet connection.');
      setLoading(false);
      console.error('Search error:', err);
    }
  };

  // Add markers to map
  const addMarkersToMap = (locationData: Location[]) => {
    console.log('Adding markers to map:', locationData.length, 'locations');
    
    // Clear existing markers and info windows
    markersRef.current.forEach(marker => marker.setMap(null));
    infoWindowsRef.current.forEach(infoWindow => infoWindow.close());
    markersRef.current = [];
    infoWindowsRef.current = [];

    if (!mapInstanceRef.current) {
      console.log('No map instance available for markers');
      return;
    }

    locationData.forEach((location, index) => {
      console.log(`Adding marker ${index + 1}:`, location.name, location.geometry.location);
      
      const marker = new window.google.maps.Marker({
        position: { lat: location.geometry.location.lat, lng: location.geometry.location.lng },
        map: mapInstanceRef.current,
        title: location.name,
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
          scaledSize: new window.google.maps.Size(32, 32),
        },
        animation: window.google.maps.Animation.DROP, // Add drop animation
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px; min-width: 200px;">
            <h3 style="margin: 0 0 5px 0; color: #333; font-size: 16px;">${location.name}</h3>
            <p style="margin: 0 0 5px 0; color: #666; font-size: 14px;">${location.address}</p>
            <p style="margin: 0; color: #666; font-size: 14px;">⭐ Rating: ${location.rating}/5</p>
            <button onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${location.geometry.location.lat},${location.geometry.location.lng}', '_blank')" 
                    style="margin-top: 8px; padding: 6px 12px; background: #1976D2; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
              Get Directions
            </button>
          </div>
        `,
      });

      marker.addListener('click', () => {
        // Close any open info windows first
        infoWindowsRef.current.forEach(infoWin => infoWin.close());
        
        infoWindow.open(mapInstanceRef.current, marker);
      });

      markersRef.current.push(marker);
      infoWindowsRef.current.push(infoWindow);
    });

    console.log(`Successfully added ${markersRef.current.length} markers to map`);
    
    // Center map to show all markers
    if (locationData.length > 0 && mapInstanceRef.current) {
      const bounds = new window.google.maps.LatLngBounds();
      locationData.forEach(location => {
        bounds.extend(new window.google.maps.LatLng(
          location.geometry.location.lat, 
          location.geometry.location.lng
        ));
      });
      
      // Fit map to show all markers with some padding
      mapInstanceRef.current.fitBounds(bounds);
      
      // If only one marker, zoom in closer
      if (locationData.length === 1) {
        mapInstanceRef.current.setZoom(15);
      }
    }
  };


  // Clean up on close
  useEffect(() => {
    if (!isOpen) {
      markersRef.current.forEach(marker => marker.setMap(null));
      infoWindowsRef.current.forEach(infoWindow => infoWindow.close());
      markersRef.current = [];
      infoWindowsRef.current = [];
      setLocations([]);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Debug: Check if Google Maps is available
  console.log('LocationFinder render:', { 
    isOpen, 
    hasGoogle: !!window.google, 
    hasMapRef: !!mapRef.current,
    hasMapInstance: !!mapInstanceRef.current 
  });

  return (
    <div className="location-finder-overlay">
      <div className="location-finder-modal">
        <div className="location-finder-header">
          <h2>🌳 Parks Near You</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="location-finder-controls">
          <div className="location-actions">
            <button
              className="location-btn"
              onClick={getUserLocation}
              disabled={loading}
            >
              {loading ? 'Getting Location...' : '📍 Get My Location'}
            </button>
            <button
              className="search-btn"
              onClick={searchNearbyLocations}
              disabled={!userLocation || loading}
            >
              {loading ? 'Searching...' : '🌳 Find Parks'}
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="location-finder-content">
          <div className="map-container">
            <div ref={mapRef} className="map" />
            {!window.google && (
              <div className="map-loading">
                <div className="loading-spinner"></div>
                <p>Loading Google Maps...</p>
              </div>
            )}
          </div>

          <div className="locations-list">
            <h3>Found {locations.length} parks nearby</h3>
            {locations.map((location) => (
              <div key={location.id} className="location-item">
                <div className="location-info">
                  <h4>{location.name}</h4>
                  <p>{location.address}</p>
                  <div className="location-rating">
                    ⭐ {location.rating}/5
                  </div>
                </div>
                <button
                  className="directions-btn"
                  onClick={() => {
                    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.geometry.location.lat},${location.geometry.location.lng}`;
                    window.open(url, '_blank');
                  }}
                >
                  Directions
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationFinder;
