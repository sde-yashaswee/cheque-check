'use client'

import { createContext, useContext } from 'react'
import { Profile } from '@/types'
import { profileService } from '@/features/profile/services/profile.service'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface ProfileContextType {
  profile: Profile | null
  isLoading: boolean
  updateProfile: (profile: Partial<Profile>) => Promise<void>
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => profileService.get(),
  })

  const mutation = useMutation({
    mutationFn: (newProfile: Partial<Profile>) =>
      profileService.update(newProfile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })

  const updateProfile = async (newProfile: Partial<Profile>) => {
    await mutation.mutateAsync(newProfile)
  }

  return (
    <ProfileContext.Provider
      value={{
        profile: profile || null,
        isLoading,
        updateProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}
