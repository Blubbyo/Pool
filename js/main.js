// js/main.js
import { loadClickData, saveClickData } from './firestore-clicks.js';
import { loadPrices, savePrices } from './firestore-preise.js';

import { loadVerbrauchData, saveVerbrauchData, createVerbrauchRow } from './firestore-verbrauch.js';

document.getElementById("addRowBtn").addEventListener("click", () => {
  const tbody = document.getElementById("verbrauchBody");
  const newRow = createVerbrauchRow();
  tbody.insertBefore(newRow, tbody.firstChild);
  saveVerbrauchData(); // sofort speichern
});

loadVerbrauchData();



const today = new Date();
const monthKey = `${today.getFullYear()}-${today.getMonth() + 1}`;
let clickData = {};

async function initApp() {
  clickData = await loadClickData(monthKey);
  renderTable(clickData);
  const preise = await loadPrices();
  renderPreise(preise);
}

// Beispiel für Event-Listener
function handleCellChange(cellId, value) {
  clickData[cellId] = value;
  saveClickData(monthKey, clickData);
}

function renderTable(data) {
  // Deine DOM-Logik hier mit data
}

function renderPreise(preise) {
  const tbody = document.getElementById("preisBody");
  tbody.innerHTML = '';
  preise.forEach(entry => {
    const row = createPriceRow(entry);
    tbody.appendChild(row);
  });
}

// Preise speichern
document.getElementById("preisSaveBtn").addEventListener("click", () => {
  const data = []; // aus DOM sammeln
  document.querySelectorAll("#preisBody tr").forEach(tr => {
    const [name, ab, preis] = tr.querySelectorAll("input, select");
    if (name && ab && preis) {
      data.push({
        name: name.value,
        ab: ab.value,
        preis: parseFloat(preis.value)
      });
    }
  });
  savePrices(data);
});


	


initApp();
