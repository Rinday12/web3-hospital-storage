// frontend/src/components/HospitalInterface.js

import React, { useState, useEffect, useCallback } from 'react'; // Import useCallback
import axios from 'axios'; // Import axios karena sekarang digunakan di sini

// ==== PENTING ====
// Ganti 'YOUR_DEPLOYED_CONTRACT_ADDRESS_HERE' dengan alamat kontrak HospitalStorage Anda
// setelah berhasil di-deploy ke jaringan Sepolia.
const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

// ABI (Application Binary Interface) dari kontrak HospitalStorage Anda.
// Ini adalah objek JSON yang menjelaskan fungsi dan event kontrak.
const CONTRACT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "patientName",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "fileCid",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "uploadedBy",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "RecordAdded",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_patientName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_fileCid",
        "type": "string"
      }
    ],
    "name": "addRecord",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getRecordCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "recordCounter",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "records",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "patientName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "fileCid",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "uploadedBy",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Fungsi untuk mengunggah file ke IPFS menggunakan Pinata
// Dipindahkan langsung ke dalam komponen untuk menghindari masalah impor
const uploadFileToIPFS = async (file) => {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

    let data = new FormData();
    data.append('file', file);

    const metadata = JSON.stringify({
        name: file.name,
    });
    data.append('pinataMetadata', metadata);

    const pinataOptions = JSON.stringify({
        cidVersion: 0,
    });
    data.append('pinataOptions', pinataOptions);

    try {
        const res = await axios.post(url, data, {
            maxBodyLength: 'Infinity',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
                'pinata_api_key': process.env.REACT_APP_PINATA_API_KEY,
                'pinata_secret_api_key': process.env.REACT_APP_PINATA_API_SECRET,
            },
        });
        console.log("File uploaded, CID:", res.data.IpfsHash);
        return {
            success: true,
            cid: res.data.IpfsHash,
        };
    } catch (error) {
        console.error("Error uploading file to IPFS:", error.response ? error.response.data : error.message);
        return {
            success: false,
            message: error.response ? JSON.stringify(error.response.data) : error.message,
        };
    }
};


// Komponen utama untuk berinteraksi dengan kontrak HospitalStorage
function HospitalInterface() {
  // State untuk menyimpan informasi Web3
  const [provider, setProvider] = useState(null); // eslint-disable-line no-unused-vars
  const [signer, setSigner] = useState(null);   // eslint-disable-line no-unused-vars
  const [contract, setContract] = useState(null);
  const [currentAccount, setCurrentAccount] = useState('');
  const [chainId, setChainId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // State untuk input form "Add Record"
  const [patientName, setPatientName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null); // State baru untuk file yang dipilih

  // State untuk menampilkan "Record Count"
  const [recordCount, setRecordCount] = useState(0);

  // State untuk input form "Get Record by ID"
  const [recordIdToFetch, setRecordIdToFetch] = useState('');
  const [fetchedRecord, setFetchedRecord] = useState(null);

  // Fungsi untuk menghubungkan dompet MetaMask
  // Dibuat sebagai useCallback agar stabil di antara render
  const connectWallet = useCallback(async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      // Meminta akses ke akun MetaMask
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });

      setCurrentAccount(accounts[0]);
      setChainId(parseInt(currentChainId, 16));

      // Inisialisasi provider dan signer dari ethers.js
      const ethersProvider = new window.ethers.BrowserProvider(window.ethereum);
      setProvider(ethersProvider);

      const ethersSigner = await ethersProvider.getSigner();
      setSigner(ethersSigner);

      // Inisialisasi instance kontrak
      const hospitalContract = new window.ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, ethersSigner);
      setContract(hospitalContract);

      setMessage('Dompet terhubung!');
      // Panggil fetchRecordCount dengan instance kontrak yang baru diinisialisasi
      // agar tidak ada warning dependensi di fetchRecordCount itu sendiri
      const count = await hospitalContract.getRecordCount();
      setRecordCount(count.toString()); 

    } catch (err) {
      setError('Gagal menghubungkan dompet: ' + err.message);
      setCurrentAccount('');
    } finally {
      setLoading(false);
    }
  }, []); // Dependensi kosong karena tidak ada variabel eksternal yang diandalkan dalam fungsi ini

  // Fungsi untuk mengambil jumlah rekam medis
  const fetchRecordCount = useCallback(async (contractInstance = contract) => {
    if (!contractInstance) {
      setError('Kontrak belum terinisialisasi.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const count = await contractInstance.getRecordCount();
      setRecordCount(count.toString()); // Convert BigNumber to string
    } catch (err) {
      setError('Gagal mengambil jumlah rekam medis: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [contract]); // Tergantung pada instance 'contract'

  // Fungsi untuk menangani perubahan akun MetaMask
  const handleAccountsChanged = useCallback((accounts) => {
    if (accounts.length > 0) {
      setCurrentAccount(accounts[0]);
      connectWallet(); // Rekoneksi untuk mendapatkan signer baru
    } else {
      setCurrentAccount('');
      setProvider(null);
      setSigner(null);
      setContract(null);
      setMessage('MetaMask terputus. Silakan sambungkan kembali.');
    }
  }, [connectWallet]); // Tergantung pada fungsi connectWallet

  // Fungsi untuk menangani perubahan jaringan MetaMask
  const handleChainChanged = useCallback((newChainId) => {
    window.location.reload(); // Disarankan untuk me-reload halaman saat chain berubah
  }, []); // Dependensi kosong

  // useEffect untuk inisialisasi pada saat komponen dimuat
  useEffect(() => {
    const checkMetaMaskInitialConnection = async () => {
        if (typeof window.ethereum !== 'undefined' && typeof window.ethers !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    setCurrentAccount(accounts[0]);
                    await connectWallet(); // Jika sudah ada akun, langsung konek
                } else {
                    setMessage('Silakan hubungkan dompet MetaMask Anda.');
                }
            } catch (err) {
                setError('Gagal memeriksa koneksi MetaMask: ' + err.message);
            }
        } else {
            setError('MetaMask atau Ethers.js tidak terdeteksi. Silakan instal MetaMask dan pastikan Ethers.js dimuat.');
        }
    };

    checkMetaMaskInitialConnection();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      return () => {
        // Hapus listener saat komponen di-unmount
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [connectWallet, handleAccountsChanged, handleChainChanged]); // Tambahkan dependensi fungsi-fungsi useCallback

  // Handler untuk perubahan input file
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Fungsi untuk menambahkan rekam medis baru
  const handleAddRecord = async (e) => {
    e.preventDefault();
    if (!contract) {
      setError('Kontrak belum terinisialisasi. Silakan hubungkan dompet.');
      return;
    }
    if (!patientName) {
      setError('Nama Pasien tidak boleh kosong.');
      return;
    }
    if (!selectedFile) {
      setError('Silakan pilih file rekam medis untuk diunggah.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('Mengunggah file ke IPFS via Pinata...');

    let uploadedCid = '';
    try {
      const uploadResult = await uploadFileToIPFS(selectedFile);
      if (uploadResult.success) {
        uploadedCid = uploadResult.cid;
        setMessage('File berhasil diunggah ke IPFS. CID: ' + uploadedCid);
      } else {
        setError('Gagal mengunggah file ke IPFS: ' + uploadResult.message);
        setLoading(false);
        return;
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengunggah ke IPFS: ' + err.message);
      setLoading(false);
      return;
    }

    setMessage('Mengirim transaksi ke blockchain...');
    try {
      // Panggil addRecord dengan nama pasien dan CID file dari Pinata
      const transaction = await contract.addRecord(patientName, uploadedCid);
      setMessage('Transaksi dikirim... Menunggu konfirmasi...');
      await transaction.wait(); // Tunggu transaksi dikonfirmasi di blockchain
      setMessage('Rekam medis berhasil ditambahkan ke blockchain!');
      setPatientName('');
      setSelectedFile(null); // Reset input file
      fetchRecordCount(); // Refresh jumlah record
    } catch (err) {
      setError('Gagal menambahkan rekam medis ke blockchain: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk mengambil rekam medis berdasarkan ID
  const handleFetchRecordById = async (e) => {
    e.preventDefault();
    if (!contract) {
      setError('Kontrak belum terinisialisasi. Silakan hubungkan dompet.');
      return;
    }
    if (!recordIdToFetch || isNaN(recordIdToFetch)) {
      setError('ID Rekam Medis tidak valid.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');
    setFetchedRecord(null); // Reset hasil sebelumnya

    try {
      // Memanggil fungsi `records` yang merupakan public mapping
      const record = await contract.records(parseInt(recordIdToFetch));
      // Cek apakah ID valid dan record ada (misalnya, jika id=0 dan belum ada record)
      if (record.id.toString() === '0' && record.patientName === '' && record.fileCid === '') {
        setMessage('Rekam medis dengan ID ini tidak ditemukan.');
        setFetchedRecord(null);
      } else {
        setFetchedRecord({
          id: record.id.toString(),
          patientName: record.patientName,
          fileCid: record.fileCid,
          uploadedBy: record.uploadedBy,
          timestamp: new Date(Number(record.timestamp) * 1000).toLocaleString() // Konversi timestamp ke tanggal yang mudah dibaca
        });
        setMessage('Rekam medis berhasil ditemukan.');
      }
    } catch (err) {
      setError('Gagal mengambil rekam medis: ' + err.message);
      setFetchedRecord(null);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          🏥 Hospital Storage DApp
        </h1>

        {/* Status Koneksi */}
        <div className="mb-6 p-4 border rounded-lg bg-blue-50 border-blue-200">
          <h2 className="text-xl font-semibold text-blue-800 mb-2">Status Dompet</h2>
          {currentAccount ? (
            <>
              <p className="text-gray-700">
                <span className="font-medium">Akun Terhubung:</span> {currentAccount.substring(0, 6)}...{currentAccount.substring(currentAccount.length - 4)}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Chain ID:</span> {chainId} (Sepolia diharapkan: 11155111)
              </p>
            </>
          ) : (
            <button
              onClick={connectWallet}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200 ease-in-out disabled:opacity-50"
            >
              {loading ? 'Menghubungkan...' : 'Hubungkan MetaMask'}
            </button>
          )}
        </div>

        {/* Pesan Status & Error */}
        {loading && <p className="text-center text-blue-500 mb-4">Loading...</p>}
        {error && <p className="text-center text-red-600 mb-4 font-medium">{error}</p>}
        {message && <p className="text-center text-green-600 mb-4 font-medium">{message}</p>}

        {/* Bagian Tambah Rekam Medis */}
        <div className="mb-6 p-6 border rounded-lg bg-purple-50 border-purple-200">
          <h2 className="text-xl font-semibold text-purple-800 mb-4">Tambah Rekam Medis Baru</h2>
          <form onSubmit={handleAddRecord}>
            <div className="mb-4">
              <label htmlFor="patientName" className="block text-gray-700 text-sm font-bold mb-2">
                Nama Pasien:
              </label>
              <input
                type="text"
                id="patientName"
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-purple-500"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Masukkan nama pasien"
                required
                disabled={!contract || loading}
              />
            </div>
            <div className="mb-6">
                  <label htmlFor="medicalFile" className="block text-gray-700 text-sm font-bold mb-2">
                    Pilih File Rekam Medis:
                  </label>
                  <input
                    type="file"
                    id="medicalFile"
                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
                    onChange={handleFileChange}
                    required
                    disabled={!contract || loading}
                  />
                  {selectedFile && (
                    <p className="text-gray-600 text-xs mt-2">File Terpilih: {selectedFile.name}</p>
                  )}
                </div>
            <button
              type="submit"
              disabled={!contract || loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200 ease-in-out disabled:opacity-50"
            >
              {loading ? 'Mengunggah & Menambahkan...' : 'Tambahkan Rekam Medis'}
            </button>
          </form>
        </div>

        {/* Bagian Lihat Jumlah Rekam Medis */}
        <div className="mb-6 p-6 border rounded-lg bg-green-50 border-green-200 text-center">
          <h2 className="text-xl font-semibold text-green-800 mb-4">Jumlah Total Rekam Medis</h2>
          <p className="text-4xl font-bold text-green-700">{recordCount}</p>
          <button
            onClick={() => fetchRecordCount()}
            disabled={!contract || loading}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200 ease-in-out disabled:opacity-50"
          >
            {loading ? 'Memuat...' : 'Refresh Jumlah'}
          </button>
        </div>

        {/* Bagian Cari Rekam Medis berdasarkan ID */}
        <div className="p-6 border rounded-lg bg-yellow-50 border-yellow-200">
          <h2 className="text-xl font-semibold text-yellow-800 mb-4">Cari Rekam Medis berdasarkan ID</h2>
          <form onSubmit={handleFetchRecordById}>
            <div className="mb-4">
              <label htmlFor="recordIdToFetch" className="block text-gray-700 text-sm font-bold mb-2">
                ID Rekam Medis:
              </label>
              <input
                type="number"
                id="recordIdToFetch"
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-yellow-500"
                value={recordIdToFetch}
                onChange={(e) => setRecordIdToFetch(e.target.value)}
                placeholder="Masukkan ID rekam medis"
                required
                disabled={!contract || loading}
              />
            </div>
            <button
              type="submit"
              disabled={!contract || loading}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200 ease-in-out disabled:opacity-50"
            >
              {loading ? 'Mencari...' : 'Cari Rekam Medis'}
            </button>
          </form>

          {fetchedRecord && (
            <div className="mt-6 p-4 border rounded-lg bg-yellow-100 border-yellow-300">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">Detail Rekam Medis:</h3>
              <p><span className="font-medium">ID:</span> {fetchedRecord.id}</p>
              <p><span className="font-medium">Nama Pasien:</span> {fetchedRecord.patientName}</p>
              <p><span className="font-medium">CID File:</span> <a href={`https://ipfs.io/ipfs/${fetchedRecord.fileCid}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{fetchedRecord.fileCid}</a></p>
              <p><span className="font-medium">Diunggah Oleh:</span> {fetchedRecord.uploadedBy}</p>
              <p><span className="font-medium">Timestamp:</span> {fetchedRecord.timestamp}</p>
            </div>
          )}
        </div>

        <p className="text-center text-gray-500 text-xs mt-8">
          Pastikan MetaMask Anda terhubung ke Jaringan Sepolia.
        </p>
      </div>
    </div>
  );
}

export default HospitalInterface;
