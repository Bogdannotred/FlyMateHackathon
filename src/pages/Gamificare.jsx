import { useState, useEffect } from 'react';
import { Ticket, Star, Gift, ShieldAlert, Navigation, ShoppingBag, Coffee, Percent, ChevronDown } from 'lucide-react';

const Gamificare = () => {
    const [scannedCodes, setScannedCodes] = useState(0);
    const [expandedStoreId, setExpandedStoreId] = useState(null);

    useEffect(() => {
        try {
            const storedQRs = JSON.parse(localStorage.getItem('flymate_scanned_qrs') || '[]');
            setScannedCodes(storedQRs.length);
        } catch (e) {
            console.error("Could not parse scored QRs", e);
        }
    }, []);

    const totalRequired = 10;
    // Cap progress at 100%
    const progressPercent = Math.min((scannedCodes / totalRequired) * 100, 100);

    const mockStores = [
        { id: 1, name: "Travel Free (Duty Free)", discount: "15% OFF", icon: ShoppingBag, color: "#0F62FE", req: 10, code: "FLY-DFREE-15" },
        { id: 2, name: "Airport Cafe Bar", discount: "FREE COFFEE", icon: Coffee, color: "#FFB000", req: 5, code: "FLY-CAFE-FREE" },
        { id: 3, name: "Premium Lounge", discount: "-50% Entry", icon: Star, color: "#8A2BE2", req: 10, code: "FLY-VIP-50" },
        { id: 4, name: "Relay (Books & Mags)", discount: "10% OFF", icon: Ticket, color: "#00E676", req: 3, code: "FLY-RELAY-10" },
    ];

    const handleStoreClick = (storeId, isUnlocked) => {
        if (!isUnlocked) return;
        setExpandedStoreId(prev => prev === storeId ? null : storeId);
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            padding: '2rem 1.5rem',
            paddingTop: '3rem',
            backgroundColor: 'var(--bg-dark)',
            color: 'var(--text-main)',
            minHeight: '100vh',
            gap: '2rem',
            overflowY: 'auto'
        }} className="animate-fade-in">

            {/* Header info */}
            <div style={{ textAlign: 'center' }}>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(15, 98, 254, 0.15)',
                    padding: '1rem',
                    borderRadius: '50%',
                    marginBottom: '1rem',
                    animation: 'pulse 3s infinite'
                }}>
                    <Gift size={32} color="var(--primary)" />
                </div>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                    Unlock Rewards
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                    Scan <strong>10 different QR codes</strong> spread around the terminal to unlock exclusive discounts at our partner stores!
                </p>
            </div>

            {/* Progress Tracker (Apple Fitness Rings Style, but linear) */}
            <div style={{
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '24px',
                padding: '1.5rem',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Your Tracker</h2>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Keep exploring to unlock</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--primary)' }}>{scannedCodes}</span>
                        <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}> / {totalRequired}</span>
                    </div>
                </div>

                {/* Progress Bar Container */}
                <div style={{
                    height: '12px',
                    width: '100%',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '100px',
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                    {/* Progress Fill */}
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, bottom: 0,
                        width: `${progressPercent}%`,
                        background: 'linear-gradient(90deg, var(--primary) 0%, #478BFF 100%)',
                        borderRadius: '100px',
                        transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 0 10px rgba(15, 98, 254, 0.5)'
                    }} />
                </div>
            </div>

            {/* List of Partner Stores & Discounts */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Partner Discounts</h3>

                {mockStores.map((store) => {
                    const StoreIcon = store.icon;
                    const isUnlocked = scannedCodes >= store.req;

                    return (
                        <div
                            key={store.id}
                            onClick={() => handleStoreClick(store.id, isUnlocked)}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                backgroundColor: isUnlocked ? `rgba(255, 255, 255, 0.05)` : 'rgba(255,255,255,0.02)',
                                border: `1px solid ${isUnlocked ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.02)'}`,
                                borderRadius: '20px',
                                padding: '1.25rem',
                                position: 'relative',
                                overflow: 'hidden',
                                opacity: isUnlocked ? 1 : 0.6,
                                transition: 'all 0.3s ease',
                                cursor: isUnlocked ? 'pointer' : 'default'
                            }}>
                            {/* Main Card Header */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                {/* Icon Box */}
                                <div style={{
                                    backgroundColor: isUnlocked ? `${store.color}20` : 'rgba(255,255,255,0.05)',
                                    borderRadius: '12px',
                                    padding: '0.75rem',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <StoreIcon size={24} color={isUnlocked ? store.color : '#888'} />
                                </div>

                                {/* Text Info */}
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.2rem', color: isUnlocked ? 'white' : '#aaa' }}>
                                        {store.name}
                                    </h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: isUnlocked ? 'var(--primary)' : 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                                        <Percent size={14} />
                                        {store.discount}
                                    </div>
                                </div>

                                {/* Requirement Badge / Status */}
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    backgroundColor: isUnlocked ? 'var(--success)' : 'rgba(255,255,255,0.1)',
                                    color: isUnlocked ? 'white' : 'var(--text-muted)',
                                    padding: '0.3rem 0.6rem',
                                    borderRadius: '8px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700
                                }}>
                                    {isUnlocked ? 'Unlocked' : `${store.req} Scans`}
                                    {isUnlocked && <ChevronDown size={14} style={{ transform: expandedStoreId === store.id ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />}
                                </div>
                            </div>

                            {/* Expanded Reward Code Section */}
                            {isUnlocked && (
                                <div style={{
                                    marginTop: expandedStoreId === store.id ? '1rem' : '0',
                                    maxHeight: expandedStoreId === store.id ? '100px' : '0',
                                    opacity: expandedStoreId === store.id ? 1 : 0,
                                    overflow: 'hidden',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}>
                                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0.5rem 0' }} />
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Show this code at the register:</p>
                                    <div style={{
                                        backgroundColor: 'rgba(0,0,0,0.3)',
                                        border: '1px dashed rgba(255,255,255,0.3)',
                                        padding: '0.75rem',
                                        borderRadius: '12px',
                                        textAlign: 'center',
                                        fontWeight: 700,
                                        fontSize: '1.2rem',
                                        letterSpacing: '2px',
                                        color: store.color
                                    }}>
                                        {store.code}
                                    </div>
                                </div>
                            )}

                            {/* Subtle background glow if unlocked */}
                            {isUnlocked && (
                                <div style={{
                                    position: 'absolute',
                                    right: '-20px',
                                    top: '-20px',
                                    width: '100px',
                                    height: '100px',
                                    background: `radial-gradient(circle, ${store.color} 0%, rgba(0,0,0,0) 70%)`,
                                    opacity: 0.15,
                                    pointerEvents: 'none'
                                }} />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Ambient Background Blur */}
            <div style={{
                position: 'fixed',
                top: '-20%', left: '-10%',
                width: '300px', height: '300px',
                background: 'radial-gradient(circle, rgba(15, 98, 254, 0.1) 0%, rgba(10, 10, 10, 0) 70%)',
                filter: 'blur(40px)', zIndex: -1, pointerEvents: 'none'
            }} />
        </div>
    );
};

export default Gamificare;
