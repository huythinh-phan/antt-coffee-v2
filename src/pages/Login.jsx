import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'


export default function Login(){
    const { state, dispatch } = useApp()
    const [username, setUsername] = useState('admin')
    const [password, setPassword] = useState('admin')
    const nav = useNavigate()
    useEffect(()=>{ if(state.user) nav('/') },[state.user])
    return (
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow p-6 card">
        <h1 className="text-xl font-bold mb-4">Đăng nhập</h1>
        <div className="space-y-3">
        <div><label className="text-sm">Tài khoản</label><input value={username} onChange={e=>setUsername(e.target.value)} className="w-full border rounded p-2 text-white" /></div>
        <div><label className="text-sm">Mật khẩu</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full border rounded p-2 text-white" /></div>
        {state.error && <div className="text-red-600 text-sm">{state.error}</div>}
        <button onClick={()=>dispatch({type:'LOGIN', username, password})} className="w-full py-2 rounded bg-neutral-900 text-white">Đăng nhập</button>
        </div>
        </div>
    )
}