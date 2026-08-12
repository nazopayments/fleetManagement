import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { apiFetch, getAuthToken, setAuthToken, clearAuthToken } from './api'

// Mock global fetch
const originalFetch = global.fetch;

describe('api.js utilities', () => {
  beforeEach(() => {
    localStorage.clear()
    global.fetch = vi.fn()
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('manages auth tokens in localStorage', () => {
    expect(getAuthToken()).toBeNull()
    setAuthToken('test-token-123')
    expect(getAuthToken()).toBe('test-token-123')
    clearAuthToken()
    expect(getAuthToken()).toBeNull()
  })

  it('apiFetch automatically attaches Authorization header if token exists', async () => {
    setAuthToken('my-secret-token')
    
    // Mock successful response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true })
    })

    await apiFetch('/api/test')

    // Verify fetch was called with the right headers
    expect(global.fetch).toHaveBeenCalledTimes(1)
    const callArgs = global.fetch.mock.calls[0]
    expect(callArgs[0]).toMatch(/\/api\/test$/)
    expect(callArgs[1].headers).toHaveProperty('Authorization', 'Bearer my-secret-token')
  })

  it('apiFetch clears token and rethrows on 401 response', async () => {
    setAuthToken('bad-token')
    
    // Mock 401 response
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ detail: 'Unauthorized' })
    })

    await expect(apiFetch('/api/test')).rejects.toThrow('Unauthorized')
    
    // Token should be cleared on 401
    expect(getAuthToken()).toBeNull()
  })
})
