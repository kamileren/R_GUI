function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const themeIcon = document.getElementById('theme-icon');
    themeIcon.classList.toggle('bi-moon-fill');
    themeIcon.classList.toggle('bi-sun-fill');

    // Check if a table exists and toggle its dark mode class based on current theme
    const table = document.getElementById('csv-table');
    if (table) {
        if (document.body.classList.contains('dark-mode')) {
            table.classList.add('table-dark');
        } else {
            table.classList.remove('table-dark');
        }
    }
}

document.getElementById('file-upload').addEventListener('change', (event) => {
    const files = event.target.files;
    if (files.length > 0) {
        Array.from(files).forEach(file => {
            if (file.type === 'text/csv') {
                const reader = new FileReader();
                reader.onload = (e) => displayCsvInTable(e.target.result, file.name);
                reader.readAsText(file);
            } else {
                alert("Please upload a valid CSV file.");
            }
        });
    }
});

function displayCsvInTable(csvText, fileName) {
    const [header, ...rows] = csvText.trim().split('\n').map(line => line.split(',').map(cell => cell.trim()));
    const tableContainer = document.getElementById('table-container');

    // Create a wrapper div for each CSV table
    const tableWrapper = document.createElement('div');
    tableWrapper.classList.add('csv-table-wrapper');
    tableWrapper.classList.add('mb-5'); // Add spacing between tables

    // Create a label for the CSV file name
    const fileLabel = document.createElement('h5');
    fileLabel.textContent = `File: ${fileName}`;
    tableWrapper.appendChild(fileLabel);

    // Create the table element
    const table = document.createElement('table');
    table.className = 'table table-striped table-bordered';
    table.classList.add('table-responsive');
    table.id = `csv-table-${fileName.replace(/\W+/g, '-')}`; // Unique ID for each table

    // Add dark mode class if currently in dark mode
    if (document.body.classList.contains('dark-mode')) {
        table.classList.add('table-dark');
    }

    // Create the table header
    const thead = document.createElement('thead');
    thead.innerHTML = `<tr>${header.map(h => `<th>${h}</th>`).join('')}</tr>`;
    table.appendChild(thead);

    // Create the table body with a limited number of rows
    const tbody = document.createElement('tbody');
    tbody.innerHTML = rows.slice(0, 5).map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('');
    table.appendChild(tbody);

    // Append the table to the wrapper div, then add the wrapper to the container
    tableWrapper.appendChild(table);
    tableContainer.appendChild(tableWrapper);
}
