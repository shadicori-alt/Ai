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

// ==================== نظام الشات الذكي المحسن مع الديب سيك ====================

let chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];

// نظام الردود الذكية المحسن مع التعامل مع جميع أنواع الأسئلة
async function askDeepSeek(question) {
    try {
        const apiKey = 'sk-cf9dffdbf59a461d891b1236d8dfabef';
        
        // نظام تصنيف الأسئلة المتقدم
        const questionType = classifyQuestion(question);
        
        // رسالة النظام المخصصة حسب نوع السؤال
        let systemMessage = '';
        
        if (questionType === 'work') {
            systemMessage = `أنت مساعد متخصص في نظام إدارة الفواتير والتوصيل. 
لديك الوصول إلى البيانات التالية:
• إجمالي الفواتير: ${invoices.length} فاتورة
• الفواتير قيد التوصيل: ${invoices.filter(inv => inv.status === 'قيد التوصيل').length}
• الفواتير المسلمة: ${invoices.filter(inv => inv.status === 'مسلمة').length}
• الفواتير المرتجعة: ${invoices.filter(inv => inv.status === 'مرتجعة').length}
• عدد المناديب: ${drivers.length}
• إجمالي أصناف المخزون: ${stock.length}
• الأصناف المنخفضة في المخزون: ${stock.filter(item => item.quantity < item.minQuantity).length}

يمكنك المساعدة في:
- استعلامات الفواتير والحالة
- إدارة المناديب والمهام
- مراقبة المخزون والتنبيهات
- التقارير والإحصائيات
- حل مشاكل النظام

أجب بلغة العربية الفصحى بطريقة مهنية ومفيدة.`;
        } else if (questionType === 'general') {
            systemMessage = `أنت مساعد ذكي متعدد المجالات. يمكنك الإجابة على أسئلة متنوعة في:
- المعلومات العامة والمعرفة
- النصائح والإرشادات
- حل المشكلات
- الترفيه والمحادثات العامة
- التعليم والشرح
- الأخبار والتحديثات (بناء على معرفتك حتى يوليو 2024)

أجب بلغة العربية بطريقة مفيدة وواضحة ومحترمة. كن دقيقًا في المعلومات وواضحًا في الشرح.`;
        } else {
            systemMessage = `أنت مساعد ذكي ومفيد. أجب على الأسئلة بلغة العربية بطريقة متوازنة بين المهنية والودودة.
كن دقيقًا في المعلومات ومفيدًا في الردود.`;
        }

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
                        content: systemMessage
                    },
                    ...chatHistory.slice(-10), // آخر 10 رسائل من التاريخ
                    {
                        role: 'user',
                        content: question
                    }
                ],
                max_tokens: 1500,
                temperature: 0.7,
                stream: false
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Response Error:', errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('Invalid API response format');
        }
        
        return data.choices[0].message.content;
        
    } catch (error) {
        console.error('DeepSeek API Error Details:', error);
        return getEnhancedFallbackResponse(question);
    }
}

// نظام تصنيف الأسئلة المتقدم
function classifyQuestion(question) {
    const lowerQuestion = question.toLowerCase();
    
    // كلمات مفتاحية متعلقة بالعمل
    const workKeywords = [
        'فاتورة', 'فواتير', 'مندوب', 'سائق', 'مخزون', 'صنف', 'توصيل', 
        'تسليم', 'مرتجع', 'زبون', 'عميل', 'سعر', 'تكلفة', 'دفع', 'شحن',
        'طلبات', 'طلب', 'نظام', 'إدارة', 'تقرير', 'إحصائيات', 'بيانات',
        'شركة', 'عمل', 'مبيعات', 'عملاء', 'توصيلات', 'شحنة', 'بضاعة',
        'منتج', 'منتجات', 'مستودع', 'مخزن', 'جرد', 'جودة', 'خدمة',
        'عمولة', 'راتب', 'موظف', 'موظفين', 'إنتاج', 'مصنع', 'مورد',
        'موردين', 'شراء', 'بيع', 'ربح', 'خسارة', 'ميزانية', 'تكاليف',
        'تسعير', 'عرض', 'عروض', 'خصم', 'خصومات', 'ضريبة', 'ضرائب',
        'فاتورة ضريبية', 'رقم ضريبي', 'سجل تجاري', 'commercial registry',
        'tax number', 'invoice', 'delivery', 'driver', 'stock', 'inventory'
    ];
    
    // كلمات مفتاحية للأسئلة العامة
    const generalKeywords = [
        'مرحبا', 'اهلا', 'سلام', 'السلام', 'كيف حالك', 'شكرا', 'مشكور',
        'لو سمحت', 'من فضلك', 'مساء الخير', 'صباح الخير', 'مساء النور',
        'hello', 'hi', 'thanks', 'thank you', 'please', 'good morning',
        'good evening', 'كيف', 'متى', 'أين', 'لماذا', 'ماذا', 'هل',
        'ما هو', 'ما هي', 'ما معنى', 'شرح', 'مساعدة', 'مساعدة',
        'help', 'explain', 'what is', 'how to', 'when', 'where', 'why'
    ];
    
    // كلمات مفتاحية للأسئلة التقنية
    const techKeywords = [
        'برمجة', 'تطبيق', 'موقع', 'ويب', 'web', 'app', 'application',
        'website', 'برمج', 'مطور', 'developer', 'كود', 'code', 'سكريبت',
        'script', 'html', 'css', 'javascript', 'js', 'php', 'python',
        'java', 'قاعدة بيانات', 'database', 'سيرفر', 'server', 'hosting',
        'استضافة', 'دومين', 'domain', 'تصميم', 'design', 'واجهة', 'interface',
        'api', 'rest', 'json', 'xml', 'git', 'github', 'deploy', 'نشر'
    ];
    
    // تحديد نوع السؤال
    if (workKeywords.some(keyword => lowerQuestion.includes(keyword))) {
        return 'work';
    } else if (techKeywords.some(keyword => lowerQuestion.includes(keyword))) {
        return 'tech';
    } else if (generalKeywords.some(keyword => lowerQuestion.includes(keyword))) {
        return 'general';
    } else {
        // إذا لم يتطابق مع أي فئة، نعتبره سؤالاً عاماً
        return 'general';
    }
}

// نظام الردود البديلة المحسن
function getEnhancedFallbackResponse(question) {
    const lowerQuestion = question.toLowerCase();
    const questionType = classifyQuestion(question);
    const stats = getStatistics();
    
    if (questionType === 'work') {
        return `🤖 **مساعد نظام إدارة الفواتير**

📊 **الإحصائيات الحالية:**
• إجمالي الفواتير: ${stats.totalInvoices}
• قيد التوصيل: ${stats.pendingInvoices}
• مسلمة: ${stats.deliveredInvoices}
• مرتجعة: ${stats.returnedInvoices}
• عدد المناديب: ${stats.totalDrivers}
• أصناف المخزون: ${stats.totalStockItems}

🚨 **الفواتير المتأخرة:** ${getDelayedInvoices().length}

📦 **المخزون المنخفض:** ${getLowStockItems().length}

للأسف خدمة الذكاء الاصطناعي غير متاحة حاليًا. هذه أحدث البيانات المحلية من النظام.

يمكنني مساعدتك في:
• تتبع الفواتير
• حالة المناديب
• مستويات المخزون
• التقارير الأساسية`;

    } else if (questionType === 'tech') {
        return `🛠️ **المساعد التقني**

للأسف خدمة الذكاء الاصطناعي غير متاحة حاليًا للاستفسارات التقنية.

يمكنني عادةً المساعدة في:
• مشاكل البرمجة
• استشارات التطوير
• حلول تقنية
• نصائح برمجية

يرجى المحاولة مرة أخرى لاحقًا أو التواصل مع الدعم الفني.`;

    } else {
        return `👋 **مرحبًا! أنا مساعدك الذكي**

للأسف خدمة الذكاء الاصطناعي غير متاحة حاليًا.

عادةً يمكنني مساعدتك في:
• الأسئلة العامة والمعلومات
• النصائح والإرشادات
• الشرح والتوضيح
• المحادثات اليومية

📞 للأسئلة العاجلة، يرجى التواصل مع:
• الدعم الفني للاستفسارات التقنية
• إدارة النظام لاستفسارات العمل
• المسؤول المباشر للاستفسارات الإدارية

🔧 جاري العمل على إصلاح الخدمة، شكرًا لتفهمك!`;
    }
}

// إعداد نظام الشات المحسن بالكامل
function setupEnhancedChat() {
    // التحقق مما إذا كانت واجهة الشات موجودة بالفعل
    if (!document.getElementById('chatWidget')) {
        const chatWidget = document.createElement('div');
        chatWidget.id = 'chatWidget';
        chatWidget.innerHTML = `
            <!-- حاوية الشات الرئيسية -->
            <div class="chat-container enhanced-chat" style="display: none;">
                <!-- رأس الشات -->
                <div class="chat-header card-header d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center gap-2">
                        <i class="bi bi-robot fs-5"></i>
                        <span class="fw-bold">مساعد الذكاء الاصطناعي</span>
                        <span class="badge bg-success ms-2">متصل</span>
                    </div>
                    <div class="d-flex gap-2 align-items-center">
                        <button class="btn btn-sm btn-outline-light" onclick="minimizeChat()" title="تصغير">
                            <i class="bi bi-dash-lg"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-light" onclick="clearChat()" title="مسح المحادثة">
                            <i class="bi bi-trash"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-light chat-close" onclick="toggleChat()" title="إغلاق">
                            <i class="bi bi-x-lg"></i>
                        </button>
                    </div>
                </div>
                
                <!-- منطقة الرسائل -->
                <div class="chat-messages card-body" id="chatMessages">
                    <div class="welcome-message text-center text-muted p-4">
                        <div class="robot-icon mb-3">
                            <i class="bi bi-robot fs-1 text-primary"></i>
                        </div>
                        <h5 class="fw-bold mb-2">مرحبًا بك! 👋</h5>
                        <p class="mb-3">أنا مساعدك الذكي في نظام إدارة الفواتير والتوصيل</p>
                        <div class="capabilities-list text-start">
                            <div class="d-flex align-items-center gap-2 mb-2">
                                <i class="bi bi-receipt text-success"></i>
                                <span>استعلامات الفواتير والتتبع</span>
                            </div>
                            <div class="d-flex align-items-center gap-2 mb-2">
                                <i class="bi bi-truck text-warning"></i>
                                <span>إدارة المناديب والمهام</span>
                            </div>
                            <div class="d-flex align-items-center gap-2 mb-2">
                                <i class="bi bi-box-seam text-info"></i>
                                <span>مراقبة المخزون والتنبيهات</span>
                            </div>
                            <div class="d-flex align-items-center gap-2 mb-2">
                                <i class="bi bi-graph-up text-primary"></i>
                                <span>التقارير والإحصائيات</span>
                            </div>
                            <div class="d-flex align-items-center gap-2">
                                <i class="bi bi-chat-dots text-secondary"></i>
                                <span>أسئلة عامة واستفسارات</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- منطقة الإدخال والإجراءات السريعة -->
                <div class="chat-input-container card-footer">
                    <!-- شريط الإدخال -->
                    <div class="input-group mb-2">
                        <input type="text" id="chatInput" class="form-control" 
                               placeholder="اكتب سؤالك هنا حول الفواتير، المناديب، المخزون، أو أي استفسار آخر..." 
                               onkeypress="handleChatInputKeypress(event)"
                               aria-label="رسالة الشات">
                        <button class="btn btn-primary d-flex align-items-center gap-2" 
                                onclick="sendMessage()" 
                                id="sendButton"
                                disabled>
                            <i class="bi bi-send-fill"></i>
                            <span>إرسال</span>
                        </button>
                    </div>
                    
                    <!-- الإجراءات السريعة -->
                    <div class="quick-actions">
                        <div class="section-title mb-2">
                            <small class="text-muted fw-bold">استفسارات سريعة:</small>
                        </div>
                        <div class="actions-row d-flex gap-2 flex-wrap">
                            <button class="btn btn-sm btn-outline-primary d-flex align-items-center gap-1" 
                                    onclick="quickAction('عرض إحصائيات الفواتير')">
                                <i class="bi bi-receipt"></i>
                                <span>الفواتير</span>
                            </button>
                            <button class="btn btn-sm btn-outline-warning d-flex align-items-center gap-1" 
                                    onclick="quickAction('ما هي حالة المناديب؟')">
                                <i class="bi bi-truck"></i>
                                <span>المناديب</span>
                            </button>
                            <button class="btn btn-sm btn-outline-info d-flex align-items-center gap-1" 
                                    onclick="quickAction('عرض المخزون المنخفض')">
                                <i class="bi bi-box-seam"></i>
                                <span>المخزون</span>
                            </button>
                            <button class="btn btn-sm btn-outline-success d-flex align-items-center gap-1" 
                                    onclick="quickAction('عرض التقارير اليومية')">
                                <i class="bi bi-graph-up"></i>
                                <span>التقارير</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- زر تبديل الشات -->
            <button class="chat-toggle enhanced-toggle btn btn-primary rounded-circle d-flex align-items-center justify-content-center" 
                    onclick="toggleChat()"
                    id="chatToggleButton">
                <i class="bi bi-robot fs-5"></i>
                <span class="notification-badge" id="chatNotification" style="display: none;"></span>
            </button>
        `;
        document.body.appendChild(chatWidget);
        
        // تحميل تاريخ المحادثة بعد إنشاء الواجهة
        setTimeout(loadChatHistory, 100);
        
        // إضافة مستمعين للأحداث
        setupChatEventListeners();
        
        console.log('✅ نظام الشات المحسن تم تحميله بنجاح');
    } else {
        console.log('ℹ️ نظام الشات موجود بالفعل');
    }
}

// إعداد مستمعي الأحداث للشات
function setupChatEventListeners() {
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        // تحديث حالة زر الإرسال
        chatInput.addEventListener('input', function() {
            const sendButton = document.getElementById('sendButton');
            sendButton.disabled = this.value.trim().length === 0;
        });
        
        // التركيز التلقائي عند فتح الشات
        chatInput.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        chatInput.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    }
}

// إرسال رسالة محسنة مع معالجة الأخطاء
async function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    const sendButton = document.getElementById('sendButton');
    
    if (!message) {
        showNotification('يرجى كتابة رسالة أولاً', 'warning');
        return;
    }
    
    try {
        // تعطيل الزر وإظهار حالة التحميل
        sendButton.disabled = true;
        sendButton.innerHTML = '<i class="bi bi-hourglass-split"></i><span>جاري الإرسال...</span>';
        input.disabled = true;
        
        // إضافة رسالة المستخدم إلى الواجهة
        addMessage(message, 'user');
        input.value = '';
        
        // إظهار مؤشر الكتابة
        const typingIndicator = addMessage('جاري البحث عن الإجابة المناسبة...', 'bot typing');
        
        // الانتظار قليلاً لمحاكاة الكتابة (تحسين تجربة المستخدم)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // الحصول على الرد من الذكاء الاصطناعي
        const response = await askDeepSeek(message);
        
        // إزالة مؤشر الكتابة
        typingIndicator.remove();
        
        // إضافة الرد الحقيقي
        addMessage(response, 'bot');
        
        // حفظ المحادثة في التاريخ
        chatHistory.push(
            { role: 'user', content: message, timestamp: new Date().toISOString() },
            { role: 'assistant', content: response, timestamp: new Date().toISOString() }
        );
        
        // الحفاظ على آخر 20 رسالة فقط
        if (chatHistory.length > 20) {
            chatHistory = chatHistory.slice(-20);
        }
        
        localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
        
        // إظهار إشعار بنجاح الإرسال
        showNotification('تم إرسال الرسالة بنجاح', 'success');
        
    } catch (error) {
        console.error('Error in sendMessage:', error);
        
        // إزالة مؤشر الكتابة وإظهار رسالة الخطأ
        const typingIndicator = document.querySelector('.typing-message');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        
        addMessage('عذرًا، حدث خطأ في الاتصال. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.', 'bot error');
        
        showNotification('فشل في إرسال الرسالة', 'danger');
        
    } finally {
        // إعادة تعيين حالة واجهة المستخدم
        sendButton.disabled = false;
        sendButton.innerHTML = '<i class="bi bi-send-fill"></i><span>إرسال</span>';
        input.disabled = false;
        input.focus();
    }
}

// الإجراءات السريعة المحسنة
function quickAction(action) {
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.value = action;
        chatInput.focus();
        
        // تحديث حالة زر الإرسال
        const event = new Event('input', { bubbles: true });
        chatInput.dispatchEvent(event);
        
        // إرسال تلقائي بعد ثانية
        setTimeout(() => {
            sendMessage();
        }, 1000);
    }
}

// التعامل مع ضغط المفتاح في حقل الإدخال
function handleChatInputKeypress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// مسح المحادثة مع التأكيد
function clearChat() {
    const confirmationMessage = `هل أنت متأكد من مسح تاريخ المحادثة؟
    
سيتم حذف جميع الرسائل السابقة ولا يمكن استعادتها.`;

    if (confirm(confirmationMessage)) {
        chatHistory = [];
        localStorage.removeItem('chatHistory');
        
        const messagesContainer = document.getElementById('chatMessages');
        if (messagesContainer) {
            messagesContainer.innerHTML = `
                <div class="welcome-message text-center text-muted p-4">
                    <div class="robot-icon mb-3">
                        <i class="bi bi-robot fs-1 text-primary"></i>
                    </div>
                    <h5 class="fw-bold mb-2">مرحبًا بك! 👋</h5>
                    <p class="mb-3">أنا مساعدك الذكي في نظام إدارة الفواتير والتوصيل</p>
                    <div class="capabilities-list text-start">
                        <div class="d-flex align-items-center gap-2 mb-2">
                            <i class="bi bi-receipt text-success"></i>
                            <span>استعلامات الفواتير والتتبع</span>
                        </div>
                        <div class="d-flex align-items-center gap-2 mb-2">
                            <i class="bi bi-truck text-warning"></i>
                            <span>إدارة المناديب والمهام</span>
                        </div>
                        <div class="d-flex align-items-center gap-2 mb-2">
                            <i class="bi bi-box-seam text-info"></i>
                            <span>مراقبة المخزون والتنبيهات</span>
                        </div>
                        <div class="d-flex align-items-center gap-2 mb-2">
                            <i class="bi bi-graph-up text-primary"></i>
                            <span>التقارير والإحصائيات</span>
                        </div>
                        <div class="d-flex align-items-center gap-2">
                            <i class="bi bi-chat-dots text-secondary"></i>
                            <span>أسئلة عامة واستفسارات</span>
                        </div>
                    </div>
                </div>
            `;
        }
        
        showNotification('تم مسح تاريخ المحادثة بنجاح', 'success');
        console.log('🗑️ تم مسح تاريخ المحادثة');
    }
}

// تصغير الشات
function minimizeChat() {
    const chatContainer = document.querySelector('.chat-container.enhanced-chat');
    if (chatContainer) {
        chatContainer.style.display = 'none';
        showNotification('تم تصغير نافذة المحادثة', 'info');
    }
}

// تحميل تاريخ المحادثة
function loadChatHistory() {
    const messagesContainer = document.getElementById('chatMessages');
    
    if (!messagesContainer) {
        console.error('❌ لم يتم العثور على حاوية الرسائل');
        return;
    }
    
    // إزالة رسالة الترحيب إذا كان هناك تاريخ محادثات
    if (chatHistory.length > 0) {
        const welcomeMessage = messagesContainer.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }
        
        // إضافة جميع الرسائل من التاريخ
        chatHistory.forEach(msg => {
            if (msg.role === 'user') {
                addMessage(msg.content, 'user');
            } else if (msg.role === 'assistant') {
                addMessage(msg.content, 'bot');
            }
        });
        
        console.log(`📖 تم تحميل ${chatHistory.length} رسالة من التاريخ`);
    } else {
        console.log('ℹ️ لا يوجد تاريخ محادثات للتحميل');
    }
}

// إضافة رسالة للشات مع تحسينات الواجهة
function addMessage(content, sender) {
    const messagesContainer = document.getElementById('chatMessages');
    
    if (!messagesContainer) {
        console.error('❌ لم يتم العثور على حاوية الرسائل في addMessage');
        return null;
    }
    
    // إزالة رسالة الترحيب إذا كانت موجودة
    const welcomeMessage = messagesContainer.querySelector('.welcome-message');
    if (welcomeMessage && sender === 'user') {
        welcomeMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    // إضافة الطابع الزمني
    const timestamp = new Date().toLocaleTimeString('ar-EG', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    if (sender === 'typing') {
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="d-flex align-items-center gap-2">
                    <div class="typing-indicator">
                        <div class="typing-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                    <span class="typing-text">${content}</span>
                </div>
                <div class="message-time">${timestamp}</div>
            </div>
        `;
    } else if (sender === 'error') {
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="d-flex align-items-start gap-2">
                    <i class="bi bi-exclamation-triangle-fill text-danger mt-1"></i>
                    <div class="error-content">
                        ${content}
                    </div>
                </div>
                <div class="message-time">${timestamp}</div>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-text">${content}</div>
                <div class="message-time">${timestamp}</div>
            </div>
        `;
    }
    
    messagesContainer.appendChild(messageDiv);
    
    // التمرير إلى الأسفل
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // تأثير الظهور
    setTimeout(() => {
        messageDiv.style.opacity = '1';
        messageDiv.style.transform = 'translateY(0)';
    }, 10);
    
    return messageDiv;
}

// تبديل فتح/إغلاق الشات
function toggleChat() {
    const chatWidget = document.getElementById('chatWidget');
    if (!chatWidget) {
        console.error('❌ لم يتم العثور على عنصر الشات');
        return;
    }
    
    const chatContainer = chatWidget.querySelector('.chat-container.enhanced-chat');
    const toggleButton = document.getElementById('chatToggleButton');
    
    if (!chatContainer || !toggleButton) {
        console.error('❌ لم يتم العثور على عناصر الشات المطلوبة');
        return;
    }
    
    const isHidden = chatContainer.style.display === 'none';
    
    if (isHidden) {
        // فتح الشات
        chatContainer.style.display = 'flex';
        toggleButton.classList.add('active');
        
        // التركيز على حقل الإدخال بعد تأخير بسيط
        setTimeout(() => {
            const chatInput = document.getElementById('chatInput');
            if (chatInput) {
                chatInput.focus();
            }
        }, 300);
        
        // إخفاء أي إشعارات
        const notificationBadge = document.getElementById('chatNotification');
        if (notificationBadge) {
            notificationBadge.style.display = 'none';
        }
        
        console.log('💬 فتح نافذة المحادثة');
    } else {
        // إغلاق الشات
        chatContainer.style.display = 'none';
        toggleButton.classList.remove('active');
        console.log('🔒 إغلاق نافذة المحادثة');
    }
}

// استبدال دالة الإعداد القديمة
function setupChat() {
    // الانتظار حتى تحميل DOM بالكامل
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(setupEnhancedChat, 1000);
        });
    } else {
        setTimeout(setupEnhancedChat, 1000);
    }
}

// التهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 تهيئة نظام الشات الذكي...');
    setupChat();
});

// جعل الدوال متاحة globally للاستخدام في HTML
window.toggleChat = toggleChat;
window.sendMessage = sendMessage;
window.clearChat = clearChat;
window.minimizeChat = minimizeChat;
window.quickAction = quickAction;
window.handleChatInputKeypress = handleChatInputKeypress;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);