// js/main.js
import { db } from './firebase-init.js';
import { loadClickData, saveClickData } from './firestore-clicks.js';
import { loadPrices, savePrices } from './firestore-preise.js';
import { loadVerbrauchData, saveVerbrauchData, createVerbrauchRow } from './firestore-verbrauch.js';
import { initPoolTable } from './poolTable.js';

const produktNamen = [
  "200g Chlortabletten",
  "pH Minus",
  "pH Plus",
  "Algenschutzmittel",
  "Phenol Red",
  "DPD Nr. 1",
  "Leistungpumpe (W)",
  "Strompreis"
];

window.addEventListener("DOMContentLoaded", () => {
  // Verbrauchs-Button
  const addRowBtn = document.getElementById("addRowBtn");
  if (addRowBtn) {
    addRowBtn.addEventListener("click", () => {
      const tbody = document.getElementById("verbrauchBody");
      const newRow = createVerbrauchRow();
      tbody.insertBefore(newRow, tbody.firstChild);
      saveVerbrauchData(); // sofort speichern
    });
  } else {
    console.warn("Button #addRowBtn nicht gefunden!");
  }

  // Preise speichern Button – überprüfe ID und passe ggf. an
  document.getElementById("preisSaveBtn").addEventListener("click", () => {
  //savePrices();
  const row = createPriceRow();
  document.getElementById("preisBody").appendChild(row);
  savePrices();
  
});

  // Verbrauchsdaten laden
  loadVerbrauchData();

  // Klickdaten und Preise laden und anzeigen
  initApp();
});

const today = new Date();
const monthKey = `${today.getFullYear()}-${today.getMonth() + 1}`;
let clickData = {};

async function initApp() {
  clickData = await loadClickData(monthKey);
  renderTable(clickData);
  const preise = await loadPrices();
  renderPreise(preise);
  initPoolTable(db);
}

// Beispiel für Event-Listener für Klickdaten
function handleCellChange(cellId, value) {
  clickData[cellId] = value;
  saveClickData(monthKey, clickData);
}

function renderTable(data = {}) {
  

  
}

function renderPreise(preise) {
  const tbody = document.getElementById("preisBody");
  tbody.innerHTML = '';
  preise.forEach(entry => {
    const row = createPriceRow(entry);
    tbody.appendChild(row);
  });
}


function createPriceRow(data = {}) {
  const row = document.createElement("tr");

  // Produkt-Dropdown
  const productCell = document.createElement("td");
  const select = document.createElement("select");
  produktNamen.forEach(name => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    select.appendChild(option);
  });
  select.value = data.name || "";
  select.addEventListener("change", savePrices);
  productCell.appendChild(select);
  row.appendChild(productCell);

  // gültig-ab
  const dateCell = document.createElement("td");
  const dateInput = document.createElement("input");
  dateInput.type = "date";
  dateInput.value = data.ab || "";
  dateInput.addEventListener("change", savePrices);
  dateCell.appendChild(dateInput);
  row.appendChild(dateCell);

  // Preis
  const preisCell = document.createElement("td");
  const preisInput = document.createElement("input");
  preisInput.type = "number";
  preisInput.step = "0.01";
  preisInput.min = "0";
  preisInput.value = data.preis || "";
  preisInput.addEventListener("change", savePrices);
  preisCell.appendChild(preisInput);
  row.appendChild(preisCell);

  // Löschen
  const delCell = document.createElement("td");
  const delBtn = document.createElement("button");
  delBtn.textContent = "🗑";
  delBtn.addEventListener("click", () => {
    row.remove();
    savePrices();
  });
  delCell.appendChild(delBtn);
  row.appendChild(delCell);

  return row;
}
