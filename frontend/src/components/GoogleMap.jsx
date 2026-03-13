import { useEffect, useRef } from 'react';

export default function GoogleMap({ points, center, zoom = 12 }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const routingControlRef = useRef(null); // Ref to store the routing control

  useEffect(() => {
    if (!mapRef.current || !window.L) return;

    if (!mapInstanceRef.current) {
      const mapCenter = center || [18.5204, 73.8567];
      mapInstanceRef.current = window.L.map(mapRef.current).setView(mapCenter, zoom);

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);
    }

    updateMarkers(points);
  }, [points]);

  const showRoute = (destLat, destLng) => {
    if (!mapInstanceRef.current || !window.L.Routing) return;

    // Remove existing route if there is one
    if (routingControlRef.current) {
      mapInstanceRef.current.removeControl(routingControlRef.current);
    }

    // Get user's current location (using center as fallback)
    const startPoint = center || [18.5204, 73.8567];

    // Create the new route
    routingControlRef.current = window.L.Routing.control({
      waypoints: [
        window.L.latLng(startPoint[0], startPoint[1]),
        window.L.latLng(destLat, destLng)
      ],
      lineOptions: {
        styles: [{ color: '#16a34a', weight: 6 }] // EcoConnect green route line
      },
      createMarker: () => null, // Prevents the routing library from adding extra markers
      addWaypoints: false,
      routeWhileDragging: false
    }).addTo(mapInstanceRef.current);
  };

  const updateMarkers = (pointsToAdd) => {
    if (!mapInstanceRef.current || !window.L) return;

    pointsToAdd.forEach(point => {
      if (point.lat && point.lng) {
        const marker = window.L.marker([parseFloat(point.lat), parseFloat(point.lng)])
          .addTo(mapInstanceRef.current);

        // Update popup to include a "Get Directions" button
        const popupContent = document.createElement('div');
        popupContent.innerHTML = `
          <div style="font-family: sans-serif;">
            <h3 style="margin:0">${point.name}</h3>
            <p>${point.address}</p>
            <button id="route-btn-${point._id}" style="background:#16a34a; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer; width:100%;">
              Get Directions
            </button>
          </div>
        `;

        marker.bindPopup(popupContent);

        // Add event listener to the button inside the popup
        marker.on('popupopen', () => {
          document.getElementById(`route-btn-${point._id}`).onclick = () => {
            showRoute(parseFloat(point.lat), parseFloat(point.lng));
          };
        });
      }
    });
  };

  return <div ref={mapRef} style={{ width: '100%', height: '400px', borderRadius: '12px' }} />;
}