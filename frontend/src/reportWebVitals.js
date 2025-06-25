// frontend/src/reportWebVitals.js

// Fungsi ini adalah bagian dari alat pengukur kinerja aplikasi React
// yang dibuat dengan Create React App. Ini digunakan untuk mengirim
// metrik kinerja web ke konsol atau ke endpoint analitik.
const reportWebVitals = onPerfEntry => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;
