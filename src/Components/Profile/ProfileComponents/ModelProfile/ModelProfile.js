import { Modal, useMantineTheme } from '@mantine/core';
import "../ModelProfile/ModelProfile.css";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from '../../../../context/AuthContext';
import axios from "axios";

function ModelProfile({ openEdit, setOpenEdit }) {
  const theme = useMantineTheme();
  const { profile, setProfile, accessToken } = useContext(AuthContext);

  const [name, setName] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (openEdit && profile) {
      setName(profile.username || "");
      setUserName(profile.username || "");
      setEmail(profile.email || "");
      setPhone(profile.phone || "");
    }
  }, [openEdit, profile]);

  const countryName = profile?.country || "Vietnam";
  const jobName = profile?.job || "Member";

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.put(
        "http://localhost:3000/user/update-profile",
        {
          username: userName,
          email,
          phone,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (res.data) {
        setProfile((prev) => ({
          ...prev,
          username: res.data.username,  
          email: res.data.email,
          phone: res.data.phone,
        }));
      }

      setOpenEdit(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Update failed!");
    }
  };

  return (
    <Modal
      radius="8px"
      zIndex="1001"
      size="lg"
      opened={openEdit}
      title="Edit Info"
      onClose={() => setOpenEdit(false)}
      overlayProps={{
        color:
          theme.colorScheme === "dark"
            ? theme.colors.dark[9]
            : theme.colors.gray[2],
      }}
    >
      <form className="modelForm" onSubmit={handleUpdate}>
        <div className="row1">
          <div className="inputBox1">
            <input
              type="text"
              name="name"
              placeholder="Enter Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="inputBox1">
            <input
              type="text"
              name="username"
              placeholder="Enter Username"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="inputBox1">
          <input
            type="email"
            name="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="inputBox1">
          <input
            type="tel"
            name="phone"
            placeholder="Enter Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="inputBox1">
          <input type="text" name="countryname" value={countryName} disabled />
        </div>

        <div className="inputBox1">
          <input type="text" name="jobname" value={jobName} disabled />
        </div>

        <button className="modelBtn">Update</button>
      </form>
    </Modal>
  );
}

export default ModelProfile;
