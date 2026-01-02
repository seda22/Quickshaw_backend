//map-route.js
'use client';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api';

const MAPS_API_KEY = "AIzaSyDlMct_6eLgBBMNHMk6LttCcRXPondmLTo";

const MAP_CONTAINER = { width: "100%", height: "100%" }; // fills your .mapWrap/.mapWrap2
const FIXED_ORIGIN_A = { lat: 25.45160965318387, lng: 82.85606137492782 };
const DEFAULT_CENTER = FIXED_ORIGIN_A;
const MAP_OPTIONS = {
  disableDefaultUI: true,
  zoomControl: true,
  streetViewControl: true,
  fullscreenControl: false,
  optimizeWaypoints: true,
};

function MapContent({ destination, route, journeyType }) {

  const startPos = !journeyType === true ? FIXED_ORIGIN_A : (route?.routes?.[0]?.legs[0]?.start_location || DEFAULT_CENTER);
  const endPos = !journeyType === false ? FIXED_ORIGIN_A : (route?.routes?.[0]?.legs[route?.routes?.[0]?.legs.length - 1]?.end_location || destination);

  const startLabel = "A";

  const mapRef = useRef(null);
  const mapCenter = useMemo(() => DEFAULT_CENTER, []);

  const [endLabel, setEndLabel] = useState("B");

  const intermediateMarkers = useMemo(() => {
    if (!route?.routes?.[0]?.legs) return [];

    const legs = route.routes[0].legs;
    return legs.slice(0, legs.length - 1).map((leg, index) => {
      // Start labeling from 'C' (ASCII for 'C' is 67)
      const labelCode = ('B'.charCodeAt(0) + index);
      setEndLabel(String.fromCharCode(labelCode + 1));
      const label = String.fromCharCode(labelCode);

      return {
        position: leg.end_location,
        label: label,
        title: `Stop ${label}`,
      };
    });
  }, [route]);

  // Fit bounds whenever a new route arrives
  useEffect(() => {
    if (!mapRef.current || !route?.routes?.[0]?.bounds) return;
    mapRef.current.fitBounds(route.routes[0].bounds);
  }, [route]);

  return (
    <GoogleMap
      onLoad={(m) => (mapRef.current = m)}
      mapContainerStyle={MAP_CONTAINER}
      center={mapCenter}
      zoom={destination ? 14 : 12}
      options={MAP_OPTIONS}
    >
      {/* Marker for the Fixed Origin (VNS Airport) */}
      {startPos && <Marker position={startPos} label={startLabel} />}

      {/* Render the calculated route if directions exist */}
      {route && (
        <DirectionsRenderer
          directions={route}
          options={{
            suppressMarkers: true, // we show A marker ourselves; B comes from end_location marker
            polylineOptions: {
              strokeWeight: 5,
              strokeOpacity: 1,
              strokeColor: '#1E90FF',
            },
          }}
        />
      )}

      {/* Markers for Intermediate Waypoints (C, D, etc.) */}
      {intermediateMarkers.map((marker, index) => (
        <Marker
          key={`waypoint-${index}`}
          position={marker.position}
          label={marker.label}
        />
      ))}


      {/* Marker for the Destination (Location B) if route exists */}
      {endPos && (
        <Marker
          position={endPos}
          label={endLabel}
        />
      )}
    </GoogleMap>
  );
}

// Hook to load the Google Maps script and places library
export function useMapRouteLoader() {
  const libraries = useMemo(() => ['places'], []);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: MAPS_API_KEY,
    libraries,
  });

  return { isLoaded, loadError };
}

// The main component that renders the map content
export default function MapRoute({ destination, route, journeyType }) {
  const { isLoaded, loadError } = useMapRouteLoader();

  if (loadError) return <div>Maps load error: {String(loadError)}</div>;
  if (!isLoaded) return <div>Loading map…</div>;

  return <MapContent destination={destination} route={route} journeyType={journeyType} />;
}
