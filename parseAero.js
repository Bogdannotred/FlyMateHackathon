const fs = require('fs');
const beaconsRaw = fs.readFileSync('/Users/bogdy2k/Downloads/aero/data/beacons_1.js', 'utf-8');
const releveuRaw = fs.readFileSync('/Users/bogdy2k/Downloads/aero/data/releveu_2.js', 'utf-8');
const zonesRaw = fs.readFileSync('/Users/bogdy2k/Downloads/aero/data/zonebeacons_3.js', 'utf-8');

const beaconsObj = JSON.parse(beaconsRaw.replace('var json_beacons_1 = ', ''));
const releveuObj = JSON.parse(releveuRaw.replace('var json_releveu_2 = ', ''));
const zonesObj = JSON.parse(zonesRaw.replace('var json_zonebeacons_3 = ', ''));

// Calculate Bounding Box across everything
let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

const applyBounds = (x, y) => {
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
};

// Beacons
beaconsObj.features.forEach(f => {
    const [x, y] = f.geometry.coordinates;
    applyBounds(x, y);
});

// Walls
releveuObj.features.forEach(f => {
    f.geometry.coordinates.forEach(([x, y]) => applyBounds(x, y));
});

// Zones
zonesObj.features.forEach(f => {
    f.geometry.coordinates[0][0].forEach(([x, y]) => applyBounds(x, y));
});

console.log('Bounds:', { minX, maxX, minY, maxY });

const width = maxX - minX;
const height = maxY - minY;

// To fit a 100x100 SVG viewbox nicely, maintain aspect ratio
const maxDim = Math.max(width, height);
// SVG Y goes from top to bottom, Lat goes bottom to top, so we invert Y.
const norm = (x, y) => {
    const nx = ((x - minX) / maxDim) * 90 + 5; // 5% padding
    // invert Y for SVG
    const ny = (1 - ((y - minY) / maxDim)) * 90 + 5;
    return { x: nx, y: ny };
};

const nodeNames = ['entrance', 'checkin', 'security', 'dutyfree', 'cafe', 'gate1', 'gate2', 'gate3', 'gate4', 'wc'];
const outNodes = {};
beaconsObj.features.forEach((f, idx) => {
    const [x, y] = f.geometry.coordinates;
    const n = norm(x, y);
    const nName = nodeNames[idx] || `node_${idx}`;
    outNodes[nName] = { id: nName, label: `Beacon ${f.properties.fid}`, x: parseFloat(n.x.toFixed(2)), y: parseFloat(n.y.toFixed(2)) };
});

const outWalls = releveuObj.features.map(f => {
    return f.geometry.coordinates.map(([x, y]) => {
        const n = norm(x, y);
        return [parseFloat(n.x.toFixed(2)), parseFloat(n.y.toFixed(2))];
    });
});

const outZones = zonesObj.features.map(f => {
    return f.geometry.coordinates[0][0].map(([x, y]) => {
        const n = norm(x, y);
        return [parseFloat(n.x.toFixed(2)), parseFloat(n.y.toFixed(2))];
    });
});

fs.writeFileSync('src/data/AeroParsed.json', JSON.stringify({
    NODES: outNodes,
    WALLS: outWalls,
    ZONES: outZones
}, null, 2));

console.log('Saved to src/data/AeroParsed.json');
