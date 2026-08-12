/**
 * App.jsx – Root component & client-side router
 * Manages: auth state, vehicle list, and page navigation.
 */
import { useState, useCallback, useEffect } from 'react'
import { LoginScreen, RegisterScreen, ForgotPasswordScreen } from './pages/auth/AuthFlow.jsx'
import Dashboard from './pages/Dashboard.jsx'
import WeeklyTracker from './pages/WeeklyTracker.jsx'
import DriversPage from './pages/DriversPage.jsx'
import VehicleProfile from './pages/VehicleProfile.jsx'
import { apiFetch, getAuthToken } from './api.js'

const VIEWS = {
  LOGIN: 'login',
  REGISTER: 'register',
  FORGOT: 'forgot',
  DASHBOARD: 'dashboard',
  TRACKER: 'tracker',
  DRIVERS: 'drivers',
  VEHICLE_PROFILE: 'vehicle_profile',
}

export default function App() {
  const [view, setView] = useState(VIEWS.LOGIN)
  const [currentUser, setCurrentUser] = useState(null)
  const [vehicles, setVehicles] = useState([])
  const [drivers, setDrivers] = useState([])
  const [selectedVehicleId, setSelectedVehicleId] = useState(null)
  const [weekOffset, setWeekOffset] = useState(0)
  const [isLoadingData, setIsLoadingData] = useState(false)

  const loadBackendData = useCallback(async () => {
    setIsLoadingData(true)
    try {
      const [vehiclesData, driversData] = await Promise.all([
        apiFetch('/api/vehicles'),
        apiFetch('/api/drivers')
      ])
      setVehicles(vehiclesData)
      setDrivers(driversData)
    } catch (err) {
      console.error('Failed to load data', err)
    } finally {
      setIsLoadingData(false)
    }
  }, [])

  const handleLogin = useCallback((userData) => {
    setCurrentUser(userData)
    loadBackendData()
    setView(VIEWS.DASHBOARD)
  }, [loadBackendData])

  // Try to auto-login if token exists (in a real app, you'd fetch the user profile)
  // For POC, if they have a token, we just let them hit the dashboard.
  useEffect(() => {
    if (getAuthToken()) {
      loadBackendData()
      setView(VIEWS.DASHBOARD)
    }
  }, [loadBackendData])

  const handleSelectVehicle = useCallback((vehicleId) => {
    setSelectedVehicleId(vehicleId)
    setView(VIEWS.TRACKER)
  }, [])

  const handleOpenProfile = useCallback((vehicleId) => {
    setSelectedVehicleId(vehicleId)
    setView(VIEWS.VEHICLE_PROFILE)
  }, [])

  const handleOpenDrivers = useCallback(() => {
    setView(VIEWS.DRIVERS)
  }, [])

  const handleAddVehicle = useCallback(async (vehicleData) => {
    try {
      const newVehicle = await apiFetch('/api/vehicles', {
        method: 'POST',
        body: JSON.stringify({
          make_model: `${vehicleData.make} ${vehicleData.model}`.trim(),
          registration: vehicleData.registration,
          default_installment: 4000
        })
      })
      // The backend doesn't return full nested structures for POC, so we map it
      setVehicles((prev) => [...prev, {
        ...newVehicle,
        weeks: {},
        weeklyData: [],
        driverSharePct: 25,
        weekAllocations: {}
      }])
    } catch (err) {
      console.error('Failed to add vehicle', err)
      alert(err.message)
    }
  }, [])

  const handleBackToDashboard = useCallback(() => {
    setSelectedVehicleId(null)
    setView(VIEWS.DASHBOARD)
  }, [])

  const handleUpdateVehicle = useCallback((updatedVehicle) => {
    setVehicles((prev) =>
      prev.map((v) => (v.id === updatedVehicle.id ? updatedVehicle : v))
    )
  }, [])

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) ?? null

  return (
    <>
      {view === VIEWS.LOGIN && <LoginScreen onLogin={handleLogin} onNavRegister={() => setView(VIEWS.REGISTER)} onNavForgot={() => setView(VIEWS.FORGOT)} />}
      {view === VIEWS.REGISTER && <RegisterScreen onLogin={handleLogin} onNavLogin={() => setView(VIEWS.LOGIN)} />}
      {view === VIEWS.FORGOT && <ForgotPasswordScreen onLogin={handleLogin} onNavLogin={() => setView(VIEWS.LOGIN)} />}
      {view === VIEWS.DASHBOARD && (
        <Dashboard
          user={currentUser}
          vehicles={vehicles}
          onSelectVehicle={handleSelectVehicle}
          onAddVehicle={handleAddVehicle}
          onUpdateVehicle={handleUpdateVehicle}
          onOpenDrivers={handleOpenDrivers}
          onOpenProfile={handleOpenProfile}
          weekOffset={weekOffset}
          setWeekOffset={setWeekOffset}
          isLoading={isLoadingData}
        />
      )}
      {view === VIEWS.TRACKER && selectedVehicle && (
        <WeeklyTracker
          vehicle={selectedVehicle}
          drivers={drivers}
          onBack={handleBackToDashboard}
          onSave={handleUpdateVehicle}
          weekOffset={weekOffset}
          setWeekOffset={setWeekOffset}
        />
      )}
      {view === VIEWS.DRIVERS && (
        <DriversPage
          drivers={drivers}
          setDrivers={setDrivers}
          vehicles={vehicles}
          onBack={handleBackToDashboard}
        />
      )}
      {view === VIEWS.VEHICLE_PROFILE && selectedVehicle && (
        <VehicleProfile
          vehicle={selectedVehicle}
          onBack={handleBackToDashboard}
          onSave={handleUpdateVehicle}
        />
      )}
    </>
  )
}
