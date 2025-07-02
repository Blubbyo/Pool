// js/main.js
import { loadClickData, saveClickData } from './firestore-clicks.js';
import { loadPrices, savePrices } from './firestore-preise.js';
import { loadVerbrauchData, saveVerbrauchData, createVerbrauchRow } from './firestore-verbrauch.js';

const produktNamen = [
  "200g Chlortabletten",
  "pH Minus",
  "pH Plus",
  "Algenschutzmittel",
  "Phenol Red",
  "DPD Nr. 1"
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
  const preisSaveBtn = document.getElementById("preisSaveBtn");
  if (preisSaveBtn) {
    preisSaveBtn.addEventListener("click", () => {
      const data = [];
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
  } else {
    console.warn("Button #preisSaveBtn nicht gefunden!");
  }

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
}

// Beispiel für Event-Listener für Klickdaten
function handleCellChange(cellId, value) {
  clickData[cellId] = value;
  saveClickData(monthKey, clickData);
}

function renderTable(data) {
  // TODO: Deine DOM-Logik hier mit clickData
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
