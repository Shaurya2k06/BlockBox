import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex flex-col items-center justify-center">
      <div className="flex space-x-8 mb-8">
        <a href="https://vite.dev" target="_blank" className="hover:scale-110 transition-transform">
          <img src={viteLogo} className="logo w-24 h-24" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" className="hover:scale-110 transition-transform">
          <img src={reactLogo} className="logo react w-24 h-24" alt="React logo" />
        </a>
      </div>
      <h1 className="text-6xl font-bold text-white mb-8 text-center">Vite + React</h1>
      <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 shadow-xl">
        <button 
          onClick={() => setCount((count) => count + 1)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 mb-4"
        >
          count is {count}
        </button>
        <p className="text-gray-300 text-center">
          Edit <code className="bg-gray-800 px-2 py-1 rounded text-yellow-300">src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="text-gray-400 mt-8 text-center max-w-md">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  )
}

export default App
