import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import DeckGL from '@deck.gl/react';
import { GeoJsonLayer } from '@deck.gl/layers';
import { Map } from 'react-map-gl/maplibre';
import { load } from '@loaders.gl/core';
import { CSVLoader } from '@loaders.gl/csv';
import { Feature, Point, LineString, GeoJsonProperties } from 'geojson';
import { MapViewState } from 'deck.gl';

// Define the URLs to the CSV files
const DATA_URLS = {
    NODES: 'csv/nodes.csv',
    EDGES: 'csv/edges.csv',
    LANES: 'csv/lanes.csv',
    CONNECTIONS: 'csv/connections.csv'
};

const INITIAL_VIEW_STATE: MapViewState = {
    latitude: 47.38,
    longitude: 8.55,
    zoom: 11,
    minZoom: 1,
    maxZoom: 20
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';

type Node = {
    node_id: string;
    lon: number;
    lat: number;
    type: string;
    node_geom: string;
};

type Edge = {
    edge_id: string;
    name: string;
    from_node: string;
    to_node: string;
    num_lanes: number;
    speed: number;
    priority: number;
    type: string;
    line_geom: string;
};

type Lane = {
    lane_id: string;
    name: string;
    lane_index: number;
    width: number;
    allow_vehicle: boolean;
    allow_car: boolean;
    allow_bus: boolean;
    allow_bike: boolean;
    priority: number;
    speed: number;
    from_node: string;
    to_node: string;
    line_type: string;
    line_geom: string;
};

type Connection = {
    conn_id: string;
    from_edge: string;
    to_edge: string;
    from_lane: string;
    from_lane_index: number;
    to_lane: string;
    to_lane_index: number;
    cont_pos: string;
    status: string;
    direction: string;
    line_geom: string;
};

function convertNodesToGeoJSON(nodes: Node[]): Feature<Point, GeoJsonProperties>[] {
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

function convertLinesToGeoJSON(lines: any[], key: string): Feature<LineString, GeoJsonProperties>[] {
    return lines.map(line => {
        const coordinatesString = line[key]
            .replace('LINESTRING (', '')
            .replace(')', '');

        const coordinates = coordinatesString
            .split(', ')
            .map(pair => pair.split(' ').map(Number)); // Reverse each [lat, lon] pair

        return {
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates
            },
            properties: {
                ...line
            }
        };
    });
}

function App() {
    const [nodes, setNodes] = useState<Feature<Point, GeoJsonProperties>[]>([]);
    const [edges, setEdges] = useState<Feature<LineString, GeoJsonProperties>[]>([]);
    const [lanes, setLanes] = useState<Feature<LineString, GeoJsonProperties>[]>([]);
    const [connections, setConnections] = useState<Feature<LineString, GeoJsonProperties>[]>([]);
    const [showNodes, setShowNodes] = useState<boolean>(true);
    const [showEdges, setShowEdges] = useState<boolean>(true);
    const [showLanes, setShowLanes] = useState<boolean>(true);
    const [showConnections, setShowConnections] = useState<boolean>(true);

    useEffect(() => {
        async function fetchData() {
            const [nodesData, edgesData, lanesData, connectionsData] = await Promise.all([
                load(DATA_URLS.NODES, CSVLoader),
                load(DATA_URLS.EDGES, CSVLoader),
                load(DATA_URLS.LANES, CSVLoader),
                load(DATA_URLS.CONNECTIONS, CSVLoader)
            ]);

            const parsedNodes = (nodesData.data as Node[]).map((row: Node) => ({
                node_id: row.node_id,
                lon: parseFloat(String(row.lon)),
                lat: parseFloat(String(row.lat)),
                type: row.type,
                node_geom: row.node_geom
            }));
            setNodes(convertNodesToGeoJSON(parsedNodes));

            const parsedEdges = (edgesData.data as Edge[]).map((row: Edge) => ({
                ...row,
                line_geom: row.line_geom
            }));
            setEdges(convertLinesToGeoJSON(parsedEdges, 'line_geom'));

            const parsedLanes = (lanesData.data as Lane[]).map((row: Lane) => ({
                ...row,
                line_geom: row.line_geom
            }));
            setLanes(convertLinesToGeoJSON(parsedLanes, 'line_geom'));

            const parsedConnections = (connectionsData.data as Connection[]).map((row: Connection) => ({
                ...row,
                line_geom: row.line_geom
            }));
            setConnections(convertLinesToGeoJSON(parsedConnections, 'line_geom'));
        }

        fetchData();
    }, []);

    // Determine which layers to show based on checkbox states
    const layers = [
        showNodes && new GeoJsonLayer({
            id: 'nodes-layer',
            data: nodes,
            pointRadiusMinPixels: 5,
            getPointRadius: 5,
            getFillColor: [255, 0, 0],
            pickable: true,
            onHover: info => console.log(info)
        }),
        showEdges && new GeoJsonLayer({
            id: 'edges-layer',
            data: edges,
            getLineColor: [0, 255, 0],
            getLineWidth: 2,
            pickable: true,
            onHover: info => console.log(info)
        }),
        showLanes && new GeoJsonLayer({
            id: 'lanes-layer',
            data: lanes,
            getLineColor: [0, 0, 255],
            getLineWidth: 2,
            pickable: true,
            onHover: info => console.log(info)
        }),
        showConnections && new GeoJsonLayer({
            id: 'connections-layer',
            data: connections,
            getLineColor: [255, 255, 0],
            getLineWidth: 2,
            pickable: true,
            onHover: info => console.log(info)
        })
    ].filter(Boolean); // Remove undefined layers

    return (
        <div>
            <DeckGL
                layers={layers}
                initialViewState={INITIAL_VIEW_STATE}
                controller={true}
            >
                <Map reuseMaps mapStyle={MAP_STYLE} />
            </DeckGL>

            <div className="checkBoxGroup">
                <label>
                    <input
                        type="checkbox"
                        checked={showNodes}
                        onChange={() => setShowNodes(!showNodes)}
                    />
                    Nodes
                </label>
                <label style={{ marginLeft: '10px' }}>
                    <input
                        type="checkbox"
                        checked={showEdges}
                        onChange={() => setShowEdges(!showEdges)}
                    />
                    Edges
                </label>
                <label style={{ marginLeft: '10px' }}>
                    <input
                        type="checkbox"
                        checked={showLanes}
                        onChange={() => setShowLanes(!showLanes)}
                    />
                    Lanes
                </label>
                <label style={{ marginLeft: '10px' }}>
                    <input
                        type="checkbox"
                        checked={showConnections}
                        onChange={() => setShowConnections(!showConnections)}
                    />
                    Connections
                </label>
            </div>
        </div>
    );
}

export async function renderToDOM(container: HTMLDivElement) {
    const root = createRoot(container);
    root.render(<App />);
}
