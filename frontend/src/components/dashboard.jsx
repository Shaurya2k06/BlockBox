import React, { useState, useEffect, useRef } from 'react';
import { useWeb3 } from '../hooks/useWeb3';
import ipfsService from '../services/ipfsService';
import encryptionService from '../services/encryptionService';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { 
  Upload, 
  Download, 
  Lock, 
  Unlock, 
  Wallet, 
  FileText, 
  Shield, 
  Trash2, 
  Copy,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Clock,
  HardDrive,
  ArrowLeft
} from 'lucide-react';

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

  // Load user files from localStorage (simulate blockchain/IPFS retrieval)
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
          encryptedData: encryptedData, // In production, only store CID
          walletAddress: account
        };
        
        // Update files list
        const updatedFiles = [...files, fileRecord];
        setFiles(updatedFiles);
        updateStats(updatedFiles);
        
        // Save to localStorage (simulate blockchain storage)
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => onNavigate && onNavigate('landing')}
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-white"
              >
                ← Back to Home
              </Button>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  <Shield className="inline-block mr-3 text-purple-400" size={40} />
                  ByteVault
                </h1>
                <p className="text-gray-300">Secure, decentralized file storage powered by Web3</p>
              </div>
            </div>
            
            {/* Wallet Connection */}
            <div className="flex items-center space-x-4">
              {isConnected ? (
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-300">Connected</p>
                    <p className="text-white font-mono text-sm">
                      {account.slice(0, 6)}...{account.slice(-4)}
                    </p>
                  </div>
                  <Button onClick={handleDisconnectWallet} variant="outline" size="sm">
                    <Wallet className="mr-2" size={16} />
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={handleConnectWallet} 
                  className="bg-purple-600 hover:bg-purple-700"
                  disabled={isConnecting}
                >
                  <Wallet className="mr-2" size={16} />
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Notification */}
        {notification.message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            notification.type === 'success' ? 'bg-green-600/20 text-green-300 border border-green-600/30' :
            notification.type === 'error' ? 'bg-red-600/20 text-red-300 border border-red-600/30' :
            'bg-blue-600/20 text-blue-300 border border-blue-600/30'
          }`}>
            {notification.type === 'success' ? <CheckCircle className="mr-2" size={20} /> :
             notification.type === 'error' ? <AlertCircle className="mr-2" size={20} /> :
             <Clock className="mr-2" size={20} />}
            {notification.message}
          </div>
        )}

        {/* Main Content */}
        {!isConnected ? (
          <div className="text-center py-20">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 max-w-2xl mx-auto">
              <Shield className="mx-auto mb-6 text-purple-400" size={80} />
              <h2 className="text-3xl font-bold text-white mb-4">Welcome to ByteVault</h2>
              <p className="text-gray-300 mb-8 text-lg">
                Connect your wallet to start storing files securely on the decentralized web
              </p>
              <Button 
                onClick={handleConnectWallet} 
                className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-4"
                size="lg"
                disabled={isConnecting}
              >
                <Wallet className="mr-2" size={20} />
                {isConnecting ? 'Connecting...' : 'Connect MetaMask Wallet'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm">Total Files</p>
                      <p className="text-2xl font-bold text-white">{stats.totalFiles}</p>
                    </div>
                    <FileText className="text-purple-400" size={32} />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm">Storage Used</p>
                      <p className="text-2xl font-bold text-white">{formatFileSize(stats.totalSize)}</p>
                    </div>
                    <HardDrive className="text-blue-400" size={32} />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm">Encrypted</p>
                      <p className="text-2xl font-bold text-white">{stats.encryptedFiles}</p>
                    </div>
                    <Lock className="text-green-400" size={32} />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm">Last Activity</p>
                      <p className="text-sm text-white">
                        {stats.lastActivity ? formatDate(stats.lastActivity) : 'None'}
                      </p>
                    </div>
                    <Clock className="text-yellow-400" size={32} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Upload Section */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Upload className="mr-2 text-purple-400" size={24} />
                  Upload Files
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Files are encrypted locally before being uploaded to IPFS
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-purple-400 transition-colors"
                    >
                      <div className="text-center">
                        <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                        <p className="text-gray-300">Click to select files or drag and drop</p>
                        <p className="text-sm text-gray-500">All files will be encrypted locally</p>
                      </div>
                    </label>
                  </div>
                  
                  {/* Encryption Key Display */}
                  <div className="bg-black/30 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-300">Your Encryption Key</p>
                      <Button
                        onClick={() => setShowKey(!showKey)}
                        variant="ghost"
                        size="sm"
                      >
                        {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                      </Button>
                    </div>
                    <p className="font-mono text-xs text-purple-300 break-all">
                      {showKey ? encryptionKey : '•'.repeat(64)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Keep this key safe - you'll need it to decrypt your files
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Files List */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <FileText className="mr-2 text-purple-400" size={24} />
                  Your Files ({files.length})
                </CardTitle>
                <CardDescription className="text-gray-300">
                  All files are encrypted and stored on IPFS
                </CardDescription>
              </CardHeader>
              <CardContent>
                {files.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="mx-auto mb-4 text-gray-500" size={48} />
                    <p className="text-gray-400">No files uploaded yet</p>
                    <p className="text-sm text-gray-500">Upload your first file to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-4 bg-black/30 rounded-lg hover:bg-black/40 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <FileText className="text-purple-400" size={20} />
                            {file.encrypted && <Lock className="text-green-400" size={16} />}
                          </div>
                          <div>
                            <p className="text-white font-medium">{file.name}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-400">
                              <span>{formatFileSize(file.size)}</span>
                              <span>{formatDate(file.timestamp)}</span>
                              <span className="font-mono text-xs">
                                {file.cid.slice(0, 8)}...{file.cid.slice(-8)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => copyCID(file.cid)}
                            variant="ghost"
                            size="sm"
                            title="Copy CID"
                          >
                            <Copy size={16} />
                          </Button>
                          <Button
                            onClick={() => downloadFile(file)}
                            variant="ghost"
                            size="sm"
                            title="Download & Decrypt"
                          >
                            <Download size={16} />
                          </Button>
                          <Button
                            onClick={() => deleteFile(file.id)}
                            variant="ghost"
                            size="sm"
                            title="Delete"
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Loading Overlay */}
        {isUploading && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
              <p className="text-white text-lg">Encrypting and uploading files...</p>
              <p className="text-gray-300 text-sm">This may take a moment</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ByteVaultDashboard;