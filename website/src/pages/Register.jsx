import React from 'react'
import Button from '@mui/material/Button'
import { useNavigate } from 'react-router'

const Register = () => {

    const navigate = useNavigate()

  return (
    <div className='m-2'>
        <h1 className='text-3xl m-1'>Register</h1>
        <Button variant="contained" color="secondary"
        sx={{margin: "4px"}}
        onClick={() => navigate('officials-registration')}
        >
          I am a firefighter
        </Button>
        <Button variant="contained" color="secondary"
        onClick={() => navigate('civilian-registration')}
        >
          I am a civilian 
        </Button>
    </div>
  )
}

export default Register