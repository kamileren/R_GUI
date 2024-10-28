let selectedKey = null;
let csvSettings = [];

document.addEventListener('DOMContentLoaded', () => {
    const carousel = new bootstrap.Carousel('#carousel-container', { interval: false, wrap: true });

    document.getElementById('carousel-container').addEventListener('slid.bs.carousel', () => {
        const activeItem = document.querySelector('#carousel-inner .carousel-item.active');
        if (activeItem) {
            const settingsIndex = activeItem.getAttribute('data-settings-index');
            highlightCsvListItem(settingsIndex);
        }
    });
});

function highlightCsvListItem(settingsIndex) {
    document.querySelectorAll('#csv-list .csv-list-item').forEach(item => {
        item.classList.toggle('active', item.dataset.settingsIndex === settingsIndex);
    });
}


function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const themeIcon = document.getElementById('theme-icon');
    themeIcon.classList.toggle('bi-moon-fill');
    themeIcon.classList.toggle('bi-sun-fill');
    document.querySelectorAll('#carousel-inner table').forEach(table => {
        table.classList.toggle('table-dark', document.body.classList.contains('dark-mode'));
    });
}

function displayCsvInTable(csvText, fileName, settingsIndex) {
    const [header, ...rows] = csvText.trim().split('\n').map(line => line.split(',').map(cell => cell.trim()));
    const isActive = document.querySelectorAll('.carousel-item').length === 0 ? ' active' : '';
    const isDarkMode = document.body.classList.contains('dark-mode');
    const tableHTML = `
        <div class="carousel-item${isActive}" data-settings-index="${settingsIndex}">
            <div class="csv-table-wrapper mb-5">
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

    // Highlight the newly added CSV immediately
    highlightCsvListItem(settingsIndex);

    // Add event listener for cell clicks
    const lastTable = document.querySelector('#carousel-inner .carousel-item:last-child table');
    lastTable.addEventListener('click', e => {
        if (e.target.tagName === 'TD' || e.target.tagName === 'TH') {
            const cellIndex = {
                row: e.target.tagName === 'TD' ? +e.target.dataset.row : null,
                col: +e.target.dataset.col,
            };
            const currentSettings = getCurrentSettings();
            if (currentSettings) {
                if (selectedKey === 'x') {
                    currentSettings.x = cellIndex;
                } else if (selectedKey === 'y') {
                    currentSettings.y.push(cellIndex);
                }
                console.log(`Saved to ${selectedKey}:`, cellIndex);
                selectedKey = null;
                updateIconHighlight();
            }
        }
    });
}

document.getElementById('file-upload').addEventListener('change', event => {
    const csvList = document.getElementById('csv-list');
    const isFirstUpload = csvList.childElementCount === 0; // Check if the list is empty

    Array.from(event.target.files).forEach((file, index) => {
        if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
            const reader = new FileReader();
            reader.onload = e => {
                const settings = { name: file.name, x: null, y: [] };
                csvSettings.push(settings);
                const settingsIndex = csvSettings.length - 1;
                displayCsvInTable(e.target.result, file.name, settingsIndex);

                const listItem = document.createElement('li');
                listItem.classList.add('csv-list-item', 'my-1', 'w-100', 'text-start', 'cursor-pointer');
                listItem.textContent = file.name;
                listItem.dataset.settingsIndex = settingsIndex;

                // Add active class to the first list item only if this is the initial upload
                if (isFirstUpload && index === 0) {
                    listItem.classList.add('active');
                }

                // Add click event to navigate to the corresponding carousel item
                listItem.addEventListener('click', () => {
                    const carousel = bootstrap.Carousel.getInstance(document.getElementById('carousel-container'));
                    carousel.to(parseInt(listItem.dataset.settingsIndex));
                });

                csvList.appendChild(listItem);
            };
            reader.readAsText(file);
        } else {
            alert("Please upload a valid CSV file.");
        }
    });
});




document.addEventListener('keydown', event => {
    if (['x', 'y'].includes(event.key)) {
        selectedKey = event.key;
        updateIconHighlight();
    } else if (event.key === 'Escape') {
        selectedKey = null;
        updateIconHighlight();
    }
});

function updateIconHighlight() {
    document.getElementById('x-icon').classList.toggle('active', selectedKey === 'x');
    document.getElementById('y-icon').classList.toggle('active', selectedKey === 'y');
}

function getCurrentSettings() {
    const activeItem = document.querySelector('#carousel-inner .carousel-item.active');
    if (activeItem) {
        const settingsIndex = activeItem.getAttribute('data-settings-index');
        return csvSettings[settingsIndex];
    }
    return null;
}
