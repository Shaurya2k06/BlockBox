import React from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { VideoText } from "@/components/magicui/video-text"

function Hero({ onNavigate }) {
    return (
        <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Futuristic Gradient Mesh Background */}
            <div className="absolute inset-0 z-0">
                {/* Base gradient with animation */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 animate-gradient-xy"></div>
                
                {/* Animated gradient mesh */}
                <div className="absolute inset-0 opacity-60">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-full blur-3xl animate-pulse-slow animate-float-reverse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse-slow animate-float" style={{animationDelay: '2s'}}></div>
                    <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-gradient-to-r from-purple-500/25 to-pink-500/25 rounded-full blur-2xl animate-pulse-slow animate-spin-slow" style={{animationDelay: '4s'}}></div>
                </div>

                {/* Floating geometric shapes with enhanced animation */}
                <div className="absolute inset-0 overflow-hidden">
                    {[...Array(12)].map((_, i) => (
                        <div
                            key={`shape-${i}`}
                            className={`absolute ${i % 3 === 0 ? 'bg-blue-500/10' : i % 3 === 1 ? 'bg-purple-500/10' : 'bg-cyan-500/10'} ${
                                i % 4 === 0 ? 'rounded-full animate-bounce-slow' : 'rounded-lg rotate-45 animate-spin-slow'
                            } animate-float animate-pulse-slow`}
                            style={{
                                width: `${20 + Math.random() * 40}px`,
                                height: `${20 + Math.random() * 40}px`,
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${i * 0.5}s`,
                                animationDuration: `${15 + Math.random() * 10}s`,
                            }}
                        />
                    ))}
                </div>

                {/* Animated grid overlay */}
                <div className="absolute inset-0 opacity-10 animate-pulse-slow">
                    <div className="h-full w-full bg-[linear-gradient(to_right,#3b82f6_1px,transparent_1px),linear-gradient(to_bottom,#3b82f6_1px,transparent_1px)] animate-slide-grid" 
                         style={{ backgroundSize: '80px 80px' }}>
                    </div>
                </div>

                {/* Additional animated particles */}
                <div className="absolute inset-0">
                    {[...Array(30)].map((_, i) => (
                        <div
                            key={`particle-${i}`}
                            className="absolute w-1 h-1 bg-cyan-400/40 rounded-full animate-twinkle"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 5}s`,
                                animationDuration: `${2 + Math.random() * 3}s`,
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Hero Content with staggered animations */}
            <div className="container mx-auto px-6 py-20 text-center relative z-10">
                <div className="max-w-6xl mx-auto">
                    {/* Premium Badge with entrance animation */}
                    <div className="inline-flex items-center gap-2 mb-8 px-6 py-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-full backdrop-blur-md animate-fade-in-down animate-glow-pulse">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse animate-scale-pulse"></div>
                        <span className="text-blue-300 font-medium text-sm animate-shimmer">🛡️ Enterprise-Grade Security • Blockchain-Powered</span>
                    </div>

                    {/* Hero Heading with staggered entrance */}
                    <div className="mb-12">
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight tracking-tight animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                            <span className="inline-block animate-bounce-in" style={{animationDelay: '0.3s'}}>The</span>{' '}
                            <span className="inline-block animate-bounce-in" style={{animationDelay: '0.4s'}}>Future</span>{' '}
                            <span className="inline-block animate-bounce-in" style={{animationDelay: '0.5s'}}>of</span>
                            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-gradient-x animate-glow-text" style={{animationDelay: '0.6s'}}>
                                Secure Storage
                            </span>
                        </h1>
                        
                        {/* VideoText Enhancement */}
                        <div className="relative h-[100px] md:h-[140px] lg:h-[180px] w-full overflow-hidden mb-6 animate-scale-in" style={{animationDelay: '0.8s'}}>
                            <VideoText 
                                src="https://cdn.pixabay.com/video/2022/02/10/107303-676158761_large.mp4"
                                className="text-4xl md:text-6xl lg:text-7xl font-black tracking-wider animate-glow-text"
                            >
                                BlockBox
                            </VideoText>
                        </div>
                    </div>

                    {/* Enhanced Subtitle with typewriter effect */}
                    <p className="text-lg md:text-xl lg:text-2xl text-gray-300 mb-16 max-w-4xl mx-auto leading-relaxed font-light animate-fade-in-up animate-typewriter" style={{animationDelay: '1s'}}>
                        Revolutionary decentralized file storage with military-grade encryption. 
                        <span className="text-blue-400 font-medium animate-shimmer animate-glow-text">Your data, your rules, your blockchain.</span>
                    </p>

                    {/* Premium CTA Section with hover animations */}
                    <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20 animate-fade-in-up" style={{animationDelay: '1.2s'}}>
                        <Button 
                            size="lg" 
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl shadow-blue-500/25 px-10 py-5 text-lg h-auto rounded-full font-semibold transition-all duration-300 hover:shadow-3xl hover:shadow-blue-500/40 hover:scale-105 animate-pulse-button animate-glow-pulse hover:animate-wiggle"
                            onClick={() => onNavigate && onNavigate('dashboard')}
                        >
                            <svg className="mr-3 h-5 w-5 animate-bounce-gentle" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                            Launch BlockBox
                        </Button>
                        <Button 
                            size="lg" 
                            variant="outline" 
                            className="border-2 border-blue-500/50 text-blue-300 hover:bg-blue-500/10 px-10 py-5 text-lg h-auto rounded-full backdrop-blur-md transition-all duration-300 hover:border-blue-400 hover:shadow-lg font-semibold animate-shimmer-border hover:animate-wiggle"
                        >
                            <svg className="mr-3 h-5 w-5 animate-spin-slow" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                            Watch Demo
                        </Button>
                    </div>

                    {/* Premium Feature Cards with staggered entrance */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {[
                            { delay: '1.4s', icon: 'lock', title: 'Zero-Knowledge Encryption', desc: 'Military-grade AES-256 encryption with client-side key generation. Your files are encrypted before they leave your device.', color: 'blue' },
                            { delay: '1.6s', icon: 'check', title: 'Decentralized Network', desc: 'Built on IPFS with redundant storage across multiple nodes. No single point of failure, guaranteed uptime.', color: 'purple' },
                            { delay: '1.8s', icon: 'wallet', title: 'Web3 Integration', desc: 'Connect with MetaMask, WalletConnect, or any Web3 wallet. Smart contract-based access control.', color: 'cyan' }
                        ].map((feature, index) => (
                            <div key={index} className={`group relative overflow-hidden bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 hover:border-${feature.color}-500/50 transition-all duration-500 hover:transform hover:scale-[1.02] animate-fade-in-up animate-glow-card hover:animate-float-gentle`} style={{animationDelay: feature.delay}}>
                                <div className={`absolute inset-0 bg-gradient-to-br from-${feature.color}-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer-slow`}></div>
                                <div className="relative z-10">
                                    <div className={`w-16 h-16 bg-gradient-to-br from-${feature.color}-500 to-${feature.color}-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 animate-pulse-gentle animate-glow-icon`}>
                                        {feature.icon === 'lock' && (
                                            <svg className="h-8 w-8 text-white animate-wiggle-gentle" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                        {feature.icon === 'check' && (
                                            <svg className="h-8 w-8 text-white animate-bounce-gentle" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        )}
                                        {feature.icon === 'wallet' && (
                                            <svg className="h-8 w-8 text-white animate-spin-gentle" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                    <h3 className="text-white font-bold text-xl mb-4 animate-shimmer">{feature.title}</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed animate-fade-in">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Premium Stats Section with counter animations */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24 max-w-4xl mx-auto animate-fade-in-up" style={{animationDelay: '2s'}}>
                        {[
                            { value: '256', label: 'Bit Encryption', gradient: 'from-blue-400 to-cyan-400', delay: '2.1s' },
                            { value: '99.9%', label: 'Uptime SLA', gradient: 'from-purple-400 to-pink-400', delay: '2.2s' },
                            { value: '∞', label: 'Global Nodes', gradient: 'from-cyan-400 to-blue-400', delay: '2.3s' },
                            { value: 'Web3', label: 'Native', gradient: 'from-green-400 to-emerald-400', delay: '2.4s' }
                        ].map((stat, index) => (
                            <div key={index} className="text-center group cursor-default animate-scale-in" style={{animationDelay: stat.delay}}>
                                <div className={`text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r ${stat.gradient} mb-3 group-hover:scale-110 transition-transform duration-300 animate-count-up animate-glow-text animate-pulse-gentle`}>
                                    {stat.value}
                                </div>
                                <div className="text-gray-400 text-sm font-medium uppercase tracking-wider animate-shimmer">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Enhanced Scroll Indicator with multiple animations */}
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10 animate-fade-in animate-bounce-gentle" style={{animationDelay: '2.5s'}}>
                <div className="flex flex-col items-center animate-bounce">
                    <div className="w-8 h-12 border-2 border-blue-400/60 rounded-full flex justify-center backdrop-blur-sm mb-2 animate-glow-pulse">
                        <div className="w-1.5 h-4 bg-blue-400 rounded-full mt-2 animate-pulse animate-bounce-gentle"></div>
                    </div>
                    <span className="text-blue-400/60 text-xs font-medium uppercase tracking-wider animate-shimmer">Scroll</span>
                </div>
            </div>
        </section>
    )
}

export default Hero;