// Finds the file called firebase.js and imports db (database)
import { db } from "../firebase";

// These are tools from firebase
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

// Creates/updates a user in Firestore after signing up in Clerk
export async function createUser({ id, name, email, role }) {
  const userRef = doc(db, "users", id);
  await setDoc(userRef, {
    id,
    name,
    email,
    role,
    createdAt: serverTimestamp()
  });
}

// Gets a single user by their user ID in Clerk
export async function getUser(clerkUserId) {
  const userRef = doc(db, "users", clerkUserId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return userSnap.data();
  }
  return null;
}