import { useState, useEffect, useContext } from 'react'
import Left from '../../Components/LeftSide/Left'
import ProfileMiddle from '../../Components/Profile/ProfileMiddle'
import Right from '../../Components/RightSide/Right'
import Nav from '../../Components/Navigation/Nav'
import "../Profile/Profile.css"
import DefaultImage from "../../assets/profile.jpg"
import { AuthContext } from '../../context/AuthContext'

const Profile = () => {
  const { profile } = useContext(AuthContext)

  const [following, setFollowing] = useState(3)
  const [search, setSearch] = useState("")
  const [showMenu, setShowMenu] = useState(false)
  const [images, setImages] = useState(null)

  const [name, setName] = useState("")
  const [userName, setUserName] = useState("")
  const [profileImg, setProfileImg] = useState(DefaultImage)
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [modelDetails, setModelDetails] = useState({})

  useEffect(() => {
    if (profile) {
      const username = profile.username || ""
      setName(username)
      setUserName(`@${username}`)
      setProfileImg(profile.avatar || DefaultImage)
      setEmail(profile.email || "")
      setPhone(profile.phone || "")
      setModelDetails({
        ModelName: username,
        ModelUserName: `@${username}`,
        ModelCountryName: "Vietnam",
        ModelJobName: "Member",
      })
    }
  }, [profile])

  return (
    <div className='interface'>
      <Nav {...{search, setSearch, showMenu, setShowMenu, profileImg}} />
      <div className="home">
        <Left {...{following, setFollowing, profileImg, modelDetails}} />
        <ProfileMiddle
          {...{following, search, images, setImages, name, setName,
              userName, setUserName, profileImg, setProfileImg,
              email, phone, modelDetails, setModelDetails}}
        />
        <Right {...{showMenu, setShowMenu, following, setFollowing}} />
      </div>
    </div>
  )
}

export default Profile
