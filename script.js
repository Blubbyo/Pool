document.addEventListener("DOMContentLoaded", () => {
  const tasks = {
    "Täglich": [
      'Oberflächenskimmer entleeren / höhe kontrollieren',
      '5h+ Filteranlage betreiben (26m³/6m³)',
      'Sichtkontrolle: Pooloberfläche auf Schmutz, Trübung oder Algen prüfen'
    ],
    "Wöchentlich": [
      'Wasser testen: Mit Teststreifen oder Pooltester (pH 7,0-7,4, Chlor 0,3-1,5 mg/l)',
      'Chemie dosieren: Multitabs in den Skimmerkorb legen (nie direkt in den Pool)',
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
          if (savedClicks[cellId]) {
            cell.classList.add("clicked");
            cell.textContent = "✓";
          }
          if (d === dayToday) cell.classList.add("today-column");

          const date = new Date(year, month, d);
          if (date.getDay() === 1) cell.classList.add("week-separator"); // Montag

		cell.addEventListener("click", () => {
		  cell.classList.toggle("clicked");
		  cell.textContent = cell.classList.contains("clicked") ? "✓" : "";
		  savedClicks[cellId] = cell.classList.contains("clicked");
		  localStorage.setItem(cookieKey, JSON.stringify(savedClicks));

		  // Woche neu prüfen
		  document.querySelectorAll(".week-missing").forEach(el => el.classList.remove("week-missing"));
		  highlightUnfinishedWeeklyTasks();
		});


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
		  const weekClicked = weekCells.some(cell => cell.classList.contains("clicked"));
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

  createHeaderRow();
  createTaskRows();
  cleanupOldCookies();
});
