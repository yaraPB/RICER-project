import React from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import logo from '../assets/logo.png'
import { useNavigate } from 'react-router'
import Avatar from '@mui/material/Avatar'
import placeHolderImage from '../assets/pfp-placeholder.jpg'
import Button from '@mui/material/Button'

const NavBar = () => {

    const navigate = useNavigate()

  return (
    <AppBar position="static" color="secondary">
    
    <Toolbar sx={{display: "flex", justifyContent: "space-between"}}>
        <img src={logo} alt="the logo showing 2 firefighters responding to an emergency" className='w-12 h-12'
        onClick={() => navigate('/')}
        />

      <Typography variant="h6"
      onClick={() => navigate('incidents')}
      >
          Incidents
      </Typography>
      <Typography variant="h6"
      onClick={() => navigate('dashboard')}
      >
          Dashboard
      </Typography>
      <Typography variant="h6"
      onClick={() => navigate('reports')}
      >
          Reports
      </Typography>
      <Button variant="contained"
      onClick={() => navigate('register')}
      >
          Register now
      </Button>
      
      <Avatar 
      onClick={() => navigate('profile')}
      >
          <img src={placeHolderImage} alt="" />
      </Avatar>
    </Toolbar>

    </AppBar>
)}

export default NavBar