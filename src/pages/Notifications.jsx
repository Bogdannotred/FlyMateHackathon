import React from 'react';
import { Bell, Info, AlertTriangle, CheckCircle } from 'lucide-react';

const mockNotifications = [
    {
        id: 1,
        type: 'alert',
        title: '⚠️ Flight Moved - New Terminal',
        message: 'Attention! Your Tarom RO381 flight to Rome has been moved to Gate 3 (instead of Gate 6). Your route has been automatically recalculated on the map.',
        time: '1 minute ago'
    },
    {
        id: 2,
        type: 'info',
        title: 'Check-in Completed',
        message: 'The check-in procedure is complete. Prepare your luggage for security.',
        time: '35 minutes ago'
    },
    {
        id: 3,
        type: 'success',
        title: 'Lounge Voucher Available',
        message: 'As a frequent traveler, you have received free access to the FlyMate Lounge. You can find the QR code in your profile.',
        time: '1.5 hours ago'
    },
    {
        id: 4,
        type: 'info',
        title: 'Estimated Security Wait Time',
        message: 'The current wait time at the security checkpoint is 8 minutes.',
        time: '2 hours ago'
    }
];

export default function Notifications() {
    const getIcon = (type) => {
        switch (type) {
            case 'info': return <Info color="var(--primary)" size={24} />;
            case 'alert': return <AlertTriangle color="var(--error)" size={24} />;
            case 'success': return <CheckCircle color="var(--success)" size={24} />;
            default: return <Bell color="white" size={24} />;
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#0a0a0c',
            color: 'white',
            padding: '2rem 1.5rem',
            paddingBottom: '6rem' // Leave space for BottomNav
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <Bell size={28} color="var(--primary)" />
                <h1 style={{ m: 0, fontSize: '1.8rem', fontWeight: 700 }}>Recent Notifications</h1>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {mockNotifications.map(notif => (
                    <div key={notif.id} style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '16px',
                        padding: '1.2rem',
                        display: 'flex',
                        gap: '1rem',
                        alignItems: 'flex-start'
                    }}>
                        <div style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            padding: '0.6rem',
                            borderRadius: '12px'
                        }}>
                            {getIcon(notif.type)}
                        </div>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ margin: '0 0 0.2rem 0', fontSize: '1.1rem', fontWeight: 600 }}>{notif.title}</h3>
                            <p style={{ margin: '0 0 0.8rem 0', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: 1.4 }}>
                                {notif.message}
                            </p>
                            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: 500 }}>
                                {notif.time}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
