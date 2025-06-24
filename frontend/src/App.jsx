import React, { useState } from 'react';
import LandingPage from './landingpage.jsx';
import ByteVaultDashboard from './components/dashboard.jsx';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');

  const navigateTo = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="App">
      {currentPage === 'landing' && <LandingPage onNavigate={navigateTo} />}
      {currentPage === 'dashboard' && <ByteVaultDashboard onNavigate={navigateTo} />}
    </div>
  );
}

export default App;