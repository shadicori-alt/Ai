// Main Application JavaScript File
// نظام إدارة الفواتير الذكي - ملف الجافاسكريبت الرئيسي

class InvoiceSystem {
    constructor() {
        this.invoices = [];
        this.drivers = [];
        this.analytics = {};
        this.aiInsights = {};
        this.inventory = [];
        this.currentPage = this.getCurrentPage();
        this.deepseekApiKey = 'sk-cf9dffdbf59a461d891b1236d8dfabef';
        this.chatHistory = [];
        this.isChatOpen = false;
        
        this.init();
    }

    async init() {
        try {
            await this.loadData();
            this.setupEventListeners();
            this.initializePage();
            this.initializeAIChat();
            console.log('✅ تم تحميل النظام بنجاح');
        } catch (error) {
            console.error('❌ خطأ في تحميل النظام:', error);
        }
    }

    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('invoices.html')) return 'invoices';
        if (path.includes('drivers.html')) return 'drivers';
        if (path.includes('alerts.html')) return 'alerts';
        if (path.includes('archive.html')) return 'archive';
        if (path.includes('inventory.html')) return 'inventory';
        if (path.includes('new-orders.html')) return 'new-orders';
        return 'dashboard';
    }

    async loadData() {
        try {
            const [invoicesResponse, driversResponse, analyticsResponse, aiInsightsResponse] = await Promise.all([
                fetch('invoices.json'),
                fetch('drivers.json'),
                fetch('analytics.json'),
                fetch('ai_insights.json')
            ]);

            this.invoices = await invoicesResponse.json();
            this.drivers = await driversResponse.json();
            this.analytics = await analyticsResponse.json();
            this.aiInsights = await aiInsightsResponse.json();

            // Load inventory data
            try {
                const inventoryResponse = await fetch('inventory.json');
                this.inventory = await inventoryResponse.json();
            } catch {
                this.inventory = [];
            }

            console.log('📊 تم تحميل البيانات:', {
                invoices: this.invoices.length,
                drivers: this.drivers.length,
                inventory: this.inventory.length,
                alerts: this.aiInsights.criticalAlerts?.length || 0,
                recommendations: this.aiInsights.recommendations?.length || 0
            });

        } catch (error) {
            console.error('خطأ في تحميل البيانات:', error);
            this.loadSampleData();
        }
    }

    loadSampleData() {
        // Sample data for demonstration
        this.invoices = [
            {
                id: 'INV001',
                clientName: 'أحمد محمد',
                phone: '1234567890',
                address: 'القاهرة - مدينة نصر - شارع عباس العقاد',
                amount: 1250.50,
                driverCode: 'DRIVER001',
                status: 'قيد التوصيل',
                priority: 'عالية',
                date: '2025-11-17',
                deliveryTime: 45,
                notes: '',
                area: 'القاهرة',
                delayedHours: 24,
                createdAt: '2025-11-17 10:30:00',
                updatedAt: '2025-11-17 10:30:00'
            },
            {
                id: 'INV002',
                clientName: 'سارة أحمد',
                phone: '1123456789',
                address: 'الجيزة - الدقي - شارع التحرير',
                amount: 875.25,
                driverCode: 'DRIVER002',
                status: 'مسلمة',
                priority: 'متوسطة',
                date: '2025-11-16',
                deliveryTime: 32,
                notes: '',
                area: 'الجيزة',
                delayedHours: 0,
                createdAt: '2025-11-16 14:20:00',
                updatedAt: '2025-11-16 14:20:00'
            }
        ];

        this.drivers = [
            {
                code: 'DRIVER001',
                name: 'محمود علي',
                phone: '1551234567',
                status: 'متاح',
                currentLoad: 8,
                areas: ['القاهرة', 'مدينة نصر'],
                totalDeliveries: 245,
                successRate: 94.5,
                avgDeliveryTime: 38
            },
            {
                code: 'DRIVER002',
                name: 'خالد حسن',
                phone: '1557654321',
                status: 'مشغول',
                currentLoad: 12,
                areas: ['الجيزة', 'الدقي'],
                totalDeliveries: 189,
                successRate: 91.2,
                avgDeliveryTime: 42
            }
        ];

        this.inventory = [
            {
                id: 'PROD001',
                name: 'منتج أ',
                category: 'إلكترونيات',
                quantity: 50,
                minStock: 10,
                price: 299.99,
                supplier: 'المورد الأول',
                lastUpdated: '2025-11-17'
            },
            {
                id: 'PROD002',
                name: 'منتج ب',
                category: 'ملابس',
                quantity: 25,
                minStock: 15,
                price: 89.99,
                supplier: 'المورد الثاني',
                lastUpdated: '2025-11-16'
            }
        ];

        this.updateAnalytics();
    }

    setupEventListeners() {
        // Setup event listeners for different pages
        if (this.currentPage === 'dashboard') {
            this.setupDashboardListeners();
        } else if (this.currentPage === 'invoices') {
            this.setupInvoicesListeners();
        } else if (this.currentPage === 'inventory') {
            this.setupInventoryListeners();
        }
    }

    setupDashboardListeners() {
        // AI Assistant listeners
        const aiBtn = document.getElementById('aiAssistantBtn');
        const modal = document.getElementById('aiModal');
        const closeBtn = document.getElementById('closeAiModal');
        
        if (aiBtn && modal) {
            aiBtn.addEventListener('click', () => {
                modal.classList.remove('hidden');
                this.isChatOpen = true;
            });
            
            closeBtn?.addEventListener('click', () => {
                modal.classList.add('hidden');
                this.isChatOpen = false;
            });
        }
    }

    setupInvoicesListeners() {
        // Excel-like sheet functionality
        const addRowBtn = document.getElementById('addRowBtn');
        const saveBtn = document.getElementById('saveBtn');
        const exportBtn = document.getElementById('exportBtn');
        
        addRowBtn?.addEventListener('click', () => this.addInvoiceRow());
        saveBtn?.addEventListener('click', () => this.saveInvoices());
        exportBtn?.addEventListener('click', () => this.exportToExcel());
    }

    setupInventoryListeners() {
        // Inventory management listeners
        const addProductBtn = document.getElementById('addProductBtn');
        const saveInventoryBtn = document.getElementById('saveInventoryBtn');
        const importExcelBtn = document.getElementById('importExcelBtn');
        
        addProductBtn?.addEventListener('click', () => this.addProductRow());
        saveInventoryBtn?.addEventListener('click', () => this.saveInventory());
        importExcelBtn?.addEventListener('click', () => this.importFromExcel());
    }

    initializePage() {
        switch (this.currentPage) {
            case 'dashboard':
                this.initializeDashboard();
                break;
            case 'invoices':
                this.initializeInvoicesPage();
                break;
            case 'drivers':
                this.initializeDriversPage();
                break;
            case 'alerts':
                this.initializeAlertsPage();
                break;
            case 'archive':
                this.initializeArchivePage();
                break;
            case 'inventory':
                this.initializeInventoryPage();
                break;
            case 'new-orders':
                this.initializeNewOrdersPage();
                break;
        }
    }

    initializeDashboard() {
        console.log('🎛️ تهيئة لوحة التحكم');
        
        this.updateDashboardStats();
        
        if (document.getElementById('statusChart')) {
            this.initializeStatusChart();
        }
        if (document.getElementById('revenueChart')) {
            this.initializeRevenueChart();
        }
        if (document.getElementById('deliveryChart')) {
            this.initializeDeliveryChart();
        }
    }

    updateDashboardStats() {
        const elements = {
            totalInvoices: document.getElementById('totalInvoices'),
            todayDeliveries: document.getElementById('todayDeliveries'),
            pendingDeliveries: document.getElementById('pendingDeliveries'),
            criticalAlerts: document.getElementById('criticalAlerts'),
            topDriver: document.getElementById('topDriver'),
            avgDeliveryTime: document.getElementById('avgDeliveryTime'),
            mostActiveArea: document.getElementById('mostActiveArea'),
            systemEfficiency: document.getElementById('systemEfficiency'),
            availableCapacity: document.getElementById('availableCapacity'),
            delayedInvoices: document.getElementById('delayedInvoices'),
            overloadedDrivers: document.getElementById('overloadedDrivers'),
            highPriority: document.getElementById('highPriority'),
            totalRevenue: document.getElementById('totalRevenue')
        };

        if (elements.totalInvoices) elements.totalInvoices.textContent = this.analytics.totalInvoices || 0;
        if (elements.todayDeliveries) elements.todayDeliveries.textContent = this.aiInsights.performanceSummary?.todayDeliveries || 0;
        if (elements.pendingDeliveries) elements.pendingDeliveries.textContent = this.aiInsights.performanceSummary?.pendingDeliveries || 0;
        if (elements.criticalAlerts) elements.criticalAlerts.textContent = this.aiInsights.criticalAlerts?.length || 0;
        if (elements.topDriver) elements.topDriver.textContent = this.aiInsights.performanceSummary?.topPerformingDriver || '-';
        if (elements.avgDeliveryTime) elements.avgDeliveryTime.textContent = this.aiInsights.performanceSummary?.avgDeliveryTime ? Math.round(this.aiInsights.performanceSummary.avgDeliveryTime) + ' دقيقة' : '-';
        if (elements.mostActiveArea) elements.mostActiveArea.textContent = this.aiInsights.performanceSummary?.mostActiveArea || '-';
        if (elements.systemEfficiency) elements.systemEfficiency.textContent = this.aiInsights.systemHealth?.systemEfficiency ? Math.round(this.aiInsights.systemHealth.systemEfficiency) + '%' : '-';
        if (elements.availableCapacity) elements.availableCapacity.textContent = this.aiInsights.systemHealth?.availableCapacity || 0;
        if (elements.delayedInvoices) elements.delayedInvoices.textContent = this.aiInsights.systemHealth?.totalDelayedInvoices || 0;
        if (elements.overloadedDrivers) elements.overloadedDrivers.textContent = this.aiInsights.systemHealth?.overloadedDrivers || 0;
        if (elements.highPriority) elements.highPriority.textContent = this.aiInsights.systemHealth?.highPriorityPending || 0;
        if (elements.totalRevenue) elements.totalRevenue.textContent = this.aiInsights.performanceSummary?.totalRevenue ? 'ج.م ' + this.aiInsights.performanceSummary.totalRevenue.toLocaleString() : '-';
    }

    initializeStatusChart() {
        try {
            const chart = echarts.init(document.getElementById('statusChart'));
            const statusData = this.analytics.statusCounts || {};
            
            const option = {
                tooltip: { trigger: 'item' },
                series: [{
                    type: 'pie',
                    radius: '70%',
                    data: [
                        { value: statusData['مسلمة'] || 0, name: 'مسلمة', itemStyle: { color: '#10b981' } },
                        { value: statusData['قيد التوصيل'] || 0, name: 'قيد التوصيل', itemStyle: { color: '#f59e0b' } },
                        { value: statusData['مرتجعة'] || 0, name: 'مرتجعة', itemStyle: { color: '#ef4444' } }
                    ],
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }]
            };
            
            chart.setOption(option);
            console.log('📊 تم تهيئة مخطط الحالات');
        } catch (error) {
            console.error('خطأ في تهيئة مخطط الحالات:', error);
        }
    }

    initializeRevenueChart() {
        try {
            const chart = echarts.init(document.getElementById('revenueChart'));
            
            const deliveredAmount = this.invoices
                .filter(inv => inv.status === 'مسلمة')
                .reduce((sum, inv) => sum + inv.amount, 0);
            const pendingAmount = this.invoices
                .filter(inv => inv.status === 'قيد التوصيل')
                .reduce((sum, inv) => sum + inv.amount, 0);
            const returnedAmount = this.invoices
                .filter(inv => inv.status === 'مرتجعة')
                .reduce((sum, inv) => sum + inv.amount, 0);

            const option = {
                tooltip: { trigger: 'axis' },
                xAxis: {
                    type: 'category',
                    data: ['مسلمة', 'قيد التوصيل', 'مرتجعة']
                },
                yAxis: { type: 'value' },
                series: [{
                    data: [
                        { value: deliveredAmount, itemStyle: { color: '#10b981' } },
                        { value: pendingAmount, itemStyle: { color: '#f59e0b' } },
                        { value: returnedAmount, itemStyle: { color: '#ef4444' } }
                    ],
                    type: 'bar',
                    barWidth: '60%'
                }]
            };
            
            chart.setOption(option);
            console.log('📊 تم تهيئة مخطط الإيرادات');
        } catch (error) {
            console.error('خطأ في تهيئة مخطط الإيرادات:', error);
        }
    }

    initializeDeliveryChart() {
        try {
            const chart = echarts.init(document.getElementById('deliveryChart'));
            
            // Generate sample delivery time data
            const deliveryTimes = this.invoices.map(inv => inv.deliveryTime || 0);
            const avgTime = deliveryTimes.length > 0 ? deliveryTimes.reduce((a, b) => a + b, 0) / deliveryTimes.length : 0;
            
            const option = {
                tooltip: { trigger: 'axis' },
                xAxis: {
                    type: 'category',
                    data: ['متوسط وقت التوصيل']
                },
                yAxis: { type: 'value' },
                series: [{
                    data: [Math.round(avgTime)],
                    type: 'bar',
                    itemStyle: { color: '#3b82f6' }
                }]
            };
            
            chart.setOption(option);
            console.log('📊 تم تهيئة مخطط أوقات التوصيل');
        } catch (error) {
            console.error('خطأ في تهيئة مخطط أوقات التوصيل:', error);
        }
    }

    initializeInvoicesPage() {
        console.log('📋 تهيئة صفحة الفواتير');
        this.renderInvoiceTable();
    }

    initializeDriversPage() {
        console.log('🚚 تهيئة صفحة المناديب');
        this.renderDriversTable();
    }

    initializeAlertsPage() {
        console.log('🔔 تهيئة صفحة التنبيهات');
        this.renderAlerts();
    }

    initializeArchivePage() {
        console.log('📦 تهيئة صفحة الأرشيف');
        this.renderArchive();
    }

    initializeInventoryPage() {
        console.log('📦 تهيئة صفحة المخزون');
        this.renderInventoryTable();
        this.updateInventoryStats();
    }

    initializeNewOrdersPage() {
        console.log('📝 تهيئة صفحة الطلبات الجديدة');
        this.renderNewOrdersForm();
    }

    // AI Chat Implementation
    initializeAIChat() {
        console.log('🤖 تهيئة محادثة الذكاء الاصطناعي');
        
        // Setup AI chat event listeners
        const questions = document.querySelectorAll('.ai-question');
        questions.forEach(question => {
            question.addEventListener('click', async (e) => {
                const questionText = e.target.dataset.question;
                await this.handleAIChat(questionText);
            });
        });
    }

    async handleAIChat(message) {
        const responseDiv = document.getElementById('aiResponse');
        const responseContent = document.getElementById('aiResponseContent');
        
        if (!responseDiv || !responseContent) return;
        
        // Show loading state
        responseContent.innerHTML = '<div class="animate-pulse">جاري التحليل والرد من DeepSeek...</div>';
        responseDiv.classList.remove('hidden');
        
        try {
            // Add user message to chat history
            this.chatHistory.push({
                role: 'user',
                content: message,
                timestamp: new Date().toISOString()
            });
            
            // Prepare context from system data
            const context = this.prepareAIContext();
            
            // Send to DeepSeek API
            const aiResponse = await this.sendToDeepSeek(message, context);
            
            // Add AI response to chat history
            this.chatHistory.push({
                role: 'assistant',
                content: aiResponse,
                timestamp: new Date().toISOString()
            });
            
            // Display response
            responseContent.innerHTML = aiResponse;
            
        } catch (error) {
            console.error('خطأ في معالجة المحادثة:', error);
            responseContent.innerHTML = 'عذراً، حدث خطأ في معالجة طلبك. يرجى المحاولة مرة أخرى.';
        }
    }

    async sendToDeepSeek(message, context = '') {
        try {
            const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.deepseekApiKey}`
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [
                        {
                            role: 'system',
                            content: `أنت مساعد ذكي متخصص في إدارة الفواتير وتحليل البيانات وإدارة المخزون. قدم إجابات دقيقة ومفيدة باللغة العربية. السياق: ${context}`
                        },
                        {
                            role: 'user',
                            content: message
                        }
                    ],
                    max_tokens: 2000,
                    temperature: 0.7,
                    stream: false
                })
            });

            if (!response.ok) {
                throw new Error(`DeepSeek API Error: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('DeepSeek API Error:', error);
            return 'عذراً، حدث خطأ في الاتصال بخدمة DeepSeek. يرجى المحاولة مرة أخرى.';
        }
    }

    prepareAIContext() {
        const metrics = this.getSystemMetrics();
        const delayedInvoices = this.invoices.filter(inv => inv.delayedHours > 72);
        const lowStockItems = this.inventory.filter(item => item.quantity <= item.minStock);
        
        return `
        نظام إدارة الفواتير والمخزون:
        - إجمالي الفواتير: ${metrics.totalInvoices}
        - إجمالي المناديب: ${metrics.totalDrivers}
        - المناديب النشطين: ${metrics.activeDrivers}
        - كفاءة النظام: ${metrics.systemEfficiency}%
        - متوسط وقت التوصيل: ${metrics.averageDeliveryTime} دقيقة
        - الفواتير المتأخرة: ${metrics.delayedInvoices}
        - عدد عناصر المخزون: ${this.inventory.length}
        - العناصر منخفضة المخزون: ${lowStockItems.length}
        - آخر تحديث: ${metrics.lastUpdate}
        `;
    }

    // Inventory Management
    renderInventoryTable() {
        const tableBody = document.getElementById('inventoryTableBody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        this.inventory.forEach(item => {
            const row = document.createElement('tr');
            const stockStatus = item.quantity <= item.minStock ? 'text-red-600' : 'text-green-600';
            
            row.innerHTML = `
                <td class="px-4 py-3">${item.id}</td>
                <td class="px-4 py-3">
                    <input type="text" value="${item.name}" class="w-full border rounded px-2 py-1" 
                           onchange="invoiceSystem.updateInventoryItem('${item.id}', 'name', this.value)">
                </td>
                <td class="px-4 py-3">
                    <input type="text" value="${item.category}" class="w-full border rounded px-2 py-1" 
                           onchange="invoiceSystem.updateInventoryItem('${item.id}', 'category', this.value)">
                </td>
                <td class="px-4 py-3">
                    <input type="number" value="${item.quantity}" class="w-full border rounded px-2 py-1 ${stockStatus}" 
                           onchange="invoiceSystem.updateInventoryItem('${item.id}', 'quantity', parseInt(this.value))">
                </td>
                <td class="px-4 py-3">
                    <input type="number" value="${item.minStock}" class="w-full border rounded px-2 py-1" 
                           onchange="invoiceSystem.updateInventoryItem('${item.id}', 'minStock', parseInt(this.value))">
                </td>
                <td class="px-4 py-3">
                    <input type="number" value="${item.price}" class="w-full border rounded px-2 py-1" 
                           onchange="invoiceSystem.updateInventoryItem('${item.id}', 'price', parseFloat(this.value))">
                </td>
                <td class="px-4 py-3">${item.supplier}</td>
                <td class="px-4 py-3">
                    <button onclick="invoiceSystem.deleteInventoryItem('${item.id}')" 
                            class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
    }

    updateInventoryItem(id, field, value) {
        const itemIndex = this.inventory.findIndex(item => item.id === id);
        if (itemIndex !== -1) {
            this.inventory[itemIndex][field] = value;
            this.inventory[itemIndex].lastUpdated = new Date().toISOString().split('T')[0];
            this.renderInventoryTable();
            this.updateInventoryStats();
        }
    }

    addProductRow() {
        const newId = 'PROD' + String(this.inventory.length + 1).padStart(3, '0');
        const newProduct = {
            id: newId,
            name: 'منتج جديد',
            category: 'فئة جديدة',
            quantity: 0,
            minStock: 10,
            price: 0,
            supplier: 'مورد جديد',
            lastUpdated: new Date().toISOString().split('T')[0]
        };
        
        this.inventory.push(newProduct);
        this.renderInventoryTable();
        this.updateInventoryStats();
    }

    deleteInventoryItem(id) {
        if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
            this.inventory = this.inventory.filter(item => item.id !== id);
            this.renderInventoryTable();
            this.updateInventoryStats();
        }
    }

    updateInventoryStats() {
        const totalProducts = document.getElementById('totalProducts');
        const lowStockItems = document.getElementById('lowStockItems');
        const totalValue = document.getElementById('totalInventoryValue');
        
        if (totalProducts) totalProducts.textContent = this.inventory.length;
        
        const lowStock = this.inventory.filter(item => item.quantity <= item.minStock);
        if (lowStockItems) lowStockItems.textContent = lowStock.length;
        
        const totalInvValue = this.inventory.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        if (totalValue) totalValue.textContent = 'ج.م ' + totalInvValue.toLocaleString();
    }

    // Excel-like Invoice Management
    renderInvoiceTable() {
        const tableBody = document.getElementById('invoiceTableBody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        this.invoices.forEach(invoice => {
            const row = document.createElement('tr');
            const statusClass = this.getStatusClass(invoice.status);
            const priorityClass = this.getPriorityClass(invoice.priority);
            
            row.innerHTML = `
                <td class="px-4 py-3">${invoice.id}</td>
                <td class="px-4 py-3">
                    <input type="text" value="${invoice.clientName}" class="w-full border rounded px-2 py-1" 
                           onchange="invoiceSystem.updateInvoiceField('${invoice.id}', 'clientName', this.value)">
                </td>
                <td class="px-4 py-3">
                    <input type="text" value="${invoice.phone}" class="w-full border rounded px-2 py-1" 
                           onchange="invoiceSystem.updateInvoiceField('${invoice.id}', 'phone', this.value)">
                </td>
                <td class="px-4 py-3">
                    <input type="text" value="${invoice.address}" class="w-full border rounded px-2 py-1" 
                           onchange="invoiceSystem.updateInvoiceField('${invoice.id}', 'address', this.value)">
                </td>
                <td class="px-4 py-3">
                    <input type="number" value="${invoice.amount}" class="w-full border rounded px-2 py-1" 
                           onchange="invoiceSystem.updateInvoiceField('${invoice.id}', 'amount', parseFloat(this.value))">
                </td>
                <td class="px-4 py-3">
                    <select class="w-full border rounded px-2 py-1 ${statusClass}" 
                            onchange="invoiceSystem.updateInvoiceField('${invoice.id}', 'status', this.value)">
                        <option value="قيد التوصيل" ${invoice.status === 'قيد التوصيل' ? 'selected' : ''}>قيد التوصيل</option>
                        <option value="مسلمة" ${invoice.status === 'مسلمة' ? 'selected' : ''}>مسلمة</option>
                        <option value="مرتجعة" ${invoice.status === 'مرتجعة' ? 'selected' : ''}>مرتجعة</option>
                    </select>
                </td>
                <td class="px-4 py-3">
                    <select class="w-full border rounded px-2 py-1 ${priorityClass}" 
                            onchange="invoiceSystem.updateInvoiceField('${invoice.id}', 'priority', this.value)">
                        <option value="عالية" ${invoice.priority === 'عالية' ? 'selected' : ''}>عالية</option>
                        <option value="متوسطة" ${invoice.priority === 'متوسطة' ? 'selected' : ''}>متوسطة</option>
                        <option value="منخفضة" ${invoice.priority === 'منخفضة' ? 'selected' : ''}>منخفضة</option>
                    </select>
                </td>
                <td class="px-4 py-3">${invoice.driverCode}</td>
                <td class="px-4 py-3">${invoice.date}</td>
                <td class="px-4 py-3">
                    <button onclick="invoiceSystem.deleteInvoice('${invoice.id}')" 
                            class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
    }

    updateInvoiceField(invoiceId, field, value) {
        const invoiceIndex = this.invoices.findIndex(inv => inv.id === invoiceId);
        if (invoiceIndex !== -1) {
            this.invoices[invoiceIndex][field] = value;
            this.invoices[invoiceIndex].updatedAt = new Date().toISOString();
            this.updateAnalytics();
        }
    }

    addInvoiceRow() {
        const newId = 'INV' + String(this.invoices.length + 1).padStart(3, '0');
        const newInvoice = {
            id: newId,
            clientName: 'عميل جديد',
            phone: '0123456789',
            address: 'عنوان جديد',
            amount: 0,
            driverCode: 'DRIVER001',
            status: 'قيد التوصيل',
            priority: 'متوسطة',
            date: new Date().toISOString().split('T')[0],
            deliveryTime: 0,
            notes: '',
            area: 'القاهرة',
            delayedHours: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.invoices.push(newInvoice);
        this.renderInvoiceTable();
        this.updateAnalytics();
    }

    // Utility Functions
    getStatusClass(status) {
        switch(status) {
            case 'مسلمة': return 'bg-green-100 text-green-800';
            case 'قيد التوصيل': return 'bg-yellow-100 text-yellow-800';
            case 'مرتجعة': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    getPriorityClass(priority) {
        switch(priority) {
            case 'عالية': return 'bg-red-100 text-red-800';
            case 'متوسطة': return 'bg-orange-100 text-orange-800';
            case 'منخفضة': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    // Data Management
    updateAnalytics() {
        this.analytics = {
            totalInvoices: this.invoices.length,
            totalAmount: this.invoices.reduce((sum, inv) => sum + inv.amount, 0),
            statusCounts: {
                'مسلمة': this.invoices.filter(inv => inv.status === 'مسلمة').length,
                'قيد التوصيل': this.invoices.filter(inv => inv.status === 'قيد التوصيل').length,
                'مرتجعة': this.invoices.filter(inv => inv.status === 'مرتجعة').length
            },
            avgInvoiceValue: this.invoices.length > 0 ? this.invoices.reduce((sum, inv) => sum + inv.amount, 0) / this.invoices.length : 0,
            lastUpdate: new Date().toISOString()
        };
    }

    getSystemMetrics() {
        return {
            totalInvoices: this.invoices.length,
            totalDrivers: this.drivers.length,
            activeDrivers: this.drivers.filter(d => d.status === 'متاح').length,
            systemEfficiency: this.aiInsights.systemHealth?.systemEfficiency || 0,
            averageDeliveryTime: this.aiInsights.performanceSummary?.avgDeliveryTime || 0,
            delayedInvoices: this.aiInsights.systemHealth?.totalDelayedInvoices || 0,
            lastUpdate: new Date().toISOString()
        };
    }

    // Export Functions
    exportToCSV(data, filename) {
        const csvContent = this.convertToCSV(data);
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    convertToCSV(data) {
        if (!data || data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        const csvHeaders = headers.join(',');
        
        const csvRows = data.map(row => 
            headers.map(header => {
                const value = row[header];
                return typeof value === 'string' ? `"${value}"` : value;
            }).join(',')
        );
        
        return [csvHeaders, ...csvRows].join('\n');
    }

    exportToExcel() {
        this.exportToCSV(this.invoices, 'فواتير_' + new Date().toISOString().split('T')[0] + '.csv');
    }

    // Notification System
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            type === 'warning' ? 'bg-yellow-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3000);
    }

    // Enhanced AI Chat with Text Input
    async sendChatMessage(message, context = '') {
        try {
            const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.deepseekApiKey}`
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [
                        {
                            role: 'system',
                            content: `أنت مساعد ذكي متخصص في إدارة الفواتير والمخزون والتنبيهات. قدم إجابات دقيقة ومفيدة باللغة العربية. السياق: ${context}`
                        },
                        {
                            role: 'user',
                            content: message
                        }
                    ],
                    max_tokens: 2000,
                    temperature: 0.7,
                    stream: false
                })
            });

            if (!response.ok) {
                throw new Error(`DeepSeek API Error: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('DeepSeek API Error:', error);
            return 'عذراً، حدث خطأ في الاتصال بخدمة DeepSeek. يرجى المحاولة مرة أخرى.';
        }
    }

    // Real-time chat handler
    async handleRealTimeChat(message) {
        // Add user message to chat history
        this.chatHistory.push({
            role: 'user',
            content: message,
            timestamp: new Date().toISOString()
        });

        // Prepare context from system data
        const context = this.prepareAIContext();
        
        // Send to DeepSeek
        const aiResponse = await this.sendChatMessage(message, context);
        
        // Add AI response to chat history
        this.chatHistory.push({
            role: 'assistant',
            content: aiResponse,
            timestamp: new Date().toISOString()
        });

        return aiResponse;
    }

    // API Key Management
    updateApiKey(newApiKey) {
        this.deepseekApiKey = newApiKey;
        localStorage.setItem('deepseekApiKey', newApiKey);
        console.log('✅ تم تحديث مفتاح DeepSeek');
    }
}

// Initialize the system when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.invoiceSystem = new InvoiceSystem();
});

// Global functions for inline event handlers
function handleAIQuestion(question) {
    if (window.invoiceSystem) {
        window.invoiceSystem.handleAIChat(question);
    }
}