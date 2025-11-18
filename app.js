// Global variables for data storage
let invoices = [];
let drivers = [];
let stock = [];
let archivedInvoices = [];
let currentTheme = 'light';

// Theme colors
const themes = {
    light: {
        primary: '#2563eb',
        secondary: '#64748b',
        success: '#059669',
        danger: '#dc2626',
        warning: '#d97706',
        info: '#0891b2',
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#1e293b',
        border: '#e2e8f0'
    },
    dark: {
        primary: '#3b82f6',
        secondary: '#94a3b8',
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
        info: '#06b6d4',
        background: '#0f172a',
        surface: '#1e293b',
        text: '#f1f5f9',
        border: '#334155'
    }
};

// Load data from JSON files
async function loadData() {
    try {
        const [invoicesResponse, driversResponse, stockResponse] = await Promise.all([
            fetch('./invoices.json'),
            fetch('./drivers.json'),
            fetch('./stock.json')
        ]);
        
        invoices = await invoicesResponse.json();
        drivers = await driversResponse.json();
        stock = await stockResponse.json();
        
        // Load archived invoices from localStorage if exists
        const archivedData = localStorage.getItem('archivedInvoices');
        if (archivedData) {
            archivedInvoices = JSON.parse(archivedData);
        }
        
        // Load theme from localStorage
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            currentTheme = savedTheme;
            applyTheme(currentTheme);
        }
        
        return true;
    } catch (error) {
        console.error('Error loading data:', error);
        return false;
    }
}

// Apply theme
function applyTheme(theme) {
    const root = document.documentElement;
    const colors = themes[theme];
    
    Object.entries(colors).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value);
    });
    
    document.body.className = document.body.className.replace(/theme-\w+/, '');
    document.body.classList.add(`theme-${theme}`);
    
    // Update theme toggle button
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.innerHTML = theme === 'light' ? 
            '<i class=\"bi bi-moon-fill\"></i>' : 
            '<i class=\"bi bi-sun-fill\"></i>';
    }
}

// Toggle theme
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(currentTheme);
    localStorage.setItem('theme', currentTheme);
}

// Statistics functions
function getStatistics() {
    const totalInvoices = invoices.length;
    const pendingInvoices = invoices.filter(inv => inv.status === 'قيد التوصيل').length;
    const deliveredInvoices = invoices.filter(inv => inv.status === 'مسلمة').length;
    const returnedInvoices = invoices.filter(inv => inv.status === 'مرتجعة').length;
    const totalDrivers = drivers.length;
    const totalStockItems = stock.length;
    
    return {
        totalInvoices,
        pendingInvoices,
        deliveredInvoices,
        returnedInvoices,
        totalDrivers,
        totalStockItems
    };
}

// Get recent invoices
function getRecentInvoices(limit = 10) {
    return invoices
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, limit);
}

// Invoice functions
function addInvoice(invoiceData) {
    const newInvoice = {
        id: `INV${String(invoices.length + 1).padStart(3, '0')}`,
        ...invoiceData,
        date: new Date().toISOString().split('T')[0],
        lastStatusUpdate: new Date().toISOString()
    };
    invoices.push(newInvoice);
    return newInvoice;
}

function updateInvoiceStatus(invoiceId, newStatus) {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
        invoice.status = newStatus;
        invoice.lastStatusUpdate = new Date().toISOString();
        return true;
    }
    return false;
}

function searchInvoices(query) {
    return invoices.filter(inv => 
        inv.customerName.includes(query) ||
        inv.id.includes(query) ||
        inv.phoneNumber.includes(query) ||
        inv.address.includes(query)
    );
}

function filterInvoicesByStatus(status) {
    return invoices.filter(inv => inv.status === status);
}

function filterInvoicesByDriver(driverId) {
    return invoices.filter(inv => inv.driverId === driverId);
}

// Driver functions
function addDriver(driverData) {
    const newDriver = {
        id: `DRIVER${String(drivers.length + 1).padStart(3, '0')}`,
        ...driverData,
        totalDeliveries: 0,
        totalReturns: 0
    };
    drivers.push(newDriver);
    return newDriver;
}

function getDriverInvoices(driverId) {
    return invoices.filter(inv => inv.driverId === driverId);
}

// Stock functions
function addStockItem(itemData) {
    const newItem = {
        id: `STK${String(stock.length + 1).padStart(3, '0')}`,
        ...itemData
    };
    stock.push(newItem);
    return newItem;
}

function updateStockQuantity(itemId, newQuantity) {
    const item = stock.find(item => item.id === itemId);
    if (item) {
        item.quantity = newQuantity;
        return true;
    }
    return false;
}

function getLowStockItems() {
    return stock.filter(item => item.quantity < item.minQuantity);
}

// Archive functions
function archiveInvoice(invoiceId) {
    const invoiceIndex = invoices.findIndex(inv => inv.id === invoiceId);
    if (invoiceIndex !== -1) {
        const [archivedInvoice] = invoices.splice(invoiceIndex, 1);
        archivedInvoice.archivedDate = new Date().toISOString();
        archivedInvoices.push(archivedInvoice);
        localStorage.setItem('archivedInvoices', JSON.stringify(archivedInvoices));
        return true;
    }
    return false;
}

function searchArchivedInvoices(query) {
    return archivedInvoices.filter(inv => 
        inv.customerName.includes(query) ||
        inv.id.includes(query) ||
        inv.phoneNumber.includes(query)
    );
}

// Alert functions
function getDelayedInvoices() {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    
    return invoices.filter(inv => {
        const lastUpdate = new Date(inv.lastStatusUpdate);
        return lastUpdate < twentyFourHoursAgo && inv.status === 'قيد التوصيل';
    });
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('ar-EG', {
        style: 'currency',
        currency: 'EGP'
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('ar-EG');
}

function formatDateTime(dateString) {
    return new Date(dateString).toLocaleString('ar-EG');
}

// Table sorting
function sortTable(data, column, direction = 'asc') {
    return data.sort((a, b) => {
        let aVal = a[column];
        let bVal = b[column];
        
        if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }
        
        if (direction === 'asc') {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });
}

// Initialize application
async function initializeApp() {
    const loaded = await loadData();
    if (loaded) {
        console.log('Application initialized successfully');
        
        // Initialize chat after data load
        setTimeout(initializeChat, 500);
        
        // Trigger custom event for page-specific initialization
        document.dispatchEvent(new CustomEvent('appReady'));
    } else {
        console.error('Failed to initialize application');
        // Show error message to user
        showNotification('فشل في تحميل البيانات. يرجى تحديث الصفحة.', 'error');
        
        // Initialize chat even if data loading failed
        setTimeout(initializeChat, 500);
    }
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; left: 50%; transform: translateX(-50%); z-index: 1050; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Common navigation function
function navigateToPage(page) {
    window.location.href = page;
}

// ==================== نظام الشات الذكي الجديد ====================

let chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];

// نظام الشات الأساسي
function initializeChat() {
    console.log('🚀 Starting chat initialization...');
    
    // تحقق إذا كان الشات موجوداً بالفعل
    if (document.getElementById('chatWidget')) {
        console.log('ℹ️ Chat already exists');
        return;
    }
    
    try {
        // إنشاء واجهة الشات
        const chatWidget = document.createElement('div');
        chatWidget.id = 'chatWidget';
        chatWidget.innerHTML = `
            <div class="chat-container enhanced-chat" style="display: none;">
                <div class="chat-header card-header d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center gap-2">
                        <i class="bi bi-robot"></i>
                        <span class="fw-bold">مساعد الذكاء الاصطناعي</span>
                    </div>
                    <div class="d-flex gap-2 align-items-center">
                        <button class="btn btn-sm btn-outline-light" onclick="clearChatHistory()" title="مسح المحادثة">
                            <i class="bi bi-trash"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-light chat-close" onclick="toggleChatWindow()" title="إغلاق">
                            <i class="bi bi-x-lg"></i>
                        </button>
                    </div>
                </div>
                <div class="chat-messages card-body" id="chatMessages">
                    <div class="welcome-message text-center text-muted">
                        <i class="bi bi-robot fs-1 mb-2 d-block"></i>
                        <h5>مرحبًا! 👋</h5>
                        <p>أنا مساعدك الذكي. اسألني عن الفواتير، المناديب، المخزون، أو أي استفسار آخر!</p>
                    </div>
                </div>
                <div class="chat-input-container card-footer">
                    <div class="input-group">
                        <input type="text" id="chatInput" class="form-control" placeholder="اكتب سؤالك هنا...">
                        <button class="btn btn-primary" onclick="sendChatMessage()" id="sendButton">
                            <i class="bi bi-send-fill"></i>
                        </button>
                    </div>
                </div>
            </div>
            <button class="chat-toggle enhanced-toggle btn btn-primary rounded-circle d-flex align-items-center justify-content-center" onclick="toggleChatWindow()">
                <i class="bi bi-robot"></i>
            </button>
        `;
        
        document.body.appendChild(chatWidget);
        
        // إضافة مستمع الأحداث للإدخال
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    sendChatMessage();
                }
            });
        }
        
        // تحميل تاريخ المحادثة
        loadChatHistory();
        
        console.log('✅ Chat system initialized successfully!');
        
    } catch (error) {
        console.error('❌ Error initializing chat:', error);
    }
}

// إرسال رسالة في الشات
async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    try {
        // إضافة رسالة المستخدم
        addChatMessage(message, 'user');
        input.value = '';
        
        // تعطيل الزر أثناء المعالجة
        const sendButton = document.getElementById('sendButton');
        sendButton.disabled = true;
        sendButton.innerHTML = '<i class="bi bi-hourglass-split"></i>';
        
        // إظهار مؤشر الكتابة
        const typingIndicator = addChatMessage('جاري البحث عن الإجابة...', 'typing');
        
        // محاكاة الانتظار
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // الحصول على الرد
        const response = await getAIResponse(message);
        
        // إزالة مؤشر الكتابة وإضافة الرد
        typingIndicator.remove();
        addChatMessage(response, 'bot');
        
        // حفظ في السجل
        saveToChatHistory(message, response);
        
    } catch (error) {
        console.error('Error in sendChatMessage:', error);
        addChatMessage('عذرًا، حدث خطأ. يرجى المحاولة مرة أخرى.', 'bot');
    } finally {
        // إعادة تمكين الزر
        const sendButton = document.getElementById('sendButton');
        sendButton.disabled = false;
        sendButton.innerHTML = '<i class="bi bi-send-fill"></i>';
    }
}

// الحصول على رد الذكاء الاصطناعي
async function getAIResponse(question) {
    try {
        const apiKey = 'sk-cf9dffdbf59a461d891b1236d8dfabef';
        
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    {
                        role: 'system',
                        content: `أنت مساعد في نظام إدارة الفواتير والتوصيل. 
                        البيانات المتاحة:
                        - الفواتير: ${invoices.length} فاتورة
                        - المناديب: ${drivers.length} مندوب  
                        - المخزون: ${stock.length} صنف
                        أجب بلغة العربية فقط وساعد في أي سؤال.`
                    },
                    ...chatHistory.slice(-6),
                    {
                        role: 'user',
                        content: question
                    }
                ],
                max_tokens: 1000,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
        
    } catch (error) {
        console.error('AI API Error:', error);
        // رد بديل
        return `🤖 مساعد نظام إدارة الفواتير

📊 الإحصائيات الحالية:
• الفواتير: ${invoices.length} فاتورة
• المناديب: ${drivers.length} مندوب
• المخزون: ${stock.length} صنف

للأسف خدمة الذكاء الاصطناعي غير متاحة حالياً. هذه أحدث البيانات المحلية.`;
    }
}

// إضافة رسالة للشات
function addChatMessage(content, type) {
    const messagesContainer = document.getElementById('chatMessages');
    
    if (!messagesContainer) {
        console.error('Chat messages container not found');
        return null;
    }
    
    // إزالة رسالة الترحيب إذا كانت موجودة
    const welcomeMessage = messagesContainer.querySelector('.welcome-message');
    if (welcomeMessage && type === 'user') {
        welcomeMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    
    if (type === 'typing') {
        messageDiv.innerHTML = `
            <div class="d-flex align-items-center gap-2">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <span class="text-muted">${content}</span>
            </div>
        `;
    } else {
        messageDiv.textContent = content;
    }
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    return messageDiv;
}

// تحميل تاريخ المحادثة
function loadChatHistory() {
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer || chatHistory.length === 0) return;
    
    // إزالة رسالة الترحيب
    const welcomeMessage = messagesContainer.querySelector('.welcome-message');
    if (welcomeMessage) {
        welcomeMessage.remove();
    }
    
    // إضافة الرسائل من السجل
    chatHistory.forEach(msg => {
        if (msg.role === 'user') {
            addChatMessage(msg.content, 'user');
        } else if (msg.role === 'assistant') {
            addChatMessage(msg.content, 'bot');
        }
    });
}

// حفظ في تاريخ المحادثة
function saveToChatHistory(userMessage, botResponse) {
    chatHistory.push(
        { role: 'user', content: userMessage },
        { role: 'assistant', content: botResponse }
    );
    
    // الحفاظ على آخر 10 رسائل فقط
    if (chatHistory.length > 10) {
        chatHistory = chatHistory.slice(-10);
    }
    
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
}

// تبديل فتح/إغلاق الشات
function toggleChatWindow() {
    const chatContainer = document.querySelector('.chat-container.enhanced-chat');
    if (!chatContainer) {
        console.error('Chat container not found');
        return;
    }
    
    const isHidden = chatContainer.style.display === 'none';
    chatContainer.style.display = isHidden ? 'flex' : 'none';
    
    // التركيز على حقل الإدخال عند الفتح
    if (isHidden) {
        setTimeout(() => {
            const chatInput = document.getElementById('chatInput');
            if (chatInput) chatInput.focus();
        }, 300);
    }
}

// مسح تاريخ المحادثة
function clearChatHistory() {
    if (confirm('هل تريد مسح تاريخ المحادثة؟')) {
        chatHistory = [];
        localStorage.removeItem('chatHistory');
        
        const messagesContainer = document.getElementById('chatMessages');
        if (messagesContainer) {
            messagesContainer.innerHTML = `
                <div class="welcome-message text-center text-muted">
                    <i class="bi bi-robot fs-1 mb-2 d-block"></i>
                    <h5>مرحبًا! 👋</h5>
                    <p>أنا مساعدك الذكي. اسألني عن الفواتير، المناديب، المخزون، أو أي استفسار آخر!</p>
                </div>
            `;
        }
        
        showNotification('تم مسح تاريخ المحادثة', 'success');
    }
}

// جعل الدوال متاحة globally
window.toggleChatWindow = toggleChatWindow;
window.sendChatMessage = sendChatMessage;
window.clearChatHistory = clearChatHistory;

// بدء التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 Starting application...');
    initializeApp();
});

// تهيئة احتياطية للشات بعد 3 ثوان
setTimeout(() => {
    if (!document.getElementById('chatWidget')) {
        console.log('🔄 Fallback chat initialization...');
        initializeChat();
    }
}, 3000);