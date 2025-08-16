// Add Firebase configuration and initialization here
const firebaseConfig = {
    apiKey: "AIzaSyAKTchDbgUYGKgJC7oJRY4CiRbFCzNZIfs",
    authDomain: "bssaledata.firebaseapp.com",
    projectId: "bssaledata",
    storageBucket: "bssaledata.firebasestorage.app",
    messagingSenderId: "311902212615",
    appId: "1:311902212615:web:55a9561645d15f1d91d0a2",
    measurementId: "G-65YP7M5JVR",
    databaseURL: "https://bssaledata-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Firebase references
const salesRef = database.ref('sales');
const buyRef = database.ref('buy');
const merchantsRef = database.ref('merchants');
const descriptionsRef = database.ref('descriptions');

// Local arrays to hold data retrieved from Firebase
let salesData = [];
let buyData = [];
let merchantsData = [];
let descriptionsData = [];

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
    setupSaleSettingsPage();
    setupBuySettingsPage();
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

    // Listen for changes in merchants
    merchantsRef.on('value', (snapshot) => {
        const data = snapshot.val();
        merchantsData = [];
        if (data) {
            for (let key in data) {
                merchantsData.push({ id: key, ...data[key] });
            }
        }
        updateMerchantDropdown();
        updateMerchantList();
    });

    // Listen for changes in descriptions
    descriptionsRef.on('value', (snapshot) => {
        const data = snapshot.val();
        descriptionsData = [];
        if (data) {
            for (let key in data) {
                descriptionsData.push({ id: key, name: data[key] });
            }
        }
        updateDescriptionDropdown();
        updateDescriptionList();
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
        const merchant = merchantsData.find(m => m.name === selectedMerchant);
        if (merchant) {
            unitPriceInput.value = formatNumber(merchant.price);
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
            unitPrice: parseFloat(unitPriceInput.value.replace(/,/g, '')),
            amount: parseFloat(amountInput.value.replace(/,/g, '')),
            paid: document.getElementById('paidStatus').checked
        };
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

function updateMerchantDropdown() {
    const merchantSelect = document.getElementById('merchant');
    merchantSelect.innerHTML = '<option value="">Select a Merchant</option>';
    merchantsData.forEach(merchant => {
        const option = document.createElement('option');
        option.value = merchant.name;
        option.textContent = merchant.name;
        merchantSelect.appendChild(option);
    });
}

// --- Buy Page Logic ---
function setupBuyPage() {
    const buyForm = document.getElementById('buyForm');
    const buyDateInput = document.getElementById('buyDate');
    const descriptionSelect = document.getElementById('description');
    const buyQuantityInput = document.getElementById('buyQuantity');
    const buyUnitPriceInput = document.getElementById('buyUnitPrice');
    const buyAmountInput = document.getElementById('buyAmount');

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    buyDateInput.value = `${year}-${month}-${day}`;

    buyQuantityInput.addEventListener('input', calculateBuyAmount);
    buyUnitPriceInput.addEventListener('input', calculateBuyAmount);

    function calculateBuyAmount() {
        const quantity = parseFloat(buyQuantityInput.value);
        const unitPrice = parseFloat(buyUnitPriceInput.value);
        if (!isNaN(quantity) && !isNaN(unitPrice)) {
            const amount = quantity * unitPrice;
            buyAmountInput.value = formatNumber(amount);
        } else {
            buyAmountInput.value = '';
        }
    }

    buyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newBuy = {
            date: buyDateInput.value,
            description: descriptionSelect.value,
            quantity: buyQuantityInput.value,
            unitPrice: buyUnitPriceInput.value,
            amount: parseFloat(buyAmountInput.value.replace(/,/g, '')),
            paid: document.getElementById('buyPaidStatus').checked
        };
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

function updateDescriptionDropdown() {
    const descriptionSelect = document.getElementById('description');
    descriptionSelect.innerHTML = '<option value="">Select a Description</option>';
    descriptionsData.forEach(description => {
        const option = document.createElement('option');
        option.value = description.name;
        option.textContent = description.name;
        descriptionSelect.appendChild(option);
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

// --- Settings Page Logic ---
function setupSaleSettingsPage() {
    const merchantForm = document.getElementById('merchantForm');

    merchantForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('newMerchantName').value;
        const price = parseFloat(document.getElementById('newMerchantPrice').value);
        if (name && !isNaN(price)) {
            merchantsRef.push({ name: name, price: price })
                .then(() => merchantForm.reset())
                .catch(error => console.error("Error adding merchant:", error));
        } else {
            alert('Please enter a valid name and price.');
        }
    });

    document.getElementById('merchantList').addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const id = e.target.closest('li').dataset.id;
            if (confirm('Are you sure you want to delete this merchant?')) {
                merchantsRef.child(id).remove()
                    .catch(error => console.error("Error deleting merchant:", error));
            }
        }
        if (e.target.classList.contains('edit-btn')) {
            const li = e.target.closest('li');
            const id = li.dataset.id;
            const currentName = li.querySelector('.item-name').textContent;
            const currentPrice = li.querySelector('.item-price').textContent.replace(' Ks', '').replace(/,/g, '');

            const newName = prompt("Edit merchant name:", currentName);
            const newPrice = prompt("Edit default price:", currentPrice);

            if (newName !== null && newPrice !== null) {
                const updatedPrice = parseFloat(newPrice);
                if (!isNaN(updatedPrice)) {
                    merchantsRef.child(id).update({ name: newName, price: updatedPrice })
                        .catch(error => console.error("Error updating merchant:", error));
                } else {
                    alert('Invalid price entered.');
                }
            }
        }
    });
}

function updateMerchantList() {
    const merchantList = document.getElementById('merchantList');
    merchantList.innerHTML = '';
    merchantsData.forEach(merchant => {
        const li = document.createElement('li');
        li.dataset.id = merchant.id;
        li.innerHTML = `
            <span class="item-info">
                <span class="item-name">${merchant.name}</span>:
                <span class="item-price">${formatNumber(merchant.price)} Ks</span>
            </span>
            <div class="item-actions">
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
            </div>
        `;
        merchantList.appendChild(li);
    });
}

function setupBuySettingsPage() {
    const descriptionForm = document.getElementById('descriptionForm');

    descriptionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('newDescriptionName').value;
        if (name) {
            descriptionsRef.push(name)
                .then(() => descriptionForm.reset())
                .catch(error => console.error("Error adding description:", error));
        } else {
            alert('Please enter a valid description.');
        }
    });

    document.getElementById('descriptionList').addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const id = e.target.closest('li').dataset.id;
            if (confirm('Are you sure you want to delete this description?')) {
                descriptionsRef.child(id).remove()
                    .catch(error => console.error("Error deleting description:", error));
            }
        }
        if (e.target.classList.contains('edit-btn')) {
            const li = e.target.closest('li');
            const id = li.dataset.id;
            const currentName = li.querySelector('.item-info').textContent;

            const newName = prompt("Edit description:", currentName);

            if (newName !== null && newName.trim() !== "") {
                descriptionsRef.child(id).set(newName)
                    .catch(error => console.error("Error updating description:", error));
            }
        }
    });
}

function updateDescriptionList() {
    const descriptionList = document.getElementById('descriptionList');
    descriptionList.innerHTML = '';
    descriptionsData.forEach(description => {
        const li = document.createElement('li');
        li.dataset.id = description.id;
        li.innerHTML = `
            <span class="item-info">${description.name}</span>
            <div class="item-actions">
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
            </div>
        `;
        descriptionList.appendChild(li);
    });
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
                // Only update if the value has changed
                const currentItem = dataArray.find(item => item.id === key);
                if (currentItem && currentItem.paid !== newPaidStatus) {
                    updates[key] = { paid: newPaidStatus };
                }
            }
        });
        
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
