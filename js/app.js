// LocalStorage Management & Global App States
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let categories = JSON.parse(localStorage.getItem('categories')) || ['Food', 'Transport', 'Fun'];
let currentTheme = localStorage.getItem('theme') || 'light';
let myChart = null;

// DOM Elements
const balanceDisplay = document.getElementById('total-balance');
const transactionList = document.getElementById('transaction-list');
const expenseForm = document.getElementById('expense-form');
const categorySelect = document.getElementById('category');
const customCategoryForm = document.getElementById('custom-category-form');
const themeToggleBtn = document.getElementById('theme-toggle');
const sortFilter = document.getElementById('sort-filter');

// Apply Theme immediately on run
document.documentElement.setAttribute('data-theme', currentTheme);

// Initialize Chart Framework
function initChart() {
    const ctx = document.getElementById('expense-chart').getContext('2d');
    myChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff', '#ff9f40']
            }]
        },
        options: { responsive: true }
    });
}

// Compute metrics, render DOM list, dynamic chart mutations
function updateUI() {
    // 1. Calculate Balance
    const total = transactions.reduce((acc, curr) => acc + curr.amount, 0);
    balanceDisplay.textContent = `$${total.toFixed(2)}`;

    // 2. Clear out List view
    transactionList.innerHTML = '';

    // 3. Clone & Sort Array based on current filters
    let renderData = [...transactions];
    const sortVal = sortFilter.value;
    if (sortVal === 'amount-high') {
        renderData.sort((a, b) => b.amount - a.amount);
    } else if (sortVal === 'category') {
        renderData.sort((a, b) => a.category.localeCompare(b.category));
    } else {
        renderData.reverse(); // Latest first
    }

    // 4. Inject entries to list UI
    renderData.forEach(item => {
        const li = document.createElement('li');
        li.className = 'transaction-item';
        li.innerHTML = `
            <div class="item-details">
                <strong>${item.name}</strong>
                <span>${item.category}</span>
            </div>
            <div>
                <span style="margin-right:15px; font-weight:bold;">$${item.amount.toFixed(2)}</span>
                <button class="delete-btn" onclick="deleteTransaction(${item.id})">×</button>
            </div>
        `;
        transactionList.appendChild(li);
    });

    // 5. Update Dynamic Form categories 
    categorySelect.innerHTML = categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');

    // 6. Regenerate Chart Analytics
    updateChartData();
}

function updateChartData() {
    const dataMap = {};
    categories.forEach(cat => dataMap[cat] = 0);
    transactions.forEach(item => {
        if (dataMap[item.category] !== undefined) {
            dataMap[item.category] += item.amount;
        } else {
            dataMap[item.category] = item.amount;
        }
    });

    myChart.data.labels = Object.keys(dataMap);
    myChart.data.datasets[0].data = Object.values(dataMap);
    myChart.update();
}

// Actions & Submission Intercepts
expenseForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('item-name').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);
    const category = categorySelect.value;

    if(!name || isNaN(amount) || !category) return;

    const newTx = { id: Date.now(), name, amount, category };
    transactions.push(newTx);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    expenseForm.reset();
    updateUI();
});

// Optional Challenge 1: Custom Category implementation
customCategoryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newCatInput = document.getElementById('new-category');
    const newCat = newCatInput.value.trim();

    if(newCat && !categories.includes(newCat)) {
        categories.push(newCat);
        localStorage.setItem('categories', JSON.stringify(categories));
        newCatInput.value = '';
        updateUI();
    }
});

// Global Function context scope for inline action bindings
window.deleteTransaction = (id) => {
    transactions = transactions.filter(item => item.id !== id);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    updateUI();
};

// Optional Challenge 2: Live UI Refilter/Sorting binds
sortFilter.addEventListener('change', updateUI);

// Optional Challenge 3: System Theme toggling state inversion mapping
themeToggleBtn.addEventListener('click', () => {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
});

// Engine Kickstart
initChart();
updateUI();