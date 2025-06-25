import React from 'react'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router'
import Dashboard from './pages/Dashboard'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import RootLayout from './Layouts/RootLayout'
import Register from './pages/Register'
import Predictions from './pages/Predictions'
import Resources from './pages/Resources'
import ResponseTeams from './pages/ResponseTeams'

const App = () => {
   const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path='/' element={<RootLayout/>}>
           <Route index element={<Home />} />
          <Route path="dashboard" element={<Dashboard />}/>
          <Route path='active-incidents' element={<Home/>}/>
          <Route path='resources' element={<Resources/>}/>
          <Route path='response-teams' element={<ResponseTeams/>}/>
          <Route path="register" element={<Register />} />
          <Route path="predictions" element={<Predictions />} />
          <Route path="*" element={<NotFound />} />
      </Route>
    )
  )

return (
  <div className='bg-[aliceblue]'>
      <RouterProvider router={router}/>
    </div>
  )
}

export default App