// datan tallennus
let csvData = [];
// Kuuntelija valitsijalle
document.getElementById('csvFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const reader = new FileReader();

    //Määritellään mitä tehdään kun tiedosto luetaan
    reader.onload = function(e) {
        const content = e.target.result; // SIsältö
        csvData = parseCSV(content); // Muuttaa datan taulikko muotoon
        populateDateInputs(); //Päivämääräkentät
    };

    reader.readAsText(file); //luetaan tiedosto tekstinä
});

function parseCSV(content) {
    const lines = content.split('\n'); //Jaetaan riveihin
    return lines.map(line => line.split(',')); // Jaetaan rivit pilkulla
}


function populateDateInputs() {
    if (csvData.length > 1) {
        // Otetaan päivämäärät ilman cvs otsikkoriviä
        const dates = csvData.slice(1).map(row => row[0].split(' ')[0]); 
        const minDate = dates.reduce((a, b) => a < b ? a : b);
        const maxDate = dates.reduce((a, b) => a > b ? a : b);
        // Arvot kenttiin
        document.getElementById('startDate').value = minDate;
        document.getElementById('startDate').min = minDate;
        document.getElementById('startDate').max = maxDate;

        document.getElementById('endDate').value = maxDate;
        document.getElementById('endDate').min = minDate;
        document.getElementById('endDate').max = maxDate;
    }
}
// datan näyttäminen ja suodatus
function showData() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    const filteredData = csvData.slice(1).filter(row => {
        const rowDate = row[0].split(' ')[0]; // Ottaa vain päivämäärän
        return rowDate >= startDate && rowDate <= endDate;
    });

    displayData(filteredData);
}

//taulukko
function displayData(data) {
    const output = document.getElementById('output');
    output.innerHTML = '';

    if (data.length > 0) {
        const table = document.createElement('table');
        table.border = '1';

        // Otsikkorivi
        const headerRow = table.insertRow();
        ['Päivämäärä', 'Ovi', 'Sisään', 'Ulos'].forEach(header => {
            const cell = headerRow.insertCell();
            cell.textContent = header;
        });

        // Datatrivit
        data.forEach(row => {
            const dataRow = table.insertRow();
            
            // Päivämäärä ja päivämäärän kääntö muotoon DD.MM.YYYY
            const dateCell = dataRow.insertCell();
            const originalDate = row[0].split(' ')[0];
            const [year, month, day] = originalDate.split('-');
            const formattedDate = `${day}.${month}.${year}`; 
            dateCell.textContent = formattedDate;
            dateCell.className = 'date-cell';


            // Mikä ovi kyseessä
            const doorCell = dataRow.insertCell();
            doorCell.textContent = row[3];
            
            // Sisään
            const inCell = dataRow.insertCell();
            inCell.textContent = row[4];
            
            // Ulos
            const outCell = dataRow.insertCell();
            outCell.textContent = row[5];
        });

        output.appendChild(table);
    } else {
        output.textContent = 'Ei tuloksia valitulla aikavälillä.';
    }
    
}

// Taulukko ohjelmaan vienti. Toimii oikein openofficella, exceliin tulee vääriä merkkejä
function exportToExcel() {
    let table = document.querySelector('.data-table');
    
    if (!table) {
        table = document.querySelector('table');
    }
    
    if (!table) {
        alert('Ei tietoja vietäväksi. Näytä ensin taulukko.');
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";

    // Lisää otsikkorivi vain kerran
    const headerRow = table.querySelector('tr');
    if (headerRow) {
        const headers = Array.from(headerRow.children).map(cell => cell.textContent.trim());
        csvContent += headers.join(',') + "\n";
    }

    // Lisää datatrivit (ohita ensimmäinen rivi, koska se on otsikkorivi)
    const rows = table.querySelectorAll('tr');
    Array.from(rows).slice(1).forEach(row => {
        const cells = row.querySelectorAll('td');
        const rowData = Array.from(cells).map(cell => cell.textContent.trim());
        csvContent += rowData.join(',') + "\n";
    });

    if (csvContent === "data:text/csv;charset=utf-8,") {
        alert('Taulukossa ei ole vietävää dataa.');
        return;
    }

    // Koodaa URI-komponentiksi
    const encodedUri = encodeURI(csvContent);
    
    // Luo väliaikainen linkki ja klikkaa sitä ladataksesi tiedoston
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "taulukko_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}