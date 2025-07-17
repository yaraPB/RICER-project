import React from 'react'
import NavBar from '../components/NavBar'
import { Outlet } from 'react-router'

const RootLayout = () => {
  return (
    <div>
        <NavBar/>
        <Outlet/>
    </div>
  )
}

export default RootLayout