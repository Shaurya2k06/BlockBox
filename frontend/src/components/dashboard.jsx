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
  FaRocket, 
  FaFire, 
  FaGem, 
  FaMagic,
  FaCube,
  FaShieldAlt
} from 'react-icons/fa';
import { CircleStackIcon } from '@heroicons/react/24/outline';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10
    }
  }
};

const cardVariants = {
  hidden: { scale: 0.8, opacity: 0, y: 50 },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 15
    }
  },
  hover: {
    scale: 1.05,
    y: -5,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
};

const floatingVariants = {
  animate: {
    y: [-20, 20, -20],
    rotate: [0, 180, 360],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const ByteVaultDashboard = ({ onNavigate }) => {
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
    const savedFiles = localStorage.getItem(`bytevault_files_${address}`);
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
        localStorage.setItem(`bytevault_files_${account}`, JSON.stringify(updatedFiles));
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
    localStorage.setItem(`bytevault_files_${account}`, JSON.stringify(updatedFiles));
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0">
        {/* Floating Shapes */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`bg-shape-${i}`}
            className={`absolute ${i % 3 === 0 ? 'bg-purple-500/10' : i % 3 === 1 ? 'bg-blue-500/10' : 'bg-cyan-500/10'} 
                      ${i % 4 === 0 ? 'rounded-full' : 'rounded-lg rotate-45'}`}
            style={{
              width: `${20 + Math.random() * 60}px`,
              height: `${20 + Math.random() * 60}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 15, 0],
              rotate: [0, 180, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 5,
            }}
          />
        ))}
        
        {/* Glowing Orbs */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`orb-${i}`}
            className="absolute rounded-full blur-3xl"
            style={{
              width: `${100 + Math.random() * 200}px`,
              height: `${100 + Math.random() * 200}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, ${
                i % 3 === 0 ? 'rgba(147, 51, 234, 0.2)' : 
                i % 3 === 1 ? 'rgba(59, 130, 246, 0.2)' : 
                'rgba(6, 182, 212, 0.2)'
              } 0%, transparent 70%)`
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.7, 0.3],
              x: [0, 50, 0],
              y: [0, -30, 0]
            }}
            transition={{
              duration: 10 + Math.random() * 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 3
            }}
          />
        ))}
      </div>

      <motion.div 
        className="max-w-7xl mx-auto relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div 
          className="mb-8"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button
                  onClick={() => onNavigate && onNavigate('landing')}
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:text-white"
                >
                  <ArrowLeft className="mr-2" size={16} />
                  Back to Home
                </Button>
              </motion.div>
              
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="flex items-center space-x-4">
                  <motion.div
                    variants={floatingVariants}
                    animate="animate"
                  >
                    <FaShieldAlt className="text-purple-400 text-5xl" />
                  </motion.div>
                  <div>
                    <motion.h1 
                      className="text-4xl font-bold text-white mb-2"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                    >
                      <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                        ByteVault
                      </span>
                    </motion.h1>
                    <motion.p 
                      className="text-gray-300"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                    >
                      Secure, decentralized file storage powered by Web3
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
                  className="flex items-center space-x-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                  <div className="text-right">
                    <p className="text-sm text-gray-300">Connected</p>
                    <p className="text-white font-mono text-sm flex items-center">
                      <FaEthereum className="mr-1 text-blue-400" />
                      {account.slice(0, 6)}...{account.slice(-4)}
                    </p>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button onClick={handleDisconnectWallet} variant="outline" size="sm">
                      <MdAccountBalanceWallet className="mr-2" size={16} />
                      Disconnect
                    </Button>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    onClick={handleConnectWallet} 
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    disabled={isConnecting}
                  >
                    <MdAccountBalanceWallet className="mr-2" size={16} />
                    {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Notification */}
        <AnimatePresence>
          {notification.message && (
            <motion.div 
              className={`mb-6 p-4 rounded-lg flex items-center ${
                notification.type === 'success' ? 'bg-green-600/20 text-green-300 border border-green-600/30' :
                notification.type === 'error' ? 'bg-red-600/20 text-red-300 border border-red-600/30' :
                'bg-blue-600/20 text-blue-300 border border-blue-600/30'
              }`}
              initial={{ opacity: 0, y: -50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                {notification.type === 'success' ? <MdCheckCircle className="mr-2" size={20} /> :
                 notification.type === 'error' ? <MdError className="mr-2" size={20} /> :
                 <MdAccessTime className="mr-2" size={20} />}
              </motion.div>
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                {notification.message}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        {!isConnected ? (
          <motion.div 
            className="text-center py-20"
            variants={itemVariants}
          >
            <motion.div 
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 max-w-2xl mx-auto relative overflow-hidden"
              variants={cardVariants}
              whileHover="hover"
            >
              <motion.div
                variants={floatingVariants}
                animate="animate"
                className="mb-6"
              >
                <MdSecurity className="mx-auto text-purple-400 text-8xl" />
              </motion.div>
              
              <motion.h2 
                className="text-3xl font-bold text-white mb-4"
                variants={itemVariants}
              >
                Welcome to <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">ByteVault</span>
              </motion.h2>
              
              <motion.p 
                className="text-gray-300 mb-8 text-lg"
                variants={itemVariants}
              >
                Connect your wallet to start storing files securely on the decentralized web
              </motion.p>
              
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={handleConnectWallet} 
                  className="bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-700 hover:via-pink-700 hover:to-cyan-700 text-lg px-8 py-4 relative overflow-hidden"
                  size="lg"
                  disabled={isConnecting}
                >
                  <FaRocket className="mr-2" size={20} />
                  {isConnecting ? 'Connecting...' : 'Connect MetaMask Wallet'}
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div 
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Stats Cards */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-4 gap-6"
              variants={containerVariants}
            >
              {[
                { 
                  icon: MdDescription, 
                  label: 'Total Files', 
                  value: stats.totalFiles, 
                  color: 'purple'
                },
                { 
                  icon: MdStorage, 
                  label: 'Storage Used', 
                  value: formatFileSize(stats.totalSize), 
                  color: 'blue'
                },
                { 
                  icon: MdLock, 
                  label: 'Encrypted', 
                  value: stats.encryptedFiles, 
                  color: 'green'
                },
                { 
                  icon: MdAccessTime, 
                  label: 'Last Activity', 
                  value: stats.lastActivity ? formatDate(stats.lastActivity) : 'None', 
                  color: 'yellow',
                  isDate: true
                }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  variants={cardVariants}
                  whileHover="hover"
                >
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20 relative overflow-hidden group">
                    <CardContent className="p-6 relative z-10">
                      <div className="flex items-center justify-between">
                        <div>
                          <motion.p 
                            className="text-gray-300 text-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            {stat.label}
                          </motion.p>
                          <motion.p 
                            className={`${stat.isDate ? 'text-sm' : 'text-2xl'} font-bold text-white`}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.15, type: "spring" }}
                          >
                            {stat.value}
                          </motion.p>
                        </div>
                        <motion.div
                          animate={{ 
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.1, 1]
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            delay: index * 0.2
                          }}
                        >
                          <stat.icon 
                            className={`${stat.color === 'purple' ? 'text-purple-400' : 
                                         stat.color === 'blue' ? 'text-blue-400' :
                                         stat.color === 'green' ? 'text-green-400' : 'text-yellow-400'}`} 
                            size={32} 
                          />
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Upload Section */}
            <motion.div
              variants={cardVariants}
              whileHover="hover"
            >
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <motion.div
                      animate={{ 
                        y: [0, -5, 0],
                        rotate: [0, 10, 0]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <MdCloudUpload className="mr-2 text-purple-400" size={24} />
                    </motion.div>
                    Upload Files
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Files are encrypted locally before being uploaded to IPFS
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
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
                        className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-purple-400 transition-colors group"
                        whileHover={{
                          borderColor: "#a855f7",
                          backgroundColor: "rgba(168, 85, 247, 0.05)"
                        }}
                      >
                        <div className="text-center">
                          <motion.div
                            animate={{ 
                              y: [0, -10, 0],
                              scale: [1, 1.1, 1]
                            }}
                            transition={{ 
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          >
                            <MdUploadFile className="mx-auto mb-2 text-gray-400 group-hover:text-purple-400" size={32} />
                          </motion.div>
                          <p className="text-gray-300 group-hover:text-white transition-colors">Click to select files or drag and drop</p>
                          <p className="text-sm text-gray-500">All files will be encrypted locally</p>
                        </div>
                      </motion.label>
                    </motion.div>
                    
                    {/* Encryption Key Display */}
                    <motion.div 
                      className="bg-black/30 p-4 rounded-lg"
                      variants={cardVariants}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-300 flex items-center">
                          <FaGem className="mr-2 text-green-400" size={16} />
                          Your Encryption Key
                        </p>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button
                            onClick={() => setShowKey(!showKey)}
                            variant="ghost"
                            size="sm"
                          >
                            {showKey ? <MdVisibilityOff size={16} /> : <MdVisibility size={16} />}
                          </Button>
                        </motion.div>
                      </div>
                      
                      <motion.p 
                        className="font-mono text-xs text-purple-300 break-all"
                        animate={{ opacity: showKey ? 1 : 0.7 }}
                        transition={{ duration: 0.3 }}
                      >
                        {showKey ? encryptionKey : '•'.repeat(64)}
                      </motion.p>
                      
                      <p className="text-xs text-gray-500 mt-1 flex items-center">
                        <MdShield className="mr-1" size={12} />
                        Keep this key safe - you'll need it to decrypt your files
                      </p>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Files List */}
            <motion.div
              variants={cardVariants}
              whileHover="hover"
            >
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <MdDescription className="mr-2 text-purple-400" size={24} />
                    Your Files ({files.length})
                    <motion.div
                      className="ml-2"
                      animate={{ 
                        rotate: [0, 360],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <FaFire className="text-orange-400" size={16} />
                    </motion.div>
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    All files are encrypted and stored on IPFS
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  {files.length === 0 ? (
                    <motion.div 
                      className="text-center py-12"
                      variants={itemVariants}
                    >
                      <motion.div
                        animate={{ 
                          y: [0, -10, 0],
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <CircleStackIcon className="mx-auto mb-4 text-gray-500" width={48} height={48} />
                      </motion.div>
                      <p className="text-gray-400">No files uploaded yet</p>
                      <p className="text-sm text-gray-500">Upload your first file to get started</p>
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
                            className="flex items-center justify-between p-4 bg-black/30 rounded-lg hover:bg-black/40 transition-colors relative overflow-hidden group"
                            initial={{ x: -100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 100, opacity: 0, scale: 0.8 }}
                            transition={{ type: "spring", stiffness: 100, damping: 15 }}
                            layout
                            whileHover={{ 
                              scale: 1.02,
                              x: 5
                            }}
                          >
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <motion.div
                                  animate={{ 
                                    rotate: [0, 10, -10, 0],
                                  }}
                                  transition={{ 
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: index * 0.2
                                  }}
                                >
                                  <MdDescription className="text-purple-400" size={20} />
                                </motion.div>
                                {file.encrypted && (
                                  <motion.div
                                    animate={{ 
                                      scale: [1, 1.2, 1],
                                    }}
                                    transition={{ 
                                      duration: 1.5,
                                      repeat: Infinity,
                                    }}
                                  >
                                    <MdLock className="text-green-400" size={16} />
                                  </motion.div>
                                )}
                              </div>
                              
                              <div>
                                <motion.p 
                                  className="text-white font-medium"
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                >
                                  {file.name}
                                </motion.p>
                                <motion.div 
                                  className="flex items-center space-x-4 text-sm text-gray-400"
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1 + 0.1 }}
                                >
                                  <span className="flex items-center">
                                    <MdDataUsage className="mr-1" size={12} />
                                    {formatFileSize(file.size)}
                                  </span>
                                  <span className="flex items-center">
                                    <MdAccessTime className="mr-1" size={12} />
                                    {formatDate(file.timestamp)}
                                  </span>
                                  <span className="font-mono text-xs flex items-center">
                                    <FaCube className="mr-1" size={10} />
                                    {file.cid.slice(0, 8)}...{file.cid.slice(-8)}
                                  </span>
                                </motion.div>
                              </div>
                            </div>
                            
                            <motion.div 
                              className="flex items-center space-x-2"
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 + 0.2 }}
                            >
                              <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Button
                                  onClick={() => copyCID(file.cid)}
                                  variant="ghost"
                                  size="sm"
                                  title="Copy CID"
                                >
                                  <MdContentCopy size={16} />
                                </Button>
                              </motion.div>
                              
                              <motion.div
                                whileHover={{ scale: 1.1, rotate: -5 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Button
                                  onClick={() => downloadFile(file)}
                                  variant="ghost"
                                  size="sm"
                                  title="Download & Decrypt"
                                >
                                  <MdDownload size={16} />
                                </Button>
                              </motion.div>
                              
                              <motion.div
                                whileHover={{ scale: 1.1, rotate: 10 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Button
                                  onClick={() => deleteFile(file.id)}
                                  variant="ghost"
                                  size="sm"
                                  title="Delete"
                                  className="text-red-400 hover:text-red-300"
                                >
                                  <MdDelete size={16} />
                                </Button>
                              </motion.div>
                            </motion.div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {/* Loading Overlay */}
        <AnimatePresence>
          {isUploading && (
            <motion.div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center relative overflow-hidden"
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 50 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <div>
                  <motion.div
                    className="rounded-full h-12 w-12 border-4 border-purple-400 border-t-transparent mx-auto mb-4"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  
                  <motion.p 
                    className="text-white text-lg mb-2"
                    animate={{ opacity: [1, 0.7, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    Encrypting and uploading files...
                  </motion.p>
                  
                  <motion.p 
                    className="text-gray-300 text-sm flex items-center justify-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <FaMagic className="mr-2" />
                    This may take a moment
                  </motion.p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ByteVaultDashboard;
