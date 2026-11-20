export const TRANSITIONS = {
  CREATED: ['PAID', 'CANCELED'],
  PAID: ['PREPARING', 'CANCELED'],
  PREPARING: ['FULFILLED', 'CANCELED'],
  FULFILLED: [],
  CANCELED: [],
}
export const isTerminal = (s) => (TRANSITIONS[s] ?? []).length === 0 && s in TRANSITIONS

export function getAllowedTransitions(status, role, isOwner) {
  const next = TRANSITIONS[status] ?? []
  if (role === 'admin') return [...next]
  if (role === 'customer' && isOwner && status === 'CREATED') return ['CANCELED']
  return []
}
export const canTransition = (from, to, role, isOwner) => getAllowedTransitions(from, role, isOwner).includes(to)
