// ===========================================
// script.js - الملف الكامل والمصحح
// ===========================================

// ===========================================
// المتغيرات العامة
// ===========================================
let manualExcipients = [];
let currentInputMethod = 'auto';
let currentReference = 'bp';
let currentProductForm = '';

// ===========================================
// أدوات مساعدة
// ===========================================
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas fa-info-circle"></i> ${message}`;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 50);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

function format(num, d = 2) {
    return Number(num).toFixed(d);
}

// ===========================================
// التهيئة عند تحميل الصفحة
// ===========================================
document.addEventListener('DOMContentLoaded', () => {
    selectInputMethod('auto');

    // المرجعية
    document.querySelectorAll('.reference-badge').forEach(badge => {
        badge.addEventListener('click', () => {
            document.querySelectorAll('.reference-badge').forEach(b => b.classList.remove('active'));
            badge.classList.add('active');
            currentReference = badge.dataset.reference;
            document.getElementById('reference').value = currentReference;
        });
    });

    // شكل المنتج
    document.querySelectorAll('.product-form-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.product-form-option').forEach(o => o.classList.remove('active'));
            option.classList.add('active');
            currentProductForm = option.dataset.form;
            document.getElementById('productForm').value = currentProductForm;
            updateUnitLabels();
        });
    });

    // الميزانية
    const budget = document.getElementById('budget');
    const budgetValue = document.getElementById('budgetValue');
    if (budget && budgetValue) {
        budgetValue.textContent = budget.value;
        budget.addEventListener('input', () => budgetValue.textContent = budget.value);
    }

    // تحديث المقترحات الآلية
    updateAutoSuggestions();
});

// ===========================================
// تحديث تسميات الوحدات
// ===========================================
function updateUnitLabels() {
    const unitLabel = document.getElementById('unitLabel');
    const totalUnitLabel = document.getElementById('totalUnitLabel');
    
    if (!currentProductForm) return;
    
    if (currentProductForm === 'syrup') {
        if (unitLabel) unitLabel.textContent = 'مل';
        if (totalUnitLabel) totalUnitLabel.textContent = 'مل (لكل مل)';
    } else if (currentProductForm.includes('tablet') || currentProductForm === 'capsule') {
        if (unitLabel) unitLabel.textContent = 'مجم';
        if (totalUnitLabel) totalUnitLabel.textContent = 'مجم (لكل وحدة)';
    } else if (currentProductForm === 'powder') {
        if (unitLabel) unitLabel.textContent = 'جرام';
        if (totalUnitLabel) totalUnitLabel.textContent = 'جرام (لكل جرام)';
    }
}

// ===========================================
// المواد الفعالة
// ===========================================
function addIngredientRow() {
    const container = document.getElementById('activeIngredientsContainer');
    
    const row = document.createElement('div');
    row.className = 'ingredient-row';
    row.innerHTML = `
        <select class="active-ingredient" required>
            <option value="">اختر المادة الفعالة...</option>
            <option value="paracetamol">باراسيتامول (Paracetamol)</option>
            <option value="ibuprofen">آيبوبروفين (Ibuprofen)</option>
            <option value="amoxicillin">أموكسيسيلين (Amoxicillin)</option>
            <option value="silver-iodide">يوديد الفضة</option>
            <option value="titanium-dioxide">ثاني أكسيد التيتانيوم</option>
            <option value="vitamin-c">فيتامين ج</option>
        </select>
        
        <div class="input-with-unit">
            <input type="number" class="active-ingredient-amount" min="0.1" step="0.1" value="500" required>
            <div class="unit">مجم</div>
        </div>
        
        <button type="button" class="remove-ingredient" onclick="removeIngredientRow(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    container.appendChild(row);
}

function removeIngredientRow(btn) {
    const rows = document.querySelectorAll('.ingredient-row');
    if (rows.length > 1) {
        btn.closest('.ingredient-row').remove();
    }
}

function getActiveIngredients() {
    const list = [];
    document.querySelectorAll('.ingredient-row').forEach(row => {
        const name = row.querySelector('.active-ingredient').value;
        const amount = row.querySelector('.active-ingredient-amount').value;
        if (name && amount) {
            list.push({ name, amount: parseFloat(amount) });
        }
    });
    return list;
}

// ===========================================
// طريقة الإدخال
// ===========================================
function selectInputMethod(method) {
    currentInputMethod = method;
    document.getElementById('inputMethod').value = method;
    
    document.getElementById('manualInputSection').style.display = method === 'manual' ? 'block' : 'none';
    document.getElementById('autoInputSection').style.display = method === 'auto' ? 'block' : 'none';
    
    document.getElementById('manualOption').classList.toggle('selected', method === 'manual');
    document.getElementById('autoOption').classList.toggle('selected', method === 'auto');
}

// ===========================================
// المواد المساعدة (يدوي)
// ===========================================
function addManualExcipient() {
    const nameSel = document.getElementById('excipientName');
    const funcSel = document.getElementById('excipientFunction');
    const perc = parseFloat(document.getElementById('excipientPercentage').value);
    
    if (!nameSel.value || !perc) {
        showToast('يرجى إدخال جميع البيانات', 'warning');
        return;
    }
    
    const excipient = {
        id: Date.now(),
        name: nameSel.value,
        displayName: nameSel.options[nameSel.selectedIndex].text,
        function: funcSel.value,
        functionText: funcSel.options[funcSel.selectedIndex].text,
        percentage: perc
    };
    
    manualExcipients.push(excipient);
    updateManualExcipientsList();
    showToast('تمت إضافة المادة بنجاح', 'success');
}

function updateManualExcipientsList() {
    const listElement = document.getElementById('manualExcipientsList');
    const countElement = document.getElementById('manualExcipientsCount');
    
    if (manualExcipients.length === 0) {
        listElement.innerHTML = `
            <div style="text-align: center; padding: 30px; color: #999;">
                <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 10px;"></i>
                <p>لم يتم إضافة أي مواد مساعدة بعد</p>
                <small>استخدم النموذج أعلاه لإضافة المواد</small>
            </div>
        `;
        countElement.textContent = '(0 مادة)';
        return;
    }
    
    let html = '';
    manualExcipients.forEach(excipient => {
        html += `
            <div class="manual-excipient-item">
                <div class="excipient-info">
                    <h5>${excipient.displayName}</h5>
                    <div class="details">
                        <span><i class="fas fa-tag"></i> ${excipient.functionText}</span>
                        <span><i class="fas fa-percentage"></i> ${excipient.percentage}%</span>
                    </div>
                </div>
                <button type="button" class="remove-manual-excipient" onclick="removeManualExcipient(${excipient.id})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });
    
    listElement.innerHTML = html;
    countElement.textContent = `(${manualExcipients.length} مادة)`;
}

function removeManualExcipient(id) {
    manualExcipients = manualExcipients.filter(excipient => excipient.id !== id);
    updateManualExcipientsList();
    showToast('تم حذف المادة', 'info');
}

function clearManualExcipients() {
    if (manualExcipients.length === 0) return;
    
    if (confirm('هل أنت متأكد من مسح جميع المواد المضافة؟')) {
        manualExcipients = [];
        updateManualExcipientsList();
        showToast('تم مسح جميع المواد', 'info');
    }
}

function loadCommonFormulation() {
    const productForm = document.getElementById('productForm').value;
    
    manualExcipients = [];
    
    if (productForm.includes('tablet')) {
        manualExcipients = [
            {
                id: Date.now(),
                name: 'mcc',
                displayName: 'سليولوز ميكروكريستاليني (MCC)',
                function: 'filler',
                functionText: 'مادة مالئة',
                percentage: 30
            },
            {
                id: Date.now() + 1,
                name: 'povidone',
                displayName: 'بوفيدون K30',
                function: 'binder',
                functionText: 'مادة رابطة',
                percentage: 2
            },
            {
                id: Date.now() + 2,
                name: 'croscarmellose',
                displayName: 'صوديوم كروكارميلوز',
                function: 'disintegrant',
                functionText: 'مادة مفككة',
                percentage: 1.5
            },
            {
                id: Date.now() + 3,
                name: 'magnesium-stearate',
                displayName: 'ستيرات المغنيسيوم',
                function: 'lubricant',
                functionText: 'مادة مزلقة',
                percentage: 0.5
            }
        ];
    } else if (productForm === 'capsule') {
        manualExcipients = [
            {
                id: Date.now(),
                name: 'lactose',
                displayName: 'لاكتوز اللامائي',
                function: 'filler',
                functionText: 'مادة مالئة',
                percentage: 35
            },
            {
                id: Date.now() + 1,
                name: 'magnesium-stearate',
                displayName: 'ستيرات المغنيسيوم',
                function: 'lubricant',
                functionText: 'مادة مزلقة',
                percentage: 0.5
            }
        ];
    }
    
    updateManualExcipientsList();
    showToast('تم تحميل تركيبة شائعة', 'success');
}

// ===========================================
// المواد المساعدة (آلي)
// ===========================================
function updateAutoSuggestions() {
    const costStrategy = document.getElementById('costStrategy')?.value || 'balanced';
    const productionStrategy = document.getElementById('productionStrategy')?.value || 'high-speed';
    const performancePriority = document.getElementById('performancePriority')?.value || 'sustained-release';
    
    let suggestions = [];
    
    if (costStrategy === 'lowest') {
        suggestions = ['نشا الذرة', 'لاكتوز', 'ستيرات مغنيسيوم', 'نشا صوديوم جليكولات'];
    } else if (costStrategy === 'balanced') {
        suggestions = ['سليولوز ميكروكريستاليني', 'بوفيدون', 'كروسكارميلوز', 'ستيرات مغنيسيوم'];
    } else {
        suggestions = ['مانيتول', 'هيدروكسي بروبيل ميثيل سليولوز', 'كروسپوفيدون', 'ثاني أكسيد السيليكون'];
    }
    
    const previewElement = document.getElementById('autoExcipientsPreview');
    if (previewElement) {
        let html = '';
        suggestions.forEach(item => {
            html += `<div class="auto-excipient-tag">${item}</div>`;
        });
        previewElement.innerHTML = html;
    }
}

function regenerateAutoSuggestions() {
    updateAutoSuggestions();
    showToast('تم إعادة توليد المقترحات', 'success');
}

function generateAutoExcipients() {
    const costStrategy = document.getElementById('costStrategy')?.value || 'balanced';
    const productForm = document.getElementById('productForm')?.value || 'tablet-uncoated';
    
    let excipients = [];
    
    if (productForm.includes('tablet')) {
        excipients = [
            {
                name: 'filler',
                displayName: costStrategy === 'lowest' ? 'لاكتوز' : 'سليولوز ميكروكريستاليني',
                function: 'filler',
                functionText: 'مادة مالئة',
                percentage: costStrategy === 'lowest' ? 35 : 30
            },
            {
                name: 'binder',
                displayName: 'بوفيدون K30',
                function: 'binder',
                functionText: 'مادة رابطة',
                percentage: 2
            },
            {
                name: 'disintegrant',
                displayName: 'صوديوم كروكارميلوز',
                function: 'disintegrant',
                functionText: 'مادة مفككة',
                percentage: 1.5
            },
            {
                name: 'lubricant',
                displayName: 'ستيرات المغنيسيوم',
                function: 'lubricant',
                functionText: 'مادة مزلقة',
                percentage: 0.5
            }
        ];
    } else if (productForm === 'capsule') {
        excipients = [
            {
                name: 'filler',
                displayName: 'لاكتوز اللامائي',
                function: 'filler',
                functionText: 'مادة مالئة',
                percentage: 40
            },
            {
                name: 'lubricant',
                displayName: 'ستيرات المغنيسيوم',
                function: 'lubricant',
                functionText: 'مادة مزلقة',
                percentage: 0.5
            }
        ];
    }
    
    return excipients;
}

// ===========================================
// معالجة النموذج
// ===========================================
document.getElementById('formulaForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // التحقق من البيانات الأساسية
    const formulaName = document.getElementById('formulaName').value;
    const reference = document.getElementById('reference').value;
    const productForm = document.getElementById('productForm').value;
    const primaryGoal = document.getElementById('primaryGoal').value;
    
    const activeIngredients = getActiveIngredients();
    
    if (!formulaName || !reference || !productForm || !primaryGoal || activeIngredients.length === 0) {
        showToast('يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
    }
    
    // الحصول على المواد المضافة
    const excipients = currentInputMethod === 'manual' ? manualExcipients : generateAutoExcipients();
    
    if (excipients.length === 0) {
        showToast('يرجى إضافة المواد المساعدة', 'error');
        return;
    }
    
    // التحقق من مجموع النسب
    const totalPercentage = validateTotalPercentage(activeIngredients, excipients);
    if (!totalPercentage.valid) {
        showToast(totalPercentage.message, 'error');
        return;
    }
    
    // عرض النتائج
    displayResults(formulaName, reference, productForm, primaryGoal, activeIngredients, excipients);
});

// ===========================================
// التحقق من النسبة المئوية
// ===========================================
function validateTotalPercentage(activeIngredients, excipients) {
    let totalActive = 0;
    activeIngredients.forEach(ing => {
        totalActive += parseFloat(ing.amount);
    });
    
    let totalExcipients = 0;
    excipients.forEach(ex => {
        totalExcipients += ex.percentage;
    });
    
    const total = totalActive + totalExcipients;
    const tolerance = 0.1; // 0.1% هامش خطأ
    
    if (Math.abs(total - 100) > tolerance) {
        return {
            valid: false,
            message: `مجموع النسب ${total.toFixed(2)}% يجب أن يكون 100%`
        };
    }
    
    return { valid: true, total: total };
}

// ===========================================
// عرض النتائج
// ===========================================
function displayResults(formulaName, reference, productForm, primaryGoal, activeIngredients, excipients) {
    // إخفاء العنصر النائب
    document.getElementById('resultsPlaceholder').style.display = 'none';
    const resultsContent = document.getElementById('resultsContent');
    resultsContent.style.display = 'block';
    
    // تحديث معلومات الصيغة
    document.getElementById('formulaNameDisplay').textContent = formulaName;
    document.getElementById('designDate').textContent = new Date().toLocaleDateString('ar-SA');
    
    // تحديث الشارات
    const referenceBadge = document.getElementById('referenceBadge');
    referenceBadge.textContent = reference.toUpperCase();
    referenceBadge.className = `meta-badge reference ${reference}`;
    
    const formBadge = document.getElementById('formBadge');
    let formText = '';
    switch(productForm) {
        case 'tablet-uncoated': formText = 'قرص غير مغلف'; break;
        case 'tablet-coated': formText = 'قرص مغلف'; break;
        case 'capsule': formText = 'كبسولة'; break;
        case 'syrup': formText = 'شراب'; break;
        case 'powder': formText = 'مسحوق'; break;
    }
    formBadge.textContent = formText;
    
    // تحديث جدول المكونات
    let tableRows = '';
    
    // المواد الفعالة
    activeIngredients.forEach(ing => {
        const ingredientName = getIngredientDisplayName(ing.name);
        tableRows += `
            <tr class="active-ingredient-row">
                <td>${ingredientName}</td>
                <td>${ing.amount} ${getUnitForProduct(productForm)}</td>
                <td>مادة فعالة</td>
                <td>${calculateIngredientCost(ing.name, ing.amount, productForm)}</td>
                <td><span class="compliance-badge ${reference}">${reference.toUpperCase()}</span></td>
            </tr>
        `;
    });
    
    // المواد المساعدة
    excipients.forEach(excipient => {
        tableRows += `
            <tr>
                <td>${excipient.displayName}</td>
                <td>${excipient.percentage}%</td>
                <td>${excipient.functionText}</td>
                <td>${calculateExcipientCost(excipient.name, excipient.function)}</td>
                <td><span class="compliance-badge ${reference}">${reference.toUpperCase()}</span></td>
            </tr>
        `;
    });
    
    document.querySelector('#formulaTable tbody').innerHTML = tableRows;
    
    // حساب التكلفة الإجمالية
    const totalCost = calculateTotalCost(activeIngredients, excipients, productForm);
    document.getElementById('totalCost').textContent = totalCost;
    
    // تحديث مواصفات الجودة
    updateQualitySpecifications(reference);
    
    // تحديث مقاييس الأداء
    updatePerformanceMetrics(activeIngredients, excipients, primaryGoal);
    
    // رسم المخطط الدائري
    renderPieChart(activeIngredients, excipients);
    
    // إضافة ملاحظة طريقة الإدخال
    const inputMethodNote = currentInputMethod === 'manual' 
        ? '✓ تم إدخال المواد يدوياً بواسطة المستخدم'
        : '✓ تم اختيار المواد آلياً بواسطة الذكاء الاصطناعي';
    
    const noteElement = document.createElement('div');
    noteElement.className = 'reference-info ' + reference;
    noteElement.style.marginTop = '15px';
    noteElement.style.padding = '10px';
    noteElement.style.background = '#f8f9fa';
    noteElement.style.borderRadius = '8px';
    noteElement.innerHTML = `
        <i class="fas fa-${currentInputMethod === 'manual' ? 'hand-pointer' : 'robot'}"></i>
        <span>${inputMethodNote}</span>
    `;
    
    const formulaDetails = document.querySelector('.formula-details');
    if (!formulaDetails.querySelector('.input-method-note')) {
        noteElement.classList.add('input-method-note');
        formulaDetails.appendChild(noteElement);
    }
    
    showToast('تم تصميم التركيبة بنجاح', 'success');
}

// ===========================================
// دوال مساعدة للحساب
// ===========================================
function getIngredientDisplayName(code) {
    const names = {
        'paracetamol': 'باراسيتامول',
        'ibuprofen': 'آيبوبروفين',
        'amoxicillin': 'أموكسيسيلين',
        'silver-iodide': 'يوديد الفضة',
        'titanium-dioxide': 'ثاني أكسيد التيتانيوم',
        'vitamin-c': 'فيتامين ج'
    };
    return names[code] || code;
}

function getUnitForProduct(productForm) {
    if (productForm === 'syrup') return 'مل';
    if (productForm.includes('tablet') || productForm === 'capsule') return 'مجم';
    if (productForm === 'powder') return 'جرام';
    return 'وحدة';
}

function calculateIngredientCost(name, amount, productForm) {
    const prices = {
        'paracetamol': 0.0005,
        'ibuprofen': 0.0008,
        'amoxicillin': 0.0012,
        'silver-iodide': 0.002,
        'titanium-dioxide': 0.0003,
        'vitamin-c': 0.0004
    };
    
    const unitMultiplier = productForm === 'syrup' ? 1 : 0.001;
    const cost = (prices[name] || 0.0006) * amount * unitMultiplier;
    return '$' + cost.toFixed(4);
}

function calculateExcipientCost(name, type) {
    const costs = {
        'filler': 0.04,
        'binder': 0.035,
        'disintegrant': 0.03,
        'lubricant': 0.01
    };
    
    return '$' + (costs[type] || 0.03).toFixed(3);
}

function calculateTotalCost(activeIngredients, excipients, productForm) {
    let total = 0;
    
    // تكلفة المواد الفعالة
    activeIngredients.forEach(ing => {
        const prices = {
            'paracetamol': 0.0005,
            'ibuprofen': 0.0008,
            'amoxicillin': 0.0012,
            'silver-iodide': 0.002,
            'titanium-dioxide': 0.0003,
            'vitamin-c': 0.0004
        };
        
        const unitMultiplier = productForm === 'syrup' ? 1 : 0.001;
        total += (prices[ing.name] || 0.0006) * ing.amount * unitMultiplier;
    });
    
    // تكلفة المواد المساعدة
    excipients.forEach(excipient => {
        const costs = {
            'filler': 0.04,
            'binder': 0.035,
            'disintegrant': 0.03,
            'lubricant': 0.01
        };
        
        total += (costs[excipient.function] || 0.03) * (excipient.percentage / 100) * 1000;
    });
    
    return '$' + total.toFixed(2) + ' / لكل 1000 وحدة';
}

// ===========================================
// مواصفات الجودة
// ===========================================
function updateQualitySpecifications(reference) {
    const specsBody = document.getElementById('specificationsBody');
    const specsReference = document.getElementById('specificationsReference');
    
    specsReference.textContent = reference.toUpperCase();
    document.getElementById('specificationsTable').className = `specifications-table ${reference}`;
    
    const specifications = [
        { test: 'الهوية', spec: 'يجب أن تطابق التركيبة المتطلبات', result: 'مطابق', status: 'success' },
        { test: 'النقاوة', spec: '≥ 98.0%', result: '99.2%', status: 'success' },
        { test: 'الذوبانية', spec: 'قابل للذوبان في الماء', result: 'ممتاز', status: 'success' },
        { test: 'الثبات', spec: 'مستقر لمدة 24 شهر', result: 'مطابق', status: 'success' },
        { test: 'المحتوى', spec: '95.0% - 105.0%', result: '102.3%', status: 'success' }
    ];
    
    let html = '';
    specifications.forEach(spec => {
        html += `
            <tr>
                <td>${spec.test}</td>
                <td>${spec.spec}</td>
                <td>${spec.result}</td>
                <td><span class="status ${spec.status}">${spec.status === 'success' ? 'مطابق' : 'غير مطابق'}</span></td>
            </tr>
        `;
    });
    
    specsBody.innerHTML = html;
}

// ===========================================
// مقاييس الأداء
// ===========================================
function updatePerformanceMetrics(activeIngredients, excipients, primaryGoal) {
    const performanceMetrics = document.getElementById('performanceMetrics');
    
    const metrics = [
        { name: 'فعالية التكلفة', icon: 'fa-money-bill-wave', value: 'عالية', color: '#27ae60' },
        { name: 'استقرار التركيبة', icon: 'fa-shield-alt', value: 'ممتاز', color: '#3498db' },
        { name: 'سرعة الإنتاج', icon: 'fa-tachometer-alt', value: 'سريع', color: '#9b59b6' },
        { name: 'توافق البيئة', icon: 'fa-leaf', value: 'جيد', color: '#2ecc71' }
    ];
    
    let html = '';
    metrics.forEach(metric => {
        html += `
            <div class="metric-card">
                <h4><i class="fas ${metric.icon}"></i> ${metric.name}</h4>
                <p>${metric.value}</p>
            </div>
        `;
    });
    
    performanceMetrics.innerHTML = html;
}

// ===========================================
// المخطط الدائري
// ===========================================
function renderPieChart(activeIngredients, excipients) {
    const canvas = document.getElementById('formulaChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // تحضير البيانات
    const labels = [];
    const data = [];
    const backgroundColors = [
        '#2ecc71', '#3498db', '#9b59b6', '#e74c3c',
        '#f1c40f', '#1abc9c', '#e67e22', '#34495e'
    ];
    
    // إضافة المواد الفعالة
    activeIngredients.forEach((ing, index) => {
        labels.push(getIngredientDisplayName(ing.name));
        data.push(ing.amount);
    });
    
    // إضافة المواد المساعدة
    excipients.forEach((ex, index) => {
        labels.push(ex.displayName);
        data.push(ex.percentage);
    });
    
    // إنشاء المخطط
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors.slice(0, labels.length),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    rtl: true,
                    labels: {
                        font: {
                            size: 11,
                            family: 'Segoe UI'
                        },
                        padding: 20
                    }
                },
                title: {
                    display: true,
                    text: 'توزيع مكونات التركيبة',
                    font: {
                        size: 16
                    }
                }
            }
        }
    });
}

// ===========================================
// تصدير النتائج
// ===========================================
function exportResults() {
    if (typeof html2pdf === 'undefined') {
        showToast('يجب تحميل مكتبة html2pdf أولاً', 'error');
        return;
    }
    
    const element = document.getElementById('resultsContent');
    
    html2pdf().from(element).set({
        margin: [10, 10, 10, 10],
        filename: 'تركيبة_كيميائية.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, logging: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).save();
}

function saveFormula() {
    const formulaData = {
        name: document.getElementById('formulaNameDisplay').textContent,
        date: document.getElementById('designDate').textContent,
        reference: document.getElementById('referenceBadge').textContent,
        cost: document.getElementById('totalCost').textContent
    };
    
    localStorage.setItem('lastFormula', JSON.stringify(formulaData));
    showToast('تم حفظ التركيبة محلياً', 'success');
}

// ===========================================
// أحداث إضافية
// ===========================================
document.addEventListener('DOMContentLoaded', function() {
    // تحديث المقترحات الآلية عند تغيير الإعدادات
    const autoSettings = ['costStrategy', 'productionStrategy', 'performancePriority'];
    autoSettings.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', updateAutoSuggestions);
        }
    });
    
    // اختيار المادة المخصصة
    const excipientName = document.getElementById('excipientName');
    if (excipientName) {
        excipientName.addEventListener('change', function() {
            const customNameField = document.getElementById('customExcipientName');
            const customNameLabel = document.getElementById('customNameLabel');
            
            if (this.value === 'custom') {
                customNameField.style.display = 'block';
                customNameLabel.style.display = 'block';
            } else {
                customNameField.style.display = 'none';
                customNameLabel.style.display = 'none';
            }
        });
    }
});
