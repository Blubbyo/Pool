// Produkte fix definieren
const produktNamen = [
  "200g Chlortabletten",
  "pH Minus",
  "pH Plus",
  "Algenschutzmittel",
  "Phenol Red",
  "DPD Nr. 1"
];


document.addEventListener("DOMContentLoaded", () => {
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

  const table = document.getElementById("poolTable");
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const dayToday = today.getDate();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthYearText = today.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });

  /* document.getElementById("monthYear").textContent = monthYearText;*/

  const cookieKey = `poolTable_${year}-${month + 1}`;
  const savedClicks = JSON.parse(localStorage.getItem(cookieKey) || '{}');

  let rowIndex = 0;

  const createHeaderRow = () => {
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
  };

  const createTaskRows = () => {
    for (const [category, items] of Object.entries(tasks)) {
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
      // Dropdown für pH
      const select = document.createElement("select");
      ["–", "<6.8", "6.8", "6.9", "7.0", "7.1", "7.2", "7.3", "7.4", "7.5", "7.6", ">7.6"].forEach(val => {
        const option = document.createElement("option");
        option.value = val;
        option.textContent = val;
        select.appendChild(option);
      });
      select.value = savedClicks[cellId] || "–";

      select.addEventListener("change", () => {
        savedClicks[cellId] = select.value;
        localStorage.setItem(cookieKey, JSON.stringify(savedClicks));
        document.querySelectorAll(".week-missing").forEach(el => el.classList.remove("week-missing"));
        highlightUnfinishedWeeklyTasks();
      });

      cell.appendChild(select);

    } else if (task.startsWith("Wasser testen Chlor")) {
      // Dropdown für Chlor
      const select = document.createElement("select");
      ["–", "0.0", "0.3", "0.6", "1.0", "1.5", ">1.5"].forEach(val => {
        const option = document.createElement("option");
        option.value = val;
        option.textContent = val;
        select.appendChild(option);
      });
      select.value = savedClicks[cellId] || "–";

      select.addEventListener("change", () => {
        savedClicks[cellId] = select.value;
        localStorage.setItem(cookieKey, JSON.stringify(savedClicks));
        document.querySelectorAll(".week-missing").forEach(el => el.classList.remove("week-missing"));
        highlightUnfinishedWeeklyTasks();
      });

      cell.appendChild(select);

    } else {
      // Standard-Klickzelle mit ✓
      if (savedClicks[cellId]) {
        cell.classList.add("clicked");
        cell.textContent = "✓";
      }
      cell.addEventListener("click", () => {
        cell.classList.toggle("clicked");
        cell.textContent = cell.classList.contains("clicked") ? "✓" : "";
        savedClicks[cellId] = cell.classList.contains("clicked");
        localStorage.setItem(cookieKey, JSON.stringify(savedClicks));
        document.querySelectorAll(".week-missing").forEach(el => el.classList.remove("week-missing"));
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

    highlightUnfinishedWeeklyTasks(); // initial prüfen
  };

	 function getISOWeekKey(date) {
	  const temp = new Date(date);
	  temp.setHours(0, 0, 0, 0);
	  temp.setDate(temp.getDate() + 3 - ((temp.getDay() + 6) % 7));
	  const week1 = new Date(temp.getFullYear(), 0, 4);
	  const weekNumber = 1 + Math.round(((temp - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
	  return `${temp.getFullYear()}-KW${String(weekNumber).padStart(2, '0')}`;
	}

  
	const highlightUnfinishedWeeklyTasks = () => {
	  const allRows = Array.from(table.querySelectorAll("tr"));
	  let isInWeeklySection = false;

	  allRows.forEach(row => {
		if (row.classList.contains("section-header")) {
		  isInWeeklySection = row.textContent.trim() === "Wöchentlich";
		  return;
		}

		if (!isInWeeklySection) return;

		const cells = Array.from(row.querySelectorAll("td")).slice(1); // Zellen für jeden Tag
		const cellMap = {}; // Woche → [Zellen]

		cells.forEach((cell, i) => {
		  const date = new Date(year, month, i + 1);
		  // ISO Woche: Woche beginnt am Montag (1), Sonntag = 7
		  const weekKey = getISOWeekKey(date);

		  if (!cellMap[weekKey]) cellMap[weekKey] = [];
		  cellMap[weekKey].push(cell);
		});

		Object.values(cellMap).forEach(weekCells => {
		  const weekClicked = weekCells.some(cell => {
  const select = cell.querySelector("select");
  if (select) return select.value !== "–"; // Dropdown ausgefüllt
  return cell.classList.contains("clicked"); // Standardzelle ✓
});

		  if (!weekClicked) {
			weekCells.forEach(cell => cell.classList.add("week-missing"));
		  }
		});
	  });
	};



  const cleanupOldCookies = () => {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith("poolTable_") && key !== cookieKey) {
        localStorage.removeItem(key);
      }
    }
  };

  
const VERBRAUCH_KEY = "verbrauchTableData";

// Neue Zeile oben einfügen
document.getElementById("addRowBtn").addEventListener("click", () => {
  const tbody = document.getElementById("verbrauchBody");
  const newRow = createVerbrauchRow();
  tbody.insertBefore(newRow, tbody.firstChild);
  saveVerbrauchData(); // gleich speichern
});

// Verbrauchs-Zeile erzeugen
function createVerbrauchRow(rowData = {}) {
  const row = document.createElement("tr");
  const fields = ["date", "chlortabs", "phMinus", "phPlus", "algen", "phenol", "dpd"];
  const inputRefs = [];

  fields.forEach((field, index) => {
    const td = document.createElement("td");
    const input = document.createElement("input");

    input.type = index === 0 ? "date" : "number";
    if (index !== 0) {
      input.min = 0;
      input.step = 1;
    }

    input.value = rowData[field] || "";
    input.addEventListener("change", saveVerbrauchData);
    td.appendChild(input);
    row.appendChild(td);
    inputRefs.push(input);
  });

  // 🗑 Löschen-Button
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


// Speichert alle Zeilen im LocalStorage
function saveVerbrauchData() {
  const rows = document.querySelectorAll("#verbrauchBody tr");
  const data = [];

  rows.forEach(tr => {
    const inputs = tr.querySelectorAll("input");
    if (inputs.length !== 7) return;

    data.push({
      date: inputs[0].value,
      chlortabs: inputs[1].value,
      phMinus: inputs[2].value,
      phPlus: inputs[3].value,
      algen: inputs[4].value,
      phenol: inputs[5].value,
      dpd: inputs[6].value
    });
  });

  localStorage.setItem(VERBRAUCH_KEY, JSON.stringify(data));
}

// Lädt Daten aus LocalStorage
function loadVerbrauchData() {
  const tbody = document.getElementById("verbrauchBody");
  const savedData = JSON.parse(localStorage.getItem(VERBRAUCH_KEY) || "[]");

  savedData.forEach(rowData => {
    const row = createVerbrauchRow(rowData);
    tbody.appendChild(row); // unten aufbauen, da vorher kein Sort nötig
  });
}


//document.getElementById("exportBtn").addEventListener("click", () => {
//  const rows = document.querySelectorAll("#verbrauchBody tr");
//  const csvRows = [
//    ["Datum", "200g Chlortabletten", "pH Minus", "pH Plus", "Algenschutzmittel", "Phenol Red", "DPD Nr. 1"]
//  ];

//  rows.forEach(tr => {
//    const inputs = tr.querySelectorAll("input");
//    if (inputs.length !== 7) return;

//    const row = Array.from(inputs).map(input => `"${input.value}"`);
//    //csvRows.push(row);
//const getPriceFor = (productName, dateStr) => {
//  const all = JSON.parse(localStorage.getItem(PRICE_KEY) || "[]")
//    .filter(p => p.name === productName && p.ab <= dateStr)
//    .sort((a, b) => b.ab.localeCompare(a.ab)); // neuester zuerst

//  return all.length > 0 ? all[0].preis : 0;
//};

//const row = Array.from(inputs).map(input => input.value);
//const dateStr = row[0];

//const cost = produktNamen.map((name, i) => {
//  const menge = parseFloat(row[i + 1]) || 0;
 // const preis = getPriceFor(name, dateStr);
 // return (menge * preis).toFixed(2);
//});
//csvRows.push([...row, ...cost]);

//  });

//  const csvString = csvRows.map(r => r.join(",")).join("\n");
//  const blob = new Blob([csvString], { type: "text/csv" });
//  const url = URL.createObjectURL(blob);

//  const a = document.createElement("a");
//  a.href = url;
//  a.download = `Verbrauch_${new Date().toISOString().slice(0, 10)}.csv`;
//  a.click();

//  URL.revokeObjectURL(url);
//});

let viewYear, viewMonth; // global für Navigation

function renderMonthTable(year, month) {
  const table = document.getElementById("previousMonthTable");
  table.innerHTML = ""; // alte Inhalte löschen
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cookieKey = `poolTable_${year}-${month + 1}`;
  const savedClicks = JSON.parse(localStorage.getItem(cookieKey) || '{}');

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

  // Monatsanzeige aktualisieren
  const displayText = new Date(year, month).toLocaleDateString("de-DE", {
    month: "long",
    year: "numeric"
  });
  document.getElementById("displayedMonth").textContent = `Angezeigter Monat: ${displayText}`;

  // Kopfzeile
  const headerRow = document.createElement("tr");
  headerRow.appendChild(document.createElement("th")); // leer
  for (let d = 1; d <= daysInMonth; d++) {
    const th = document.createElement("th");
    const date = new Date(year, month, d);
    const weekday = date.toLocaleDateString('de-DE', { weekday: 'short' });
    th.textContent = `${weekday}\n${String(d).padStart(2, '0')}.${String(month + 1).padStart(2, '0')}`;
    headerRow.appendChild(th);
  }
  table.appendChild(headerRow);

  // Aufgaben
  let rowIndex = 0;
  for (const [category, items] of Object.entries(tasks)) {
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
        const td = document.createElement("td");
        const cellId = `${rowIndex}_${d}`;
        const val = savedClicks[cellId];

        if (task.startsWith("Wasser testen pH") || task.startsWith("Wasser testen Chlor")) {
          td.textContent = val || "–";
        } else {
          if (val === true) {
            td.textContent = "✓";
            td.classList.add("clicked");
          } else {
            td.textContent = "";
          }
        }

        row.appendChild(td);
      }

      table.appendChild(row);
      rowIndex++;
    });
  }
}

document.getElementById("prevMonthBtn").addEventListener("click", () => {
  if (viewMonth === 0) {
    viewMonth = 11;
    viewYear--;
  } else {
    viewMonth--;
  }
  renderMonthTable(viewYear, viewMonth);
});

document.getElementById("nextMonthBtn").addEventListener("click", () => {
  if (viewMonth === 11) {
    viewMonth = 0;
    viewYear++;
  } else {
    viewMonth++;
  }
  renderMonthTable(viewYear, viewMonth);
});

//const today = new Date();
viewYear = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();
viewMonth = today.getMonth() === 0 ? 11 : today.getMonth() - 1;
renderMonthTable(viewYear, viewMonth);

const PRICE_KEY = "preisListe";



// Preis hinzufügen
document.getElementById("addPriceBtn").addEventListener("click", () => {
  const row = createPriceRow();
  document.getElementById("preisBody").appendChild(row);
  savePrices();
});

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

function savePrices() {
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
  localStorage.setItem(PRICE_KEY, JSON.stringify(data));
}

function loadPrices() {
  const saved = JSON.parse(localStorage.getItem(PRICE_KEY) || "[]");
  const tbody = document.getElementById("preisBody");
  saved.forEach(row => {
    const r = createPriceRow(row);
    tbody.appendChild(r);
  });
}


// Beim Start laden
  loadVerbrauchData();  
  createHeaderRow();
  createTaskRows();
  //createPreviousMonthTable();
  cleanupOldCookies();
  loadPrices();

});
