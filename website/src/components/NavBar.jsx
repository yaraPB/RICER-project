import React, { useState } from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import logo from '../assets/logo.png'
import placeHolderImage from '../assets/pfp-placeholder.jpg'
import Button from '@mui/material/Button'
import { useNavigate } from 'react-router'

const NavBar = () => {
  const navigate = useNavigate()

  const [anchorElUser, setAnchorElUser] = useState(null)

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget)
  }

  const handleCloseUserMenu = () => {
    setAnchorElUser(null)
  }

  const handleMenuClick = (route) => {
    navigate(route)
    handleCloseUserMenu()
  }

  const settings = [
    { label: 'Profile', path: 'profile' },
    { label: 'Notifications', path: 'notifications' },
    { label: 'Logout', path: 'logout' } 
  ]

  return (
    <AppBar position="static" sx={{bgcolor: "#96D4AF"}}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        
        <img
          src={logo}
          alt="the logo showing 2 firefighters responding to an emergency"
          className="w-12 h-12 cursor-pointer"
          onClick={() => navigate('/')}
        />


        <Box sx={{ display: 'flex', gap: 2 }}>
          <Typography variant="h6" onClick={() => navigate('incidents')} sx={{ cursor: 'pointer' }}>
            Incidents
          </Typography>
          <Typography variant="h6" onClick={() => navigate('dashboard')} sx={{ cursor: 'pointer' }}>
            Dashboard
          </Typography>
          <Typography variant="h6" onClick={() => navigate('reports')} sx={{ cursor: 'pointer' }}>
            Reports
          </Typography>
        </Box>

        <Button variant="contained" onClick={() => navigate('register/civilian-registration')}>
          Register now
        </Button>

        {/* Avatar Menu */}
        <Box sx={{ flexGrow: 0 }}>
          <Tooltip title="Open settings">
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
              <Avatar alt="User Avatar" src={placeHolderImage} />
            </IconButton>
          </Tooltip>
          <Menu
            sx={{ mt: '45px' }}
            id="menu-appbar"
            anchorEl={anchorElUser}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right'
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right'
            }}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
          >
            {settings.map((setting) => (
              <MenuItem key={setting.label} onClick={() => handleMenuClick(setting.path)}>
                <Typography textAlign="center">{setting.label}</Typography>
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default NavBar
