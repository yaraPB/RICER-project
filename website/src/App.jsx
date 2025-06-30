import './App.css'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router'
import Incidents from './pages/Incidents'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Reports from './pages/Reports'
import RootLayout from './Layouts/RootLayout'
import NotFound from './pages/NotFound'
import Profile from './pages/Profile'
import RegisterLayout from './Layouts/RegisterLayout'
import CivilianRegistration from './components/CivilianRegistration'
import GovRegistration from './components/GovRegistration'
import Notifications from './pages/Notifications'

const App = () => {

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path='/' element={<RootLayout/>}>
           <Route index element={<Home />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="incidents" element={<Incidents />} />
          <Route path="reports" element={<Reports />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
          <Route path="register" element={<RegisterLayout />} >
              <Route path='civilian-registration' element={<CivilianRegistration/>}/>
              <Route path='officials-registration' element={<GovRegistration/>}/>

          </Route>
          <Route path="*" element={<NotFound />} />
      </Route>
    )
  )

return (
  <div className='bg-white'>
      <RouterProvider router={router}/>
    </div>
  )
}

export default App