// js/firestore-clicks.js
import { db } from './firebase-init.js';
//import { doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { ref, get, set, update } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";


//export async function loadClickData(monthKey) {
//  const docRef = doc(db, "clickdaten", monthKey);
//  const docSnap = await getDoc(docRef);
//  return docSnap.exists() ? docSnap.data() : {};
//}

//export async function saveClickData(monthKey, clickData) {
//  try {
//    await updateDoc(doc(db, "clickdaten", monthKey), clickData);
//  } catch (e) {
//    await setDoc(doc(db, "clickdaten", monthKey), clickData);
//  }
//}

export async function loadClickData(monthKey) {
  const snapshot = await get(ref(db, `clickdaten/${monthKey}`));
  return snapshot.exists() ? snapshot.val() : {};
}

export async function saveClickData(monthKey, clickData) {
  await set(ref(db, `clickdaten/${monthKey}`), clickData);
}
