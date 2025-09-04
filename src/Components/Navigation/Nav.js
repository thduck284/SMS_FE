import React, { useContext, useMemo, useState } from 'react'
import "../Navigation/Nav.css"
import SearchIcon from '@mui/icons-material/Search';
import { Link, useNavigate } from 'react-router-dom';

import {AiOutlineHome} from "react-icons/ai"
import {LiaUserFriendsSolid} from "react-icons/lia"
import {IoNotificationsOutline} from "react-icons/io5"
import {TbMessage} from "react-icons/tb"

import Profile from "../../assets/profile.jpg"
import { AuthContext } from '../../context/AuthContext'

const Nav = ({search,setSearch,setShowMenu,profileImg}) => {
  const navigate = useNavigate()
  const { profile, clearSession } = useContext(AuthContext)
  const displayName = useMemo(() => profile?.username || 'User', [profile])
  const [openMenu, setOpenMenu] = useState(false)

  const handleLogout = () => {
    clearSession()
    navigate('/')
  }
  
  return (
    <nav>
        <div className="n-logo">
            <Link to="/home" className='logo' style={{color:"black",textDecoration:"none"}}>
              <h1>Face <span>Gram</span></h1>
            </Link>
        </div>

      <div className="n-form-button" >

        <form className='n-form' onSubmit={(e)=>e.preventDefault()} >
          <SearchIcon className='search-icon'/>
          <input type="text" 
          placeholder='Search post'
          id='n-search'
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
          />
        </form>
      </div>

      <div className="social-icons">
      <Link to="/home" style={{textDecoration:"none",display:"flex",alignItems:"center",color:"white"}}>
        <AiOutlineHome className='nav-icons'/>
      </Link>

        <Link to="/notification" id='notifi' style={{marginTop:"8px"}}><IoNotificationsOutline className='nav-icons'/><span>5</span></Link>
           
        <TbMessage className='nav-icons'/>
        <LiaUserFriendsSolid 
        className='nav-icons'
        onClick={()=>setShowMenu(true)}/>
      </div>


       <div className="n-profile" style={{ position: 'relative' }}>
          <button onClick={() => setOpenMenu((v) => !v)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <img src={profileImg ? (profileImg) : Profile} className='n-img' style={{marginBottom:"-7px"}}/>
            <span style={{ color: '#000', fontWeight: 600 }}>{displayName}</span>
          </button>
          {openMenu && (
            <div style={{ position: 'absolute', top: '100%', right: 0, background: '#fff', border: '1px solid #ddd', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', padding: 8, minWidth: 180, zIndex: 1000 }}>
              <Link to="/profile" style={{ display: 'block', padding: '8px 10px', color: '#111', textDecoration: 'none' }} onClick={() => setOpenMenu(false)}>Profile</Link>
              <button onClick={handleLogout} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', background: 'transparent', border: 'none', color: '#c00', cursor: 'pointer' }}>Logout</button>
            </div>
          )}
      </div>
  
    </nav>
  )
}

export default Nav