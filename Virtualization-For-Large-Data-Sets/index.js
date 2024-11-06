const container = document.getElementById('container');
const content = document.getElementById('content');
const itemHeight = 35;
const itemWidth = 150;
let totalRows = 100;
let totalColumns = 10;
const buffer = 20;
const rowsPerPage = 100;
const colsPerPage = 10;
const loadBuffer = 100;
let dataCache = {};

content.style.height = `${totalRows * itemHeight}px`;
content.style.width = `${totalColumns * itemWidth}px`;

async function fetchData(startRow, endRow, startCol, endCol) {
    const key = `${startRow}-${endRow}-${startCol}-${endCol}`;
    if (dataCache[key]) return dataCache[key];

    // We can replace this with API call
    const response = await new Promise(resolve => {
        setTimeout(() => {
            const data = Array.from({ length: (endRow - startRow + 1) * (endCol - startCol + 1) }, (_, i) =>
                `Item ${startRow + Math.floor(i / (endCol - startCol + 1))}-${startCol + i % (endCol - startCol + 1)}`
            );
            resolve(data);
        }, 100);
    });

    dataCache[key] = response;
    return response;
}

function createItem(text, rowIndex, colIndex) {
    const item = document.createElement('div');
    item.className = 'item';
    item.textContent = text;
    item.style.top = `${rowIndex * itemHeight}px`;
    item.style.left = `${colIndex * itemWidth}px`;
    item.style.position = 'absolute';
    return item;
}

async function renderVisibleItems() {
    const scrollTop = container.scrollTop;
    const scrollLeft = container.scrollLeft;
    const viewportHeight = container.clientHeight;
    const viewportWidth = container.clientWidth;

    const startRowIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
    const endRowIndex = Math.min(
        totalRows - 1,
        Math.ceil((scrollTop + viewportHeight) / itemHeight) + buffer
    );

    const startColIndex = Math.max(0, Math.floor(scrollLeft / itemWidth) - buffer);
    const endColIndex = Math.min(
        totalColumns - 1,
        Math.ceil((scrollLeft + viewportWidth) / itemWidth) + buffer
    );

    const data = await fetchData(startRowIndex, endRowIndex, startColIndex, endColIndex);

    // // Remove items outside the visible range (reduces the DOM load)
    Array.from(content.children).forEach(child => {
        const rowIndex = parseInt(child.dataset.rowIndex);
        const colIndex = parseInt(child.dataset.colIndex);
        if (rowIndex < startRowIndex || rowIndex > endRowIndex || colIndex < startColIndex || colIndex > endColIndex) {
            content.removeChild(child);
        }
    });

    // Add items within the visible range
    let dataIndex = 0;
    for (let i = startRowIndex; i <= endRowIndex; i++) {
        for (let j = startColIndex; j <= endColIndex; j++) {
            if (!content.querySelector(`[data-row-index="${i}"][data-col-index="${j}"]`)) {
                const item = createItem(data[dataIndex++], i, j);
                item.dataset.rowIndex = i;
                item.dataset.colIndex = j;
                content.appendChild(item);
            }
        }
    }
}

let lastExecutionTime = 0;
const throttleInterval = 100; // We can adjust the throttle interval based on the user requirement

function handleScroll() {
    const now = Date.now();

    if (now - lastExecutionTime < throttleInterval) return;

    lastExecutionTime = now;

    const scrollTop = container.scrollTop;
    const scrollLeft = container.scrollLeft;
    const viewportHeight = container.clientHeight;
    const viewportWidth = container.clientWidth;
    const scrollHeight = content.clientHeight;
    const scrollWidth = content.clientWidth;

    if (scrollTop + viewportHeight + loadBuffer >= scrollHeight) {
        totalRows += rowsPerPage;
        content.style.height = `${totalRows * itemHeight}px`;
    }
    if (scrollLeft + viewportWidth + loadBuffer >= scrollWidth) {
        totalColumns += colsPerPage;
        content.style.width = `${totalColumns * itemWidth}px`;
    }

    renderVisibleItems();
}

renderVisibleItems();

container.addEventListener('scroll', handleScroll);