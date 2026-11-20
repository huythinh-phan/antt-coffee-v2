import { v4 as uuid } from 'uuid'
export const newId = () => uuid()
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
export function newOrderCode(existing = [], rand = Math.random) {
  for (let t = 0; t < 50; t++) {
    let c = ''
    for (let i = 0; i < 6; i++) c += ALPHABET[Math.floor(rand() * ALPHABET.length)]
    if (!existing.includes(c)) return c
  }
  throw new Error('Cannot generate unique order code')
}
