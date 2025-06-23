import React, { useState } from "react"
import { Dock, DockIcon } from "@/components/magicui/dock"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Shield, 
  Home,
  Star,
  Zap,
  Code,
  User,
  Wallet,
  Github,
  Menu,
  X
} from "lucide-react"

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Desktop Navbar with Dock */}
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 hidden md:block">
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-2xl px-6 py-3 shadow-2xl shadow-purple-600/10">
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-purple-400" />
              <span className="text-lg font-bold text-white">ByteVault</span>
            </div>

            {/* Dock Navigation */}
            <Dock className="bg-transparent border-0 shadow-none">
              <DockIcon className="bg-slate-800/50 hover:bg-purple-600/20 transition-all duration-300">
                <a href="#home" className="flex items-center justify-center w-full h-full">
                  <Home className="h-4 w-4 text-gray-300 hover:text-purple-400 transition-colors" />
                </a>
              </DockIcon>
              
              <DockIcon className="bg-slate-800/50 hover:bg-purple-600/20 transition-all duration-300">
                <a href="#features" className="flex items-center justify-center w-full h-full">
                  <Star className="h-4 w-4 text-gray-300 hover:text-purple-400 transition-colors" />
                </a>
              </DockIcon>
              
              <DockIcon className="bg-slate-800/50 hover:bg-purple-600/20 transition-all duration-300">
                <a href="#how-it-works" className="flex items-center justify-center w-full h-full">
                  <Zap className="h-4 w-4 text-gray-300 hover:text-purple-400 transition-colors" />
                </a>
              </DockIcon>
              
              <DockIcon className="bg-slate-800/50 hover:bg-purple-600/20 transition-all duration-300">
                <a href="#tech-stack" className="flex items-center justify-center w-full h-full">
                  <Code className="h-4 w-4 text-gray-300 hover:text-purple-400 transition-colors" />
                </a>
              </DockIcon>
              
              <DockIcon className="bg-slate-800/50 hover:bg-purple-600/20 transition-all duration-300">
                <a href="#about" className="flex items-center justify-center w-full h-full">
                  <User className="h-4 w-4 text-gray-300 hover:text-purple-400 transition-colors" />
                </a>
              </DockIcon>
              
              <DockIcon className="bg-slate-800/50 hover:bg-purple-600/20 transition-all duration-300">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full h-full">
                  <Github className="h-4 w-4 text-gray-300 hover:text-purple-400 transition-colors" />
                </a>
              </DockIcon>
            </Dock>

            {/* Connect Wallet Button */}
            <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/30 transition-all duration-300">
              <Wallet className="mr-2 h-4 w-4" />
              Connect
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 md:hidden">
        <div className="bg-slate-900/90 backdrop-blur-md border-b border-slate-700/50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-purple-400" />
                <span className="text-lg font-bold text-white">ByteVault</span>
                <Badge className="bg-purple-600/20 text-purple-300 border-purple-600 text-xs">
                  Beta
                </Badge>
              </div>

              {/* Mobile Menu Button */}
              <button 
                className="text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="mt-4 pb-4 border-t border-slate-700/50 pt-4">
                <div className="space-y-3">
                  <a 
                    href="#home" 
                    className="flex items-center space-x-3 text-gray-300 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Home className="h-4 w-4" />
                    <span>Home</span>
                  </a>
                  <a 
                    href="#features" 
                    className="flex items-center space-x-3 text-gray-300 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Star className="h-4 w-4" />
                    <span>Features</span>
                  </a>
                  <a 
                    href="#how-it-works" 
                    className="flex items-center space-x-3 text-gray-300 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Zap className="h-4 w-4" />
                    <span>How It Works</span>
                  </a>
                  <a 
                    href="#tech-stack" 
                    className="flex items-center space-x-3 text-gray-300 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Code className="h-4 w-4" />
                    <span>Tech Stack</span>
                  </a>
                  <a 
                    href="#about" 
                    className="flex items-center space-x-3 text-gray-300 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    <span>About</span>
                  </a>
                  <a 
                    href="https://github.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 text-gray-300 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-all"
                  >
                    <Github className="h-4 w-4" />
                    <span>GitHub</span>
                  </a>
                  
                  <div className="pt-3 border-t border-slate-700/50">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/30">
                      <Wallet className="mr-2 h-4 w-4" />
                      Connect Wallet
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Spacer for mobile navbar */}
      <div className="h-16 md:h-0"></div>
    </>
  )
}

export default Navbar