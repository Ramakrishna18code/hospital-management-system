// Inventory API Service
const API_URL = 'http://localhost:3000/api';

const InventoryService = {
    // Get all inventory items
    async getAllItems() {
        const response = await fetch(`${API_URL}/inventory`);
        if (!response.ok) throw new Error('Failed to fetch inventory');
        return response.json();
    },

    // Add new item
    async addItem(item) {
        const response = await fetch(`${API_URL}/inventory`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(item)
        });
        if (!response.ok) throw new Error('Failed to add item');
        return response.json();
    },

    // Update item
    async updateItem(id, item) {
        const response = await fetch(`${API_URL}/inventory/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(item)
        });
        if (!response.ok) throw new Error('Failed to update item');
        return response.json();
    },

    // Get item history
    async getItemHistory(id) {
        const response = await fetch(`${API_URL}/inventory/${id}/history`);
        if (!response.ok) throw new Error('Failed to fetch item history');
        return response.json();
    },

    // Import inventory
    async importInventory(file) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_URL}/inventory/import`, {
            method: 'POST',
            body: formData
        });
        if (!response.ok) throw new Error('Failed to import inventory');
        return response.json();
    },

    // Export inventory
    async exportInventory() {
        window.location.href = `${API_URL}/inventory/export`;
    }
};

// Initialize inventory management
async function initializeInventory() {
    try {
        const items = await InventoryService.getAllItems();
        renderInventoryTable(items);
        updateInventoryStats();
    } catch (error) {
        showError('Failed to load inventory');
    }
}

// Render inventory table
function renderInventoryTable(items) {
    const tbody = document.getElementById('inventoryList');
    tbody.innerHTML = '';

    items.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.name}</td>
            <td>${item.category}</td>
            <td>${item.stock}</td>
            <td>$${parseFloat(item.unitPrice).toFixed(2)}</td>
            <td>
                <span class="status ${item.stock <= item.minStock ? 'warning' : 'good'}">
                    ${item.stock <= item.minStock ? 'Low Stock' : 'Good Stock'}
                </span>
            </td>
            <td>
                <button onclick="viewItemDetails(${item.id})" class="icon-button">👁️</button>
                <button onclick="editItem(${item.id})" class="icon-button">✏️</button>
                <button onclick="orderItem(${item.id})" class="icon-button">🛒</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// View item details
async function viewItemDetails(itemId) {
    try {
        const [item, history] = await Promise.all([
            InventoryService.getAllItems().then(items => items.find(i => i.id === itemId)),
            InventoryService.getItemHistory(itemId)
        ]);

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content large">
                <div class="modal-header">
                    <h2>${item.name} - Details</h2>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="tabs">
                        <button class="tab-button active" onclick="switchTab(event, 'details')">Details</button>
                        <button class="tab-button" onclick="switchTab(event, 'history')">History</button>
                        <button class="tab-button" onclick="switchTab(event, 'analytics')">Analytics</button>
                    </div>

                    <div id="details" class="tab-content active">
                        <div class="detail-grid">
                            <div class="detail-group">
                                <h3>Basic Information</h3>
                                <table class="detail-table">
                                    <tr>
                                        <td>Category:</td>
                                        <td>${item.category} - ${item.subcategory}</td>
                                    </tr>
                                    <tr>
                                        <td>Manufacturer:</td>
                                        <td>${item.manufacturer || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td>Location:</td>
                                        <td>${item.location || 'N/A'}</td>
                                    </tr>
                                </table>
                            </div>

                            <div class="detail-group">
                                <h3>Stock Information</h3>
                                <table class="detail-table">
                                    <tr>
                                        <td>Current Stock:</td>
                                        <td>${item.stock} ${item.unit}</td>
                                    </tr>
                                    <tr>
                                        <td>Minimum Stock:</td>
                                        <td>${item.minStock} ${item.unit}</td>
                                    </tr>
                                    <tr>
                                        <td>Reorder Level:</td>
                                        <td>${item.reorderLevel} ${item.unit}</td>
                                    </tr>
                                </table>
                            </div>
                        </div>

                        <div class="detail-group">
                            <h3>Additional Information</h3>
                            <p>${item.description || 'No description available.'}</p>
                        </div>
                    </div>

                    <div id="history" class="tab-content">
                        <div class="history-timeline">
                            ${renderHistoryTimeline(history)}
                        </div>
                    </div>

                    <div id="analytics" class="tab-content">
                        <div class="analytics-grid">
                            <div class="analytics-chart">
                                <canvas id="stockHistory"></canvas>
                            </div>
                            <div class="analytics-stats">
                                <div class="stat-card">
                                    <h4>Average Monthly Usage</h4>
                                    <p class="stat-value">42 units</p>
                                </div>
                                <div class="stat-card">
                                    <h4>Stock Turnover Rate</h4>
                                    <p class="stat-value">3.5x</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        initializeAnalyticsChart();
    } catch (error) {
        showError('Failed to load item details');
    }
}

// Render history timeline
function renderHistoryTimeline(history) {
    if (!history.length) return '<p>No history available</p>';

    return history.map(entry => `
        <div class="timeline-item">
            <div class="timeline-date">
                ${new Date(entry.date).toLocaleDateString()}
            </div>
            <div class="timeline-content">
                <h4>${entry.action}</h4>
                ${renderHistoryChanges(entry.changes)}
            </div>
        </div>
    `).join('');
}

// Render history changes
function renderHistoryChanges(changes) {
    if (changes.old && changes.new) {
        const diffs = [];
        for (const key in changes.new) {
            if (changes.old[key] !== changes.new[key]) {
                diffs.push(`
                    <div class="change-item">
                        <span class="change-key">${key}:</span>
                        <span class="change-old">${changes.old[key]}</span>
                        <span class="change-arrow">→</span>
                        <span class="change-new">${changes.new[key]}</span>
                    </div>
                `);
            }
        }
        return diffs.join('');
    }
    return '<p>Item created</p>';
}

// Initialize analytics chart
function initializeAnalyticsChart() {
    const ctx = document.getElementById('stockHistory').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Stock Level',
                data: [100, 85, 70, 95, 80, 65],
                borderColor: '#1589ee',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Stock Level History'
                }
            }
        }
    });
}

// Switch tabs in item details
function switchTab(event, tabId) {
    const tabContents = event.target.closest('.modal-body').getElementsByClassName('tab-content');
    const tabButtons = event.target.closest('.tabs').getElementsByClassName('tab-button');

    Array.from(tabContents).forEach(content => {
        content.classList.remove('active');
    });

    Array.from(tabButtons).forEach(button => {
        button.classList.remove('active');
    });

    document.getElementById(tabId).classList.add('active');
    event.target.classList.add('active');
}