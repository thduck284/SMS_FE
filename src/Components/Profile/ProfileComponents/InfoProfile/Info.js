import React, { useState, useRef, useContext } from 'react'
import "../InfoProfile/Info.css"
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded';
import Info3 from "../../../../assets/Info-Dp/img-3.jpg"
import { LiaEdit } from "react-icons/lia"
import { IoCameraOutline } from "react-icons/io5"
import { BiLogOut } from "react-icons/bi"
import ModelProfile from '../ModelProfile/ModelProfile';
import { AuthContext } from '../../../../context/AuthContext';
import { useNavigate } from 'react-router-dom'

const Info = ({
  userPostData,
  following,
  modelDetails,
  setModelDetails,
  profileImg,
  setProfileImg,
  name,
  setName,
  userName,
  setUserName
}) => {
  const navigate = useNavigate()
  const { profile, clearSession } = useContext(AuthContext)
  const [coverImg, setCoverImg] = useState(Info3)
  const [openEdit, setOpenEdit] = useState(false)
  const [countryName, setCountryName] = useState("")
  const [jobName, setJobName] = useState("")

  const importProfile = useRef()
  const importCover = useRef()

  const joinedDate = profile?.createdAt
    ? new Date(profile.createdAt).toISOString().split("T")[0] 
    : "N/A"

  const handleFile = (e, setter) => {
    if (e.target.files?.[0]) {
      const img = URL.createObjectURL(e.target.files[0])
      setter(img)
    }
  }

  const handleLogout = () => {
    clearSession() 
    navigate('/') 
  }

  const handleModel = (e) => {
    e.preventDefault()
    setModelDetails({
      ModelName: name,
      ModelUserName: userName,
      ModelCountryName: countryName,
      ModelJobName: jobName,
    })
    setOpenEdit(false)
  }

  return (
    <div className='info'>
      <div className="info-cover">
        <img src={coverImg} alt="" />
        <img src={profileImg} alt="" />
        <div className='coverDiv'>
          <IoCameraOutline className='coverSvg' onClick={() => importCover.current.click()} />
        </div>
        <div className='profileDiv'>
          <IoCameraOutline className='profileSvg' onClick={() => importProfile.current.click()} />
        </div>
      </div>

      <input type="file" ref={importProfile} onChange={(e) => handleFile(e, setProfileImg)} style={{ display: "none" }} />
      <input type="file" ref={importCover} onChange={(e) => handleFile(e, setCoverImg)} style={{ display: "none" }} />

      <div className="info-follow">
        <h1>{modelDetails.ModelName}</h1>
        <p>{modelDetails.ModelUserName}</p>

        <button onClick={handleLogout} className='logout'>
          <BiLogOut /> Logout
        </button>
        <button onClick={() => setOpenEdit(true)}><LiaEdit />Edit Profile</button>

        <ModelProfile
          {...{ name, setName, userName, setUserName, countryName, setCountryName, jobName, setJobName, handleModel, openEdit, setOpenEdit }}
        />

        <div className="info-details">
          <div className="info-col-1">
            <div className="info-details-list">
              <LocationOnOutlinedIcon />
              <span>{modelDetails.ModelCountryName}</span>
            </div>
            <div className="info-details-list">
              <WorkOutlineRoundedIcon />
              <span>{modelDetails.ModelJobName}</span>
            </div>
            <div className="info-details-list">
              <CalendarMonthRoundedIcon />
              <span>Joined in {joinedDate}</span>
            </div>
          </div>

          <div className="info-col-2">
            <div><h2>5,000</h2><span>Followers</span></div>
            <div><h2>{userPostData.length}</h2><span>Posts</span></div>
            <div><h2>{following}</h2><span>Following</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Info
