/**
 * App.jsx – Root component & client-side router
 * Manages: auth state, vehicle list, and page navigation.
 */
import { useState, useCallback } from 'react'
import LoginScreen from './pages/LoginScreen.jsx'
import Dashboard from './pages/Dashboard.jsx'
import WeeklyTracker from './pages/WeeklyTracker.jsx'
import DriversPage from './pages/DriversPage.jsx'
import VehicleProfile from './pages/VehicleProfile.jsx'
import { SAMPLE_VEHICLES, SAMPLE_DRIVERS } from './data/sampleData.js'

const VIEWS = {
  LOGIN: 'login',
  DASHBOARD: 'dashboard',
  TRACKER: 'tracker',
  DRIVERS: 'drivers',
  VEHICLE_PROFILE: 'vehicle_profile',
}

export default function App() {
  const [view, setView] = useState(VIEWS.LOGIN)
  const [currentUser, setCurrentUser] = useState(null)
  const [vehicles, setVehicles] = useState(SAMPLE_VEHICLES)
  const [drivers, setDrivers] = useState(SAMPLE_DRIVERS)
  const [selectedVehicleId, setSelectedVehicleId] = useState(null)
  const [weekOffset, setWeekOffset] = useState(0)

  const handleLogin = useCallback((userData) => {
    setCurrentUser(userData)
    setView(VIEWS.DASHBOARD)
  }, [])

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

  const handleAddVehicle = useCallback((vehicle) => {
    setVehicles((prev) => [...prev, vehicle])
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
      {view === VIEWS.LOGIN && <LoginScreen onLogin={handleLogin} />}
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
