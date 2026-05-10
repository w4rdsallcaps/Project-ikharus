import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp
} from "firebase/firestore";

// Create a new access token for a project version
export async function createToken(projectId, { version, expiresAt }) {
  const tokensRef = collection(db, "projects", projectId, "tokens");
  const token = await addDoc(tokensRef, {
    version,
    createdAt: serverTimestamp(),
    expiresAt
  });
  return token.id;
}

// Get all tokens for a project
export async function getTokens(projectId) {
  const tokensRef = collection(db, "projects", projectId, "tokens");
  const tokensSnap = await getDocs(tokensRef);
  return tokensSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}