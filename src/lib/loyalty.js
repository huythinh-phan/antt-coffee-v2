import { POINT_UNIT } from './constants.js'
export const pointsFor = (payable) => (Number.isFinite(payable) && payable > 0 ? Math.floor(payable / POINT_UNIT) : 0)
