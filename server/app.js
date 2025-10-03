const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('web'));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, 'inventory-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Data storage path
const DATA_PATH = path.join(__dirname, 'data');
const INVENTORY_FILE = path.join(DATA_PATH, 'inventory.json');
const HISTORY_FILE = path.join(DATA_PATH, 'inventory-history.json');

// Ensure data directory exists
async function initializeDataStorage() {
    try {
        await fs.mkdir(DATA_PATH, { recursive: true });
        try {
            await fs.access(INVENTORY_FILE);
        } catch {
            await fs.writeFile(INVENTORY_FILE, '[]');
        }
        try {
            await fs.access(HISTORY_FILE);
        } catch {
            await fs.writeFile(HISTORY_FILE, '[]');
        }
    } catch (error) {
        console.error('Error initializing data storage:', error);
    }
}

// Initialize data storage
initializeDataStorage();

// Get all inventory items
app.get('/api/inventory', async (req, res) => {
    try {
        const data = await fs.readFile(INVENTORY_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.status(500).json({ error: 'Error reading inventory' });
    }
});

// Add new inventory item
app.post('/api/inventory', async (req, res) => {
    try {
        const data = await fs.readFile(INVENTORY_FILE, 'utf8');
        const inventory = JSON.parse(data);
        const newItem = {
            ...req.body,
            id: Date.now(),
            addedDate: new Date().toISOString()
        };
        inventory.push(newItem);
        await fs.writeFile(INVENTORY_FILE, JSON.stringify(inventory, null, 2));
        
        // Add to history
        await addToHistory({
            itemId: newItem.id,
            action: 'CREATE',
            changes: newItem,
            date: new Date().toISOString()
        });

        res.json(newItem);
    } catch (error) {
        res.status(500).json({ error: 'Error adding item' });
    }
});

// Update inventory item
app.put('/api/inventory/:id', async (req, res) => {
    try {
        const data = await fs.readFile(INVENTORY_FILE, 'utf8');
        let inventory = JSON.parse(data);
        const itemId = parseInt(req.params.id);
        const oldItem = inventory.find(item => item.id === itemId);
        
        if (!oldItem) {
            return res.status(404).json({ error: 'Item not found' });
        }

        const updatedItem = { ...oldItem, ...req.body };
        inventory = inventory.map(item => 
            item.id === itemId ? updatedItem : item
        );

        await fs.writeFile(INVENTORY_FILE, JSON.stringify(inventory, null, 2));
        
        // Add to history
        await addToHistory({
            itemId: itemId,
            action: 'UPDATE',
            changes: {
                old: oldItem,
                new: updatedItem
            },
            date: new Date().toISOString()
        });

        res.json(updatedItem);
    } catch (error) {
        res.status(500).json({ error: 'Error updating item' });
    }
});

// Get item history
app.get('/api/inventory/:id/history', async (req, res) => {
    try {
        const data = await fs.readFile(HISTORY_FILE, 'utf8');
        const history = JSON.parse(data);
        const itemHistory = history.filter(h => h.itemId === parseInt(req.params.id));
        res.json(itemHistory);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching history' });
    }
});

// Bulk import inventory items
app.post('/api/inventory/import', upload.single('file'), async (req, res) => {
    try {
        const results = [];
        const data = await fs.readFile(INVENTORY_FILE, 'utf8');
        let inventory = JSON.parse(data);

        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (row) => {
                const newItem = {
                    ...row,
                    id: Date.now() + results.length,
                    addedDate: new Date().toISOString(),
                    stock: parseInt(row.stock),
                    unitPrice: parseFloat(row.unitPrice)
                };
                results.push(newItem);
            })
            .on('end', async () => {
                inventory = [...inventory, ...results];
                await fs.writeFile(INVENTORY_FILE, JSON.stringify(inventory, null, 2));
                
                // Add bulk import to history
                await addToHistory({
                    action: 'BULK_IMPORT',
                    changes: {
                        itemCount: results.length,
                        items: results
                    },
                    date: new Date().toISOString()
                });

                res.json({ message: `Imported ${results.length} items successfully` });
            });
    } catch (error) {
        res.status(500).json({ error: 'Error importing items' });
    }
});

// Export inventory to CSV
app.get('/api/inventory/export', async (req, res) => {
    try {
        const data = await fs.readFile(INVENTORY_FILE, 'utf8');
        const inventory = JSON.parse(data);
        
        const csvWriter = createCsvWriter({
            path: 'exports/inventory-export.csv',
            header: [
                { id: 'id', title: 'ID' },
                { id: 'name', title: 'Name' },
                { id: 'category', title: 'Category' },
                { id: 'subcategory', title: 'Subcategory' },
                { id: 'stock', title: 'Stock' },
                { id: 'unitPrice', title: 'Unit Price' },
                { id: 'manufacturer', title: 'Manufacturer' },
                { id: 'expiryDate', title: 'Expiry Date' }
            ]
        });

        await csvWriter.writeRecords(inventory);
        res.download('exports/inventory-export.csv');
    } catch (error) {
        res.status(500).json({ error: 'Error exporting inventory' });
    }
});

// Helper function to add to history
async function addToHistory(entry) {
    try {
        const data = await fs.readFile(HISTORY_FILE, 'utf8');
        const history = JSON.parse(data);
        history.push(entry);
        await fs.writeFile(HISTORY_FILE, JSON.stringify(history, null, 2));
    } catch (error) {
        console.error('Error adding to history:', error);
    }
}

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});