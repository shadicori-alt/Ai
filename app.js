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
        const savedInvoices = localStorage.getItem('invoices');
        const savedDrivers = localStorage.getItem('drivers');
        const savedStock = localStorage.getItem('stock');
        
        invoices = savedInvoices ? JSON.parse(savedInvoices) : initialData.invoices;
        drivers = savedDrivers ? JSON.parse(savedDrivers) : initialData.drivers;
        stock = savedStock ? JSON.parse(savedStock) : initialData.stock;
        
        console.log('✅ تم تحميل البيانات بنجاح');
        
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
        
        document.dispatchEvent(new Event('appReady'));
    }
}

// وظائف أساسية
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

// وظائف إدارة الفواتير
function addInvoice(invoiceData) {
    const newInvoice = {
        id: 'INV' + String(invoices.length + 1).padStart(3, '0'),
        ...invoiceData,
        date: new Date().toISOString().split('T')[0],
        lastStatusUpdate: new Date().toISOString()
    };
    
    invoices.push(newInvoice);
    saveData();
    return newInvoice;
}

function updateInvoiceStatus(invoiceId, newStatus) {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
        invoice.status = newStatus;
        invoice.lastStatusUpdate = new Date().toISOString();
        saveData();
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
    saveData();
    return newDriver;
}

// وظائف البحث
function searchInvoices(query) {
    return invoices.filter(invoice => 
        invoice.customerName.toLowerCase().includes(query.toLowerCase()) ||
        invoice.id.toLowerCase().includes(query.toLowerCase()) ||
        invoice.phoneNumber.includes(query) ||
        invoice.address.toLowerCase().includes(query.toLowerCase())
    );
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
            
            // عرض الرد في واجهة المستخدم
            const responseElement = document.getElementById('aiResponseContent');
            const responseContainer = document.getElementById('aiResponse');
            
            if (responseElement && responseContainer) {
                responseElement.innerHTML = response.replace(/\n/g, '<br>');
                responseContainer.classList.remove('hidden');
            }
            
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
    setInterval(saveData, 60000);
    
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
}

// جعل الدوال متاحة globally للاستخدام في HTML
window.addInvoice = addInvoice;
window.updateInvoiceStatus = updateInvoiceStatus;
window.addDriver = addDriver;
window.searchInvoices = searchInvoices;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.showNotification = showNotification;
window.toggleTheme = toggleTheme;