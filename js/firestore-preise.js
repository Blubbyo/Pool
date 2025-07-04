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

    const abDate = dateInput.value;
    const preis = parseFloat(numberInput.value);

    if (!select.value || !abDate || isNaN(preis)) return;

    data.push({
      name: select.value,
      ab: abDate,
      preis: preis,
    });
  });

  const obj = {};
  data.forEach((item, index) => {
    obj[index] = item;
  });

  try {
    await set(ref(db, 'preisListe'), obj);
    console.log("Preise gespeichert");
  } catch (err) {
    console.error("Fehler beim Speichern der Preise:", err);
  }
}


let preisListe = [];

export async function loadPreise() {
  try {
    const snapshot = await get(ref(db, 'preisListe'));
    if (snapshot.exists()) {
      preisListe = snapshot.val().map(p => ({
        name: p.name,
        ab: new Date(p.ab),
        preis: parseFloat(p.preis)
      }));
      console.log("Preise geladen:", preisListe);
    } else {
      console.warn("Keine Preisdaten gefunden.");
    }
  } catch (err) {
    console.error("Fehler beim Laden der Preise:", err);
  }
}

function getPreisZumDatum(name, datum) {
  const gültigePreise = preisListe
    .filter(p => p.name === name && p.ab <= datum)
    .sort((a, b) => b.ab - a.ab); // neueste zuerst

  return gültigePreise[0]?.preis || 0;
}

function getVerbrauchsDatenAusTabelle() {
  const verbrauchDaten = {};
  const table = document.getElementById("verbrauchTable");
  const rows = table.querySelectorAll("tbody tr");

  rows.forEach(row => {
    const dateInput = row.querySelector("input[type='date']");
    const mengeInput = row.querySelector("input[type='number']");
    const stoffSelect = row.querySelector("select");

    if (dateInput && mengeInput && stoffSelect) {
      const datum = dateInput.value;
      const menge = parseFloat(mengeInput.value);
      const stoff = stoffSelect.value;

      if (!datum || isNaN(menge) || !stoff) return;

      if (!verbrauchDaten[datum]) verbrauchDaten[datum] = {};
      if (!verbrauchDaten[datum][stoff]) verbrauchDaten[datum][stoff] = 0;
      verbrauchDaten[datum][stoff] += menge;
    }
  });

  return verbrauchDaten;
}

function addCostSummaryRow() {
  const verbrauchDaten = getVerbrauchsDatenAusTabelle();

  const costRow = document.createElement("tr");
  const labelCell = document.createElement("td");
  labelCell.textContent = "Kosten (€)";
  labelCell.style.fontWeight = "bold";
  labelCell.style.background = "#f0f0f0";
  costRow.appendChild(labelCell);

  for (let d = 1; d <= daysInMonth; d++) {
    const datum = new Date(year, month, d);
    const datumStr = datum.toISOString().slice(0, 10);
    const dayData = verbrauchDaten[datumStr] || {};
    let sum = 0;

    for (const [stoff, menge] of Object.entries(dayData)) {
      const preis = getPreisZumDatum(stoff, datum);
      sum += menge * preis;
    }

    const cell = document.createElement("td");
    cell.textContent = sum.toFixed(2);
    cell.style.backgroundColor = "#e0f7fa";
    cell.style.fontWeight = "bold";
    costRow.appendChild(cell);
  }

  table.appendChild(costRow);
}
