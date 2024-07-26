import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { DeckGLMap } from './components/DeckGLMap';
import { InfoBox } from './components/InfoBox';
import { useMapData } from './hooks/getData';
import { INITIAL_VIEW_STATE } from './utils/constants';

function App() {
    const { nodes, edges, lanes, connections, edgeData } = useMapData();

    const [clickInfo, setClickInfo] = useState(null);
    const [infoBoxVisible, setInfoBoxVisible] = useState(false);
    const [elementType, setElementType] = useState('');
    const [sliderValue, setSliderValue] = useState(18000); // Default to 5 AM (in seconds)

    const [visibility, setVisibility] = useState({
        nodes: false,
        edges: true,
        lanes: false,
        connections: true
    });

    const handleLayerVisibilityChange = (layer) => {
        setVisibility(prev => ({ ...prev, [layer]: !prev[layer] }));
    };

    const handleClick = (info, type) => {
        if (info.object) {
            let clickProperties = { ...info.object.properties };
            if (type === 'Edge') {
                const edgeId = clickProperties.edge_id;
                const edgeDataProperties = edgeData.find(data =>
                    data.edge_id === edgeId && data.interval_begin <= sliderValue && data.interval_end >= sliderValue
                );
                if (edgeDataProperties) {
                    clickProperties = { ...clickProperties, ...edgeDataProperties };
                }
            }
            setClickInfo(clickProperties);
            setElementType(type);
            setInfoBoxVisible(true);
        }
    };

    return (
        <div>
            <DeckGLMap
                nodes={nodes}
                edges={edges}
                lanes={lanes}
                connections={connections}
                visibility={visibility}
                onClick={handleClick}
                initialViewState={INITIAL_VIEW_STATE}
            />

            <div className="checkBoxGroup">
                <h3>Layers</h3>
                {Object.keys(visibility).map(layer => (
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={visibility[layer]}
                            onChange={() => handleLayerVisibilityChange(layer)}
                        />
                        {layer.charAt(0).toUpperCase() + layer.slice(1)}
                    </label>
                ))}
            </div>

            {infoBoxVisible && (
                <InfoBox
                    elementType={elementType}
                    clickInfo={clickInfo}
                    setClickInfo={setClickInfo}
                    edgeData={edgeData}
                    sliderValue={sliderValue}
                    setSliderValue={setSliderValue}
                    onClose={() => setInfoBoxVisible(false)}
                />
            )}
        </div>
    );
}

export function renderToDOM(container) {
    const root = createRoot(container);
    root.render(<App/>);
}