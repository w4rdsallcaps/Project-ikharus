// Finds the file called firebase.js and imports db (database)
import { db } from "../firebase";

// These are tools from firebase
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";

// Create a new project
export async function createProject({
  name,
  clientName,
  deadline,
  maxDurationMins,
  maxDurationSecs,
  maxRevisions,
  editorId
}) {
    
  const projectRef = await addDoc(collection(db, "projects"), {
    name,
    clientName,
    deadline,
    maxDurationMins,
    maxDurationSecs,
    maxRevisions,
    progress: 0,
    version: "v1",
    status: "Awaiting Upload",
    videoUrl: null,
    editorId,
    createdAt: serverTimestamp()
  });
  return projectRef.id;
}

// Get a single project by ID
export async function getProject(projectId) {
  const projectRef = doc(db, "projects", projectId);
  const projectSnap = await getDoc(projectRef);
  if (projectSnap.exists()) {
    return { id: projectSnap.id, ...projectSnap.data() };
  }
  return null;
}

// Get all projects
export async function getAllProjects() {
  const projectsSnap = await getDocs(collection(db, "projects"));
  return projectsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// Update project fields (progress, status, videoUrl, etc.)
export async function updateProject(projectId, updates) {
  const projectRef = doc(db, "projects", projectId);
  await updateDoc(projectRef, updates);
}