import { useState, useEffect } from 'react';
import { load } from '@loaders.gl/core';
import { CSVLoader } from '@loaders.gl/csv';
import { convertNodesToGeoJSON, convertLinesToGeoJSON } from '../utils/dataUtils';
import { DATA_URLS } from '../utils/constants';

export function useMapData() {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [lanes, setLanes] = useState([]);
    const [connections, setConnections] = useState([]);
    const [edgeData, setEdgeData] = useState([]);

    useEffect(() => {
        async function fetchData() {
            const [nodesData, edgesData, lanesData, connectionsData, edgeData] = await Promise.all([
                load(DATA_URLS.NODES, CSVLoader),
                load(DATA_URLS.EDGES, CSVLoader),
                load(DATA_URLS.LANES, CSVLoader),
                load(DATA_URLS.CONNECTIONS, CSVLoader),
                load(DATA_URLS.EDGE_DATA, CSVLoader)
            ]);

            setNodes(convertNodesToGeoJSON(nodesData.data));
            setEdges(convertLinesToGeoJSON(edgesData.data, 'line_geom'));
            setLanes(convertLinesToGeoJSON(lanesData.data, 'line_geom'));
            setConnections(convertLinesToGeoJSON(connectionsData.data, 'line_geom'));
            setEdgeData(edgeData.data);
        }

        fetchData();
    }, []);

    return { nodes, edges, lanes, connections, edgeData };
}
