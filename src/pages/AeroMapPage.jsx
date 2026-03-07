import React from 'react';
import { MapContainer, TileLayer, GeoJSON, LayersControl, LayerGroup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { beacons } from '../data/aero/beacons';
import { releveu } from '../data/aero/releveu';
import { zonebeacons } from '../data/aero/zonebeacons';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default Leaflet markers in React + Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow
});

const AeroMapPage = () => {
    const navigate = useNavigate();

    // Map starting bounds based on original QGIS export
    const bounds = [[47.026219517431954, 21.89437910068521], [47.03068316676018, 21.905130503808042]];

    // Styles from original index.html
    const beaconsStyle = {
        radius: 4.0,
        opacity: 1,
        color: 'rgba(50,87,128,1.0)',
        weight: 2.0,
        fill: true,
        fillOpacity: 1,
        fillColor: 'rgba(72,123,182,1.0)'
    };

    const releveuStyle = {
        opacity: 1,
        color: 'rgba(245,154,7,1.0)',
        weight: 3.0,
        fillOpacity: 0
    };

    const zonebeaconsStyle = {
        opacity: 1,
        color: 'rgba(31,120,180,1.0)',
        weight: 2.0,
        fillOpacity: 0.2 // Solid fill as Fallback for Stripes pattern
    };

    // Popups
    const onEachBeacon = (feature, layer) => {
        if (feature.properties) {
            const props = feature.properties;
            layer.bindPopup(`
                <b>Beacon ${props.fid || 'N/A'}</b><br>
                ID: ${props.ID || 'N/A'}<br>
                Name: ${props.Denumire || 'N/A'}<br>
                SN: ${props.SN || 'N/A'}<br>
                Brand: ${props.Marca || 'N/A'}<br>
                Model: ${props.Model || 'N/A'}<br>
                Frequency: ${props.Frecventa || 'N/A'}<br>
                Range: ${props.Razatransmitere || 'N/A'}
            `);
        }
    };

    return (
        <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <header className="header" style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000, background: 'rgba(20,22,28,0.9)', backdropFilter: 'blur(10px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => navigate(-1)} className="icon-btn">
                        <ArrowLeft size={24} />
                    </button>
                    <h1>Aero Map (QGIS)</h1>
                </div>
            </header>

            {/* Leaflet Map */}
            <div style={{ flex: 1, marginTop: '70px', position: 'relative', zIndex: 1 }}>
                <MapContainer bounds={bounds} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                    <LayersControl position="topright">
                        <LayersControl.BaseLayer checked name="OpenStreetMap">
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                        </LayersControl.BaseLayer>

                        <LayersControl.Overlay checked name="Zone Beacons">
                            <LayerGroup>
                                <GeoJSON data={zonebeacons} style={zonebeaconsStyle} />
                            </LayerGroup>
                        </LayersControl.Overlay>

                        <LayersControl.Overlay checked name="Releveu">
                            <LayerGroup>
                                <GeoJSON data={releveu} style={releveuStyle} />
                            </LayerGroup>
                        </LayersControl.Overlay>

                        <LayersControl.Overlay checked name="Beacons">
                            <LayerGroup>
                                <GeoJSON
                                    data={beacons}
                                    pointToLayer={(feature, latlng) => L.circleMarker(latlng, beaconsStyle)}
                                    onEachFeature={onEachBeacon}
                                />
                            </LayerGroup>
                        </LayersControl.Overlay>
                    </LayersControl>
                </MapContainer>
            </div>
        </div>
    );
};

export default AeroMapPage;
