import React from 'react';
import DeckGL from '@deck.gl/react';
import { GeoJsonLayer } from '@deck.gl/layers';
import { Map } from 'react-map-gl/maplibre';
import { MAP_STYLE } from '../utils/constants';
import { scaleLinear } from 'd3-scale';

export function DeckGLMap({ nodes, edges, lanes, connections, visibility, onClick, initialViewState }) {
    const getColorFromSpeed = (speed) => {
        const colorScale = scaleLinear()
            .domain([30, 120]) // Example domain for speed, adjust as necessary
            .range([[0, 0, 255], [255, 0, 0]]) // Blue to red gradient
            .clamp(true);

        return colorScale(speed);
    };

    const layers = [
        visibility.nodes && new GeoJsonLayer({
            id: 'nodes-layer',
            data: nodes,
            pointRadiusMinPixels: 5,
            getPointRadius: 5,
            getFillColor: [255, 0, 0],
            pickable: true,
            onClick: info => onClick(info, 'Node')
        }),
        visibility.edges && new GeoJsonLayer({
            id: 'edges-layer',
            data: edges,
            getLineColor: d => getColorFromSpeed(d.properties.speed),
            getLineWidth: 2,
            pickable: true,
            onClick: info => onClick(info, 'Edge')
        }),
        visibility.lanes && new GeoJsonLayer({
            id: 'lanes-layer',
            data: lanes,
            getLineColor: [0, 255, 255],
            getLineWidth: 2,
            pickable: true,
            onClick: info => onClick(info, 'Lane')
        }),
        visibility.connections && new GeoJsonLayer({
            id: 'connections-layer',
            data: connections,
            getLineColor: [255, 255, 0],
            getLineWidth: 2,
            pickable: true,
            onClick: info => onClick(info, 'Connection')
        })
    ].filter(Boolean);

    return (
        <DeckGL
            layers={layers}
            initialViewState={initialViewState}
            controller={true}
        >
            <Map reuseMaps mapStyle={MAP_STYLE} />
        </DeckGL>
    );
}
