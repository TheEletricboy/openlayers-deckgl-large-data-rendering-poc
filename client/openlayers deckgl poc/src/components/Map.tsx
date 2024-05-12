// ----------------------------
// File: src/components/Map.tsx
// ----------------------------
import React, { useEffect, useRef, useCallback } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import WebGLPointsLayer from 'ol/layer/WebGLPoints';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';
import { debounce } from 'lodash'; // lodash's debounce function
import { OSM } from 'ol/source';

interface Vessel {
    id: number;
    longitude: number;
    latitude: number;
}

interface Props {
    data: Vessel[];
}

const MapComponent: React.FC<Props> = ({ data }) => {
    const mapRef = useRef<Map | null>(null);
    const vectorSourceRef = useRef<VectorSource>(new VectorSource());

    useEffect(() => {
        const webGLLayer = new WebGLPointsLayer({
            source: vectorSourceRef.current,
            style: {
                "circle-radius": ["interpolate", ["exponential", 2], ["zoom"], 5, 1.5, 15, 1536],
                "circle-fill-color": ["match", ["get", "hover"], 1, "#ff3f3f", "#006688"],
                "circle-displacement": [0, 0],
                "circle-opacity": 0.95
            }
        });

        const olMap = new Map({
            target: 'map',
            layers: [
                new TileLayer({ source: new OSM() }),
                webGLLayer
            ],
            view: new View({
                center: fromLonLat([0, 0]),
                zoom: 2
            })
        });

        mapRef.current = olMap;
    }, []);

    const updateData = useCallback(debounce(() => {
        const features = data.map(vessel => new Feature({
            geometry: new Point(fromLonLat([vessel.longitude, vessel.latitude])),
            id: vessel.id
        }));
        vectorSourceRef.current.clear(true);
        vectorSourceRef.current.addFeatures(features);
    }, 250), [data]); // Debounce to limit how often updates are applied

    useEffect(() => {
        updateData();
    }, [updateData]);

    return <div id="map" style={{ width: '100%', height: '100vh' }}></div>;
};

export default MapComponent;
