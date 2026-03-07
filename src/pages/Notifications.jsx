import React from 'react';
import { Bell, Info, AlertTriangle, CheckCircle } from 'lucide-react';

const mockNotifications = [
    {
        id: 1,
        type: 'alert',
        title: '⚠️ Zbor mutat - Terminal nou',
        message: 'Atenție! Zborul tău Tarom RO381 spre Roma a fost mutat la Gate 3 (în loc de Gate 6). Ruta ta a fost recalculată automat pe hartă.',
        time: 'Acum 1 minut'
    },
    {
        id: 2,
        type: 'info',
        title: 'Check-in finalizat',
        message: 'Procedura de check-in s-a încheiat. Pregătește bagajele pentru security.',
        time: 'Acum 35 minute'
    },
    {
        id: 3,
        type: 'success',
        title: 'Voucher Lounge Disponibil',
        message: 'Fiind călător frecvent, ai primit acces gratuit în FlyMate Lounge. Găsești codul QR în profilul tău.',
        time: 'Acum 1.5 ore'
    },
    {
        id: 4,
        type: 'info',
        title: 'Timp estimat Security',
        message: 'Timpul curent de așteptare la controlul de securitate este de 8 minute.',
        time: 'Acum 2 ore'
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
                <h1 style={{ m: 0, fontSize: '1.8rem', fontWeight: 700 }}>Notificări recente</h1>
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
