// js/firestore-preise.js
import { db } from './firebase-init.js';
//import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";


//export async function loadPrices() {
 // const docSnap = await getDoc(doc(db, "preisListe", "daten"));
 // return docSnap.exists() ? docSnap.data().einträge || [] : [];
//}

//export async function savePrices(data) {
//  await setDoc(doc(db, "preisListe", "daten"), { einträge: data });
//}


export async function loadPrices() {
  const dbRef = ref(db);
  try {
    const snapshot = await get(child(dbRef, 'preisListe'));
    if (snapshot.exists()) {
      const data = snapshot.val();
      // data ist ein Objekt mit Index-Schlüsseln (0, 1, 2...) -> wandeln wir in Array um
      return Object.values(data);
    } else {
      return [];
    }
  } catch (error) {
    console.error("Fehler beim Laden der Preise:", error);
    return [];
  }
}

export async function savePrices(data) {
  try {
    // Umwandeln von Array in Objekt mit Index-Schlüsseln
    const obj = {};
    data.forEach((item, index) => {
      // Datum formatieren im ISO-Format (yyyy-mm-dd)
      if (item.ab instanceof Date) {
        item.ab = item.ab.toISOString().slice(0, 10);
      } else if (typeof item.ab === "string") {
        // Optional: Prüfen ob Datum schon im richtigen Format ist
        // oder hier bei Bedarf umwandeln
      }
      obj[index] = item;
    });
    await set(ref(db, 'preisListe'), obj);
    console.log("Preise gespeichert");
  } catch (error) {
    console.error("Fehler beim Speichern der Preise:", error);
  }
}
