import React, { useState, useEffect, useRef } from 'react';
import { geocodeAddress, reverseGeocode } from '../services/ORSService';

/**
 * Map Picker Component that uses direct Leaflet CDN references
 * This approach avoids the webpack module loading issues
 */
const MapPicker = ({
  initialPosition = { lat: 20.2961, lng: 85.8245 },
  markers = {
    pickup: null,
    drop: null,
  },
  onPickupChange,
  onDropChange,
  mode = 'both', // 'pickup', 'drop', or 'both'
  showSearchBox = true,
  height = '400px',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(
    mode === 'drop' ? 'drop' : 'pickup'
  );
  const [pickupMarker, setPickupMarker] = useState(markers.pickup || null);
  const [dropMarker, setDropMarker] = useState(markers.drop || null);
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropAddress, setDropAddress] = useState('');
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const leafletPickupMarkerRef = useRef(null);
  const leafletDropMarkerRef = useRef(null);

  useEffect(() => {
    // Make sure Leaflet CSS is included in the page
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://unpkg.com/leaflet/dist/leaflet.css';
      document.head.appendChild(cssLink);
    }

    // Make sure Leaflet JS is loaded
    const loadLeaflet = () => {
      if (window.L) {
        initializeMap();
      } else {
        const scriptTag = document.createElement('script');
        scriptTag.src = 'https://unpkg.com/leaflet/dist/leaflet.js';
        scriptTag.onload = initializeMap;
        document.body.appendChild(scriptTag);
      }
    };

    loadLeaflet();

    return () => {
      // Clean up the map when component unmounts
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []); // Run only once on mount

  // Update markers when props change
  useEffect(() => {
    if (!mapRef.current) return; // Wait for map to be initialized

    // Update pickup marker if props changed
    if (
      markers.pickup &&
      (!pickupMarker ||
        markers.pickup.lat !== pickupMarker.lat ||
        markers.pickup.lng !== pickupMarker.lng)
    ) {
      setPickupMarker(markers.pickup);

      if (leafletPickupMarkerRef.current) {
        leafletPickupMarkerRef.current.setLatLng([
          markers.pickup.lat,
          markers.pickup.lng,
        ]);
      } else {
        createPickupMarker(markers.pickup);
      }

      fetchAddress(markers.pickup, 'pickup');
    }

    // Update drop marker if props changed
    if (
      markers.drop &&
      (!dropMarker ||
        markers.drop.lat !== dropMarker.lat ||
        markers.drop.lng !== dropMarker.lng)
    ) {
      setDropMarker(markers.drop);

      if (leafletDropMarkerRef.current) {
        leafletDropMarkerRef.current.setLatLng([
          markers.drop.lat,
          markers.drop.lng,
        ]);
      } else {
        createDropMarker(markers.drop);
      }

      fetchAddress(markers.drop, 'drop');
    }
  }, [markers, mapRef.current]);

  const initializeMap = () => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Create the map
    const L = window.L;
    const map = L.map(mapContainerRef.current).setView(
      [initialPosition.lat, initialPosition.lng],
      13
    );

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Add click handler to map
    map.on('click', handleMapClick);

    // Save map instance to ref
    mapRef.current = map;

    // Create initial markers if provided
    if (markers.pickup) {
      createPickupMarker(markers.pickup);
      fetchAddress(markers.pickup, 'pickup');
    }

    if (markers.drop) {
      createDropMarker(markers.drop);
      fetchAddress(markers.drop, 'drop');
    }
  };

  // Create pickup marker
  const createPickupMarker = (coords) => {
    if (!mapRef.current || !window.L) return;

    const L = window.L;
    // Custom pickup icon
    const pickupIcon = L.icon({
      iconUrl:
        'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      shadowUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    // Remove existing marker if any
    if (leafletPickupMarkerRef.current) {
      leafletPickupMarkerRef.current.remove();
    }

    // Create new marker
    const marker = L.marker([coords.lat, coords.lng], {
      icon: pickupIcon,
      draggable: true,
    }).addTo(mapRef.current);

    // Add popup
    marker.bindPopup(
      `<strong>Pickup Location</strong><br/>${
        pickupAddress || 'Loading address...'
      }`
    );

    // Add drag handler
    marker.on('dragend', (e) => {
      const position = e.target.getLatLng();
      const newCoords = { lat: position.lat, lng: position.lng };
      setPickupMarker(newCoords);
      if (onPickupChange) onPickupChange(newCoords);
      fetchAddress(newCoords, 'pickup');
    });

    // Save marker reference
    leafletPickupMarkerRef.current = marker;
  };

  // Create drop marker
  const createDropMarker = (coords) => {
    if (!mapRef.current || !window.L) return;

    const L = window.L;
    // Custom drop icon
    const dropIcon = L.icon({
      iconUrl:
        'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    // Remove existing marker if any
    if (leafletDropMarkerRef.current) {
      leafletDropMarkerRef.current.remove();
    }

    // Create new marker
    const marker = L.marker([coords.lat, coords.lng], {
      icon: dropIcon,
      draggable: true,
    }).addTo(mapRef.current);

    // Add popup
    marker.bindPopup(
      `<strong>Drop Location</strong><br/>${
        dropAddress || 'Loading address...'
      }`
    );

    // Add drag handler
    marker.on('dragend', (e) => {
      const position = e.target.getLatLng();
      const newCoords = { lat: position.lat, lng: position.lng };
      setDropMarker(newCoords);
      if (onDropChange) onDropChange(newCoords);
      fetchAddress(newCoords, 'drop');
    });

    // Save marker reference
    leafletDropMarkerRef.current = marker;
  };

  // Handle map click
  const handleMapClick = (e) => {
    if (!mapRef.current) return;

    const newCoords = { lat: e.latlng.lat, lng: e.latlng.lng };

    // Update the appropriate marker based on selected mode
    if (selectedMarker === 'pickup' || mode === 'pickup') {
      setPickupMarker(newCoords);
      if (onPickupChange) onPickupChange(newCoords);
      createPickupMarker(newCoords);
      fetchAddress(newCoords, 'pickup');
    } else {
      setDropMarker(newCoords);
      if (onDropChange) onDropChange(newCoords);
      createDropMarker(newCoords);
      fetchAddress(newCoords, 'drop');
    }
  };

  // Fetch address for coordinates
  const fetchAddress = async (coords, markerType) => {
    try {
      const result = await reverseGeocode(coords.lat, coords.lng);
      if (markerType === 'pickup') {
        setPickupAddress(result.address);
        if (leafletPickupMarkerRef.current) {
          leafletPickupMarkerRef.current.setPopupContent(
            `<strong>Pickup Location</strong><br/>${
              result.address || 'Address not found'
            }`
          );
        }
      } else {
        setDropAddress(result.address);
        if (leafletDropMarkerRef.current) {
          leafletDropMarkerRef.current.setPopupContent(
            `<strong>Drop Location</strong><br/>${
              result.address || 'Address not found'
            }`
          );
        }
      }
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  };

  // Handle search submission
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery || !mapRef.current) return;

    setIsSearching(true);
    try {
      const result = await geocodeAddress(searchQuery);
      if (result) {
        const newCoords = { lat: result.lat, lng: result.lng };

        // Center map on result
        mapRef.current.setView([result.lat, result.lng], 13);

        // Update the appropriate marker based on selected mode
        if (selectedMarker === 'pickup' || mode === 'pickup') {
          setPickupMarker(newCoords);
          setPickupAddress(result.formattedAddress || '');
          if (onPickupChange) onPickupChange(newCoords);
          createPickupMarker(newCoords);
        } else {
          setDropMarker(newCoords);
          setDropAddress(result.formattedAddress || '');
          if (onDropChange) onDropChange(newCoords);
          createDropMarker(newCoords);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="map-picker">
      {showSearchBox && (
        <div className="map-search-container">
          <form onSubmit={handleSearch} className="map-search-form">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Search for a location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="input-group-append">
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                  ) : (
                    <i className="fas fa-search"></i>
                  )}
                </button>
              </div>
            </div>

            {mode === 'both' && (
              <div className="marker-toggle mt-2">
                <div className="btn-group btn-group-sm" role="group">
                  <button
                    type="button"
                    className={`btn ${
                      selectedMarker === 'pickup'
                        ? 'btn-success'
                        : 'btn-outline-success'
                    }`}
                    onClick={() => setSelectedMarker('pickup')}
                  >
                    <i className="fas fa-map-marker-alt me-1"></i>
                    Pickup Location
                  </button>
                  <button
                    type="button"
                    className={`btn ${
                      selectedMarker === 'drop'
                        ? 'btn-danger'
                        : 'btn-outline-danger'
                    }`}
                    onClick={() => setSelectedMarker('drop')}
                  >
                    <i className="fas fa-map-marker-alt me-1"></i>
                    Drop Location
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      )}

      <div className="map-container" style={{ height }}>
        {/* This div will become the Leaflet map container */}
        <div
          ref={mapContainerRef}
          style={{ height: '100%', width: '100%', borderRadius: '8px' }}
        ></div>
      </div>

      {/* Display coordinates */}
      <div className="coordinates-display mt-2">
        {(mode === 'both' || mode === 'pickup') && pickupMarker && (
          <div className="pickup-coordinates mb-2">
            <small className="text-muted">Pickup: </small>
            <strong>
              {pickupMarker.lat.toFixed(6)}, {pickupMarker.lng.toFixed(6)}
            </strong>
            {pickupAddress && (
              <div className="small text-muted">{pickupAddress}</div>
            )}
          </div>
        )}

        {(mode === 'both' || mode === 'drop') && dropMarker && (
          <div className="drop-coordinates">
            <small className="text-muted">Drop: </small>
            <strong>
              {dropMarker.lat.toFixed(6)}, {dropMarker.lng.toFixed(6)}
            </strong>
            {dropAddress && (
              <div className="small text-muted">{dropAddress}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapPicker;
