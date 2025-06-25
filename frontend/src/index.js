// frontend/src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client'; // Menggunakan createRoot dari React 18
import './index.css'; // Anda mungkin perlu membuat file ini jika belum ada
import App from './App';
import reportWebVitals from './reportWebVitals'; // Opsional, bisa dihapus jika tidak digunakan

// Mendapatkan root DOM element tempat aplikasi React akan di-mount
const root = ReactDOM.createRoot(document.getElementById('root'));

// Me-render komponen utama App ke dalam root
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Jika Anda ingin mengukur kinerja di aplikasi Anda, kirim ke titik akhir analitik.
// Pelajari lebih lanjut: https://bit.ly/CRA-vitals
reportWebVitals();