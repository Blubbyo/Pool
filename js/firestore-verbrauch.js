// js/firestore-verbrauch.js
import { db } from './firebase-init.js';
import { ref, set, get, child } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const VERBRAUCH_PATH = "verbrauchsdaten";

export async function loadVerbrauchData() {
  const snapshot = await get(child(ref(db), VERBRAUCH_PATH));
  const tbody = document.getElementById("verbrauchBody");
  tbody.innerHTML = '';

  if (snapshot.exists()) {
    const data = snapshot.val() || [];
    data.forEach(rowData => {
      const row = createVerbrauchRow(rowData);
      tbody.appendChild(row);
    });
  } else {
    console.log("Keine Verbrauchsdaten gefunden.");
  }
}

export function saveVerbrauchData() {
  const rows = document.querySelectorAll("#verbrauchBody tr");
  const data = [];

  rows.forEach(tr => {
    const inputs = tr.querySelectorAll("input");
    if (inputs.length !== 10) return;

    data.push({
      date: inputs[0].value,
      chlortabs: inputs[1].value,
      phMinus: inputs[2].value,
      phPlus: inputs[3].value,
      algen: inputs[4].value,
      phenol: inputs[5].value,
      dpd: inputs[6].value,
	  leistung: inputs[7].value,
	  laufzeit: inputs[8].value,
	  strompreis: inputs[9].value
    });
  });

  set(ref(db, VERBRAUCH_PATH), data)
    .then(() => console.log("Verbrauchsdaten gespeichert"))
    .catch(err => console.error("Fehler beim Speichern:", err));
}

export function createVerbrauchRow(rowData = {}) {
  const row = document.createElement("tr");
  const fields = ["date", "chlortabs", "phMinus", "phPlus", "algen", "phenol", "dpd", "leistung", "laufzeit", "strompreis"];

  fields.forEach((field, index) => {
    const td = document.createElement("td");
    const input = document.createElement("input");
    input.type = index === 0 ? "date" : "number";
    if (index !== 0) {
      input.min = 0;
      input.step = 0.001;
    }
    //input.value = rowData[field] || "";
	
    // Standardwerte setzen
    if (field === "leistung" && rowData[field] === undefined) {
      input.value = 250;
    } else if (field === "laufzeit" && rowData[field] === undefined) {
      input.value = 5;
    } else if (field === "strompreis" && rowData[field] === undefined) {
      input.value = 0.36;
    } else {
      input.value = rowData[field] || "";
    }
	  
    //input.addEventListener("change", saveVerbrauchData);
	input.addEventListener("change", () => {
	  saveVerbrauchData();
	  addCostSummaryRow();
	});
    td.appendChild(input);
    row.appendChild(td);
  });

  const deleteTd = document.createElement("td");
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "🗑";
  deleteBtn.style.cursor = "pointer";
  deleteBtn.addEventListener("click", () => {
    row.remove();
    saveVerbrauchData();
  });
  deleteTd.appendChild(deleteBtn);
  row.appendChild(deleteTd);

  return row;
}
