import { STATUS_LABEL } from '../lib/constants.js'

const TONE = {
  CREATED: 'bg-yellow-200 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100',
  PAID: 'bg-blue-200 text-blue-900 dark:bg-blue-900 dark:text-blue-100',
  PREPARING: 'bg-violet-200 text-violet-900 dark:bg-violet-900 dark:text-violet-100',
  FULFILLED: 'bg-green-200 text-green-900 dark:bg-green-900 dark:text-green-100',
  CANCELED: 'bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-100',
}

export default function StatusBadge({ status }) {
  return (
    <span data-testid="order-status" className={`badge ${TONE[status] || 'bg-neutral-200 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'}`}>
      {STATUS_LABEL[status] || status}
    </span>
  )
}
