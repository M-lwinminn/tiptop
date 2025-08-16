// Add Firebase configuration and initialization here
const firebaseConfig = {
    apiKey: "AIzaSyAKTchDbgUYGKgJC7oJRY4CiRbFCzNZIfs",
    authDomain: "bssaledata.firebaseapp.com",
    projectId: "bssaledata",
    storageBucket: "bssaledata.firebasestorage.app",
    messagingSenderId: "311902212615",
    appId: "1:311902212615:web:55a9561645d15f1d91d0a2",
    measurementId: "G-65YP7M5JVR",
    databaseURL: "https://bssaledata-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();


// Data stores
const merchants = {
    'ZinZin 1': 207000,
    'ZinZin': 207000,
    'ZZ Kpt': 207000,
    'Win': 211500,
    'Moe': 207000
};

const buyDescriptions = ['Steel', 'Wood', 'Plastic Bags', 'Transport'];

// Firebase references
const salesRef = database.ref('sales');
const buyRef = database.ref('buy');

// Local arrays to hold data retrieved from Firebase
let salesData = [];
let buyData = [];

// Utility function to format numbers with commas
function formatNumber(num) {
    if (isNaN(num)) return '';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// --- Page and Tab Navigation Logic ---
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    
    // Default to the record tab on Sale and Buy pages
    if (pageId === 'salePage' || pageId === 'buyPage') {
        const pageElement = document.getElementById(pageId);
        const recordTab = pageElement.querySelector('.sub-nav-button[data-tab-target$="-form-tab"]');
        showTab(recordTab);
    } else {
        document.querySelectorAll('.sub-tab').forEach(tab => tab.classList.remove('active'));
    }

    if (pageId === 'summaryPage') {
        updateSummaryPage();
    }
}

function showTab(tabButton) {
    const parentContainer = tabButton.closest('.page');
    const tabs = parentContainer.querySelectorAll('.sub-nav-button');
    const tabContents = parentContainer.querySelectorAll('.sub-tab');
    const targetTabId = tabButton.getAttribute('data-tab-target');
    const targetTab = document.getElementById(targetTabId);

    tabs.forEach(tab => tab.classList.remove('active'));
    tabButton.classList.add('active');

    tabContents.forEach(content => content.classList.remove('active'));
    targetTab.classList.add('active');
}

// Event listeners for main navigation buttons
document.querySelectorAll('.nav-button').forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        const pageTarget = e.target.getAttribute('data-page-target');
        document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        showPage(pageTarget + 'Page');
    });
});

// Event listeners for sub-tab buttons
document.querySelectorAll('.sub-nav-button').forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        showTab(e.target);
    });
});

document.addEventListener('DOMContentLoaded', () => {
    fetchDataAndSetupListeners();
    showPage('salePage');
    setupSalePage();
    setupBuyPage();
    setupCalculatorPage();
});

// --- Firebase Data Fetching and Real-time Listeners ---
function fetchDataAndSetupListeners() {
    // Listen for changes in sales data
    salesRef.on('value', (snapshot) => {
        const data = snapshot.val();
        salesData = [];
        if (data) {
            for (let key in data) {
                salesData.push({ id: key, ...data[key] });
            }
        }
        updateSummaryPage();
    });

    // Listen for changes in buy data
    buyRef.on('value', (snapshot) => {
        const data = snapshot.val();
        buyData = [];
        if (data) {
            for (let key in data) {
                buyData.push({ id: key, ...data[key] });
            }
        }
        updateSummaryPage();
    });
}

// --- Sale Page Logic ---
function setupSalePage() {
    const saleForm = document.getElementById('saleForm');
    const saleDateInput = document.getElementById('saleDate');
    const merchantSelect = document.getElementById('merchant');
    const unitPriceInput = document.getElementById('unitPrice');
    const quantityInput = document.getElementById('quantity');
    const amountInput = document.getElementById('amount');

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    saleDateInput.value = `${year}-${month}-${day}`;

    merchantSelect.addEventListener('change', () => {
        const selectedMerchant = merchantSelect.value;
        if (merchants[selectedMerchant]) {
            unitPriceInput.value = formatNumber(merchants[selectedMerchant]);
        } else {
            unitPriceInput.value = '';
        }
        calculateSaleAmount();
    });

    quantityInput.addEventListener('input', calculateSaleAmount);

    function calculateSaleAmount() {
        const quantity = parseFloat(quantityInput.value);
        const unitPrice = parseFloat(unitPriceInput.value.replace(/,/g, ''));
        if (!isNaN(quantity) && !isNaN(unitPrice)) {
            const amount = quantity * unitPrice;
            amountInput.value = formatNumber(amount);
        } else {
            amountInput.value = '';
        }
    }

    saleForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newSale = {
            date: saleDateInput.value,
            merchant: merchantSelect.value,
            quantity: quantityInput.value,
            amount: parseFloat(amountInput.value.replace(/,/g, '')),
            paid: document.getElementById('paidStatus').checked
        };
        // Push data to Firebase
        salesRef.push(newSale)
            .then(() => {
                alert('Sale recorded successfully!');
                saleForm.reset();
                saleDateInput.value = `${year}-${month}-${day}`;
            })
            .catch(error => {
                console.error("Error adding sale:", error);
                alert('Error adding sale. Please try again.');
            });
    });
}

// --- Buy Page Logic ---
function setupBuyPage() {
    const buyForm = document.getElementById('buyForm');
    const buyDateInput = document.getElementById('buyDate');
    const descriptionSelect = document.getElementById('description');

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    buyDateInput.value = `${year}-${month}-${day}`;

    buyDescriptions.forEach(desc => {
        const option = document.createElement('option');
        option.value = desc;
        option.textContent = desc;
        descriptionSelect.appendChild(option);
    });

    buyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newBuy = {
            date: buyDateInput.value,
            description: descriptionSelect.value,
            quantity: document.getElementById('buyQuantity').value,
            amount: document.getElementById('buyAmount').value,
            paid: document.getElementById('buyPaidStatus').checked
        };
        // Push data to Firebase
        buyRef.push(newBuy)
            .then(() => {
                alert('Purchase recorded successfully!');
                buyForm.reset();
                buyDateInput.value = `${year}-${month}-${day}`;
            })
            .catch(error => {
                console.error("Error adding purchase:", error);
                alert('Error adding purchase. Please try again.');
            });
    });
}

// --- Calculator Page Logic ---
function setupCalculatorPage() {
    document.getElementById('calculateBtn').addEventListener('click', () => {
        const values = {};
        const ids = ['range', 'pe', 'packRoll', 'plastic', 'gyapha', 'carFee', 'laborFee', 'packetCount', 'salePrice'];
        ids.forEach(id => {
            values[id] = parseFloat(document.getElementById(id).value);
        });

        if (Object.values(values).some(isNaN)) {
            alert('Please fill in all fields with valid numbers.');
            return;
        }

        const basePrice = (values.pe / (values.packetCount / 35)) + 
                          ((values.packRoll * values.range) / 10000) + 
                          (values.plastic / 200 / 10) + 
                          (values.gyapha / 900) + 
                          (values.carFee / values.packetCount) + 
                          (values.laborFee / values.packetCount);

        const profit = values.salePrice - basePrice;

        document.getElementById('basePriceResult').textContent = formatNumber(basePrice.toFixed(2));
        document.getElementById('profitResult').textContent = formatNumber(profit.toFixed(2));
    });
}

// --- Summary Page Logic ---
function updateSummaryPage() {
    const totalSales = salesData.reduce((sum, sale) => sum + sale.amount, 0);
    const totalPaidSales = salesData.filter(sale => sale.paid).reduce((sum, sale) => sum + sale.amount, 0);
    const totalUnpaidSales = totalSales - totalPaidSales;

    const totalBuy = buyData.reduce((sum, buy) => sum + parseFloat(buy.amount), 0);
    const totalPaidBuy = buyData.filter(buy => buy.paid).reduce((sum, buy) => sum + parseFloat(buy.amount), 0);
    const totalUnpaidBuy = totalBuy - totalPaidBuy;

    const netCashFlow = totalSales - totalBuy;

    document.getElementById('totalSales').textContent = formatNumber(totalSales);
    document.getElementById('totalPaidSales').textContent = formatNumber(totalPaidSales);
    document.getElementById('totalUnpaidSales').textContent = formatNumber(totalUnpaidSales);
    document.getElementById('totalBuy').textContent = formatNumber(totalBuy);
    document.getElementById('totalPaidBuy').textContent = formatNumber(totalPaidBuy);
    document.getElementById('totalUnpaidBuy').textContent = formatNumber(totalUnpaidBuy);
    document.getElementById('netCashFlow').textContent = formatNumber(netCashFlow);
}

// --- Search Functionality (Now Firebase-compatible) ---
function setupSearchFunctionality(searchFormId, dataArray, tableId, saveChangesBtnId, pageType) {
    const searchForm = document.getElementById(searchFormId);
    const resultsTableBody = document.querySelector(`#${tableId} tbody`);
    const saveChangesBtn = document.getElementById(saveChangesBtnId);

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const searchQuery = document.getElementById(`${pageType}SearchQuery`).value.toLowerCase();
        const searchStatus = document.getElementById(`${pageType}SearchStatus`).value;
        const startDate = document.getElementById(`${pageType}StartDate`).value;
        const endDate = document.getElementById(`${pageType}EndDate`).value;

        // Filter data from the global arrays
        const filteredData = dataArray.filter(item => {
            const matchesQuery = pageType === 'sale' ? item.merchant.toLowerCase().includes(searchQuery) : item.description.toLowerCase().includes(searchQuery);
            const matchesStatus = searchStatus === 'all' || (searchStatus === 'paid' && item.paid) || (searchStatus === 'unpaid' && !item.paid);
            const itemDate = new Date(item.date);
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;
            
            if (end) {
                end.setDate(end.getDate() + 1);
            }

            const matchesDateRange = (!start || itemDate >= start) && (!end || itemDate < end);

            return matchesQuery && matchesStatus && matchesDateRange;
        });

        displayResults(filteredData, pageType, resultsTableBody);
    });

    saveChangesBtn.addEventListener('click', () => {
        const updates = {};
        const databaseRef = pageType === 'sale' ? salesRef : buyRef;

        document.querySelectorAll(`#${tableId} tbody tr`).forEach(row => {
            const checkbox = row.querySelector('input[type="checkbox"]');
            if (checkbox) {
                const key = checkbox.dataset.key;
                const newPaidStatus = checkbox.checked;
                updates[key] = { paid: newPaidStatus };
            }
        });
        
        // Update the database with all changes at once
        if (Object.keys(updates).length > 0) {
            databaseRef.update(updates)
                .then(() => {
                    alert('Changes saved successfully!');
                })
                .catch(error => {
                    console.error("Error updating records:", error);
                    alert('Error saving changes. Please try again.');
                });
        }
    });
}

function displayResults(results, pageType, resultsTableBody) {
    resultsTableBody.innerHTML = '';
    const saveChangesBtn = pageType === 'sale' ? document.getElementById('saveSaleChanges') : document.getElementById('saveBuyChanges');
    
    if (results.length > 0) {
        saveChangesBtn.style.display = 'block';
        results.forEach(item => {
            const row = resultsTableBody.insertRow();
            const dateCell = row.insertCell(0);
            const descCell = row.insertCell(1);
            const quantityCell = row.insertCell(2);
            const amountCell = row.insertCell(3);
            const paidCell = row.insertCell(4);

            const dateObj = new Date(item.date + 'T00:00:00');
            const formattedDate = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            dateCell.textContent = formattedDate;
            descCell.textContent = pageType === 'sale' ? item.merchant : item.description;
            quantityCell.textContent = item.quantity;
            amountCell.textContent = formatNumber(item.amount);
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = item.paid;
            checkbox.dataset.key = item.id; // Store Firebase key
            paidCell.appendChild(checkbox);
        });
    } else {
        saveChangesBtn.style.display = 'none';
        const row = resultsTableBody.insertRow();
        const cell = row.insertCell(0);
        cell.colSpan = 5;
        cell.textContent = 'No results found.';
    }
}

// Call the search setup functions for each page
setupSearchFunctionality('saleSearchForm', salesData, 'saleResultsTable', 'saveSaleChanges', 'sale');
setupSearchFunctionality('buySearchForm', buyData, 'buyResultsTable', 'saveBuyChanges', 'buy');

