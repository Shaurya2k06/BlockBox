import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWeb3 } from '../hooks/useWeb3';
import ipfsService from '../services/ipfsService';
import encryptionService from '../services/encryptionService';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

// Icons from different libraries
import { ArrowLeft } from 'lucide-react';
import { 
  MdUploadFile, 
  MdDownload, 
  MdLock, 
  MdAccountBalanceWallet, 
  MdDescription, 
  MdSecurity, 
  MdDelete, 
  MdContentCopy,
  MdVisibility,
  MdVisibilityOff,
  MdCheckCircle,
  MdError,
  MdAccessTime,
  MdStorage,
  MdCloudUpload,
  MdShield,
  MdDataUsage
} from 'react-icons/md';
import { 
  FaEthereum, 
  FaCube
} from 'react-icons/fa';
import { CircleStackIcon } from '@heroicons/react/24/outline';

// Minimal Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 12, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 25
    }
  }
};

const cardVariants = {
  hidden: { scale: 0.95, opacity: 0, y: 20 },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 150,
      damping: 20
    }
  },
  hover: {
    scale: 1.01,
    y: -2,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25
    }
  }
};

const BlockBoxDashboard = ({ onNavigate }) => {
  // Web3 hook
  const { account, isConnected, connectWallet, disconnectWallet, isConnecting, error: web3Error } = useWeb3();
  
  // State management
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalSize: 0,
    encryptedFiles: 0,
    lastActivity: null
  });
  
  const fileInputRef = useRef(null);
  
  // Initialize encryption key when wallet connects
  useEffect(() => {
    if (isConnected && account) {
      const key = encryptionService.generateKey(account);
      setEncryptionKey(key);
      loadUserFiles(account);
    } else {
      setEncryptionKey('');
      setFiles([]);
    }
  }, [isConnected, account]);

  // Mock IPFS upload function (now using ipfsService)
  const uploadToIPFS = async (encryptedData, filename) => {
    const result = await ipfsService.uploadFile(encryptedData, { name: filename });
    if (result.success) {
      return result.cid;
    }
    throw new Error(result.error);
  };

  // Handle wallet connection
  const handleConnectWallet = async () => {
    const success = await connectWallet();
    if (success) {
      showNotification('Wallet connected successfully!', 'success');
    } else {
      showNotification(web3Error || 'Failed to connect wallet', 'error');
    }
  };

  // Handle wallet disconnection
  const handleDisconnectWallet = () => {
    disconnectWallet();
    showNotification('Wallet disconnected', 'info');
  };

  // Load user files from localStorage
  const loadUserFiles = (address) => {
    const savedFiles = localStorage.getItem(`BlockBox_files_${address}`);
    if (savedFiles) {
      const parsedFiles = JSON.parse(savedFiles);
      setFiles(parsedFiles);
      updateStats(parsedFiles);
    }
  };

  // Update statistics
  const updateStats = (fileList) => {
    const totalSize = fileList.reduce((sum, file) => sum + file.size, 0);
    const encryptedCount = fileList.filter(file => file.encrypted).length;
    const lastActivity = fileList.length > 0 ? Math.max(...fileList.map(f => f.timestamp)) : null;
    
    setStats({
      totalFiles: fileList.length,
      totalSize,
      encryptedFiles: encryptedCount,
      lastActivity
    });
  };

  // Show notification
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 3000);
  };

  // Encrypt file using encryption service
  const encryptFile = async (file, key) => {
    const result = await encryptionService.encryptFile(file, key);
    if (result.success) {
      return result.data;
    }
    throw new Error(result.error);
  };

  // Decrypt file using encryption service
  const decryptFile = async (encryptedData, key, originalName, originalType) => {
    const result = await encryptionService.decryptFile(encryptedData, key, originalName, originalType);
    if (result.success) {
      return result;
    }
    throw new Error(result.error);
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    const selectedFiles = Array.from(event.target.files);
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    
    try {
      for (const file of selectedFiles) {
        // Encrypt file
        const encryptedData = await encryptFile(file, encryptionKey);
        
        // Upload to IPFS
        const cid = await uploadToIPFS(encryptedData, file.name);
        
        // Create file record
        const fileRecord = {
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          cid: cid,
          encrypted: true,
          timestamp: Date.now(),
          encryptedData: encryptedData,
          walletAddress: account
        };
        
        // Update files list
        const updatedFiles = [...files, fileRecord];
        setFiles(updatedFiles);
        updateStats(updatedFiles);
        
        // Save to localStorage
        localStorage.setItem(`BlockBox_files_${account}`, JSON.stringify(updatedFiles));
      }
      
      showNotification(`${selectedFiles.length} file(s) uploaded successfully!`, 'success');
    } catch (error) {
      console.error('Upload error:', error);
      showNotification('Upload failed: ' + error.message, 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Download and decrypt file
  const downloadFile = async (file) => {
    try {
      const decrypted = await decryptFile(file.encryptedData, encryptionKey, file.name, file.type);
      
      // Create download link
      const link = document.createElement('a');
      link.href = decrypted.downloadUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up object URL
      setTimeout(() => URL.revokeObjectURL(decrypted.downloadUrl), 1000);
      
      showNotification('File downloaded successfully!', 'success');
    } catch (error) {
      console.error('Download error:', error);
      showNotification('Download failed: ' + error.message, 'error');
    }
  };

  // Delete file
  const deleteFile = (fileId) => {
    const updatedFiles = files.filter(file => file.id !== fileId);
    setFiles(updatedFiles);
    updateStats(updatedFiles);
    localStorage.setItem(`BlockBox_files_${account}`, JSON.stringify(updatedFiles));
    showNotification('File deleted successfully', 'success');
  };

  // Copy CID to clipboard
  const copyCID = async (cid) => {
    try {
      await navigator.clipboard.writeText(cid);
      showNotification('CID copied to clipboard!', 'success');
    } catch (error) {
      showNotification('Failed to copy CID', 'error');
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Minimal Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Subtle grid */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(148, 163, 184, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(148, 163, 184, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px'
          }}
        />
        
        {/* Floating geometric shapes */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={`shape-${i}`}
            className="absolute w-1 h-1 bg-slate-400/20 rounded-full"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.1, 0.3, 0.1],
              y: [-20, 20, -20],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut"
            }}
          />
        ))}
        
        {/* Subtle light rays */}
        <motion.div
          className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-slate-400/10 to-transparent"
          animate={{
            opacity: [0, 0.5, 0],
            scaleY: [0.8, 1.2, 0.8]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-slate-400/10 to-transparent"
          animate={{
            opacity: [0, 0.3, 0],
            scaleY: [1.2, 0.8, 1.2]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      <motion.div 
        className="max-w-7xl mx-auto relative z-10 p-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Minimal Header */}
        <motion.div 
          className="mb-12"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => onNavigate && onNavigate('landing')}
                  className="bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:bg-slate-800/80 hover:border-slate-600/50 backdrop-blur-sm transition-all duration-200"
                  size="sm"
                >
                  <ArrowLeft className="mr-2" size={16} />
                  Back
                </Button>
              </motion.div>
              
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="flex items-center space-x-4">
                  <motion.div
                    animate={{ 
                      rotate: [0, 360],
                    }}
                    transition={{ 
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    className="relative"
                  >
                    <MdSecurity className="text-4xl text-slate-400" />
                    <motion.div
                      className="absolute inset-0 bg-slate-400/20 rounded-full blur-lg"
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.2, 0.4, 0.2]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </motion.div>
                  
                  <div>
                    <motion.h1 
                      className="text-3xl font-light tracking-wide text-slate-100"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                    >
                      BlockBox
                    </motion.h1>
                    <motion.p 
                      className="text-slate-400 text-sm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                    >
                      Decentralized Storage Protocol
                    </motion.p>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Wallet Connection */}
            <motion.div 
              className="flex items-center space-x-4"
              variants={itemVariants}
            >
              {isConnected ? (
                <motion.div 
                  className="flex items-center space-x-4 bg-slate-800/30 border border-slate-700/50 rounded-lg p-4 backdrop-blur-sm"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-2 h-2 bg-emerald-400 rounded-full"
                  />
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Connected</p>
                    <p className="text-slate-200 text-sm flex items-center">
                      <FaEthereum className="mr-2 text-slate-400" size={14} />
                      {account.slice(0, 6)}...{account.slice(-4)}
                    </p>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      onClick={handleDisconnectWallet} 
                      className="bg-slate-700/50 border border-slate-600/50 text-slate-300 hover:bg-slate-700/80 text-xs"
                      size="sm"
                    >
                      Disconnect
                    </Button>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    onClick={handleConnectWallet} 
                    className="bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:bg-slate-800/80 hover:border-slate-600/50 backdrop-blur-sm"
                    disabled={isConnecting}
                  >
                    <MdAccountBalanceWallet className="mr-2" size={18} />
                    {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Minimal Notification */}
        <AnimatePresence>
          {notification.message && (
            <motion.div 
              className={`mb-6 p-4 rounded-lg border backdrop-blur-sm ${
                notification.type === 'success' ? 
                  'bg-emerald-900/20 text-emerald-300 border-emerald-700/50' :
                notification.type === 'error' ? 
                  'bg-red-900/20 text-red-300 border-red-700/50' :
                  'bg-slate-800/20 text-slate-300 border-slate-700/50'
              }`}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
            >
              <div className="flex items-center">
                <motion.div
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1, type: "spring" }}
                >
                  {notification.type === 'success' ? <MdCheckCircle className="mr-3" size={18} /> :
                   notification.type === 'error' ? <MdError className="mr-3" size={18} /> :
                   <MdAccessTime className="mr-3" size={18} />}
                </motion.div>
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-sm"
                >
                  {notification.message}
                </motion.span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        {!isConnected ? (
          <motion.div 
            className="text-center py-24"
            variants={itemVariants}
          >
            <motion.div 
              className="bg-slate-800/20 border border-slate-700/30 rounded-2xl p-16 max-w-lg mx-auto backdrop-blur-sm"
              variants={cardVariants}
              whileHover="hover"
            >
              <motion.div
                animate={{ 
                  y: [0, -8, 0],
                  rotate: [0, 180, 360]
                }}
                transition={{ 
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="mb-8"
              >
                <MdSecurity className="mx-auto text-6xl text-slate-400" />
              </motion.div>
              
              <motion.h2 
                className="text-2xl font-light text-slate-100 mb-4"
                variants={itemVariants}
              >
                Connect Your Wallet
              </motion.h2>
              
              <motion.p 
                className="text-slate-400 mb-8"
                variants={itemVariants}
              >
                Access your encrypted files on the decentralized network
              </motion.p>
              
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  onClick={handleConnectWallet} 
                  className="bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:bg-slate-800/80 hover:border-slate-600/50 backdrop-blur-sm px-8 py-3"
                  size="lg"
                  disabled={isConnecting}
                >
                  <MdAccountBalanceWallet className="mr-2" size={20} />
                  {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div 
            className="space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Stats Grid */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-4 gap-6"
              variants={containerVariants}
            >
              {[
                { 
                  icon: MdDescription, 
                  label: 'Files', 
                  value: stats.totalFiles, 
                  unit: 'stored'
                },
                { 
                  icon: MdStorage, 
                  label: 'Storage', 
                  value: formatFileSize(stats.totalSize), 
                  unit: 'used'
                },
                { 
                  icon: MdLock, 
                  label: 'Encrypted', 
                  value: stats.encryptedFiles, 
                  unit: 'secured'
                },
                { 
                  icon: MdAccessTime, 
                  label: 'Last Activity', 
                  value: stats.lastActivity ? formatDate(stats.lastActivity) : 'None', 
                  isDate: true
                }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  variants={cardVariants}
                  whileHover="hover"
                  className="bg-slate-800/20 border border-slate-700/30 rounded-lg p-6 backdrop-blur-sm relative overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-slate-700/5 to-transparent"
                    animate={{
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      delay: index * 0.5
                    }}
                  />
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-slate-400 text-sm">{stat.label}</p>
                      <motion.div
                        animate={{ 
                          rotate: [0, 360],
                        }}
                        transition={{ 
                          duration: 12,
                          repeat: Infinity,
                          delay: index * 0.3,
                          ease: "linear"
                        }}
                      >
                        <stat.icon className="text-slate-400" size={20} />
                      </motion.div>
                    </div>
                    
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1, type: "spring" }}
                    >
                      <p className={`${stat.isDate ? 'text-sm' : 'text-xl'} font-medium text-slate-100 mb-1`}>
                        {stat.value}
                      </p>
                      {stat.unit && (
                        <p className="text-xs text-slate-500">{stat.unit}</p>
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Upload Section */}
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              className="bg-slate-800/20 border border-slate-700/30 rounded-lg backdrop-blur-sm"
            >
              <div className="p-8">
                <div className="flex items-center mb-6">
                  <motion.div
                    animate={{ 
                      rotate: [0, 360],
                    }}
                    transition={{ 
                      duration: 15,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  >
                    <MdCloudUpload className="mr-3 text-slate-400" size={24} />
                  </motion.div>
                  <h3 className="text-xl font-light text-slate-100">Upload Files</h3>
                </div>
                
                <div className="space-y-6">
                  <motion.div
                    whileHover={{ scale: 1.005 }}
                    whileTap={{ scale: 0.995 }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <motion.label
                      htmlFor="file-upload"
                      className="flex items-center justify-center w-full h-32 border-2 border-dashed border-slate-600/50 rounded-lg cursor-pointer hover:border-slate-500/70 transition-colors group relative overflow-hidden"
                      whileHover={{
                        borderColor: "rgba(148, 163, 184, 0.7)",
                        backgroundColor: "rgba(30, 41, 59, 0.1)"
                      }}
                    >
                      <motion.div
                        className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-400/30 to-transparent"
                        animate={{
                          x: ['-100%', '100%']
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      />
                      
                      <div className="text-center relative z-10">
                        <motion.div
                          animate={{ 
                            y: [0, -4, 0],
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className="mb-3"
                        >
                          <MdUploadFile className="mx-auto text-slate-400 group-hover:text-slate-300" size={32} />
                        </motion.div>
                        <p className="text-slate-400 group-hover:text-slate-300 transition-colors">
                          Drop files here or click to browse
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Files will be encrypted locally before upload
                        </p>
                      </div>
                    </motion.label>
                  </motion.div>
                  
                  {/* Encryption Key Display */}
                  <motion.div 
                    className="bg-slate-900/30 border border-slate-700/30 rounded-lg p-4"
                    variants={cardVariants}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-slate-400 flex items-center">
                        <MdLock className="mr-2" size={16} />
                        Encryption Key
                      </p>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          onClick={() => setShowKey(!showKey)}
                          className="bg-slate-700/50 border border-slate-600/50 text-slate-300 hover:bg-slate-700/80"
                          size="sm"
                        >
                          {showKey ? <MdVisibilityOff size={14} /> : <MdVisibility size={14} />}
                        </Button>
                      </motion.div>
                    </div>
                    
                    <motion.div
                      className="bg-slate-900/50 border border-slate-700/20 rounded p-3 font-mono text-xs"
                      animate={{ opacity: showKey ? 1 : 0.6 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="text-slate-300 break-all">
                        {showKey ? encryptionKey : '●'.repeat(64)}
                      </p>
                    </motion.div>
                    
                    <div className="flex items-center mt-2">
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity
                        }}
                      >
                        <MdShield className="mr-2 text-emerald-400" size={12} />
                      </motion.div>
                      <p className="text-xs text-slate-500">
                        Generated from your wallet address
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Files List */}
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              className="bg-slate-800/20 border border-slate-700/30 rounded-lg backdrop-blur-sm"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <MdDescription className="mr-3 text-slate-400" size={24} />
                    <div>
                      <h3 className="text-xl font-light text-slate-100">
                        Your Files ({files.length})
                      </h3>
                      <p className="text-slate-400 text-sm">
                        Encrypted and stored on IPFS
                      </p>
                    </div>
                  </div>
                </div>
                
                {files.length === 0 ? (
                  <motion.div 
                    className="text-center py-16"
                    variants={itemVariants}
                  >
                    <motion.div
                      animate={{ 
                        y: [0, -4, 0],
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="mb-4"
                    >
                      <CircleStackIcon className="mx-auto text-slate-500" width={48} height={48} />
                    </motion.div>
                    <p className="text-slate-400">No files uploaded yet</p>
                    <p className="text-sm text-slate-500 mt-1">
                      Upload your first file to get started
                    </p>
                  </motion.div>
                ) : (
                  <motion.div 
                    className="space-y-3"
                    variants={containerVariants}
                  >
                    <AnimatePresence>
                      {files.map((file, index) => (
                        <motion.div
                          key={file.id}
                          className="flex items-center justify-between p-4 bg-slate-900/30 border border-slate-700/20 rounded-lg hover:border-slate-600/40 transition-colors relative overflow-hidden group"
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{ x: 20, opacity: 0, scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 200, damping: 25 }}
                          layout
                          whileHover={{ 
                            scale: 1.005,
                            x: 4,
                          }}
                        >
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-400/5 to-transparent opacity-0 group-hover:opacity-100"
                            animate={{
                              x: ['-100%', '100%']
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "linear"
                            }}
                          />
                          
                          <div className="flex items-center space-x-4 flex-1 relative z-10">
                            <div className="flex items-center space-x-3">
                              <motion.div
                                animate={{ 
                                  rotate: [0, 360],
                                }}
                                transition={{ 
                                  duration: 20,
                                  repeat: Infinity,
                                  delay: index * 0.2,
                                  ease: "linear"
                                }}
                              >
                                <MdDescription className="text-slate-400" size={20} />
                              </motion.div>
                              {file.encrypted && (
                                <motion.div
                                  animate={{ 
                                    scale: [1, 1.1, 1],
                                    opacity: [0.7, 1, 0.7]
                                  }}
                                  transition={{ 
                                    duration: 2,
                                    repeat: Infinity,
                                  }}
                                >
                                  <MdLock className="text-emerald-400" size={14} />
                                </motion.div>
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <p className="text-slate-200 font-medium">{file.name}</p>
                              <div className="flex items-center space-x-6 text-sm text-slate-400 mt-1">
                                <span className="flex items-center">
                                  <MdDataUsage className="mr-1" size={12} />
                                  {formatFileSize(file.size)}
                                </span>
                                <span className="flex items-center">
                                  <MdAccessTime className="mr-1" size={12} />
                                  {formatDate(file.timestamp)}
                                </span>
                                <span className="text-xs flex items-center text-slate-500">
                                  <FaCube className="mr-1" size={10} />
                                  {file.cid.slice(0, 8)}...{file.cid.slice(-8)}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 relative z-10">
                            {[
                              { action: () => copyCID(file.cid), icon: MdContentCopy, title: 'Copy CID' },
                              { action: () => downloadFile(file), icon: MdDownload, title: 'Download' },
                              { action: () => deleteFile(file.id), icon: MdDelete, title: 'Delete' }
                            ].map((btn, btnIndex) => (
                              <motion.div
                                key={btnIndex}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Button
                                  onClick={btn.action}
                                  className="bg-slate-700/50 border border-slate-600/50 text-slate-300 hover:bg-slate-700/80 p-2"
                                  size="sm"
                                  title={btn.title}
                                >
                                  <btn.icon size={14} />
                                </Button>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Loading Overlay */}
        <AnimatePresence>
          {isUploading && (
            <motion.div 
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-12 text-center backdrop-blur-sm"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
              >
                <motion.div
                  className="w-12 h-12 border-2 border-slate-600/30 border-t-slate-400 rounded-full mx-auto mb-6"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                
                <motion.p 
                  className="text-slate-200 text-lg mb-4"
                  animate={{ opacity: [1, 0.7, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Processing...
                </motion.p>
                
                <motion.p 
                  className="text-slate-400 text-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  Encrypting and uploading to IPFS
                </motion.p>
                
                {/* Progress indicator */}
                <div className="mt-6 space-y-2">
                  {['Encrypting', 'Uploading', 'Verifying'].map((stage, i) => (
                    <div key={stage} className="flex items-center space-x-3">
                      <span className="text-xs text-slate-500 w-16 text-left">{stage}</span>
                      <div className="flex-1 bg-slate-700/50 rounded-full h-1">
                        <motion.div
                          className="bg-slate-400 h-1 rounded-full"
                          initial={{ width: '0%' }}
                          animate={{ width: '100%' }}
                          transition={{ 
                            duration: 1.5, 
                            delay: i * 0.3,
                            repeat: Infinity,
                            repeatType: "loop"
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default BlockBoxDashboard;