/**
 * sampleData.js – Pre-populated vehicles and utility helpers
 */

/** Generate a Tuesday-to-Tuesday 8-day cycle starting from the most recent Tuesday */
export function getWeeklyCycle(weekOffset = 0) {
  const today = new Date()
  const dayOfWeek = today.getDay() // 0=Sun, 1=Mon, 2=Tue...
  // Days since last Tuesday (2)
  const daysSinceTuesday = (dayOfWeek + 7 - 2) % 7
  const lastTuesday = new Date(today)
  lastTuesday.setDate(today.getDate() - daysSinceTuesday)
  lastTuesday.setHours(0, 0, 0, 0)

  // Start on Wednesday (lastTuesday + 1)
  const startWednesday = new Date(lastTuesday)
  startWednesday.setDate(lastTuesday.getDate() + 1 + (weekOffset * 7))

  const days = []
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  for (let i = 0; i < 7; i++) {
    const d = new Date(startWednesday)
    d.setDate(startWednesday.getDate() + i)
    days.push({
      label: dayNames[d.getDay()],
      date: d,
      dateLabel: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`,
      fare: '',
    })
  }
  return days
}

export function getWeekKey(cycle) {
  if (!cycle || cycle.length === 0) return '';
  return cycle[0].dateLabel + '-' + cycle[cycle.length - 1].dateLabel;
}

export const SAMPLE_DRIVERS = [
  { id: 'd1', name: 'Sipho Ndlovu', phone: '0712345678', licenseImg: null },
  { id: 'd2', name: 'Thabo Mbeki', phone: '0823456789', licenseImg: null },
];

export const SAMPLE_VEHICLES = [
  {
    id: 'v1',
    registration: 'KB 07 HH GP',
    make: 'Toyota',
    model: 'Quantum',
    color: '#3b82f6',
    weeklyData: getWeeklyCycle(0),
    weeks: { [getWeekKey(getWeeklyCycle(0))]: getWeeklyCycle(0) },
    weekAllocations: {},
    maintenanceLog: [],
    operatingLicenceImg: null,
    licenseDiskImg: null,
    installment: 4000,
    driverSharePct: 25,
    weekHistory: [],
  },
  {
    id: 'v2',
    registration: 'AB 12 BC GP',
    make: 'Toyota',
    model: 'HiAce',
    color: '#8b5cf6',
    weeklyData: getWeeklyCycle(0),
    weeks: { [getWeekKey(getWeeklyCycle(0))]: getWeeklyCycle(0) },
    weekAllocations: {},
    maintenanceLog: [],
    operatingLicenceImg: null,
    licenseDiskImg: null,
    installment: 4000,
    driverSharePct: 25,
    weekHistory: [],
  },
  {
    id: 'v3',
    registration: 'FT 99 NX GP',
    make: 'VW',
    model: 'Crafter',
    color: '#06b6d4',
    weeklyData: getWeeklyCycle(0),
    weeks: { [getWeekKey(getWeeklyCycle(0))]: getWeeklyCycle(0) },
    weekAllocations: {},
    maintenanceLog: [],
    operatingLicenceImg: null,
    licenseDiskImg: null,
    installment: 4000,
    driverSharePct: 25,
    weekHistory: [],
  },
]

/** Format a number as South African Rand */
export function formatRand(amount) {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
  }).format(amount)
}

/** Get today formatted as YYYY/MM/DD */
export function getTodayFormatted() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}/${m}/${day}`
}

/** Validate a South African cellphone number (07xx or +27xx) */
export function isValidSAPhone(phone) {
  const cleaned = phone.replace(/\s+/g, '')
  return /^(07\d{8}|\+27\d{9})$/.test(cleaned)
}

/** Generate a UUID-lite */
export function genId() {
  return `v${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

/** Calculate current maintenance balance from weekly allocations and manual logs */
export function calculateMaintenanceBalance(vehicle) {
  let balance = 0;
  
  if (vehicle.weekAllocations) {
    Object.values(vehicle.weekAllocations).forEach(alloc => {
      balance += (alloc.maintenance || 0);
    });
  }
  
  if (vehicle.maintenanceLog) {
    vehicle.maintenanceLog.forEach(log => {
      if (log.type === 'add') {
        balance += log.amount;
      } else if (log.type === 'withdraw') {
        balance -= log.amount;
      }
    });
  }
  
  return balance;
}
