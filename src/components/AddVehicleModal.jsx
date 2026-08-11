/**
 * AddVehicleModal.jsx
 * Modal dialog for adding a new vehicle to the fleet.
 */
import { useState, useEffect, useId } from 'react'

const ACCENT_COLORS = [
  { label: 'Electric Blue', value: '#3b82f6' },
  { label: 'Purple',        value: '#8b5cf6' },
  { label: 'Cyan',          value: '#06b6d4' },
  { label: 'Emerald',       value: '#10b981' },
  { label: 'Amber',         value: '#f59e0b' },
  { label: 'Rose',          value: '#f43f5e' },
]

export default function AddVehicleModal({ onSubmit, onClose }) {
  const [form, setForm] = useState({
    registration: '',
    make: '',
    model: '',
    color: '#3b82f6',
  })
  const [errors, setErrors] = useState({})
  const modalId = useId()

  // Trap focus and handle Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  // Prevent body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const validate = () => {
    const e = {}
    if (!form.registration.trim()) e.registration = 'Registration is required.'
    if (!form.make.trim()) e.make = 'Make is required.'
    if (!form.model.trim()) e.model = 'Model is required.'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    onSubmit(form)
  }

  const set = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }))
    setErrors((prev) => { const n = { ...prev }; delete n[key]; return n })
  }

  const inputStyle = (hasError) => ({
    width: '100%',
    padding: '0.7rem 0.9rem',
    background: 'var(--color-bg-input)',
    border: `1.5px solid ${hasError ? 'var(--color-border-error)' : 'var(--color-border)'}`,
    borderRadius: 'var(--radius-sm)',
    color: 'var(--color-text-primary)',
    fontSize: '0.92rem',
    fontFamily: form.registration ? 'var(--font-mono)' : 'var(--font-body)',
    outline: 'none',
    transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
    boxShadow: hasError ? '0 0 0 3px rgba(239,68,68,0.12)' : 'none',
  })

  const labelStyle = {
    display: 'block',
    fontSize: '0.78rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'var(--color-text-secondary)',
    marginBottom: '0.4rem',
  }

  return (
    /* Backdrop */
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${modalId}-title`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease both',
      }}
    >
      {/* Panel */}
      <div
        style={{
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
          animation: 'fadeIn 0.25s cubic-bezier(0.34,1.56,0.64,1) both',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'var(--color-bg-elevated)',
          }}
        >
          <div>
            <h2
              id={`${modalId}-title`}
              style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}
            >
              Add New Vehicle
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>
              Register a vehicle to your fleet
            </p>
          </div>
          <button
            onClick={onClose}
            id="modal-close-btn"
            aria-label="Close modal"
            style={{
              background: 'transparent',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text-muted)',
              width: '32px', height: '32px',
              cursor: 'pointer',
              fontSize: '1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-text-muted)'; e.currentTarget.style.color = 'var(--color-text-primary)' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-muted)' }}
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

            {/* Registration */}
            <div>
              <label htmlFor={`${modalId}-reg`} style={labelStyle}>Registration Number</label>
              <input
                id={`${modalId}-reg`}
                type="text"
                value={form.registration}
                onChange={set('registration')}
                placeholder="e.g. KB 07 HH GP"
                autoFocus
                autoComplete="off"
                style={{
                  ...inputStyle(!!errors.registration),
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--color-border-accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)' }}
                onBlur={(e) => { if (!errors.registration) { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none' } }}
              />
              {errors.registration && (
                <p role="alert" style={{ color: 'var(--color-text-error)', fontSize: '0.78rem', marginTop: '0.3rem', fontWeight: 500 }}>
                  ⚠ {errors.registration}
                </p>
              )}
            </div>

            {/* Make & Model – side by side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label htmlFor={`${modalId}-make`} style={labelStyle}>Make</label>
                <input
                  id={`${modalId}-make`}
                  type="text"
                  value={form.make}
                  onChange={set('make')}
                  placeholder="e.g. Toyota"
                  autoComplete="off"
                  style={inputStyle(!!errors.make)}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--color-border-accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)' }}
                  onBlur={(e) => { if (!errors.make) { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none' } }}
                />
                {errors.make && (
                  <p role="alert" style={{ color: 'var(--color-text-error)', fontSize: '0.78rem', marginTop: '0.3rem', fontWeight: 500 }}>
                    ⚠ {errors.make}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor={`${modalId}-model`} style={labelStyle}>Model</label>
                <input
                  id={`${modalId}-model`}
                  type="text"
                  value={form.model}
                  onChange={set('model')}
                  placeholder="e.g. Quantum"
                  autoComplete="off"
                  style={inputStyle(!!errors.model)}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--color-border-accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)' }}
                  onBlur={(e) => { if (!errors.model) { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none' } }}
                />
                {errors.model && (
                  <p role="alert" style={{ color: 'var(--color-text-error)', fontSize: '0.78rem', marginTop: '0.3rem', fontWeight: 500 }}>
                    ⚠ {errors.model}
                  </p>
                )}
              </div>
            </div>

            {/* Accent color picker */}
            <div>
              <span style={labelStyle}>Card Accent Colour</span>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {ACCENT_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    aria-label={c.label}
                    aria-pressed={form.color === c.value}
                    onClick={() => setForm((prev) => ({ ...prev, color: c.value }))}
                    style={{
                      width: '32px', height: '32px',
                      borderRadius: '50%',
                      background: c.value,
                      border: form.color === c.value ? '3px solid #fff' : '2px solid transparent',
                      cursor: 'pointer',
                      transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
                      boxShadow: form.color === c.value ? `0 0 0 2px ${c.value}, 0 0 12px ${c.value}80` : 'none',
                      transform: form.color === c.value ? 'scale(1.15)' : 'scale(1)',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              id="modal-cancel-btn"
              style={{
                flex: 1, padding: '0.75rem',
                background: 'transparent',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text-secondary)',
                fontSize: '0.9rem', fontWeight: 600,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-text-muted)'; e.currentTarget.style.color = 'var(--color-text-primary)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-secondary)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              id="modal-add-btn"
              style={{
                flex: 2, padding: '0.75rem',
                background: 'linear-gradient(135deg, #2563eb, #0891b2)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                color: '#fff',
                fontSize: '0.9rem', fontWeight: 700,
                cursor: 'pointer',
                transition: 'all var(--transition-smooth)',
                boxShadow: '0 4px 16px rgba(37,99,235,0.4)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 24px rgba(37,99,235,0.55)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(37,99,235,0.4)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              + Add to Fleet
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
