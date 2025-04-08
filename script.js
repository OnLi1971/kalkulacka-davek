// Data z převodové tabulky - přidána vypočítaná řádka pro 1.25 mg
const conversionTable = {
    // !!! HODNOTY PRO 1.25 mg JSOU DOPOČÍTANÉ - OVĚŘTE JEJICH SPRÁVNOST U LÉKAŘE/LÉKÁRNÍKA !!!
    1.25: {"Pero 2.5": 0.3, "Pero 5": 0.15, "Pero 7.5": 0.1, "Pero 10": 0.075, "Pero 12.5": 0.06, "Pero 15": 0.05},
    // Původní hodnoty z tabulky
    2.5: {"Pero 2.5": 0.6, "Pero 5": 0.3, "Pero 7.5": 0.2, "Pero 10": 0.15, "Pero 12.5": 0.12, "Pero 15": 0.1},
    3.75: {"Pero 2.5": 0.9, "Pero 5": 0.45, "Pero 7.5": 0.3, "Pero 10": 0.23, "Pero 12.5": 0.18, "Pero 15": 0.15},
    5: {"Pero 2.5": 1.2, "Pero 5": 0.6, "Pero 7.5": 0.4, "Pero 10": 0.3, "Pero 12.5": 0.24, "Pero 15": 0.2},
    7.5: {"Pero 2.5": 1.8, "Pero 5": 0.9, "Pero 7.5": 0.6, "Pero 10": 0.45, "Pero 12.5": 0.36, "Pero 15": 0.3},
    10: {"Pero 2.5": 2.4, "Pero 5": 1.2, "Pero 7.5": 0.8, "Pero 10": 0.6, "Pero 12.5": 0.48, "Pero 15": 0.4},
    12.5: {"Pero 2.5": 3.0, "Pero 5": 1.5, "Pero 7.5": 1.0, "Pero 10": 0.75, "Pero 12.5": 0.6, "Pero 15": 0.5},
    15: {"Pero 2.5": 3.6, "Pero 5": 1.8, "Pero 7.5": 1.2, "Pero 10": 0.9, "Pero 12.5": 0.72, "Pero 15": 0.6}
};

// Limity pro standardní 1ml stříkačky
const U100_SYRINGE_LIMIT = 100; // dílků
const U40_SYRINGE_LIMIT = 40;  // dílků

// Získání odkazů na HTML elementy
const doseSelect = document.getElementById('doseSelect');
const penSelect = document.getElementById('penSelect');
const calculateBtn = document.getElementById('calculateBtn');
const resultDiv = document.getElementById('result');
const syringeRadioButtons = document.querySelectorAll('input[name="syringeType"]');

// Naplnění možností pro výběr dávky - automaticky načte i novou dávku 1.25
const availableDoses = Object.keys(conversionTable).map(Number).sort((a, b) => a - b);
availableDoses.forEach(dose => {
    const option = document.createElement('option');
    option.value = dose;
    // Pro 0.075 zobrazíme 3 desetinná místa, jinak 2 (kvůli čárce)
    const doseString = dose.toString().replace('.', ',');
    option.textContent = doseString;
    doseSelect.appendChild(option);
});


// Naplnění možností pro výběr pera
const availablePens = Object.keys(conversionTable[availableDoses[0]]); // Bere typy per z první dávky
availablePens.forEach(pen => {
    const option = document.createElement('option');
    option.value = pen;
    option.textContent = pen + " mg";
    penSelect.appendChild(option);
});

// Funkce pro výpočet a zobrazení výsledku
function calculateVolume() {
    const selectedDose = parseFloat(doseSelect.value);
    const selectedPen = penSelect.value;
    let selectedSyringeType = 'other';

    syringeRadioButtons.forEach(radio => {
        if (radio.checked) {
            selectedSyringeType = radio.value;
        }
    });

    let volume = null;
    // Zkontrolujeme, zda pro zvolenou dávku existuje záznam a zda pro dané pero existuje hodnota
    if (conversionTable[selectedDose] && typeof conversionTable[selectedDose][selectedPen] !== 'undefined') {
         volume = conversionTable[selectedDose][selectedPen];
    }


    if (volume !== null) {
        // Zobrazíme objem na 3 des. místa, pokud je menší než 0.1 a není 0, jinak na 2
        const decimalPlaces = (volume < 0.1 && volume > 0) ? 3 : 2;
        const formattedVolume = volume.toFixed(decimalPlaces).replace('.', ',');

        const selectedPenText = penSelect.options[penSelect.selectedIndex].text;
        let resultHTML = `Pro dávku <strong>${selectedDose.toString().replace('.', ',')} mg</strong> z pera <strong>'${selectedPenText}'</strong> natáhněte:<br>➡️ <span class="volume">${formattedVolume} ml</span>`;

        let marks = null;
        let warningMessage = ""; // Proměnná pro varování

        if (selectedSyringeType === 'U100') {
            marks = Math.round(volume * 100);
            resultHTML += `<br><span class="marks">➡️ ${marks} dílků na U100</span>`;
            if (marks > U100_SYRINGE_LIMIT) {
                warningMessage = `<br><span class="warning">⚠️ Překračuje kapacitu standardní 1ml U100 stříkačky (${U100_SYRINGE_LIMIT} dílků)!</span>`;
            }
        } else if (selectedSyringeType === 'U40') {
            marks = Math.round(volume * 40);
            resultHTML += `<br><span class="marks">➡️ ${marks} dílků na U40</span>`;
            if (marks > U40_SYRINGE_LIMIT) {
                warningMessage = `<br><span class="warning">⚠️ Překračuje kapacitu standardní 1ml U40 stříkačky (${U40_SYRINGE_LIMIT} dílků)!</span>`;
            }
        }

        resultHTML += warningMessage;

        resultDiv.innerHTML = resultHTML;
        resultDiv.className = 'result-success';
    } else {
        // Zde by mohl být případ, kdy kombinace dávky a pera nemá hodnotu (např. chyba v datech)
        resultDiv.textContent = 'Chyba: Pro tuto kombinaci nebyla nalezena hodnota v tabulce.';
        resultDiv.className = 'result-error';
    }
}

// Přidání posluchače události na tlačítko
calculateBtn.addEventListener('click', calculateVolume);

// Inicializace výchozího textu v poli pro výsledek
resultDiv.textContent = 'Vyberte hodnoty a klikněte na tlačítko.';
resultDiv.className = '';