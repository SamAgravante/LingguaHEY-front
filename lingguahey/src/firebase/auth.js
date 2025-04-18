// src/firebase/auth.js
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "./config";

export const signup = async (formData) => {
  const { email, password, ...profileData } = formData;

  if (!email.endsWith("@cit.edu")) {
    throw new Error("Email must be a @cit.edu address.");
  }

  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const uid = userCredential.user.uid;

  await setDoc(doc(db, "users", uid), {
    ...profileData,
    email,
    totalPoints: 0,
    profilePicUrl: "",
    role: "admin"
  });

  return uid;
};

export const login = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logout = () => {
  return signOut(auth);
};
