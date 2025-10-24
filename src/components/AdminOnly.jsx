import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'


export default function AdminOnly({ children }) {
    const { state } = useApp()
    const nav = useNavigate()
    useEffect(() => { if (!state.user || state.user.role !== 'admin') nav('/login') }, [state.user])
    if (!state.user || state.user.role !== 'admin') return null
    return children
}