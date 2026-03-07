import { NavLink, useLocation } from 'react-router-dom';
import { Home, Map as MapIcon, QrCode, Bell } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const BottomNav = () => {
    const location = useLocation();
    const navRef = useRef(null);
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });

    const navItems = [
        { path: '/', icon: Home, label: 'Home' },
        { path: '/map', icon: MapIcon, label: 'Map' },
        { path: '/scanner', icon: QrCode, label: 'Scan' },
        { path: '/notifications', icon: Bell, label: 'Notificări' }
    ];

    // Calculate active tab for the sliding indicator
    const activeIndex = navItems.findIndex(item =>
        location.pathname === item.path || (item.path === '/map' && location.pathname.startsWith('/map'))
    );

    useEffect(() => {
        // Measure the active tab's DOM element to position the liquid indicator
        if (navRef.current && activeIndex !== -1) {
            const activeChild = navRef.current.children[activeIndex + 1]; // +1 because the indicator is at index 0
            if (activeChild) {
                setIndicatorStyle({
                    left: activeChild.offsetLeft,
                    width: activeChild.offsetWidth,
                    opacity: 1
                });
            }
        }
    }, [activeIndex, location.pathname]);

    return (
        <div style={{
            position: 'fixed',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            width: 'calc(100% - 3rem)',
            maxWidth: '400px',
            backgroundColor: 'var(--glass-bg)',
            backdropFilter: 'blur(40px) saturate(200%)',
            border: '1px solid var(--glass-border)',
            borderRadius: '40px',
            padding: '0.5rem',
            boxShadow: 'var(--shadow-md), inset 0 1px 1px rgba(255, 255, 255, 0.15)'
        }}>
            <div
                ref={navRef}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'relative'
                }}
            >
                {/* 
                  The Liquid Indicator Background 
                  It slides behind the active item with a bouncy spring-like transition
                */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: indicatorStyle.left,
                    width: indicatorStyle.width,
                    opacity: indicatorStyle.opacity,
                    background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                    borderRadius: '30px',
                    transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)', // Apple-style spring
                    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4), inset 0 0 10px rgba(255,255,255,0.2)',
                    zIndex: 0
                }} />

                {navItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = index === activeIndex;

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textDecoration: 'none',
                                padding: '0.6rem 0',
                                zIndex: 1, // Stay above the sliding indicator
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px',
                                // When active, the icon lifts up slightly
                                transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
                                transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                            }}>
                                <Icon
                                    size={24}
                                    strokeWidth={isActive ? 2.5 : 2}
                                    color={isActive ? '#ffffff' : 'var(--text-muted)'}
                                    style={{
                                        transition: 'all 0.3s ease',
                                        // Glow effect on the active icon
                                        filter: isActive ? 'drop-shadow(0 0 6px rgba(255,255,255,0.5))' : 'none'
                                    }}
                                />

                                {/* Label fades in and moves up when active */}
                                <div style={{
                                    height: isActive ? '16px' : '0px',
                                    opacity: isActive ? 1 : 0,
                                    transform: isActive ? 'scale(1) translateY(0)' : 'scale(0.8) translateY(10px)',
                                    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                    overflow: 'hidden',
                                    marginTop: isActive ? '2px' : '0px'
                                }}>
                                    <span style={{
                                        fontSize: '0.65rem',
                                        fontWeight: 700,
                                        color: '#ffffff',
                                        whiteSpace: 'nowrap',
                                        display: 'block',
                                        lineHeight: '16px',
                                        letterSpacing: '0.02em',
                                        textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                                    }}>
                                        {item.label}
                                    </span>
                                </div>
                            </div>
                        </NavLink>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNav;
