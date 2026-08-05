'use client'

import { createContext, useContext, useState, useMemo } from 'react'
import { Business } from '@/types'
import { BusinessService } from '@/services/business.service'
import { useQuery } from '@tanstack/react-query'

interface BusinessContextType {
  activeBusiness: Business | null
  setActiveBusiness: (business: Business) => void
  businesses: Business[]
  isLoading: boolean
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined)

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const { data: businesses, isLoading } = useQuery({
    queryKey: ['businesses'],
    queryFn: () => BusinessService.getAll(),
  })

  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null)

  const activeBusiness = useMemo(() => {
    if (!businesses || businesses.length === 0) return null
    if (!selectedBusinessId) return businesses[0]
    return businesses.find(b => b.id === selectedBusinessId) || businesses[0]
  }, [businesses, selectedBusinessId])

  const setActiveBusiness = (business: Business) => {
    setSelectedBusinessId(business.id)
  }

  return (
    <BusinessContext.Provider value={{ 
      activeBusiness, 
      setActiveBusiness, 
      businesses: businesses || [], 
      isLoading 
    }}>
      {children}
    </BusinessContext.Provider>
  )
}

export function useBusiness() {
  const context = useContext(BusinessContext)
  if (context === undefined) {
    throw new Error('useBusiness must be used within a BusinessProvider')
  }
  return context
}
