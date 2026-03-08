import { useNavigate } from 'react-router-dom';
import { QrCode, Plane, MapPin } from 'lucide-react';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            padding: '2rem',
            gap: '3rem',
            backgroundColor: 'var(--bg-dark)',
            color: 'var(--text-main)',
            overflow: 'hidden'
        }} className="animate-fade-in">

            <div style={{ textAlign: 'center', position: 'relative' }}>
                {/* ─── AIRPLANE LANDING ANIMATION CONTAINER ─── */}
                <div style={{
                    position: 'relative',
                    width: '120px',
                    height: '120px',
                    margin: '0 auto 1rem auto'
                }}>
                    {/* Landing glow burst — appears when plane lands */}
                    <div className="landing-glow" />

                    {/* Contrail / vapor trail */}
                    <div className="contrail" />

                    {/* The airplane itself — swoops from top-right and lands */}
                    <div className="plane-wrapper">
                        <Plane size={64} color="var(--primary)" style={{ filter: 'drop-shadow(0 0 12px rgba(99, 102, 241, 0.6))' }} />
                    </div>

                    {/* Runway line under the plane */}
                    <div className="runway-line" />
                </div>

                <h1 className="title-reveal" style={{
                    fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '-0.02em'
                }}>FlyMate</h1>
                <p className="subtitle-reveal" style={{
                    color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '300px', margin: '0 auto'
                }}>
                    Your digital companion for a seamless airport experience.
                </p>
            </div>

            <div className="buttons-reveal" style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                width: '100%',
                maxWidth: '320px'
            }}>
                {/* Main CTA */}
                <button
                    onClick={() => navigate('/scanner')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem',
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '16px',
                        padding: '1.25rem',
                        fontSize: '1.25rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: 'var(--shadow-md)',
                        position: 'relative',
                        zIndex: 10,
                        overflow: 'hidden'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--primary-hover)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--primary)';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    <QrCode size={28} />
                    Scan Flight Ticket
                    {/* Pulse effect wrapper */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '16px',
                        animation: 'pulse 2s infinite',
                        pointerEvents: 'none'
                    }} />
                </button>

                {/* Secondary Navigation (Mock) */}
                <button
                    onClick={() => navigate('/map')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        backgroundColor: 'transparent',
                        color: 'var(--text-muted)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '16px',
                        padding: '1rem',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        zIndex: 10
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.color = 'var(--text-main)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.color = 'var(--text-muted)';
                        e.currentTarget.style.borderColor = 'var(--glass-border)';
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                >
                    <MapPin size={20} />
                    Continue to Map
                </button>
            </div>

            {/* Decorative background element animated (High Density) */}
            <div style={{
                position: 'absolute',
                top: '-15%',
                left: '-15%',
                width: '500px',
                height: '500px',
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.85) 0%, rgba(79, 70, 229, 0.4) 40%, rgba(15, 23, 42, 0) 80%)',
                borderRadius: '50%',
                filter: 'blur(50px)',
                zIndex: -1,
                pointerEvents: 'none',
                animation: 'floatBlob1 8s ease-in-out infinite alternate'
            }} />
            <div style={{
                position: 'absolute',
                bottom: '-20%',
                right: '-15%',
                width: '450px',
                height: '450px',
                background: 'radial-gradient(circle, rgba(45, 212, 191, 0.85) 0%, rgba(20, 184, 166, 0.4) 40%, rgba(15, 23, 42, 0) 80%)',
                borderRadius: '50%',
                filter: 'blur(50px)',
                zIndex: -1,
                pointerEvents: 'none',
                animation: 'floatBlob2 10s ease-in-out infinite alternate-reverse'
            }} />

            {/* All animations */}
            <style>{`
                /* ─── AIRPLANE LANDING ─── */
                .plane-wrapper {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    animation: planeLand 2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
                    z-index: 2;
                }

                @keyframes planeLand {
                    0% {
                        transform: translate(180px, -250px) rotate(-35deg) scale(0.5);
                        opacity: 0;
                    }
                    15% {
                        opacity: 1;
                    }
                    45% {
                        transform: translate(60px, -100px) rotate(-20deg) scale(0.75);
                    }
                    70% {
                        transform: translate(10px, -30px) rotate(-8deg) scale(0.9);
                    }
                    85% {
                        transform: translate(-32px, -32px) rotate(0deg) scale(1);
                    }
                    92% {
                        transform: translate(-32px, -28px) rotate(2deg) scale(1.05);
                    }
                    100% {
                        transform: translate(-32px, -32px) rotate(0deg) scale(1);
                    }
                }

                /* ─── CONTRAIL (vapor trail) ─── */
                .contrail {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 200px;
                    height: 3px;
                    background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.5), rgba(99, 102, 241, 0.05));
                    border-radius: 4px;
                    transform-origin: right center;
                    animation: contrailAnim 2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
                    z-index: 1;
                    filter: blur(2px);
                }

                @keyframes contrailAnim {
                    0% {
                        transform: translate(180px, -250px) rotate(-35deg) scaleX(0);
                        opacity: 0;
                    }
                    15% {
                        opacity: 0.7;
                        transform: translate(140px, -200px) rotate(-30deg) scaleX(0.5);
                    }
                    50% {
                        opacity: 0.5;
                        transform: translate(40px, -80px) rotate(-15deg) scaleX(1);
                    }
                    75% {
                        opacity: 0.2;
                    }
                    100% {
                        transform: translate(-32px, -32px) rotate(0deg) scaleX(0);
                        opacity: 0;
                    }
                }

                /* ─── LANDING GLOW BURST ─── */
                .landing-glow {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 100px;
                    height: 100px;
                    transform: translate(-50%, -50%);
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(99, 102, 241, 0.6) 0%, rgba(99, 102, 241, 0) 70%);
                    animation: glowBurst 2.2s ease forwards;
                    z-index: 0;
                    pointer-events: none;
                }

                @keyframes glowBurst {
                    0% { opacity: 0; transform: translate(-50%, -50%) scale(0); }
                    75% { opacity: 0; transform: translate(-50%, -50%) scale(0); }
                    85% { opacity: 1; transform: translate(-50%, -50%) scale(1.8); }
                    100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
                }

                /* ─── RUNWAY LINE ─── */
                .runway-line {
                    position: absolute;
                    bottom: 8px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 60px;
                    height: 2px;
                    background: linear-gradient(90deg,
                        transparent 0%,
                        rgba(99, 102, 241, 0.4) 20%,
                        rgba(99, 102, 241, 0.6) 50%,
                        rgba(99, 102, 241, 0.4) 80%,
                        transparent 100%
                    );
                    border-radius: 2px;
                    animation: runwayAppear 2s ease forwards;
                }

                @keyframes runwayAppear {
                    0% { opacity: 0; width: 0; }
                    80% { opacity: 0; width: 0; }
                    100% { opacity: 1; width: 60px; }
                }

                /* ─── IDLE FLOAT after landing ─── */
                .plane-wrapper {
                    animation: planeLand 2s cubic-bezier(0.22, 1, 0.36, 1) forwards,
                               planeIdle 3s ease-in-out 2.5s infinite;
                }

                @keyframes planeIdle {
                    0%, 100% { transform: translate(-32px, -32px) rotate(0deg) scale(1); }
                    50% { transform: translate(-32px, -36px) rotate(-1deg) scale(1); }
                }

                /* ─── STAGGERED TEXT REVEALS ─── */
                .title-reveal {
                    opacity: 0;
                    animation: textReveal 0.7s ease forwards;
                    animation-delay: 1.6s;
                }

                .subtitle-reveal {
                    opacity: 0;
                    animation: textReveal 0.7s ease forwards;
                    animation-delay: 1.9s;
                }

                .buttons-reveal {
                    opacity: 0;
                    animation: textReveal 0.7s ease forwards;
                    animation-delay: 2.2s;
                }

                @keyframes textReveal {
                    0% { opacity: 0; transform: translateY(15px); }
                    100% { opacity: 1; transform: translateY(0); }
                }

                /* ─── BACKGROUND BLOBS ─── */
                @keyframes floatBlob1 {
                    0% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(25%, 30%) scale(1.3); }
                    66% { transform: translate(-15%, 40%) scale(0.8); }
                    100% { transform: translate(-30%, -10%) scale(1.4); }
                }
                @keyframes floatBlob2 {
                    0% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(-25%, -35%) scale(1.4); }
                    66% { transform: translate(15%, -45%) scale(0.7); }
                    100% { transform: translate(30%, 15%) scale(1.3); }
                }
            `}
            </style>

        </div>
    );
};

export default Home;
