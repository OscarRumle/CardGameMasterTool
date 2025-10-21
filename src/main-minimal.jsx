import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

function MinimalApp() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-6xl font-bold text-amber-500 mb-4">✅ IT WORKS!</h1>
      <p className="text-xl">If you can see this, React + Tailwind are working!</p>
      <p className="text-zinc-400 mt-4">The problem was in the complex app code, not your setup.</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MinimalApp />
  </React.StrictMode>,
)
