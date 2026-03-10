import { useEffect, useRef } from 'react';

export default function GoogleMap({ points, center, zoom = 12 }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!mapRef.current || !window.L) return;

    // Initialize map
    const mapCenter = center || [18.5204, 73.8567]; // Pune
    mapInstanceRef.current = window.L.map(mapRef.current).setView(mapCenter, zoom);

    // Add tile layer
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);

    // Add markers
    updateMarkers(points);
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current && window.L) {
      updateMarkers(points);
    }
  }, [points]);

  const updateMarkers = (pointsToAdd) => {
    if (!mapInstanceRef.current || !window.L) return;

    // Clear existing markers
    markersRef.current.forEach(marker => mapInstanceRef.current.removeLayer(marker));
    markersRef.current = [];

    if (!pointsToAdd || pointsToAdd.length === 0) return;

    // Add new markers
    pointsToAdd.forEach(point => {
      if (point.lat && point.lng) {
        const iconEmoji = point.type === 'Recycling Center' ? '♻️' : point.type === 'E-Waste Drop' ? '💻' : point.type === 'Organic Waste' ? '🥬' : '⚠️';

        // Create custom HTML icon with emoji
        const customIcon = window.L.divIcon({
          html: `
            <div style="
              display: flex;
              align-items: center;
              justify-content: center;
              width: 40px;
              height: 40px;
              background: #16a34a;
              border: 3px solid white;
              border-radius: 50%;
              font-size: 20px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.2);
              cursor: pointer;
            ">
              ${iconEmoji}
            </div>
          `,
          iconSize: [40, 40],
          className: 'custom-marker',
        });

        const marker = window.L.marker([parseFloat(point.lat), parseFloat(point.lng)], {
          icon: customIcon,
        }).addTo(mapInstanceRef.current);

        // Add popup
        marker.bindPopup(`
          <div style="font-family: Arial, sans-serif; max-width: 250px;">
            <h3 style="margin: 0 0 8px 0; color: #14532d; font-size: 16px; font-weight: bold;">${iconEmoji} ${point.name}</h3>
            <p style="margin: 4px 0; font-size: 13px;"><strong>Type:</strong> ${point.type}</p>
            <p style="margin: 4px 0; font-size: 13px;"><strong>Address:</strong> ${point.address}</p>
            <p style="margin: 4px 0; font-size: 13px;"><strong>Hours:</strong> ${point.hours}</p>
            <p style="margin: 4px 0; font-size: 13px;"><strong>Accepts:</strong> ${point.accepts.join(', ')}</p>
            <p style="margin: 4px 0; font-size: 13px; color: #16a34a;"><strong>Distance:</strong> ${point.distance}</p>
          </div>
        `);

        markersRef.current.push(marker);
      }
    });

    // Fit bounds if there are valid markers
    const validPoints = pointsToAdd.filter(p => p.lat && p.lng);
    if (validPoints.length > 0) {
      const bounds = window.L.latLngBounds(
        validPoints.map(p => [parseFloat(p.lat), parseFloat(p.lng)])
      );
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: '400px',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
      }}
    />
  );
}