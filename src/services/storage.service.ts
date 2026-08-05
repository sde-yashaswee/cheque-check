import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export const StorageService = {
  async uploadChequeImage(file: File) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
    const filePath = `cheques/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('cheque-images')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('cheque-images')
      .getPublicUrl(filePath)

    return publicUrl
  }
}
