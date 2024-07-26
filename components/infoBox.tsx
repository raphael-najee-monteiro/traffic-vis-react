import React from 'react';

export function InfoBox({elementType, clickInfo, edgeData, sliderValue, setSliderValue, onClose, setClickInfo}) {
    return (
        <div className="infoBox">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h3>{elementType} Information</h3>
                <button onClick={onClose}>Close</button>
            </div>
            {elementType === 'Edge' && (
                <div className="sliderContainer">
                    <input
                        type="range"
                        min="18000"
                        max="25200"
                        step="900"
                        value={sliderValue}
                        onChange={(e) => {
                            const newValue = Number(e.target.value);
                            setSliderValue(newValue);
                            const updatedEdgeData = edgeData.find(data =>
                                data.edge_id === clickInfo.edge_id &&
                                data.interval_begin <= newValue &&
                                data.interval_end >= newValue
                            );
                            if (updatedEdgeData) {
                                setClickInfo(prev => ({
                                    ...prev,
                                    ...updatedEdgeData
                                }));
                            }
                        }}
                    />
                    <div>Time: {new Date(sliderValue * 1000).toISOString().substr(11, 5)}</div>
                </div>
            )}
            <ul className="data-points">
                {Object.entries(clickInfo).map(([key, value]) => (
                    <li key={key}>
                        <strong>{key}:</strong> {value}
                    </li>
                ))}
            </ul>
        </div>
    );
}
