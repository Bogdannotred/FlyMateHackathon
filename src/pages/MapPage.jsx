import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Navigation, QrCode, User, Map as MapIcon, ArrowUp, ArrowLeft, ArrowRight, Plus, Minus, Coffee, Monitor, Shield, ShoppingBag, Droplets, Utensils } from 'lucide-react';
import { ORADEA_NODES, ORADEA_EDGES, ZONES, DECORATIONS, findShortestPath, getNodesAsArray } from '../data/OradeaMapGraph';

const MapPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const scanned = queryParams.get('scanned');
    const originParam = queryParams.get('origin');

    // Setup
    const [selectedOriginId, setSelectedOriginId] = useState('');
    const [selectedDestId, setSelectedDestId] = useState('');
    const [pathNodes, setPathNodes] = useState([]);

    // Navigation State
    const [isNavigating, setIsNavigating] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [showNotification, setShowNotification] = useState('');

    // Camera State (Zoom & Rotation)
    const [cameraTransform, setCameraTransform] = useState({ x: 50, y: 50, rotate: 0, scale: 1 });
    const [userZoomOffset, setUserZoomOffset] = useState(0); // For manual zoom +/-
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 }); // Drag to pan

    // Drag Tracking
    const [isDragging, setIsDragging] = useState(false);
    const isDraggingRef = useRef(false);
    const lastPointerRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        if (scanned === 'true' && originParam && ORADEA_NODES[originParam]) {
            setSelectedOriginId(originParam);
            setShowNotification(`📍 Pinned at: ${ORADEA_NODES[originParam].label}`);
            setTimeout(() => setShowNotification(''), 4000);
        }
    }, [scanned, originParam]);

    const handleStartNavigation = () => {
        if (selectedOriginId && selectedDestId) {
            const path = findShortestPath(selectedOriginId, selectedDestId);
            setPathNodes(path);
            setCurrentStepIndex(0);
            setIsNavigating(true);
            setUserZoomOffset(0); // reset manual zoom
            setPanOffset({ x: 0, y: 0 });
        }
    };

    const handleCancelNavigation = () => {
        setIsNavigating(false);
        setPathNodes([]);
        setCurrentStepIndex(0);
        // Reset camera to overview
        setCameraTransform({ x: 50, y: 50, rotate: 0, scale: 1 });
        setUserZoomOffset(0);
        setPanOffset({ x: 0, y: 0 });
    };

    const calculateAngle = (p1, p2) => {
        const dy = p2.y - p1.y;
        const dx = p2.x - p1.x;
        let theta = Math.atan2(dy, dx);
        theta *= 180 / Math.PI;
        return -(theta + 90);
    };

    useEffect(() => {
        if (!isNavigating || pathNodes.length === 0) {
            setCameraTransform({ x: 50, y: 40, rotate: 0, scale: 1 + userZoomOffset });
            return;
        }

        const currentNode = pathNodes[currentStepIndex];
        const nextNode = pathNodes[currentStepIndex + 1];

        if (nextNode) {
            const targetRotation = calculateAngle(currentNode, nextNode);
            setCameraTransform({
                x: currentNode.x,
                y: currentNode.y,
                rotate: targetRotation,
                scale: 3.5 // Base zoom
            });
        } else {
            setCameraTransform(prev => ({ ...prev, x: currentNode.x, y: currentNode.y }));
        }
        setPanOffset({ x: 0, y: 0 }); // Snap back to step center
    }, [currentStepIndex, isNavigating, pathNodes]);

    // Calculate required turn direction
    const getRequiredTurn = () => {
        if (currentStepIndex === 0) return 'forward'; // First move is always forward relative to camera

        const prevNode = pathNodes[currentStepIndex - 1];
        const currNode = pathNodes[currentStepIndex];
        const nextNode = pathNodes[currentStepIndex + 1];

        if (!nextNode) return 'arrived';

        let a1 = Math.atan2(currNode.y - prevNode.y, currNode.x - prevNode.x);
        let a2 = Math.atan2(nextNode.y - currNode.y, nextNode.x - currNode.x);
        let diff = (a2 - a1) * 180 / Math.PI;

        while (diff <= -180) diff += 360;
        while (diff > 180) diff -= 360;

        if (diff > -45 && diff < 45) return 'forward';
        if (diff >= 45 && diff <= 135) return 'right';
        if (diff <= -45 && diff >= -135) return 'left';
        return 'backward';
    };

    const handleArrowClick = (clickedDirection) => {
        const requiredDirection = getRequiredTurn();

        if (requiredDirection === 'arrived') return;

        if (clickedDirection === requiredDirection) {
            // Correct Turn! Advance
            setCurrentStepIndex(prev => prev + 1);
            setShowNotification('');
        } else {
            // Wrong turn
            setShowNotification(`Wrong way! You need to go ${requiredDirection.toUpperCase()} here.`);
            setTimeout(() => setShowNotification(''), 3000);
        }
    };

    const handleZoomIn = () => setUserZoomOffset(prev => Math.min(prev + 0.5, 4));
    const handleZoomOut = () => setUserZoomOffset(prev => Math.max(prev - 0.5, -2));

    const finalScale = isNavigating ? cameraTransform.scale + userZoomOffset : cameraTransform.scale + userZoomOffset;

    const handlePointerDown = (e) => {
        isDraggingRef.current = true;
        setIsDragging(true);
        lastPointerRef.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = () => {
        isDraggingRef.current = false;
        setIsDragging(false);
    };

    const handlePointerMove = (e) => {
        if (!isDraggingRef.current) return;
        const dx = e.clientX - lastPointerRef.current.x;
        const dy = e.clientY - lastPointerRef.current.y;
        lastPointerRef.current = { x: e.clientX, y: e.clientY };

        const zoomLevel = Math.max(0.5, finalScale);
        const angleRad = (isNavigating ? -cameraTransform.rotate : 0) * (Math.PI / 180);

        // Match drag to screen pixels vs viewBox units
        const sensitivity = (100 / window.innerWidth) / zoomLevel;

        const localDx = dx * Math.cos(angleRad) + dy * Math.sin(angleRad);
        const localDy = -dx * Math.sin(angleRad) + dy * Math.cos(angleRad);

        setPanOffset(prev => ({
            x: prev.x - localDx * sensitivity,
            y: prev.y - localDy * sensitivity
        }));
    };

    const handleWheel = (e) => {
        const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1;
        setUserZoomOffset(prev => Math.max(-2, Math.min(prev + zoomDelta, 4)));
    };

    const nodes = getNodesAsArray();

    const getStepInstruction = () => {
        if (currentStepIndex === pathNodes.length - 1) return "Arrived at destination!";
        const turn = getRequiredTurn();
        if (turn === 'forward') return "Go straight ahead";
        if (turn === 'left') return "Turn Left at the intersection";
        if (turn === 'right') return "Turn Right at the intersection";
        return `Head towards ${pathNodes[currentStepIndex + 1].label}`;
    };

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', flex: 1,
            backgroundColor: '#0a0a0c', position: 'relative', overflow: 'hidden', minHeight: '100vh'
        }} className="animate-fade-in">

            {/* Notification Pop-up */}
            {showNotification && (
                <div style={{
                    position: 'absolute', top: '10rem', left: '1.5rem', right: '1.5rem',
                    backgroundColor: showNotification.includes('Wrong') ? 'var(--error)' : 'var(--success)',
                    color: 'white', padding: '1rem', borderRadius: '16px',
                    textAlign: 'center', fontWeight: 600, zIndex: 60,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                    animation: 'fadeIn 0.3s ease-out'
                }}>
                    {showNotification}
                </div>
            )}

            {/* Navigation Setup Overlay */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                padding: '1.5rem', paddingTop: '3rem', zIndex: 40,
                display: 'flex', flexDirection: 'column', gap: '0.75rem',
                transform: isNavigating ? 'translateY(-150%)' : 'translateY(0)',
                transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                pointerEvents: isNavigating ? 'none' : 'auto'
            }}>
                <div style={{
                    backgroundColor: 'rgba(20, 20, 20, 0.65)', backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '24px',
                    padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <User size={20} color="var(--primary)" />
                        <select
                            value={selectedOriginId} onChange={(e) => setSelectedOriginId(e.target.value)}
                            style={{
                                flex: 1, background: 'transparent', border: 'none', color: selectedOriginId ? 'white' : 'var(--text-muted)',
                                fontSize: '1rem', outline: 'none', appearance: 'none'
                            }}
                        >
                            <option value="" disabled style={{ color: 'black' }}>Your Location</option>
                            {nodes.map(n => <option key={`org-${n.id}`} value={n.id} style={{ color: 'black' }}>{n.label}</option>)}
                        </select>
                    </div>

                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 0.5rem' }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <MapIcon size={20} color={selectedDestId ? 'var(--accent)' : 'var(--text-muted)'} />
                        <select
                            value={selectedDestId} onChange={(e) => setSelectedDestId(e.target.value)}
                            style={{
                                flex: 1, background: 'transparent', border: 'none', color: selectedDestId ? 'white' : 'var(--text-muted)',
                                fontSize: '1rem', outline: 'none', appearance: 'none'
                            }}
                        >
                            <option value="" disabled style={{ color: 'black' }}>Choose Destination</option>
                            {nodes.map(n => (
                                <option key={`dest-${n.id}`} value={n.id} disabled={n.id === selectedOriginId} style={{ color: 'black' }}>{n.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={() => navigate('/scanner')}
                        style={{
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            padding: '1rem', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '16px', color: 'white', fontWeight: 600, backdropFilter: 'blur(10px)'
                        }}
                    >
                        <QrCode size={20} /> Scan Anchor
                    </button>

                    <button
                        onClick={handleStartNavigation} disabled={!selectedOriginId || !selectedDestId}
                        style={{
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            padding: '1rem', backgroundColor: 'var(--primary)', border: 'none', borderRadius: '16px',
                            color: 'white', fontWeight: 700, opacity: (selectedOriginId && selectedDestId) ? 1 : 0.5,
                        }}
                    >
                        <Navigation size={20} /> Route
                    </button>
                </div>
            </div>

            {/* Instruction Banner overlay */}
            {isNavigating && (
                <div style={{
                    position: 'absolute', top: '3rem', left: '1.5rem', right: '1.5rem', zIndex: 40, animation: 'fadeIn 0.5s ease'
                }}>
                    <div style={{
                        backgroundColor: 'rgba(20, 20, 20, 0.8)', backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '24px', padding: '1.5rem',
                        display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                    }}>
                        <div style={{
                            backgroundColor: currentStepIndex === pathNodes.length - 1 ? 'var(--success)' : 'var(--accent)',
                            borderRadius: '50%', width: '48px', height: '48px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {currentStepIndex === pathNodes.length - 1 ? <MapIcon color="white" /> : <Navigation color="white" />}
                        </div>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '4px' }}>
                                {getStepInstruction()}
                            </h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                Progress: {currentStepIndex} / {pathNodes.length - 1} steps
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Zoom Controls Overlay */}
            <div style={{
                position: 'absolute', right: '1.5rem', top: isNavigating ? '12rem' : '15rem',
                display: 'flex', flexDirection: 'column', gap: '0.5rem', zIndex: 40,
                transition: 'top 0.4s ease'
            }}>
                <button onClick={handleZoomIn} style={{
                    width: '44px', height: '44px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <Plus size={24} />
                </button>
                <button onClick={handleZoomOut} style={{
                    width: '44px', height: '44px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <Minus size={24} />
                </button>
            </div>

            {/* Directional Pad UI */}
            {isNavigating && currentStepIndex < pathNodes.length - 1 && (
                <div style={{
                    position: 'absolute', bottom: '7rem', left: '1.5rem', right: '1.5rem',
                    zIndex: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
                    animation: 'fadeIn 0.5s ease'
                }}>
                    {/* Forward Button */}
                    <button
                        onClick={() => handleArrowClick('forward')}
                        style={{
                            width: '70px', height: '70px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(10px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)', marginBottom: '-0.5rem'
                        }}
                    >
                        <ArrowUp size={36} />
                    </button>

                    {/* Left / Right Buttons */}
                    <div style={{ display: 'flex', gap: '4rem' }}>
                        <button
                            onClick={() => handleArrowClick('left')}
                            style={{
                                width: '70px', height: '70px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(10px)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                            }}
                        >
                            <ArrowLeft size={36} />
                        </button>
                        <button
                            onClick={() => handleArrowClick('right')}
                            style={{
                                width: '70px', height: '70px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(10px)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                            }}
                        >
                            <ArrowRight size={36} />
                        </button>
                    </div>

                    <button
                        onClick={handleCancelNavigation}
                        style={{
                            marginTop: '1rem', padding: '0.75rem 2rem', backgroundColor: 'transparent',
                            border: '1px solid var(--error)', borderRadius: '16px', color: 'var(--error)', fontWeight: 600,
                        }}
                    >
                        End Route
                    </button>
                </div>
            )}

            {isNavigating && currentStepIndex === pathNodes.length - 1 && (
                <div style={{
                    position: 'absolute', bottom: '7rem', left: '1.5rem', right: '1.5rem',
                    zIndex: 40, display: 'flex', justifyContent: 'center', animation: 'fadeIn 0.5s ease'
                }}>
                    <button
                        onClick={handleCancelNavigation}
                        style={{
                            width: '100%', padding: '1.25rem', backgroundColor: 'var(--success)',
                            border: 'none', borderRadius: '16px', color: 'white', fontWeight: 700, fontSize: '1.1rem'
                        }}
                    >
                        Finish Navigation
                    </button>
                </div>
            )}


            {/* SVG MAP ENGINE */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: '1000px',
                cursor: isDragging ? 'grabbing' : 'grab',
                touchAction: 'none' // Crucial for mobile dragging
            }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                onWheel={handleWheel}
            >
                <div style={{
                    width: '100%', height: '100%', transformOrigin: 'center center',
                    transform: `
                        scale(${Math.max(0.5, finalScale)}) 
                        rotate(${isNavigating ? cameraTransform.rotate : 0}deg)
                        translate(calc(50% - ${cameraTransform.x + panOffset.x}%), calc(50% - ${cameraTransform.y + panOffset.y}%))
                    `,
                    transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    willChange: 'transform'
                }}>
                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" style={{ overflow: 'visible' }}>
                        <defs>
                            {/* Animated Arrowhead for Path */}
                            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5"
                                markerWidth="3" markerHeight="3" orient="auto-start-reverse">
                                <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent)" />
                            </marker>

                            {/* Floor texture / glow */}
                            <filter id="zoneGlow">
                                <feGaussianBlur stdDeviation="0.8" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>

                            {/* 3D Drop Shadow for Objects (Desks, Vending Machines) */}
                            <filter id="shadow3d" x="-50%" y="-50%" width="200%" height="200%">
                                <feDropShadow dx="0" dy="0.8" stdDeviation="0.5" floodColor="#000" floodOpacity="0.8" />
                                <feDropShadow dx="0" dy="1.5" stdDeviation="1" floodColor="#000" floodOpacity="0.4" />
                            </filter>

                            {/* Blueprint/Tile Grid Pattern for floor realism */}
                            <pattern id="gridPattern" width="2" height="2" patternUnits="userSpaceOnUse">
                                <path d="M 2 0 L 0 0 0 2" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.1" />
                            </pattern>
                        </defs>

                        {/* Base grid floor across the whole view */}
                        <rect x="0" y="0" width="100" height="100" fill="url(#gridPattern)" />

                        {/* Main Building Outline - Thick Concrete Walls */}
                        <path
                            d="M 10,80 L 10,95 L 90,95 L 90,60 L 70,60 L 70,10 L 10,10 Z"
                            fill="rgba(20, 22, 28, 0.95)"
                            stroke="#111"
                            strokeWidth="1.2"
                            strokeLinejoin="bevel"
                        />
                        {/* Inner stroke for 3D wall effect */}
                        <path
                            d="M 10,80 L 10,95 L 90,95 L 90,60 L 70,60 L 70,10 L 10,10 Z"
                            fill="none"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="0.3"
                        />

                        {/* Zones (Architectural Rooms) */}
                        {ZONES.map((zone) => (
                            <g key={zone.id}>
                                <rect
                                    x={zone.x}
                                    y={zone.y}
                                    width={zone.width}
                                    height={zone.height}
                                    fill={zone.color}
                                    stroke="rgba(255,255,255,0.15)"
                                    strokeWidth="0.4"
                                />
                                {/* Baked-in text for realistic floor decals */}
                                {zone.label && (
                                    <text
                                        x={zone.x + zone.width / 2}
                                        y={zone.y + zone.height / 2 + 1}
                                        fontSize="2"
                                        fill="rgba(255,255,255,0.15)"
                                        textAnchor="middle"
                                        fontWeight="700"
                                        letterSpacing="0.8"
                                        style={{ userSelect: 'none', mixBlendMode: 'overlay' }}
                                    >
                                        {zone.label.toUpperCase()}
                                    </text>
                                )}
                            </g>
                        ))}

                        {/* Static Floor Decorations (3D Objects & Icons) */}
                        {DECORATIONS.map((dec) => {
                            const inverseRotate = isNavigating ? -cameraTransform.rotate : 0;
                            // Dynamically pick Icon
                            let IconComponent = null;
                            if (dec.type === 'desk') IconComponent = Monitor;
                            if (dec.type === 'scanner') IconComponent = Shield;
                            if (dec.type === 'shelf') IconComponent = ShoppingBag;
                            if (dec.type === 'vending' && dec.label === 'Water') IconComponent = Droplets;
                            if (dec.type === 'vending' && dec.label === 'Cola') IconComponent = Coffee; // Generic drink
                            if (dec.type === 'table') IconComponent = Utensils;

                            // Scale icon to fit object
                            const iconSize = dec.width ? Math.min(dec.width, dec.height) * 0.7 : 1.5;

                            if (dec.type === 'plant' || dec.type === 'table') {
                                return (
                                    <g key={dec.id}>
                                        <circle
                                            cx={dec.x}
                                            cy={dec.y}
                                            r={dec.r}
                                            fill={dec.color}
                                            stroke="rgba(255,255,255,0.2)"
                                            strokeWidth="0.15"
                                            filter="url(#shadow3d)"
                                        />
                                        {IconComponent && (
                                            <g transform={`translate(${dec.x - iconSize / 2}, ${dec.y - iconSize / 2}) rotate(${inverseRotate}, ${iconSize / 2}, ${iconSize / 2})`}>
                                                <IconComponent size={iconSize} color="rgba(255,255,255,0.8)" strokeWidth={2.5} />
                                            </g>
                                        )}
                                    </g>
                                );
                            }

                            // Rectangular decorations (3D Desks, scanners, vending machines)
                            return (
                                <g key={dec.id}>
                                    <rect
                                        x={dec.x}
                                        y={dec.y}
                                        width={dec.width}
                                        height={dec.height}
                                        fill={dec.color}
                                        stroke="rgba(255,255,255,0.3)"
                                        strokeWidth="0.15"
                                        opacity={dec.opacity || 1}
                                        filter={dec.type !== 'door' ? "url(#shadow3d)" : ""}
                                        rx={0.5} // Slight rounding makes it look like physical furniture
                                        ry={0.5}
                                    />

                                    {/* 3D Top Bevel Highlight */}
                                    {dec.type !== 'door' && (
                                        <rect x={dec.x + 0.15} y={dec.y + 0.15} width={dec.width - 0.3} height={0.3} fill="rgba(255,255,255,0.3)" />
                                    )}

                                    {/* Specific intricate details */}
                                    {dec.type === 'vending' && (
                                        // Vending machines get a glowing LED glass front
                                        <rect x={dec.x + 0.3} y={dec.y + 0.3} width={dec.width - 0.6} height={dec.height - 0.6} rx={0.2} fill="rgba(255,255,255,0.2)" />
                                    )}
                                    {dec.type === 'scanner' && (
                                        // Conveyor belt detail on scanners
                                        <rect x={dec.x + 0.5} y={dec.y} width={1} height={dec.height} fill="#222" />
                                    )}

                                    {/* Map Marker Icon floating on top of object */}
                                    {IconComponent && (
                                        <g transform={`translate(${dec.x + dec.width / 2 - iconSize / 2}, ${dec.y + dec.height / 2 - iconSize / 2}) rotate(${inverseRotate}, ${iconSize / 2}, ${iconSize / 2})`}>
                                            <IconComponent size={iconSize} color="rgba(255,255,255,0.9)" strokeWidth={2.5} />
                                        </g>
                                    )}
                                </g>
                            );
                        })}

                        {/* Static Path Walkways (Subtle connections) */}
                        {ORADEA_EDGES.map((edge, idx) => {
                            const source = ORADEA_NODES[edge.source];
                            const target = ORADEA_NODES[edge.target];
                            return (
                                <line
                                    key={`edge-${idx}`}
                                    x1={source.x} y1={source.y}
                                    x2={target.x} y2={target.y}
                                    stroke="rgba(255,255,255,0.06)"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                            );
                        })}

                        {/* Path Lines */}
                        {isNavigating && pathNodes.length > 1 && (
                            <g>
                                <polyline points={pathNodes.map(n => `${n.x},${n.y}`).join(' ')} fill="none" stroke="rgba(15, 98, 254, 0.4)" strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round" />
                                <polyline points={pathNodes.map(n => `${n.x},${n.y}`).join(' ')} fill="none" stroke="var(--accent)" strokeWidth="0.6" strokeLinejoin="round" strokeLinecap="round" strokeDasharray="2 2" style={{ animation: 'dash 15s linear infinite' }} />
                            </g>
                        )}

                        {/* Nodes */}
                        {getNodesAsArray().map(node => {
                            const inverseRotate = isNavigating ? -cameraTransform.rotate : 0;
                            const isOrigin = node.id === selectedOriginId;
                            const isDest = node.id === selectedDestId;
                            const isCurrentStep = isNavigating && pathNodes[currentStepIndex]?.id === node.id;

                            // Adjust size inversely to scale so dots don't get massive when zoomed in
                            const dotRadius = 1.5 / Math.max(1, finalScale * 0.5);

                            let fillColor = 'rgba(255,255,255,0.3)';
                            if (isCurrentStep) fillColor = 'var(--primary)';
                            if (isDest) fillColor = 'var(--error)';

                            return (
                                <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                                    {(isCurrentStep || isDest || isOrigin) && <circle r={dotRadius * 3} fill={fillColor} opacity="0.3" style={{ animation: 'pulse 2s infinite' }} />}
                                    <circle r={dotRadius} fill={fillColor} stroke="rgba(0,0,0,0.5)" strokeWidth="0.2" />
                                    <g transform={`rotate(${inverseRotate})`}>
                                        <text x="0" y={-(dotRadius * 2)} fontSize={dotRadius * 1.5} fill={(isCurrentStep || isDest) ? 'white' : 'rgba(255,255,255,0.7)'} textAnchor="middle" fontWeight={(isCurrentStep || isDest) ? '700' : '500'} style={{ userSelect: 'none', textShadow: '0px 1px 2px rgba(0,0,0,0.8)' }}>
                                            {node.label}
                                        </text>
                                    </g>
                                </g>
                            );
                        })}

                        {/* Current User Marker */}
                        {isNavigating && pathNodes[currentStepIndex] && (
                            <g transform={`translate(${pathNodes[currentStepIndex].x}, ${pathNodes[currentStepIndex].y})`}>
                                <circle r={1.5 / Math.max(1, finalScale * 0.5)} fill="white" stroke="var(--primary)" strokeWidth="0.5" />
                                <polygon points="-1,0 1,0 0,-4" fill="var(--primary)" opacity="0.4" transform={`scale(${1 / Math.max(1, finalScale * 0.5)})`} />
                            </g>
                        )}
                    </svg>
                </div>
            </div>

            <style>{`
                @keyframes dash { to { stroke-dashoffset: -100; } }
            `}</style>
        </div>
    );
};

export default MapPage;
