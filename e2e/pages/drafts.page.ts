import { expect, type Page } from '@playwright/test'

export class DraftsPage {
  constructor(private readonly page: Page) {}

  async goto(entity: 'cheque' | 'party' | 'account' = 'cheque') {
    const paths = { cheque: 'cheques', party: 'parties', account: 'accounts' }
    await this.page.goto(`/${paths[entity]}/drafts`)
  }

  async openDraft(title: string) {
    const draftLink = this.page.getByRole('link', { name: title })
    await expect(draftLink).toBeVisible()
    await draftLink.click()
  }
}
