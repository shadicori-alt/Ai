// app.js - مبسط ومؤكد العمل
console.log('🚀 تحميل app.js');

// بيانات التطبيق
let invoices = [];
let drivers = []; 
let stock = [];
let currentTheme = 'light';

// بيانات أولية للاختبار
const sampleData = {
    invoices: [
        {
            id: "INV001",
            customerName: "أحمد محمد",
            phoneNumber: "01234567890", 
            address: "القاهرة - مدينة نصر",
            amount: 1250.50,
            driverId: "DRV001",
            status: "قيد التوصيل",
            date: "2024-01-15"
        }
    ],
    drivers: [
        {
            id: "DRV001",
            name: "محمد عبد الله",
            phoneNumber: "01098765432",
            vehicleNumber: "أ ب ج 1234",
            status: "متاح",
            totalDeliveries: 45
        }
    ],
    stock: [
        {
            id: "STK001",
            name: "لابتوب HP",
            category: "إلكترونيات",
            quantity: 15,
            minQuantity: 5,
            price: 8500.00
        }
    ]
};

// تحميل البيانات
function loadInitialData() {
    console.log('📂 تحميل البيانات الأولية');
    
    try {
        invoices = [...sampleData.invoices];
        drivers = [...sampleData.drivers];
        stock = [...sampleData.stock];
        
        console.log('✅ تم تحميل البيانات بنجاح');
    } catch (error) {
        console.error('❌ خطأ في تحميل البيانات:', error);
    }
}

// حفظ البيانات
function saveData() {
    try {
        localStorage.setItem('invoices', JSON.stringify(invoices));
        localStorage.setItem('drivers', JSON.stringify(drivers));
        localStorage.setItem('stock', JSON.stringify(stock));
        console.log('💾 تم حفظ البيانات');
    } catch (error) {
        console.error('❌ خطأ في حفظ البيانات:', error);
    }
}

// وظائف أساسية
function addInvoice(invoiceData) {
    const newInvoice = {
        id: 'INV' + (invoices.length + 1).toString().padStart(3, '0'),
        ...invoiceData,
        date: new Date().toISOString().split('T')[0]
    };
    
    invoices.push(newInvoice);
    saveData();
    return newInvoice;
}

function formatCurrency(amount) {
    return amount.toLocaleString('ar-EG') + ' ج.م';
}

function showNotification(message, type = 'info') {
    alert(message); // نسخة مبسطة للإشعارات
}

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 التطبيق جاهز');
    loadInitialData();
});

// جعل الدوال متاحة عالمياً
window.addInvoice = addInvoice;
window.formatCurrency = formatCurrency;
window.showNotification = showNotification;