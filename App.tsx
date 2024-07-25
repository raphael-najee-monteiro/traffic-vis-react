import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import DeckGL from '@deck.gl/react';
import { GeoJsonLayer } from '@deck.gl/layers';
import { Map } from 'react-map-gl/maplibre';
import { load } from '@loaders.gl/core';
import { CSVLoader } from '@loaders.gl/csv';
import { Feature, Point, GeoJsonProperties } from 'geojson';
import {MapViewState} from "deck.gl";

// Define the URL to the nodes CSV file
const DATA_URL = {
    NODES: 'csv/Zurich_2024_nodes.csv' // Update this path
};

const INITIAL_VIEW_STATE: MapViewState = {
    latitude: 47.4,
    longitude: 8.55,
    zoom: 13,
    minZoom: 1,
    maxZoom: 20
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';

// Define the structure of Node data
type Node = {
    node_id: string;
    lon: number;
    lat: number;
    type: string;
    node_geom: string;
};

// Function to convert CSV data to GeoJSON format
function convertToGeoJSON(nodes: Node[]): Feature<Point, GeoJsonProperties>[] {
    return nodes.map(node => ({
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [node.lon, node.lat]
        },
        properties: {
            node_id: node.node_id,
            type: node.type,
            node_geom: node.node_geom
        }
    }));
}

function renderTooltip({
                           hoverInfo
                       }: {
    hoverInfo?: any; // Adjust type based on your hoverInfo structure
}) {
    if (!hoverInfo?.object) {
        return null;
    }

    const { object, x, y } = hoverInfo;
    const { properties } = object;
    const content = (
        <div>
            Node ID: <b>{properties.node_id}</b><br/>
            Type: <b>{properties.type}</b><br/>
            Geometry: <b>{properties.node_geom}</b>
        </div>
    );

    return (
        <div className="tooltip" style={{ left: x, top: y }}>
            {content}
        </div>
    );
}

function App() {
    const [nodes, setNodes] = useState<Feature<Point, GeoJsonProperties>[]>([]);
    const [hoverInfo, setHoverInfo] = useState<any>();

    useEffect(() => {
        // Load the nodes data from CSV
        async function fetchData() {
            const data = await load(DATA_URL.NODES, CSVLoader);

            // Ensure data is in the correct format and map to Node type
            const nodesData = (data as unknown as Node[]).map(row => ({
                node_id: row.node_id,
                lon: parseFloat(String(row.lon)),
                lat: parseFloat(String(row.lat)),
                type: row.type,
                node_geom: row.node_geom
            }));

            const geoJsonData = convertToGeoJSON(nodesData);
            setNodes(geoJsonData);
        }
        fetchData();
    }, []);

    const layers = [
        new GeoJsonLayer({
            id: 'nodes-layer',
            data: nodes,
            pointRadiusMinPixels: 10,
            getPointRadius: 10,
            getFillColor: [255, 0, 0, 255],
            pickable: true,
            onHover: setHoverInfo
        })
    ];

    return (
        <DeckGL
            layers={layers}
            initialViewState={INITIAL_VIEW_STATE}
            controller={true}
        >
            <Map reuseMaps mapStyle={MAP_STYLE} />
            {renderTooltip({ hoverInfo })}
        </DeckGL>
    );
}

export async function renderToDOM(container: HTMLDivElement) {
    const root = createRoot(container);
    root.render(<App />);
}
