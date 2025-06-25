import axios from 'axios';

export const uploadFileToIPFS = async (file) => {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`; // Pastikan ini tidak berubah

    // Membuat data form
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
        console.error("Error uploading file to IPFS:", error);
        return {
            success: false,
            message: error.message,
        };
    }
};