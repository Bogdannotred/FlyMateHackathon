
export const ORADEA_NODES = {
    "entrance": {
        "id": "entrance",
        "label": "Main Entrance",
        "x": 40.26,
        "y": 67.68
    },
    "checkin": {
        "id": "checkin",
        "label": "Check-in Desks",
        "x": 56.01,
        "y": 59.83
    },
    "security": {
        "id": "security",
        "label": "Security Control",
        "x": 40.32,
        "y": 37.21
    },
    "dutyfree": {
        "id": "dutyfree",
        "label": "Duty Free Area",
        "x": 30,
        "y": 16.18
    },
    "cafe": {
        "id": "cafe",
        "label": "Airport Cafe",
        "x": 52.39,
        "y": 20.84
    },
    "gate1": {
        "id": "gate1",
        "label": "Gate 1",
        "x": 41.39,
        "y": 83.82
    },
    "gate2": {
        "id": "gate2",
        "label": "Gate 2",
        "x": 64.54,
        "y": 77.58
    },
    "gate3": {
        "id": "gate3",
        "label": "Gate 3",
        "x": 21.36,
        "y": 31.8
    },
    "gate4": {
        "id": "gate4",
        "label": "Gate 4",
        "x": 57.17,
        "y": 45.75
    },
    "wc": {
        "id": "wc",
        "label": "Restrooms",
        "x": 28.67,
        "y": 50.02
    },
    "wp_entrance_checkin": {
        "id": "wp_entrance_checkin",
        "label": "",
        "x": 40,
        "y": 24,
        "isWaypoint": true
    },
    "wp_checkin_sec": {
        "id": "wp_checkin_sec",
        "label": "",
        "x": 34.28,
        "y": 33.52,
        "isWaypoint": true
    },
    "wp_sec_duty": {
        "id": "wp_sec_duty",
        "label": "",
        "x": 32.89,
        "y": 41.95,
        "isWaypoint": true
    },
    "wp_duty_gate3": {
        "id": "wp_duty_gate3",
        "label": "",
        "x": 36.67,
        "y": 56.04,
        "isWaypoint": true
    },
    "wp_duty_cafe": {
        "id": "wp_duty_cafe",
        "label": "",
        "x": 48.11,
        "y": 46.48,
        "isWaypoint": true
    },
    "wp_duty_gate4": {
        "id": "wp_duty_gate4",
        "label": "",
        "x": 50,
        "y": 55.03,
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

export const WALL_PATHS = `M 46.52,48.61 L 49.96,60.77 L 56.08,59.85 L 52.47,47.67 M 42.82,94.55 L 71.81,90.72 L 68.12,77.37 M 39.11,80.89 L 42.82,94.56 M 34.61,64.23 L 38.93,80.22 M 52.44,20.83 L 50.01,12.06 L 28.75,14.8 L 28.05,12.79 L 15.32,14.31 L 26.87,56.13 L 32.24,55.52 L 34.46,63.72 M 53.55,24.84 L 52.61,21.46 M 54.74,29.16 L 53.7,25.4 M 56.81,36.62 L 54.89,29.7 M 57.89,40.52 L 57,37.32 M 58.99,44.65 L 58.04,41.07 M 67.86,76.43 L 64.89,65.7 L 59.26,45.5 L 59.2,45.26 M 66.85,72.74 L 57.09,73.98 L 57.42,75.19 M 59.05,81.15 L 59.54,82.91 L 69.26,81.49 M 57.56,75.7 L 58.86,80.43 M 51.57,17.76 L 30.08,20.74 L 34.36,35.02 L 38.85,34.35 M 34.36,35.02 L 34.51,35.49 M 38.78,49.69 L 43.02,64.59 M 41.32,89.04 L 49.69,87.97 L 70.35,85.28 M 30.08,20.74 L 28.16,14.82 L 28.75,14.8 M 59.54,82.91 L 48.58,84.26 M 57.09,73.98 L 46.09,75.16 M 50.45,79.25 L 55.74,78.63 M 58.98,76.31 L 65.97,75.38 M 60.24,79.24 L 66.83,78.3 M 44.6,70.12 L 49.69,87.97 M 40.39,34.13 L 45.9,33.33 M 45.5,48.69 L 52.84,47.61 M 47.74,33.05 L 55.52,31.9 M 52.79,74.43 L 52.5,73.5 M 54.78,47.33 L 59.57,46.62 M 37.69,46.12 L 42.11,45.51 L 42.7,47.58 M 35.29,38.09 L 39.57,37.4 L 38.92,35.29 M 39.57,37.4 L 40.24,39.83 M 42.11,45.51 L 41,41.77 M 39.77,45.85 L 39.46,44.64 L 40.66,44.48 M 39.46,44.64 L 38.48,44.77 M 37.3,37.78 L 37.66,38.99 L 38.9,38.8 M 37.66,38.99 L 36.69,39.1 M 32.7,22.79 L 37.28,22.15 L 36.65,19.8 M 52.25,20.01 L 45.92,20.95 L 45.5,19.52 M 57.09,73.98 L 56.62,72.2 M 52.43,73.29 L 52.23,72.66 L 60.59,71.8 L 60.73,72.47 M 60.79,72.74 L 60.94,73.49 M 55.75,74.13 L 55.56,73.37 L 56.92,73.23 L 58.25,73.08 L 58.42,73.81 M 37.3,37.78 L 36.88,36.36 L 38.19,36.15 M 36.88,36.36 L 35.96,36.49 M 34.72,36.2 L 38.78,49.69 L 43.13,49.09 M 38.92,35.29 L 38.62,34.38 M 25.58,51 L 30.87,50.45 L 29.37,45.42 M 20.56,32.8 L 24.97,32.36 L 22.78,24.42 M 16.49,18.39 L 20.59,17.82 L 19.61,14.71`;

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
