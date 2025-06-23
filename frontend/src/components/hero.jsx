import React from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Ripple } from "@/components/magicui/ripple"
import { 
  Shield, 
  Upload, 
  ArrowRight,
  Wallet,
  Lock,
  Globe,
  Zap
} from "lucide-react"

function Hero() {
    return (
        <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Ripple Background Effect */}
            <div className="absolute inset-0 z-0">
                <Ripple 
                    mainCircleSize={200}
                    mainCircleOpacity={0.15}
                    numCircles={10}
                    className="opacity-60"
                />
            </div>
            
            {/* Additional centered ripple for depth */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                <Ripple 
                    mainCircleSize={120}
                    mainCircleOpacity={0.1}
                    numCircles={6}
                    className="opacity-80"
                />
            </div>

            {/* Hero Content */}
            <div className="container mx-auto px-4 py-20 text-center relative z-10">
                <div className="max-w-5xl mx-auto">
                    {/* Badge */}
                    <Badge className="mb-6 bg-purple-600/20 text-purple-300 border-purple-600 px-4 py-2 text-sm">
                        🔒 Decentralized • Encrypted • Secure
                    </Badge>

                    {/* Main Heading */}
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-tight">
                        Your Files,
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600">
                            {" "}Your Vault
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                        ByteVault is a secure, decentralized, and encrypted file storage platform powered by Web3. 
                        Take back control of your data with true ownership and privacy.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
                        <Button 
                            size="lg" 
                            className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/30 px-8 py-4 text-lg h-auto"
                        >
                            <Upload className="mr-3 h-6 w-6" />
                            Start Uploading
                        </Button>
                        <Button 
                            size="lg" 
                            variant="outline" 
                            className="border-purple-600 text-purple-300 hover:bg-purple-600/10 px-8 py-4 text-lg h-auto backdrop-blur-sm"
                        >
                            Learn More
                            <ArrowRight className="ml-3 h-6 w-6" />
                        </Button>
                    </div>

                    {/* Feature Highlights */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 group hover:border-purple-600/50 transition-all">
                            <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-600/30 transition-colors">
                                <Lock className="h-6 w-6 text-purple-400" />
                            </div>
                            <h3 className="text-white font-semibold text-lg mb-2">End-to-End Encryption</h3>
                            <p className="text-gray-400 text-sm">Files encrypted locally before upload</p>
                        </div>

                        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 group hover:border-purple-600/50 transition-all">
                            <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-600/30 transition-colors">
                                <Globe className="h-6 w-6 text-purple-400" />
                            </div>
                            <h3 className="text-white font-semibold text-lg mb-2">Decentralized Storage</h3>
                            <p className="text-gray-400 text-sm">Powered by IPFS network</p>
                        </div>

                        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 group hover:border-purple-600/50 transition-all">
                            <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-600/30 transition-colors">
                                <Wallet className="h-6 w-6 text-purple-400" />
                            </div>
                            <h3 className="text-white font-semibold text-lg mb-2">Wallet Control</h3>
                            <p className="text-gray-400 text-sm">Access controlled by your wallet</p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-3xl mx-auto">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                100%
                            </div>
                            <div className="text-gray-400 text-sm">Encrypted</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                0
                            </div>
                            <div className="text-gray-400 text-sm">Data Breaches</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                ∞
                            </div>
                            <div className="text-gray-400 text-sm">Availability</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Web3
                            </div>
                            <div className="text-gray-400 text-sm">Powered</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-10">
                <div className="w-6 h-10 border-2 border-purple-400/50 rounded-full flex justify-center">
                    <div className="w-1 h-3 bg-purple-400 rounded-full mt-2 animate-pulse"></div>
                </div>
            </div>
        </section>
    )
}

export default Hero;