import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import DeckGL from '@deck.gl/react';
import { GeoJsonLayer } from '@deck.gl/layers';
import { Map } from 'react-map-gl/maplibre';
import { load } from '@loaders.gl/core';
import { CSVLoader } from '@loaders.gl/csv';
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

function convertNodesToGeoJSON(nodes) {
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

function convertLinesToGeoJSON(lines, key) {
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
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [lanes, setLanes] = useState([]);
    const [connections, setConnections] = useState([]);
    const [hoverInfo, setHoverInfo] = useState(null);
    const [infoBoxVisible, setInfoBoxVisible] = useState(false);
    const [elementType, setElementType] = useState('');
    const [showNodes, setShowNodes] = useState(true);
    const [showEdges, setShowEdges] = useState(false);
    const [showLanes, setShowLanes] = useState(false);
    const [showConnections, setShowConnections] = useState(false);

    useEffect(() => {
        async function fetchData() {
            const [nodesData, edgesData, lanesData, connectionsData] = await Promise.all([
                load(DATA_URLS.NODES, CSVLoader),
                load(DATA_URLS.EDGES, CSVLoader),
                load(DATA_URLS.LANES, CSVLoader),
                load(DATA_URLS.CONNECTIONS, CSVLoader)
            ]);

            const parsedNodes = nodesData.data.map(row => ({
                node_id: row.node_id,
                lon: parseFloat(row.lon),
                lat: parseFloat(row.lat),
                type: row.type,
                node_geom: row.node_geom
            }));
            setNodes(convertNodesToGeoJSON(parsedNodes));

            const parsedEdges = edgesData.data.map(row => ({
                ...row,
                line_geom: row.line_geom
            }));
            setEdges(convertLinesToGeoJSON(parsedEdges, 'line_geom'));

            const parsedLanes = lanesData.data.map(row => ({
                ...row,
                line_geom: row.line_geom
            }));
            setLanes(convertLinesToGeoJSON(parsedLanes, 'line_geom'));

            const parsedConnections = connectionsData.data.map(row => ({
                ...row,
                line_geom: row.line_geom
            }));
            setConnections(convertLinesToGeoJSON(parsedConnections, 'line_geom'));
        }

        fetchData();
    }, []);

    const handleOnClick = (info, type) => {
        if (info.object) {
            setHoverInfo(info.object.properties);
            setElementType(type);
            setInfoBoxVisible(true);
        }
    };

    const layers = [
        showNodes && new GeoJsonLayer({
            id: 'nodes-layer',
            data: nodes,
            pointRadiusMinPixels: 5,
            getPointRadius: 5,
            getFillColor: [255, 0, 0],
            pickable: true,
            onClick: info => handleOnClick(info, 'Node')
        }),
        showEdges && new GeoJsonLayer({
            id: 'edges-layer',
            data: edges,
            getLineColor: [0, 255, 0],
            getLineWidth: 2,
            pickable: true,
            onClick: info => handleOnClick(info, 'Edge')
        }),
        showLanes && new GeoJsonLayer({
            id: 'lanes-layer',
            data: lanes,
            getLineColor: [0, 0, 255],
            getLineWidth: 2,
            pickable: true,
            onClick: info => handleOnClick(info, 'Lane')
        }),
        showConnections && new GeoJsonLayer({
            id: 'connections-layer',
            data: connections,
            getLineColor: [255, 255, 0],
            getLineWidth: 2,
            pickable: true,
            onClick: info => handleOnClick(info, 'Connection')
        })
    ].filter(Boolean);

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

            {infoBoxVisible && (
                <div className="infoBox">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3>{elementType} Information</h3>
                        <button onClick={() => setInfoBoxVisible(false)}>Close</button>
                    </div>
                    <ul>
                        {Object.entries(hoverInfo).map(([key, value]) => (
                            <li key={key}>
                                <strong>{key}:</strong> {value}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export function renderToDOM(container) {
    const root = createRoot(container);
    root.render(<App />);
}
