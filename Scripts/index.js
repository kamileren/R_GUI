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

function displayCsvInTable(header, rows, fileName, settingsIndex) {
    const isActive = document.querySelectorAll('.carousel-item').length === 0 ? ' active' : '';
    const isDarkMode = document.body.classList.contains('dark-mode');
    const tableHTML = `
        <div class="carousel-item${isActive}" data-settings-index="${settingsIndex}">
            <div class="csv-table-wrapper mb-5">
                <div class="scrollable-container">
                    <table class="table table-striped table-bordered ${isDarkMode ? 'table-dark' : ''}">
                        <thead>
                            <tr>${header.map((h, colIndex) => `<th style="cursor:pointer" data-row="-1" data-col="${colIndex}">${h}</th>`).join('')}</tr>
                        </thead>
                        <tbody>
                            ${rows.slice(0, 10).map((row, rowIndex) => `
                                <tr>${row.map((cell, colIndex) => `
                                    <td style="cursor:pointer" data-row="${rowIndex}" data-col="${colIndex}">${cell}</td>
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
            const colIndex = +e.target.dataset.col;
            const currentSettings = getCurrentSettings();
            if (currentSettings) {
                if (selectedKey === 'x') {
                    currentSettings.x = colIndex;
                } else if (selectedKey === 'y') {
                    if (!currentSettings.y.includes(colIndex)) {
                        currentSettings.y.push(colIndex);
                    }
                }
                console.log(`Saved to ${selectedKey}:`, colIndex);
                selectedKey = null;
                updateIconHighlight();
                // Plot data after selection
                plotData(currentSettings);
            }
        }
    });
}


document.getElementById('file-upload').addEventListener('change', event => {
    const csvList = document.getElementById('csv-list');

    Array.from(event.target.files).forEach((file, index) => {
        if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
            const reader = new FileReader();
            reader.onload = e => {
                const csvText = e.target.result;
                const [header, ...rows] = csvText.trim().split('\n').map(line => line.split(',').map(cell => cell.trim()));
                const settingsIndex = csvSettings.length;
                const settings = { name: file.name, x: null, y: [], header: header, rows: rows, settingsIndex: settingsIndex };
                csvSettings.push(settings);
                displayCsvInTable(header, rows, file.name, settingsIndex);

                const listItem = document.createElement('li');
                listItem.classList.add('csv-list-item', 'my-1', 'w-100', 'text-start', 'cursor-pointer');
                listItem.textContent = file.name;
                listItem.dataset.settingsIndex = settingsIndex;

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

function plotData(settings) {
    if (settings.x !== null && settings.y.length > 0) {
        const xIndex = settings.x;
        const yIndices = settings.y;
        const header = settings.header;
        const rows = settings.rows;

        // Get x values
        const xValues = rows.map(row => row[xIndex]);

        // Prepare traces for each y column
        const traces = yIndices.map(yIndex => {
            const yValues = rows.map(row => row[yIndex]);
            return {
                x: xValues,
                y: yValues,
                mode: 'lines',
                name: header[yIndex],
                type: 'scatter',
            };
        });

        // Get carousel dimensions
        const carouselElement = document.getElementById('carousel-container');
        const carouselStyles = getComputedStyle(carouselElement);
        const carouselWidth = carouselElement.clientWidth - parseFloat(carouselStyles.paddingLeft) - parseFloat(carouselStyles.paddingRight);
        const carouselHeight = carouselElement.clientHeight - parseFloat(carouselStyles.paddingTop) - parseFloat(carouselStyles.paddingBottom);

        const layout = {
            title: settings.name,
            xaxis: { title: header[xIndex] },
            yaxis: { title: 'Values' },
            autosize: false,
            width: carouselWidth,
            height: carouselHeight,
        };

        // Plotly plot in the new container
        Plotly.react('plot-container', traces, layout);
    } else {
        // Clear the plot if x or y is not selected
        Plotly.purge('plot-container');
    }
}

