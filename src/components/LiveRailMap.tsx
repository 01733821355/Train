import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import L from 'leaflet';
import { Station, LiveTrainStatus, ScreenCustomizationSettings, DEFAULT_SCREEN_SETTINGS, OnboardTripState } from '../types';
import { BANGLADESH_STATIONS } from '../data/stations';
import {
  BANGLADESH_RAIL_NETWORK,
  BANGLADESH_RAIL_NETWORK_SCHEMATIC,
  INLINE_RAIL_LANDMARKS,
  InlineRailLandmark,
  RailLineSegment,
} from '../data/railNetwork';
import { toBengaliNumber, calculateDistanceKm, getTrackSegmentOfLength, getTrailingWagonPositions, sliceCoords } from '../utils/geoUtils';
import { detect350to500mRailClusters, DetectedRailCluster } from '../utils/railClusterDetector';
import { Language } from '../utils/i18n';
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
  BellRing,
} from 'lucide-react';

interface LiveRailMapProps {
  trainStatuses: LiveTrainStatus[];
  selectedTrainId: string | null;
  onSelectTrain: (trainId: string) => void;
  onSelectStation: (station: Station) => void;
  theme: 'light' | 'dark';
  lang?: Language;
  tripState?: OnboardTripState | null;
  onOpenOnboardModal?: () => void;
  onAlarmTriggered?: () => void;
  onAlarmDismissed?: () => void;
  onEndTrip?: () => void;
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
  lang = 'bn',
  tripState,
  onOpenOnboardModal,
  onAlarmTriggered,
  onAlarmDismissed,
  onEndTrip,
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
  const tripRouteLayerRef = useRef<L.LayerGroup | null>(null);
  const lastSelectedTrainRef = useRef<string | null>(null);

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
  const [showOpenRailwayOverlay, setShowOpenRailwayOverlay] = useState<boolean>(
    () => effectiveSettings.showRailwayOverlay ?? true
  );

  useEffect(() => {
    if (effectiveSettings.showRailwayOverlay !== undefined) {
      setShowOpenRailwayOverlay(effectiveSettings.showRailwayOverlay);
    }
  }, [effectiveSettings.showRailwayOverlay]);

  const handleToggleRailwayOverlay = () => {
    const nextVal = !showOpenRailwayOverlay;
    setShowOpenRailwayOverlay(nextVal);
    if (onUpdateSettings && settings) {
      onUpdateSettings({ ...settings, showRailwayOverlay: nextVal });
    }
  };
  const [railMappingMode, setRailMappingMode] = useState<'geo' | 'schematic'>('geo');
  const [highlightInLinePlaces, setHighlightInLinePlaces] = useState(false);
  const [activeDockMenu, setActiveDockMenu] = useState<'layer' | 'legend' | null>(null);
  const [selectedLandmark, setSelectedLandmark] = useState<InlineRailLandmark | null>(null);
  const [mapZoom, setMapZoom] = useState<number>(8);

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

    map.on('zoomend', () => {
      setMapZoom(map.getZoom());
    });
    setMapZoom(map.getZoom());

    // Initialize layer groups
    routesLayerRef.current = L.layerGroup().addTo(map);
    trafficCongestionLayerRef.current = L.layerGroup().addTo(map);
    stationsLayerRef.current = L.layerGroup().addTo(map);
    landmarksLayerRef.current = L.layerGroup().addTo(map);
    trainMarkersLayerRef.current = L.layerGroup().addTo(map);
    userLocationLayerRef.current = L.layerGroup().addTo(map);
    tripRouteLayerRef.current = L.layerGroup().addTo(map);

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
            opacity: 1.0,
            zIndex: 10,
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
        if (showOpenRailwayOverlay) {
          // GIS TRACK DEFAULT MODE:
          // OpenRailwayMap provides the 100% geographically accurate physical railway lines directly on the map.
          // To avoid drawing conflicting, coarse, or out-of-track vector lines over the real rails,
          // the GIS overlay serves as the authentic physical trackbed.
          // We provide an interactive hit-line (transparent with ample tap area) for track detection & tooltips.
          const hitLine = L.polyline(segment.coordinates, {
            color: 'transparent',
            weight: 16,
            opacity: 0,
            lineCap: 'round',
            lineJoin: 'round',
          });

          // Interactive Click on Track Line -> Detect Segment & Active Trains
          hitLine.on('click', (e) => {
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

          hitLine.bindTooltip(
            `<div class="p-1.5 text-xs font-sans">
              <div class="flex items-center gap-1 font-bold text-slate-900">
                <span>${segment.nameBn}</span>
              </div>
              <p class="text-[10px] text-slate-500 font-medium">${segment.nameEn}</p>
              <p class="text-[10px] text-indigo-600 font-semibold mt-0.5">গজ: ${gaugeLabel} (GIS নির্ভুল)</p>
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

          hitLine.addTo(routesLayerRef.current!);

          // If this segment is currently detected / tapped by user, illuminate it with an accent glow
          if (detectedSegment?.segment.id === segment.id) {
            L.polyline(segment.coordinates, {
              color: '#06b6d4',
              weight: 4.5,
              opacity: 0.9,
              dashArray: '8, 8',
              lineCap: 'round',
            }).addTo(routesLayerRef.current!);
          }
        } else {
          // Fallback if user explicitly disables OpenRailwayMap GIS overlay:
          const ballastBed = L.polyline(segment.coordinates, {
            color: isLight ? '#7c2d12' : '#431407',
            weight: 5.5,
            opacity: 0.35,
            lineCap: 'round',
            lineJoin: 'round',
          });
          ballastBed.addTo(routesLayerRef.current!);

          // Core precision railway track: Crisp high-visibility Orange Line
          const trackColor = '#f97316';

          const trackLine = L.polyline(segment.coordinates, {
            color: trackColor,
            weight: 3.5,
            opacity: 0.95,
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
              <p class="text-[10px] text-orange-600 font-semibold mt-0.5">গজ: ${gaugeLabel}</p>
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
        }
      } else {
        // Schematic Mode: Crisp Orange transit corridors
        const corridorColor = '#ea580c';

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

    // Render Highlighted In-Line Railway Landmarks, Junctions & Bridges ONLY if explicitly enabled AND zoomed in
    if (highlightInLinePlaces && landmarksLayerRef.current && mapZoom >= 11) {
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
    showOpenRailwayOverlay,
    detectedSegment?.segment.id,
  ]);

  // 5. Render Trains & Google Live Traffic Congestion Ribbons
  useEffect(() => {
    if (!mapInstanceRef.current || !trainMarkersLayerRef.current || !trafficCongestionLayerRef.current) return;

    trainMarkersLayerRef.current.clearLayers();
    trafficCongestionLayerRef.current.clearLayers();

    trainStatuses.forEach((status) => {
      const isSelected = selectedTrainId === status.train.id;

      // 1. Off-Day Train Exclusion:
      // If today is this train's weekly off-day (সাপ্তাহিক ছুটি), it does NOT operate today and must NEVER be placed on the railway track!
      if (status.isOffDay) {
        return;
      }

      // 2. Solo Train Focus:
      // When a train is selected and solo train mode is active, hide all other trains from the map!
      if (effectiveSoloMode && selectedTrainId && status.train.id !== selectedTrainId) {
        return;
      }

      // 3. Inactive Trains Exclusion:
      // Inactive trains that have not departed yet or have already finished their trip are parked at yards and NOT running on the tracks.
      // We only show active trains running on the tracks, unless specifically selected by the user.
      if (!status.isActive && !isSelected) {
        return;
      }

      const { train, currentLat, currentLng, bearing, speedKmH, trafficCondition } = status;

      // Route highlight for selected train (only when GIS overlay is turned off, to keep GIS orange lines clean)
      if (isSelected && !showOpenRailwayOverlay && train.routeCoordinates && train.routeCoordinates.length > 1) {
        L.polyline(train.routeCoordinates, {
          color: '#f97316',
          weight: 4,
          opacity: 0.85,
          dashArray: '8, 8',
          lineCap: 'round',
        }).addTo(trainMarkersLayerRef.current!);
      }

      // Exact 350m to 500m Railway Track Telemetry & Rake Moving Cluster Ribbon
      if (
        (effectiveSettings.showCongestionRibbons || effectiveSettings.enable350mRakeRadar) &&
        status.isActive &&
        train.routeCoordinates &&
        train.routeCoordinates.length > 1
      ) {
        // Physical Rake Length: 16 coaches + loco = ~380m to 450m (User requested 350m to 500m)
        const coachCount = train.coaches?.filter((c) => c.coachClass !== 'LOCOMOTIVE').length || 16;
        const rakeLengthMeters = Math.min(500, Math.max(350, effectiveSettings.jamDetectionRangeMeters || Math.round(22 + coachCount * 22.5)));
        const detectionRangeKm = rakeLengthMeters / 1000;

        const rakePoints = getTrackSegmentOfLength(
          train.routeCoordinates,
          currentLat,
          currentLng,
          detectionRangeKm
        );

        if (rakePoints.length >= 2) {
          const isHaltedAtSignal = speedKmH < 15 || trafficCondition === 'WAITING_CROSSING';
          const isStationStop = trafficCondition === 'STATION_STOP' || speedKmH < 4;

          let trafficColor = '#ef4444'; // Moving train cluster
          let glowColor = '#dc2626';

          if (isStationStop) {
            trafficColor = '#b91c1c'; // Deep Dark Red (Station Platform Stop)
            glowColor = '#991b1b';
          } else if (isHaltedAtSignal) {
            trafficColor = '#f59e0b'; // Amber / Orange (Waiting for Signal / Crossing Loop)
            glowColor = '#d97706';
          }

          // 1. Outer Pulsing Glow Aura for the 350m-500m Rake Zone
          L.polyline(rakePoints, {
            color: glowColor,
            weight: 16,
            opacity: 0.5,
            lineCap: 'round',
          }).addTo(trafficCongestionLayerRef.current!);

          // 2. Core 350m-500m Rake Cluster Ribbon
          const rakeClusterLine = L.polyline(rakePoints, {
            color: trafficColor,
            weight: 9,
            opacity: 0.95,
            lineCap: 'round',
          });

          // 3. Centerline highlight for sharp visibility
          L.polyline(rakePoints, {
            color: isHaltedAtSignal ? '#fef3c7' : '#fecdd3',
            weight: 3,
            opacity: 1,
            lineCap: 'round',
          }).addTo(trafficCongestionLayerRef.current!);

          rakeClusterLine.bindTooltip(
            `<div class="p-2 text-xs font-sans shadow-xl rounded-lg max-w-[260px]">
              <div class="flex items-center justify-between gap-1.5 font-bold mb-1">
                <span class="flex items-center gap-1.5 ${isHaltedAtSignal ? 'text-amber-600' : 'text-emerald-600'}">
                  <span class="w-2.5 h-2.5 rounded-full ${isHaltedAtSignal ? 'bg-amber-500 animate-ping' : 'bg-emerald-500 animate-pulse'}"></span>
                  <span>${train.nameBn} (${train.number})</span>
                </span>
                <span class="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 font-mono font-bold text-slate-700">
                  ${toBengaliNumber(rakeLengthMeters)} মি. রেক
                </span>
              </div>
              <p class="text-[11px] font-semibold text-slate-800">
                ${
                  isStationStop
                    ? 'স্টেশন প্ল্যাটফর্মে অবস্থানরত'
                    : isHaltedAtSignal
                    ? 'আউটার/লুপ লাইনে সিগন্যাল অপেক্ষা (স্থির ক্লাস্টার)'
                    : `সচল ট্রেন ক্লাস্টার: ${toBengaliNumber(speedKmH)} কিমি/ঘণ্টা`
                }
              </p>
              <div class="mt-1 pt-1 border-t border-slate-200 text-[10px] space-y-0.5 text-slate-500">
                <p>ডিভাইস ঘনত্ব: <strong class="text-emerald-600 font-semibold">অত্যধিক উচ্চ (Google Location Cluster)</strong></p>
                <p class="text-blue-600 font-medium">✓ হাইওয়ে রোড জ্যাম ফিল্টার্ড (সমান্তরাল ১-২ কিমি বাদ)</p>
                <p class="text-slate-600 font-medium">সেকশন: ${status.currentBlockSectionBn}</p>
              </div>
            </div>`,
            { direction: 'top', offset: [0, -10] }
          );

          rakeClusterLine.on('click', () => {
            onSelectTrain(train.id);
          });

          rakeClusterLine.addTo(trafficCongestionLayerRef.current!);
        }
      }

      // 4. Linked Train Wagons / Coaches when Zoomed In (Map zoom >= 12 and showWagonsOnZoom enabled)
      if (
        effectiveSettings.showWagonsOnZoom &&
        mapZoom >= 12 &&
        status.isActive &&
        train.routeCoordinates &&
        train.routeCoordinates.length > 1
      ) {
        const coachCount = train.zone === 'metro' ? 5 : 6;
        const trailingWagons = getTrailingWagonPositions(
          train.routeCoordinates,
          currentLat,
          currentLng,
          coachCount,
          0.022 // ~22 meters spacing between carriages
        );

        trailingWagons.forEach((w) => {
          const isMetro = train.zone === 'metro';
          const coachBg = isMetro
            ? 'bg-gradient-to-r from-sky-600 to-slate-700 border-sky-300'
            : 'bg-gradient-to-r from-emerald-700 to-emerald-800 border-emerald-400';
          const coachLabel =
            train.coaches && train.coaches[w.index]
              ? train.coaches[w.index].code
              : `বগি ${toBengaliNumber(w.index)}`;

          const wagonHtml = `
            <div style="transform: rotate(${w.bearing}deg);" class="flex items-center justify-center cursor-pointer transition-transform hover:scale-125" title="${train.nameBn} — ${coachLabel}">
              <div class="w-5 h-2 rounded-[2px] ${coachBg} border shadow-sm flex items-center justify-around px-0.5 pointer-events-auto">
                <span class="w-0.5 h-1 bg-amber-200/90 rounded-[0.5px]"></span>
                <span class="w-0.5 h-1 bg-amber-200/90 rounded-[0.5px]"></span>
                <span class="w-0.5 h-1 bg-amber-200/90 rounded-[0.5px]"></span>
              </div>
            </div>
          `;
          const wagonIcon = L.divIcon({
            className: 'custom-train-wagon-icon',
            html: wagonHtml,
            iconSize: [20, 8],
            iconAnchor: [10, 4],
          });
          const wagonMarker = L.marker([w.lat, w.lng], { icon: wagonIcon });
          wagonMarker.on('click', () => onSelectTrain(train.id));
          wagonMarker.addTo(trainMarkersLayerRef.current!);
        });
      }

      // 5. Train Marker Pin: Small, sleek and compact with Name directly ABOVE
      let ringColor = isLight ? 'border-emerald-600 shadow-emerald-500/30' : 'border-emerald-400 shadow-emerald-500/40';
      let dotColor = 'bg-emerald-500';

      if (trafficCondition === 'WAITING_CROSSING') {
        ringColor = isLight ? 'border-amber-600 shadow-amber-500/30' : 'border-amber-400 shadow-amber-500/40';
        dotColor = 'bg-amber-500';
      } else if (trafficCondition === 'STATION_STOP' || !status.isActive) {
        ringColor = isLight ? 'border-rose-600 shadow-rose-500/30' : 'border-rose-400 shadow-rose-500/40';
        dotColor = 'bg-rose-500';
      }

      const showNameBadge = isSelected || effectiveSoloMode || mapZoom >= 10;

      const trainIconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer transition-transform duration-200 ${
          isSelected ? 'scale-110 z-50' : 'hover:scale-105 z-30'
        }">
          <!-- Train Name Pin directly ABOVE the marker (only when zoomed in, selected, or solo mode) -->
          ${
            showNameBadge
              ? `<div class="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none z-40 select-none">
                  <div class="px-1.5 py-0.5 rounded-md text-[9px] font-black shadow-md border flex items-center gap-1 leading-none ${
                    isLight ? 'bg-white/95 text-slate-900 border-slate-300' : 'bg-slate-950/95 text-white border-slate-700'
                  }">
                    <span class="w-1.5 h-1.5 rounded-full ${status.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}"></span>
                    <span>${train.nameBn}</span>
                    <span class="text-[8px] opacity-75 font-mono">(${train.number})</span>
                  </div>
                </div>`
              : ''
          }

          <!-- Radar Pulse Effect -->
          ${
            status.isActive
              ? `<span class="absolute w-7 h-7 rounded-full animate-ping opacity-25 ${dotColor}"></span>`
              : ''
          }
          
          <!-- Outer Train Marker Ring (Compact Small Size 24x24) -->
          <div class="relative w-6 h-6 rounded-full ${
            isLight ? 'bg-white' : 'bg-slate-950'
          } border-2 ${ringColor} flex items-center justify-center shadow-lg">
            <!-- Train Bearing Direction Arrow / Engine -->
            <div style="transform: rotate(${bearing}deg);" class="transition-transform duration-300 flex items-center justify-center">
              <svg class="w-3.5 h-3.5 ${isLight ? 'text-slate-800' : 'text-white'}" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
              </svg>
            </div>
          </div>
        </div>
      `;

      const trainIcon = L.divIcon({
        className: 'custom-train-div-icon',
        html: trainIconHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([currentLat, currentLng], { icon: trainIcon });

      marker.bindPopup(`
        <div class="p-3 bg-white text-slate-900 rounded-xl max-w-xs space-y-2 font-sans shadow-2xl">
          <div class="flex items-center justify-between border-b border-slate-200 pb-2">
            <div>
              <span class="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">${train.number} ${train.zone === 'metro' ? 'মেট্রোরেল' : 'আন্তঃনগর'}</span>
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
            <p><strong>রেল সিগন্যাল:</strong> <span class="text-emerald-700 font-bold">${status.currentSignalNameBn}</span></p>
            <p><strong>পরবর্তী স্টেশন:</strong> ${status.nextStation ? status.nextStation.nameBn : 'পৌঁছেছে'}</p>
            <p><strong>সম্ভাব্য আগমন:</strong> ${status.etaNextStation}</p>
            ${
              status.isCrowdsourcedGpsCalibrated
                ? `<p class="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">🛰️ যাত্রীর লাইভ GPS দ্বারা ট্রেনের গতিপথ নিখুঁতভাবে সমন্বিত</p>`
                : ''
            }
          </div>

          <div class="pt-2 border-t border-slate-100 flex flex-col gap-1.5">
            ${
              train.zone !== 'metro'
                ? `<a href="https://eticket.railway.gov.bd/" target="_blank" rel="noopener noreferrer" class="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer no-underline text-center shadow-sm">
                    🎫 ই-টিকেট কাটুন (eticket.railway.gov.bd)
                  </a>`
                : ''
            }
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
    mapZoom,
    showOpenRailwayOverlay,
  ]);

  // 6. Smooth Pan to Selected Train: ONLY on explicit selection change
  useEffect(() => {
    if (!selectedTrainId || !mapInstanceRef.current) {
      lastSelectedTrainRef.current = selectedTrainId;
      return;
    }
    if (selectedTrainId !== lastSelectedTrainRef.current) {
      lastSelectedTrainRef.current = selectedTrainId;
      const currentStatus = trainStatuses.find((s) => s.train.id === selectedTrainId);
      if (currentStatus) {
        mapInstanceRef.current.flyTo([currentStatus.currentLat, currentStatus.currentLng], 11, {
          duration: 1.2,
        });
      }
    }
  }, [selectedTrainId]);

  // 6.5 On-board Trip Route Highlight & Proximity Alarm Monitor
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (!tripRouteLayerRef.current) {
      tripRouteLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    }
    tripRouteLayerRef.current.clearLayers();

    if (!tripState || !tripState.isActive) return;

    const currentTrainStatus = trainStatuses.find((s) => s.train.id === tripState.trainId);
    if (!currentTrainStatus) return;

    // Check alarm trigger distance using user-configured distance (default 2.0 km)
    const thresholdKm = tripState.alarmDistanceKm || 2.0;
    const distToDestKm = calculateDistanceKm(
      currentTrainStatus.currentLat,
      currentTrainStatus.currentLng,
      tripState.destLat,
      tripState.destLng
    );

    if (distToDestKm <= thresholdKm && !tripState.alarmTriggered && onAlarmTriggered) {
      onAlarmTriggered();
    }

    // Highlight route to destination
    const routeCoords = currentTrainStatus.train.routeCoordinates;
    const sliced = sliceCoords(
      routeCoords,
      currentTrainStatus.currentLat,
      currentTrainStatus.currentLng,
      tripState.destLat,
      tripState.destLng
    );
    const highlightPath =
      sliced && sliced.length > 1
        ? sliced
        : [[currentTrainStatus.currentLat, currentTrainStatus.currentLng], [tripState.destLat, tripState.destLng]];

    // Glowing vibrant amber path with golden glow
    L.polyline(highlightPath as [number, number][], {
      color: '#f59e0b',
      weight: 6,
      opacity: 0.95,
      dashArray: '8, 8',
      lineCap: 'round',
    }).addTo(tripRouteLayerRef.current);

    // Destination Pin Flag
    const destName = lang === 'bn' ? tripState.destinationStationNameBn : tripState.destinationStationNameEn;
    const destHtml = `
      <div class="relative flex items-center justify-center pointer-events-none">
        <div class="px-2.5 py-1 rounded-lg bg-amber-500 text-white font-black text-[11px] shadow-xl flex items-center gap-1.5 border-2 border-white whitespace-nowrap animate-bounce">
          <span>🚩</span>
          <span>${destName}</span>
        </div>
      </div>
    `;
    const destIcon = L.divIcon({
      className: 'dest-flag-pin',
      html: destHtml,
      iconSize: [96, 28],
      iconAnchor: [48, 14],
    });
    L.marker([tripState.destLat, tripState.destLng], { icon: destIcon }).addTo(tripRouteLayerRef.current);
  }, [tripState, trainStatuses, lang, onAlarmTriggered]);

  // 7. Auto-Scan / Cycle Through Active Trains
  const handleScanNextActiveTrain = () => {
    const activeTrains = trainStatuses.filter((s) => s.isActive && !s.isOffDay);
    if (activeTrains.length === 0) return;

    const nextIndex = (activeTrainIndex + 1) % activeTrains.length;
    setActiveTrainIndex(nextIndex);
    const target = activeTrains[nextIndex];
    onSelectTrain(target.train.id);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([target.currentLat, target.currentLng], 11, { duration: 1.2 });
    }
  };

  // 8. User Geolocation Handler: Triggered strictly by Location Button tap (stays where map is)
  const handleToggleLocateUser = () => {
    // If location is already active, tapping the button turns it off
    if (userLocation) {
      setUserLocation(null);
      setLocationError(null);
      if (userLocationLayerRef.current) {
        userLocationLayerRef.current.clearLayers();
      }
      return;
    }

    if (!navigator.geolocation) {
      setLocationError(lang === 'bn' ? 'আপনার ব্রাউজারে লোকেশন সনাক্তকরণ সুবিধা নেই' : 'Geolocation is not supported by your browser');
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
            `<div class="p-1 text-xs font-bold text-blue-600 font-sans">${lang === 'bn' ? 'আপনার বর্তমান অবস্থান' : 'Your Location'}</div>`,
            { permanent: false, direction: 'top' }
          );

          // Note: map is intentionally NOT auto-moved, honoring user requirement to keep viewport steady
        }
      },
      (err) => {
        setIsLocating(false);
        setLocationError(lang === 'bn' ? 'লোকেশন এক্সেস পাওয়া যায়নি (ব্রাউজারে লোকেশন অনুমতি দিন)' : 'Location permission denied');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Live update proximity distances ONLY IF userLocation is currently active
  useEffect(() => {
    if (!userLocation) return;
    const lat = userLocation.lat;
    const lng = userLocation.lng;

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

    setUserLocation((prev) => {
      if (!prev) return null;
      return {
        lat,
        lng,
        nearestStation: nearestSt,
        stationDistanceKm: Math.round(minStDist * 10) / 10,
        nearestTrainStatus: nearestTr,
        trainDistanceKm: Math.round(minTrDist * 10) / 10,
      };
    });
  }, [trainStatuses, selectedTrainId]);

  const activeTrainsCount = trainStatuses.filter((s) => s.isActive && !s.isOffDay).length;

  const liveTripDistKm = useMemo(() => {
    if (!tripState || !tripState.isActive) return null;
    const currentTrainStatus = trainStatuses.find((s) => s.train.id === tripState.trainId);
    if (!currentTrainStatus) return null;
    return calculateDistanceKm(
      currentTrainStatus.currentLat,
      currentTrainStatus.currentLng,
      tripState.destLat,
      tripState.destLng
    );
  }, [tripState, trainStatuses]);

  return (
    <div
      className={`relative w-full h-full rounded-2xl overflow-hidden border shadow-2xl ${
        isLight ? 'border-slate-300 bg-slate-100' : 'border-slate-800 bg-slate-950'
      }`}
    >
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* 0. Urgent Arrival Alarm Banner when approaching destination */}
      {tripState?.isActive && tripState.alarmTriggered && !tripState.alarmDismissed && (
        <div className="absolute top-2 left-2 right-2 sm:left-4 sm:right-4 z-50 p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-rose-900/98 via-red-900/98 to-rose-950/98 border-2 border-rose-500 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 animate-in zoom-in-95 duration-200">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-rose-600 flex items-center justify-center text-white shrink-0 shadow-lg animate-bounce">
              <BellRing className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                  গন্তব্য স্টেশন এসে গেছে!
                </span>
                {liveTripDistKm !== null && (
                  <span className="text-xs font-mono text-rose-200">
                    দূরত্ব: {toBengaliNumber(Math.round(liveTripDistKm * 10) / 10)} কিমি
                  </span>
                )}
              </div>
              <h3 className="text-xs sm:text-base font-extrabold text-white truncate mt-0.5">
                আপনার গন্তব্য স্টেশন {tripState.destinationStationNameBn} এসে গেছে!
              </h3>
              <p className="text-[11px] text-rose-200 truncate">
                নামার প্রস্তুতি নিন ও ব্যক্তিগত মালামাল সাথে রাখুন।
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onAlarmDismissed?.()}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-950 font-black text-xs sm:text-sm shadow-xl transition-all cursor-pointer shrink-0"
          >
            অ্যালার্ম বন্ধ করুন
          </button>
        </div>
      )}

      {/* 1. Main Display Floating Control Island (Top-Left / Center) */}
      <div className="absolute top-2.5 left-2.5 z-30 pointer-events-auto flex items-center gap-1.5 sm:gap-2 flex-wrap max-w-[calc(100%-145px)] sm:max-w-none">
        {/* All vs Solo Train Toggle Pill */}
        <div
          className={`flex items-center p-1 rounded-2xl border shadow-xl backdrop-blur-md transition-all ${
            isLight ? 'bg-white/95 border-slate-300' : 'bg-slate-900/95 border-slate-700'
          }`}
        >
          {/* সকল ট্রেন */}
          <button
            type="button"
            id="all-trains-mode-btn"
            onClick={() => {
              setSoloFocusOverride(false);
              if (onUpdateSettings && settings) {
                onUpdateSettings({ ...settings, showSoloTrainFocus: false });
              }
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              !effectiveSoloMode
                ? 'bg-emerald-600 text-white shadow-md'
                : isLight
                ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="ম্যাপে সকল চলমান ট্রেন দৃশ্যমান করুন"
          >
            <TrainIcon className="w-3.5 h-3.5" />
            <span>সকল ট্রেন ({activeTrainsCount})</span>
          </button>

          {/* একক ট্রেন */}
          <button
            type="button"
            id="solo-train-mode-btn"
            onClick={() => {
              setSoloFocusOverride(true);
              if (!selectedTrainId && trainStatuses.length > 0) {
                const firstActive = trainStatuses.find((s) => s.isActive && !s.isOffDay) || trainStatuses[0];
                if (firstActive) onSelectTrain(firstActive.train.id);
              }
              if (onUpdateSettings && settings) {
                onUpdateSettings({ ...settings, showSoloTrainFocus: true });
              }
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              effectiveSoloMode
                ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400/40'
                : isLight
                ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="শুধুমাত্র নির্বাচিত ট্রেনটি দেখে অন্য সব ট্রেন লুকান"
          >
            <Target className="w-3.5 h-3.5" />
            <span>একক ট্রেন</span>
          </button>
        </div>

        {/* "আমি এই ট্রেনে আছি" Button (Prominently displayed) */}
        <button
          type="button"
          id="onboard-trip-main-btn"
          onClick={() => onOpenOnboardModal?.()}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border text-xs font-extrabold shadow-xl backdrop-blur-md transition-all cursor-pointer ${
            tripState?.isActive
              ? 'bg-emerald-600 text-white border-emerald-400 shadow-emerald-600/40 ring-2 ring-emerald-400/50'
              : isLight
              ? 'bg-white/95 text-slate-800 border-slate-300 hover:bg-emerald-50 hover:border-emerald-400'
              : 'bg-slate-900/95 text-slate-100 border-slate-700 hover:bg-slate-800 hover:border-emerald-500'
          }`}
          title="আমি এই ট্রেনে আছি — গন্তব্য স্টেশন নির্বাচন করুন ও অ্যালার্ম সেট করুন"
        >
          <BellRing className={`w-3.5 h-3.5 ${tripState?.isActive ? 'text-white animate-bounce' : 'text-emerald-500'}`} />
          <span>
            {tripState?.isActive
              ? `ট্রিপ: ${tripState.destinationStationNameBn}`
              : 'আমি এই ট্রেনে আছি'}
          </span>
          {tripState?.isActive && liveTripDistKm !== null && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/20 text-white font-bold ml-0.5">
              {toBengaliNumber(Math.round(liveTripDistKm * 10) / 10)} কিমি
            </span>
          )}
        </button>
      </div>

      {/* Solo Train Info Ribbon (when solo mode is active) */}
      {effectiveSoloMode && selectedStatus && (
        <div className="absolute top-14 left-2.5 z-20 pointer-events-auto flex items-center gap-2 max-w-[calc(100%-20px)] sm:max-w-md animate-in slide-in-from-top-1 duration-150">
          <div
            className={`px-3 py-1 rounded-xl border shadow-xl backdrop-blur-md flex items-center gap-2 text-xs font-bold ${
              isLight ? 'bg-white/95 border-emerald-400 text-slate-800' : 'bg-slate-900/95 border-emerald-500 text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="truncate">{selectedStatus.train.nameBn}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 font-extrabold shrink-0">
              {selectedStatus.train.number}
            </span>
            <div className="h-3.5 w-px bg-slate-300 dark:bg-slate-700 shrink-0" />
            <button
              type="button"
              onClick={() => {
                setSoloFocusOverride(false);
                if (onUpdateSettings && settings) onUpdateSettings({ ...settings, showSoloTrainFocus: false });
              }}
              className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline font-extrabold shrink-0 cursor-pointer"
            >
              সকল ট্রেন দেখান
            </button>
          </div>
        </div>
      )}

      {/* Off-Day Alert Banner for Selected Train */}
      {selectedStatus && selectedStatus.isOffDay && (
        <div className="absolute top-14 left-3 z-30 pointer-events-auto max-w-[calc(100%-24px)] sm:max-w-md animate-in slide-in-from-top-2 duration-200">
          <div className="p-2.5 sm:p-3 rounded-2xl border border-rose-500/60 bg-rose-950/95 text-white shadow-2xl backdrop-blur-md flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0 text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-rose-200 truncate">{selectedStatus.train.nameBn}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-900 text-rose-200 font-bold shrink-0">
                  {selectedStatus.train.number}
                </span>
              </div>
              <p className="text-[11px] text-rose-300 mt-0.5 leading-snug">
                আজ সাপ্তাহিক ছুটি ({selectedStatus.train.offDayBn}) — ট্রেনটি আজ রেললাইন বা ট্র্যাকে চলাচল করছে না।
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Floating User Proximity to Nearest Station & Train HUD (Left Side) */}
      {effectiveSettings.showUserProximityHud && userLocation && (
        <div className="absolute top-14 left-3 z-20 pointer-events-auto max-w-[280px] sm:max-w-xs transition-all">
          <UserProximityCard
            userCoords={{ lat: userLocation.lat, lng: userLocation.lng }}
            nearestStation={userLocation.nearestStation || null}
            stationDistanceKm={userLocation.stationDistanceKm || 0}
            selectedStatus={selectedStatus}
            isLocating={isLocating}
            onRefreshLocation={handleToggleLocateUser}
            onClose={handleToggleLocateUser}
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

      {/* Top Map Floating Mini Action Dock */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1 sm:gap-1.5 pointer-events-auto">
        {/* 1. Map Layers & Track Settings Popover Button */}
        <div className="relative">
          <button
            id="rail-layer-dock-btn"
            onClick={() => setActiveDockMenu(activeDockMenu === 'layer' ? null : 'layer')}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-md transition-all cursor-pointer border ${
              activeDockMenu === 'layer'
                ? 'bg-blue-600 text-white border-blue-500 ring-2 ring-blue-400/50'
                : isLight
                ? 'bg-white/95 text-slate-700 border-slate-300 hover:bg-slate-100'
                : 'bg-slate-900/95 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
            title={lang === 'bn' ? 'ম্যাপ লেয়ার ও ট্র্যাক অপশন' : 'Map Layers & Track Options'}
          >
            <Layers className="w-4 h-4" />
          </button>

          {activeDockMenu === 'layer' && (
            <div
              className={`absolute right-0 mt-2 w-64 rounded-2xl border shadow-2xl backdrop-blur-xl p-3 z-50 text-xs space-y-3 animate-in fade-in-50 zoom-in-95 duration-150 ${
                isLight ? 'bg-white/98 border-slate-200 text-slate-800' : 'bg-slate-900/98 border-slate-800 text-slate-100'
              }`}
            >
              <div className="flex items-center justify-between border-b pb-2 border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-1.5 font-bold">
                  <Layers className="w-3.5 h-3.5 text-blue-500" />
                  <span>{lang === 'bn' ? 'ম্যাপ ও ট্র্যাক লেয়ার' : 'Map & Track Layers'}</span>
                </div>
                <button
                  onClick={() => setActiveDockMenu(null)}
                  className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Map Type */}
              <div className="space-y-1">
                <label className="text-[10.5px] font-semibold text-slate-500">{lang === 'bn' ? 'ম্যাপের ধরন' : 'Map Style'}</label>
                <div className="grid grid-cols-3 gap-1">
                  {(['google-roadmap', 'google-hybrid', 'google-traffic'] as const).map((prov) => (
                    <button
                      key={prov}
                      onClick={() => {
                        setMapProvider(prov);
                        setActiveDockMenu(null);
                      }}
                      className={`px-2 py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                        mapProvider === prov
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {prov === 'google-roadmap' ? (lang === 'bn' ? 'ম্যাপ' : 'Map') : prov === 'google-hybrid' ? (lang === 'bn' ? 'স্যাটেলাইট' : 'Satellite') : (lang === 'bn' ? 'ট্রাফিক' : 'Traffic')}
                    </button>
                  ))}
                </div>
              </div>

              {/* OpenRailway GIS Overlay */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-medium">{lang === 'bn' ? 'OpenRailway GIS ট্র্যাক' : 'OpenRailway GIS Track'}</span>
                <button
                  onClick={() => {
                    handleToggleRailwayOverlay();
                    setActiveDockMenu(null);
                  }}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                    showOpenRailwayOverlay ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span className={`block w-3.5 h-3.5 rounded-full bg-white shadow-sm transform transition-transform ${
                    showOpenRailwayOverlay ? 'translate-x-4.5' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {/* In-Line Landmarks */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium">{lang === 'bn' ? 'সেতু ও জংশন ট্যাগ' : 'Landmark Tags'}</span>
                <button
                  onClick={() => {
                    setHighlightInLinePlaces(!highlightInLinePlaces);
                    setActiveDockMenu(null);
                  }}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                    highlightInLinePlaces ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span className={`block w-3.5 h-3.5 rounded-full bg-white shadow-sm transform transition-transform ${
                    highlightInLinePlaces ? 'translate-x-4.5' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {/* Full Screen Customization Button */}
              {onOpenSettingsModal && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveDockMenu(null);
                      onOpenSettingsModal();
                    }}
                    className="w-full py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer text-slate-800 dark:text-slate-100"
                  >
                    <Sliders className="w-3 h-3" />
                    <span>{lang === 'bn' ? 'পূর্ণাঙ্গ সেটিংস' : 'Full Screen Settings'}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 2. Mode Toggle: Geo vs Schematic (1-tap) */}
        <button
          id="rail-mode-dock-btn"
          onClick={() => setRailMappingMode(railMappingMode === 'geo' ? 'schematic' : 'geo')}
          className={`h-8 sm:h-9 px-2 sm:px-2.5 rounded-xl flex items-center gap-1 shadow-lg backdrop-blur-md transition-all cursor-pointer border ${
            railMappingMode === 'geo'
              ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-700'
              : 'bg-indigo-50 text-indigo-700 border-indigo-300 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-700'
          }`}
          title={railMappingMode === 'geo' ? (lang === 'bn' ? 'বর্তমান: উচ্চ-নির্ভুল জিও মোড (ক্লিক করে স্কিম্যাটিকে যান)' : 'Current: Geo Mode (Click for Schematic)') : (lang === 'bn' ? 'বর্তমান: স্কিম্যাটিক মোড (ক্লিক করে জিওতে যান)' : 'Current: Schematic Mode (Click for Geo)')}
        >
          <Compass className="w-3.5 h-3.5" />
          <span className="text-[11px] font-bold uppercase tracking-tight">
            {railMappingMode === 'geo' ? 'GEO' : 'SCH'}
          </span>
        </button>

        {/* 3. My Location GPS Toggle (1-tap, never auto-moves viewport) */}
        <button
          id="user-gps-dock-btn"
          onClick={handleToggleLocateUser}
          disabled={isLocating}
          className={`h-8 sm:h-9 px-2 sm:px-2.5 rounded-xl flex items-center gap-1 shadow-lg backdrop-blur-md transition-all cursor-pointer border ${
            userLocation
              ? 'bg-blue-600 text-white border-blue-500 shadow-blue-500/30 ring-2 ring-blue-400/50'
              : isLight
              ? 'bg-white/95 text-blue-700 border-slate-300 hover:bg-blue-50'
              : 'bg-slate-900/95 text-blue-400 border-slate-800 hover:bg-slate-800'
          }`}
          title={userLocation ? (lang === 'bn' ? 'লোকেশন ও দূরত্ব বন্ধ করুন' : 'Turn off Location') : (lang === 'bn' ? 'আমার অবস্থান ও ট্রেনের দূরত্ব দেখুন' : 'View My Location & Train Distance')}
        >
          <LocateFixed className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : userLocation ? 'animate-pulse text-white' : 'text-blue-500'}`} />
          <span className="text-[11px] font-bold">
            {userLocation ? (lang === 'bn' ? 'অন' : 'ON') : (lang === 'bn' ? 'লোকেশন' : 'GPS')}
          </span>
        </button>

        {/* 4. On-Board Trip / Alarm Button ("আমি এই ট্রেনে আছি") */}
        <button
          id="onboard-trip-dock-btn"
          onClick={() => onOpenOnboardModal?.()}
          className={`h-8 sm:h-9 px-2 sm:px-2.5 rounded-xl flex items-center gap-1 shadow-lg backdrop-blur-md transition-all cursor-pointer border ${
            tripState?.isActive
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-500/30 ring-2 ring-emerald-400/50'
              : isLight
              ? 'bg-white/95 text-slate-700 border-slate-300 hover:bg-emerald-50'
              : 'bg-slate-900/95 text-slate-300 border-slate-800 hover:bg-slate-800'
          }`}
          title={lang === 'bn' ? 'আমি এই ট্রেনে আছি (গন্তব্য নির্বাচন ও অ্যালার্ম)' : 'I am on this train (Trip & Alarm)'}
        >
          <BellRing className={`w-3.5 h-3.5 ${tripState?.isActive ? 'text-white animate-bounce' : 'text-emerald-500'}`} />
          <span className="text-[11px] font-bold hidden sm:inline">
            {tripState?.isActive ? (lang === 'bn' ? 'ট্রিপ চলছে' : 'Active') : (lang === 'bn' ? 'অন-বোর্ড' : 'On-Board')}
          </span>
        </button>

        {/* 5. E-Ticket Button */}
        {onOpenTicketBooking ? (
          <button
            onClick={() => onOpenTicketBooking()}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-md transition-all cursor-pointer border bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500"
            title={lang === 'bn' ? 'বাংলাদেশ রেলওয়ে ই-টিকেট কাটুন' : 'Buy Bangladesh Railway E-Ticket'}
          >
            <Ticket className="w-4 h-4" />
          </button>
        ) : (
          <a
            href="https://eticket.railway.gov.bd/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-md transition-all cursor-pointer border bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 no-underline"
            title={lang === 'bn' ? 'বাংলাদেশ রেলওয়ে ই-টিকেট কাটুন' : 'Buy Bangladesh Railway E-Ticket'}
          >
            <Ticket className="w-4 h-4" />
          </a>
        )}

        {/* 6. Info & Legend Dock Button */}
        <div className="relative">
          <button
            id="rail-legend-dock-btn"
            onClick={() => setActiveDockMenu(activeDockMenu === 'legend' ? null : 'legend')}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-md transition-all cursor-pointer border ${
              activeDockMenu === 'legend'
                ? 'bg-slate-800 text-white border-slate-700 dark:bg-white dark:text-slate-900'
                : isLight
                ? 'bg-white/95 text-slate-700 border-slate-300 hover:bg-slate-100'
                : 'bg-slate-900/95 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
            title={lang === 'bn' ? 'ম্যাপ নির্দেশিকা ও লেজেন্ড' : 'Map Guide & Legend'}
          >
            <Info className="w-4 h-4" />
          </button>

          {activeDockMenu === 'legend' && (
            <div
              className={`absolute right-0 mt-2 w-64 rounded-2xl border shadow-2xl backdrop-blur-xl p-3 z-50 text-xs space-y-2.5 animate-in fade-in-50 zoom-in-95 duration-150 ${
                isLight ? 'bg-white/98 border-slate-200 text-slate-800' : 'bg-slate-900/98 border-slate-800 text-slate-100'
              }`}
            >
              <div className="flex items-center justify-between border-b pb-1.5 border-slate-200 dark:border-slate-800 font-bold">
                <span>{lang === 'bn' ? 'রেলপথ নির্দেশিকা' : 'Rail Guide & Legend'}</span>
                <button onClick={() => setActiveDockMenu(null)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                  <span>{lang === 'bn' ? 'পূর্বাঞ্চল ট্রেন (East Zone)' : 'East Zone Trains'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
                  <span>{lang === 'bn' ? 'পশ্চিমাঞ্চল ট্রেন (West Zone)' : 'West Zone Trains'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                  <span>{lang === 'bn' ? 'অন-বোর্ড গন্তব্য রুট (Destination)' : 'Destination Route'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
                  <span>{lang === 'bn' ? 'ক্রসিং / সিগন্যাল ডিটেকশন' : 'Crossing Signal'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
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

      {/* User Location Radar Info Banner - Shown only when user location is active and proximity card is not showing */}
      {userLocation && !effectiveSettings.showUserProximityHud && (
        <div className="absolute top-16 left-3 right-3 sm:left-auto sm:right-3 sm:max-w-md z-20 pointer-events-auto animate-in slide-in-from-top-2 duration-300">
          <div
            className={`p-3 rounded-xl border shadow-xl backdrop-blur-md text-xs space-y-2 ${
              isLight
                ? 'bg-white/95 border-blue-200 text-slate-800'
                : 'bg-slate-900/95 border-blue-900/50 text-slate-100'
            }`}
          >
            <div className="flex items-center justify-between border-b border-blue-500/20 pb-1.5">
              <div className="flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400">
                <MapPin className="w-4 h-4" />
                <span>আপনার অবস্থান থেকে ট্রেনের দূরত্ব</span>
              </div>
              <button
                onClick={() => {
                  setUserLocation(null);
                  if (userLocationLayerRef.current) {
                    userLocationLayerRef.current.clearLayers();
                  }
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="বন্ধ করুন"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5 text-[11px]">
              {/* Selected Train Distance from User Location */}
              {selectedStatus && (
                <div className="p-2 rounded-lg bg-blue-50/80 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <strong className="text-slate-900 dark:text-white font-bold">
                        {selectedStatus.train.nameBn} ({selectedStatus.train.number})
                      </strong>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      গতি: {toBengaliNumber(selectedStatus.speedKmH)} কিমি/ঘ • {selectedStatus.currentBlockSectionBn}
                    </p>
                  </div>
                  <span className="text-xs font-black text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded-md shrink-0">
                    {toBengaliNumber(
                      Math.round(
                        calculateDistanceKm(
                          userLocation.lat,
                          userLocation.lng,
                          selectedStatus.currentLat,
                          selectedStatus.currentLng
                        ) * 10
                      ) / 10
                    )}{' '}
                    কিমি দূরে
                  </span>
                </div>
              )}

              <p>
                <strong className="text-slate-600 dark:text-slate-400">নিকটতম রেলস্টেশন:</strong>{' '}
                <span className="font-semibold">
                  {userLocation.nearestStation ? userLocation.nearestStation.nameBn : 'শনাক্ত হয়নি'}
                </span>{' '}
                ({toBengaliNumber(userLocation.stationDistanceKm)} কিমি দূরে)
              </p>

              {userLocation.nearestTrainStatus &&
              (!selectedStatus || userLocation.nearestTrainStatus.train.id !== selectedStatus.train.id) ? (
                <div>
                  <p>
                    <strong className="text-slate-600 dark:text-slate-400">নিকটবর্তী ট্রেন:</strong>{' '}
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {userLocation.nearestTrainStatus.train.nameBn}
                    </span>{' '}
                    ({toBengaliNumber(userLocation.trainDistanceKm)} কিমি দূরে •{' '}
                    {toBengaliNumber(userLocation.nearestTrainStatus.speedKmH)} কিমি/ঘণ্টা)
                  </p>
                  {userLocation.trainDistanceKm > 25 && (
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      আপনার এলাকায় এখন কোনো ট্রেন নেই। নিকটতম ট্রেনটি{' '}
                      {toBengaliNumber(userLocation.trainDistanceKm)} কিমি দূরে চলমান।
                    </p>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Location Error Notification (if permission denied) */}
      {locationError && (
        <div className="absolute top-16 left-3 right-3 sm:left-auto sm:right-3 sm:max-w-sm z-30 pointer-events-auto animate-in fade-in duration-200">
          <div className="p-3 rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/90 text-rose-800 dark:text-rose-200 text-xs shadow-lg flex items-center justify-between gap-2">
            <span>{locationError}</span>
            <button
              onClick={() => setLocationError(null)}
              className="text-rose-500 hover:text-rose-700 font-bold px-1.5 py-0.5 rounded cursor-pointer"
            >
              ✕
            </button>
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

      {/* Floating Active Onboard Trip HUD at Bottom */}
      {tripState?.isActive && (
        <div className="absolute bottom-4 left-3 right-3 sm:left-auto sm:right-3 sm:w-96 z-30 pointer-events-auto p-3 rounded-2xl border border-emerald-500/40 bg-slate-900/95 text-white shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0 shadow-lg animate-pulse">
              <BellRing className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-800 text-emerald-200">
                  অন-বোর্ড ট্রিপ
                </span>
                {liveTripDistKm !== null && (
                  <span className="text-xs font-mono text-emerald-300">
                    {toBengaliNumber(Math.round(liveTripDistKm * 10) / 10)} কিমি বাকি
                  </span>
                )}
              </div>
              <p className="text-xs font-bold truncate text-slate-100 mt-0.5">
                গন্তব্য: <span className="text-amber-400">{tripState.destinationStationNameBn}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onOpenOnboardModal?.()}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-200 border border-slate-700 cursor-pointer"
            >
              বিস্তারিত
            </button>
            <button
              onClick={() => onEndTrip?.()}
              className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-[11px] font-bold text-white shadow cursor-pointer"
            >
              সমাপ্ত
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
