'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'

export default function Home() {
  const [darkMode, setDarkMode] = useState(false)
  const [token, setToken] = useState('')
  const router = useRouter()
  const { isSignedIn, isLoaded } = useAuth()

  // If already logged in, go straight to dashboard
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/dashboard')
    }
  }, [isLoaded, isSignedIn])

  const handleTokenSubmit = () => {
    if (token.trim()) {
      router.push(`/client/${token.trim()}`)
    }
  }

  const theme = {
    bg: darkMode ? '#0f172a' : '#e8f4fd',
    panel: darkMode ? '#1e293b' : '#ffffff',
    text: darkMode ? '#f1f5f9' : '#1e293b',
    subtext: darkMode ? '#94a3b8' : '#64748b',
    input: darkMode ? '#0f172a' : '#f1f7fd',
    inputBorder: darkMode ? '#334155' : '#cbd5e1',
    accent: '#0ea5e9',
  }

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      backgroundColor: theme.bg,
      transition: 'all 0.3s ease',
      fontFamily: 'sans-serif',
    }}>

      {/* Toggle Button */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        style={{
          position: 'absolute',
          top: '1.5rem',
          left: '1.5rem',
          background: 'none',
          border: 'none',
          fontSize: '1.5rem',
          cursor: 'pointer',
          zIndex: 10,
        }}
      >
        {darkMode ? '🌙' : '☀️'}
      </button>

      {/* Left Side - Branding */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          color: theme.text,
          marginBottom: '1rem',
        }}>
          Review. Annotate. Flow.
        </h1>
        <p style={{
          color: theme.subtext,
          fontSize: '1rem',
          textAlign: 'center',
          maxWidth: '300px',
        }}>
          The centralized bridge for editors and clients to perfect every frame.
        </p>
      </div>

      {/* Right Side - Login Panel */}
      <div style={{
        width: '460px',
        backgroundColor: theme.panel,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '3rem',
        transition: 'all 0.3s ease',
      }}>

        {/* Title */}
        <h2 style={{
          fontSize: '1.8rem',
          fontWeight: 'bold',
          color: theme.text,
          marginBottom: '0.5rem',
        }}>
          Welcome to <span style={{ color: theme.accent }}>Media</span>Flow
        </h2>
        <p style={{
          color: theme.subtext,
          fontSize: '0.9rem',
          marginBottom: '2rem',
          fontStyle: 'italic',
        }}>
          The centralized bridge for editors and clients to perfect every frame.
        </p>

        {/* Login Button */}
        <button
          onClick={() => router.push('/sign-in')}
          style={{
            width: '100%',
            padding: '0.85rem',
            backgroundColor: theme.accent,
            color: '#ffffff',
            border: 'none',
            borderRadius: '999px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '1rem',
          }}
        >
          Login
        </button>

        {/* Sign Up Button */}
        <button
          onClick={() => router.push('/sign-up')}
          style={{
            width: '100%',
            padding: '0.85rem',
            backgroundColor: 'transparent',
            color: theme.text,
            border: `2px solid ${theme.inputBorder}`,
            borderRadius: '999px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '2rem',
          }}
        >
          Sign Up
        </button>

        {/* Divider */}
        <hr style={{ borderColor: theme.inputBorder, marginBottom: '2rem' }} />

        {/* Project Token Section */}
        <p style={{
          color: theme.text,
          fontWeight: '600',
          marginBottom: '0.75rem',
          textAlign: 'center',
        }}>
          Received a Project Token?
        </p>

        <input
          type="text"
          placeholder="Enter Project Token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          style={{
            width: '100%',
            padding: '0.85rem',
            backgroundColor: theme.input,
            border: `1px solid ${theme.inputBorder}`,
            borderRadius: '0.5rem',
            color: theme.text,
            fontSize: '0.95rem',
            marginBottom: '1rem',
            boxSizing: 'border-box',
          }}
        />

        <button
          onClick={handleTokenSubmit}
          style={{
            width: '100%',
            padding: '0.85rem',
            backgroundColor: darkMode ? '#1e3a5f' : '#e2f0fb',
            color: theme.accent,
            border: 'none',
            borderRadius: '999px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Continue
        </button>

      </div>
    </div>
  )
}