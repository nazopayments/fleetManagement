/**
 * DriversPage.jsx
 * CRUD page for managing drivers.
 */
import { useState } from 'react'
import { genId } from '../data/sampleData.js'
import ImageModal from '../components/ImageModal.jsx'

export default function DriversPage({ drivers, setDrivers, vehicles, onBack }) {
  const [showModal, setShowModal] = useState(false)
  const [editingDriver, setEditingDriver] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)

  const handleSaveDriver = (driver) => {
    if (editingDriver) {
      setDrivers(prev => prev.map(d => d.id === driver.id ? driver : d))
    } else {
      setDrivers(prev => [...prev, driver])
    }
    setShowModal(false)
    setEditingDriver(null)
  }

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to remove this driver?')) {
      setDrivers(prev => prev.filter(d => d.id !== id))
    }
  }

  const sortedDrivers = [...drivers].sort((a, b) => {
    if (!a.offDate && !b.offDate) return 0;
    if (!a.offDate) return 1;
    if (!b.offDate) return -1;
    return new Date(a.offDate) - new Date(b.offDate);
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-base)', display: 'flex', flexDirection: 'column' }}>
      <header style={{ background: 'var(--color-bg-surface)', borderBottom: '1px solid var(--color-border)', padding: '0 2rem', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(12px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={onBack} style={{ background: 'transparent', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-primary)', cursor: 'pointer', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
            &larr; Back to Dashboard
          </button>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Driver Management</h2>
        </div>
        <button onClick={() => { setEditingDriver(null); setShowModal(true); }} style={{ padding: '0.6rem 1.2rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, cursor: 'pointer' }}>
          + Add Driver
        </button>
      </header>
      
      <main style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', width: '100%', flex: 1 }}>
        {drivers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-xl)' }}>
            <p style={{ color: 'var(--color-text-muted)' }}>No drivers added yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Header Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '120px 2fr 1.5fr 1fr 140px', gap: '1rem', padding: '0 1.5rem', fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              <div>License</div>
              <div>Details</div>
              <div>Assigned Vehicle</div>
              <div>OFF Date</div>
              <div style={{ textAlign: 'right' }}>Actions</div>
            </div>
            {sortedDrivers.map(driver => (
              <div key={driver.id} style={{ display: 'grid', gridTemplateColumns: '120px 2fr 1.5fr 1fr 140px', gap: '1rem', alignItems: 'center', background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem' }}>
                
                {/* Image Thumbnail */}
                <div style={{ flexShrink: 0 }}>
                  {driver.licenseImg ? (
                    <img 
                      src={driver.licenseImg} 
                      alt="Driver License" 
                      onClick={() => setPreviewImage(driver.licenseImg)}
                      style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', cursor: 'pointer' }} 
                    />
                  ) : (
                    <div style={{ width: '120px', height: '80px', background: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: 'var(--color-text-muted)', border: '1px dashed var(--color-border)', textAlign: 'center' }}>
                      No License
                    </div>
                  )}
                </div>

                {/* Details */}
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.4rem 0', color: 'var(--color-text-primary)' }}>{driver.name}</h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', margin: 0 }}>{driver.phone}</p>
                </div>

                {/* Assigned Vehicle */}
                <div>
                  {driver.allocatedVehicleId ? (
                    <p style={{ color: 'var(--color-brand)', fontSize: '0.85rem', fontWeight: 700, margin: 0 }}>
                      {vehicles?.find(v => v.id === driver.allocatedVehicleId)?.registration || 'Unknown'}
                    </p>
                  ) : (
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>None</span>
                  )}
                </div>

                {/* OFF Date */}
                <div>
                  {driver.offDate ? (
                    <span style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)', fontWeight: 600 }}>{new Date(driver.offDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  ) : (
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Not set</span>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button onClick={() => { setEditingDriver(driver); setShowModal(true); }} style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-secondary)', cursor: 'pointer', fontWeight: 600, transition: 'background var(--transition-fast)' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(driver.id)} style={{ padding: '0.5rem 1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-sm)', color: '#ef4444', cursor: 'pointer', fontWeight: 600, transition: 'background var(--transition-fast)' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}>
                    Delete
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </main>

      {showModal && <DriverFormModal driver={editingDriver} vehicles={vehicles} drivers={drivers} onClose={() => setShowModal(false)} onSave={handleSaveDriver} />}
      <ImageModal src={previewImage} onClose={() => setPreviewImage(null)} />
    </div>
  )
}

function DriverFormModal({ driver, vehicles, drivers, onClose, onSave }) {
  const getDefaultOffDate = () => {
    if (driver?.offDate) return driver.offDate;
    if (drivers && drivers.length > 0) {
      const offDates = drivers.map(d => d.offDate).filter(Boolean);
      if (offDates.length > 0) {
        const latestDateStr = offDates.sort((a, b) => new Date(b) - new Date(a))[0];
        const date = new Date(latestDateStr);
        date.setDate(date.getDate() + 7);
        return date.toISOString().split('T')[0];
      }
    }
    return '';
  };

  const [name, setName] = useState(driver?.name || '')
  const [phone, setPhone] = useState(driver?.phone || '')
  const [licenseImg, setLicenseImg] = useState(driver?.licenseImg || null)
  const [allocatedVehicleId, setAllocatedVehicleId] = useState(driver?.allocatedVehicleId || '')
  const [offDate, setOffDate] = useState(getDefaultOffDate())

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setLicenseImg(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      id: driver?.id || genId(),
      name,
      phone,
      licenseImg,
      allocatedVehicleId,
      offDate
    })
  }

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={onClose}>
      <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: '400px', padding: '1.5rem' }} onClick={e => e.stopPropagation()}>
        <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.2rem', fontWeight: 800 }}>{driver ? 'Edit Driver' : 'Add New Driver'}</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.4rem' }}>Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', padding: '0.6rem', background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: '#fff' }} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.4rem' }}>Phone Number</label>
            <input type="text" value={phone} onChange={e => setPhone(e.target.value)} required style={{ width: '100%', padding: '0.6rem', background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: '#fff' }} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.4rem' }}>Assigned Vehicle</label>
            <select value={allocatedVehicleId} onChange={e => setAllocatedVehicleId(e.target.value)} style={{ width: '100%', padding: '0.6rem', background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: '#fff' }}>
              <option value="">-- No Vehicle Assigned --</option>
              {vehicles?.map(v => (
                <option key={v.id} value={v.id}>{v.registration} ({v.make})</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.4rem' }}>OFF Date (Leave Date)</label>
            <input type="date" value={offDate} onChange={e => setOffDate(e.target.value)} required style={{ width: '100%', padding: '0.6rem', background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: '#fff' }} />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.4rem' }}>Driver License Image</label>
            <input type="file" accept="image/*" onChange={handleFileChange} style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }} />
            {licenseImg && <img src={licenseImg} alt="Preview" style={{ marginTop: '1rem', width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--color-border)' }} />}
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '0.6rem 1rem', background: 'transparent', color: 'var(--color-text-secondary)', border: 'none', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ padding: '0.6rem 1.2rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 700, cursor: 'pointer' }}>Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}
