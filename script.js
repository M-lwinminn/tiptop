/// --- IMPORTANT: REPLACE WITH YOUR SCRIPT URL ---
const scriptURL = 'https://script.google.com/macros/s/AKfycbzVRw4IFXSrxtb-p9A0JBCwFNLgGDR_-g_F4EI2exDQmnzOnCsV2uoDgEFb_o9Y9-Fp/exec';

// --- Page Navigation Elements ---
const saleDataBtnNav = document.getElementById('saleDataBtnNav');
const buyDataBtnNav = document.getElementById('buyDataBtnNav');
const calculatorBtnNav = document.getElementById('calculatorBtnNav');
const summaryBtnNav = document.getElementById('summaryBtnNav');
const saleOptionsBtn = document.getElementById('saleOptionsBtn');
const buyOptionsBtn = document.getElementById('buyOptionsBtn');
const pages = document.querySelectorAll('.page');
const optionsPage = document.getElementById('optionsPage');
const merchantOptionsHeader = document.getElementById('merchantOptionsHeader');
const buyOptionsHeader = document.getElementById('buyOptionsHeader');

// --- Form Elements ---
const form = document.getElementById('dataForm');
const buyDataForm = document.getElementById('buyDataForm');
const calculatorForm = document.getElementById('calculatorForm');

// --- Sale Data Elements ---
const dateInput = document.getElementById('date');
const merchantSelect = document.getElementById('merchant');
const quantityInput = document.getElementById('quantity');
const amountInput = document.getElementById('amount');
const responseMessage = document.getElementById('response-message');
const searchInput = document.getElementById('searchInput');
const loadAllDataBtn = document.getElementById('loadAllDataBtn');
const loadUnpaidBtn = document.getElementById('loadUnpaidBtn');
const unpaidMerchantFilter = document.getElementById('unpaidMerchantFilter');
const saveChangesBtn = document.getElementById('saveChangesBtn');
const saleDataTable = document.getElementById('saleDataTable');
const updateMessage = document.getElementById('update-message');

// --- Buy Data Elements ---
const buyDescriptionSelect = document.getElementById('buyDescription');
const buyQuantityInput = document.getElementById('buyQuantity');
const buyUnitPriceInput = document.getElementById('buyUnitPrice');
const buyAmountInput = document.getElementById('buyAmount');
const buyResponseMessage = document.getElementById('buy-response-message');
const buySearchInput = document.getElementById('buySearchInput');
const loadAllBuyDataBtn = document.getElementById('loadAllBuyDataBtn');
const buyDataTable = document.getElementById('buyDataTable');
const saveBuyChangesBtn = document.getElementById('saveBuyChangesBtn');
const buyUpdateMessage = document.getElementById('buy-update-message');

// --- Options Page Elements ---
const newMerchantInput = document.getElementById('newMerchantInput');
const newPriceInput = document.getElementById('newPriceInput');
const addMerchantBtn = document.getElementById('addMerchantBtn');
const merchantList = document.getElementById('merchantList');
const newDescriptionInput = document.getElementById('newDescriptionInput');
const newBuyPriceInput = document.getElementById('newBuyPriceInput');
const addDescriptionBtn = document.getElementById('addDescriptionBtn');
const descriptionList = document.getElementById('descriptionList');

// --- Calculator Elements ---
const totalCostValueSpan = document.getElementById('totalCostValue');
const profitValueSpan = document.getElementById('profitValue');

// --- Summary Elements ---
const merchantSummaryTableDiv = document.getElementById('merchantSummaryTable');
const remitSummaryTableDiv = document.getElementById('remitSummaryTable');

// --- Global State ---
let allSaleData = [];
let changedRows = new Map();
let allBuyData = [];
let changedBuyRows = new Map();
let merchants = JSON.parse(localStorage.getItem('merchants')) || [
    { name: 'ZinZin 1', price: 207000 }, { name: 'ZinZin', price: 207000 },
    { name: 'Win', price: 211500 }, { name: 'Moe', price: 207000 },
    { name: 'Other', price: 207000 }
];
let descriptions = JSON.parse(localStorage.getItem('descriptions')) || [
    { name: 'PE', price: 5000 }, { name: 'ပလတ်စတစ်', price: 1000 }, { name: 'စက္ကူ', price: 2000 }
];

// --- EVENT LISTENERS ---

// Navigation
saleDataBtnNav.addEventListener('click', () => showPage('saleDataPage'));
buyDataBtnNav.addEventListener('click', () => showPage('buyDataPage'));
calculatorBtnNav.addEventListener('click', () => showPage('calculatorPage'));
summaryBtnNav.addEventListener('click', () => showPage('summaryPage'));
saleOptionsBtn.addEventListener('click', () => showPage('optionsPage', 'merchantOptionsHeader'));
buyOptionsBtn.addEventListener('click', () => showPage('optionsPage', 'buyOptionsHeader'));

// Form Submissions
form.addEventListener('submit', handleFormSubmit);
buyDataForm.addEventListener('submit', handleFormSubmit);
calculatorForm.addEventListener('submit', handleFormSubmit);

// Sale Page Actions
loadAllDataBtn.addEventListener('click', loadAllSaleData);
loadUnpaidBtn.addEventListener('click', loadUnpaidData);
saveChangesBtn.addEventListener('click', saveChanges);
searchInput.addEventListener('input', filterData);
quantityInput.addEventListener('input', calculateSaleAmount);
merchantSelect.addEventListener('change', calculateSaleAmount);

// Buy Page Actions
buyQuantityInput.addEventListener('input', calculateBuyAmount);
buyDescriptionSelect.addEventListener('change', calculateBuyAmount);
loadAllBuyDataBtn.addEventListener('click', loadAllBuyData);
saveBuyChangesBtn.addEventListener('click', saveBuyChanges);
buySearchInput.addEventListener('input', filterBuyData);

// Options Page Actions
addMerchantBtn.addEventListener('click', addMerchant);
addDescriptionBtn.addEventListener('click', addDescription);

// Calculator Actions
document.querySelectorAll('#calculatorForm input').forEach(input => {
    input.addEventListener('input', () => {
        performCalculations();
        saveCalculatorData();
    });
});

// --- FUNCTIONS ---

function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    fetch(scriptURL, { method: 'POST', mode: 'no-cors', body: new FormData(form) })
        .then(() => {
            alert('Data submitted successfully!');
            form.reset();
        })
        .catch(error => alert('Error! ' + error.message));
}

function showPage(pageId, sectionId = null) {
    pages.forEach(page => page.classList.remove('active-page'));
    document.getElementById(pageId).classList.add('active-page');

    document.querySelectorAll('.navbar button').forEach(btn => btn.classList.remove('active'));
    const navButton = document.getElementById(pageId.replace('Page', 'BtnNav'));
    if (navButton) {
        navButton.classList.add('active');
    }

    // New, more robust logic for the options page
    if (pageId === 'optionsPage') {
        merchantOptionsHeader.style.display = 'none';
        buyOptionsHeader.style.display = 'none';
        if (sectionId === 'merchantOptionsHeader') {
            merchantOptionsHeader.style.display = 'block';
        } else if (sectionId === 'buyOptionsHeader') {
            buyOptionsHeader.style.display = 'block';
        }
    }

    if (pageId === 'summaryPage') {
        loadMerchantSummary();
    }
    if (pageId === 'calculatorPage') {
        loadCalculatorData();
    }
}

// --- Data Management (Merchants & Descriptions) ---
function saveMerchants() { localStorage.setItem('merchants', JSON.stringify(merchants)); }
function saveDescriptions() { localStorage.setItem('descriptions', JSON.stringify(descriptions)); }

function renderMerchants() {
    merchantSelect.innerHTML = '<option value="">--Select Merchant--</option>';
    unpaidMerchantFilter.innerHTML = '<option value="all">All Merchants</option>';
    merchantList.innerHTML = '';
    merchants.forEach(m => {
        merchantSelect.innerHTML += `<option value="${m.name}">${m.name}</option>`;
        unpaidMerchantFilter.innerHTML += `<option value="${m.name}">${m.name}</option>`;
        const li = document.createElement('li');
        li.innerHTML = `<span>${m.name} - ${m.price}</span><div><button class="edit-btn">✏️</button><button class="remove-btn">❌</button></div>`;
        merchantList.appendChild(li);
        li.querySelector('.edit-btn').onclick = () => editMerchant(m.name);
        li.querySelector('.remove-btn').onclick = () => removeMerchant(m.name);
    });
}
function addMerchant() {
    const name = newMerchantInput.value.trim();
    const price = parseFloat(newPriceInput.value);
    if (name && !isNaN(price) && !merchants.find(m => m.name === name)) {
        merchants.push({ name, price });
        saveMerchants();
        renderMerchants();
        newMerchantInput.value = ''; newPriceInput.value = '';
    }
}
function editMerchant(name) {
    const merchant = merchants.find(m => m.name === name);
    const newName = prompt('Edit Name:', merchant.name);
    const newPrice = prompt('Edit Price:', merchant.price);
    if (newName && newPrice) {
        merchant.name = newName;
        merchant.price = parseFloat(newPrice);
        saveMerchants();
        renderMerchants();
    }
}
function removeMerchant(name) {
    if (confirm(`Remove ${name}?`)) {
        merchants = merchants.filter(m => m.name !== name);
        saveMerchants();
        renderMerchants();
    }
}

function renderDescriptions() {
    buyDescriptionSelect.innerHTML = '<option value="">--Select Description--</option>';
    descriptionList.innerHTML = '';
    descriptions.forEach(d => {
        buyDescriptionSelect.innerHTML += `<option value="${d.name}">${d.name}</option>`;
        const li = document.createElement('li');
        li.innerHTML = `<span>${d.name} - ${d.price}</span><div><button class="edit-btn">✏️</button><button class="remove-btn">❌</button></div>`;
        descriptionList.appendChild(li);
        li.querySelector('.edit-btn').onclick = () => editDescription(d.name);
        li.querySelector('.remove-btn').onclick = () => removeDescription(d.name);
    });
}
function addDescription() {
    const name = newDescriptionInput.value.trim();
    const price = parseFloat(newBuyPriceInput.value);
    if (name && !isNaN(price) && !descriptions.find(d => d.name === name)) {
        descriptions.push({ name, price });
        saveDescriptions();
        renderDescriptions();
        newDescriptionInput.value = ''; newBuyPriceInput.value = '';
    }
}
function editDescription(name) {
    const desc = descriptions.find(d => d.name === name);
    const newName = prompt('Edit Name:', desc.name);
    const newPrice = prompt('Edit Price:', desc.price);
    if (newName && newPrice) {
        desc.name = newName;
        desc.price = parseFloat(newPrice);
        saveDescriptions();
        renderDescriptions();
    }
}
function removeDescription(name) {
    if (confirm(`Remove ${name}?`)) {
        descriptions = descriptions.filter(m => m.name !== name);
        saveDescriptions();
        renderDescriptions();
    }
}

// --- Sale/Buy Amount Calculation ---
function calculateSaleAmount() {
    const merchant = merchants.find(m => m.name === merchantSelect.value);
    const quantity = parseFloat(quantityInput.value);
    amountInput.value = (merchant && quantity) ? (quantity * merchant.price).toFixed(0) : '';
}
function calculateBuyAmount() {
    const desc = descriptions.find(d => d.name === buyDescriptionSelect.value);
    const quantity = parseFloat(buyQuantityInput.value);
    if (desc && quantity) {
        buyUnitPriceInput.value = desc.price;
        buyAmountInput.value = (desc.name === 'PE' ? quantity * desc.price * 35 : quantity * desc.price).toFixed(0);
    } else {
        buyUnitPriceInput.value = '';
        buyAmountInput.value = '';
    }
}

// --- Data Loading and Rendering ---
async function loadAllSaleData() {
    try {
        const response = await fetch(`${scriptURL}?sheetName=Sale`);
        allSaleData = await response.json();
        renderEditableTable(allSaleData);
        saveChangesBtn.style.display = 'block';
    } catch (e) { console.error('Error loading sale data:', e); }
}

function loadUnpaidData() {
    const selectedMerchant = unpaidMerchantFilter.value;
    let filteredData = allSaleData.filter(row => row['Paid Status'] === '');
    if (selectedMerchant !== 'all') {
        filteredData = filteredData.filter(row => row.Merchant === selectedMerchant);
    }
    renderEditableTable(filteredData);
    saveChangesBtn.style.display = 'block';
}

function renderEditableTable(data) {
    let tableHTML = '<table><thead><tr><th>Date</th><th>Merchant</th><th>Quantity</th><th>Amount</th><th>Paid</th><th>Actions</th></tr></thead><tbody>';
    data.forEach(row => {
        const originalIndex = allSaleData.findIndex(d => JSON.stringify(d) === JSON.stringify(row));
        const isPaid = row['Paid Status'] === 'Paid';
        tableHTML += `<tr data-row-index="${originalIndex}">
            <td>${new Date(row.Date).toLocaleDateString()}</td>
            <td>${row.Merchant}</td>
            <td>${row.Quantity}</td>
            <td>${row.Amount}</td>
            <td><input type="checkbox" class="paid-status-checkbox" data-row-index="${originalIndex}" ${isPaid ? 'checked' : ''}></td>
            <td><button class="delete-btn" data-row-index="${originalIndex}">❌</button></td>
        </tr>`;
    });
    tableHTML += '</tbody></table>';
    saleDataTable.innerHTML = tableHTML;
    document.querySelectorAll('.paid-status-checkbox').forEach(cb => cb.onchange = (e) => {
        changedRows.set(e.target.dataset.rowIndex, e.target.checked);
    });
    document.querySelectorAll('.delete-btn').forEach(btn => btn.onclick = (e) => {
        const rowIndex = e.target.dataset.rowIndex;
        deleteRow(parseInt(rowIndex) + 2, 'Sale'); // +2 because Sheets is 1-indexed and has a header row
    });
}

function filterData() {
    const term = searchInput.value.toLowerCase();
    const filtered = allSaleData.filter(row => Object.values(row).some(val => String(val).toLowerCase().includes(term)));
    renderEditableTable(filtered);
}

async function loadAllBuyData() {
    try {
        const response = await fetch(`${scriptURL}?sheetName=Buy`);
        allBuyData = await response.json();
        renderBuyTable(allBuyData);
        saveBuyChangesBtn.style.display = 'block';
    } catch (e) { console.error('Error loading buy data:', e); }
}

function renderBuyTable(data) {
    let tableHTML = '<table><thead><tr><th>Date</th><th>Description</th><th>Quantity</th><th>Unit Price</th><th>Amount</th><th>Paid</th><th>Actions</th></tr></thead><tbody>';
    data.forEach(row => {
        const originalIndex = allBuyData.findIndex(d => JSON.stringify(d) === JSON.stringify(row));
        const isPaid = row['Paid Status'] === 'Paid';
        tableHTML += `<tr data-row-index="${originalIndex}">
            <td>${new Date(row.Date).toLocaleDateString()}</td>
            <td>${row.Description}</td>
            <td>${row.Quantity}</td>
            <td>${row['Unit Price']}</td>
            <td>${row.Amount}</td>
            <td><input type="checkbox" class="buy-paid-status-checkbox" data-row-index="${originalIndex}" ${isPaid ? 'checked' : ''}></td>
            <td><button class="buy-delete-btn" data-row-index="${originalIndex}">❌</button></td>
        </tr>`;
    });
    tableHTML += '</tbody></table>';
    buyDataTable.innerHTML = tableHTML;
    document.querySelectorAll('.buy-paid-status-checkbox').forEach(cb => cb.onchange = (e) => {
        changedBuyRows.set(e.target.dataset.rowIndex, e.target.checked);
    });
    document.querySelectorAll('.buy-delete-btn').forEach(btn => btn.onclick = (e) => {
        const rowIndex = e.target.dataset.rowIndex;
        deleteRow(parseInt(rowIndex) + 2, 'Buy');
    });
}

function filterBuyData() {
    const term = buySearchInput.value.toLowerCase();
    const filtered = allBuyData.filter(row => Object.values(row).some(val => String(val).toLowerCase().includes(term)));
    renderBuyTable(filtered);
}

// --- Save Changes ---
async function saveChanges() {
    if (changedRows.size === 0) {
        updateMessage.textContent = 'No changes to save.';
        return;
    }
    updateMessage.textContent = 'Saving...';
    const updates = Array.from(changedRows, ([rowIndex, newValue]) => ({ rowIndex, newValue }));
    const formData = new FormData();
    formData.append('sheetName', 'updateSaleRow');
    formData.append('updates', JSON.stringify(updates));
    try {
        await fetch(scriptURL, { method: 'POST', mode: 'no-cors', body: formData });
        updateMessage.textContent = 'Changes saved!';
        changedRows.clear();
        setTimeout(loadAllSaleData, 1000); // Reload data after a short delay
    } catch (e) {
        updateMessage.textContent = 'Error saving changes.';
        console.error('Error:', e);
    }
}

async function saveBuyChanges() {
    if (changedBuyRows.size === 0) {
        buyUpdateMessage.textContent = 'No changes to save.';
        return;
    }
    buyUpdateMessage.textContent = 'Saving...';
    const updates = Array.from(changedBuyRows, ([rowIndex, newValue]) => ({ rowIndex, newValue }));
    const formData = new FormData();
    formData.append('sheetName', 'updateBuyRow');
    formData.append('updates', JSON.stringify(updates));
    try {
        await fetch(scriptURL, { method: 'POST', mode: 'no-cors', body: formData });
        buyUpdateMessage.textContent = 'Changes saved!';
        changedBuyRows.clear();
        setTimeout(loadAllBuyData, 1000); // Reload data after a short delay
    } catch (e) {
        buyUpdateMessage.textContent = 'Error saving changes.';
        console.error('Error:', e);
    }
}

async function deleteRow(rowIndex, sheetName) {
    if (!confirm(`Are you sure you want to delete row ${rowIndex - 1}?`)) {
        return;
    }

    const formData = new FormData();
    formData.append('sheetName', `delete${sheetName}Row`);
    formData.append('rowIndex', rowIndex);

    try {
        await fetch(scriptURL, { method: 'POST', mode: 'no-cors', body: formData });
        alert(`Row ${rowIndex - 1} deleted successfully!`);
        if (sheetName === 'Sale') {
            loadAllSaleData();
        } else if (sheetName === 'Buy') {
            loadAllBuyData();
        }
    } catch (e) {
        alert('Error deleting row. Check the script URL and permissions.');
        console.error('Error:', e);
    }
}

// --- Summary Page ---
async function loadMerchantSummary() {
    merchantSummaryTableDiv.innerHTML = "<p>Loading summary...</p>";
    remitSummaryTableDiv.innerHTML = "<p>Loading remit data...</p>";
    try {
        const response = await fetch(`${scriptURL}?sheetName=merchantSummary`);
        const merchantData = await response.json();
        
        // Render Merchant Sales Summary
        let merchantTableHTML = '<table><thead><tr><th>Merchant</th><th>Total Sold</th><th>Unpaid Qty</th><th>Unpaid Amt</th></tr></thead><tbody>';
        merchantData.details.forEach(row => {
            merchantTableHTML += `<tr><td>${row.Merchant}</td><td>${row['Total Sold']}</td><td>${row['Unpaid Quantity']}</td><td>${row['Unpaid Amount']}</td></tr>`;
        });
        merchantTableHTML += `</tbody><tfoot><tr>
                        <td><b>Grand Total</b></td>
                        <td><b></b></td>
                        <td><b></b></td>
                        <td><b>${merchantData.grandTotalUnpaidAmt}</b></td>
                      </tr></tfoot></table>`;
        merchantSummaryTableDiv.innerHTML = merchantTableHTML;

        // Render To Remit Table
        const remitData = JSON.parse(localStorage.getItem('remitData')) || {};
        const buySummaryData = await fetch(`${scriptURL}?sheetName=buySummary`).then(res => res.json());
        const totalUnpaidPeAmount = buySummaryData.totalUnpaidPeAmount;
        
        let remitTableHTML = '<table>';
        remitTableHTML += '<thead><tr><th>Description</th><th>Amount</th></tr></thead>';
        remitTableHTML += '<tbody>';
        remitTableHTML += `<tr><td><b>To Remit</b></td><td>${totalUnpaidPeAmount}</td></tr>`;
        remitTableHTML += `<tr><td><b>To Get</b></td><td>${merchantData.grandTotalUnpaidAmt}</td></tr>`;
        remitTableHTML += `<tr><td><b>Cash In Hand</b></td><td><input type="text" id="cashInHand" value="${remitData.cashInHand || ''}" pattern="[0-9]*" inputmode="numeric"></td></tr>`;
        remitTableHTML += `<tr><td><b>KBZ Pay</b></td><td><input type="text" id="kbzPay" value="${remitData.kbzPay || ''}" pattern="[0-9]*" inputmode="numeric"></td></tr>`;
        remitTableHTML += `<tr><td><b>KBZ Acc</b></td><td><input type="text" id="kbzAcc" value="${remitData.kbzAcc || ''}" pattern="[0-9]*" inputmode="numeric"></td></tr>`;
        remitTableHTML += '</tbody>';
        remitTableHTML += '<tfoot><tr><td><b>Total</b></td><td id="remitTotal">0</td></tr></tfoot>';
        remitTableHTML += '</table>';
        remitSummaryTableDiv.innerHTML = remitTableHTML;

        // Add event listeners for the new inputs and calculate total
        document.querySelectorAll('#remitSummaryTable input').forEach(input => {
            input.addEventListener('input', () => {
                saveManualRemitData();
                calculateRemitTotal(merchantData.grandTotalUnpaidAmt);
            });
        });
        calculateRemitTotal(merchantData.grandTotalUnpaidAmt);

    } catch (e) {
        merchantSummaryTableDiv.innerHTML = "<p>Error loading summary.</p>";
        remitSummaryTableDiv.innerHTML = "<p>Error loading remit data.</p>";
        console.error('Error:', e);
    }
}

function saveManualRemitData() {
    const remitData = {
        cashInHand: document.getElementById('cashInHand').value,
        kbzPay: document.getElementById('kbzPay').value,
        kbzAcc: document.getElementById('kbzAcc').value
    };
    localStorage.setItem('remitData', JSON.stringify(remitData));
}

function calculateRemitTotal(toGetAmount) {
    const cashInHand = parseFloat(document.getElementById('cashInHand').value) || 0;
    const kbzPay = parseFloat(document.getElementById('kbzPay').value) || 0;
    const kbzAcc = parseFloat(document.getElementById('kbzAcc').value) || 0;
    const toGet = parseFloat(toGetAmount) || 0;

    const total = cashInHand + kbzPay + kbzAcc + toGet;
    document.getElementById('remitTotal').textContent = total.toFixed(0);
}

// --- Calculator Page ---
function loadCalculatorData() {
    const data = JSON.parse(localStorage.getItem('calculatorData'));
    if (data) {
        Object.keys(data).forEach(key => document.getElementById(key).value = data[key]);
    }
    performCalculations();
}
function saveCalculatorData() {
    const data = {
        dollarPrice: document.getElementById('dollarPrice').value,
        pePrice: document.getElementById('pePrice').value,
        rollPrice: document.getElementById('rollPrice').value,
        lbPrice: document.getElementById('lbPrice').value,
        boxPrice: document.getElementById('boxPrice').value,
        carPrice: document.getElementById('carPrice').value,
        laborPrice: document.getElementById('laborPrice').value,
        packCount: document.getElementById('packCount').value,
        salePrice: document.getElementById('salePrice').value
    };
    localStorage.setItem('calculatorData', JSON.stringify(data));
}
function performCalculations() {
    const pePrice = parseFloat(document.getElementById('pePrice').value) || 0;
    const packCount = parseFloat(document.getElementById('packCount').value) || 0;
    const rollPrice = parseFloat(document.getElementById('rollPrice').value) || 0;
    const dollarPrice = parseFloat(document.getElementById('dollarPrice').value) || 0;
    const lbPrice = parseFloat(document.getElementById('lbPrice').value) || 0;
    const boxPrice = parseFloat(document.getElementById('boxPrice').value) || 0;
    const carPrice = parseFloat(document.getElementById('carPrice').value) || 0;
    const laborPrice = parseFloat(document.getElementById('laborPrice').value) || 0;
    const salePrice = parseFloat(document.getElementById('salePrice').value) || 0;

    let totalCost = 0;
    if (packCount > 0) {
        totalCost = (pePrice / (packCount / 35)) + (rollPrice * dollarPrice / 10000) + (lbPrice / 200 / 10) + (boxPrice / 900) + (carPrice / packCount) + (laborPrice / packCount);
    }
    const profit = salePrice - totalCost;

    totalCostValueSpan.textContent = totalCost.toFixed(2);
    profitValueSpan.textContent = profit.toFixed(2);
}

// --- Initial Load ---
document.addEventListener('DOMContentLoaded', () => {
    // These functions must run on every page load to set up the dropdowns and options lists
    renderMerchants();
    renderDescriptions();
    showPage('saleDataPage');
});
