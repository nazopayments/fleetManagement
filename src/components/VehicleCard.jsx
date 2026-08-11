/**
 * VehicleCard.jsx
 * Clickable vehicle tile in the Dashboard grid.
 */
import { useMemo } from 'react'
import { formatRand, getWeeklyCycle, getWeekKey, calculateMaintenanceBalance } from '../data/sampleData.js'

const parse = (v) => {
  const n = parseFloat(String(v).replace(/[^0-9.]/g, ''))
  return isNaN(n) ? 0 : n
}

export default function VehicleCard({ vehicle, onSelect, animationDelay = 0, weekOffset = 0, onOpenProfile }) {
  const weekKey = getWeekKey(getWeeklyCycle(weekOffset))
  const weeklyData = vehicle.weeks?.[weekKey] || getWeeklyCycle(weekOffset)

  const totalCollected = useMemo(
    () => weeklyData.reduce((sum, d) => sum + parse(d.fare), 0),
    [weeklyData]
  )

  const daysEntered = weeklyData.filter((d) => d.fare !== '').length
  const maintenanceBalance = calculateMaintenanceBalance(vehicle)
  const hasData = totalCollected > 0
  const accentColor = vehicle.color ?? '#3b82f6'

  return (
    <button
      onClick={onSelect}
      id={`vehicle-card-${vehicle.id}`}
      aria-label={`Open tracker for ${vehicle.registration}`}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 0,
        cursor: 'pointer',
        overflow: 'hidden',
        position: 'relative',
        transition: 'transform var(--transition-smooth), box-shadow var(--transition-smooth), border-color var(--transition-smooth)',
        animation: `fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${animationDelay}ms both`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = `0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px ${accentColor}40`
        e.currentTarget.style.borderColor = `${accentColor}60`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'var(--shadow-card)'
        e.currentTarget.style.borderColor = 'var(--color-border)'
      }}
    >
      {/* Top accent stripe */}
      <div
        aria-hidden="true"
        style={{
          height: '4px',
          background: `linear-gradient(90deg, ${accentColor}, ${accentColor}80)`,
        }}
      />

      <div style={{ padding: '1.25rem' }}>
        {/* Header row: status dot + registration plate */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: hasData ? '#10b981' : '#475569',
                boxShadow: hasData ? '0 0 8px #10b981' : 'none',
                flexShrink: 0,
              }}
              aria-hidden="true"
            />
            <span
              style={{
                fontSize: '0.72rem', fontWeight: 700,
                color: hasData ? '#10b981' : 'var(--color-text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}
            >
              {hasData ? 'Active' : 'No Data'}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation()
              if (onOpenProfile) onOpenProfile()
            }}
            style={{
              fontSize: '0.75rem', fontWeight: 700, padding: '0.35rem 0.65rem',
              background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)', color: 'var(--color-text-secondary)', cursor: 'pointer',
              transition: 'background var(--transition-fast)'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            Vehicle Profile
          </button>
        </div>

        {/* Registration plate */}
        <div
          style={{
            display: 'inline-block',
            fontFamily: 'var(--font-mono)',
            fontSize: '1.05rem', fontWeight: 800,
            background: 'var(--color-plate)',
            color: 'var(--color-plate-text)',
            padding: '0.35rem 0.85rem',
            borderRadius: '6px',
            border: '2px solid #ca8a04',
            letterSpacing: '0.08em',
            marginBottom: '1rem',
            boxShadow: '0 0 10px rgba(250,204,21,0.25)',
          }}
        >
          {vehicle.registration}
        </div>

        {/* Make & Model */}
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {vehicle.make} {vehicle.model}
          </p>
        </div>
      </div>
    </button>
  )
}
