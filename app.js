// ==================== نظام الشات الذكي المحسن ====================

let chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];

// نظام الردود الذكية المحسن
async function askDeepSeek(question) {
    try {
        const apiKey = 'sk-cf9dffdbf59a461d891b1236d8dfabef';
        
        // تحديد نوع السؤال
        const questionType = classifyQuestion(question);
        
        // إذا كان السؤال متعلقًا بالعمل، أضف سياق النظام
        const systemMessage = questionType === 'work' ? 
            `أنت مساعد في نظام إدارة الفواتير والتوصيل. 
            البيانات المتاحة:
            - الفواتير: ${invoices.length} فاتورة
            - المناديب: ${drivers.length} مندوب
            - المخزون: ${stock.length} صنف
            - الفواتير المؤرشفة: ${archivedInvoices.length} فاتورة
            أجب بلغة العربية فقط وساعد في أي سؤال.` :
            `أنت مساعد ذكي ومفيد. أجب على الأسئلة بلغة العربية بطريقة مفيدة ومحترفة. 
            يمكنك الإجابة على أسئلة متنوعة في مجالات مختلفة.`;

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
        return getEnhancedFallbackResponse(question);
    }
}

// تصنيف السؤال
function classifyQuestion(question) {
    const lowerQuestion = question.toLowerCase();
    const workKeywords = [
        'فاتورة', 'فواتير', 'مندوب', 'سائق', 'مخزون', 'صنف', 
        'توصيل', 'تسليم', 'مرتجع', 'زبون', 'عميل', 'سعر',
        'تكلفة', 'دفع', 'شحن', 'طلبات', 'طلب', 'نظام',
        'إدارة', 'تقرير', 'إحصائيات', 'بيانات', 'شركة', 'عمل'
    ];
    
    return workKeywords.some(keyword => lowerQuestion.includes(keyword)) ? 'work' : 'general';
}

// رد بديل محسن
function getEnhancedFallbackResponse(question) {
    const lowerQuestion = question.toLowerCase();
    const questionType = classifyQuestion(question);
    
    if (questionType === 'work') {
        return `📊 إحصائيات النظام:
• إجمالي الفواتير: ${invoices.length}
• قيد التوصيل: ${invoices.filter(inv => inv.status === 'قيد التوصيل').length}
• مسلمة: ${invoices.filter(inv => inv.status === 'مسلمة').length}
• مرتجعة: ${invoices.filter(inv => inv.status === 'مرتجعة').length}
• عدد المناديب: ${drivers.length}
• إجمالي الأصناف: ${stock.length}
• أصناف منخفضة: ${stock.filter(item => item.quantity < item.minQuantity).length}

🤖 للأسف الخدمة غير متاحة حاليًا. هذه أحدث البيانات المحلية.`;
    }
    else {
        return `🤖 أنا مساعدك الذكي! للأسف الخدمة غير متاحة حاليًا للرد على سؤالك.

يمكنني عادةً المساعدة في:
• أسئلة العمل والفواتير والتوصيل
• الاستفسارات العامة والمعلومات
• حل المشكلات والنصائح

يرجى المحاولة مرة أخرى لاحقًا أو الاتصال بالدعم الفني.`;
    }
}

// إعداد الشات المحسن
function setupEnhancedChat() {
    // أنشئ واجهة الشات إذا لم تكن موجودة
    if (!document.getElementById('chatWidget')) {
        const chatWidget = document.createElement('div');
        chatWidget.id = 'chatWidget';
        chatWidget.innerHTML = `
            <div class="chat-container" style="display: none;">
                <div class="chat-header card-header d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center gap-2">
                        <i class="bi bi-robot"></i>
                        <span>مساعد الذكاء الاصطناعي</span>
                    </div>
                    <div class="d-flex gap-2 align-items-center">
                        <button class="btn btn-sm btn-outline-light" onclick="clearChat()" title="مسح المحادثة">
                            <i class="bi bi-trash"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-light chat-close" onclick="toggleChat()" title="إغلاق">
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
                        <input type="text" id="chatInput" class="form-control" placeholder="اكتب سؤالك هنا..." 
                               onkeypress="handleChatInputKeypress(event)">
                        <button class="btn btn-primary" onclick="sendMessage()" id="sendButton">
                            <i class="bi bi-send-fill"></i>
                        </button>
                    </div>
                    <div class="quick-actions mt-2 d-flex gap-1 flex-wrap">
                        <button class="btn btn-sm btn-outline-secondary" onclick="quickAction('إحصائيات الفواتير')">📊 الفواتير</button>
                        <button class="btn btn-sm btn-outline-secondary" onclick="quickAction('حالة المناديب')">🚚 المناديب</button>
                        <button class="btn btn-sm btn-outline-secondary" onclick="quickAction('المخزون المنخفض')">📦 المخزون</button>
                    </div>
                </div>
            </div>
            <button class="chat-toggle btn btn-primary rounded-circle d-flex align-items-center justify-content-center" onclick="toggleChat()">
                <i class="bi bi-robot"></i>
            </button>
        `;
        document.body.appendChild(chatWidget);
        
        // تحميل تاريخ المحادثة
        loadChatHistory();
    }
}

// إرسال رسالة محسن
async function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    const sendButton = document.getElementById('sendButton');
    
    if (!message) return;
    
    // تعطيل الزر أثناء المعالجة
    sendButton.disabled = true;
    sendButton.innerHTML = '<i class="bi bi-hourglass-split"></i>';
    
    // إضافة رسالة المستخدم
    addMessage(message, 'user');
    input.value = '';
    
    // إظهار typing indicator
    const typingIndicator = addMessage('جاري البحث عن الإجابة...', 'bot typing');
    
    try {
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
    } catch (error) {
        typingIndicator.remove();
        addMessage('عذرًا، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.', 'bot error');
    } finally {
        // إعادة تمكين الزر
        sendButton.disabled = false;
        sendButton.innerHTML = '<i class="bi bi-send-fill"></i>';
    }
}

// إجراء سريع
function quickAction(action) {
    document.getElementById('chatInput').value = action;
    sendMessage();
}

// التعامل مع ضغط المفتاح في حقل الإدخال
function handleChatInputKeypress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// مسح المحادثة
function clearChat() {
    if (confirm('هل تريد مسح تاريخ المحادثة؟')) {
        chatHistory = [];
        localStorage.removeItem('chatHistory');
        const messagesContainer = document.getElementById('chatMessages');
        messagesContainer.innerHTML = `
            <div class="welcome-message text-center text-muted">
                <i class="bi bi-robot fs-1 mb-2 d-block"></i>
                <h5>مرحبًا! 👋</h5>
                <p>أنا مساعدك الذكي. اسألني عن الفواتير، المناديب، المخزون، أو أي استفسار آخر!</p>
            </div>
        `;
        showNotification('تم مسح تاريخ المحادثة', 'success');
    }
}

// تحميل تاريخ المحادثة
function loadChatHistory() {
    const messagesContainer = document.getElementById('chatMessages');
    
    // إزالة رسالة الترحيب إذا كان هناك تاريخ
    if (chatHistory.length > 0) {
        messagesContainer.innerHTML = '';
    }
    
    chatHistory.forEach(msg => {
        if (msg.role === 'user') {
            addMessage(msg.content, 'user');
        } else if (msg.role === 'assistant') {
            addMessage(msg.content, 'bot');
        }
    });
}

// إضافة رسالة للشات (محسنة)
function addMessage(content, sender) {
    const messagesContainer = document.getElementById('chatMessages');
    
    // إزالة رسالة الترحيب إذا كانت موجودة
    const welcomeMessage = messagesContainer.querySelector('.welcome-message');
    if (welcomeMessage) {
        welcomeMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    if (sender === 'typing') {
        messageDiv.innerHTML = `
            <div class="d-flex align-items-center gap-2">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <span>${content}</span>
            </div>
        `;
    } else {
        messageDiv.textContent = content;
    }
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    return messageDiv;
}

// تبديل فتح/إغلاق الشات
function toggleChat() {
    const chatWidget = document.getElementById('chatWidget');
    const chatContainer = chatWidget.querySelector('.chat-container');
    const isHidden = chatContainer.style.display === 'none';
    
    chatContainer.style.display = isHidden ? 'flex' : 'none';
    
    // التركيز على حقل الإدخال عند الفتح
    if (isHidden) {
        setTimeout(() => {
            document.getElementById('chatInput').focus();
        }, 300);
    }
}

// استبدال دالة الإعداد القديمة
function setupChat() {
    setupEnhancedChat();
}