import { Outlet } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import AeroMapPage from './pages/AeroMapPage';

function App() {
  return (
    <div className="page-container" style={{ paddingBottom: '90px', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Outlet />
      {/* Hide BottomNav if on /aero route because it has its own back button and takes full screen */}
      {window.location.pathname !== '/aero' && <BottomNav />}
    </div>
  );
}

export default App;
