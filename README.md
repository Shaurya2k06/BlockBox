# BlockBox

**Revolutionary Decentralized File Storage with Military-Grade Encryption**

BlockBox is a cutting-edge Web3 application that provides secure, decentralized file storage using blockchain technology, IPFS (InterPlanetary File System), and client-side encryption. Built with React and modern Web3 technologies, BlockBox ensures your data remains private, secure, and accessible only to you.

## 🚀 Key Features

### 🔐 Security & Encryption
- **Zero-Knowledge Encryption**: Military-grade AES-256 encryption with client-side key generation
- **Wallet-Based Keys**: Encryption keys derived from your wallet address for ultimate security
- **Client-Side Processing**: Files are encrypted locally before leaving your device
- **No Server Access**: Your unencrypted data never touches our servers

### 🌐 Decentralized Storage
- **IPFS Integration**: Files stored across a distributed network of nodes
- **Redundant Storage**: Multiple copies across different nodes ensure availability
- **No Single Point of Failure**: Decentralized architecture guarantees uptime
- **Content Addressing**: Files accessed via cryptographic hashes (CIDs)

### 🔗 Web3 Integration
- **MetaMask Support**: Seamless wallet connection and authentication
- **Multi-Wallet Compatible**: Support for WalletConnect and other Web3 wallets
- **Blockchain-Powered**: Smart contract-based access control
- **Ethereum Network**: Built on proven blockchain infrastructure

### 💎 User Experience
- **Modern UI/UX**: Beautiful, responsive interface with smooth animations
- **Real-Time Stats**: Live tracking of storage usage and file metrics
- **Drag & Drop**: Intuitive file upload experience
- **Mobile Responsive**: Works seamlessly across all devices

## 🛠 Installation

### Prerequisites

- **Node.js** (version 16 or higher)
- **npm** or **yarn** package manager
- **MetaMask** browser extension or compatible Web3 wallet
- **Modern browser** with Web3 support

### Frontend Setup

1. **Clone the repository**:
```bash
git clone https://github.com/shaurya2k06/BlockBox.git
cd BlockBox/frontend
```

2. **Install dependencies**:
```bash
npm install
# or
yarn install
```

3. **Start the development server**:
```bash
npm run dev
# or
yarn dev
```

4. **Open your browser** and navigate to `http://localhost:5173`

### Production Build

```bash
npm run build
# or
yarn build
```

## 📖 Usage

### Getting Started

1. **Connect Your Wallet**
   - Click "Connect Wallet" on the landing page
   - Approve the connection in MetaMask
   - Your wallet address becomes your identity

2. **Upload Files**
   - Navigate to the dashboard
   - Drag & drop files or click to browse
   - Files are automatically encrypted using your wallet-derived key
   - Encrypted files are uploaded to IPFS

3. **Manage Files**
   - View all your encrypted files in the dashboard
   - Download and decrypt files instantly
   - Copy IPFS CIDs for sharing or backup
   - Delete files you no longer need

### Security Model

```javascript
// Your encryption key is derived from your wallet
const encryptionKey = generateKey(walletAddress);

// Files are encrypted client-side
const encryptedData = encryptFile(file, encryptionKey);

// Only encrypted data is uploaded to IPFS
const cid = await uploadToIPFS(encryptedData);
```

### File Operations

- **Upload**: Files are encrypted locally then stored on IPFS
- **Download**: Files are retrieved from IPFS and decrypted locally
- **Share**: Share IPFS CIDs while maintaining encryption
- **Delete**: Remove files from your personal storage index

## 🏗 Architecture

### Frontend Stack
- **React 19**: Modern React with latest features
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Smooth animations and transitions
- **Ethers.js**: Ethereum blockchain interaction
- **CryptoJS**: Client-side encryption library

### Core Services
- **Web3 Service**: Wallet connection and blockchain interaction
- **IPFS Service**: Decentralized file storage operations
- **Encryption Service**: Client-side file encryption/decryption
- **Storage Service**: Local storage management

### Data Flow
1. **Wallet Connection** → Authentication & Key Generation
2. **File Selection** → Client-Side Encryption
3. **IPFS Upload** → Decentralized Storage
4. **Metadata Storage** → Local Index Management
5. **File Retrieval** → IPFS Download & Decryption

## 🔧 Configuration


### Wallet Configuration

Supported networks:
- **Ethereum Mainnet** (Chain ID: 1)
- **Polygon** (Chain ID: 137)
- **BSC** (Chain ID: 56)

## 📊 Features Overview

### Dashboard Statistics
- **Total Files**: Number of files stored
- **Storage Used**: Total encrypted data size
- **Encrypted Files**: Count of secured files
- **Last Activity**: Recent file operations

### File Management
- **Multi-file Upload**: Upload multiple files simultaneously
- **File Encryption**: Automatic AES-256 encryption
- **IPFS Storage**: Decentralized file hosting
- **One-Click Download**: Decrypt and download instantly

### Security Features
- **Wallet-Derived Keys**: Unique encryption per wallet
- **Zero-Knowledge**: No server-side access to your data
- **Client-Side Operations**: All encryption happens locally
- **Decentralized Network**: No central point of failure

## 🔒 Security Considerations

- **Private Keys**: Keep your wallet private keys secure
- **Backup Strategy**: Consider backing up IPFS CIDs
- **Network Security**: Use secure networks for sensitive operations
- **Browser Security**: Keep your browser and extensions updated

## 🚀 Deployment

### Frontend Deployment

```bash
# Build for production
npm run build

# Deploy to your preferred hosting service
# (Vercel, Netlify, AWS S3, etc.)
```

### IPFS Node Setup (Optional)

For enhanced decentralization, consider running your own IPFS node:

```bash
# Install IPFS
npm install -g ipfs

# Initialize IPFS node
ipfs init

# Start IPFS daemon
ipfs daemon
```

## 📋 Browser Support

- **Chrome/Chromium** (Recommended)
- **Firefox**
- **Safari** (with limitations)
- **Edge**

*Note: Web3 functionality requires MetaMask or compatible wallet extension*

## 🔍 Troubleshooting

### Common Issues

1. **Wallet Connection Failed**
   - Ensure MetaMask is installed and unlocked
   - Check network settings
   - Refresh the page and try again

2. **Upload Errors**
   - Check file size limits
   - Verify IPFS service availability
   - Ensure stable internet connection

3. **File Not Found**
   - IPFS content may take time to propagate
   - Try accessing from different IPFS gateways
   - Check if file was properly uploaded

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.



**🛡️ Built with privacy, security, and decentralization at its core**

*Your data, your rules, your blockchain.*
