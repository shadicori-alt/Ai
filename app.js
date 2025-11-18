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
        
        // Trigger custom event for page-specific initialization
        document.dispatchEvent(new CustomEvent('appReady'));
    } else {
        console.error('Failed to initialize application');
        // Show error message to user
        showNotification('فشل في تحميل البيانات. يرجى تحديث الصفحة.', 'error');
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

// ==================== نظام الشات الذكي مع الديب سيك ====================

let chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];

// ديب سيك API - مفتاحك الحقيقي
async function askDeepSeek(question) {
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
                        - الفواتير المؤرشفة: ${archivedInvoices.length} فاتورة
                        أجب بلغة العربية فقط وساعد في أي سؤال.`
                    },
                    ...chatHistory.slice(-10),
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
        console.error('DeepSeek API Error:', error);
        return getFallbackResponse(question);
    }
}

// رد بديل إذا فشل الاتصال
function getFallbackResponse(question) {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('فاتورة') || lowerQuestion.includes('فواتير')) {
        return `📊 إحصائيات الفواتير:
        • إجمالي الفواتير: ${invoices.length}
        • قيد التوصيل: ${invoices.filter(inv => inv.status === 'قيد التوصيل').length}
        • مسلمة: ${invoices.filter(inv => inv.status === 'مسلمة').length}
        • مرتجعة: ${invoices.filter(inv => inv.status === 'مرتجعة').length}`;
    }
    else if (lowerQuestion.includes('مندوب') || lowerQuestion.includes('سائق')) {
        return `🚚 إحصائيات المناديب:
        • عدد المناديب: ${drivers.length}
        • متاحين: ${drivers.filter(d => d.status === 'متاح').length}
        • مشغولين: ${drivers.filter(d => d.status === 'مشغول').length}`;
    }
    else if (lowerQuestion.includes('مخزون') || lowerQuestion.includes('صنف')) {
        return `📦 إحصائيات المخزون:
        • إجمالي الأصناف: ${stock.length}
        • أصناف منخفضة: ${stock.filter(item => item.quantity < item.minQuantity).length}`;
    }
    else {
        return `🤖 أنا مساعدك في نظام إدارة الفواتير. يمكنني مساعدتك في:
        • الفواتير والتوصيل
        • إدارة المناديب  
        • مراقبة المخزون
        • التقارير والإحصائيات
        اسألني أي شيء!`;
    }
}

// إعداد الشات في كل الصفحات
function setupChat() {
    // أنشئ واجهة الشات إذا لم تكن موجودة
    if (!document.getElementById('chatWidget')) {
        const chatWidget = document.createElement('div');
        chatWidget.id = 'chatWidget';
        chatWidget.innerHTML = `
            <div class="chat-container" style="display: none;">
                <div class="chat-header">
                    <span>🤖 مساعد الذكاء الاصطناعي</span>
                    <button class="chat-close" onclick="toggleChat()">×</button>
                </div>
                <div class="chat-messages" id="chatMessages"></div>
                <div class="chat-input-container">
                    <input type="text" id="chatInput" placeholder="اكتب سؤالك هنا...">
                    <button onclick="sendMessage()">➤</button>
                </div>
            </div>
            <button class="chat-toggle" onclick="toggleChat()">💬</button>
        `;
        document.body.appendChild(chatWidget);
        
        // إضافة الـ CSS
        const style = document.createElement('style');
        style.textContent = getChatCSS();
        document.head.appendChild(style);
        
        // تحميل تاريخ المحادثة
        loadChatHistory();
    }
}

// CSS للشات
function getChatCSS() {
    return `
        .chat-container {
            position: fixed;
            bottom: 80px;
            left: 20px;
            width: 350px;
            height: 500px;
            background: white;
            border: 2px solid #007bff;
            border-radius: 15px;
            box-shadow: 0 5px 25px rgba(0,0,0,0.2);
            display: flex;
            flex-direction: column;
            z-index: 10000;
            font-family: 'Cairo', sans-serif;
        }
        
        .chat-header {
            background: #007bff;
            color: white;
            padding: 15px;
            border-radius: 13px 13px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: bold;
        }
        
        .chat-close {
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
        }
        
        .chat-messages {
            flex: 1;
            padding: 15px;
            overflow-y: auto;
            background: #f8f9fa;
        }
        
        .message {
            margin-bottom: 10px;
            padding: 10px;
            border-radius: 10px;
            max-width: 80%;
            word-wrap: break-word;
        }
        
        .user-message {
            background: #007bff;
            color: white;
            margin-left: auto;
            text-align: left;
        }
        
        .bot-message {
            background: white;
            border: 1px solid #ddd;
            text-align: right;
        }
        
        .chat-input-container {
            display: flex;
            padding: 15px;
            border-top: 1px solid #ddd;
            background: white;
            border-radius: 0 0 13px 13px;
        }
        
        #chatInput {
            flex: 1;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 20px;
            outline: none;
            font-family: 'Cairo', sans-serif;
        }
        
        .chat-input-container button {
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 15px;
            margin-right: 10px;
            border-radius: 20px;
            cursor: pointer;
            font-family: 'Cairo', sans-serif;
        }
        
        .chat-toggle {
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: #007bff;
            color: white;
            border: none;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            font-size: 20px;
            cursor: pointer;
            z-index: 10000;
            box-shadow: 0 3px 15px rgba(0,0,0,0.2);
            font-family: 'Cairo', sans-serif;
        }
        
        @media (max-width: 768px) {
            .chat-container {
                width: 90vw !important;
                height: 70vh !important;
                left: 5vw !important;
                bottom: 80px !important;
            }
            
            .chat-toggle {
                width: 50px !important;
                height: 50px !important;
                bottom: 15px !important;
                left: 15px !important;
            }
        }
    `;
}

// إرسال رسالة
async function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // إضافة رسالة المستخدم
    addMessage(message, 'user');
    input.value = '';
    
    // إظهار typing indicator
    const typingIndicator = addMessage('...جاري البحث', 'bot');
    
    // الحصول على الرد
    const response = await askDeepSeek(message);
    
    // إزالة typing indicator وإضافة الرد الحقيقي
    typingIndicator.remove();
    addMessage(response, 'bot');
    
    // حفظ في التاريخ
    chatHistory.push(
        { role: 'user', content: message },
        { role: 'assistant', content: response }
    );
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory.slice(-20)));
}

// إضافة رسالة للشات
function addMessage(content, sender) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.textContent = content;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    return messageDiv;
}

// تحميل تاريخ المحادثة
function loadChatHistory() {
    const messagesContainer = document.getElementById('chatMessages');
    chatHistory.forEach(msg => {
        if (msg.role === 'user') {
            addMessage(msg.content, 'user');
        } else if (msg.role === 'assistant') {
            addMessage(msg.content, 'bot');
        }
    });
}

// تبديل فتح/إغلاق الشات
function toggleChat() {
    const chatWidget = document.getElementById('chatWidget');
    const chatContainer = chatWidget.querySelector('.chat-container');
    const isHidden = chatContainer.style.display === 'none';
    chatContainer.style.display = isHidden ? 'flex' : 'none';
}

// تهيئة الشات عند تحميل أي صفحة
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(setupChat, 1000);
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);