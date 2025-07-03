import React, { useState, useEffect } from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import { useNavigate } from 'react-router'

import logo from '../assets/logo-2.png'
import logoAUI from '../assets/aui-logo.png'
import placeHolderImage from '../assets/pfp-placeholder.jpg'

const NavBar = () => {
  const navigate = useNavigate()

  const [anchorElUser, setAnchorElUser] = useState(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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

  // Helper to scale font sizes, paddings, and widths smoothly
  const scaleValue = (normal, small) => (scrolled ? small : normal)

  return (
    <AppBar
      position="sticky"
      sx={{
        bgcolor: '#151515',
        color: 'aliceblue',
        padding: scrolled ? '0.3rem 1rem' : '.75rem 1rem',
        transition: 'padding 0.3s ease',
        boxShadow: scrolled ? '0 2px 8px rgba(0,0,0,0.6)' : 'none',
        zIndex: 1300
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          minHeight: scaleValue(64, 48), // compact height on scroll
          transition: 'min-height 0.3s ease'
        }}
      >
        {/* Left Logos */}
        <Box sx={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <img
            src={logo}
            alt="logo"
            onClick={() => navigate('/')}
            style={{
              width: scaleValue(48, 48),
              height: scaleValue(48, 32),
              cursor: 'pointer',
              transition: 'width 0.3s ease, height 0.3s ease'
            }}
          />
          <img
            src={logoAUI}
            alt="aui logo"
            onClick={() => navigate('/')}
            style={{
              width: scaleValue(48, 32),
              height: scaleValue(48, 32),
              cursor: 'pointer',
              transition: 'width 0.3s ease, height 0.3s ease'
            }}
          />
        </Box>

        {/* Middle nav links */}
        <Box
          sx={{
            display: 'flex',
            gap: scaleValue(12, 8),
            alignItems: 'center',
            transition: 'gap 0.3s ease'
          }}
        >
          {['incidents', 'dashboard', 'reports'].map((route) => (
            <Typography
              key={route}
              variant="h5"
              fontWeight={700}
              onClick={() => navigate(route)}
              sx={{
                cursor: 'pointer',
                fontSize: scaleValue('1.5rem', '1.1rem'),
                transition: 'font-size 0.3s ease',
                '&:hover': { transform: 'scale(1.15)' },
                transitionTimingFunction: 'ease'
              }}
            >
              {route.charAt(0).toUpperCase() + route.slice(1)}
            </Typography>
          ))}
        </Box>

        {/* Register button */}
        <Button
          variant="contained"
          sx={{
            bgcolor: '#108b8b',
            fontSize: scaleValue('1rem', '0.75rem'),
            padding: scaleValue('6px 20px', '4px 12px'),
            transition: 'all 0.3s ease',
            whiteSpace: 'nowrap'
          }}
          onClick={() => navigate('register/civilian-registration')}
        >
          Register now
        </Button>

        {/* Avatar Menu */}
        <Box sx={{ flexGrow: 0, marginLeft: 2 }}>
          <Tooltip title="Open settings">
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
              <Avatar
                alt="User Avatar"
                src={placeHolderImage}
                sx={{
                  width: scaleValue(56, 36),
                  height: scaleValue(56, 36),
                  transition: 'width 0.3s ease, height 0.3s ease'
                }}
              />
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
