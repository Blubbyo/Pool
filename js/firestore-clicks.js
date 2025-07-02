// js/firestore-clicks.js
import { db } from './firebase-init.js';
import { doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export async function loadClickData(monthKey) {
  const docRef = doc(db, "clickdaten", monthKey);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : {};
}

export async function saveClickData(monthKey, clickData) {
  try {
    await updateDoc(doc(db, "clickdaten", monthKey), clickData);
  } catch (e) {
    await setDoc(doc(db, "clickdaten", monthKey), clickData);
  }
}
