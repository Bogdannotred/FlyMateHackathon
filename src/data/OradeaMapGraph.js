
export const ORADEA_NODES = {
    "gate3": {
        "id": "gate3",
        "label": "Gate 3",
        "x": 40.26,
        "y": 32.32
    },
    "gate4": {
        "id": "gate4",
        "label": "Gate 4",
        "x": 56.01,
        "y": 40.17
    },
    "dutyfree": {
        "id": "dutyfree",
        "label": "Duty Free Area",
        "x": 40.32,
        "y": 62.79
    },
    "entrance": {
        "id": "entrance",
        "label": "Main Entrance",
        "x": 30,
        "y": 83.82
    },
    "checkin": {
        "id": "checkin",
        "label": "Check-in Desks",
        "x": 52.39,
        "y": 79.16
    },
    "gate1": {
        "id": "gate1",
        "label": "Gate 1",
        "x": 41.39,
        "y": 16.18
    },
    "gate2": {
        "id": "gate2",
        "label": "Gate 2",
        "x": 64.54,
        "y": 22.42
    },
    "security": {
        "id": "security",
        "label": "Security Control",
        "x": 21.36,
        "y": 68.2
    },
    "cafe": {
        "id": "cafe",
        "label": "Airport Cafe",
        "x": 57.17,
        "y": 54.25
    },
    "wc": {
        "id": "wc",
        "label": "Restrooms",
        "x": 28.67,
        "y": 49.98
    },
    "wp_entrance_checkin": {
        "id": "wp_entrance_checkin",
        "label": "",
        "x": 40,
        "y": 76,
        "isWaypoint": true
    },
    "wp_checkin_sec": {
        "id": "wp_checkin_sec",
        "label": "",
        "x": 34.28,
        "y": 66.48,
        "isWaypoint": true
    },
    "wp_sec_duty": {
        "id": "wp_sec_duty",
        "label": "",
        "x": 32.89,
        "y": 58.05,
        "isWaypoint": true
    },
    "wp_duty_gate3": {
        "id": "wp_duty_gate3",
        "label": "",
        "x": 36.67,
        "y": 43.96,
        "isWaypoint": true
    },
    "wp_duty_cafe": {
        "id": "wp_duty_cafe",
        "label": "",
        "x": 48.11,
        "y": 53.52,
        "isWaypoint": true
    },
    "wp_duty_gate4": {
        "id": "wp_duty_gate4",
        "label": "",
        "x": 50,
        "y": 44.97,
        "isWaypoint": true
    }
};

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

export const WALL_PATHS = `M 46.52,51.39 L 49.96,39.23 L 56.08,40.15 L 52.47,52.33 M 42.82,5.45 L 71.81,9.28 L 68.12,22.63 M 39.11,19.11 L 42.82,5.44 M 34.61,35.77 L 38.93,19.78 M 52.44,79.17 L 50.01,87.94 L 28.75,85.2 L 28.05,87.21 L 15.32,85.69 L 26.87,43.87 L 32.24,44.48 L 34.46,36.28 M 53.55,75.16 L 52.61,78.54 M 54.74,70.84 L 53.7,74.6 M 56.81,63.38 L 54.89,70.3 M 57.89,59.48 L 57,62.68 M 58.99,55.35 L 58.04,58.93 M 67.86,23.57 L 64.89,34.3 L 59.26,54.5 L 59.2,54.74 M 66.85,27.26 L 57.09,26.02 L 57.42,24.81 M 59.05,18.85 L 59.54,17.09 L 69.26,18.51 M 57.56,24.3 L 58.86,19.57 M 51.57,82.24 L 30.08,79.26 L 34.36,64.98 L 38.85,65.65 M 34.36,64.98 L 34.51,64.51 M 38.78,50.31 L 43.02,35.41 M 41.32,10.96 L 49.69,12.03 L 70.35,14.72 M 30.08,79.26 L 28.16,85.18 L 28.75,85.2 M 59.54,17.09 L 48.58,15.74 M 57.09,26.02 L 46.09,24.84 M 50.45,20.75 L 55.74,21.37 M 58.98,23.69 L 65.97,24.62 M 60.24,20.76 L 66.83,21.7 M 44.6,29.88 L 49.69,12.03 M 40.39,65.87 L 45.9,66.67 M 45.5,51.31 L 52.84,52.39 M 47.74,66.95 L 55.52,68.1 M 52.79,25.57 L 52.5,26.5 M 54.78,52.67 L 59.57,53.38 M 37.69,53.88 L 42.11,54.49 L 42.7,52.42 M 35.29,61.91 L 39.57,62.6 L 38.92,64.71 M 39.57,62.6 L 40.24,60.17 M 42.11,54.49 L 41,58.23 M 39.77,54.15 L 39.46,55.36 L 40.66,55.52 M 39.46,55.36 L 38.48,55.23 M 37.3,62.22 L 37.66,61.01 L 38.9,61.2 M 37.66,61.01 L 36.69,60.9 M 32.7,77.21 L 37.28,77.85 L 36.65,80.2 M 52.25,79.99 L 45.92,79.05 L 45.5,80.48 M 57.09,26.02 L 56.62,27.8 M 52.43,26.71 L 52.23,27.34 L 60.59,28.2 L 60.73,27.53 M 60.79,27.26 L 60.94,26.51 M 55.75,25.87 L 55.56,26.63 L 56.92,26.77 L 58.25,26.92 L 58.42,26.19 M 37.3,62.22 L 36.88,63.64 L 38.19,63.85 M 36.88,63.64 L 35.96,63.51 M 34.72,63.8 L 38.78,50.31 L 43.13,50.91 M 38.92,64.71 L 38.62,65.62 M 25.58,49 L 30.87,49.55 L 29.37,54.58 M 20.56,67.2 L 24.97,67.64 L 22.78,75.58 M 16.49,81.61 L 20.59,82.18 L 19.61,85.29`;

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
