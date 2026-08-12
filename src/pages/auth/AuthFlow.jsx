import { useState, useId } from 'react'
import { setAuthToken } from '../../api'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Generic layout for auth screens
function AuthLayout({ title, subtitle, children, icon }) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden dot-grid" style={{ background: 'var(--color-bg-base)' }}>
      <div className="animate-fadeIn w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black tracking-tight mb-2" style={{ fontFamily: 'var(--font-body)' }}>
            <span className="shimmer-text">FleetTrack</span>
          </h1>
        </div>
        <div className="glass-card p-8 relative" style={{ boxShadow: 'var(--shadow-card)' }}>
          <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '2px', background: 'linear-gradient(90deg, transparent, var(--color-brand), var(--color-accent), transparent)' }} />
          <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>{title}</h2>
          <p className="mb-6 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  )
}

function OtpScreen({ phone, onVerify, onCancel }) {
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Invalid OTP')
      
      // Save the real JWT token
      if (data.token) {
        setAuthToken(data.token)
      }
      
      onVerify(data.user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Verify Phone" subtitle={`Enter the OTP sent to ${phone}`}>
      <form onSubmit={handleSubmit}>
        <div className="mb-5">
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>OTP Code</label>
          <input type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="000000" required maxLength={6} style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--color-bg-input)', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: '1rem', letterSpacing: '0.5em', textAlign: 'center', fontFamily: 'var(--font-mono)' }} />
          {error && <p style={{ color: 'var(--color-text-error)', fontSize: '0.8rem', marginTop: '0.5rem' }}>{error}</p>}
        </div>
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.85rem', background: '#10b981', border: 'none', borderRadius: 'var(--radius-md)', color: '#fff', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '1rem' }}>
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>
        <button type="button" onClick={onCancel} style={{ width: '100%', padding: '0.85rem', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-secondary)', fontWeight: 600, cursor: 'pointer' }}>
          Cancel
        </button>
      </form>
    </AuthLayout>
  )
}

export function LoginScreen({ onLogin, onNavRegister, onNavForgot }) {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showOtp, setShowOtp] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.replace(/\s+/g, '') })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Login failed')
      setShowOtp(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (showOtp) {
    return <OtpScreen phone={phone.replace(/\s+/g, '')} onVerify={onLogin} onCancel={() => setShowOtp(false)} />
  }

  return (
    <AuthLayout title="Sign In" subtitle="Enter your registered cellphone number.">
      <form onSubmit={handleSubmit}>
        <div className="mb-5">
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Cellphone Number</label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="0712345678" required style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--color-bg-input)', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: '1rem' }} />
          {error && <p style={{ color: 'var(--color-text-error)', fontSize: '0.8rem', marginTop: '0.5rem' }}>{error}</p>}
        </div>
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.85rem', background: 'linear-gradient(135deg, #2563eb, #0891b2)', border: 'none', borderRadius: 'var(--radius-md)', color: '#fff', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '1rem' }}>
          {loading ? 'Sending OTP...' : 'Login'}
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
          <button type="button" onClick={onNavForgot} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: 0 }}>Forgot Password?</button>
          <button type="button" onClick={onNavRegister} style={{ background: 'none', border: 'none', color: 'var(--color-brand)', cursor: 'pointer', padding: 0, fontWeight: 600 }}>Create Account</button>
        </div>
      </form>
    </AuthLayout>
  )
}

export function RegisterScreen({ onLogin, onNavLogin }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showOtp, setShowOtp] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone: phone.replace(/\s+/g, '') })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Registration failed')
      setShowOtp(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (showOtp) {
    return <OtpScreen phone={phone.replace(/\s+/g, '')} onVerify={onLogin} onCancel={() => setShowOtp(false)} />
  }

  return (
    <AuthLayout title="Create Account" subtitle="Register a new fleet manager account.">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Full Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Jane Doe" required style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--color-bg-input)', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: '1rem' }} />
        </div>
        <div className="mb-5">
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Cellphone Number</label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="0712345678" required style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--color-bg-input)', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: '1rem' }} />
          {error && <p style={{ color: 'var(--color-text-error)', fontSize: '0.8rem', marginTop: '0.5rem' }}>{error}</p>}
        </div>
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.85rem', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: 'var(--radius-md)', color: '#fff', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '1rem' }}>
          {loading ? 'Sending OTP...' : 'Register'}
        </button>
        <div style={{ textAlign: 'center', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--color-text-muted)' }}>Already have an account? </span>
          <button type="button" onClick={onNavLogin} style={{ background: 'none', border: 'none', color: 'var(--color-brand)', cursor: 'pointer', padding: 0, fontWeight: 600 }}>Sign In</button>
        </div>
      </form>
    </AuthLayout>
  )
}

export function ForgotPasswordScreen({ onLogin, onNavLogin }) {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showOtp, setShowOtp] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      // In a passwordless flow, forgot password is just sending an OTP again
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.replace(/\s+/g, '') })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Recovery failed')
      setShowOtp(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (showOtp) {
    return <OtpScreen phone={phone.replace(/\s+/g, '')} onVerify={onLogin} onCancel={() => setShowOtp(false)} />
  }

  return (
    <AuthLayout title="Account Recovery" subtitle="We'll send an OTP to verify it's you.">
      <form onSubmit={handleSubmit}>
        <div className="mb-5">
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Registered Cellphone</label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="0712345678" required style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--color-bg-input)', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: '1rem' }} />
          {error && <p style={{ color: 'var(--color-text-error)', fontSize: '0.8rem', marginTop: '0.5rem' }}>{error}</p>}
        </div>
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.85rem', background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', borderRadius: 'var(--radius-md)', color: '#fff', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '1rem' }}>
          {loading ? 'Sending OTP...' : 'Send Recovery Code'}
        </button>
        <div style={{ textAlign: 'center', fontSize: '0.85rem' }}>
          <button type="button" onClick={onNavLogin} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: 0 }}>&larr; Back to Sign In</button>
        </div>
      </form>
    </AuthLayout>
  )
}
