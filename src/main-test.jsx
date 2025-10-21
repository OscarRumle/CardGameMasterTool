import React from 'react'
import ReactDOM from 'react-dom/client'

// MINIMAL TEST - Just show "Hello World"
function TestApp() {
  return (
    <div style={{ padding: '20px', backgroundColor: 'red', color: 'white' }}>
      <h1>HELLO WORLD - REACT IS WORKING!</h1>
      <p>If you see this, React is fine. The problem is in the app code.</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TestApp />
  </React.StrictMode>,
)
