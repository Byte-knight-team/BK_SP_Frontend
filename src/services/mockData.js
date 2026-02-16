// Mock data for orders with items
export const mockOrders = [
    {
        id: 'ORD-1204',
        tableNumber: 'Table 04',
        customerName: 'Jane Doe',
        phone: '0771234567',
        time: '12:45 PM',
        status: 'pending',
        assignedChef: null,
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
        items: [
            { id: 1, name: 'Grilled Salmon', quantity: 1, notes: 'Medium rare', assignedChef: null, status: 'pending' },
            { id: 2, name: 'Caesar Salad', quantity: 2, notes: '', assignedChef: null, status: 'pending' },
            { id: 3, name: 'Garlic Bread', quantity: 1, notes: 'Extra crispy', assignedChef: null, status: 'pending' },
            { id: 4, name: 'Lemon Tart', quantity: 1, notes: '', assignedChef: null, status: 'pending' },
        ],
    },
    {
        id: 'ORD-1205',
        tableNumber: 'Table 12',
        customerName: 'John Smith',
        phone: '0779876543',
        time: '12:50 PM',
        status: 'pending',
        assignedChef: null,
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop',
        items: [
            { id: 1, name: 'Margherita Pizza', quantity: 1, notes: 'No basil', assignedChef: null, status: 'pending' },
            { id: 2, name: 'Coca Cola', quantity: 2, notes: '', assignedChef: null, status: 'pending' },
        ],
    },
    {
        id: 'ORD-1206',
        tableNumber: 'Table 07',
        customerName: 'Robert Wilson',
        phone: '0775551234',
        time: '01:05 PM',
        status: 'pending',
        assignedChef: null,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
        items: [
            { id: 1, name: 'Classic Burger', quantity: 2, notes: 'No onions', assignedChef: null, status: 'pending' },
            { id: 2, name: 'French Fries', quantity: 2, notes: 'Extra salt', assignedChef: null, status: 'pending' },
            { id: 3, name: 'Milkshake', quantity: 1, notes: 'Chocolate', assignedChef: null, status: 'pending' },
        ],
    },
    {
        id: 'ORD-1207',
        tableNumber: 'Table 03',
        customerName: 'Emily Davis',
        phone: '0771112233',
        time: '01:15 PM',
        status: 'preparing',
        assignedChef: 'Chef Marco',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
        items: [
            { id: 1, name: 'Pasta Carbonara', quantity: 1, notes: '', assignedChef: 'Chef Marco', status: 'assigned' },
            { id: 2, name: 'Bruschetta', quantity: 1, notes: '', assignedChef: 'Chef Marco', status: 'assigned' },
            { id: 3, name: 'Tiramisu', quantity: 1, notes: '', assignedChef: 'Chef Marco', status: 'assigned' },
        ],
    },
    {
        id: 'ORD-1208',
        tableNumber: 'Table 09',
        customerName: 'Michael Brown',
        phone: '0774445566',
        time: '01:20 PM',
        status: 'completed',
        assignedChef: 'Chef Anna',
        image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop',
        items: [
            { id: 1, name: 'Vegetable Stir Fry', quantity: 2, notes: 'Spicy', assignedChef: 'Chef Anna', status: 'completed' },
            { id: 2, name: 'Spring Rolls', quantity: 4, notes: '', assignedChef: 'Chef Anna', status: 'completed' },
            { id: 3, name: 'Jasmine Rice', quantity: 2, notes: '', assignedChef: 'Chef Anna', status: 'completed' },
            { id: 4, name: 'Green Tea', quantity: 2, notes: '', assignedChef: 'Chef Anna', status: 'completed' },
        ],
    },
];

// Available chefs for assignment
export const availableChefs = [
    { id: 1, name: 'Chef Suneera', specialty: 'Sri Lankan Cuisine', status: 'available' },
    { id: 2, name: 'Chef Nimal', specialty: 'Western Cuisine', status: 'available' },
    { id: 3, name: 'Chef Marco', specialty: 'Italian Cuisine', status: 'available' },
    { id: 4, name: 'Chef Isuru', specialty: 'Fusion Cuisine', status: 'available' },
    { id: 5, name: 'Chef Aravinda', specialty: 'Desserts', status: 'available' },
];

// Helper to get order by ID
export const getOrderById = (id) => {
    return mockOrders.find(order => order.id === id);
};
