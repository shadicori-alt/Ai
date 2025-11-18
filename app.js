// app.js - الملف الرئيسي للتطبيق
let invoices = [];
let drivers = [];
let stock = [];
let archivedInvoices = [];
let currentTheme = 'light';

// بيانات أولية
const initialData = {
    invoices: [
        {
            "id": "INV001",
            "customerName": "أحمد محمد",
            "phoneNumber": "01234567890",
            "address": "القاهرة - مدينة نصر",
            "amount": 1250.50,
            "driverId": "DRIVER001",
            "status": "قيد التوصيل",
            "date": "2025-11-17",
            "lastStatusUpdate": "2025-11-17T10:30:00"
        },
        {
            "id": "INV002",
            "customerName": "سارة أحمد",
            "phoneNumber": "01123456789",
            "address": "الجيزة - الدقي",
            "amount": 875.25,
            "driverId": "DRIVER002",
            "status": "مسلمة",
            "date": "2025-11-16",
            "lastStatusUpdate": "2025-11-16T15:45:00"
        }
    ],
    drivers: [
        {
            "id": "DRIVER001",
            "name": "محمد عبد الله",
            "phoneNumber": "01098765432",
            "vehicleNumber": "أ ب ج 1234",
            "status": "متاح",
            "totalDeliveries": 45,
            "totalReturns": 3
        },
        {
            "id": "DRIVER002",
            "name": "أحمد سعيد",
            "phoneNumber": "01187654321",
            "vehicleNumber": "د ه و 5678",
            "status": "متاح",
            "totalDeliveries": 62,
            "totalReturns": 1
        }
    ],
    stock: [
        {
            "id": "STK001",
            "name": "جهاز لابتوب HP",
            "category": "إلكترونيات",
            "quantity": 15,
            "minQuantity": 5,
            "price": 8500.00,
            "supplier": "تكنولوجيا المستقبل"
        },
        {
            "id": "STK002",
            "name": "طابعة Canon",
            "category": "إلكترونيات",
            "quantity": 8,
            "minQuantity": 3,
            "price": 2200.00,
            "supplier": "العربية للتجارة"
        }
    ]
};

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', function() {
    loadInitialData();
    initializeApp();
});

function loadInitialData() {
    try {
        // تحميل البيانات من localStorage أو استخدام البيانات الأولية
        const savedInvoices = localStorage.getItem('smart_invoice_invoices');
        const savedDrivers = localStorage.getItem('smart_invoice_drivers');
        const savedStock = localStorage.getItem('smart_invoice_stock');
        const savedArchive = localStorage.getItem('smart_invoice_archive');
        
        invoices = savedInvoices ? JSON.parse(savedInvoices) : initialData.invoices;
        drivers = savedDrivers ? JSON.parse(savedDrivers) : initialData.drivers;
        stock = savedStock ? JSON.parse(savedStock) : initialData.stock;
        archivedInvoices = savedArchive ? JSON.parse(savedArchive) : [];
        
        console.log('✅ تم تحميل البيانات بنجاح');
        console.log(`- الفواتير: ${invoices.length}`);
        console.log(`- المناديب: ${drivers.length}`);
        console.log(`- المخزون: ${stock.length}`);
        console.log(`- الأرشيف: ${archivedInvoices.length}`);
        
        // إشعار أن التطبيق جاهز
        setTimeout(() => {
            document.dispatchEvent(new Event('appReady'));
        }, 100);
        
    } catch (error) {
        console.error('❌ خطأ في تحميل البيانات:', error);
        // استخدام البيانات الأولية في حالة الخطأ
        invoices = initialData.invoices;
        drivers = initialData.drivers;
        stock = initialData.stock;
        archivedInvoices = [];
        
        document.dispatchEvent(new Event('appReady'));
    }
}

// نظام التخزين المحسن
function saveAllData() {
    try {
        localStorage.setItem('smart_invoice_invoices', JSON.stringify(invoices));
        localStorage.setItem('smart_invoice_drivers', JSON.stringify(drivers));
        localStorage.setItem('smart_invoice_stock', JSON.stringify(stock));
        localStorage.setItem('smart_invoice_archive', JSON.stringify(archivedInvoices));
        console.log('💾 تم حفظ جميع البيانات');
        return true;
    } catch (error) {
        console.error('❌ خطأ في حفظ البيانات:', error);
        return false;
    }
}

// وظائف إدارة الفواتير
function addInvoice(invoiceData) {
    const newInvoice = {
        id: 'INV' + String(invoices.length + 1).padStart(3, '0'),
        ...invoiceData,
        date: new Date().toISOString().split('T')[0],
        lastStatusUpdate: new Date().toISOString()
    };
    
    invoices.push(newInvoice);
    saveAllData();
    return newInvoice;
}

function updateInvoiceStatus(invoiceId, newStatus) {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
        invoice.status = newStatus;
        invoice.lastStatusUpdate = new Date().toISOString();
        saveAllData();
        return true;
    }
    return false;
}

function archiveInvoice(invoiceId) {
    const invoiceIndex = invoices.findIndex(inv => inv.id === invoiceId);
    if (invoiceIndex !== -1) {
        const invoice = invoices.splice(invoiceIndex, 1)[0];
        archivedInvoices.push(invoice);
        saveAllData();
        return true;
    }
    return false;
}

// وظائف إدارة المناديب
function addDriver(driverData) {
    const newDriver = {
        id: 'DRIVER' + String(drivers.length + 1).padStart(3, '0'),
        ...driverData,
        totalDeliveries: 0,
        totalReturns: 0
    };
    
    drivers.push(newDriver);
    saveAllData();
    return newDriver;
}

// وظائف إدارة المخزون
function addStockItem(stockData) {
    const newItem = {
        id: 'STK' + String(stock.length + 1).padStart(3, '0'),
        ...stockData
    };
    
    stock.push(newItem);
    saveAllData();
    return newItem;
}

function updateStockQuantity(itemId, newQuantity) {
    const item = stock.find(s => s.id === itemId);
    if (item) {
        item.quantity = newQuantity;
        saveAllData();
        return true;
    }
    return false;
}

// وظائف البحث والتصفية
function searchInvoices(query) {
    return invoices.filter(invoice => 
        invoice.customerName.toLowerCase().includes(query.toLowerCase()) ||
        invoice.id.toLowerCase().includes(query.toLowerCase()) ||
        invoice.phoneNumber.includes(query) ||
        invoice.address.toLowerCase().includes(query.toLowerCase())
    );
}

function getDelayedInvoices() {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return invoices.filter(invoice => 
        invoice.status === 'قيد التوصيل' && 
        new Date(invoice.lastStatusUpdate) < twentyFourHoursAgo
    );
}

function getLowStockItems() {
    return stock.filter(item => item.quantity < item.minQuantity);
}

function getDriverInvoices(driverId) {
    return invoices.filter(invoice => invoice.driverId === driverId);
}

// وظائف المساعدة
function formatCurrency(amount) {
    return new Intl.NumberFormat('ar-EG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount) + ' ج.م';
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('ar-EG');
}

function formatDateTime(dateTimeString) {
    return new Date(dateTimeString).toLocaleString('ar-EG');
}

function showNotification(message, type = 'info') {
    // إنشاء إشعار بسيط
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
        'bg-blue-500 text-white'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // إزالة الإشعار بعد 3 ثواني
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// المساعد الذكي
window.invoiceSystem = {
    handleAIChat: async function(question) {
        try {
            // محاكاة استجابة الذكاء الاصطناعي
            const responses = {
                'أظهر لي أكثر المندوبين تأخيراً': 'أكثر المندوبين تأخيراً:\n• محمود علي: 3 فواتير قيد التوصيل\n• خالد حسن: 2 فاتورة قيد التوصيل',
                'مين عنده فواتير قيد التسليم بقالها أكتر من 72 ساعة؟': 'لا توجد فواتير متأخرة أكثر من 72 ساعة حالياً.',
                'مين العميل اللي طلباته كتير الفترة دي؟': 'أنشط العملاء:\n• أحمد محمد: 5 فواتير\n• سارة أحمد: 3 فواتير',
                'كم فاتورة اتسلمت النهارده؟': 'عدد الفواتير المسلمة اليوم: 12 فاتورة',
                'أعطني توصيات لتحسين الأداء': 'التوصيات:\n• توزيع المندوبين غير متوازن في منطقة مدينة نصر\n• إضافة مندوب إضافي للمناطق المزدحمة\n• تحسين جدولة التوصيل في ساعات الذروة'
            };
            
            const response = responses[question] || 'سأقوم بتحليل طلبك وتقديم التوصيات المناسبة...';
            return response;
            
        } catch (error) {
            console.error('❌ خطأ في المساعد الذكي:', error);
            return 'عذراً، حدث خطأ في معالجة طلبك. يرجى المحاولة مرة أخرى.';
        }
    }
};

// تهيئة التطبيق
function initializeApp() {
    console.log('🚀 التطبيق جاهز للاستخدام');
    
    // حفظ تلقائي كل دقيقة
    setInterval(saveAllData, 60000);
    
    // إعدادات إضافية
    setupTheme();
}

function setupTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        currentTheme = savedTheme;
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', currentTheme);
    showNotification(`تم التبديل إلى الوضع ${currentTheme === 'dark' ? 'الداكن' : 'الفاتح'}`);
}

// وظائف الفرز
function sortTable(data, column, direction) {
    return [...data].sort((a, b) => {
        let aValue = a[column];
        let bValue = b[column];
        
        if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }
        
        if (direction === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });
}

// جعل الدوال متاحة globally للاستخدام في HTML
window.addInvoice = addInvoice;
window.updateInvoiceStatus = updateInvoiceStatus;
window.addDriver = addDriver;
window.addStockItem = addStockItem;
window.updateStockQuantity = updateStockQuantity;
window.searchInvoices = searchInvoices;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.formatDateTime = formatDateTime;
window.showNotification = showNotification;
window.toggleTheme = toggleTheme;
window.getDelayedInvoices = getDelayedInvoices;
window.getLowStockItems = getLowStockItems;
window.getDriverInvoices = getDriverInvoices;
window.sortTable = sortTable;
window.saveAllData = saveAllData;