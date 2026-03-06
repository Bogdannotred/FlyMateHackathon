import { Outlet } from 'react-router-dom';
import BottomNav from './components/BottomNav';

function App() {
  return (
    <div className="page-container" style={{ paddingBottom: '90px', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Outlet />
      <BottomNav />
    </div>
  );
}

export default App;
