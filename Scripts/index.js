let selectedKey = null, x, y = [];

document.addEventListener('DOMContentLoaded', () => {
    new bootstrap.Carousel('#carousel-container', { interval: false, wrap: true });
});

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    document.getElementById('theme-icon').classList.toggle('bi-moon-fill');
    document.getElementById('theme-icon').classList.toggle('bi-sun-fill');
    document.querySelectorAll('#carousel-inner table').forEach(table => {
        table.classList.toggle('table-dark', document.body.classList.contains('dark-mode'));
    });
}

function displayCsvInTable(csvText, fileName) {
    const [header, ...rows] = csvText.trim().split('\n').map(line => line.split(',').map(cell => cell.trim()));
    const isActive = document.querySelectorAll('.carousel-item').length === 0 ? ' active' : '';
    const isDarkMode = document.body.classList.contains('dark-mode'); // Check if dark mode is active
    const tableHTML = `
        <div class="carousel-item${isActive}">
            <div class="csv-table-wrapper mb-5">
                <h5>File: ${fileName}</h5>
                <div class="scrollable-container">
                    <table class="table table-striped table-bordered ${isDarkMode ? 'table-dark' : ''}">
                        <thead>
                            <tr>${header.map((h, colIndex) => `<th style="cursor:pointer" data-col="${colIndex + 1}">${h}</th>`).join('')}</tr>
                        </thead>
                        <tbody>
                            ${rows.slice(0, 10).map((row, rowIndex) => `
                                <tr>${row.map((cell, colIndex) => `
                                    <td style="cursor:pointer" data-row="${rowIndex + 1}" data-col="${colIndex + 1}">${cell}</td>
                                `).join('')}</tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    document.getElementById('carousel-inner').insertAdjacentHTML('beforeend', tableHTML);

    // Event Delegation for Cell and Header Clicks
    const lastTable = document.querySelector('#carousel-inner .carousel-item:last-child table');
    lastTable.addEventListener('click', e => {
        if (e.target.tagName === 'TD' || e.target.tagName === 'TH') {
            const cellIndex = {
                row: e.target.tagName === 'TD' ? +e.target.dataset.row : null,
                col: +e.target.dataset.col
            };
            if (selectedKey === 'x') x = cellIndex;
            else if (selectedKey === 'y') y.push(cellIndex);
            console.log(`Saved to ${selectedKey}:`, cellIndex);
            selectedKey = null;
            updateIconHighlight();
        }
    });
}

// File Upload Logic
document.getElementById('file-upload').addEventListener('change', event => {
    for (const file of event.target.files) {
        if (file.type === 'text/csv') {
            const reader = new FileReader();
            reader.onload = e => displayCsvInTable(e.target.result, file.name);
            reader.readAsText(file);
        } else {
            alert("Please upload a valid CSV file.");
        }
    }
});

// Key Selection Logic with Icon Highlighting
document.addEventListener('keydown', event => {
    if (['x', 'y'].includes(event.key)) {
        selectedKey = event.key;
        console.log(`Selected key: ${selectedKey}`);
        updateIconHighlight();
    }else if(event.key === 'Escape')
    {
        selectedKey = null;
        console.log(`Selected key: ${selectedKey}`);
        updateIconHighlight();
    
    }
});

function updateIconHighlight() {
    document.getElementById('x-icon').classList.toggle('active', selectedKey === 'x');
    document.getElementById('y-icon').classList.toggle('active', selectedKey === 'y');
}

