import { expect, type Page } from '@playwright/test'

export class TagsPage {
  constructor(private readonly page: Page) {}

  async createTag(name: string) {
    await this.page.goto('/tags/create')
    await this.page.locator('#tag-name').fill(name)
    await this.page.getByTestId('tag-form-submit-button').click()
    await expect(this.page).toHaveURL(/\/tags\/[\w-]+$/)
  }
}
