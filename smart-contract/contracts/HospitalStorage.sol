// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract HospitalStorage {

    // Struktur untuk menyimpan setiap rekam medis
    struct MedicalRecord {
        uint256 id;
        string patientName;
        string fileCid; // Hash (CID) dari IPFS
        address uploadedBy;
        uint256 timestamp;
    }

    // Mapping dari ID rekam medis ke struct MedicalRecord
    mapping(uint256 => MedicalRecord) public records;

    // Counter untuk menghasilkan ID unik
    uint256 public recordCounter;

    // Event untuk memberi notifikasi ke frontend saat ada data baru
    event RecordAdded(
        uint256 id,
        string patientName,
        string fileCid,
        address uploadedBy,
        uint256 timestamp
    );

    // Modifier untuk membatasi akses (contoh sederhana)
    // Di aplikasi nyata, ini bisa lebih kompleks (misalnya, role-based access)
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    /**
     * @dev Menambahkan rekam medis baru.
     * @param _patientName Nama pasien.
     * @param _fileCid CID dari file di IPFS.
     */
    function addRecord(string memory _patientName, string memory _fileCid) public {
        // Di aplikasi nyata, Anda mungkin ingin menambahkan kontrol akses di sini
        // require(isAuthorized(msg.sender), "Not authorized");

        recordCounter++;
        uint256 newId = recordCounter;

        records[newId] = MedicalRecord(
            newId,
            _patientName,
            _fileCid,
            msg.sender,
            block.timestamp
        );

        // Emit event
        emit RecordAdded(newId, _patientName, _fileCid, msg.sender, block.timestamp);
    }

    /**
     * @dev Mengambil total jumlah rekam medis yang tersimpan.
     */
    function getRecordCount() public view returns (uint256) {
        return recordCounter;
    }
}