// ==========================================
// MOCK DATA — Chief Chef Kitchen Dashboard
// ==========================================

// ---------- CHEFS ----------
export const chefs = [
    { id: 1, name: 'Felix Arvid', role: 'Executive Chef', status: 'available', mealsAssigned: 42, avgPrepTime: '11m 40s', avgPrepChange: -2, phone: '0771234567', email: 'felix@kitchen.com', shift: 'Morning', image: null },
    { id: 2, name: 'Sarah Jenkins', role: 'Sous Chef', status: 'busy', mealsAssigned: 28, avgPrepTime: '14m 15s', avgPrepChange: 0, phone: '0779876543', email: 'sarah@kitchen.com', shift: 'Morning', image: null },
    { id: 3, name: 'Miguel Rivera', role: 'Line Cook', status: 'offline', mealsAssigned: 0, avgPrepTime: 'N/A', avgPrepChange: 0, phone: '0775551234', email: 'miguel@kitchen.com', shift: 'Evening', image: null },
    { id: 4, name: 'Emily Zhang', role: 'Pastry Chef', status: 'available', mealsAssigned: 12, avgPrepTime: '18m 05s', avgPrepChange: 0, phone: '0771112233', email: 'emily@kitchen.com', shift: 'Morning', image: null },
    { id: 5, name: 'Chef Nimal', role: 'Line Cook', status: 'available', mealsAssigned: 8, avgPrepTime: '12m 30s', avgPrepChange: -1, phone: '0774445566', email: 'nimal@kitchen.com', shift: 'Morning', image: null },
    { id: 6, name: 'Chef Kamal', role: 'Grill Master', status: 'busy', mealsAssigned: 15, avgPrepTime: '10m 20s', avgPrepChange: 3, phone: '0777889900', email: 'kamal@kitchen.com', shift: 'Evening', image: null },
];

// ---------- INVENTORY ----------
export const inventoryItems = [
    { id: 1, name: 'Wagyu Beef (A5)', unit: 'kg', currentQty: 0.5, threshold: 2.0, status: 'critical', image: '🥩' },
    { id: 2, name: 'Maldon Sea Salt', unit: 'kg', currentQty: 1.2, threshold: 3.0, status: 'low', image: '🧂' },
    { id: 3, name: 'Truffle Oil', unit: 'liters', currentQty: 0.8, threshold: 1.5, status: 'low', image: '🫒' },
    { id: 4, name: 'Organic Flour', unit: 'bags (25kg)', currentQty: 12, threshold: 5, status: 'ok', image: '🌾' },
    { id: 5, name: 'Heavy Cream', unit: 'liters', currentQty: 45, threshold: 15, status: 'ok', image: '🥛' },
    { id: 6, name: 'Fresh Chicken', unit: 'kg', currentQty: 1.5, threshold: 10, status: 'critical', image: '🍗' },
    { id: 7, name: 'Roma Tomatoes', unit: 'kg', currentQty: 2, threshold: 12, status: 'low', image: '🍅' },
    { id: 8, name: 'Mozzarella Cheese', unit: 'kg', currentQty: 8, threshold: 5, status: 'ok', image: '🧀' },
    { id: 9, name: 'Olive Oil', unit: 'liters', currentQty: 20, threshold: 10, status: 'ok', image: '🫒' },
    { id: 10, name: 'Basmati Rice', unit: 'kg', currentQty: 25, threshold: 10, status: 'ok', image: '🍚' },
];

// ---------- MENU ITEMS ----------
export const menuItems = [
    {
        id: 1, name: 'Signature Burger', category: 'Main Course', price: 18.50, cookTime: '15 min', status: 'approved', image: '🍔',
        ingredients: [
            { name: 'Beef Patty (Premium)', qty: 1, unit: 'pcs' },
            { name: 'Brioche Bun', qty: 1, unit: 'pcs' },
            { name: 'Romaine Lettuce', qty: 20, unit: 'g' },
            { name: 'Special House Sauce', qty: 15, unit: 'ml' },
        ],
        prepSteps: '1. Sear the beef patty on high heat for 3 mins each side.\n2. Toast brioche bun until golden.\n3. Apply 15ml of special sauce to the bottom bun.\n4. Layer lettuce, patty, and top bun.',
        totalCost: 4.25, foodCostPercent: 23.6,
    },
    {
        id: 2, name: 'Truffle Pasta', category: 'Main Course', price: 24.00, cookTime: '20 min', status: 'approved', image: '🍝',
        ingredients: [
            { name: 'Fresh Pasta', qty: 200, unit: 'g' },
            { name: 'Truffle Oil', qty: 10, unit: 'ml' },
            { name: 'Parmesan', qty: 30, unit: 'g' },
            { name: 'Heavy Cream', qty: 50, unit: 'ml' },
        ],
        prepSteps: '1. Cook pasta al dente.\n2. Prepare cream sauce with parmesan.\n3. Toss with truffle oil.\n4. Plate and garnish.',
        totalCost: 6.80, foodCostPercent: 28.3,
    },
    {
        id: 3, name: 'Garden Salad', category: 'Appetizer', price: 12.00, cookTime: '5 min', status: 'approved', image: '🥗',
        ingredients: [
            { name: 'Mixed Greens', qty: 100, unit: 'g' },
            { name: 'Cherry Tomatoes', qty: 50, unit: 'g' },
            { name: 'Olive Oil', qty: 15, unit: 'ml' },
        ],
        prepSteps: '1. Wash and dry greens.\n2. Halve tomatoes.\n3. Toss with olive oil dressing.',
        totalCost: 2.10, foodCostPercent: 17.5,
    },
    {
        id: 4, name: 'Lava Cake', category: 'Dessert', price: 14.00, cookTime: '12 min', status: 'pending', image: '🍫',
        ingredients: [
            { name: 'Dark Chocolate', qty: 100, unit: 'g' },
            { name: 'Butter', qty: 50, unit: 'g' },
            { name: 'Organic Flour', qty: 30, unit: 'g' },
            { name: 'Eggs', qty: 2, unit: 'pcs' },
        ],
        prepSteps: '1. Melt chocolate with butter.\n2. Whisk eggs and fold in flour.\n3. Combine and bake at 200°C for 12 mins.',
        totalCost: 3.50, foodCostPercent: 25.0,
    },
    {
        id: 5, name: 'Chicken Kottu', category: 'Main Course', price: 16.00, cookTime: '18 min', status: 'approved', image: '🍛',
        ingredients: [
            { name: 'Fresh Chicken', qty: 200, unit: 'g' },
            { name: 'Roti', qty: 2, unit: 'pcs' },
            { name: 'Vegetables', qty: 100, unit: 'g' },
            { name: 'Spice Mix', qty: 10, unit: 'g' },
        ],
        prepSteps: '1. Dice chicken and stir-fry.\n2. Shred roti.\n3. Combine with veggies and spices on high heat.',
        totalCost: 3.80, foodCostPercent: 23.8,
    },
];

// ---------- ORDERS ----------
export const orders = [
    {
        id: 'ORD-1204', time: '12:45 PM', date: 'October 24, 2023', type: 'Dine-in', table: 'Table 08', status: 'pending',
        customerNotes: 'No onions, extra spicy please. The kid\'s burger needs to be well done.',
        meals: [
            { id: 1, name: 'Classic Beef Burger', category: 'Main Course', qty: 2, assignedChef: null, status: 'pending', image: '🍔' },
            { id: 2, name: 'Large Crispy Fries', category: 'Sides', qty: 1, assignedChef: null, status: 'pending', image: '🍟' },
            { id: 3, name: 'Grilled Chicken Burger', category: 'Main Course', qty: 1, assignedChef: null, status: 'pending', image: '🍔' },
            { id: 4, name: 'Garden Salad', category: 'Appetizer', qty: 1, assignedChef: null, status: 'pending', image: '🥗' },
        ],
        timeline: { received: '12:45 PM', preparing: null, completed: null },
    },
    {
        id: 'ORD-1205', time: '12:48 PM', date: 'October 24, 2023', type: 'Dine-in', table: 'Table 03', status: 'pending',
        customerNotes: 'Gluten free options if available.',
        meals: [
            { id: 1, name: 'Truffle Pasta', category: 'Main Course', qty: 1, assignedChef: null, status: 'pending', image: '🍝' },
            { id: 2, name: 'Lava Cake', category: 'Dessert', qty: 1, assignedChef: null, status: 'pending', image: '🍫' },
        ],
        timeline: { received: '12:48 PM', preparing: null, completed: null },
    },
    {
        id: 'ORD-1206', time: '12:50 PM', date: 'October 24, 2023', type: 'Delivery', table: null, status: 'pending',
        customerNotes: 'Pack carefully for delivery. Add extra napkins.',
        meals: [
            { id: 1, name: 'Signature Burger', category: 'Main Course', qty: 2, assignedChef: null, status: 'pending', image: '🍔' },
            { id: 2, name: 'Large Crispy Fries', category: 'Sides', qty: 2, assignedChef: null, status: 'pending', image: '🍟' },
            { id: 3, name: 'Garden Salad', category: 'Appetizer', qty: 1, assignedChef: null, status: 'pending', image: '🥗' },
            { id: 4, name: 'Chicken Kottu', category: 'Main Course', qty: 2, assignedChef: null, status: 'pending', image: '🍛' },
            { id: 5, name: 'Truffle Pasta', category: 'Main Course', qty: 1, assignedChef: null, status: 'pending', image: '🍝' },
            { id: 6, name: 'Lava Cake', category: 'Dessert', qty: 1, assignedChef: null, status: 'pending', image: '🍫' },
            { id: 7, name: 'Classic Beef Burger', category: 'Main Course', qty: 1, assignedChef: null, status: 'pending', image: '🍔' },
            { id: 8, name: 'Grilled Chicken Burger', category: 'Main Course', qty: 1, assignedChef: null, status: 'pending', image: '🍔' },
        ],
        timeline: { received: '12:50 PM', preparing: null, completed: null },
    },
    {
        id: 'ORD-1207', time: '01:05 PM', date: 'October 24, 2023', type: 'Dine-in', table: 'Table 05', status: 'pending',
        customerNotes: '',
        meals: [
            { id: 1, name: 'Chicken Kottu', category: 'Main Course', qty: 1, assignedChef: null, status: 'pending', image: '🍛' },
            { id: 2, name: 'Garden Salad', category: 'Appetizer', qty: 1, assignedChef: null, status: 'pending', image: '🥗' },
            { id: 3, name: 'Lava Cake', category: 'Dessert', qty: 1, assignedChef: null, status: 'pending', image: '🍫' },
        ],
        timeline: { received: '01:05 PM', preparing: null, completed: null },
    },
    {
        id: 'ORD-1200', time: '11:30 AM', date: 'October 24, 2023', type: 'Dine-in', table: 'Table 01', status: 'preparing',
        customerNotes: 'Birthday celebration — candle on the lava cake please!',
        meals: [
            { id: 1, name: 'Truffle Pasta', category: 'Main Course', qty: 2, assignedChef: 'Felix Arvid', status: 'preparing', image: '🍝' },
            { id: 2, name: 'Signature Burger', category: 'Main Course', qty: 1, assignedChef: 'Sarah Jenkins', status: 'preparing', image: '🍔' },
            { id: 3, name: 'Lava Cake', category: 'Dessert', qty: 2, assignedChef: 'Emily Zhang', status: 'preparing', image: '🍫' },
        ],
        timeline: { received: '11:30 AM', preparing: '11:35 AM', completed: null },
    },
    {
        id: 'ORD-1201', time: '11:40 AM', date: 'October 24, 2023', type: 'Dine-in', table: 'Table 10', status: 'preparing',
        customerNotes: 'Medium rare steaks.',
        meals: [
            { id: 1, name: 'Classic Beef Burger', category: 'Main Course', qty: 3, assignedChef: 'Chef Kamal', status: 'preparing', image: '🍔' },
            { id: 2, name: 'Large Crispy Fries', category: 'Sides', qty: 3, assignedChef: 'Chef Nimal', status: 'preparing', image: '🍟' },
        ],
        timeline: { received: '11:40 AM', preparing: '11:48 AM', completed: null },
    },
    {
        id: 'ORD-1202', time: '11:45 AM', date: 'October 24, 2023', type: 'Dine-in', table: 'Table 06', status: 'preparing',
        customerNotes: '',
        meals: [
            { id: 1, name: 'Chicken Kottu', category: 'Main Course', qty: 2, assignedChef: 'Chef Nimal', status: 'preparing', image: '🍛' },
        ],
        timeline: { received: '11:45 AM', preparing: '11:50 AM', completed: null },
    },
    {
        id: 'ORD-1203', time: '11:50 AM', date: 'October 24, 2023', type: 'Delivery', table: null, status: 'preparing',
        customerNotes: 'Deliver before 1 PM.',
        meals: [
            { id: 1, name: 'Signature Burger', category: 'Main Course', qty: 2, assignedChef: 'Felix Arvid', status: 'preparing', image: '🍔' },
            { id: 2, name: 'Garden Salad', category: 'Appetizer', qty: 2, assignedChef: 'Chef Nimal', status: 'preparing', image: '🥗' },
        ],
        timeline: { received: '11:50 AM', preparing: '11:55 AM', completed: null },
    },
];

// Generate completed orders for history
const completedOrders = Array.from({ length: 28 }, (_, i) => ({
    id: `ORD-${1100 + i}`,
    time: `${9 + Math.floor(i / 4)}:${String((i * 15) % 60).padStart(2, '0')} AM`,
    date: 'October 24, 2023',
    type: i % 3 === 0 ? 'Delivery' : 'Dine-in',
    table: i % 3 === 0 ? null : `Table ${String(1 + (i % 12)).padStart(2, '0')}`,
    status: 'completed',
    customerNotes: '',
    meals: [
        { id: 1, name: menuItems[i % menuItems.length].name, category: 'Main Course', qty: 1 + (i % 3), assignedChef: chefs[i % chefs.length].name, status: 'completed', image: menuItems[i % menuItems.length].image },
    ],
    timeline: {
        received: `${9 + Math.floor(i / 4)}:${String((i * 15) % 60).padStart(2, '0')} AM`,
        preparing: `${9 + Math.floor(i / 4)}:${String(((i * 15) + 5) % 60).padStart(2, '0')} AM`,
        completed: `${9 + Math.floor(i / 4)}:${String(((i * 15) + 18) % 60).padStart(2, '0')} AM`,
    },
}));

export const allOrders = [...orders, ...completedOrders];

// Generate a couple of cancelled orders for the Cancelled tab
const cancelledOrders = [
    {
        id: 'ORD-1098', time: '10:15 AM', date: 'October 24, 2023', type: 'Delivery', table: null, status: 'cancelled',
        customerNotes: 'Customer cancelled — waited too long.',
        meals: [
            { id: 1, name: 'Truffle Pasta', category: 'Main Course', qty: 1, assignedChef: null, status: 'cancelled', cancelReason: 'Customer request', image: '🍝' },
            { id: 2, name: 'Lava Cake', category: 'Dessert', qty: 1, assignedChef: null, status: 'cancelled', cancelReason: 'Customer request', image: '🍫' },
        ],
        timeline: { received: '10:15 AM', preparing: null, completed: null },
    },
    {
        id: 'ORD-1095', time: '09:40 AM', date: 'October 24, 2023', type: 'Dine-in', table: 'Table 02', status: 'cancelled',
        customerNotes: '',
        meals: [
            { id: 1, name: 'Signature Burger', category: 'Main Course', qty: 2, assignedChef: null, status: 'cancelled', cancelReason: 'Out of ingredients', image: '🍔' },
        ],
        timeline: { received: '09:40 AM', preparing: null, completed: null },
    },
];

export { cancelledOrders };
allOrders.push(...cancelledOrders);

// ---------- APPROVALS ----------
export const approvals = [
    { id: 1, type: 'Add Chef', title: 'New Chef: David Perera', details: 'Role: Line Cook, Shift: Evening', submittedAt: '2 hours ago', status: 'pending' },
    { id: 2, type: 'Menu Change', title: 'Update: Lava Cake price $14 → $16', details: 'Price increase due to ingredient cost', submittedAt: '5 hours ago', status: 'pending' },
    { id: 3, type: 'Recipe Change', title: 'Edit: Signature Burger recipe', details: 'Added truffle mayo to ingredients', submittedAt: '1 day ago', status: 'pending' },
    { id: 4, type: 'Menu Change', title: 'New Item: Mango Smoothie', details: 'Category: Beverages, Price: $8', submittedAt: '1 day ago', status: 'approved' },
    { id: 5, type: 'Add Chef', title: 'New Chef: Amara Silva', details: 'Role: Pastry Chef, Shift: Morning', submittedAt: '2 days ago', status: 'rejected' },
];

// ---------- ACTIVITY FEED ----------
export const activityFeed = [
    { id: 1, text: 'Order #124 moved to', highlight: 'PREPARING', time: '2 minutes ago', source: 'Table 04', dot: 'orange' },
    { id: 2, text: 'Chef Nimal assigned to', highlight: 'Chicken Kottu Special', time: '14 minutes ago', source: 'Main Kitchen', dot: 'green' },
    { id: 3, text: 'New Order received: #128', highlight: '(3 Items)', time: '18 minutes ago', source: 'Delivery App', dot: 'orange' },
    { id: 4, text: 'Inventory Alert:', highlight: 'Chicken Breast', suffix: 'is below threshold', time: '45 minutes ago', source: 'Storage A', dot: 'orange' },
    { id: 5, text: 'Meal cancelled:', highlight: 'Truffle Pasta', suffix: '— reason: customer request', time: '1 hour ago', source: 'Table 02', dot: 'red' },
    { id: 6, text: 'Inventory updated:', highlight: 'Flour +2kg', time: '1.5 hours ago', source: 'Storage B', dot: 'blue' },
];

// ---------- CHART DATA ----------
export const mostWantedMeals = [
    { name: 'Signature Burger', value: 124 },
    { name: 'Quattro Formaggi', value: 98 },
    { name: 'Pasta Carbonara', value: 76 },
    { name: 'Garden Fresh Salad', value: 42 },
];

export const peakHoursData = [
    { hour: '08 AM', orders: 5 },
    { hour: '09 AM', orders: 8 },
    { hour: '10 AM', orders: 12 },
    { hour: '11 AM', orders: 18 },
    { hour: '12 PM', orders: 32 },
    { hour: '01 PM', orders: 28 },
    { hour: '02 PM', orders: 20 },
    { hour: '03 PM', orders: 10 },
    { hour: '04 PM', orders: 14 },
    { hour: '05 PM', orders: 22 },
    { hour: '06 PM', orders: 30 },
    { hour: '07 PM', orders: 35 },
    { hour: '08 PM', orders: 28 },
    { hour: '09 PM', orders: 15 },
    { hour: '10 PM', orders: 8 },
];
