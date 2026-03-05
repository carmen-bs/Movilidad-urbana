import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "@/utils/storage";
import { loadJSON, saveJSON } from "@/utils/storage";
import Header from "@/components/Header";
import MapView from "@/components/MapView";
import MarkersPanel from "@/components/MarkersPanel";
import RoutesPanel from "@/components/RoutesPanel";
import ZonesPanel from "@/components/ZonesPanel";
import type { Marker } from "@/components/MarkersPanel";
import type { RouteResult } from "@/components/RoutesPanel";
import type { Zone } from "@/components/ZonesPanel";

const HomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) navigate("/login");
  }, [navigate]);

  const [markers, setMarkers] = useState<Marker[]>(() => loadJSON("markers", []));
  const [routeResult, setRouteResult] = useState<RouteResult | null>(() => loadJSON("routeResult", null));
  const [zones, setZones] = useState<Zone[]>(() => loadJSON("zones", []));
  const [isDrawingZone, setIsDrawingZone] = useState(false);
  const [tempZone, setTempZone] = useState<{ lat: number; lng: number }[]>([]);

  useEffect(() => saveJSON("markers", markers), [markers]);
  useEffect(() => saveJSON("routeResult", routeResult), [routeResult]);
  useEffect(() => saveJSON("zones", zones), [zones]);

  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      if (isDrawingZone) {
        setTempZone((prev) => [...prev, { lat, lng }]);
      } else {
        setMarkers((prev) => [...prev, { lat, lng }]);
      }
    },
    [isDrawingZone]
  );

  const removeMarker = (i: number) => {
    setMarkers((prev) => prev.filter((_, idx) => idx !== i));
  };

  const closeZone = () => {
    if (tempZone.length >= 3) {
      setZones((prev) => [...prev, { points: tempZone }]);
    }
    setTempZone([]);
    setIsDrawingZone(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero */}
      <div
        className="px-6 py-6"
        style={{
          background:
            "linear-gradient(180deg, hsl(218 70% 14% / 0.06) 0%, transparent 100%)",
        }}
      >
        <h2 className="text-xl font-bold text-foreground">Visualiza rutas y zonas urbanas</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Marca puntos, calcula rutas y define zonas directamente sobre el mapa.
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-[360px] shrink-0 bg-card border border-border rounded-lg p-5 flex flex-col gap-6 overflow-y-auto shadow-card">
          <MarkersPanel
            markers={markers}
            onRemove={removeMarker}
            onClearAll={() => {
              setMarkers([]);
            }}
          />
          <div className="h-px bg-border" />
          <RoutesPanel routeResult={routeResult} onCalculate={setRouteResult} />
          <div className="h-px bg-border" />
          <ZonesPanel
            zones={zones}
            isDrawing={isDrawingZone}
            tempZone={tempZone}
            onStartDrawing={() => {
              setIsDrawingZone(true);
              setTempZone([]);
            }}
            onCloseZone={closeZone}
            onCancel={() => {
              setIsDrawingZone(false);
              setTempZone([]);
            }}
            onRemoveZone={(i) => setZones((prev) => prev.filter((_, idx) => idx !== i))}
          />
        </aside>

        {/* Map */}
        <div className="flex-1 bg-card border border-border rounded-lg shadow-card overflow-hidden">
          <MapView
            markers={markers}
            routeResult={routeResult}
            zones={zones}
            tempZone={tempZone}
            isDrawingZone={isDrawingZone}
            onMapClick={handleMapClick}
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
