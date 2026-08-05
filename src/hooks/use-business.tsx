'use client'

import { createContext, useContext, useState, useEffect } from 'react'
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

  const [activeBusiness, setActiveBusiness] = useState<Business | null>(null)

  useEffect(() => {
    if (businesses && businesses.length > 0 && !activeBusiness) {
      setActiveBusiness(businesses[0])
    }
  }, [businesses, activeBusiness])

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
