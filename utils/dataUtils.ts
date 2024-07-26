export function convertNodesToGeoJSON(nodes) {
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

export function convertLinesToGeoJSON(lines, key) {
    return lines.map(line => {
        const coordinatesString = line[key]
            .replace('LINESTRING (', '')
            .replace(')', '');
        const coordinates = coordinatesString
            .split(', ')
            .map(pair => pair.split(' ').map(Number));
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
