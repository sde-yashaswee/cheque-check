import { useEffect, useState } from 'react'
import { z } from 'zod'
import type { UseFormSetValue, UseFormWatch } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { chequeSchema } from '@/validators'
import { toast } from '@/components/ui/toast'
import { logger } from '@/lib/logger'
import { getSimilarityScore } from '@/lib/utils'
import { partyService } from '@/features/parties/services/party.service'
import { accountService } from '@/features/accounts/services/account.service'
import { queryKeys } from '@/lib/query-keys'
import { ScanStore } from '@/lib/scan-store'
import type { Account, Bank, Party } from '@/types'

type ChequeFormValues = z.infer<typeof chequeSchema>

interface UnmatchedEntities {
  payee_name?: string
  account_name?: string
  account_number?: string
  ifsc_code?: string
  bank_name?: string
  bank_id?: string
}

interface UseOcrExtractionOptions {
  businessId: string | undefined
  imageUrlParam: string | null
  parties: Party[] | undefined
  accounts: Account[] | undefined
  banks: Bank[] | undefined
  watch: UseFormWatch<ChequeFormValues>
  setValue: UseFormSetValue<ChequeFormValues>
  handleImageUpload: (file: File) => Promise<string | null>
}

/** Cheque-scan OCR extraction + fuzzy-matching of the extracted party/account/bank onto existing records. */
export function useOcrExtraction({
  businessId,
  imageUrlParam,
  parties,
  accounts,
  banks,
  watch,
  setValue,
  handleImageUpload,
}: UseOcrExtractionOptions) {
  const t = useTranslations('Cheques')
  const tCommon = useTranslations('Common')
  const queryClient = useQueryClient()

  const [isExtracting, setIsExtracting] = useState(false)
  const [unmatchedEntities, setUnmatchedEntities] =
    useState<UnmatchedEntities | null>(null)
  const [createOptions, setCreateOptions] = useState({
    party: true,
    account: true,
  })
  const [isCreatingInline, setIsCreatingInline] = useState(false)

  const extractData = async (url: string) => {
    if (!url || isExtracting) return

    setIsExtracting(true)
    setValue('image_url', url)

    const toastId = toast.add({
      title: t('scan'),
      description: t('loading'),
      type: 'loading',
    })

    try {
      const response = await fetch('/api/ocr/cheque', {
        method: 'POST',
        body: JSON.stringify({ imageUrl: url }),
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new Error(
          body?.error || `Failed to extract data (${response.status})`,
        )
      }

      const data = await response.json()

      if (data.amount !== null) setValue('amount', data.amount)
      if (data.cheque_number !== null)
        setValue('cheque_number', data.cheque_number)
      if (data.cheque_date !== null) setValue('cheque_date', data.cheque_date)

      let matchedPartyId = ''
      let matchedAccountId = ''

      const chequeType = watch('type')

      // Enhanced fuzzy match for party using similarity score
      const partyNameToMatch =
        chequeType === 'Inward' ? data.account_name : data.payee_name

      if (partyNameToMatch && parties) {
        const matches = parties
          .map((p: Party) => ({
            id: p.id,
            name: p.name,
            score: getSimilarityScore(p.name, partyNameToMatch),
          }))
          .sort(
            (a: { score: number }, b: { score: number }) => b.score - a.score,
          )

        if (matches[0]?.score >= 0.7) {
          matchedPartyId = matches[0].id
          setValue('party_id', matchedPartyId)
        }
      }

      // Enhanced fuzzy match for account using similarity score (on account name)
      if (chequeType === 'Outward' && accounts) {
        const ocrAcc = data.account_number?.replace(/\D/g, '') || ''

        const exactNumMatch = accounts.find((a: Account) => {
          const localAcc = a.account_number.replace(/\D/g, '')
          return (
            ocrAcc.length >= 4 &&
            localAcc.length >= 4 &&
            (localAcc.endsWith(ocrAcc) || ocrAcc.endsWith(localAcc))
          )
        })

        if (exactNumMatch) {
          matchedAccountId = exactNumMatch.id
          setValue('account_id', matchedAccountId)
        } else if (data.account_name) {
          const nameMatches = accounts
            .map((a: Account) => ({
              id: a.id,
              score: getSimilarityScore(a.account_name, data.account_name!),
            }))
            .sort(
              (a: { score: number }, b: { score: number }) => b.score - a.score,
            )

          if (nameMatches[0]?.score >= 0.7) {
            matchedAccountId = nameMatches[0].id
            setValue('account_id', matchedAccountId)
          }
        }
      }

      if (
        (partyNameToMatch && !matchedPartyId) ||
        (chequeType === 'Outward' && data.account_number && !matchedAccountId)
      ) {
        let matchedBankId = ''
        if (data.bank_name && banks) {
          const normalizedOcr = data.bank_name
            .toLowerCase()
            .replace(/\s/g, '')
            .replace(/bank/g, '')
          const matchedBank = banks.find((b) => {
            const normalizedBank = b.name
              .toLowerCase()
              .replace(/\s/g, '')
              .replace(/bank/g, '')
            return (
              normalizedOcr.includes(normalizedBank) ||
              normalizedBank.includes(normalizedOcr)
            )
          })
          if (matchedBank) matchedBankId = matchedBank.id
        }

        setUnmatchedEntities({
          payee_name: !matchedPartyId
            ? partyNameToMatch || undefined
            : undefined,
          account_name: data.account_name,
          account_number: !matchedAccountId ? data.account_number : undefined,
          ifsc_code: data.ifsc_code,
          bank_name: data.bank_name,
          bank_id: matchedBankId,
        })

        setCreateOptions({
          party: !matchedPartyId,
          account: chequeType === 'Outward' && !matchedAccountId,
        })
      }

      if (toastId) toast.close(toastId)
      toast.add({
        title: tCommon('success'),
        description: t('extractionSuccess'),
        type: 'success',
      })
    } catch (error) {
      logger.error('OCR Error', error)
      if (toastId) toast.close(toastId)
      toast.add({
        title: tCommon('error'),
        description: t('extractionFailed'),
        type: 'error',
      })
    } finally {
      setIsExtracting(false)
    }
  }

  useEffect(() => {
    const handlePendingScan = async () => {
      const pendingFile = ScanStore.getFile()
      if (pendingFile) {
        const url = await handleImageUpload(pendingFile)
        if (url) extractData(url)
      }
    }
    handlePendingScan()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (imageUrlParam && !isExtracting) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      extractData(imageUrlParam)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrlParam, parties, accounts, banks, setValue, t, tCommon])

  const handleInlineCreate = async () => {
    if (!unmatchedEntities || !businessId) return
    setIsCreatingInline(true)
    try {
      let partyId = watch('party_id')
      let accountId = watch('account_id')

      if (createOptions.party && unmatchedEntities.payee_name) {
        const newParty = await partyService.create({
          business_id: businessId,
          name: unmatchedEntities.payee_name,
          contact: '0000000000',
          color: '#34C759',
          email: null,
          address: null,
          notes: 'Automatically Generated from Cheque Scan',
        })
        partyId = newParty.id
        setValue('party_id', partyId)
        queryClient.invalidateQueries({
          queryKey: queryKeys.parties.list(businessId),
        })
      }

      if (createOptions.account && unmatchedEntities.account_number) {
        if (!unmatchedEntities.bank_id) {
          toast.add({
            title: tCommon('error'),
            description: t('selectBankForAccount'),
            type: 'error',
          })
          setIsCreatingInline(false)
          return
        }
        const newAccount = await accountService.create({
          business_id: businessId,
          bank_id: unmatchedEntities.bank_id,
          account_name:
            unmatchedEntities.account_name ||
            unmatchedEntities.payee_name ||
            'Scanned Account',
          account_number: unmatchedEntities.account_number,
          ifsc_code: unmatchedEntities.ifsc_code || null,
          color: '#007AFF',
          notes: 'Automatically Generated from Cheque Scan',
        } as any)
        accountId = newAccount.id
        setValue('account_id', accountId)
        queryClient.invalidateQueries({
          queryKey: queryKeys.accounts.list(businessId),
        })
      }

      setUnmatchedEntities(null)
      toast.add({
        title: tCommon('success'),
        description: t('entitiesCreated'),
        type: 'success',
      })
    } catch (error) {
      logger.error('Inline creation error', error)
      toast.add({
        title: tCommon('error'),
        description: t('entitiesCreateFailed'),
        type: 'error',
      })
    } finally {
      setIsCreatingInline(false)
    }
  }

  return {
    isExtracting,
    unmatchedEntities,
    setUnmatchedEntities,
    createOptions,
    setCreateOptions,
    isCreatingInline,
    extractData,
    handleInlineCreate,
  }
}
