// js/firestore-preise.js
import { db } from './firebase-init.js';
//import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getDatabase, ref, set, get , child} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";


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

export async function savePrices() {
  const rows = document.querySelectorAll("#preisBody tr");
  const data = [];

  rows.forEach(row => {
    const select = row.querySelector("select");
    const dateInput = row.querySelector("input[type=date]");
    const numberInput = row.querySelector("input[type=number]");

    if (!select || !dateInput || !numberInput) return;

    // Datum als String im ISO-Format yyyy-mm-dd
    const abDate = dateInput.value; // z.B. "2025-07-02"
    const preis = parseFloat(numberInput.value);

    if (!select.value || !abDate || isNaN(preis)) return; // ggf. ignorieren oder validieren

    data.push({
      name: select.value,
      ab: abDate,
      preis: preis,
    });
  });

  // Nun data als Objekt mit Index-Schlüsseln für Realtime DB vorbereiten:
  const obj = {};
  data.forEach((item, index) => {
    obj[index] = item;
  });

  try {
    await set(ref(db, 'preisListe'), obj);
    console.log("Preise gespeichert");
  } catch (err) {
    console.error("Fehler beim Speichern:", err);
  }
}
