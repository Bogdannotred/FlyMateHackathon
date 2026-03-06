// Basic mock graph for Oradea Airport layout
// Coordinates are in a 0-100% relative system for an SVG viewBox

export const ORADEA_NODES = {
    entrance: { id: 'entrance', label: 'Main Entrance', x: 50, y: 90 },
    checkin: { id: 'checkin', label: 'Check-in Desks', x: 50, y: 70 },
    security: { id: 'security', label: 'Security Control', x: 50, y: 50 },
    dutyfree: { id: 'dutyfree', label: 'Duty Free Area', x: 50, y: 35 },
    gate1: { id: 'gate1', label: 'Gate 1', x: 20, y: 20 },
    gate2: { id: 'gate2', label: 'Gate 2', x: 40, y: 15 },
    gate3: { id: 'gate3', label: 'Gate 3', x: 60, y: 15 },
    gate4: { id: 'gate4', label: 'Gate 4', x: 80, y: 20 },
    cafe: { id: 'cafe', label: 'Airport Cafe', x: 30, y: 40 },
    wc: { id: 'wc', label: 'Restrooms', x: 70, y: 40 }
};

export const ORADEA_EDGES = [
    { source: 'entrance', target: 'checkin' },
    { source: 'checkin', target: 'security' },
    { source: 'security', target: 'dutyfree' },
    { source: 'dutyfree', target: 'gate2' },
    { source: 'dutyfree', target: 'gate3' },
    { source: 'dutyfree', target: 'cafe' },
    { source: 'dutyfree', target: 'wc' },
    { source: 'cafe', target: 'gate1' },
    { source: 'gate2', target: 'gate1' },
    { source: 'gate3', target: 'gate4' },
    { source: 'wc', target: 'gate4' }
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

export const getNodesAsArray = () => Object.values(ORADEA_NODES);
