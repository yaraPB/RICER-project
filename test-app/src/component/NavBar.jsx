import React from 'react'
import { NavLink } from 'react-router'
import logo from '../assets/logo.png'
import { useNavigate } from 'react-router'

const NavBar = () => {
  const navigate = useNavigate()
  return (
    <nav className='flex items-center justify-center p-2'>
        <img src={logo} alt="logo" width={50} height={50}
        className='ml-8 left-0 absolute'/>

        <div className="flex gap-4 justify-evenly shadow-md shadow-gray-200 rounded-3xl p-4 w-[400px] text-xl font-bold bg-white">
            <NavLink to="/" className=''>Home</NavLink>
            <NavLink to="/dashboard" className=''>Dashboard</NavLink>
            <NavLink to="/register" className=''>Register</NavLink>
        </div>

        <button className='mr-8 right-0 absolute bg-orange-400 p-2 rounded-2xl text-amber-50 shadow-md shadow-gray-200' onClick={() => navigate('predictions')}>Current Predictions</button>
    </nav>
  )
}

export default NavBar