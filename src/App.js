import React, { useContext, useMemo, useState } from 'react'
import Home from './Pages/Home/Home'
import Profile from './Pages/Profile/Profile'
import FriendsId from "./Pages/FriendsId/FriendsId"
import { Navigate, Route, Routes } from 'react-router-dom'
import Notification from './Pages/Notification/Notification'
import Login from './Pages/RegisterPage/Login'
import SignUp from './Pages/RegisterPage/SignUp'
import ProductDetail from './Pages/ProductDetail/ProductDetail'
import ForgetPassword from './Pages/RegisterPage/ForgetPassword'
import { AuthProvider, AuthContext } from './context/AuthContext'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext)
  const element = useMemo(() => isAuthenticated ? children : <Navigate to="/" replace />, [isAuthenticated, children])
  return element
}

const App = () => {
  const [friendProfile,setFriendsProfile] =useState([])

  return (
    <AuthProvider>
      <div className='App'>
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/signup' element={<SignUp />} />
          <Route path='/forget-password' element={<ForgetPassword />} />

          <Route path='/home' element={<ProtectedRoute><Home setFriendsProfile={setFriendsProfile}/></ProtectedRoute>} />
          <Route path='/profile' element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path='/friendsId' element={<ProtectedRoute><FriendsId friendProfile={friendProfile} /></ProtectedRoute>} />
          <Route path='/notification' element={<ProtectedRoute><Notification /></ProtectedRoute>} />
          <Route path='/products/:slug' element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App
