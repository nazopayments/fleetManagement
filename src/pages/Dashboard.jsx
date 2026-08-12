/**
 * Dashboard.jsx
 * Main fleet overview: header with user/date, vehicle grid, add-vehicle modal.
 */
import { useState } from 'react'
import { getTodayFormatted, genId, getWeeklyCycle, getWeekKey } from '../data/sampleData.js'
import VehicleCard from '../components/VehicleCard.jsx'
import AddVehicleModal from '../components/AddVehicleModal.jsx'

export default function Dashboard({ user, vehicles, onSelectVehicle, onAddVehicle, onUpdateVehicle, onOpenDrivers, onOpenProfile, weekOffset, setWeekOffset, isLoading }) {
  const [showModal, setShowModal] = useState(false)
  const today = getTodayFormatted()

  const handleAddVehicle = (formData) => {
    onAddVehicle(formData)
    setShowModal(false)
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
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '36px', height: '36px',
              background: 'linear-gradient(135deg, rgba(59,130,246,0.25), rgba(6,182,212,0.25))',
              border: '1px solid rgba(59,130,246,0.4)',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem',
            }}
            aria-hidden="true"
          >
            🚐
          </div>
          <span
            style={{
              fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.03em',
            }}
            className="shimmer-text"
          >
            FleetTrack
          </span>
        </div>

        {/* Right side: user + date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div
            style={{
              padding: '0.35rem 0.75rem',
              background: 'rgba(59,130,246,0.08)',
              border: '1px solid rgba(59,130,246,0.2)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-text-brand)',
              letterSpacing: '0.05em',
              fontWeight: 600,
            }}
          >
            {today}
          </div>
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.35rem 0.75rem',
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <div
              aria-hidden="true"
              style={{
                width: '28px', height: '28px',
                background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 800, color: '#fff',
                flexShrink: 0,
              }}
            >
              {user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {user?.name ?? 'Fleet Manager'}
            </span>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main style={{ flex: 1, padding: '2rem', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>

        {/* Section title + add button */}
        <div
          style={{
            display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
            marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem',
          }}
        >
          <div>
            <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.3rem' }}>
              FLEET OVERVIEW
            </p>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.03em' }}>
              My Vehicles
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              {vehicles.length} registered vehicle{vehicles.length !== 1 ? 's' : ''} · Select one to track fares
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={onOpenDrivers}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.6rem 1rem', background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                color: 'var(--color-text-primary)', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer'
              }}
            >
              👥 Drivers
            </button>

            {/* Week Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--color-bg-surface)', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <button
                onClick={() => setWeekOffset(o => o - 1)}
                aria-label="Previous Week"
                style={{
                  background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-text-primary)', cursor: 'pointer', padding: '0.2rem 0.5rem',
                }}
              >
                &larr;
              </button>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                {getWeeklyCycle(weekOffset)[0]?.dateLabel} → {getWeeklyCycle(weekOffset)[6]?.dateLabel}
              </div>
              <button
                onClick={() => setWeekOffset(o => o + 1)}
                aria-label="Next Week"
                style={{
                  background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-text-primary)', cursor: 'pointer', padding: '0.2rem 0.5rem',
                }}
              >
                &rarr;
              </button>
            </div>

            <button
            id="add-vehicle-btn"
            onClick={() => setShowModal(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.7rem 1.25rem',
              background: 'linear-gradient(135deg, #2563eb, #0891b2)',
              border: 'none', borderRadius: 'var(--radius-md)',
              color: '#fff', fontSize: '0.88rem', fontWeight: 700,
              cursor: 'pointer',
              transition: 'all var(--transition-smooth)',
              boxShadow: '0 4px 16px rgba(37,99,235,0.35)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 24px rgba(37,99,235,0.5)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(37,99,235,0.35)'
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>+</span>
            Add Vehicle
          </button>
          </div>
        </div>

        {isLoading ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
            <div className="animate-spin" style={{ width: '40px', height: '40px', border: '3px solid rgba(59,130,246,0.2)', borderTopColor: '#3b82f6', borderRadius: '50%', marginBottom: '1rem' }} />
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>Loading Fleet Data...</p>
          </div>
        ) : (
          <>
        {/* Stats bar */}
        <div
          style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem',
            marginBottom: '2.5rem',
          }}
        >
          {[
            { label: 'Total Fleet', value: vehicles.length, icon: '🚐', color: '#3b82f6' },
            { label: 'Active This Week', value: vehicles.filter(v => v.weeks?.[getWeekKey(getWeeklyCycle(weekOffset))]?.some(d => d.fare !== '')).length, icon: '📊', color: '#10b981' },
            { label: 'Pending Input', value: vehicles.filter(v => !(v.weeks?.[getWeekKey(getWeeklyCycle(weekOffset))]?.some(d => d.fare !== ''))).length, icon: '⏳', color: '#f59e0b' },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem 1.25rem',
                display: 'flex', alignItems: 'center', gap: '0.75rem',
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>{stat.icon}</span>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 500, marginTop: '0.1rem' }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Vehicle grid */}
        {vehicles.length === 0 ? (
          <div
            style={{
              textAlign: 'center', padding: '5rem 2rem',
              border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-xl)',
              color: 'var(--color-text-muted)',
            }}
          >
            <p style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🚗</p>
            <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>No vehicles yet</p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.4rem' }}>Click "Add Vehicle" to register your first vehicle.</p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {vehicles.map((vehicle, idx) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onSelect={() => onSelectVehicle(vehicle.id)}
                animationDelay={idx * 80}
                weekOffset={weekOffset}
                onOpenProfile={() => onOpenProfile(vehicle.id)}
              />
            ))}
          </div>
        )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          padding: '1rem 2rem',
          borderTop: '1px solid var(--color-border)',
          textAlign: 'center',
          fontSize: '0.78rem',
          color: 'var(--color-text-muted)',
        }}
      >
        FleetTrack POC · Fleet Management System
      </footer>

      {/* Add Vehicle Modal */}
      {showModal && (
        <AddVehicleModal
          onSubmit={handleAddVehicle}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
