import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app">
      <header className="app-header">
        <h1>Welcome to SlyxUp</h1>
        <p>Your React + TypeScript + Vite app is ready!</p>
      </header>

      <main className="app-main">
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            Count is {count}
          </button>
          <p>
            Edit <code>src/App.tsx</code> and save to test HMR
          </p>
        </div>

        <div className="links">
          <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
            React Docs
          </a>
          <a href="https://vitejs.dev" target="_blank" rel="noopener noreferrer">
            Vite Docs
          </a>
          <a href="https://www.typescriptlang.org/" target="_blank" rel="noopener noreferrer">
            TypeScript Docs
          </a>
        </div>
      </main>

      <footer className="app-footer">
        <p>Built with ❤️ using SlyxUp CLI</p>
      </footer>
    </div>
  )
}

export default App
