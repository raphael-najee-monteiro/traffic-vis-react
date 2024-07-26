import React from 'react';

export function LayerBox({ visibility, onChange }) {
    return (
        <div className="checkBoxGroup">
            <h3>Layers</h3>
            {Object.keys(visibility).map(layer => (
                <label key={layer} className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={visibility[layer]}
                        onChange={() => onChange(layer)}
                    />
                    {layer.charAt(0).toUpperCase() + layer.slice(1)}
                </label>
            ))}
        </div>
    );
}