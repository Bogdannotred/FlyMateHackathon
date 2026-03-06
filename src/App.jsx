import { Outlet } from 'react-router-dom';

function App() {
  return (
    <div className="page-container">
      {/* We can add a global header/nav here later if needed */}
      <Outlet />
    </div>
  );
}

export default App;
