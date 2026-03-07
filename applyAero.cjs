const fs = require('fs');
const beaconsRaw = fs.readFileSync('/Users/bogdy2k/Downloads/aero 2/data/beacons_1.js', 'utf-8');
const releveuRaw = fs.readFileSync('/Users/bogdy2k/Downloads/aero 2/data/releveu_2.js', 'utf-8');
const zonesRaw = fs.readFileSync('/Users/bogdy2k/Downloads/aero 2/data/zonebeacons_3.js', 'utf-8');

const beaconsObj = JSON.parse(beaconsRaw.replace('var json_beacons_1 = ', ''));
const releveuObj = JSON.parse(releveuRaw.replace('var json_releveu_2 = ', ''));
const zonesObj = JSON.parse(zonesRaw.replace('var json_zonebeacons_3 = ', ''));

let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
const applyBounds = (x, y) => {
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
};
beaconsObj.features.forEach(f => applyBounds(f.geometry.coordinates[0], f.geometry.coordinates[1]));
releveuObj.features.forEach(f => f.geometry.coordinates.forEach(([x, y]) => applyBounds(x, y)));
zonesObj.features.forEach(f => f.geometry.coordinates[0][0].forEach(([x, y]) => applyBounds(x, y)));

const width = maxX - minX;
const height = maxY - minY;
const maxDim = Math.max(width, height);
const norm = (x, y) => {
    const nx = ((x - minX) / maxDim) * 90 + 5;
    const ny = ((y - minY) / maxDim) * 90 + 5; // Removed Y-invert for aero 2
    return { x: parseFloat(nx.toFixed(2)), y: parseFloat(ny.toFixed(2)) };
};

// Map nodes back to their actual geojson order (1 to 10)
const nodeNames = ['entrance', 'checkin', 'security', 'dutyfree', 'cafe', 'gate1', 'gate2', 'gate3', 'gate4', 'wc'];
const outNodes = {};
beaconsObj.features.forEach((f, idx) => {
    const n = norm(f.geometry.coordinates[0], f.geometry.coordinates[1]);
    const nName = nodeNames[idx] || `node_${idx}`;
    let labelMap = {
        'entrance': 'Main Entrance', 'checkin': 'Check-in Desks', 'security': 'Security Control',
        'dutyfree': 'Duty Free Area', 'cafe': 'Airport Cafe', 'gate1': 'Gate 1', 'gate2': 'Gate 2',
        'gate3': 'Gate 3', 'gate4': 'Gate 4', 'wc': 'Restrooms'
    };
    outNodes[nName] = { id: nName, label: labelMap[nName] || `Beacon ${f.properties.fid}`, x: n.x, y: n.y };
});

outNodes['wp_entrance_checkin'] = { id: 'wp_entrance_checkin', label: '', x: 40, y: 24, isWaypoint: true };
outNodes['wp_checkin_sec'] = { id: 'wp_checkin_sec', label: '', x: 34.28, y: 33.52, isWaypoint: true };
outNodes['wp_sec_duty'] = { id: 'wp_sec_duty', label: '', x: 32.89, y: 41.95, isWaypoint: true };
outNodes['wp_duty_gate3'] = { id: 'wp_duty_gate3', label: '', x: 36.67, y: 56.04, isWaypoint: true };
outNodes['wp_duty_cafe'] = { id: 'wp_duty_cafe', label: '', x: 48.11, y: 46.48, isWaypoint: true };
outNodes['wp_duty_gate4'] = { id: 'wp_duty_gate4', label: '', x: 50.00, y: 55.03, isWaypoint: true };

const lines = releveuObj.features.map(f => f.geometry.coordinates.map(([x, y]) => {
    const n = norm(x, y); return `${n.x},${n.y}`;
}).join(' L '));
const svgPaths = lines.map(l => `M ${l}`).join(' ');

// Generate new JS content
let fileContent = `
export const ORADEA_NODES = ${JSON.stringify(outNodes, null, 4)};

export const ORADEA_EDGES = [
    { source: 'entrance', target: 'wp_entrance_checkin' },
    { source: 'wp_entrance_checkin', target: 'checkin' },
    
    { source: 'checkin', target: 'wp_checkin_sec' },
    { source: 'wp_checkin_sec', target: 'security' },
    
    { source: 'security', target: 'wp_sec_duty' },
    { source: 'wp_sec_duty', target: 'dutyfree' },
    { source: 'wp_sec_duty', target: 'wc' },
    
    { source: 'dutyfree', target: 'wp_duty_gate3' },
    { source: 'wp_duty_gate3', target: 'gate3' },
    
    { source: 'dutyfree', target: 'wp_duty_cafe' },
    { source: 'wp_duty_cafe', target: 'cafe' },
    { source: 'cafe', target: 'gate1' },
    
    { source: 'dutyfree', target: 'wp_duty_gate4' },
    { source: 'wp_duty_gate4', target: 'gate4' },
    
    { source: 'wp_duty_gate4', target: 'gate2' },
    { source: 'gate2', target: 'gate1' },
    { source: 'gate3', target: 'gate4' }
];

export const WALL_PATHS = \`${svgPaths}\`;

export const ZONES = [];
export const DECORATIONS = [];

export const getNodesAsArray = () => Object.values(ORADEA_NODES).filter(n => !n.isWaypoint);

const getAdjacencyList = (edges) => {
    const list = {};
    Object.keys(ORADEA_NODES).forEach(nodeId => { list[nodeId] = []; });
    edges.forEach(edge => {
        const dx = ORADEA_NODES[edge.source].x - ORADEA_NODES[edge.target].x;
        const dy = ORADEA_NODES[edge.source].y - ORADEA_NODES[edge.target].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        list[edge.source].push({ node: edge.target, weight: dist });
        list[edge.target].push({ node: edge.source, weight: dist });
    });
    return list;
};
export const ADJACENCY_LIST = getAdjacencyList(ORADEA_EDGES);

export const findShortestPath = (startId, endId) => {
    const distances = {};
    const previous = {};
    const unvisited = new Set(Object.keys(ORADEA_NODES));

    Object.keys(ORADEA_NODES).forEach(node => {
        distances[node] = Infinity;
        previous[node] = null;
    });
    distances[startId] = 0;

    while (unvisited.size > 0) {
        let current = null;
        let minDistance = Infinity;
        unvisited.forEach(node => {
            if (distances[node] < minDistance) {
                minDistance = distances[node];
                current = node;
            }
        });

        if (current === null || current === endId) break;
        unvisited.delete(current);

        ADJACENCY_LIST[current].forEach(neighbor => {
            const alt = distances[current] + neighbor.weight;
            if (alt < distances[neighbor.node]) {
                distances[neighbor.node] = alt;
                previous[neighbor.node] = current;
            }
        });
    }

    const path = [];
    let current = endId;
    while (current !== null) {
        path.unshift(ORADEA_NODES[current]);
        current = previous[current];
    }
    return path[0] && path[0].id === startId ? path : [];
};
`;

fs.writeFileSync('/Users/bogdy2k/Desktop/Projects/FlyMate - DEMO/FlyMate/src/data/OradeaMapGraph.js', fileContent, 'utf-8');
console.log('Successfully updated OradeaMapGraph.js');
