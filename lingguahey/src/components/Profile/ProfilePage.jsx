// src/components/Profile/ProfilePage.jsx
import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/config"; // Removed storage import
import { useAuth } from "../../contexts/AuthContext";
// import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Commented out

const ProfilePage = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [newPic, setNewPic] = useState(null);
  const [message, setMessage] = useState("");

  const fetchProfile = async () => {
    if (!currentUser) return;
    const docRef = doc(db, "users", currentUser.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setProfile(docSnap.data());
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [currentUser]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  /*
  const handleImageUpload = async () => {
    if (!newPic || !currentUser) return null;
    const fileRef = ref(storage, `profilePics/${currentUser.uid}`);
    await uploadBytes(fileRef, newPic);
    const url = await getDownloadURL(fileRef);
    return url;
  };
  */

  const handleSave = async () => {
    if (!currentUser) return;
    try {
      /*
      let imageUrl = profile.profilePicUrl;
      if (newPic) {
        imageUrl = await handleImageUpload();
      }
      */

      const docRef = doc(db, "users", currentUser.uid);
      await updateDoc(docRef, {
        ...profile,
        // profilePicUrl: imageUrl, // Commented out
      });

      setMessage("Profile updated successfully ✅");
    } catch (err) {
      console.error(err);
      setMessage("Update failed ❌");
    }
  };

  if (!profile) return <p>Loading profile...</p>;

  return (
    <div>
      <h2>My Profile</h2>
      {message && <p>{message}</p>}
      {/* <img
        src={profile.profilePicUrl || "https://via.placeholder.com/100"}
        alt="Profile"
        width={100}
        height={100}
      />
      <br />
      <input type="file" onChange={(e) => setNewPic(e.target.files[0])} />
      <br /> */}
      <input name="firstName" value={profile.firstName} onChange={handleChange} placeholder="First Name" />
      <input name="middleName" value={profile.middleName} onChange={handleChange} placeholder="Middle Name" />
      <input name="lastName" value={profile.lastName} onChange={handleChange} placeholder="Last Name" />
      <input value={profile.email} disabled />
      <input name="idNumber" value={profile.idNumber} onChange={handleChange} placeholder="ID Number" />
      <input name="totalPoints" type="number" value={profile.totalPoints} onChange={handleChange} />
      <br />
      <button onClick={handleSave}>Save Profile</button>
    </div>
  );
};

export default ProfilePage;
