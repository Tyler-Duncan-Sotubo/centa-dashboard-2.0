/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { useEffect, useRef } from "react";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-geosearch/dist/geosearch.css";

// Fix Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-shadow.png",
});

const SearchControl = ({ setCoords }: { setCoords: (coords: any) => void }) => {
  const map = useMap();
  const controlRef = useRef<any>(null);

  useEffect(() => {
    const provider = new OpenStreetMapProvider();

    const searchControl = new (GeoSearchControl as any)({
      provider,
      style: "bar",
      autoClose: true,
      showMarker: false,
      retainZoomLevel: false,
      animateZoom: true,
    });

    controlRef.current = searchControl;
    map.addControl(searchControl);

    map.on("geosearch/showlocation", (e: any) => {
      const { x, y } = e.location;
      setCoords({ lat: y, lng: x });
      map.setView([y, x], 15);
    });

    return () => {
      if (controlRef.current) {
        map.removeControl(controlRef.current);
      }
    };
  }, [map, setCoords]);

  return null;
};

const MapClickHandler = ({
  setCoords,
}: {
  setCoords: (coords: { lat: number; lng: number }) => void;
}) => {
  useMapEvents({
    click(e) {
      setCoords(e.latlng);
    },
  });
  return null;
};

export default function MapComponent({
  coords,
  setCoords,
}: {
  coords: { lat: number; lng: number };
  setCoords: (coords: { lat: number; lng: number }) => void;
}) {
  return (
    <MapContainer
      center={[coords.lat, coords.lng]}
      zoom={13}
      scrollWheelZoom
      className="h-full z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[coords.lat, coords.lng]} />
      <SearchControl setCoords={setCoords} />
      <MapClickHandler setCoords={setCoords} />
    </MapContainer>
  );
}
