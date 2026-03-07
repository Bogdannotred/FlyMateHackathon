// Enhanced Realistic mock graph for Oradea Airport layout
// Coords scaled 0-100 still work well for SVG. We are changing abstract zones to explicit Rooms/Rectangles.

export const ORADEA_NODES = {
    // Main zones
    entrance: { id: 'entrance', label: 'Main Entrance', type: 'entrance', x: 794, y: 106 },
    checkin: { id: 'checkin', label: 'Check-In', type: 'checkin', x: 808, y: 47 },
    security: { id: 'security', label: 'Security', type: 'security', x: 911, y: 47 },
    dutyFree: { id: 'dutyFree', label: 'Duty Free', type: 'shop', x: 955, y: 47 },
    cafe: { id: 'cafe', label: 'Cafe & Snacks', type: 'food', x: 911, y: 76 },
    wc: { id: 'wc', label: 'Restrooms', type: 'facility', x: 747, y: 106 },

    // Gates
    gate1: { id: 'gate1', label: 'Gate 1', type: 'gate', x: 990, y: 30 },
    gate2: { id: 'gate2', label: 'Gate 2', type: 'gate', x: 990, y: 47 },
    gate3: { id: 'gate3', label: 'Gate 3', type: 'gate', x: 990, y: 64 },
    gate4: { id: 'gate4', label: 'Gate 4', type: 'gate', x: 990, y: 80 }
};

export const ORADEA_EDGES = [
    // Simple direct paths for the open floor plan
    { source: 'entrance', target: 'checkin' },
    { source: 'entrance', target: 'wc' },
    { source: 'checkin', target: 'security' },
    { source: 'security', target: 'dutyFree' },
    { source: 'security', target: 'cafe' },

    // Gate corridor connections
    { source: 'dutyFree', target: 'gate2' },
    { source: 'gate2', target: 'gate1' },
    { source: 'gate2', target: 'gate3' },
    { source: 'gate3', target: 'gate4' }
];

// Helper to convert array of edges to adjacency list
const buildAdjacencyList = () => {
    const list = {};
    Object.keys(ORADEA_NODES).forEach(nodeId => {
        list[nodeId] = [];
    });

    ORADEA_EDGES.forEach(edge => {
        // Assume undirected for walking paths
        list[edge.source].push(edge.target);
        list[edge.target].push(edge.source);
    });
    return list;
};

// Simple BFS implementation for unweighted shortest path
export const findShortestPath = (startId, endId) => {
    if (!startId || !endId || !ORADEA_NODES[startId] || !ORADEA_NODES[endId]) return [];
    if (startId === endId) return [ORADEA_NODES[startId]];

    const adjacencyList = buildAdjacencyList();
    const queue = [[startId]];
    const visited = new Set([startId]);

    while (queue.length > 0) {
        const path = queue.shift();
        const currentNode = path[path.length - 1];

        if (currentNode === endId) {
            return path.map(id => ORADEA_NODES[id]);
        }

        const neighbors = adjacencyList[currentNode] || [];
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push([...path, neighbor]);
            }
        }
    }

    return []; // No path found
};

export const getNodesAsArray = () => Object.values(ORADEA_NODES).filter(n => n.type !== 'waypoint');
