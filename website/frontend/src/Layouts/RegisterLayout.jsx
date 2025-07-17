import React from 'react'
import Register from '../pages/Register'
import { Outlet } from 'react-router'

const RegisterLayout = () => {
  return (
    <div>
        <Register/>
        <Outlet/>
    </div>
  )
}

export default RegisterLayout