// js/firestore-preise.js
import { db } from './firebase-init.js';
//import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";


//export async function loadPrices() {
 // const docSnap = await getDoc(doc(db, "preisListe", "daten"));
 // return docSnap.exists() ? docSnap.data().einträge || [] : [];
//}

//export async function savePrices(data) {
//  await setDoc(doc(db, "preisListe", "daten"), { einträge: data });
//}


async function loadPrices() {
  const dbRef = ref(db, "preisListe");
  const snapshot = await get(dbRef);
  if (snapshot.exists()) {
    const data = snapshot.val(); // gibt ein Objekt oder Array zurück
    // Falls Object, ggf. in Array umwandeln:
    return Object.values(data);
  } else {
    return [];
  }
}

function savePrices(data) {
  // data ist ein Array von Preisobjekten
  set(ref(db, "preisListe"), data)
    .then(() => console.log("Preise gespeichert"))
    .catch(err => console.error(err));
}