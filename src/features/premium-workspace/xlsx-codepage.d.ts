declare module 'xlsx/dist/cpexcel.full.mjs' {
  export const version: string
  export const utils: {
    decode(codepage: number, data: unknown): string
    encode(codepage: number, data: string): unknown
  }
}
