import CryptoJS from 'crypto-js';

class EncryptionService {
  constructor() {
    this.algorithm = 'AES';
    this.keySize = 256;
  }

  // Generate a secure encryption key
  generateKey(seed = null) {
    if (seed) {
      // Use deterministic key generation from seed (like wallet address)
      return CryptoJS.SHA256(seed + Date.now().toString()).toString();
    }
    
    // Generate random key
    return CryptoJS.lib.WordArray.random(this.keySize / 8).toString();
  }

  // Encrypt data
  encrypt(data, key) {
    try {
      const encrypted = CryptoJS.AES.encrypt(data, key).toString();
      return {
        success: true,
        data: encrypted,
        algorithm: this.algorithm,
        keySize: this.keySize
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Decrypt data
  decrypt(encryptedData, key) {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
      const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!decryptedString) {
        throw new Error('Invalid key or corrupted data');
      }
      
      return {
        success: true,
        data: decryptedString
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Encrypt file
  async encryptFile(file, key) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          // Read as ArrayBuffer for binary files
          const arrayBuffer = e.target.result;
          const uint8Array = new Uint8Array(arrayBuffer);
          const binaryString = Array.from(uint8Array).map(byte => String.fromCharCode(byte)).join('');
          
          // Convert to base64 for encryption
          const base64Data = btoa(binaryString);
          const encrypted = this.encrypt(base64Data, key);
          
          if (encrypted.success) {
            resolve({
              success: true,
              data: encrypted.data,
              originalName: file.name,
              originalSize: file.size,
              originalType: file.type,
              algorithm: this.algorithm
            });
          } else {
            resolve(encrypted);
          }
        } catch (error) {
          resolve({
            success: false,
            error: error.message
          });
        }
      };
      
      reader.onerror = () => {
        resolve({
          success: false,
          error: 'Failed to read file'
        });
      };
      
      // Read as ArrayBuffer instead of DataURL for better binary handling
      reader.readAsArrayBuffer(file);
    });
  }

  // Decrypt file
  async decryptFile(encryptedData, key, originalName, originalType) {
    try {
      const decrypted = this.decrypt(encryptedData, key);
      
      if (!decrypted.success) {
        return decrypted;
      }
      
      // Convert from base64 back to binary
      const binaryString = atob(decrypted.data);
      const uint8Array = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
      }
      
      // Create blob from decrypted data
      const blob = new Blob([uint8Array], { type: originalType });
      
      return {
        success: true,
        blob,
        originalName,
        originalType,
        downloadUrl: URL.createObjectURL(blob)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Convert data URL to Blob
  dataURLToBlob(dataURL) {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new Blob([u8arr], { type: mime });
  }

  // Generate hash of data
  generateHash(data) {
    return CryptoJS.SHA256(data).toString();
  }

  // Verify data integrity
  verifyIntegrity(data, hash) {
    return this.generateHash(data) === hash;
  }

  // Encrypt with password
  encryptWithPassword(data, password) {
    try {
      // Add salt for additional security
      const salt = CryptoJS.lib.WordArray.random(128/8);
      const key = CryptoJS.PBKDF2(password, salt, {
        keySize: 256/32,
        iterations: 1000
      });
      
      const encrypted = CryptoJS.AES.encrypt(data, key).toString();
      
      return {
        success: true,
        data: encrypted,
        salt: salt.toString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Decrypt with password
  decryptWithPassword(encryptedData, password, salt) {
    try {
      const saltWords = CryptoJS.enc.Hex.parse(salt);
      const key = CryptoJS.PBKDF2(password, saltWords, {
        keySize: 256/32,
        iterations: 1000
      });
      
      const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
      const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!decryptedString) {
        throw new Error('Invalid password or corrupted data');
      }
      
      return {
        success: true,
        data: decryptedString
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get encryption info
  getEncryptionInfo() {
    return {
      algorithm: this.algorithm,
      keySize: this.keySize,
      mode: 'CBC',
      padding: 'Pkcs7'
    };
  }
}

// Create singleton instance
const encryptionService = new EncryptionService();

export default encryptionService;
