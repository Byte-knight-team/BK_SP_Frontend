import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function AdminLayout() {
    const [sidebarWidth, setSidebarWidth] = useState(260);

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar onWidthChange={setSidebarWidth} />
            <main
                style={{
                    flex: 1,
                    marginLeft: `${sidebarWidth}px`,
                    background: '#f5f5f7',
                    minHeight: '100vh',
                    overflowY: 'auto',
                    transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
            >
                <Outlet />
            </main>
        </div>
    );
}
