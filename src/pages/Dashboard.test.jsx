import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Dashboard from './Dashboard'

// Mock the child components to simplify testing
vi.mock('../components/VehicleCard.jsx', () => ({
  default: ({ vehicle }) => <div data-testid="vehicle-card">{vehicle.registration}</div>
}))
vi.mock('../components/AddVehicleModal.jsx', () => ({
  default: () => <div data-testid="add-vehicle-modal">Modal</div>
}))

describe('Dashboard Component', () => {
  const mockVehicles = [
    { id: 1, registration: 'TEST-123', weeks: {} },
    { id: 2, registration: 'TEST-456', weeks: {} }
  ]

  it('renders loading spinner when isLoading is true', () => {
    render(<Dashboard vehicles={[]} isLoading={true} />)
    
    // Check for loading text
    expect(screen.getByText(/Loading Fleet Data.../i)).toBeInTheDocument()
    
    // Stats bar should not be visible while loading
    expect(screen.queryByText(/Total Fleet/i)).not.toBeInTheDocument()
  })

  it('renders stats and vehicles when data is loaded', () => {
    render(
      <Dashboard 
        vehicles={mockVehicles} 
        isLoading={false} 
        weekOffset={0} 
        setWeekOffset={vi.fn()} 
      />
    )
    
    // Stats bar should be visible
    expect(screen.getByText('Total Fleet')).toBeInTheDocument()
    // It should count 2 vehicles
    const statsTwo = screen.getAllByText('2')
    expect(statsTwo.length).toBeGreaterThan(0)
    
    // Vehicle cards should be rendered
    const cards = screen.getAllByTestId('vehicle-card')
    expect(cards).toHaveLength(2)
    expect(screen.getByText('TEST-123')).toBeInTheDocument()
  })

  it('renders empty state when no vehicles exist', () => {
    render(
      <Dashboard 
        vehicles={[]} 
        isLoading={false} 
        weekOffset={0} 
        setWeekOffset={vi.fn()} 
      />
    )
    
    expect(screen.getByText(/No vehicles yet/i)).toBeInTheDocument()
  })
})
