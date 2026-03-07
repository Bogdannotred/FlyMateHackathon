// Enhanced Realistic mock graph for Oradea Airport layout
// Coords scaled 0-100 still work well for SVG. We are changing abstract zones to explicit Rooms/Rectangles.

export const ZONES = [
    // format: { id, type, color, rx, ry, width, height, label }
    // Coordinates top-left based (standard SVG Rect)

    // Main Entrance Block
    { id: 'zone-entry', type: 'entry', color: '#1B263B', x: 40, y: 80, width: 20, height: 15, label: 'Entry Hall' },

    // Check-in (Rectangle)
    { id: 'zone-checkin', type: 'checkin', color: '#1F3A2C', x: 30, y: 65, width: 40, height: 15, label: 'Check-in Area' },

    // Security Corridors (Narrower)
    { id: 'zone-security', type: 'security', color: '#3A1F2C', x: 35, y: 45, width: 30, height: 20, label: 'Security' },

    // Commercial Area (Duty Free - big square)
    { id: 'zone-commercial', type: 'commercial', color: '#25304C', x: 35, y: 30, width: 30, height: 15, label: 'Duty Free & Shops' },

    // Cafe Bar (Side room)
    { id: 'zone-cafe', type: 'cafe', color: '#4A3B2C', x: 20, y: 35, width: 15, height: 25, label: 'Cafe Bar' },

    // Restrooms (Side room opposite to Cafe)
    { id: 'zone-wc', type: 'facility', color: '#2B3A42', x: 65, y: 35, width: 15, height: 15, label: 'Restrooms' },

    // Boarding Gate Corridor (Long horizontal)
    { id: 'zone-corridor', type: 'corridor', color: '#1F2229', x: 15, y: 15, width: 70, height: 15, label: 'Gates Corridor' },

    // Gate Waiting Areas (Small bumps on the corridor)
    { id: 'zone-g1', type: 'gate-area', color: '#2C2B3A', x: 15, y: 5, width: 15, height: 10, label: '' },
    { id: 'zone-g2', type: 'gate-area', color: '#2C2B3A', x: 35, y: 5, width: 15, height: 10, label: '' },
    { id: 'zone-g3', type: 'gate-area', color: '#2C2B3A', x: 55, y: 5, width: 15, height: 10, label: '' },
    { id: 'zone-g4', type: 'gate-area', color: '#2C2B3A', x: 70, y: 5, width: 15, height: 10, label: '' }
];

export const DECORATIONS = [
    // Entrance Doors (Glass)
    { id: 'door-main', type: 'door', x: 45, y: 94.5, width: 10, height: 1, color: '#88CCFF', opacity: 0.6 },

    // Check-in Desks
    { id: 'desk-1', type: 'desk', x: 35, y: 68, width: 4, height: 2, color: '#888' },
    { id: 'desk-2', type: 'desk', x: 45, y: 68, width: 4, height: 2, color: '#888' },
    { id: 'desk-3', type: 'desk', x: 55, y: 68, width: 4, height: 2, color: '#888' },
    { id: 'desk-4', type: 'desk', x: 65, y: 68, width: 4, height: 2, color: '#888' },

    // Security Scanners (X-Rays)
    { id: 'scan-1', type: 'scanner', x: 42, y: 52, width: 2, height: 6, color: '#444' },
    { id: 'scan-2', type: 'scanner', x: 50, y: 52, width: 2, height: 6, color: '#444' },

    // Duty Free Shelves
    { id: 'shelf-1', type: 'shelf', x: 38, y: 32, width: 8, height: 2, color: '#2E4C6D' },
    { id: 'shelf-2', type: 'shelf', x: 38, y: 38, width: 8, height: 2, color: '#2E4C6D' },

    // Vending Machines (Bright distinct colors)
    { id: 'vend-1', type: 'vending', x: 63, y: 48, width: 2, height: 3, color: '#E63946', label: 'Cola' },
    { id: 'vend-2', type: 'vending', x: 63, y: 52, width: 2, height: 3, color: '#0077B6', label: 'Water' },

    // Cafe Counter & Tables
    { id: 'cafe-counter', type: 'desk', x: 22, y: 37, width: 10, height: 2, color: '#D4A373' },
    { id: 'table-1', type: 'table', x: 25, y: 45, r: 1.5, color: '#FAEDCD' },
    { id: 'table-2', type: 'table', x: 30, y: 45, r: 1.5, color: '#FAEDCD' },
    { id: 'table-3', type: 'table', x: 25, y: 52, r: 1.5, color: '#FAEDCD' },
    { id: 'table-4', type: 'table', x: 30, y: 52, r: 1.5, color: '#FAEDCD' },

    // Benches / Seating in Gates Corridor
    { id: 'bench-1', type: 'bench', x: 18, y: 8, width: 6, height: 2, color: '#555' },
    { id: 'bench-2', type: 'bench', x: 38, y: 8, width: 6, height: 2, color: '#555' },
    { id: 'bench-3', type: 'bench', x: 58, y: 8, width: 6, height: 2, color: '#555' },
    { id: 'bench-4', type: 'bench', x: 73, y: 8, width: 6, height: 2, color: '#555' },

    // Plants (Decorative)
    { id: 'plant-1', type: 'plant', x: 32, y: 78, r: 1.5, color: '#2D6A4F' },
    { id: 'plant-2', type: 'plant', x: 68, y: 78, r: 1.5, color: '#2D6A4F' },
    { id: 'plant-3', type: 'plant', x: 48, y: 28, r: 1, color: '#2D6A4F' },
    { id: 'plant-4', type: 'plant', x: 52, y: 28, r: 1, color: '#2D6A4F' }
];

export const ORADEA_NODES = {
    entrance: { id: 'entrance', label: 'Main Entrance', x: 50, y: 88, type: 'entry' },
    checkin: { id: 'checkin', label: 'Check-in Desks', x: 50, y: 72, type: 'facility' },
    security: { id: 'security', label: 'Security Control', x: 50, y: 55, type: 'facility' },
    dutyfree: { id: 'dutyfree', label: 'Duty Free Area', x: 50, y: 38, type: 'shop' },
    relay: { id: 'relay', label: 'Relay Books', x: 55, y: 33, type: 'shop' },
    cafe: { id: 'cafe', label: 'Airport Cafe', x: 28, y: 48, type: 'cafe' },
    wc: { id: 'wc', label: 'Restrooms', x: 72, y: 42, type: 'facility' },
    gate1: { id: 'gate1', label: 'Gate 1', x: 22.5, y: 18, type: 'gate' },
    gate2: { id: 'gate2', label: 'Gate 2', x: 42.5, y: 18, type: 'gate' },
    gate3: { id: 'gate3', label: 'Gate 3', x: 62.5, y: 18, type: 'gate' },
    gate4: { id: 'gate4', label: 'Gate 4', x: 77.5, y: 18, type: 'gate' },

    // Waypoints for perfectly square right-angled routing
    // Main vertical spine
    wp_sec_in: { id: 'wp_sec_in', label: '', x: 50, y: 65, type: 'waypoint' },
    wp_df_in: { id: 'wp_df_in', label: '', x: 50, y: 45, type: 'waypoint' },
    wp_hall_center: { id: 'wp_hall_center', label: '', x: 50, y: 22.5, type: 'waypoint' }, // Center of gates corridor

    // Horizontal branches
    wp_left_corr: { id: 'wp_left_corr', label: '', x: 28, y: 38, type: 'waypoint' }, // branch to cafe
    wp_right_corr: { id: 'wp_right_corr', label: '', x: 72, y: 38, type: 'waypoint' }, // branch to wc

    // Gate corridor branches
    wp_g1_g2: { id: 'wp_g1_g2', label: '', x: 32.5, y: 22.5, type: 'waypoint' },
    wp_g3_g4: { id: 'wp_g3_g4', label: '', x: 67.5, y: 22.5, type: 'waypoint' },
    wp_g1_end: { id: 'wp_g1_end', label: '', x: 22.5, y: 22.5, type: 'waypoint' },
    wp_g4_end: { id: 'wp_g4_end', label: '', x: 77.5, y: 22.5, type: 'waypoint' }
};

export const ORADEA_EDGES = [
    // Main Spine (Vertical)
    { source: 'entrance', target: 'checkin' },
    { source: 'checkin', target: 'wp_sec_in' },
    { source: 'wp_sec_in', target: 'security' },
    { source: 'security', target: 'wp_df_in' },
    { source: 'wp_df_in', target: 'dutyfree' },
    { source: 'dutyfree', target: 'relay' },
    { source: 'dutyfree', target: 'wp_hall_center' },

    // Branches from Duty Free
    { source: 'dutyfree', target: 'wp_left_corr' },
    { source: 'wp_left_corr', target: 'cafe' },

    { source: 'dutyfree', target: 'wp_right_corr' },
    { source: 'wp_right_corr', target: 'wc' },

    // Gate Corridor (Horizontal spreading from center)
    // Left side
    { source: 'wp_hall_center', target: 'wp_g1_g2' },
    { source: 'wp_g1_g2', target: 'gate2' }, // branching up
    { source: 'wp_g1_g2', target: 'wp_g1_end' }, // continue left
    { source: 'wp_g1_end', target: 'gate1' },

    // Right side
    { source: 'wp_hall_center', target: 'wp_g3_g4' },
    { source: 'wp_g3_g4', target: 'gate3' }, // branching up
    { source: 'wp_g3_g4', target: 'wp_g4_end' }, // continue right
    { source: 'wp_g4_end', target: 'gate4' }
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
