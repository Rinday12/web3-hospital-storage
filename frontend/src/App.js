// frontend/src/App.js

import React from 'react';
import HospitalInterface from './components/HospitalInterface';

function App() {
  return (
    <div className="App">
      {/* Script untuk memuat ethers.js dari CDN (akses melalui window.ethers) */}
      <script src="https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.umd.min.js"></script>
      <HospitalInterface />
    </div>
  );
}

export default App;
