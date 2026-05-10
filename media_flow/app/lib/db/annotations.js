import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp
} from "firebase/firestore";

// Add a new annotation to a project
export async function addAnnotation(projectId, {
  timestampStart,
  timestampEnd,
  comment,
  authorId
}) {
  const annotationsRef = collection(db, "projects", projectId, "annotations");
  const annotation = await addDoc(annotationsRef, {
    timestampStart,
    timestampEnd: timestampEnd ?? null,
    comment,
    status: "Unresolved",
    authorId,
    createdAt: serverTimestamp()
  });
  return annotation.id;
}

// Get all annotations for a project
export async function getAnnotations(projectId) {
  const annotationsRef = collection(db, "projects", projectId, "annotations");
  const annotationsSnap = await getDocs(annotationsRef);
  return annotationsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// Mark an annotation as resolved
export async function resolveAnnotation(projectId, annotationId) {
  const annotationRef = doc(db, "projects", projectId, "annotations", annotationId);
  await updateDoc(annotationRef, { status: "Resolved" });
}