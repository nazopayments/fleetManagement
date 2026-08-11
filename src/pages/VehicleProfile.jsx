/**
 * VehicleProfile.jsx
 * Detailed view for a single vehicle: details, documents, and maintenance.
 */
import { useState, useMemo } from 'react'
import { formatRand, calculateMaintenanceBalance } from '../data/sampleData.js'
import ImageModal from '../components/ImageModal.jsx'

export default function VehicleProfile({ vehicle, onBack, onSave }) {
  const [registration, setRegistration] = useState(vehicle.registration || '')
  const [make, setMake] = useState(vehicle.make || '')
  const [model, setModel] = useState(vehicle.model || '')
  const [color, setColor] = useState(vehicle.color || '#3b82f6')
  const [serviceDate, setServiceDate] = useState(vehicle.serviceDate || '')

  const isServiceDue = useMemo(() => {
    if (!serviceDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sDate = new Date(serviceDate);
    sDate.setHours(0, 0, 0, 0);
    return sDate <= today;
  }, [serviceDate]);

  const handleServiceComplete = () => {
    if (!serviceDate) return;
    const date = new Date(serviceDate);
    date.setMonth(date.getMonth() + 3);
    setServiceDate(date.toISOString().split('T')[0]);
  };
  
  const [operatingLicenceImg, setOperatingLicenceImg] = useState(vehicle.operatingLicenceImg || null)
  const [operatingLicenceExpiry, setOperatingLicenceExpiry] = useState(vehicle.operatingLicenceExpiry || '')
  
  const [licenseDiskImg, setLicenseDiskImg] = useState(vehicle.licenseDiskImg || null)
  const [licenseDiskExpiry, setLicenseDiskExpiry] = useState(vehicle.licenseDiskExpiry || '')

  const [previewImage, setPreviewImage] = useState(null)

  const handleFileChange = (setter) => (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setter(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleSaveChanges = () => {
    onSave({
      ...vehicle,
      registration: registration.toUpperCase(),
      make,
      model,
      color,
      serviceDate,
      operatingLicenceImg,
      operatingLicenceExpiry,
      licenseDiskImg,
      licenseDiskExpiry,
    })
    alert('Changes saved successfully!')
  }

  // --- Maintenance Fund Logic ---
  const balance = calculateMaintenanceBalance(vehicle)
  const timeline = useMemo(() => {
    const logs = []
    if (vehicle.weekAllocations) {
      Object.entries(vehicle.weekAllocations).forEach(([weekKey, alloc]) => {
        if (alloc.maintenance && alloc.maintenance > 0) {
          logs.push({
            id: `week-${weekKey}`,
            date: weekKey.split('-')[0], 
            type: 'add',
            amount: alloc.maintenance,
            reason: `Weekly Allocation (${weekKey})`,
            isSystem: true
          })
        }
      })
    }
    if (vehicle.maintenanceLog) {
      vehicle.maintenanceLog.forEach(log => {
        logs.push({ ...log, isSystem: false })
      })
    }
    return logs.reverse()
  }, [vehicle])

  const [type, setType] = useState('withdraw')
  const [amountRaw, setAmountRaw] = useState('')
  const [reason, setReason] = useState('')
  const [receiptBase64, setReceiptBase64] = useState(null)

  const handleAddTransaction = (e) => {
    e.preventDefault()
    const amount = parseFloat(amountRaw.replace(/[^0-9.]/g, ''))
    if (isNaN(amount) || amount <= 0 || !reason) return

    const newLog = {
      id: `log-${Date.now()}`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }),
      type,
      amount,
      reason,
      receiptImg: receiptBase64
    }

    onSave({
      ...vehicle,
      registration: registration.toUpperCase(),
      make, model, color, serviceDate, 
      operatingLicenceImg, operatingLicenceExpiry, 
      licenseDiskImg, licenseDiskExpiry,
      maintenanceLog: [...(vehicle.maintenanceLog || []), newLog]
    })
    
    setAmountRaw('')
    setReason('')
    setReceiptBase64(null)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-base)', display: 'flex', flexDirection: 'column' }}>
      <header style={{ background: 'var(--color-bg-surface)', borderBottom: '1px solid var(--color-border)', padding: '0 2rem', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(12px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={onBack} style={{ background: 'transparent', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-primary)', cursor: 'pointer', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
            &larr; Back to Dashboard
          </button>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Vehicle Profile: {vehicle.registration}</h2>
        </div>
        <button onClick={handleSaveChanges} style={{ padding: '0.6rem 1.2rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, cursor: 'pointer' }}>
          Save Changes
        </button>
      </header>
      
      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Left Column: Details & Documents */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Details */}
          <section style={{ background: 'var(--color-bg-surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--color-text-primary)' }}>Vehicle Details</h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.4rem' }}>Registration</label>
                <input type="text" value={registration} onChange={e => setRegistration(e.target.value)} style={{ width: '100%', padding: '0.6rem', background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: '#fff', fontFamily: 'var(--font-mono)' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.4rem' }}>Make</label>
                  <input type="text" value={make} onChange={e => setMake(e.target.value)} style={{ width: '100%', padding: '0.6rem', background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.4rem' }}>Model</label>
                  <input type="text" value={model} onChange={e => setModel(e.target.value)} style={{ width: '100%', padding: '0.6rem', background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: '#fff' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.4rem' }}>Accent Color</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ width: '40px', height: '40px', border: 'none', background: 'transparent', cursor: 'pointer' }} />
                    <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>{color}</span>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.4rem' }}>Service Date</label>
                  <input type="date" value={serviceDate} onChange={e => setServiceDate(e.target.value)} style={{ width: '100%', padding: '0.6rem', background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '0.8rem' }} />
                  {isServiceDue && (
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>
                      <input type="checkbox" checked={false} onChange={handleServiceComplete} style={{ cursor: 'pointer' }} />
                      Service Complete (+3 Months)
                    </label>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Documents */}
          <section style={{ background: 'var(--color-bg-surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--color-text-primary)' }}>Documents</h3>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div style={{ background: 'var(--color-bg-base)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.8rem' }}>Operating Licence</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Expiry Date:</label>
                  <input type="date" value={operatingLicenceExpiry} onChange={e => setOperatingLicenceExpiry(e.target.value)} style={{ padding: '0.4rem', background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '0.8rem' }} />
                </div>
                <input type="file" accept="image/*" onChange={handleFileChange(setOperatingLicenceImg)} style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }} />
                {operatingLicenceImg && <img src={operatingLicenceImg} alt="Operating Licence" onClick={() => setPreviewImage(operatingLicenceImg)} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', cursor: 'pointer', marginTop: '0.5rem' }} />}
              </div>
              <div style={{ background: 'var(--color-bg-base)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.8rem' }}>License Disk</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Expiry Date:</label>
                  <input type="date" value={licenseDiskExpiry} onChange={e => setLicenseDiskExpiry(e.target.value)} style={{ padding: '0.4rem', background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '0.8rem' }} />
                </div>
                <input type="file" accept="image/*" onChange={handleFileChange(setLicenseDiskImg)} style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }} />
                {licenseDiskImg && <img src={licenseDiskImg} alt="License Disk" onClick={() => setPreviewImage(licenseDiskImg)} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', cursor: 'pointer', marginTop: '0.5rem' }} />}
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Maintenance Fund */}
        <section style={{ background: 'var(--color-bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 8rem)' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--color-text-primary)', marginBottom: '1rem' }}>Maintenance Fund</h3>
            <div style={{ background: 'var(--color-bg-base)', padding: '1.5rem', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Current Balance</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: balance < 0 ? '#ef4444' : '#10b981' }}>
                {formatRand(balance)}
              </div>
            </div>
          </div>
          
          <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>Transaction History</h4>
            {timeline.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem 0', fontSize: '0.9rem' }}>No transactions yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {timeline.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'var(--color-bg-base)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{item.date}</span>
                        {item.isSystem && <span style={{ fontSize: '0.6rem', background: '#3b82f6', color: '#fff', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>AUTO</span>}
                      </div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '0.3rem', color: 'var(--color-text-primary)' }}>{item.reason}</div>
                      {item.receiptImg && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <img src={item.receiptImg} alt="Receipt" style={{ height: '40px', borderRadius: '4px', cursor: 'pointer', border: '1px solid var(--color-border)' }} onClick={() => setPreviewImage(item.receiptImg)} />
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: item.type === 'add' ? '#10b981' : '#ef4444' }}>
                      {item.type === 'add' ? '+' : '-'}{formatRand(item.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <form onSubmit={handleAddTransaction} style={{ padding: '1.5rem', borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-base)', borderBottomLeftRadius: 'var(--radius-lg)', borderBottomRightRadius: 'var(--radius-lg)' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>New Transaction</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.3rem' }}>Type</label>
                <select value={type} onChange={e => setType(e.target.value)} style={{ width: '100%', padding: '0.6rem', background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-primary)' }}>
                  <option value="withdraw">Withdraw</option>
                  <option value="add">Add Funds</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.3rem' }}>Amount (R)</label>
                <input type="text" placeholder="e.g. 500" value={amountRaw} onChange={e => setAmountRaw(e.target.value)} required style={{ width: '100%', padding: '0.6rem', background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-primary)' }} />
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.3rem' }}>Reason</label>
              <input type="text" placeholder="e.g. Replaced brake pads" value={reason} onChange={e => setReason(e.target.value)} required style={{ width: '100%', padding: '0.6rem', background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-primary)' }} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.3rem' }}>Receipt Image (Optional)</label>
              <input type="file" accept="image/*" onChange={handleFileChange(setReceiptBase64)} style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }} />
            </div>
            <button type="submit" style={{ width: '100%', padding: '0.75rem', background: type === 'add' ? '#10b981' : '#3b82f6', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, cursor: 'pointer', transition: 'opacity 0.2s' }}>
              Add Transaction
            </button>
          </form>
        </section>

      </main>
      
      <ImageModal src={previewImage} onClose={() => setPreviewImage(null)} />
    </div>
  )
}
