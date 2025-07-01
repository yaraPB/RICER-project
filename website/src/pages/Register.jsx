import React from 'react'
import Button from '@mui/material/Button'
import { useNavigate } from 'react-router'

const Register = () => {

  const navigate = useNavigate()

  return (
    <div className='m-8 flex place-content-center gap-8 bg-[aliceblue] h-[100%]'>
      <Button variant="contained"
        sx={{ bgcolor: "#108b8b", padding: "1rem" }}
        onClick={() => navigate('officials-registration')}
      >
        I am a firefighter
      </Button>
      <Button variant="contained"
        sx={{ bgcolor: "#108b8b", padding: "1rem" }}
        onClick={() => navigate('civilian-registration')}
      >
        I am a civilian
      </Button>
    </div>
  )
}

export default Register