/**
 * WeeklyTracker.jsx
 * Per-vehicle weekly fare entry, financial breakdown, and validation guardrail.
 */
import { useState, useMemo, useEffect } from 'react'
import { formatRand, getWeeklyCycle, getWeekKey } from '../data/sampleData.js'

// ── Number parsing helper ────────────────────────────────────────
const parse = (v) => {
  const n = parseFloat(String(v).replace(/[^0-9.]/g, ''))
  return isNaN(n) ? 0 : n
}

// ── Reusable amount input with currency prefix ───────────────────
function AmountInput({ value, onChange, id, hasError, disabled = false }) {
  const [focused, setFocused] = useState(false)
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        background: 'var(--color-bg-input)',
        border: `1.5px solid ${hasError ? 'var(--color-border-error)' : focused ? 'var(--color-border-accent)' : 'var(--color-border)'}`,
        borderRadius: 'var(--radius-sm)',
        overflow: 'hidden',
        transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
        boxShadow: hasError
          ? '0 0 0 3px rgba(239,68,68,0.12)'
          : focused
            ? '0 0 0 3px rgba(59,130,246,0.15)'
            : 'none',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <span
        style={{
          padding: '0 0.6rem',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85rem',
          fontWeight: 700,
          color: hasError ? 'var(--color-text-error)' : 'var(--color-text-muted)',
          borderRight: `1px solid ${hasError ? 'var(--color-border-error)' : 'var(--color-border)'}`,
          userSelect: 'none',
          flexShrink: 0,
        }}
        aria-hidden="true"
      >
        R
      </span>
      <input
        id={id}
        type="number"
        min="0"
        step="0.01"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        disabled={disabled}
        placeholder="0.00"
        aria-label="Amount in Rand"
        style={{
          flex: 1,
          padding: '0.55rem 0.6rem',
          background: 'transparent',
          border: 'none',
          color: 'var(--color-text-primary)',
          fontSize: '0.9rem',
          fontFamily: 'var(--font-mono)',
          fontWeight: 600,
          outline: 'none',
          width: '100%',
          minWidth: 0,
        }}
      />
    </div>
  )
}

// ── Summary row in financial breakdown ──────────────────────────
function SummaryField({ label, hint, value, onChange, id, hasError, readOnly = false }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.35rem' }}>
        <label
          htmlFor={id}
          style={{
            fontSize: '0.8rem', fontWeight: 700,
            color: 'var(--color-text-secondary)',
            textTransform: 'uppercase', letterSpacing: '0.06em',
            cursor: readOnly ? 'default' : 'pointer',
          }}
        >
          {label}
        </label>
        {hint && (
          <span style={{ fontSize: '0.73rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
            {hint}
          </span>
        )}
      </div>
      {readOnly ? (
        <div
          style={{
            padding: '0.6rem 0.75rem',
            background: 'rgba(59,130,246,0.07)',
            border: '1.5px solid rgba(59,130,246,0.25)',
            borderRadius: 'var(--radius-sm)',
            fontFamily: 'var(--font-mono)',
            fontSize: '1.05rem',
            fontWeight: 800,
            color: 'var(--color-text-brand)',
          }}
          aria-readonly="true"
        >
          {typeof value === 'number' ? formatRand(value) : value}
        </div>
      ) : (
        <AmountInput id={id} value={value} onChange={onChange} hasError={hasError} />
      )}
    </div>
  )
}

export default function WeeklyTracker({ vehicle, drivers = [], onBack, onSave, weekOffset, setWeekOffset }) {
  const [localWeeks, setLocalWeeks] = useState(vehicle.weeks || { [getWeekKey(vehicle.weeklyData)]: vehicle.weeklyData })

  const currentCycle = useMemo(() => getWeeklyCycle(weekOffset), [weekOffset])
  const currentWeekKey = getWeekKey(currentCycle)
  const weeklyData = localWeeks[currentWeekKey] || currentCycle

  const alloc = vehicle.weekAllocations?.[currentWeekKey]
  const defaultDriverId = drivers.find(d => d.allocatedVehicleId === vehicle.id)?.id || ''
  const [driverId, setDriverId] = useState(alloc?.driverId || defaultDriverId)
  const [installment, setInstallment] = useState(alloc?.installment ?? vehicle.installment ?? 4000)
  const [driverShareRaw, setDriverShareRaw] = useState(alloc?.driverShare !== undefined ? String(alloc.driverShare) : '')
  const [maintenanceRaw, setMaintenanceRaw] = useState(alloc?.maintenance !== undefined ? String(alloc.maintenance) : '')
  
  useEffect(() => {
    const currentAlloc = vehicle.weekAllocations?.[currentWeekKey]
    const defDriver = drivers.find(d => d.allocatedVehicleId === vehicle.id)?.id || ''
    setDriverId(currentAlloc?.driverId || defDriver)
    setInstallment(currentAlloc?.installment ?? vehicle.installment ?? 4000)
    setDriverShareRaw(currentAlloc?.driverShare !== undefined ? String(currentAlloc.driverShare) : '')
    setMaintenanceRaw(currentAlloc?.maintenance !== undefined ? String(currentAlloc.maintenance) : '')
  }, [currentWeekKey, vehicle.weekAllocations, vehicle.installment])
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState(false)

  // Total collected from daily inputs
  const totalCollected = useMemo(
    () => weeklyData.reduce((sum, d) => sum + parse(d.fare), 0),
    [weeklyData]
  )

  // Derived defaults (25% driver share, remainder for maintenance)
  const defaultDriverShare = totalCollected * 0.25
  const driverShare = driverShareRaw === '' ? defaultDriverShare : parse(driverShareRaw)
  const defaultMaintenance = Math.max(0, totalCollected - (parse(installment) + driverShare))
  const maintenance = maintenanceRaw === '' ? defaultMaintenance : parse(maintenanceRaw)

  const totalAllocated = parse(installment) + driverShare + maintenance
  const exceedsTotal = totalAllocated > totalCollected && totalCollected > 0
  const remainder = totalCollected - totalAllocated

  // Check if all 7 days have received an input
  const allDaysPopulated = weeklyData.every(d => d.fare !== undefined && d.fare !== null && d.fare !== '')

  const handleFareChange = (idx, value) => {
    setLocalWeeks((prev) => {
      const currentWeekData = prev[currentWeekKey] || currentCycle
      const nextWeekData = [...currentWeekData]
      nextWeekData[idx] = { ...nextWeekData[idx], fare: value }
      return { ...prev, [currentWeekKey]: nextWeekData }
    })
    // Reset driver/maintenance overrides so they recalculate
    setDriverShareRaw('')
    setMaintenanceRaw('')
    setSaved(false)
  }

  const handleSave = () => {
    if (exceedsTotal) {
      setSaveError(true)
      return
    }
    setSaveError(false)
    const updatedVehicle = {
      ...vehicle,
      weeks: localWeeks,
      weekAllocations: {
        ...(vehicle.weekAllocations || {}),
        [currentWeekKey]: {
          driverId,
          installment: parse(installment),
          driverShare,
          maintenance
        }
      },
      weeklyData: localWeeks[getWeekKey(getWeeklyCycle(0))] || getWeeklyCycle(0),
      installment: parse(installment),
      driverSharePct: totalCollected > 0 ? (driverShare / totalCollected) * 100 : 25,
    }
    onSave(updatedVehicle)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg-base)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Header ── */}
      <header
        style={{
          background: 'var(--color-bg-surface)',
          borderBottom: '1px solid var(--color-border)',
          padding: '0 2rem',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backdropFilter: 'blur(12px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            id="back-btn"
            onClick={onBack}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              background: 'transparent',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text-secondary)',
              fontSize: '0.85rem', fontWeight: 600,
              padding: '0.45rem 0.85rem',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border-accent)'
              e.currentTarget.style.color = 'var(--color-text-primary)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)'
              e.currentTarget.style.color = 'var(--color-text-secondary)'
            }}
          >
            ← Back
          </button>
          <div
            aria-hidden="true"
            style={{ width: '1px', height: '24px', background: 'var(--color-border)' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '10px', height: '10px',
                borderRadius: '50%',
                background: vehicle.color ?? '#3b82f6',
                boxShadow: `0 0 8px ${vehicle.color ?? '#3b82f6'}`,
              }}
              aria-hidden="true"
            />
            <h1
              style={{
                fontSize: '0.95rem', fontWeight: 700,
                color: 'var(--color-text-primary)',
              }}
            >
              Weekly Tracker
            </h1>
          </div>
        </div>

        {/* Reg plate */}
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '1rem', fontWeight: 800,
            background: 'var(--color-plate)',
            color: 'var(--color-plate-text)',
            padding: '0.4rem 1rem',
            borderRadius: 'var(--radius-sm)',
            letterSpacing: '0.08em',
            border: '2px solid #ca8a04',
            boxShadow: '0 0 12px rgba(250,204,21,0.3)',
          }}
          aria-label={`Vehicle registration: ${vehicle.registration}`}
        >
          {vehicle.registration}
        </div>
      </header>

      {/* ── Content ── */}
      <main style={{ flex: 1, padding: '2rem', maxWidth: '960px', margin: '0 auto', width: '100%' }}>

        {/* Vehicle info banner */}
        <div
          className="animate-fadeIn"
          style={{
            marginBottom: '2rem',
            padding: '1.25rem 1.5rem',
            background: 'var(--color-bg-surface)',
            border: `1px solid ${vehicle.color ?? 'var(--color-border)'}30`,
            borderLeft: `4px solid ${vehicle.color ?? '#3b82f6'}`,
            borderRadius: 'var(--radius-md)',
            display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Vehicle</span>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '0.1rem' }}>
              {vehicle.make} {vehicle.model}
            </div>
          </div>
          <div
            aria-hidden="true"
            style={{ width: '1px', height: '36px', background: 'var(--color-border)' }}
          />
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Cycle</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.1rem' }}>
              <button
                onClick={() => setWeekOffset(o => o - 1)}
                aria-label="Previous Week"
                style={{
                  background: 'transparent', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-text-primary)', cursor: 'pointer', padding: '0.1rem 0.4rem',
                  fontSize: '0.85rem'
                }}
              >
                &larr;
              </button>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                {weeklyData[0]?.dateLabel} → {weeklyData[weeklyData.length - 1]?.dateLabel}
                <span style={{ marginLeft: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>(Wed–Tue, 7 days)</span>
              </div>
              <button
                onClick={() => setWeekOffset(o => o + 1)}
                aria-label="Next Week"
                style={{
                  background: 'transparent', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-text-primary)', cursor: 'pointer', padding: '0.1rem 0.4rem',
                  fontSize: '0.85rem'
                }}
              >
                &rarr;
              </button>
            </div>
          </div>
          <div
            aria-hidden="true"
            style={{ width: '1px', height: '36px', background: 'var(--color-border)' }}
          />
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total Collected</span>
            <div
              style={{
                fontSize: '1.2rem', fontWeight: 800,
                color: totalCollected > 0 ? 'var(--color-text-success)' : 'var(--color-text-muted)',
                fontFamily: 'var(--font-mono)',
                marginTop: '0.1rem',
              }}
            >
              {formatRand(totalCollected)}
            </div>
          </div>
        </div>

        {/* ── Daily Fare Table ── */}
        <section aria-labelledby="daily-fares-heading" style={{ marginBottom: '2.5rem' }}>
          <h2
            id="daily-fares-heading"
            style={{
              fontSize: '1rem', fontWeight: 700,
              color: 'var(--color-text-primary)',
              marginBottom: '1rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '24px', height: '24px',
                background: 'rgba(59,130,246,0.15)',
                border: '1px solid rgba(59,130,246,0.3)',
                borderRadius: '6px',
                fontSize: '0.75rem', fontWeight: 800,
                color: 'var(--color-brand)',
              }}
            >1</span>
            Daily Check-In Fares
          </h2>

          <div
            style={{
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
            }}
          >
            {/* Table header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1.2fr 2.2fr',
                gap: '0',
                padding: '0.65rem 1.25rem',
                background: 'var(--color-bg-elevated)',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              {['Day', 'Date (DD/MM)', 'Check-In Fare (R)'].map((col) => (
                <div
                  key={col}
                  style={{
                    fontSize: '0.72rem', fontWeight: 700,
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                  }}
                >
                  {col}
                </div>
              ))}
            </div>

            {/* Data rows */}
            {weeklyData.map((day, idx) => {
              const isToday = day.date.toDateString() === new Date().toDateString()
              return (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1.2fr 2.2fr',
                    gap: '0',
                    padding: '0.7rem 1.25rem',
                    borderBottom: idx < weeklyData.length - 1 ? '1px solid var(--color-border)' : 'none',
                    background: isToday ? 'rgba(59,130,246,0.04)' : idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                    transition: 'background var(--transition-fast)',
                    alignItems: 'center',
                  }}
                >
                  {/* Day name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {isToday && (
                      <span
                        style={{
                          display: 'inline-block',
                          width: '6px', height: '6px',
                          borderRadius: '50%',
                          background: 'var(--color-brand)',
                          boxShadow: '0 0 6px var(--color-brand)',
                          flexShrink: 0,
                        }}
                        aria-label="Today"
                      />
                    )}
                    <span
                      style={{
                        fontSize: '0.9rem', fontWeight: isToday ? 700 : 500,
                        color: isToday ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                      }}
                    >
                      {day.label}
                    </span>
                    {isToday && (
                      <span
                        style={{
                          fontSize: '0.65rem', fontWeight: 700,
                          background: 'rgba(59,130,246,0.15)',
                          color: 'var(--color-text-brand)',
                          border: '1px solid rgba(59,130,246,0.3)',
                          borderRadius: '4px',
                          padding: '0 0.35rem',
                        }}
                      >
                        TODAY
                      </span>
                    )}
                  </div>

                  {/* Date */}
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.85rem',
                      color: 'var(--color-text-muted)',
                      fontWeight: 500,
                    }}
                  >
                    {day.dateLabel}
                  </div>

                  {/* Fare input */}
                  <div style={{ paddingRight: '1rem' }}>
                    <AmountInput
                      id={`fare-day-${idx}`}
                      value={day.fare}
                      onChange={(val) => handleFareChange(idx, val)}
                    />
                  </div>
                </div>
              )
            })}

            {/* Total row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1.2fr 2.2fr',
                padding: '0.85rem 1.25rem',
                background: 'var(--color-bg-elevated)',
                borderTop: '2px solid var(--color-border)',
                alignItems: 'center',
              }}
            >
              <div style={{ gridColumn: '1 / 3', fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Total Collected Fares
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.15rem', fontWeight: 900,
                  color: totalCollected > 0 ? 'var(--color-text-success)' : 'var(--color-text-muted)',
                }}
                aria-live="polite"
                aria-label={`Total collected: ${formatRand(totalCollected)}`}
              >
                {formatRand(totalCollected)}
              </div>
            </div>
          </div>
        </section>

        {/* ── Financial Breakdown ── */}
        {allDaysPopulated && (
          <section aria-labelledby="breakdown-heading" style={{ marginBottom: '2rem' }}>
          <h2
            id="breakdown-heading"
            style={{
              fontSize: '1rem', fontWeight: 700,
              color: 'var(--color-text-primary)',
              marginBottom: '1rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '24px', height: '24px',
                background: 'rgba(16,185,129,0.15)',
                border: '1px solid rgba(16,185,129,0.3)',
                borderRadius: '6px',
                fontSize: '0.75rem', fontWeight: 800,
                color: '#10b981',
              }}
            >2</span>
            Weekly Financial Breakdown
          </h2>

          <div
            style={{
              background: 'var(--color-bg-surface)',
              border: `1px solid ${exceedsTotal ? 'var(--color-border-error)' : 'var(--color-border)'}`,
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              transition: 'border-color var(--transition-smooth)',
            }}
          >
            {/* Allocation grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '1.25rem',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ gridColumn: '1 / -1', marginBottom: '0.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                  Assigned Driver
                </label>
                <select
                  value={driverId}
                  onChange={e => { setDriverId(e.target.value); setSaved(false) }}
                  style={{ width: '100%', padding: '0.6rem', background: 'var(--color-bg-input)', border: `1.5px solid var(--color-border)`, borderRadius: 'var(--radius-sm)', color: 'var(--color-text-primary)' }}
                >
                  <option value="">Select a driver...</option>
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <SummaryField
                id="installment-input"
                label="Installment"
                hint="Default R4,000"
                value={installment}
                onChange={(v) => { setInstallment(v); setSaved(false) }}
                hasError={exceedsTotal}
              />
              <SummaryField
                id="driver-share-input"
                label="Driver Share"
                hint={`Default 25% = ${formatRand(defaultDriverShare)}`}
                value={driverShareRaw === '' ? defaultDriverShare.toFixed(2) : driverShareRaw}
                onChange={(v) => { setDriverShareRaw(v); setSaved(false) }}
                hasError={exceedsTotal}
              />
              <SummaryField
                id="maintenance-input"
                label="Maintenance"
                hint="Remainder after others"
                value={maintenanceRaw === '' ? defaultMaintenance.toFixed(2) : maintenanceRaw}
                onChange={(v) => { setMaintenanceRaw(v); setSaved(false) }}
                hasError={exceedsTotal}
              />
            </div>

            {/* Allocation summary */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1rem',
                padding: '1rem',
                background: 'var(--color-bg-elevated)',
                borderRadius: 'var(--radius-md)',
                marginBottom: exceedsTotal || remainder !== 0 ? '1rem' : 0,
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>
                  Total Allocated
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 900,
                    color: exceedsTotal ? 'var(--color-text-error)' : 'var(--color-text-primary)',
                  }}
                  aria-live="polite"
                >
                  {formatRand(totalAllocated)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>
                  {remainder >= 0 ? 'Unallocated Remainder' : 'Over-Allocation'}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 900,
                    color: remainder < 0
                      ? 'var(--color-text-error)'
                      : remainder > 0
                        ? 'var(--color-text-warning)'
                        : 'var(--color-text-success)',
                  }}
                  aria-live="polite"
                >
                  {formatRand(Math.abs(remainder))}
                </div>
              </div>
            </div>

            {/* Visual allocation bar */}
            {totalCollected > 0 && (
              <div style={{ marginBottom: exceedsTotal ? '1rem' : 0 }}>
                <div
                  style={{
                    height: '8px',
                    background: 'var(--color-bg-input)',
                    borderRadius: '999px',
                    overflow: 'hidden',
                  }}
                  role="presentation"
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(100, (totalAllocated / totalCollected) * 100)}%`,
                      background: exceedsTotal
                        ? 'var(--color-border-error)'
                        : 'linear-gradient(90deg, #2563eb, #0891b2)',
                      borderRadius: '999px',
                      transition: 'width var(--transition-smooth), background var(--transition-smooth)',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                    {((totalAllocated / totalCollected) * 100).toFixed(1)}% allocated
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                    {formatRand(totalCollected)} total
                  </span>
                </div>
              </div>
            )}

            {/* ── Error Guardrail ── */}
            {exceedsTotal && (
              <div
                role="alert"
                style={{
                  padding: '1rem 1.25rem',
                  background: 'rgba(239,68,68,0.08)',
                  border: '1.5px solid var(--color-border-error)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                  marginTop: '1rem',
                }}
              >
                <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>⚠️</span>
                <div>
                  <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-error)', marginBottom: '0.25rem' }}>
                    Allocation Exceeds Collected Fares
                  </p>
                  <p style={{ fontSize: '0.85rem', color: '#fca5a5', lineHeight: 1.5 }}>
                    Total allocations ({formatRand(totalAllocated)}) exceed total collected fares ({formatRand(totalCollected)}).
                    Adjust amounts before saving.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
        )}

        {/* ── Save Button ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem' }}>
          {saved && (
            <span
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                color: 'var(--color-text-success)',
                fontSize: '0.88rem', fontWeight: 600,
                animation: 'fadeIn 0.3s ease both',
              }}
            >
              <span>✓</span> Saved successfully
            </span>
          )}
          <button
            id="save-submit-btn"
            onClick={handleSave}
            disabled={exceedsTotal || !allDaysPopulated}
            style={{
              padding: '0.9rem 2.5rem',
              background: exceedsTotal || !allDaysPopulated
                ? 'var(--color-bg-elevated)'
                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              border: exceedsTotal || !allDaysPopulated ? '1px solid var(--color-border)' : 'none',
              borderRadius: 'var(--radius-md)',
              color: exceedsTotal || !allDaysPopulated ? 'var(--color-text-muted)' : '#fff',
              fontWeight: 800,
              cursor: exceedsTotal || !allDaysPopulated ? 'not-allowed' : 'pointer',
              transition: 'all var(--transition-fast)',
              boxShadow: exceedsTotal || !allDaysPopulated ? 'none' : '0 4px 16px rgba(5,150,105,0.35)',
            }}
            onMouseOver={(e) => {
              if (!exceedsTotal && allDaysPopulated) {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(5,150,105,0.45)'
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = exceedsTotal || !allDaysPopulated ? 'none' : '0 4px 16px rgba(5,150,105,0.35)'
            }}
            aria-disabled={exceedsTotal || !allDaysPopulated}
          >
            {exceedsTotal ? '⛔ Cannot Save' : !allDaysPopulated ? '📝 Enter All Fares First' : '💾 Save / Submit'}
          </button>
        </div>

      </main>
    </div>
  )
}
