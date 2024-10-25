// Variables and Constants
let selectedKey = null;  // Tracks if "x" or "y" was pressed
let x;                   // Variable to store "x" index as an object { row: <row>, col: <col> }
const y = [];            // Array to store "y" indices as objects [{ row: <row>, col: <col> }, ...]

// Initialize the carousel on page load
document.addEventListener('DOMContentLoaded', () => {
    const carouselElement = document.getElementById('carousel-container');
    const carousel = new bootstrap.Carousel(carouselElement, {
        interval: false,  // Disables auto-slide
        wrap: true        // Allows cycling back to the first item when clicking "Next" on the last item
    });
});

// Functions
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const themeIcon = document.getElementById('theme-icon');
    themeIcon.classList.toggle('bi-moon-fill');
    themeIcon.classList.toggle('bi-sun-fill');

    // Select all tables within the carousel-inner container and update their theme
    const tables = document.querySelectorAll('#carousel-inner table');
    tables.forEach(table => {
        if (document.body.classList.contains('dark-mode')) {
            table.classList.add('table-dark');
        } else {
            table.classList.remove('table-dark');
        }
    });
}

function displayCsvInTable(csvText, fileName) {
    const [header, ...rows] = csvText.trim().split('\n').map(line => line.split(',').map(cell => cell.trim()));

    const carouselItem = document.createElement('div');
    carouselItem.classList.add('carousel-item');
    if (document.querySelectorAll('.carousel-item').length === 0) {
        carouselItem.classList.add('active');
    }

    const tableWrapper = document.createElement('div');
    tableWrapper.classList.add('csv-table-wrapper', 'mb-5');

    const fileLabel = document.createElement('h5');
    fileLabel.textContent = `File: ${fileName}`;
    tableWrapper.appendChild(fileLabel);

    const scrollableContainer = document.createElement('div');
    scrollableContainer.classList.add('scrollable-container');

    const table = document.createElement('table');
    table.className = 'table table-striped table-bordered';

    const thead = document.createElement('thead');
    thead.innerHTML = `<tr>${header.map(h => `<th style="cursor: pointer;">${h}</th>`).join('')}</tr>`;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    tbody.innerHTML = rows.slice(0, 10).map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('');
    table.appendChild(tbody);

    scrollableContainer.appendChild(table);
    tableWrapper.appendChild(scrollableContainer);
    carouselItem.appendChild(tableWrapper);
    document.getElementById('carousel-inner').appendChild(carouselItem);

    // Add click event listener to each cell and header to save index based on selected key
    table.querySelectorAll('thead th').forEach((headerCell, colIndex) => {
        headerCell.addEventListener('click', () => {
            if (selectedKey === 'x') {
                x = { row: 0, col: colIndex + 1 };  // Save as header column
                console.log(`Saved to x from header:`, x);
            } else if (selectedKey === 'y') {
                y.push({ row: 0, col: colIndex + 1 });
                console.log(`Saved to y array from header:`, y);
            }
            selectedKey = null;  // Reset the selected key after saving
        });
    });

    table.querySelectorAll('tbody tr').forEach((rowElement, rowIndex) => {
        rowElement.querySelectorAll('td').forEach((cellElement, colIndex) => {
            cellElement.style.cursor = 'pointer';
            cellElement.addEventListener('click', () => {
                const cellIndex = { row: rowIndex + 1, col: colIndex + 1 };  // One-based index

                if (selectedKey === 'x') {
                    x = cellIndex;
                    console.log(`Saved to x:`, x);
                } else if (selectedKey === 'y') {
                    y.push(cellIndex);
                    console.log(`Saved to y array:`, y);
                }
                selectedKey = null;  // Reset the selected key after saving
            });
        });
    });
}

// Event Listeners
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

document.addEventListener('keydown', (event) => {
    if (event.key === 'x') {
        selectedKey = 'x';
        console.log("Selected key: x");
    } else if (event.key === 'y') {
        selectedKey = 'y';
        console.log("Selected key: y");
    }
});

// Function to handle the "Select X" and "Select Y" icon clicks
function selectKey(key) {
    selectedKey = key;
    console.log(`Selected key: ${key}`);
}
