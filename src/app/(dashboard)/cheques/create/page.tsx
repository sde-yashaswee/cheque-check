'use client'

import { useCreateCheque } from '@/hooks/use-create-cheque'
import { useParties } from '@/hooks/use-parties'
import { useAccounts } from '@/hooks/use-accounts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSearchParams } from 'next/navigation'
import { HugeiconsIcon } from '@hugeicons/react';
import {  ArrowLeft01Icon as ArrowLeft, ArrowRight01Icon as ArrowRight, Tick02Icon as Check, Camera01Icon as Camera, Cancel01Icon as X, ArrowUpRight01Icon as ArrowUpRight, ArrowDownLeft01Icon as ArrowDownLeft, Invoice01Icon as ReceiptText, UserIcon as User, CreditCardIcon as CreditCard, BankIcon as Bank, Delete02Icon as Trash , HashtagIcon as Hash, Calendar03Icon as Calendar, Note01Icon as Note, Loading03Icon } from '@hugeicons/core-free-icons';
import { cn, numberToIndianWords, getSimilarityScore } from '@/lib/utils'
import { useBusiness } from '@/hooks/use-business'
import { Combobox } from '@/components/ui/combobox'
import { EntityAvatar } from '@/components/ui/entity-avatar'
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperSeparator,
  StepperTrigger,
} from '@/components/reui/stepper'
import { useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'
import { toast } from '@/components/ui/toast'
import { logger } from '@/lib/logger'
import { useBanks } from '@/hooks/use-banks'
import { useQueryClient } from '@tanstack/react-query'
import { PartyService } from '@/services/party.service'
import { AccountService } from '@/services/account.service'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { BankSelector } from '@/components/bank-selector'
import { ScanStore } from '@/lib/scan-store'

export default function CreateChequePage() {
  const t = useTranslations('Cheques')
  const tCommon = useTranslations('Common')
  const searchParams = useSearchParams()
  const typeParam = searchParams.get('type')
  const imageUrlParam = searchParams.get('imageUrl')
  const { activeBusiness } = useBusiness()
  const businessId = activeBusiness?.id
  const [isExtracting, setIsExtracting] = useState(false)
  const queryClient = useQueryClient()
  const { data: banks } = useBanks()

  const [unmatchedEntities, setUnmatchedEntities] = useState<{
    payee_name?: string;
    account_name?: string;
    account_number?: string;
    ifsc_code?: string;
    bank_name?: string;
    bank_id?: string;
  } | null>(null)
  
  const [createOptions, setCreateOptions] = useState({
    party: true,
    account: true
  })

  const [isCreatingInline, setIsCreatingInline] = useState(false)

  const {
    form,
    step,
    nextStep,
    prevStep,
    isUploading,
    handleImageUpload,
    isSaving,
    onSubmit,
  } = useCreateCheque(businessId, typeParam)

  const { register, setValue, watch, formState: { errors } } = form

  const { parties } = useParties(businessId)
  const { accounts } = useAccounts(businessId)

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

      if (!response.ok) throw new Error('Failed to extract data')

      const data = await response.json()
      
      if (data.amount !== null) setValue('amount', data.amount)
      if (data.cheque_number !== null) setValue('cheque_number', data.cheque_number)
      if (data.cheque_date !== null) setValue('cheque_date', data.cheque_date)
      
      let matchedPartyId = ''
      let matchedAccountId = ''

      const chequeType = watch('type')

      // Enhanced fuzzy match for party using similarity score
      const partyNameToMatch = chequeType === 'Inward' ? data.account_name : data.payee_name

      if (partyNameToMatch && parties) {
        const matches = parties.map(p => ({
          id: p.id,
          name: p.name,
          score: getSimilarityScore(p.name, partyNameToMatch)
        })).sort((a, b) => b.score - a.score)

        if (matches[0]?.score >= 0.7) {
          matchedPartyId = matches[0].id
          setValue('party_id', matchedPartyId)
        }
      }

      // Enhanced fuzzy match for account using similarity score (on account name)
      if (chequeType === 'Outward' && accounts) {
        const ocrAcc = data.account_number?.replace(/\D/g, '') || ''
        
        const exactNumMatch = accounts.find(a => {
          const localAcc = a.account_number.replace(/\D/g, '')
          return ocrAcc.length >= 4 && localAcc.length >= 4 && 
                 (localAcc.endsWith(ocrAcc) || ocrAcc.endsWith(localAcc))
        })

        if (exactNumMatch) {
          matchedAccountId = exactNumMatch.id
          setValue('account_id', matchedAccountId)
        } else if (data.account_name) {
          const nameMatches = accounts.map(a => ({
            id: a.id,
            score: getSimilarityScore(a.account_name, data.account_name!)
          })).sort((a, b) => b.score - a.score)

          if (nameMatches[0]?.score >= 0.7) {
            matchedAccountId = nameMatches[0].id
            setValue('account_id', matchedAccountId)
          }
        }
      }

      if ((partyNameToMatch && !matchedPartyId) || (chequeType === 'Outward' && data.account_number && !matchedAccountId)) {
        let matchedBankId = ''
        if (data.bank_name && banks) {
          const normalizedOcr = data.bank_name.toLowerCase().replace(/\s/g, '').replace(/bank/g, '')
          const matchedBank = banks.find(b => {
            const normalizedBank = b.name.toLowerCase().replace(/\s/g, '').replace(/bank/g, '')
            return normalizedOcr.includes(normalizedBank) || normalizedBank.includes(normalizedOcr)
          })
          if (matchedBank) matchedBankId = matchedBank.id
        }

        setUnmatchedEntities({
          payee_name: !matchedPartyId ? partyNameToMatch || undefined : undefined,
          account_name: data.account_name,
          account_number: !matchedAccountId ? data.account_number : undefined,
          ifsc_code: data.ifsc_code,
          bank_name: data.bank_name,
          bank_id: matchedBankId
        })
        
        setCreateOptions({
          party: !matchedPartyId,
          account: chequeType === 'Outward' && !matchedAccountId
        })
      }

      if (toastId) toast.close(toastId)
      toast.add({
        title: tCommon('success'),
        description: "Cheque details extracted successfully",
        type: 'success',
      })
    } catch (error) {
      logger.error('OCR Error', error)
      if (toastId) toast.close(toastId)
      toast.add({
        title: tCommon('error'),
        description: "Failed to extract cheque details",
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
        const newParty = await PartyService.create({
          business_id: businessId,
          name: unmatchedEntities.payee_name,
          contact: '0000000000',
          color: '#34C759',
          email: null,
          address: null,
          notes: 'Automatically Generated from Cheque Scan'
        })
        partyId = newParty.id
        setValue('party_id', partyId)
        queryClient.invalidateQueries({ queryKey: ['parties', businessId] })
      }

      if (createOptions.account && unmatchedEntities.account_number) {
        if (!unmatchedEntities.bank_id) {
          toast.add({ 
            title: tCommon('error'), 
            description: 'Please select a bank for the new account', 
            type: 'error' 
          })
          setIsCreatingInline(false)
          return
        }
        const newAccount = await AccountService.create({
          business_id: businessId,
          bank_id: unmatchedEntities.bank_id,
          account_name: unmatchedEntities.account_name || unmatchedEntities.payee_name || 'Scanned Account',
          account_number: unmatchedEntities.account_number,
          ifsc_code: unmatchedEntities.ifsc_code || null,
          color: '#007AFF',
          notes: 'Automatically Generated from Cheque Scan'
        } as any)
        accountId = newAccount.id
        setValue('account_id', accountId)
        queryClient.invalidateQueries({ queryKey: ['accounts', businessId] })
      }

      setUnmatchedEntities(null)
      toast.add({ 
        title: tCommon('success'), 
        description: 'Entities created and selected', 
        type: 'success' 
      })
    } catch (error) {
      logger.error('Inline creation error', error)
      toast.add({ 
        title: tCommon('error'), 
        description: 'Failed to create entities', 
        type: 'error' 
      })
    } finally {
      setIsCreatingInline(false)
    }
  }

  const partyOptions = parties?.map(p => ({ 
    label: p.name, 
    value: p.id,
    color: (p as any).color,
    icon: (p as any).icon,
    imageUrl: (p as any).avatar_url
  })) || []

  const accountOptions = accounts?.map(b => ({ 
    label: `${(b as any).bank?.name || 'Bank'} (${b.account_number.slice(-4)})`, 
    value: b.id,
    color: (b as any).color,
    icon: (b as any).icon,
    imageUrl: (b as any).bank?.logo_url
  })) || []

  const selectedParty = parties?.find(p => p.id === watch('party_id'))
  const selectedAccount = accounts?.find(a => a.id === watch('account_id'))

  const amountInWords = numberToIndianWords(watch('amount') || 0)

  return (
    <div className="max-w-2xl space-y-8 pb-20">
      <div className="flex flex-col gap-4">
        <Stepper
          value={step}
          className="w-full max-w-xl mx-auto space-y-8"
          indicators={{
            completed: <HugeiconsIcon icon={Check} className="size-3.5" />,
          }}
        >
          <div className="flex items-start gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevStep}
              disabled={step === 1}
              className="rounded-full h-8 w-8 shrink-0 hover:bg-canvas-parchment"
            >
              <HugeiconsIcon icon={ArrowLeft} className="h-4 w-4"/>
            </Button>

            <StepperNav className="gap-3 flex-1">
              {[
                { title: "Scan & Details", icon: <HugeiconsIcon icon={Camera} className="size-4" /> },
                { title: "Entities", icon: <HugeiconsIcon icon={User} className="size-4" /> },
                { title: "Dates & Review", icon: <HugeiconsIcon icon={ReceiptText} className="size-4" /> }
              ].map((s, index) => (
                <StepperItem
                  key={index}
                  step={index + 1}
                  className="relative flex-1 items-center"
                >
                  <StepperTrigger className="flex grow flex-col items-center justify-center gap-2.5">
                    <StepperIndicator className="data-[state=inactive]:border-border data-[state=inactive]:text-muted-foreground data-[state=completed]:bg-success size-8 border-2 data-[state=completed]:text-white data-[state=inactive]:bg-background z-10">
                      {s.icon}
                    </StepperIndicator>
                  </StepperTrigger>
                  {3 > index + 1 && (
                    <StepperSeparator className="group-data-[state=completed]/step:bg-success absolute inset-x-0 left-[50%] top-4 m-0 w-full z-0" />
                  )}
                </StepperItem>
              ))}
            </StepperNav>

            <Button
              variant="ghost"
              size="icon"
              onClick={nextStep}
              disabled={step === 3 || (step === 1 && !watch('amount')) || (step === 2 && (!watch('party_id') || !watch('account_id')))}
              className="rounded-full h-8 w-8 shrink-0 hover:bg-canvas-parchment"
            >
              <HugeiconsIcon icon={ArrowRight} className="h-4 w-4"/>
            </Button>
          </div>
        </Stepper>
      </div>

      <form onSubmit={onSubmit} className="space-y-8">
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            {/* Cheque Photo Widget */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">{t('photo')}</Label>
              <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 bg-canvas-parchment/30 min-h-[140px] transition-colors hover:bg-canvas-parchment/50 border-primary/10 relative overflow-hidden">
                {watch('image_url' as any) ? (
                  <div className="relative w-full aspect-video rounded-sm overflow-hidden border">
                    <img src={watch('image_url' as any)} alt="Cheque" className="w-full h-full object-cover"/>
                    <button 
                      type="button"
                      onClick={() => setValue('image_url', null)}
                      className="absolute top-3 right-3 p-2 bg-black/60 text-white rounded-full hover:bg-black transition-colors z-20"
                    >
                      <HugeiconsIcon icon={X} className="h-4 w-4"/>
                    </button>
                    {isExtracting && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 z-10 animate-in fade-in duration-300">
                        <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <HugeiconsIcon icon={Loading03Icon} className="h-7 w-7 animate-spin" />
                        </div>
                        <div className="text-center">
                          <span className="text-sm font-semibold text-primary block">{t('loading')}</span>
                          <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-semibold">{t('photoInstruction')}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <label className="flex flex-col items-center gap-3 cursor-pointer py-6 w-full relative">
                    <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {isUploading || isExtracting ? (
                        <HugeiconsIcon icon={Loading03Icon} className="h-7 w-7 animate-spin" />
                      ) : (
                        <HugeiconsIcon icon={Camera} className="h-7 w-7"/>
                      )}
                    </div>
                    <div className="text-center">
                      <span className="text-sm font-semibold text-primary block">
                        {(isUploading || isExtracting) ? t('loading') : t('scanUpload')}
                      </span>
                      <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-semibold">{t('photoInstruction')}</p>
                    </div>
                    <input 
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const url = await handleImageUpload(file)
                          if (url) extractData(url)
                        }
                      }}
                      disabled={isUploading || isExtracting}
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">{t('type')}</Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setValue('type', 'Outward')}
                  className={cn(
                    "flex flex-col items-center justify-center gap-3 rounded-lg p-6 border transition-all active:scale-95",
                    watch('type') === 'Outward' 
                      ? "bg-primary/5 border-primary"
                      : "bg-card border-primary/5"
                  )}
                >
                  <div className={cn(
                    "h-12 w-12 rounded-sm flex items-center justify-center transition-colors",
                    watch('type') === 'Outward' ? "bg-primary text-white": "bg-primary/10 text-primary"
                  )}>
                    <HugeiconsIcon icon={ArrowUpRight} className="h-6 w-6"/>
                  </div>
                  <span className={cn(
                    "font-semibold text-xs uppercase tracking-wider",
                    watch('type') === 'Outward' ? "text-primary": "text-muted-foreground"
                  )}>{t('issued')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setValue('type', 'Inward')}
                  className={cn(
                    "flex flex-col items-center justify-center gap-3 rounded-lg p-6 border transition-all active:scale-95",
                    watch('type') === 'Inward' 
                      ? "bg-green-500/5 border-green-500"
                      : "bg-card border-primary/5"
                  )}
                >
                  <div className={cn(
                    "h-12 w-12 rounded-sm flex items-center justify-center transition-colors",
                    watch('type') === 'Inward' ? "bg-green-500 text-white": "bg-green-500/10 text-green-600"
                  )}>
                    <HugeiconsIcon icon={ArrowDownLeft} className="h-6 w-6"/>
                  </div>
                  <span className={cn(
                    "font-semibold text-xs uppercase tracking-wider",
                    watch('type') === 'Inward' ? "text-green-600": "text-muted-foreground"
                  )}>{t('received')}</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount"className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">{t('amount')}</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-semibold opacity-30">₹</span>
                <Input 
                  id="amount"
                  type="number"
                  {...register('amount', { valueAsNumber: true })} 
                  className="h-16 pl-10 text-3xl font-semibold border-none bg-canvas-parchment rounded-sm"
                />
              </div>
              <div className="flex flex-col gap-1 ml-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{amountInWords}</p>
              </div>
              {errors.amount && <p className="text-xs text-destructive ml-1">{errors.amount.message as string}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cheque_number"className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">{t('chequeNumber')}</Label>
              <Input leftIcon={Hash}  id="cheque_number"{...register('cheque_number')} placeholder={t('chequeNumberPlaceholder')} className="h-12 rounded-sm" />
              {errors.cheque_number && <p className="text-xs text-destructive ml-1">{errors.cheque_number.message as string}</p>}
            </div>
            
            <Button type="button"className="w-full rounded-full h-14 text-lg"onClick={nextStep}>
              {tCommon('continue')} <HugeiconsIcon icon={ArrowRight} className="ml-2 h-5 w-5"/>
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">{t('party')}</Label>
              <Combobox 
                options={partyOptions} 
                value={watch('party_id')} 
                onValueChange={(val) => setValue('party_id', val)} 
                placeholder={t('partyPlaceholder')}
                createUrl="/parties/create"
                createLabel={t('addParty')}
                className="h-14 bg-canvas-parchment border-none rounded-sm"
              />
              {errors.party_id && <p className="text-xs text-destructive ml-1">{errors.party_id.message as string}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">{t('account')}</Label>
              <Combobox 
                options={accountOptions} 
                value={watch('account_id')} 
                onValueChange={(val) => setValue('account_id', val)} 
                placeholder={t('accountPlaceholder')}
                createUrl={`/accounts/create?name=${encodeURIComponent(unmatchedEntities?.account_name || '')}&number=${unmatchedEntities?.account_number || ''}&ifsc=${unmatchedEntities?.ifsc_code || ''}&auto=true`}
                createLabel={t('addAccount')}
                className="h-14 bg-canvas-parchment border-none rounded-sm"
              />
              {errors.account_id && <p className="text-xs text-destructive ml-1">{errors.account_id.message as string}</p>}
            </div>

            <Button type="button"className="w-full rounded-full h-14 text-lg"onClick={nextStep} disabled={!watch('party_id') || !watch('account_id')}>
              {tCommon('continue')} <HugeiconsIcon icon={ArrowRight} className="ml-2 h-5 w-5"/>
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <Label htmlFor="cheque_date"className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">{t('chequeDate')}</Label>
              <Input leftIcon={Calendar}  id="cheque_date"type="date"{...register('cheque_date')} className="h-12 rounded-sm" />
              {errors.cheque_date && <p className="text-xs text-destructive ml-1">{errors.cheque_date.message as string}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="deposit_date"className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">{t('depositDate')}</Label>
              <Input leftIcon={Calendar}  id="deposit_date"type="date"{...register('deposit_date')} className="h-14 bg-canvas-parchment border-none rounded-sm" />
              {errors.deposit_date && <p className="text-xs text-destructive ml-1">{errors.deposit_date.message as string}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes"className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">{t('notes')}</Label>
              <Input leftIcon={Note}  id="notes"{...register('notes')} placeholder={t('notesPlaceholder')} className="h-14 bg-canvas-parchment border-none rounded-sm" />
            </div>

            <div className="rounded-lg bg-primary/5 p-6 space-y-4 border border-primary/10">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={ReceiptText} className="h-3 w-3 text-primary opacity-80"/>
                <h3 className="font-semibold text-primary uppercase tracking-wider text-[10px]">{t('summary')}</h3>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-semibold">{t('amount')}</span>
                <span className="text-xl font-semibold text-primary">₹{Number(watch('amount') || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-semibold">{t('number')}</span>
                <span className="font-semibold font-mono bg-white px-2 py-0.5 rounded border border-primary/10 text-primary">#{watch('cheque_number')}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-semibold">{t('party')}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{selectedParty?.name || '-'}</span>
                  {selectedParty && (
                    <EntityAvatar 
                      name={selectedParty.name} 
                      color={(selectedParty as any).color} 
                      icon={(selectedParty as any).icon} 
                      imageUrl={(selectedParty as any).avatar_url}
                      size="sm"
                    />
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-semibold">{t('account')}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{selectedAccount ? `${(selectedAccount as any).bank?.name || 'Bank'} (${selectedAccount.account_number.slice(-4)})` : '-'}</span>
                  {selectedAccount && (
                    <EntityAvatar 
                      name={(selectedAccount as any).bank?.name || 'Bank'} 
                      color={(selectedAccount as any).color} 
                      icon={(selectedAccount as any).icon} 
                      imageUrl={(selectedAccount as any).bank?.logo_url}
                      size="sm"
                    />
                  )}
                </div>
              </div>
            </div>

            <Button type="submit"className="w-full rounded-full h-14 text-lg"disabled={isSaving}>
              {isSaving ? tCommon('saving') : t('saveAction')} <HugeiconsIcon icon={Check} className="ml-2 h-5 w-5"/>
            </Button>
          </div>
        )}
      </form>

      <Dialog open={!!unmatchedEntities} onOpenChange={(open) => !open && setUnmatchedEntities(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Entities Found</DialogTitle>
            <DialogDescription>
              We found a party and/or account on the cheque that aren&apos;t in your business. Would you like to create them?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {unmatchedEntities?.payee_name && (
              <div className="flex items-start gap-3 p-3 rounded-lg border bg-canvas-parchment/30">
                <Checkbox 
                  id="create-party" 
                  checked={createOptions.party} 
                  onCheckedChange={(checked) => setCreateOptions(prev => ({ ...prev, party: !!checked }))}
                  className="mt-1"
                />
                <div className="flex-1 grid gap-1.5 leading-none">
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={User} className="h-3 w-3 text-primary" />
                    <label htmlFor="create-party" className="text-sm font-semibold">
                      Create Party: {unmatchedEntities.payee_name}
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground">This name was extracted as the payee.</p>
                </div>
              </div>
            )}

            {unmatchedEntities?.account_number && (
              <div className="space-y-4 p-3 rounded-lg border bg-canvas-parchment/30">
                <div className="flex items-start gap-3">
                  <Checkbox 
                    id="create-account" 
                    checked={createOptions.account} 
                    onCheckedChange={(checked) => setCreateOptions(prev => ({ ...prev, account: !!checked }))}
                    className="mt-1"
                  />
                  <div className="flex-1 grid gap-1.5 leading-none">
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon icon={CreditCard} className="h-3 w-3 text-primary" />
                      <label htmlFor="create-account" className="text-sm font-semibold">
                        Create Account: {unmatchedEntities.account_name || unmatchedEntities.account_number}
                      </label>
                    </div>
                    <p className="text-xs text-muted-foreground">Extracted account details from the scan.</p>
                  </div>
                </div>

                {createOptions.account && (
                  <div className="space-y-2 ml-7">
                    <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <HugeiconsIcon icon={Bank} className="h-3 w-3" />
                      Select Bank
                    </Label>
                    <BankSelector 
                      value={unmatchedEntities.bank_id} 
                      onValueChange={(val) => setUnmatchedEntities(prev => prev ? ({ ...prev, bank_id: val }) : null)}
                      className="h-10 text-sm rounded-xl"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="flex-row gap-3">
            <Button variant="ghost" className="flex-1 rounded-full gap-2" onClick={() => setUnmatchedEntities(null)}>
              <HugeiconsIcon icon={Trash} className="h-4 w-4" />
              Skip
            </Button>
            <Button className="flex-1 rounded-full gap-2" onClick={handleInlineCreate} disabled={isCreatingInline || (!createOptions.party && !createOptions.account)}>
              {isCreatingInline ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
              ) : (
                <HugeiconsIcon icon={Check} className="h-4 w-4" />
              )}
              {isCreatingInline ? 'Creating...' : 'Create Selected'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
