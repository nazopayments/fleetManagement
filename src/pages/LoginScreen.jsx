/**
 * LoginScreen.jsx
 * Clean, dark-mode login with SA phone number validation.
 */
import { useState, useId } from 'react'
import { isValidSAPhone } from '../data/sampleData.js'

const DEMO_USERS = {
  '0712345678': { name: 'Ntokozo Skosana', phone: '0712345678' },
  '+27712345678': { name: 'Ntokozo Skosana', phone: '+27712345678' },
}
const FALLBACK_USER = { name: 'Fleet Manager', phone: '' }

export default function LoginScreen({ onLogin }) {
  const [phone, setPhone] = useState('')
  const [touched, setTouched] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputId = useId()

  const isValid = isValidSAPhone(phone)
  const showError = touched && !isValid

  const handleSubmit = (e) => {
    e.preventDefault()
    setTouched(true)
    if (!isValid) return

    setLoading(true)
    // Simulate brief auth delay for UX realism
    setTimeout(() => {
      const cleaned = phone.replace(/\s+/g, '')
      const user = DEMO_USERS[cleaned] ?? { ...FALLBACK_USER, phone: cleaned }
      onLogin(user)
    }, 700)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden dot-grid"
      style={{ background: 'var(--color-bg-base)' }}
    >
      {/* Ambient glow orbs */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)',
          width: '600px', height: '600px',
          background: 'radial-gradient(ellipse, rgba(59,130,246,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', bottom: '10%', right: '15%',
          width: '400px', height: '400px',
          background: 'radial-gradient(ellipse, rgba(6,182,212,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div className="animate-fadeIn w-full max-w-md px-4">
        {/* Logo / Brand header */}
        <div className="text-center mb-10">
          {/* Icon */}
          <div
            className="inline-flex items-center justify-center mb-6 animate-pulseGlow"
            style={{
              width: '72px', height: '72px',
              background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(6,182,212,0.2))',
              border: '1px solid rgba(59,130,246,0.4)',
              borderRadius: '20px',
            }}
          >
            {/* Minibus taxi SVG icon */}
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none" aria-hidden="true">
              <rect x="3" y="10" width="32" height="16" rx="4" fill="rgba(59,130,246,0.3)" stroke="#3b82f6" strokeWidth="1.5"/>
              <rect x="3" y="10" width="32" height="10" rx="3" fill="rgba(59,130,246,0.15)"/>
              <line x1="14" y1="10" x2="14" y2="26" stroke="#3b82f6" strokeWidth="1" opacity="0.5"/>
              <line x1="24" y1="10" x2="24" y2="26" stroke="#3b82f6" strokeWidth="1" opacity="0.5"/>
              <circle cx="10" cy="26" r="3" fill="#1e40af" stroke="#3b82f6" strokeWidth="1.5"/>
              <circle cx="28" cy="26" r="3" fill="#1e40af" stroke="#3b82f6" strokeWidth="1.5"/>
              <rect x="5" y="12" width="9" height="6" rx="1.5" fill="rgba(6,182,212,0.4)"/>
              <rect x="16" y="12" width="7" height="6" rx="1.5" fill="rgba(6,182,212,0.4)"/>
              <rect x="25" y="12" width="7" height="6" rx="1.5" fill="rgba(6,182,212,0.4)"/>
            </svg>
          </div>

          <h1
            className="text-3xl font-black tracking-tight mb-2"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            <span className="shimmer-text">FleetTrack</span>
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>
            Fleet Management Dashboard
          </p>
        </div>

        {/* Login card */}
        <div
          className="glass-card p-8 relative"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          {/* Top accent line */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute', top: 0, left: '10%', right: '10%', height: '2px',
              background: 'linear-gradient(90deg, transparent, var(--color-brand), var(--color-accent), transparent)',
              borderRadius: '0 0 2px 2px',
            }}
          />

          <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
            Sign In
          </h2>
          <p className="mb-6 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Enter your registered cellphone number to continue.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-5">
              <label
                htmlFor={inputId}
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-secondary)',
                  marginBottom: '0.5rem',
                }}
              >
                Cellphone Number
              </label>

              {/* hint above input (accessible pattern) */}
              <p
                id={`${inputId}-hint`}
                style={{
                  fontSize: '0.78rem',
                  color: 'var(--color-text-muted)',
                  marginBottom: '0.5rem',
                }}
              >
                Format: 07xxxxxxxx or +27xxxxxxxxx
              </p>

              <input
                id={inputId}
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onBlur={() => setTouched(true)}
                placeholder="e.g. 0712 345 678"
                autoComplete="tel"
                aria-describedby={`${inputId}-hint ${showError ? `${inputId}-error` : ''}`}
                aria-invalid={showError ? 'true' : 'false'}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'var(--color-bg-input)',
                  border: `1.5px solid ${showError ? 'var(--color-border-error)' : isValid && touched ? 'var(--color-border-success)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-text-primary)',
                  fontSize: '1rem',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.04em',
                  outline: 'none',
                  transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
                  boxShadow: showError
                    ? '0 0 0 3px rgba(239,68,68,0.15)'
                    : isValid && touched
                      ? '0 0 0 3px rgba(16,185,129,0.15)'
                      : 'none',
                }}
                onFocus={(e) => {
                  if (!showError) {
                    e.target.style.borderColor = 'var(--color-border-accent)'
                    e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.2)'
                  }
                }}
              />

              {showError && (
                <p
                  id={`${inputId}-error`}
                  role="alert"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.375rem',
                    color: 'var(--color-text-error)',
                    fontSize: '0.82rem',
                    marginTop: '0.4rem',
                    fontWeight: 500,
                  }}
                >
                  <span aria-hidden="true">⚠</span>
                  Please enter a valid SA number (07xxxxxxxx or +27xxxxxxxxx).
                </p>
              )}
              {isValid && touched && (
                <p
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.375rem',
                    color: 'var(--color-text-success)',
                    fontSize: '0.82rem',
                    marginTop: '0.4rem',
                    fontWeight: 500,
                  }}
                >
                  <span aria-hidden="true">✓</span> Valid number
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              id="login-btn"
              style={{
                width: '100%',
                padding: '0.85rem',
                background: loading
                  ? 'rgba(59,130,246,0.5)'
                  : 'linear-gradient(135deg, #2563eb, #0891b2)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                color: '#fff',
                fontSize: '0.95rem',
                fontWeight: 700,
                letterSpacing: '0.02em',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all var(--transition-smooth)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(37,99,235,0.4)',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-1px)'
                  e.target.style.boxShadow = '0 6px 28px rgba(37,99,235,0.5)'
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = loading ? 'none' : '0 4px 20px rgba(37,99,235,0.4)'
              }}
            >
              {loading ? (
                <>
                  <span
                    aria-hidden="true"
                    style={{
                      width: '18px', height: '18px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff',
                      borderRadius: '50%',
                      display: 'inline-block',
                      animation: 'spin 0.7s linear infinite',
                    }}
                  />
                  Authenticating…
                </>
              ) : (
                <>
                  <span aria-hidden="true">→</span>
                  Login / Continue
                </>
              )}
            </button>
          </form>

          {/* Demo tip */}
          <div
            style={{
              marginTop: '1.5rem',
              padding: '0.75rem 1rem',
              background: 'rgba(59,130,246,0.06)',
              border: '1px solid rgba(59,130,246,0.15)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
              <span style={{ color: 'var(--color-text-brand)', fontWeight: 600 }}>Demo:</span>{' '}
              Try <span className="font-mono" style={{ color: 'var(--color-text-secondary)' }}>0712345678</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p
          style={{
            textAlign: 'center', marginTop: '2rem',
            fontSize: '0.75rem', color: 'var(--color-text-muted)',
          }}
        >
          POC · v0.1.0 · Fleet Management System
        </p>
      </div>
    </div>
  )
}
