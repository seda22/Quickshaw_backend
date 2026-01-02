'use client';
import React, { useState, useEffect } from 'react';
import usePlacesAutocomplete from 'use-places-autocomplete';
import styles from '../styles/Flight.module.css';

export default function LocationSearch({
  setDestCoords,
  onSelectDestination,
  placeholder
}) {
  // push both coords AND the visible description back up
  const pushPayload = (payload) => {
    if (typeof onSelectDestination === "function") onSelectDestination(payload);
    if (typeof setDestCoords === "function") setDestCoords(payload);
  };

  const [placesService, setPlacesService] = useState(null);

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({ debounce: 300 });

  useEffect(() => {
    if (typeof window !== 'undefined' && window.google && !placesService) {
      setPlacesService(new window.google.maps.places.PlacesService(document.createElement('div')));
    }
  }, [placesService]);

  const handleSelect = (description, placeId) => {
    setValue(description, false);
    clearSuggestions();

    // We do NOT geocode text to an address string; we only fetch geometry.
    if (!placesService) {
      console.warn("Places Service not yet initialized.");
      return;
    }

    placesService.getDetails(
      { placeId, fields: ['geometry'] },
      (place, s) => {
        if (s === window.google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
          const payload = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            // this is the exact label the user clicked in the dropdown
            place: description,
          };
          pushPayload(payload);
        } else {
          console.error('Error fetching details:', s);
        }
      }
    );
  };

  return (
    <div style={{ position: "relative", zIndex: 1 }}>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={!ready}
        placeholder={placeholder}
        className={styles.friendSelect}
      />

      {status === 'OK' && (
        <div
          style={{
            position: "absolute", top: "100%", left: 0, right: 0,
            background: "white", border: "1px solid #ddd", borderRadius: 6,
            boxShadow: "0 1px 6px rgba(60,64,67,.3)", maxHeight: 240,
            overflowY: "auto", zIndex: 10, color: "black"
          }}
        >
          {data.map(({ place_id, description }) => (
            <div
              key={place_id}
              onMouseDown={(e) => { e.preventDefault(); handleSelect(description, place_id); }}
              style={{ padding: "8px 10px", cursor: "pointer", background: "white" }}
            >
              {description}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
