// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  // Menampilkan informasi network dan akun deployer
  const network = await hre.ethers.provider.getNetwork();
  const [deployer] = await hre.ethers.getSigners();

  console.log(`Deploying contracts to ${network.name} network...`);
  console.log(`Deploying with the account: ${deployer.address}`);

  // Mengambil instance contract yang akan di-deploy
  const hospitalStorageFactory = await hre.ethers.getContractFactory("HospitalStorage");

  // Memulai proses deployment
  const hospitalStorage = await hospitalStorageFactory.deploy();

  // Menunggu hingga deployment selesai
  await hospitalStorage.waitForDeployment();

  // Mendapatkan alamat contract setelah di-deploy
  const contractAddress = await hospitalStorage.getAddress();

  console.log(`HospitalStorage contract deployed to: ${contractAddress}`);
}

// Pola yang direkomendasikan untuk menggunakan async/await di mana-mana
// dan menangani error dengan benar.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});