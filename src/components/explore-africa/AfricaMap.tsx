import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { countriesData, CountryData, Landmark } from "../../data/explore-africa/data";
import { 
  Compass, 
  Info, 
  Check, 
  Search, 
  Map, 
  RefreshCw, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  Eye, 
  Heart, 
  Star, 
  ArrowRightLeft, 
  Calendar, 
  Users, 
  Languages, 
  Coins, 
  Film, 
  TrendingUp, 
  Sparkles, 
  Building,
  MapPin,
  ChevronDown,
  Globe,
  Copy,
  ExternalLink,
  Navigation
} from "lucide-react";

interface AfricaMapProps {
  onSelectCountry: (id: string | null) => void;
  selectedCountryId: string | null;
}

const countryCoordinates: Record<string, { lat: number; lng: number; zoom: number }> = {
  burkina_faso: { lat: 12.2383, lng: -1.5616, zoom: 7 },
  maroc: { lat: 31.7917, lng: -7.0926, zoom: 5 },
  senegal: { lat: 14.4974, lng: -14.4524, zoom: 6 },
  egypt: { lat: 26.8206, lng: 30.8025, zoom: 5 },
  rdc: { lat: -4.0383, lng: 21.7587, zoom: 5 },
  cote_divoire: { lat: 7.5399, lng: -5.5471, zoom: 6 },
  kenya: { lat: -0.0236, lng: 37.9062, zoom: 5 },
  south_africa: { lat: -30.5595, lng: 22.9375, zoom: 5 }
};

// Helper function to detect which country geographic boundaries were clicked
function getCountryFromLatLng(lat: number, lng: number): string | null {
  // Morocco
  if (lat >= 21.0 && lat <= 36.1 && lng >= -17.5 && lng <= -1.0) {
    return "maroc";
  }
  // Egypt
  if (lat >= 21.0 && lat <= 32.0 && lng >= 24.0 && lng <= 36.0) {
    return "egypt";
  }
  // Senegal
  if (lat >= 12.0 && lat <= 17.0 && lng >= -18.0 && lng <= -11.0) {
    return "senegal";
  }
  // Côte d'Ivoire
  if (lat >= 4.0 && lat <= 11.0 && lng >= -9.0 && lng <= -2.5) {
    return "cote_divoire";
  }
  // Burkina Faso
  if (lat >= 9.0 && lat <= 15.5 && lng >= -6.0 && lng <= 2.5) {
    return "burkina_faso";
  }
  // Kenya
  if (lat >= -5.0 && lat <= 5.5 && lng >= 33.5 && lng <= 42.1) {
    return "kenya";
  }
  // Democratic Republic of the Congo (RDC)
  if (lat >= -14.0 && lat <= 6.0 && lng >= 11.5 && lng <= 31.5) {
    return "rdc";
  }
  // South Africa
  if (lat >= -35.0 && lat <= -21.0 && lng >= 15.0 && lng <= 34.0) {
    return "south_africa";
  }

  // Proximity fallback (within 7 degrees of any center)
  let closestId: string | null = null;
  let minDistance = Infinity;
  Object.entries(countryCoordinates).forEach(([id, coords]) => {
    const dx = lat - coords.lat;
    const dy = lng - coords.lng;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 7.0 && dist < minDistance) {
      minDistance = dist;
      closestId = id;
    }
  });

  return closestId;
}

type MapStyle = "voyager" | "satellite" | "dark";
type TabFilter = "touristic" | "commercial" | "cultural" | "demographics";

export default function AfricaMap({ onSelectCountry, selectedCountryId }: AfricaMapProps) {
  const [hoveredCountryId, setHoveredCountryId] = useState<string | null>(null);
  const [mapStyle, setMapStyle] = useState<MapStyle>("voyager");
  const [isLeafletLoaded, setIsLeafletLoaded] = useState(false);

  // Flight-Search Style States
  const [departureCity, setDepartureCity] = useState("Ouagadougou (OUA)");
  const [destinationSearch, setDestinationSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabFilter>("touristic");
  const [selectedSeason, setSelectedSeason] = useState("Toute l'année");
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("travel_favorites");
      return stored ? JSON.parse(stored) : ["bk_sindou", "bk_tiebele"];
    } catch {
      return ["bk_sindou", "bk_tiebele"];
    }
  });
  const [focusedLandmarkId, setFocusedLandmarkId] = useState<string | null>("bk_sindou");
  const [copiedLandmarkId, setCopiedLandmarkId] = useState<string | null>(null);
  const [isSeasonDropdownOpen, setIsSeasonDropdownOpen] = useState(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletInstance = useRef<any>(null);
  const tileLayerInstance = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const circlesRef = useRef<Record<string, any>>({});
  const landmarkMarkersRef = useRef<Record<string, any>>({});
  const previousSelectedIdRef = useRef<string | null>(selectedCountryId);

  // Sync favorites with localStorage
  useEffect(() => {
    localStorage.setItem("travel_favorites", JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering card selection
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(favId => favId !== id) : [...prev, id]
    );
  };

  // Switch Departure cities choices
  const arrivalCities = [
    "Ouagadougou (OUA)",
    "Bobo-Dioulasso (BOY)",
    "Banfora (BNF)",
    "Koudougou (KDY)"
  ];

  // List of countries to fallback
  const availableCountries = Object.values(countriesData);

  // Current active country data
  const currentCountry = selectedCountryId ? countriesData[selectedCountryId] : countriesData["burkina_faso"];

  // Filter landmarks by search criteria & active categories
  const filteredLandmarks = currentCountry.landmarks.filter(land => {
    // Correct list tab categorization mapping
    if (activeTab === "touristic" && land.category !== "touristic") return false;
    if (activeTab === "commercial" && land.category !== "commercial") return false;
    if (activeTab === "cultural" && land.category !== "cultural") return false;

    // Search query matches
    const matchesSearch = 
      land.name.toLowerCase().includes(destinationSearch.toLowerCase()) ||
      land.location.toLowerCase().includes(destinationSearch.toLowerCase()) ||
      land.description.toLowerCase().includes(destinationSearch.toLowerCase());
    
    // Season matches
    if (selectedSeason !== "Toute l'année") {
      const isDryPlace = land.dateRange?.toLowerCase().includes("nov") || land.dateRange?.toLowerCase().includes("oct");
      const isWetPlace = land.dateRange?.toLowerCase().includes("année") || land.dateRange?.toLowerCase().includes("visite");
      if (selectedSeason === "Saison Sèche (Nov-Avril)" && !isDryPlace && !isWetPlace) return false;
    }

    return matchesSearch;
  });

  // Load Leaflet Script & CSS from CDN dynamically
  useEffect(() => {
    let active = true;

    const loadLeaflet = async () => {
      if (!document.getElementById("leaflet-cdn-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-cdn-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
        link.crossOrigin = "";
        document.head.appendChild(link);
      }

      if (!(window as any).L) {
        const script = document.createElement("script");
        script.id = "leaflet-cdn-js";
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
        script.crossOrigin = "";
        script.onload = () => {
          if (active) setIsLeafletLoaded(true);
        };
        document.head.appendChild(script);
      } else {
        setIsLeafletLoaded(true);
      }
    };

    loadLeaflet();

    return () => {
      active = false;
    };
  }, []);

  // Initialize and update the Leaflet map instance
  useEffect(() => {
    if (!isLeafletLoaded || !mapContainerRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    if (!leafletInstance.current) {
      const initialCenter = selectedCountryId 
        ? [countryCoordinates[selectedCountryId].lat, countryCoordinates[selectedCountryId].lng]
        : [8.4, 15.0];
      const initialZoom = selectedCountryId 
        ? countryCoordinates[selectedCountryId].zoom
        : 3.2;

      const map = L.map(mapContainerRef.current, {
        center: initialCenter, 
        zoom: initialZoom,
        minZoom: 2,
        maxZoom: 12,
        zoomControl: false,
        attributionControl: true,
      });

      // Add map click backdrop tracking 
      map.on("click", (e: any) => {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        const clickedId = getCountryFromLatLng(lat, lng);
        if (clickedId) {
          onSelectCountry(clickedId);
          const coords = countryCoordinates[clickedId];
          map.flyTo([coords.lat, coords.lng], coords.zoom, { duration: 1.2 });
        }
      });

      leafletInstance.current = map;
      L.control.zoom({ position: "topright" }).addTo(map);
    }

    const map = leafletInstance.current;

    // Update Tile style layer
    if (tileLayerInstance.current) {
      map.removeLayer(tileLayerInstance.current);
    }

    let url = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
    let attr = '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>';

    if (mapStyle === "satellite") {
      url = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
      attr = "Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community";
    } else if (mapStyle === "dark") {
      url = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
      attr = '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>';
    }

    tileLayerInstance.current = L.tileLayer(url, {
      attribution: attr,
    }).addTo(map);

    // Clear old elements
    Object.values(markersRef.current).forEach(marker => map.removeLayer(marker));
    Object.values(circlesRef.current).forEach(circle => map.removeLayer(circle));
    Object.values(landmarkMarkersRef.current).forEach(mark => map.removeLayer(mark));

    markersRef.current = {};
    circlesRef.current = {};
    landmarkMarkersRef.current = {};

    // 1. Add interactive Markers and Shaded Region Circles for the high-level countries
    Object.entries(countryCoordinates).forEach(([id, coords]) => {
      const countryMeta = countriesData[id];
      if (!countryMeta) return;

      const isSelected = selectedCountryId === id;

      const circle = L.circle([coords.lat, coords.lng], {
        color: isSelected ? "#e11d48" : "#78716c",
        fillColor: isSelected ? "#e11d48" : "#a8a29e",
        fillOpacity: isSelected ? 0.22 : 0.05,
        radius: isSelected ? 400000 : 250000,
        weight: isSelected ? 2 : 1,
        dashArray: isSelected ? "3,3" : undefined,
      }).addTo(map);

      circlesRef.current[id] = circle;

      const ringColorClass = isSelected ? "bg-rose-500/30 border-rose-500 scale-110" : "bg-stone-500/20 border-stone-400";
      const badgeBorderClass = isSelected ? "border-rose-500 bg-rose-50 scale-110 shadow-md ring-4 ring-rose-500/20" : "border-stone-200 bg-white shadow-sm";

      const divIcon = L.divIcon({
        className: "custom-leaflet-pin-wrapper",
        html: `
          <div class="relative flex items-center justify-center pointer-events-auto" style="transform: translate(-16px, -16px)">
            <div class="absolute w-10 h-10 rounded-full border-2 animate-ping opacity-50 ${ringColorClass}"></div>
            <div class="relative flex items-center justify-center w-8 h-8 rounded-full border border-stone-300 bg-white font-sans text-lg transition-all duration-300 hover:scale-125 cursor-pointer ${badgeBorderClass}">
              ${countryMeta.flagEmoji}
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [0, 0],
      });

      const marker = L.marker([coords.lat, coords.lng], { icon: divIcon })
        .addTo(map)
        .on("click", (e: any) => {
          if (e.originalEvent) {
            e.originalEvent.stopPropagation();
          }
          onSelectCountry(id);
          map.flyTo([coords.lat, coords.lng], coords.zoom, { duration: 1.2 });
        })
        .on("mouseover", () => {
          setHoveredCountryId(id);
        })
        .on("mouseout", () => {
          setHoveredCountryId(null);
        });

      circle.on("click", (e: any) => {
        if (e.originalEvent) {
          e.originalEvent.stopPropagation();
        }
        onSelectCountry(id);
        map.flyTo([coords.lat, coords.lng], coords.zoom, { duration: 1.2 });
      });

      markersRef.current[id] = marker;
    });

    // 2. Add fine-grained local landmarks markers if a country is active
    if (selectedCountryId && currentCountry && currentCountry.landmarks) {
      currentCountry.landmarks.forEach((land) => {
        if (land.lat && land.lng) {
          const isFocused = focusedLandmarkId === land.id;
          const pinColor = 
            land.category === "touristic" ? "bg-rose-500" : 
            land.category === "cultural" ? "bg-amber-500" : 
            "bg-emerald-500";
          const borderHighlight = isFocused ? "ring-4 ring-rose-500/30 scale-110 shadow-lg border-rose-600" : "border-white hover:scale-105 shadow-sm";

          const landIcon = L.divIcon({
            className: "custom-landmark-div-icon",
            html: `
              <div class="flex flex-col items-center pointer-events-auto" style="transform: translate(-50px, -24px)">
                <div class="bg-stone-900 border ${borderHighlight} rounded-lg px-2 py-1 text-white font-sans text-[10px] font-bold shadow-md whitespace-nowrap flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full ${pinColor}"></span>
                  <span>${land.name}</span>
                </div>
                <div class="w-2 h-2 bg-stone-900 rotate-45 border-r border-b border-white -mt-1 shadow-sm"></div>
              </div>
            `,
            iconSize: [100, 32],
            iconAnchor: [0, 0]
          });

          const landMarker = L.marker([land.lat, land.lng], { icon: landIcon })
            .addTo(map)
            .on("click", () => {
              setFocusedLandmarkId(land.id);
              const cardElement = document.getElementById(`landmark-card-${land.id}`);
              cardElement?.scrollIntoView({ behavior: "smooth", block: "nearest" });
            });

          landmarkMarkersRef.current[land.id] = landMarker;
        }
      });
    }

  }, [isLeafletLoaded, mapStyle, selectedCountryId, currentCountry, focusedLandmarkId, activeTab]);

  // Handle zooming / flying on list item click
  const handleSelectLandmark = (land: Landmark) => {
    setFocusedLandmarkId(land.id);
    if (leafletInstance.current && land.lat && land.lng) {
      leafletInstance.current.flyTo([land.lat, land.lng], 9.5, {
        duration: 1.5,
        easeLinearity: 0.25
      });
    }
  };

  // Flying map to country coordinate changes
  useEffect(() => {
    if (!leafletInstance.current) return;

    if (!selectedCountryId) {
      // Zoom out to global view of the continent
      leafletInstance.current.flyTo([8.4, 15.0], 3.2, {
        duration: 1.4,
        easeLinearity: 0.25
      });
      previousSelectedIdRef.current = null;
      return;
    }

    const coords = countryCoordinates[selectedCountryId];
    if (coords) {
      leafletInstance.current.flyTo([coords.lat, coords.lng], coords.zoom, {
        duration: 1.4,
        easeLinearity: 0.25
      });
    }
    previousSelectedIdRef.current = selectedCountryId;
  }, [selectedCountryId]);

  const resetMapView = () => {
    onSelectCountry(null);
  };

  const focusedLandmark = selectedCountryId && currentCountry?.landmarks
    ? currentCountry.landmarks.find(l => l.id === focusedLandmarkId)
    : null;

  return (
    <div id="africa-map-section" className="relative w-full flex flex-col bg-stone-50 rounded-3xl border border-stone-200/60 overflow-hidden shadow-md min-h-[600px] h-[650px] lg:h-[700px] z-10">
      
      {/* Map Header Controls */}
      <div className="bg-white/95 backdrop-blur-md px-4 py-3.5 border-b border-stone-150 flex items-center justify-between gap-2 z-10 shrink-0">
        <div className="flex items-center gap-2">
          <Map className="w-4 h-4 text-rose-600 animate-pulse" />
          <span className="text-xs font-extrabold text-stone-750 uppercase tracking-widest font-sans">
            {selectedCountryId 
              ? `Localisateur Géographique : ${currentCountry.name} ${currentCountry.flagEmoji}`
              : "Carte Interactive d'Afrique 🌍"}
          </span>
        </div>

        {/* Map Style Selection */}
        <div className="flex bg-stone-100 p-0.5 rounded-lg border border-stone-200 text-[10px]">
          <button
            onClick={() => setMapStyle("voyager")}
            className={`font-sans font-semibold px-2.5 py-1 rounded-md transition-all ${
              mapStyle === "voyager"
                ? "bg-white text-stone-900 shadow-xs"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            Voyager
          </button>
          <button
            onClick={() => setMapStyle("satellite")}
            className={`font-sans font-semibold px-2.5 py-1 rounded-md transition-all ${
              mapStyle === "satellite"
                ? "bg-white text-stone-900 shadow-xs"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => setMapStyle("dark")}
            className={`font-sans font-semibold px-2.5 py-1 rounded-md transition-all ${
              mapStyle === "dark"
                ? "bg-white text-stone-900 shadow-xs"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            Sombre
          </button>
        </div>
      </div>

      {/* Main Map Content Wrapper containing the leaflet container and floating overlays */}
      <div className="flex-1 w-full relative z-1 overflow-hidden">
        
        {/* Leaflet Frame Container */}
        {!isLeafletLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-100 text-stone-400 gap-3 z-35">
            <RefreshCw className="w-8 h-8 animate-spin text-rose-500" />
            <p className="text-sm font-sans font-medium">Chargement du repère géospatial...</p>
          </div>
        )}
        <div
          id="africa-leaflet-map-container"
          ref={mapContainerRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          style={{ height: "100%", width: "100%" }}
        />



        {/* Center Map Control Overlay */}
        <div className="absolute bottom-4 right-4 z-40 flex flex-col gap-1.5">
          <button
            onClick={() => {
              const coords = countryCoordinates[selectedCountryId || "burkina_faso"];
              if (leafletInstance.current && coords) {
                leafletInstance.current.flyTo([coords.lat, coords.lng], coords.zoom, { duration: 1.2 });
              }
            }}
            title="Recentrer sur le pays"
            className="p-2.5 bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 rounded-xl shadow-md transition flex items-center justify-center cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-stone-600" />
          </button>
          <button
            onClick={resetMapView}
            title="Centrer sur toute l'Afrique"
            className="p-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-md transition flex items-center justify-center cursor-pointer"
          >
            <Compass className="w-4 h-4" />
          </button>
        </div>

        {/* Hovered metadata popup overlay */}
        <AnimatePresence>
          {hoveredCountryId && countriesData[hoveredCountryId] && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute bottom-4 left-4 right-16 bg-stone-950/95 backdrop-blur-md border border-stone-800 text-stone-100 p-4 rounded-xl shadow-xl flex items-center justify-between gap-4 z-40"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl shrink-0" role="img">
                  {countriesData[hoveredCountryId].flagEmoji}
                </span>
                <div>
                  <h4 className="font-sans font-bold text-xs text-amber-400">
                    {countriesData[hoveredCountryId].name}
                  </h4>
                  <p className="text-[10px] text-stone-300 font-sans line-clamp-1">
                    {countriesData[hoveredCountryId].tagline}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[9px] font-mono text-stone-400 uppercase tracking-wider leading-none">Capitale</p>
                <p className="text-xs font-semibold text-stone-100 mt-1">{countriesData[hoveredCountryId].capital}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
