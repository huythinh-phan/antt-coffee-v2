import { Navigate, useLocation } from 'react-router-dom'
import { useCurrentUser } from '../context/useApp.js'
import Forbidden from './Forbidden.jsx'

export default function ProtectedRoute({ role, children }) {
  const user = useCurrentUser()
  const location = useLocation()
  if (!user) {
    const from = { pathname: location.pathname, search: location.search }
    return <Navigate to="/login" replace state={{ from }} />
  }
  if (role && user.role !== role) return <Forbidden />
  return children
}

