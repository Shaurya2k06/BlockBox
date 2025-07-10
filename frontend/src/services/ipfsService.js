// IPFS Service - Production implementation using Pinata
import axios from 'axios';

class IPFSService {
  constructor() {

    this.pinataJWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI3ZDIwYWE0NC01MGQ0LTQ4MjgtODI2My0wNjU2NmU3OGU4NTUiLCJlbWFpbCI6InNoYXVyeWEyazA2QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI1N2EzMzU2MDU1ZDcyYzAxZGU5NyIsInNjb3BlZEtleVNlY3JldCI6IjQ1ZTIzYmQwNmM5YjQ4ZThiZWE2MWYzYTZmOTc3ZTQxODMwODUxMWQ2MGRmMTcyZDI3Y2NiNGEzNTM1YzI1NGEiLCJleHAiOjE3ODIzMzk0Nzd9.EysckJiHNGZt4KJjxeDNJtlxsw5TlWKzhzVuOYYcmQ0";
    this.pinataApiKey = '57a3356055d72c01de97';
    this.pinataSecretApiKey = "45e23bd06c9b48e8bea61f3a6f977e418308511d60df172d27ccb4a3535c254a";
    this.pinataBaseURL = 'https://api.pinata.cloud';
    this.ipfsBaseURL = 'https://gateway.pinata.cloud/ipfs/';
    
    // Create axios instance with auth headers
    const headers = this.pinataJWT 
      ? { 'Authorization': `Bearer ${this.pinataJWT}` }
      : {
          'pinata_api_key': this.pinataApiKey,
          'pinata_secret_api_key': this.pinataSecretApiKey,
        };

    this.pinataAPI = axios.create({
      baseURL: this.pinataBaseURL,
      headers,
    });
  }

  // Test Pinata connection
  async testConnection() {
    try {
      const response = await this.pinataAPI.get('/data/testAuthentication');
      return response.data;
    } catch (error) {
      console.error('Pinata authentication failed:', error);
      return { authenticated: false, error: error.message };
    }
  }

  // Upload file to IPFS via Pinata
  async uploadFile(file, metadata = {}) {
    try {
      const formData = new FormData();
      
      // Handle different input types (File object or encrypted string data)
      let fileToUpload = file;
      if (typeof file === 'string') {
        // If file is encrypted string data, create a blob
        const blob = new Blob([file], { type: 'application/octet-stream' });
        fileToUpload = new File([blob], metadata.name || 'encrypted-file', {
          type: 'application/octet-stream'
        });
      }
      
      formData.append('file', fileToUpload);

      // Add metadata
      const pinataMetadata = JSON.stringify({
        name: metadata.name || fileToUpload.name || 'uploaded-file',
        keyvalues: {
          ...metadata,
          uploadedAt: new Date().toISOString(),
          size: fileToUpload.size,
          type: fileToUpload.type,
          encrypted: metadata.encrypted || false
        }
      });
      formData.append('pinataMetadata', pinataMetadata);

      // Add pinning options
      const pinataOptions = JSON.stringify({
        cidVersion: 0,
        customPinPolicy: {
          regions: [
            {
              id: 'FRA1',
              desiredReplicationCount: 1
            },
            {
              id: 'NYC1', 
              desiredReplicationCount: 1
            }
          ]
        }
      });
      formData.append('pinataOptions', pinataOptions);

      const response = await this.pinataAPI.post('/pinning/pinFileToIPFS', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 30000 // 30 second timeout
      });

      const { IpfsHash, PinSize, Timestamp } = response.data;

      return {
        cid: IpfsHash,
        url: `${this.ipfsBaseURL}${IpfsHash}`,
        size: PinSize,
        timestamp: Timestamp,
        success: true
      };
    } catch (error) {
      console.error('IPFS upload error:', error);
      console.error('Error response:', error.response?.data);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Upload failed'
      };
    }
  }

  // Upload JSON data to IPFS
  async uploadJSON(jsonData, metadata = {}) {
    try {
      const response = await this.pinataAPI.post('/pinning/pinJSONToIPFS', {
        pinataContent: jsonData,
        pinataMetadata: {
          name: metadata.name || 'json-data',
          keyvalues: {
            ...metadata,
            uploadedAt: new Date().toISOString(),
            type: 'application/json'
          }
        },
        pinataOptions: {
          cidVersion: 0
        }
      });

      const { IpfsHash, PinSize, Timestamp } = response.data;

      return {
        cid: IpfsHash,
        url: `${this.ipfsBaseURL}${IpfsHash}`,
        size: PinSize,
        timestamp: Timestamp,
        success: true
      };
    } catch (error) {
      console.error('JSON upload error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Get file from IPFS
  async getFile(cid) {
    try {
      const response = await axios.get(`${this.ipfsBaseURL}${cid}`, {
        responseType: 'arraybuffer'
      });

      return {
        data: response.data,
        headers: response.headers,
        success: true
      };
    } catch (error) {
      console.error('IPFS retrieval error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get JSON data from IPFS
  async getJSON(cid) {
    try {
      const response = await axios.get(`${this.ipfsBaseURL}${cid}`);
      return {
        data: response.data,
        success: true
      };
    } catch (error) {
      console.error('JSON retrieval error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Check if file exists and get metadata
  async fileExists(cid) {
    try {
      const response = await this.pinataAPI.get(`/data/pinList?hashContains=${cid}`);
      return response.data.count > 0;
    } catch (error) {
      return false;
    }
  }

  // Get file metadata from Pinata
  async getFileMetadata(cid) {
    try {
      const response = await this.pinataAPI.get(`/data/pinList?hashContains=${cid}`);
      if (response.data.count > 0) {
        return response.data.rows[0];
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  // Pin existing IPFS hash
  async pinByHash(cid, metadata = {}) {
    try {
      const response = await this.pinataAPI.post('/pinning/pinByHash', {
        hashToPin: cid,
        pinataMetadata: {
          name: metadata.name || cid,
          keyvalues: metadata
        }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Unpin file from IPFS
  async unpinFile(cid) {
    try {
      await this.pinataAPI.delete(`/pinning/unpin/${cid}`);
      return { success: true, unpinned: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.message 
      };
    }
  }

  // Get all pinned files
  async getPinnedFiles(options = {}) {
    try {
      const params = {
        status: 'pinned',
        pageLimit: options.limit || 10,
        pageOffset: options.offset || 0,
        ...options
      };

      const response = await this.pinataAPI.get('/data/pinList', { params });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Get storage statistics
  async getStorageStats() {
    try {
      const response = await this.pinataAPI.get('/data/userPinnedDataTotal');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Update file metadata
  async updateMetadata(cid, metadata) {
    try {
      const response = await this.pinataAPI.put('/pinning/hashMetadata', {
        ipfsPinHash: cid,
        name: metadata.name,
        keyvalues: metadata.keyvalues || {}
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }
}

// Create singleton instance
const ipfsService = new IPFSService();

export default ipfsService;
