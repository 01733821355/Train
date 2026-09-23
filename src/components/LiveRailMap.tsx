import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import L from 'leaflet';
import { Station, LiveTrainStatus, ScreenCustomizationSettings, DEFAULT_SCREEN_SETTINGS } from '../types';
import { BANGLADESH_STATIONS } from '../data/stations';
import {
  BANGLADESH_RAIL_NETWORK,
  BANGLADESH_RAIL_NETWORK_SCHEMATIC,
  INLINE_RAIL_LANDMARKS,
  InlineRailLandmark,
  RailLineSegment,
} from '../data/railNetwork';
import { toBengaliNumber, calculateDistanceKm, getTrackSegmentOfLength } from '../utils/geoUtils';
import { UpcomingStopsTimeline } from './UpcomingStopsTimeline';
import { UserProximityCard } from './UserProximityCard';
import {
  Activity,
  Layers,
  MapPin,
  Compass,
  Radio,
  LocateFixed,
  AlertTriangle,
  Info,
  Sliders,
  CheckCircle2,
  Train as TrainIcon,
  Navigation,
  Eye,
  Clock,
  Sparkles,
  Zap,
  Target,
  Ticket,
  ChevronDown,
  ChevronUp,
  Settings2,
  Route,
  Anchor,
  X,
  ExternalLink,
} from 'lucide-react';

interface LiveRailMapProps {
  trainStatuses: LiveTrainStatus[];
  selectedTrainId: string | null;
  onSelectTrain: (trainId: string) => void;
  onSelectStation: (station: Station) => void;
  theme: 'light' | 'dark';
  onOpenTrafficScanner?: () => void;
  onTimeShift?: (minutes: number) => void;
  onOpenTicketBooking?: (trainId?: string) => void;
  settings?: ScreenCustomizationSettings;
  onUpdateSettings?: (settings: ScreenCustomizationSettings) => void;
  onOpenSettingsModal?: () => void;
}

interface UserLocationInfo {
  lat: number;
  lng: number;
  nearestStation: Station | null;
  stationDistanceKm: number;
  nearestTrainStatus: LiveTrainStatus | null;
  trainDistanceKm: number;
}

interface DetectedSegmentCard {
  segment: RailLineSegment;
  activeTrains: LiveTrainStatus[];
  latlng: [number, number];
}

type MapProvider = 'google-roadmap' | 'google-hybrid' | 'google-traffic' | 'carto';

export const LiveRailMap: React.FC<LiveRailMapProps> = ({
  trainStatuses,
  selectedTrainId,
  onSelectTrain,
  onSelectStation,
  theme,
  onOpenTrafficScanner,
  onTimeShift,
  onOpenTicketBooking,
  settings,
  onUpdateSettings,
  onOpenSettingsModal,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const railwayOverlayLayerRef = useRef<L.TileLayer | null>(null);

  const trainMarkersLayerRef = useRef<L.LayerGroup | null>(null);
  const trafficCongestionLayerRef = useRef<L.LayerGroup | null>(null);
  const stationsLayerRef = useRef<L.LayerGroup | null>(null);
  const routesLayerRef = useRef<L.LayerGroup | null>(null);
  const landmarksLayerRef = useRef<L.LayerGroup | null>(null);
  const userLocationLayerRef = useRef<L.LayerGroup | null>(null);

  const effectiveSettings = settings || DEFAULT_SCREEN_SETTINGS;
  const [soloFocusOverride, setSoloFocusOverride] = useState<boolean | null>(null);
  const effectiveSoloMode =
    soloFocusOverride !== null ? soloFocusOverride : effectiveSettings.showSoloTrainFocus;

  const selectedStatus = useMemo(
    () => trainStatuses.find((s) => s.train.id === selectedTrainId) || null,
    [trainStatuses, selectedTrainId]
  );

  const [mapProvider, setMapProvider] = useState<MapProvider>('google-roadmap');
  // Default showOpenRailwayOverlay to true so accurate railway tracks from OpenRailwayMap render directly on top of Google Maps
  const [showOpenRailwayOverlay, setShowOpenRailwayOverlay] = useState(true);
  const [railMappingMode, setRailMappingMode] = useState<'geo' | 'schematic'>('geo');
  const [highlightInLinePlaces, setHighlightInLinePlaces] = useState(true);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [selectedLandmark, setSelectedLandmark] = useState<InlineRailLandmark | null>(null);

  const [showLegend, setShowLegend] = useState(false);
  const [googleTrafficMode, setGoogleTrafficMode] = useState(true);
  const [userLocation, setUserLocation] = useState<UserLocationInfo | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [detectedSegment, setDetectedSegment] = useState<DetectedSegmentCard | null>(null);
  const [activeTrainIndex, setActiveTrainIndex] = useState(0);
  const [isBannerCollapsed, setIsBannerCollapsed] = useState(false);

  const isLight = theme === 'light';

  // Tile layer configurations
  const getTileConfig = useCallback((provider: MapProvider) => {
    switch (provider) {
      case 'google-roadmap':
        return {
          url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
          options: {
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
            maxZoom: 20,
            attribution: '&copy; Google Maps',
          },
        };
      case 'google-hybrid':
        return {
          url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
          options: {
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
            maxZoom: 20,
            attribution: '&copy; Google Maps Satellite',
          },
        };
      case 'google-traffic':
        return {
          url: 'https://mt1.google.com/vt/lyrs=m,traffic&x={x}&y={y}&z={z}',
          options: {
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
            maxZoom: 20,
            attribution: '&copy; Google Maps Traffic',
          },
        };
      case 'carto':
      default:
        return {
          url: isLight
            ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
            : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
          options: {
            subdomains: 'abcd',
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap, &copy; CARTO',
          },
        };
    }
  }, [isLight]);

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [23.85, 90.35],
      zoom: 7,
      minZoom: 6,
      maxZoom: 18,
      zoomControl: false,
    });

    const tileCfg = getTileConfig('google-roadmap');
    const initialTileLayer = L.tileLayer(tileCfg.url, tileCfg.options);
    initialTileLayer.addTo(map);
    baseTileLayerRef.current = initialTileLayer;

    // Zoom control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Initialize layer groups
    routesLayerRef.current = L.layerGroup().addTo(map);
    trafficCongestionLayerRef.current = L.layerGroup().addTo(map);
    stationsLayerRef.current = L.layerGroup().addTo(map);
    landmarksLayerRef.current = L.layerGroup().addTo(map);
    trainMarkersLayerRef.current = L.layerGroup().addTo(map);
    userLocationLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    // Invalidate size immediately and after slight delay to ensure mobile layout fits container perfectly
    map.invalidateSize();
    const timeoutId = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    // Listen to container resizing (e.g. mobile keyboard, tab switcher, orientation change)
    let resizeObserver: ResizeObserver | null = null;
    if (window.ResizeObserver && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      clearTimeout(timeoutId);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [getTileConfig]);

  // 2. Switch Base Map Tiles (Google Maps, Satellite, Traffic, etc.)
  useEffect(() => {
    if (!mapInstanceRef.current || !baseTileLayerRef.current) return;

    mapInstanceRef.current.removeLayer(baseTileLayerRef.current);
    const tileCfg = getTileConfig(mapProvider);
    const newTileLayer = L.tileLayer(tileCfg.url, tileCfg.options);
    newTileLayer.addTo(mapInstanceRef.current);
    baseTileLayerRef.current = newTileLayer;
  }, [mapProvider, getTileConfig]);

  // 3. OpenRailwayMap Track Overlay Toggle
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (showOpenRailwayOverlay) {
      if (!railwayOverlayLayerRef.current) {
        railwayOverlayLayerRef.current = L.tileLayer(
          'https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png',
          {
            maxZoom: 19,
            attribution: '&copy; OpenRailwayMap',
            opacity: 0.85,
          }
        );
      }
      railwayOverlayLayerRef.current.addTo(mapInstanceRef.current);
    } else {
      if (railwayOverlayLayerRef.current && mapInstanceRef.current.hasLayer(railwayOverlayLayerRef.current)) {
        mapInstanceRef.current.removeLayer(railwayOverlayLayerRef.current);
      }
    }
  }, [showOpenRailwayOverlay]);

  // 4. Render Railway Network, Stations & Highlighted In-Line Places
  useEffect(() => {
    if (!mapInstanceRef.current || !routesLayerRef.current || !stationsLayerRef.current) return;

    routesLayerRef.current.clearLayers();
    stationsLayerRef.current.clearLayers();
    if (landmarksLayerRef.current) {
      landmarksLayerRef.current.clearLayers();
    }

    // Select active network data based on mapping mode
    const activeSegments =
      railMappingMode === 'geo' ? BANGLADESH_RAIL_NETWORK : BANGLADESH_RAIL_NETWORK_SCHEMATIC;

    // Render Railway Corridors
    activeSegments.forEach((segment) => {
      // Find trains traveling on this segment
      const activeOnSegment = trainStatuses.filter((s) => {
        if (!s.isActive) return false;
        return segment.coordinates.some(
          (c) => calculateDistanceKm(s.currentLat, s.currentLng, c[0], c[1]) < 25
        );
      });

      if (railMappingMode === 'geo') {
        // High-Accuracy Geo-Alignment: Realistic double-line ballast trackbed + core rail line
        const ballastBed = L.polyline(segment.coordinates, {
          color: isLight ? '#334155' : '#0f172a',
          weight: 5.5,
          opacity: 0.55,
          lineCap: 'round',
          lineJoin: 'round',
        });
        ballastBed.addTo(routesLayerRef.current!);

        // Core precision railway track
        const trackColor =
          segment.zone === 'padma'
            ? isLight
              ? '#7c3aed'
              : '#a78bfa'
            : segment.zone === 'west'
            ? isLight
              ? '#0d9488'
              : '#2dd4bf'
            : isLight
            ? '#0284c7'
            : '#38bdf8';

        const trackLine = L.polyline(segment.coordinates, {
          color: trackColor,
          weight: 3,
          opacity: 0.9,
          lineCap: 'round',
          lineJoin: 'round',
        });

        // Interactive Click on Track Line -> Detect Segment & Active Trains
        trackLine.on('click', (e) => {
          setDetectedSegment({
            segment,
            activeTrains: activeOnSegment,
            latlng: [e.latlng.lat, e.latlng.lng],
          });
        });

        const gaugeLabel =
          segment.gauge === 'BROAD_GAUGE'
            ? 'ব্রডগেজ (BG 1676mm)'
            : segment.gauge === 'METER_GAUGE'
            ? 'মিটারগেজ (MG 1000mm)'
            : 'ডুয়েলগেজ (DG 1676/1000mm)';

        trackLine.bindTooltip(
          `<div class="p-1.5 text-xs font-sans">
            <div class="flex items-center gap-1 font-bold text-slate-900">
              <span>${segment.nameBn}</span>
            </div>
            <p class="text-[10px] text-slate-500 font-medium">${segment.nameEn}</p>
            <p class="text-[10px] text-indigo-600 font-semibold mt-0.5">গজ: ${gaugeLabel}</p>
            <p class="text-[10px] font-semibold mt-0.5 ${
              activeOnSegment.length > 0 ? 'text-rose-600' : 'text-emerald-600'
            }">
              ${
                activeOnSegment.length > 0
                  ? `সনাক্তকৃত সচল ট্রেন: ${toBengaliNumber(activeOnSegment.length)} টি`
                  : 'ট্র্যাক ক্লিয়ার (কোনো বিলম্ব নেই)'
              }
            </p>
          </div>`,
          { direction: 'top', offset: [0, -5] }
        );

        trackLine.addTo(routesLayerRef.current!);
      } else {
        // Schematic Mode: Stylized high-contrast geometric transit corridors
        const corridorColor =
          segment.zone === 'padma'
            ? '#9333ea'
            : segment.zone === 'west'
            ? '#059669'
            : '#0284c7';

        const schematicLine = L.polyline(segment.coordinates, {
          color: corridorColor,
          weight: 5,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round',
        });

        schematicLine.on('click', (e) => {
          setDetectedSegment({
            segment,
            activeTrains: activeOnSegment,
            latlng: [e.latlng.lat, e.latlng.lng],
          });
        });

        schematicLine.bindTooltip(
          `<div class="p-1.5 text-xs font-sans">
            <p class="font-bold text-slate-900">${segment.nameBn}</p>
            <p class="text-[10px] text-slate-500 font-medium">স্কিম্যাটিক ট্রানজিট করিডোর</p>
            <p class="text-[10px] font-semibold ${
              activeOnSegment.length > 0 ? 'text-rose-600' : 'text-emerald-600'
            }">
              ${
                activeOnSegment.length > 0
                  ? `সনাক্তকৃত সচল ট্রেন: ${toBengaliNumber(activeOnSegment.length)} টি`
                  : 'ট্র্যাক ক্লিয়ার'
              }
            </p>
          </div>`,
          { direction: 'top', offset: [0, -5] }
        );

        schematicLine.addTo(routesLayerRef.current!);
      }
    });

    // Render Highlighted In-Line Railway Landmarks, Junctions & Bridges
    if (highlightInLinePlaces && landmarksLayerRef.current) {
      INLINE_RAIL_LANDMARKS.forEach((landmark) => {
        const icon =
          landmark.category === 'bridge'
            ? '🌉'
            : landmark.category === 'junction'
            ? '🔀'
            : landmark.category === 'border'
            ? '🌐'
            : '🏛️';

        const colorClasses =
          landmark.category === 'bridge'
            ? isLight
              ? 'bg-cyan-600 text-white border-cyan-400 shadow-cyan-500/40'
              : 'bg-cyan-700 text-white border-cyan-400 shadow-cyan-900/60'
            : landmark.category === 'junction'
            ? isLight
              ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-amber-500/40'
              : 'bg-amber-400 text-slate-950 border-amber-200 shadow-amber-900/60'
            : landmark.category === 'border'
            ? isLight
              ? 'bg-rose-600 text-white border-rose-400 shadow-rose-500/40'
              : 'bg-rose-700 text-white border-rose-400 shadow-rose-900/60'
            : isLight
            ? 'bg-emerald-600 text-white border-emerald-400 shadow-emerald-500/40'
            : 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-emerald-900/60';

        const markerHtml = `
          <div class="inline-landmark-pill group cursor-pointer pointer-events-auto transform transition-all duration-200 hover:scale-110 -translate-x-1/2 -translate-y-full pb-1">
            <div class="flex items-center gap-1 px-2.5 py-1 rounded-full border shadow-xl backdrop-blur-md ${colorClasses} whitespace-nowrap font-sans font-bold text-[10.5px]">
              <span class="text-xs leading-none">${icon}</span>
              <span>${landmark.nameBn}</span>
              <span class="hidden sm:inline-block text-[8.5px] px-1.5 py-0.2 rounded-full font-bold opacity-95 bg-black/20 text-white border border-white/20">${landmark.badgeLabelBn}</span>
            </div>
            <div class="w-2 h-2 mx-auto rounded-full bg-amber-400 border border-black/40 -mt-0.5 shadow-sm"></div>
          </div>
        `;

        const landmarkIcon = L.divIcon({
          className: 'custom-inline-landmark-icon',
          html: markerHtml,
          iconSize: [120, 28],
          iconAnchor: [60, 28],
        });

        const marker = L.marker([landmark.lat, landmark.lng], {
          icon: landmarkIcon,
          zIndexOffset: 800,
        });

        marker.bindTooltip(
          `<div class="p-1.5 text-xs font-sans max-w-[200px]">
            <p class="font-bold text-slate-900 flex items-center gap-1">
              <span>${icon}</span>
              <span>${landmark.nameBn}</span>
            </p>
            <p class="text-[10px] text-slate-500 font-medium">${landmark.nameEn}</p>
            <p class="text-[10px] text-indigo-700 font-semibold mt-0.5">${landmark.badgeLabelBn}</p>
            <p class="text-[9.5px] text-slate-600 mt-1 line-clamp-2">${landmark.descriptionBn}</p>
            <p class="text-[9px] text-emerald-600 font-bold mt-1">ক্লিক করে বিস্তারিত দেখুন</p>
          </div>`,
          { direction: 'top', offset: [0, -28], className: 'custom-leaflet-tooltip' }
        );

        marker.on('click', () => {
          setSelectedLandmark(landmark);
          mapInstanceRef.current?.flyTo([landmark.lat, landmark.lng], Math.max(mapInstanceRef.current.getZoom(), 11), {
            duration: 1,
          });
        });

        marker.addTo(landmarksLayerRef.current!);
      });
    }

    // Render Station Nodes
    BANGLADESH_STATIONS.forEach((station) => {
      const isJunction = station.isJunction;
      const markerHtml = `
        <div class="group relative flex items-center justify-center cursor-pointer">
          <div class="w-3 h-3 rounded-full ${
            isJunction
              ? 'bg-amber-400 ring-4 ring-amber-400/40'
              : isLight
              ? 'bg-slate-800 ring-2 ring-slate-400/60'
              : 'bg-white ring-2 ring-slate-400/40'
          } shadow-md transition-transform group-hover:scale-150"></div>
        </div>
      `;

      const stationIcon = L.divIcon({
        className: 'custom-station-icon',
        html: markerHtml,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

      const marker = L.marker([station.lat, station.lng], { icon: stationIcon });
      marker.bindTooltip(
        `<div class="p-1 text-xs font-sans">
          <p class="font-bold text-slate-900">${station.nameBn}</p>
          <p class="text-[10px] text-slate-600">${station.nameEn} • প্ল্যাটফর্ম: ${toBengaliNumber(
          station.platforms
        )}</p>
        </div>`,
        { direction: 'top', offset: [0, -6], className: 'custom-leaflet-tooltip' }
      );

      marker.on('click', () => {
        onSelectStation(station);
      });

      marker.addTo(stationsLayerRef.current!);
    });
  }, [
    railMappingMode,
    highlightInLinePlaces,
    googleTrafficMode,
    isLight,
    onSelectStation,
    trainStatuses,
  ]);

  // 5. Render Trains & Google Live Traffic Congestion Ribbons
  useEffect(() => {
    if (!mapInstanceRef.current || !trainMarkersLayerRef.current || !trafficCongestionLayerRef.current) return;

    trainMarkersLayerRef.current.clearLayers();
    trafficCongestionLayerRef.current.clearLayers();

    trainStatuses.forEach((status) => {
      const isSelected = selectedTrainId === status.train.id;

      // SOLO TRAIN FOCUS: When a train is selected and solo train mode is active, hide all other trains from the map!
      if (effectiveSoloMode && selectedTrainId && status.train.id !== selectedTrainId) {
        return;
      }

      const { train, currentLat, currentLng, bearing, speedKmH, trafficCondition } = status;

      // Draw glowing route corridor polyline for selected train
      if (isSelected && train.routeCoordinates && train.routeCoordinates.length > 1) {
        L.polyline(train.routeCoordinates, {
          color: '#10b981',
          weight: 7,
          opacity: 0.9,
          dashArray: '10, 10',
          lineCap: 'round',
        }).addTo(trainMarkersLayerRef.current!);
      }

      // Exact 200-Meter Railway Track Highlight & Live Train Position
      if (
        effectiveSettings.showCongestionRibbons &&
        googleTrafficMode &&
        status.isActive &&
        train.routeCoordinates &&
        train.routeCoordinates.length > 1
      ) {
        // Calculate exact 200m track segment along this rail route centered at train's position
        const jam200mPoints = getTrackSegmentOfLength(
          train.routeCoordinates,
          currentLat,
          currentLng,
          0.2 // exactly 200 meters = 0.2 km
        );

        if (jam200mPoints.length >= 2) {
          let trafficColor = '#ef4444'; // Vivid Red (moving passenger GPS jam)
          let glowColor = '#dc2626';

          if (trafficCondition === 'STATION_STOP' || speedKmH < 5) {
            trafficColor = '#b91c1c'; // Deep Dark Red (Station Stop Bottleneck)
            glowColor = '#991b1b';
          } else if (trafficCondition === 'WAITING_CROSSING' || speedKmH < 25) {
            trafficColor = '#e11d48'; // Crossing Congestion Rose-Red
            glowColor = '#be123c';
          }

          // 1. Outer Pulsing Glow Aura for the 200m zone
          L.polyline(jam200mPoints, {
            color: glowColor,
            weight: 14,
            opacity: 0.45,
            lineCap: 'round',
          }).addTo(trafficCongestionLayerRef.current!);

          // 2. Core 200-Meter Traffic Congestion Ribbon (Google Maps Traffic Red)
          const jam200mLine = L.polyline(jam200mPoints, {
            color: trafficColor,
            weight: 8,
            opacity: 0.95,
            lineCap: 'round',
          });

          // 3. Centerline highlight for sharp visibility
          L.polyline(jam200mPoints, {
            color: '#fecdd3',
            weight: 2.5,
            opacity: 1,
            lineCap: 'round',
          }).addTo(trafficCongestionLayerRef.current!);

          jam200mLine.bindTooltip(
            `<div class="p-1.5 text-xs font-sans shadow-lg">
              <div class="flex items-center gap-1.5 font-bold text-emerald-600 mb-0.5">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>${train.nameBn} (${train.number})</span>
              </div>
              <p class="text-[10px] text-slate-700 font-semibold">লাইভ গতি: ${toBengaliNumber(speedKmH)} কিমি/ঘণ্টা</p>
              <p class="text-[10px] text-slate-500 mt-0.5">${status.currentBlockSectionBn}</p>
              <p class="text-[10px] text-blue-600 font-medium">পরবর্তী: ${status.nextStation ? status.nextStation.nameBn : 'পৌঁছেছে'}</p>
            </div>`,
            { direction: 'top', offset: [0, -10] }
          );

          jam200mLine.on('click', () => {
            onSelectTrain(train.id);
          });

          jam200mLine.addTo(trafficCongestionLayerRef.current!);

          // 4. Live Train Label Pin on Track
          const jamPillHtml = `
            <div class="cursor-pointer group flex items-center gap-1 bg-emerald-600/95 hover:bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-lg border border-white/80 transition-all transform hover:scale-110 whitespace-nowrap">
              <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              <span>${train.nameBn}</span>
            </div>
          `;
          const jamIcon = L.divIcon({
            className: 'custom-jam-pill',
            html: jamPillHtml,
            iconSize: [110, 18],
            iconAnchor: [55, 24],
          });
          const jamMarker = L.marker([currentLat, currentLng], { icon: jamIcon });
          jamMarker.on('click', () => onSelectTrain(train.id));
          jamMarker.addTo(trafficCongestionLayerRef.current!);
        }
      }

      // Train Marker Pin
      let ringColor = isLight ? 'border-emerald-600 shadow-emerald-500/40' : 'border-emerald-400 shadow-emerald-500/50';
      let dotColor = 'bg-emerald-500';

      if (trafficCondition === 'WAITING_CROSSING') {
        ringColor = isLight ? 'border-amber-600 shadow-amber-500/40' : 'border-amber-400 shadow-amber-500/50';
        dotColor = 'bg-amber-500';
      } else if (trafficCondition === 'STATION_STOP') {
        ringColor = isLight ? 'border-rose-600 shadow-rose-500/40' : 'border-rose-400 shadow-rose-500/50';
        dotColor = 'bg-rose-500';
      }

      const trainIconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer transition-transform duration-300 ${
          isSelected ? 'scale-125 z-50' : 'hover:scale-110 z-30'
        }">
          <!-- Radar Pulse Effect -->
          ${
            status.isActive
              ? `<span class="absolute w-12 h-12 rounded-full animate-ping opacity-35 ${dotColor}"></span>`
              : ''
          }
          
          <!-- Outer Train Marker Ring -->
          <div class="relative w-10 h-10 rounded-full ${
            isLight ? 'bg-white' : 'bg-slate-950'
          } border-2 ${ringColor} flex items-center justify-center shadow-xl">
            <!-- Train Bearing Direction Arrow / Engine -->
            <div style="transform: rotate(${bearing}deg);" class="transition-transform duration-500 flex items-center justify-center">
              <svg class="w-5 h-5 ${isLight ? 'text-slate-800' : 'text-white'}" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
              </svg>
            </div>
            
            <!-- Train Number Tag -->
            <span class="absolute -bottom-2.5 ${
              isLight ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'
            } border text-[9px] font-bold px-1.5 py-0.2 rounded-md leading-tight shadow-md">
              ${train.number}
            </span>
          </div>
        </div>
      `;

      const trainIcon = L.divIcon({
        className: 'custom-train-div-icon',
        html: trainIconHtml,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const marker = L.marker([currentLat, currentLng], { icon: trainIcon });

      marker.bindPopup(`
        <div class="p-3 bg-white text-slate-900 rounded-xl max-w-xs space-y-2 font-sans shadow-2xl">
          <div class="flex items-center justify-between border-b border-slate-200 pb-2">
            <div>
              <span class="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">${train.number} আন্তঃনগর</span>
              <h4 class="font-bold text-sm text-slate-900">${train.nameBn}</h4>
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
              status.isActive
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-200 text-slate-600'
            }">
              ${status.isActive ? 'ট্র্যাকে সচল' : 'অফলাইন'}
            </span>
          </div>

          <div class="text-xs space-y-1 text-slate-700">
            <p><strong>বর্তমান সেকশন:</strong> ${status.currentBlockSectionBn}</p>
            <p><strong>লাইভ গতি:</strong> <span class="text-blue-600 font-bold">${toBengaliNumber(speedKmH)} কিমি/ঘণ্টা</span></p>
            <p><strong>পরবর্তী স্টেশন:</strong> ${status.nextStation ? status.nextStation.nameBn : 'পৌঁছেছে'}</p>
            <p><strong>সম্ভাব্য আগমন:</strong> ${status.etaNextStation}</p>
          </div>

          <div class="pt-2 border-t border-slate-100 flex flex-col gap-1.5">
            <a href="https://eticket.railway.gov.bd/" target="_blank" rel="noopener noreferrer" class="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer no-underline text-center shadow-sm">
              🎫 ই-টিকেট কাটুন (eticket.railway.gov.bd)
            </a>
            <button id="track-popup-btn-${train.id}" class="w-full py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer">
              ট্রেনটি বিস্তারিত ট্র্যাক ও বগি দেখুন
            </button>
          </div>
        </div>
      `);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`track-popup-btn-${train.id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectTrain(train.id);
            marker.closePopup();
          };
        }
      });

      marker.on('click', () => {
        onSelectTrain(train.id);
      });

      marker.addTo(trainMarkersLayerRef.current!);
    });
  }, [
    trainStatuses,
    selectedTrainId,
    googleTrafficMode,
    isLight,
    onSelectTrain,
    effectiveSoloMode,
    effectiveSettings,
  ]);

  // 6. Smooth Pan to Selected Train
  useEffect(() => {
    if (!selectedTrainId || !mapInstanceRef.current) return;
    const currentStatus = trainStatuses.find((s) => s.train.id === selectedTrainId);
    if (currentStatus) {
      mapInstanceRef.current.flyTo([currentStatus.currentLat, currentStatus.currentLng], 11, {
        duration: 1.2,
      });
    }
  }, [selectedTrainId, trainStatuses]);

  // 7. Auto-Scan / Cycle Through Active Trains
  const handleScanNextActiveTrain = () => {
    const activeTrains = trainStatuses.filter((s) => s.isActive);
    if (activeTrains.length === 0) return;

    const nextIndex = (activeTrainIndex + 1) % activeTrains.length;
    setActiveTrainIndex(nextIndex);
    const target = activeTrains[nextIndex];
    onSelectTrain(target.train.id);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([target.currentLat, target.currentLng], 11, { duration: 1.2 });
    }
  };

  // 8. User Geolocation Handler
  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      setLocationError('আপনার ব্রাউজারে লোকেশন সনাক্তকরণ সুবিধা নেই');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;

        let nearestSt: Station | null = null;
        let minStDist = Infinity;
        BANGLADESH_STATIONS.forEach((st) => {
          const d = calculateDistanceKm(userLat, userLng, st.lat, st.lng);
          if (d < minStDist) {
            minStDist = d;
            nearestSt = st;
          }
        });

        let nearestTr: LiveTrainStatus | null = null;
        let minTrDist = Infinity;
        trainStatuses.forEach((status) => {
          if (status.isActive) {
            const d = calculateDistanceKm(userLat, userLng, status.currentLat, status.currentLng);
            if (d < minTrDist) {
              minTrDist = d;
              nearestTr = status;
            }
          }
        });

        setUserLocation({
          lat: userLat,
          lng: userLng,
          nearestStation: nearestSt,
          stationDistanceKm: Math.round(minStDist * 10) / 10,
          nearestTrainStatus: nearestTr,
          trainDistanceKm: Math.round(minTrDist * 10) / 10,
        });

        if (mapInstanceRef.current && userLocationLayerRef.current) {
          userLocationLayerRef.current.clearLayers();

          const userHtml = `
            <div class="relative flex items-center justify-center">
              <span class="absolute w-8 h-8 rounded-full bg-blue-500 animate-ping opacity-40"></span>
              <div class="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-xl flex items-center justify-center">
                <span class="w-2 h-2 rounded-full bg-white"></span>
              </div>
            </div>
          `;

          const userIcon = L.divIcon({
            className: 'custom-user-pin',
            html: userHtml,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          const userMarker = L.marker([userLat, userLng], { icon: userIcon }).addTo(
            userLocationLayerRef.current
          );

          userMarker.bindTooltip(
            `<div class="p-1 text-xs font-bold text-blue-600 font-sans">আপনার বর্তমান অবস্থান</div>`,
            { permanent: false, direction: 'top' }
          );

          mapInstanceRef.current.flyTo([userLat, userLng], 10, { duration: 1.5 });
        }
      },
      (err) => {
        setIsLocating(false);
        setLocationError('লোকেশন এক্সেস পাওয়া যায়নি (ব্রাউজার পারমিশন প্রয়োজন)');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Automatically attempt user location on mount
  useEffect(() => {
    handleLocateUser();
  }, []);

  // Live update proximity distances to nearest station and selected train whenever trainStatuses or selectedTrainId updates
  useEffect(() => {
    const lat = userLocation?.lat ?? 23.7314;
    const lng = userLocation?.lng ?? 90.4267;

    let nearestSt: Station | null = null;
    let minStDist = Infinity;
    BANGLADESH_STATIONS.forEach((st) => {
      const d = calculateDistanceKm(lat, lng, st.lat, st.lng);
      if (d < minStDist) {
        minStDist = d;
        nearestSt = st;
      }
    });

    let nearestTr: LiveTrainStatus | null = null;
    let minTrDist = Infinity;
    trainStatuses.forEach((status) => {
      if (status.isActive) {
        const d = calculateDistanceKm(lat, lng, status.currentLat, status.currentLng);
        if (d < minTrDist) {
          minTrDist = d;
          nearestTr = status;
        }
      }
    });

    setUserLocation((prev) => ({
      lat,
      lng,
      nearestStation: nearestSt,
      stationDistanceKm: Math.round(minStDist * 10) / 10,
      nearestTrainStatus: nearestTr,
      trainDistanceKm: Math.round(minTrDist * 10) / 10,
    }));
  }, [trainStatuses, selectedTrainId]);

  const activeTrainsCount = trainStatuses.filter((s) => s.isActive).length;

  return (
    <div
      className={`relative w-full h-full rounded-2xl overflow-hidden border shadow-2xl ${
        isLight ? 'border-slate-300 bg-slate-100' : 'border-slate-800 bg-slate-950'
      }`}
    >
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* 1. Solo Train Track Mode Banner (Top Left) */}
      {selectedStatus && (
        <div className="absolute top-3 left-3 z-30 pointer-events-auto flex items-center gap-2 flex-wrap max-w-[calc(100%-140px)] sm:max-w-md">
          <div
            className={`px-3 py-1.5 rounded-xl border shadow-xl backdrop-blur-md flex items-center gap-2 text-xs font-bold transition-all ${
              effectiveSoloMode
                ? 'bg-emerald-600/95 text-white border-emerald-400 ring-2 ring-emerald-500/30'
                : isLight
                ? 'bg-white/95 border-slate-300 text-slate-800'
                : 'bg-slate-900/95 border-slate-700 text-white'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
              <span className="truncate">{selectedStatus.train.nameBn}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/20 text-white font-extrabold">
                {selectedStatus.train.number}
              </span>
            </div>

            <div className="h-3.5 w-px bg-white/40" />

            {effectiveSoloMode ? (
              <button
                type="button"
                onClick={() => {
                  setSoloFocusOverride(false);
                  if (onUpdateSettings && settings) {
                    onUpdateSettings({ ...settings, showSoloTrainFocus: false });
                  }
                }}
                className="px-2 py-0.5 rounded-lg bg-white/20 hover:bg-white/30 text-[10px] text-white font-extrabold cursor-pointer transition-all whitespace-nowrap"
                title="ম্যাপে অন্যান্য সকল ট্রেন পুনরায় দৃশ্যমান করুন"
              >
                সকল ট্রেন দেখান
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSoloFocusOverride(true);
                  if (onUpdateSettings && settings) {
                    onUpdateSettings({ ...settings, showSoloTrainFocus: true });
                  }
                }}
                className="px-2 py-0.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-[10px] text-white font-extrabold cursor-pointer transition-all whitespace-nowrap"
                title="শুধুমাত্র এই ট্রেনটি রেখে অন্য সব ট্রেন লুকান"
              >
                একক ট্রেন মোড
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2. Floating User Proximity to Nearest Station & Train HUD (Left Side) */}
      {effectiveSettings.showUserProximityHud && (
        <div className="absolute top-14 left-3 z-20 pointer-events-auto max-w-[280px] sm:max-w-xs transition-all">
          <UserProximityCard
            userCoords={userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : null}
            nearestStation={userLocation?.nearestStation || null}
            stationDistanceKm={userLocation?.stationDistanceKm || 0}
            selectedStatus={selectedStatus}
            isLocating={isLocating}
            onRefreshLocation={handleLocateUser}
            onSelectStation={onSelectStation}
            theme={theme}
          />
        </div>
      )}

      {/* 3. Floating Upcoming Stops Timeline for Selected Train (Right Side below top bar) */}
      {effectiveSettings.showUpcomingStopsTimeline && selectedStatus && (
        <div className="absolute top-14 right-3 z-20 pointer-events-auto max-w-[280px] sm:max-w-xs w-72 sm:w-80 transition-all">
          <UpcomingStopsTimeline
            status={selectedStatus}
            theme={theme}
            onSelectStation={onSelectStation}
          />
        </div>
      )}

      {/* Top Map Action Bar */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 sm:gap-2 pointer-events-auto flex-wrap justify-end">
        {/* Rail Mapping Mode Switcher: High-Accuracy Geo-Alignment vs Schematic Mode */}
        <div
          className={`flex items-center rounded-xl p-1 shadow-lg border backdrop-blur-md ${
            isLight
              ? 'bg-white/95 border-slate-300 text-slate-800'
              : 'bg-slate-900/95 border-slate-800 text-slate-100'
          }`}
        >
          <button
            id="rail-geo-mode-btn"
            onClick={() => setRailMappingMode('geo')}
            className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              railMappingMode === 'geo'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
            title="উচ্চ-নির্ভুল জিও-অ্যালাইনমেন্ট মোড: বাস্তব GPS বাঁক ও নির্ভুল ট্র্যাক"
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">উচ্চ-নির্ভুল জিও</span>
            <span className="sm:hidden">জিও</span>
          </button>
          <button
            id="rail-schematic-mode-btn"
            onClick={() => setRailMappingMode('schematic')}
            className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              railMappingMode === 'schematic'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
            title="স্কিম্যাটিক মোড: পরিষ্কার ট্রানজিট মেট্রো-স্টাইল করিডোর ভিউ"
          >
            <Route className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">স্কিম্যাটিক মোড</span>
            <span className="sm:hidden">স্কিম্যাটিক</span>
          </button>
        </div>

        {/* Highlight In-Line Place Names Toggle */}
        <button
          id="rail-highlight-places-btn"
          onClick={() => setHighlightInLinePlaces(!highlightInLinePlaces)}
          className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-all cursor-pointer border ${
            highlightInLinePlaces
              ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-amber-500/20 ring-2 ring-amber-400/40'
              : isLight
              ? 'bg-white/90 text-slate-700 border-slate-300 hover:bg-slate-100'
              : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:bg-slate-800'
          }`}
          title="ইন-লাইন স্থানের নাম, আইকনিক সেতু ও জংশন হাইলাইট চালু/বন্ধ করুন"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-950" />
          <span className="hidden md:inline">স্থানের নাম হাইলাইট</span>
          <span className="md:hidden">হাইলাইট</span>
        </button>

        {/* LiveRailMap Settings Popover */}
        <div className="relative">
          <button
            id="rail-settings-toggle-btn"
            onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
            className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-all cursor-pointer border ${
              showSettingsDropdown
                ? 'bg-slate-800 text-white border-slate-700 dark:bg-slate-100 dark:text-slate-900'
                : isLight
                ? 'bg-white/90 text-slate-700 border-slate-300 hover:bg-slate-100'
                : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
            title="লাইভ রেল ম্যাপ ডিসপ্লে সেটিংস"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">সেটিংস</span>
          </button>

          {showSettingsDropdown && (
            <div
              id="rail-settings-dropdown-menu"
              className={`absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl border shadow-2xl backdrop-blur-xl p-3.5 z-50 text-xs space-y-3 animate-in fade-in-50 zoom-in-95 duration-150 ${
                isLight
                  ? 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-400/30'
                  : 'bg-slate-900/95 border-slate-800 text-slate-100 shadow-black/70'
              }`}
            >
              <div className="flex items-center justify-between border-b pb-2 border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                  <Sliders className="w-4 h-4 text-blue-500" />
                  <span>রেল ম্যাপ ও ট্র্যাক সেটিংস</span>
                </div>
                <button
                  onClick={() => setShowSettingsDropdown(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Mode Selection */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-600 dark:text-slate-400 text-[11px] block">
                  রেললাইন ম্যাপিং মোড
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setRailMappingMode('geo')}
                    className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                      railMappingMode === 'geo'
                        ? 'bg-blue-50 border-blue-400 text-blue-900 dark:bg-blue-950/70 dark:border-blue-500 dark:text-blue-100 ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1 text-[11px]">
                      <Compass className="w-3 h-3 text-blue-500" />
                      <span>উচ্চ-নির্ভুল জিও</span>
                    </div>
                    <p className="text-[9.5px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                      বাস্তব GPS ট্র্যাক ও নির্ভুল বাঁক
                    </p>
                  </button>

                  <button
                    onClick={() => setRailMappingMode('schematic')}
                    className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                      railMappingMode === 'schematic'
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-900 dark:bg-indigo-950/70 dark:border-indigo-500 dark:text-indigo-100 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1 text-[11px]">
                      <Route className="w-3 h-3 text-indigo-500" />
                      <span>স্কিম্যাটিক মোড</span>
                    </div>
                    <p className="text-[9.5px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                      মেট্রো-স্টাইল ট্রানজিট করিডোর ভিউ
                    </p>
                  </button>
                </div>
              </div>

              {/* In-Line Place Highlighting Toggle */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-[11px] flex items-center gap-1 text-slate-900 dark:text-white">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>ইন-লাইন স্থানের নাম হাইলাইট</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    আইকনিক রেল সেতু, জংশন ও টার্মিনাল ব্যাজ
                  </p>
                </div>
                <button
                  onClick={() => setHighlightInLinePlaces(!highlightInLinePlaces)}
                  className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                    highlightInLinePlaces ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${
                      highlightInLinePlaces ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* OpenRailwayMap GIS Overlay Toggle */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-[11px] flex items-center gap-1 text-slate-900 dark:text-white">
                    <Layers className="w-3.5 h-3.5 text-indigo-500" />
                    <span>OpenRailway GIS ট্র্যাক ওভারলে</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    আন্তর্জাতিক রেলওয়ে GIS ডাটাবেস লেয়ার
                  </p>
                </div>
                <button
                  onClick={() => setShowOpenRailwayOverlay(!showOpenRailwayOverlay)}
                  className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                    showOpenRailwayOverlay ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${
                      showOpenRailwayOverlay ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Quick Jump Landmark Spotlight */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
                <label className="font-semibold text-slate-600 dark:text-slate-400 text-[11px] block">
                  গুরুত্বপূর্ণ রেলওয়ে পয়েন্ট ও সেতুতে যান
                </label>
                <div className="flex flex-wrap gap-1">
                  {INLINE_RAIL_LANDMARKS.slice(0, 8).map((lm) => (
                    <button
                      key={lm.id}
                      onClick={() => {
                        setSelectedLandmark(lm);
                        setShowSettingsDropdown(false);
                        mapInstanceRef.current?.flyTo([lm.lat, lm.lng], 12, { duration: 1.2 });
                      }}
                      className="px-2 py-0.5 rounded-lg border text-[10px] font-semibold hover:bg-slate-200 dark:hover:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      {lm.nameBn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Screen Customization Button */}
              {onOpenSettingsModal && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSettingsDropdown(false);
                      onOpenSettingsModal();
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>পূর্ণাঙ্গ স্ক্রিন কাস্টমাইজেশন</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Map Type Selector (Google Maps / Satellite / Traffic) */}
        <div
          className={`flex items-center rounded-xl p-1 shadow-lg border backdrop-blur-md ${
            isLight
              ? 'bg-white/95 border-slate-300 text-slate-800'
              : 'bg-slate-900/95 border-slate-800 text-slate-100'
          }`}
        >
          <button
            onClick={() => setMapProvider('google-roadmap')}
            className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mapProvider === 'google-roadmap'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
            title="গুগল ম্যাপ সাধারণ মোড"
          >
            ম্যাপ
          </button>
          <button
            onClick={() => setMapProvider('google-hybrid')}
            className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mapProvider === 'google-hybrid'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
            title="গুগল স্যাটেলাইট ভিউ"
          >
            স্যাটেলাইট
          </button>
          <button
            onClick={() => setMapProvider('google-traffic')}
            className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mapProvider === 'google-traffic'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
            title="গুগল লাইভ ট্রাফিক লেয়ার"
          >
            ট্রাফিক
          </button>
        </div>

        {/* E-Ticket Booking Button */}
        {onOpenTicketBooking ? (
          <button
            onClick={() => onOpenTicketBooking()}
            className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-all cursor-pointer border bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500"
            title="বাংলাদেশ রেলওয়ে ই-টিকেট কাটুন (eticket.railway.gov.bd)"
          >
            <Ticket className="w-3.5 h-3.5" />
            <span className="font-bold">ই-টিকেট</span>
          </button>
        ) : (
          <a
            href="https://eticket.railway.gov.bd/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-all cursor-pointer border bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 no-underline"
            title="বাংলাদেশ রেলওয়ে ই-টিকেট কাটুন (eticket.railway.gov.bd)"
          >
            <Ticket className="w-3.5 h-3.5" />
            <span className="font-bold">ই-টিকেট</span>
          </a>
        )}

        {/* User GPS Locate Me Button */}
        <button
          id="user-gps-locate-btn"
          onClick={handleLocateUser}
          disabled={isLocating}
          className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-all cursor-pointer border ${
            isLight
              ? 'bg-white/90 text-blue-700 border-blue-200 hover:bg-blue-50'
              : 'bg-slate-900/90 text-blue-400 border-slate-800 hover:bg-slate-800'
          }`}
          title="আমার লোকেশন ও নিকটবর্তী ট্রেন দেখুন"
        >
          <LocateFixed className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : 'text-blue-500'}`} />
          <span className="hidden sm:inline">{isLocating ? 'খোঁজা হচ্ছে...' : 'আমার লোকেশন'}</span>
        </button>
      </div>

      {/* Floating Smart Train Monitor Banner (Bottom Left) */}
      <div className="absolute bottom-4 left-3 right-3 sm:right-auto sm:max-w-md z-20 pointer-events-auto">
        {isBannerCollapsed ? (
          <button
            onClick={() => setIsBannerCollapsed(false)}
            className={`px-3 py-1.5 rounded-xl border shadow-xl backdrop-blur-md text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
              isLight ? 'bg-white/95 text-slate-800 border-slate-300 shadow-slate-300/50' : 'bg-slate-900/95 text-white border-slate-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>লাইভ ট্রেন ({toBengaliNumber(activeTrainsCount)})</span>
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          </button>
        ) : (
          <div
            className={`p-3 rounded-2xl border shadow-2xl backdrop-blur-md space-y-2.5 ${
              isLight ? 'bg-white/95 border-slate-200 text-slate-900' : 'bg-slate-900/95 border-slate-800 text-slate-100'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-2 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
                </span>
                <div>
                  <h4 className="text-xs font-bold flex items-center gap-1.5 text-slate-900 dark:text-white">
                    <span>লাইভ আন্তঃনগর ট্রেন ট্র্যাকার</span>
                    <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {toBengaliNumber(activeTrainsCount)} টি সক্রিয়
                    </span>
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    রেলওয়ে নেটওয়ার্কে চলমান সকল ট্রেনের লাইভ অবস্থান
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={handleScanNextActiveTrain}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow transition-all cursor-pointer"
                  title="পরবর্তী সক্রিয় ট্রেনে জুম করুন"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>পরবর্তী ট্রেন</span>
                </button>

                <button
                  onClick={() => setIsBannerCollapsed(true)}
                  className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  title="সংক্ষেপ করুন"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Active Trains Quick Focus Chips */}
            {activeTrainsCount > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Activity className="w-3 h-3 text-emerald-500" />
                  সচল ট্রেনের অবস্থান ফোকাস করুন:
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                  {trainStatuses
                    .filter((s) => s.isActive)
                    .map((status) => (
                      <button
                        key={status.train.id}
                        onClick={() => {
                          onSelectTrain(status.train.id);
                          if (mapInstanceRef.current) {
                            mapInstanceRef.current.flyTo([status.currentLat, status.currentLng], 14, {
                              duration: 1.2,
                            });
                          }
                        }}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                          selectedTrainId === status.train.id
                            ? 'bg-emerald-600 text-white border-emerald-500 shadow-md scale-105'
                            : isLight
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>{status.train.nameBn}</span>
                        <span className="text-[9px] opacity-80">({toBengaliNumber(status.speedKmH)} কিমি/ঘ)</span>
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Quick Ticket Action */}
            <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <a
                href="https://eticket.railway.gov.bd/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <Ticket className="w-3 h-3" />
                <span>অফিসিয়াল ই-টিকেট পোর্টাল</span>
              </a>

              {onOpenTicketBooking && (
                <button
                  onClick={() => onOpenTicketBooking()}
                  className="px-2 py-0.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold cursor-pointer"
                >
                  টিকেট কাটুন
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Interactive Rail Segment Detection Popover */}
      {detectedSegment && (
        <div className="absolute top-16 left-3 right-3 sm:left-auto sm:right-3 sm:max-w-sm z-30 pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-200">
          <div
            className={`p-3.5 rounded-2xl border shadow-2xl backdrop-blur-md space-y-2 text-xs ${
              isLight ? 'bg-white/95 border-blue-200 text-slate-900' : 'bg-slate-900/95 border-blue-900 text-slate-100'
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400">
                <Navigation className="w-4 h-4" />
                <span>ট্র্যাক সেকশন ডিটেকশন</span>
              </div>
              <button
                onClick={() => setDetectedSegment(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <p className="font-bold text-sm text-slate-900 dark:text-white">
                {detectedSegment.segment.nameBn}
              </p>
              <p className="text-[11px] text-slate-500">{detectedSegment.segment.nameEn}</p>
            </div>

            <div className="pt-1 border-t border-slate-200 dark:border-slate-800">
              {detectedSegment.activeTrains.length > 0 ? (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5" />
                    এই সেকশনে চলমান ট্রেন ({toBengaliNumber(detectedSegment.activeTrains.length)} টি):
                  </span>
                  {detectedSegment.activeTrains.map((st) => (
                    <div
                      key={st.train.id}
                      className={`p-2 rounded-xl border flex items-center justify-between gap-2 ${
                        isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/80 border-slate-700'
                      }`}
                    >
                      <div>
                        <p className="font-bold text-xs">{st.train.nameBn}</p>
                        <p className="text-[10px] text-slate-500">
                          গতি: {toBengaliNumber(st.speedKmH)} কিমি/ঘণ্টা • পরবর্তী:{' '}
                          {st.nextStation ? st.nextStation.nameBn : 'পৌঁছেছে'}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          onSelectTrain(st.train.id);
                          setDetectedSegment(null);
                        }}
                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold cursor-pointer shrink-0"
                      >
                        ট্র্যাক করুন
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  এই সেকশনে বর্তমানে কোনো ট্রেন নেই (ট্র্যাক সম্পূর্ণ মুক্ত)
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Selected In-Line Landmark / Bridge / Junction Spotlight Card */}
      {selectedLandmark && (
        <div
          id="selected-landmark-spotlight"
          className="absolute top-16 left-3 right-3 sm:left-auto sm:right-3 sm:max-w-md z-30 pointer-events-auto animate-in slide-in-from-top-2 duration-300"
        >
          <div
            className={`p-3.5 rounded-2xl border shadow-2xl backdrop-blur-xl space-y-2.5 ${
              isLight
                ? 'bg-white/95 border-amber-200 text-slate-800 shadow-amber-500/10'
                : 'bg-slate-900/95 border-amber-900/40 text-slate-100 shadow-black/80'
            }`}
          >
            <div className="flex items-start justify-between border-b pb-2 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">
                  {selectedLandmark.category === 'bridge'
                    ? '🌉'
                    : selectedLandmark.category === 'junction'
                    ? '🔀'
                    : selectedLandmark.category === 'border'
                    ? '🌐'
                    : '🏛️'}
                </span>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {selectedLandmark.nameBn}
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60">
                      {selectedLandmark.badgeLabelBn}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    {selectedLandmark.nameEn} • {selectedLandmark.badgeLabelEn}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLandmark(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="বন্ধ করুন"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              {selectedLandmark.descriptionBn}
            </p>

            <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800 text-[10px]">
              <span className="text-slate-500 dark:text-slate-400">
                স্থানাঙ্ক: {selectedLandmark.lat.toFixed(4)}, {selectedLandmark.lng.toFixed(4)}
              </span>
              <button
                onClick={() => {
                  mapInstanceRef.current?.flyTo([selectedLandmark.lat, selectedLandmark.lng], 14, {
                    duration: 1,
                  });
                }}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                <Target className="w-3 h-3" />
                <span>ক্লোজ-আপ ভিউ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Location Radar Info Banner */}
      {userLocation && (
        <div className="absolute top-16 left-3 right-3 sm:left-auto sm:right-3 sm:max-w-md z-20 pointer-events-auto animate-in slide-in-from-top-2 duration-300">
          <div
            className={`p-3 rounded-xl border shadow-xl backdrop-blur-md text-xs space-y-1.5 ${
              isLight
                ? 'bg-white/95 border-blue-200 text-slate-800'
                : 'bg-slate-900/95 border-blue-900/50 text-slate-100'
            }`}
          >
            <div className="flex items-center justify-between border-b border-blue-500/20 pb-1.5">
              <div className="flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400">
                <MapPin className="w-4 h-4" />
                <span>আপনার অবস্থান রাডার</span>
              </div>
              <button
                onClick={() => setUserLocation(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1 text-[11px]">
              <p>
                <strong className="text-slate-600 dark:text-slate-400">নিকটতম রেলস্টেশন:</strong>{' '}
                <span className="font-semibold">
                  {userLocation.nearestStation ? userLocation.nearestStation.nameBn : 'শনাক্ত হয়নি'}
                </span>{' '}
                ({toBengaliNumber(userLocation.stationDistanceKm)} কিমি দূরে)
              </p>

              {userLocation.nearestTrainStatus ? (
                <div>
                  <p>
                    <strong className="text-slate-600 dark:text-slate-400">নিকটবর্তী সক্রিয় ট্রেন:</strong>{' '}
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {userLocation.nearestTrainStatus.train.nameBn}
                    </span>{' '}
                    ({toBengaliNumber(userLocation.trainDistanceKm)} কিমি দূরে •{' '}
                    {toBengaliNumber(userLocation.nearestTrainStatus.speedKmH)} কিমি/ঘণ্টা)
                  </p>
                  {userLocation.trainDistanceKm > 20 && (
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      আপনার এলাকায় এখন কোনো ট্রেন নেই। নিকটতম ট্রেনটি{' '}
                      {toBengaliNumber(userLocation.trainDistanceKm)} কিমি দূরে চলমান।
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-slate-400">নিকটবর্তী কোনো সক্রিয় ট্রেন সনাক্ত হয়নি</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Map Legend Overlay Toggle */}
      <div className="absolute top-3 left-3 z-20 pointer-events-auto">
        <button
          onClick={() => setShowLegend(!showLegend)}
          className={`sm:hidden border px-2.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 shadow-md ${
            isLight
              ? 'bg-white/90 border-slate-300 text-slate-800'
              : 'bg-slate-900/90 border-slate-800 text-slate-300'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{showLegend ? 'লেজেন্ড লুকান' : 'ম্যাপ লেজেন্ড'}</span>
        </button>

        <div
          className={`${
            showLegend ? 'block' : 'hidden'
          } sm:block mt-1 sm:mt-0 backdrop-blur-md border p-2.5 sm:p-3 rounded-xl shadow-xl text-xs space-y-2 max-w-[280px] sm:max-w-xs ${
            isLight
              ? 'bg-white/95 border-slate-300 text-slate-800'
              : 'bg-slate-900/95 border-slate-800 text-slate-200'
          }`}
        >
          <div
            className={`flex items-center gap-2 font-bold border-b pb-1.5 ${
              isLight ? 'border-slate-200 text-slate-900' : 'border-slate-800 text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs">লাইভ রেলওয়ে ম্যাপ নির্দেশিকা</span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-1.5 rounded bg-blue-500" />
              <span>
                {railMappingMode === 'geo'
                  ? 'উচ্চ-নির্ভুল জিও-অ্যালাইনমেন্ট লাইন'
                  : 'স্কিম্যাটিক ট্রানজিট করিডোর'}
              </span>
            </div>
            {highlightInLinePlaces && (
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-amber-300/50" />
                <span className="font-semibold text-amber-700 dark:text-amber-400">
                  ইন-লাইন স্থান: পদ্মা/যমুনা সেতু, জংশন ও টার্মিনাল
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-2 rounded bg-rose-500 animate-pulse" />
              <span className="font-semibold text-rose-600 dark:text-rose-400">
                সক্রিয় সেকশন: চলন্ত আন্তঃনগর ট্রেন
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-2 rounded bg-red-800" />
              <span>গাঢ় লাল: স্টেশন বিরতি / সিগন্যাল ক্রসিং</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800">
              রেললাইন বা স্থান ব্যাজে ক্লিক করে বিস্তারিত তথ্য দেখুন
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
