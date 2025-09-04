import React, { useState } from 'react'
import Home from './Pages/Home/Home'
import Profile from './Pages/Profile/Profile'
import FriendsId from "./Pages/FriendsId/FriendsId"
import { Route, Routes } from 'react-router-dom'
import Notification from './Pages/Notification/Notification'
import Login from './Pages/RegisterPage/Login'
import SignUp from './Pages/RegisterPage/SignUp'
import ProductDetail from './Pages/ProductDetail/ProductDetail'
import ForgetPassword from './Pages/RegisterPage/ForgetPassword'

const App = () => {
  const [friendProfile,setFriendsProfile] =useState([])

  return (
    <div className='App'>
      <Routes>
        <Route path='/home' element={<Home setFriendsProfile={setFriendsProfile}/> } />
        
        <Route path='/profile' element={ <Profile /> } />

        <Route path='/friendsId' element={<FriendsId friendProfile={friendProfile} />} />
      
        <Route path='/notification' element={<Notification />} />

        <Route path='/' element={<Login />} />

        <Route path='/signup' element={<SignUp />} />
       
        <Route path='/products/:slug' element={<ProductDetail />} />
        

        <Route path='/forget-password' element={<ForgetPassword />} />
      </Routes>
    </div>
  )
}

export default App
