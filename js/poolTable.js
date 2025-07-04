// js/poolTable.js
import { db } from './firebase-init.js';
import { ref, get, set } from  "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";
import { produktNamen } from './main.js';


// Oben im Script (global):
let clickData = {};


export async function loadClickData() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1; // +1, da Januar = 0
  const key = `poolTable_${year}-${month}`;

  try {
    const snapshot = await get(ref(db, `clickdaten/${key}`));

    if (snapshot.exists()) {
      const data = snapshot.val();
      console.log(`Clickdaten von '${key}' geladen.`, data);
      return data;
    } else {
      console.log(`Keine Clickdaten unter '${key}' gefunden.`);
      return {}; // leeres Objekt zurückgeben
    }

  } catch (err) {
    console.error("Fehler beim Laden der Clickdaten:", err);
    return {}; // Fehlerfall: ebenfalls leeres Objekt zurückgeben
  }
}
export async function saveClickData( data) {
  if (!data) {
    console.error("Keine Daten zum Speichern");
    return;
  }

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1; // +1 weil getMonth() von 0–11 geht
  const key = `poolTable_${year}-${month}`;

  try {
    await set(ref(db, `clickdaten/${key}`), data);
    console.log(`Clickdaten unter '${key}' erfolgreich gespeichert.`);
  } catch (err) {
    console.error("Fehler beim Speichern der Clickdaten:", err);
  }
}


const table = document.getElementById("poolTable");

const tasks = {
  "Täglich": [
    'Oberflächenskimmer entleeren / höhe kontrollieren',
    '5h+ Filteranlage betreiben (26m³/6m³)',
    'Sichtkontrolle: Pooloberfläche auf Schmutz, Trübung oder Algen prüfen'
  ],
  "Wöchentlich": [
    'Wasser testen pH 7,0-7,4',
    'Wasser testen Chlor 0,3-1,5 mg/l)',
    'Chemie dosieren: Multitabs in den Skimmerkorb legen',
    'Rückspülen: Wöchentlich oder bei hohem Filterdruck (>1bar), danach Nachspülen (30s)',
    'Boden saugen',
    'Wände bürsten',
    'Algenschutzmittel'
  ]
};

const today = new Date();
const year = today.getFullYear();
const month = today.getMonth();
const dayToday = today.getDate();
const daysInMonth = new Date(year, month + 1, 0).getDate();

//let clickData = {};  // die Daten aus Firebase

// Lade Daten aus Firebase
//async function loadClickData() {
//  try {
//    const snapshot = await get(ref(db, 'clickdaten'));
//    if (snapshot.exists()) {
//      return snapshot.val();
//    } else {
//      return {};
//    }
//  } catch (err) {
//    console.error('Fehler beim Laden der Daten:', err);
//    return {};
//  }
//}

// Speichere Daten in Firebase
//async function saveClickData(data) {
//  try {
//    await set(ref(db, 'clickdaten'), data);
//    console.log('Daten erfolgreich gespeichert');
//  } catch (err) {
//    console.error('Fehler beim Speichern der Daten:', err);
//  }
//}

// Erzeuge Tabellenkopf mit Tagen
function createHeaderRow() {
  const headerRow = document.createElement("tr");
  const emptyCell = document.createElement("th");
  headerRow.appendChild(emptyCell);

  for (let d = 1; d <= daysInMonth; d++) {
    const th = document.createElement("th");
    const date = new Date(year, month, d);
    const weekday = date.toLocaleDateString('de-DE', { weekday: 'short' });
    th.textContent = `${weekday}\n${String(d).padStart(2, '0')}.${String(month + 1).padStart(2, '0')}`;
    if (d === dayToday) th.classList.add("today-column");
    if (date.getDay() === 1) th.classList.add("week-separator"); // Montag
    headerRow.appendChild(th);
  }

  table.appendChild(headerRow);
}

// Zeichne die Tabelle basierend auf clickData
function renderTable(data) {
  table.innerHTML = ""; // clear table

  createHeaderRow();

  let rowIndex = 0;

  for (const [category, items] of Object.entries(tasks)) {
    // Kategoriezeile
    const sectionRow = document.createElement("tr");
    sectionRow.classList.add("section-header");
    const sectionCell = document.createElement("td");
    sectionCell.colSpan = daysInMonth + 1;
    sectionCell.textContent = category;
    sectionRow.appendChild(sectionCell);
    table.appendChild(sectionRow);

    items.forEach(task => {
      const row = document.createElement("tr");
      const taskCell = document.createElement("td");
      taskCell.textContent = task;
      row.appendChild(taskCell);

      for (let d = 1; d <= daysInMonth; d++) {
        const cellId = `${rowIndex}_${d}`;
        const cell = document.createElement("td");

        if (task.startsWith("Wasser testen pH")) {
          const select = document.createElement("select");
          ["–", "<6.8", "6.8", "6.9", "7.0", "7.1", "7.2", "7.3", "7.4", "7.5", "7.6", "7.7", "7.8", "7.9", ">7.9"].forEach(val => {
            const option = document.createElement("option");
            option.value = val;
            option.textContent = val;
            select.appendChild(option);
          });
          select.value = data[cellId] || "–";

          select.addEventListener("change", async () => {
            data[cellId] = select.value;
            await saveClickData(data);
            highlightUnfinishedWeeklyTasks();
          });

          cell.appendChild(select);

        } else if (task.startsWith("Wasser testen Chlor")) {
          const select = document.createElement("select");
          ["–", "0.0", "0.3", "0.6", "1.0", "1.5", ">1.5"].forEach(val => {
            const option = document.createElement("option");
            option.value = val;
            option.textContent = val;
            select.appendChild(option);
          });
          select.value = data[cellId] || "–";

          select.addEventListener("change", async () => {
            data[cellId] = select.value;
            await saveClickData(data);
            highlightUnfinishedWeeklyTasks();
          });

          cell.appendChild(select);

        } else {
          if (data[cellId]) {
            cell.classList.add("clicked");
            cell.textContent = "✓";
          }

          cell.addEventListener("click", async () => {
            cell.classList.toggle("clicked");
            cell.textContent = cell.classList.contains("clicked") ? "✓" : "";
            data[cellId] = cell.classList.contains("clicked");
            await saveClickData(data);
            highlightUnfinishedWeeklyTasks();
          });
        }

        const date = new Date(year, month, d);
        if (d === dayToday) cell.classList.add("today-column");
        if (date.getDay() === 1) cell.classList.add("week-separator");

        row.appendChild(cell);
      }

      table.appendChild(row);
      rowIndex++;
    });
  }

  highlightUnfinishedWeeklyTasks();
  addCostSummaryRow();
}

// Highlight-Funktion bleibt gleich
function getISOWeekKey(date) {
  const temp = new Date(date);
  temp.setHours(0, 0, 0, 0);
  temp.setDate(temp.getDate() + 3 - ((temp.getDay() + 6) % 7));
  const week1 = new Date(temp.getFullYear(), 0, 4);
  const weekNumber = 1 + Math.round(((temp - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${temp.getFullYear()}-KW${String(weekNumber).padStart(2, '0')}`;
}

function highlightUnfinishedWeeklyTasks() {
  const allRows = Array.from(table.querySelectorAll("tr"));
  let isInWeeklySection = false;

  allRows.forEach(row => {
    if (row.classList.contains("section-header")) {
      isInWeeklySection = row.textContent.trim() === "Wöchentlich";
      return;
    }

    if (!isInWeeklySection) return;

    const cells = Array.from(row.querySelectorAll("td")).slice(1);
    const cellMap = {};

    cells.forEach((cell, i) => {
      const date = new Date(year, month, i + 1);
      const weekKey = getISOWeekKey(date);

	  cell.classList.remove("week-missing");
	  
      if (!cellMap[weekKey]) cellMap[weekKey] = [];
      cellMap[weekKey].push(cell);
    });

    Object.values(cellMap).forEach(weekCells => {
      const weekClicked = weekCells.some(cell => {
        const select = cell.querySelector("select");
        if (select) return select.value !== "–";
        return cell.classList.contains("clicked");
      });

      if (!weekClicked) {
        weekCells.forEach(cell => cell.classList.add("week-missing"));
      }
    });
  });
}

export async function initPoolTable() {
  await loadPreise();
  clickData = await loadClickData(); // ← globale Variable aktualisieren
  renderTable(clickData);           // ← korrekt übergeben
}

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

let preisListe = [];



function getPreisZumDatum(name, datum) {
  const gültigePreise = preisListe
    .filter(p => p.name === name && p.ab <= datum)
    .sort((a, b) => b.ab - a.ab); // neueste zuerst

  return gültigePreise[0]?.preis || 0;
}

function getVerbrauchsDatenAusTabelle() {
  const tbody = document.getElementById("verbrauchBody");
  const rows = tbody.querySelectorAll("tr");
//const produktNamen = window.produktNamen || []; // Fallback falls global

  const stoffe = produktNamen.filter(name =>
    !["Leistungpumpe (W)", "Laufzeit (h)", "Strompreis"].includes(name)
  );

//	const stoffe = produktNamen

  const result = {};

  rows.forEach(row => {
    const inputs = row.querySelectorAll("input");
    if (inputs.length < 1 + stoffe.length + 3) return; // 1 Date + stoffe + 3 Sonderfälle

    const datumRaw = inputs[0].value;
    if (!datumRaw) return;

    const datum = new Date(datumRaw);
    const datumStr = datum.toISOString().slice(0, 10);

    result[datumStr] = {};

    // stoffe
    for (let i = 0; i < stoffe.length; i++) {
      const menge = parseFloat(inputs[i + 1].value);
      if (!isNaN(menge) && menge > 0) {
        result[datumStr][stoffe[i]] = menge;
      }
    }

    // Sonderwerte
    const leistung = parseFloat(inputs[1 + stoffe.length]?.value);
    const laufzeit = parseFloat(inputs[2 + stoffe.length]?.value);
    const strompreis = parseFloat(inputs[3 + stoffe.length]?.value);

    if (!isNaN(leistung)) result[datumStr]["Leistungpumpe (W)"] = leistung;
    if (!isNaN(laufzeit)) result[datumStr]["Laufzeit (h)"] = laufzeit;
    if (!isNaN(strompreis)) result[datumStr]["Strompreis"] = strompreis;
  });

  console.log("Verbrauchsdaten:", result);
  return result;
}

window.getVerbrauchsDatenAusTabelle = getVerbrauchsDatenAusTabelle;


function addCostSummaryRow() {
  const verbrauchDaten = getVerbrauchsDatenAusTabelle();

  //console.log(verbrauchDaten)
  
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
    let tooltip = "";

	//console.log(dayData)
	
    for (const [stoff, menge] of Object.entries(dayData)) {
      if (stoff === "Leistungpumpe (W)") continue;  // wird separat verrechnet
      if (stoff === "Strompreis") continue;         // ebenfalls
	  if (stoff === "Laufzeit (h)") continue;  // wird separat verrechnet

      const preis = getPreisZumDatum(stoff, datum);
      const kosten = menge * preis;
      sum += kosten;
      tooltip += `${stoff}: ${menge} × ${preis.toFixed(3)} € = ${kosten.toFixed(2)} €\n`;
    }

    // Sonderfall: Stromkosten berechnen
    const leistung = dayData["Leistungpumpe (W)"];
    const laufzeit = dayData["Laufzeit (h)"];
    const strompreis = dayData["Strompreis"];

    if (leistung && laufzeit && strompreis) {
      const stromkosten = (leistung * laufzeit * strompreis) / 1000;
      sum += stromkosten;
      tooltip += `Strom: ${leistung} W × ${laufzeit} h × ${strompreis} €/kWh = ${stromkosten.toFixed(2)} €\n`;
    }

    const cell = document.createElement("td");
    cell.textContent = sum.toFixed(2);
    cell.style.backgroundColor = "#e0f7fa";
    cell.style.fontWeight = "bold";
    cell.title = tooltip.trim();

    costRow.appendChild(cell);
  }

  table.appendChild(costRow);
}

