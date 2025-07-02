// js/firestore-preise.js
import { db } from './firebase-init.js';
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export async function loadPrices() {
  const docSnap = await getDoc(doc(db, "preisListe", "daten"));
  return docSnap.exists() ? docSnap.data().einträge || [] : [];
}

export async function savePrices(data) {
  await setDoc(doc(db, "preisListe", "daten"), { einträge: data });
}
