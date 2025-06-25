
# web3-hospital-storage



📦 `web3-hospital-storage` is a project developed as part of my research on decentralized storage for electronic medical records (EMR) using **Blockchain**, **IPFS**, and **Smart Contracts**.

## 🧠 Project Goals

This project aims to:
- Build a decentralized medical data storage system (Web3-based)
- Ensure data privacy, security, and integrity
- Use **Ethereum Smart Contracts** for CID logging
- Leverage **IPFS (via Pinata)** to store encrypted medical files

## 🏗️ System Architecture


Frontend (React)
     ↓
Upload to IPFS (via Pinata API)
     ↓
Store CID on Ethereum (Smart Contract)
    


⚙️ Technologies Used
⚛️ React (Frontend)
📦 IPFS via Pinata (Decentralized storage)
⛓️ Solidity & Hardhat (Smart Contract development)
🧪 Ethereum Sepolia Testnet
🚀 Quick Start


# 1. Clone the repository
git clone https://github.com/username/web3-hospital-storage.git
cd web3-hospital-storage

# 2. Install frontend dependencies
cd frontend
npm install
npm start

# 3. Compile and deploy the smart contract (if using Hardhat)
cd contracts
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
🧪 Research Context
📌 This project is currently under active development and testing as part of my Master's thesis.

📬 Contact
If you're interested in discussing, collaborating, or learning more:

Name: Rinday Zildjiani Salji

Email: rindayzildzianisalji@gmail.com

University: Universitas Ahmad Dahlan

🧠 Disclaimer: This is a research support repository and not intended for production use at this stage.


