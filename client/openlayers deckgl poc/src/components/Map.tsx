import React, { useEffect, useRef, useState, useMemo } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import { fromLonLat, toLonLat } from 'ol/proj';
import DeckGL from '@deck.gl/react';
import { ScatterplotLayer } from '@deck.gl/layers';

type ViewState = {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
};

// Generate 100,000 random points
const generatePoints = () => {
  return Array.from({ length: 1000 * 1000 }, () => ({
    position: [
      Math.random() * 360 - 180, // Longitude
      Math.random() * 180 - 90   // Latitude
    ],
    radius: 2,
    color: [255, 0, 0, 255]
  }));
};

const MapComponent: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapObject = useRef<Map | null>(null);

  const [viewState, setViewState] = useState<ViewState>({
    longitude: 0,
    latitude: 0,
    zoom: 2,
    pitch: 0,
    bearing: 0
  });

  useEffect(() => {
    if (mapContainerRef.current) {
      // Initialize OpenLayers map
      const map = new Map({
        target: mapContainerRef.current,
        layers: [
          new TileLayer({
            source: new XYZ({
              url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            })
          })
        ],
        view: new View({
          center: fromLonLat([0, 0]),
          zoom: 2
        })
      });

      mapObject.current = map;

      const syncViewState = () => {
        const view = map.getView();
        const center = toLonLat(view.getCenter()!);
        const rotation = view.getRotation() || 0;
        setViewState({
          longitude: center[0],
          latitude: center[1],
          zoom: view.getZoom() || 0,
          pitch: 0,
          bearing: -rotation
        });
      };

      map.getView().on('change:center', syncViewState);
      map.getView().on('change:resolution', syncViewState);
      map.on('moveend', syncViewState);

      syncViewState(); // Initialize Deck.gl view state
    }

    // Cleanup on unmount
    return () => {
      if (mapObject.current) {
        mapObject.current.setTarget(undefined);
      }
    };
  }, []);

  // Sync OpenLayers view with Deck.gl view
  const syncMapView = (deckViewState: ViewState) => {
    const view = mapObject.current!.getView();
    const newCenter = fromLonLat([deckViewState.longitude, deckViewState.latitude]);
    view.setCenter(newCenter);
    view.setZoom(deckViewState.zoom);
    view.setRotation(-(deckViewState.bearing || 0)); // Handle possibly undefined bearing
  };

  // Generate 100,000 random points
  const points = useMemo(generatePoints, []);

  const scatterplotLayer = new ScatterplotLayer({
    id: 'scatterplot-layer',
    data: points,
    getPosition: d => d.position,
    getRadius: d => d.radius,
    getFillColor: d => d.color,
    radiusScale: 10,
    radiusMinPixels: 1,
    radiusMaxPixels: 30
  });

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      <DeckGL
        viewState={viewState}
        layers={[scatterplotLayer]}
        controller={true}
        onViewStateChange={({ viewState }) => {
          const updatedViewState = viewState as ViewState;
          setViewState(updatedViewState);
          syncMapView(updatedViewState);
        }}
        style={{ position: 'absolute', top: '0px', left: '0px', width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default MapComponent;
