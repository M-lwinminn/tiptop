// --- IMPORTANT: REPLACE WITH YOUR GOOGLE APPS SCRIPT URL ---
const scriptURL = 'https://script.google.com/macros/s/AKfycbzVRw4IFXSrxtb-p9A0JBCwFNLgGDR_-g_F4EI2exDQmnzOnCsV2uoDgEFb_o9Y9-Fp/exec';

// --- Page Navigation & Element References ---
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

// --- Sale Data Page Elements ---
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

// --- Buy Data Page Elements ---
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
document.addEventListener('DOMContentLoaded', init);

function init() {
    // Attach event listeners only if elements exist
    if (sale
