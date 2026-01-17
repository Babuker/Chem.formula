// ===========================================
// script.js - الملف الرئيسي للجافاسكريبت
// ===========================================

// ===========================================
// تعريف المتغيرات العامة
// ===========================================

let manualExcipients = [];
let currentInputMethod = 'auto';
let currentReference = 'bp';
let currentProductForm = '';
let activeIngredientsCount = 1;
let currentFormulaData = null;

// ===========================================
// دوال مساعدة عامة
// ===========================================

/**
 * إظهار إشعار للمستخدم
 * @param {string} message - نص الرسالة
 * @param {string} type - نوع الرسالة (success, error, info, warning)
 * @param {number} duration - مدة العرض بالميلي ثانية
 */
function showToast(message, type = 'info', duration = 3000) {
    // إنصراف إذا كان هناك إشعار حالياً
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();
    
    // إنشاء العنصر
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${getToastIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    // إضافة للصفحة
    document.body.appendChild(toast);
    
    // إظهار مع تأثير
    setTimeout(() => toast.classList.add('show'), 10);
    
    // إخفاء بعد المدة المحددة
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
    
    // إمكانية الإخفاء بالنقر
    toast.addEventListener('click', () => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    });
}

/**
 * الحصول على الأيقونة المناسبة لنوع الإشعار
 */
function getToastIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

/**
 * إظهار/إخفاء شاشة التحميل
 */
function showLoading(show) {
    let loading = document.getElementById('loading');
    
    if (!loading) {
        loading = document.createElement('div');
        loading.id = 'loading';
        loading.className = 'loading';
        loading.innerHTML = `
            <div class="spinner"></div>
            <p>جاري تحليل وتصميم التركيبة المثالية...</p>
            <small>قد تستغرق العملية بضع ثوانٍ</small>
        `;
        document.body.appendChild(loading);
    }
    
    loading.style.display = show ? 'block' : 'none';
}

/**
 * التحقق من صحة النموذج
 */
function validateForm() {
    const formulaName = document.getElementById('formulaName').value.trim();
    const reference = document.getElementById('reference').value;
    const productForm = document.getElementById('productForm').value;
    const primaryGoal = document.getElementById('primaryGoal').value;
    const totalWeight = document.getElementById('totalWeight').value;
    
    // التحقق من الاسم
    if (!formulaName) {
        showToast('يرجى إدخال اسم التركيبة', 'error');
        document.getElementById('formulaName').focus();
        return false;
    }
    
    if (formulaName.length < 3) {
        showToast('اسم التركيبة يجب أن يكون 3 أحرف على الأقل', 'error');
        document.getElementById('formulaName').focus();
        return false;
    }
    
    // التحقق من المرجعية
    if (!reference) {
        showToast('يرجى اختيار المرجعية (BP أو USP)', 'error');
        return false;
    }
    
    // التحقق من شكل المنتج
    if (!productForm) {
        showToast('يرجى اختيار شكل المنتج', 'error');
        return false;
    }
    
    // التحقق من الهدف الأساسي
    if (!primaryGoal) {
        showToast('يرجى اختيار الهدف الأساسي للتصميم', 'error');
        return false;
    }
    
    // التحقق من الوزن الكلي
    if (!totalWeight || totalWeight <= 0) {
        showToast('يرجى إدخال وزن/حجم صحيح للتركيبة', 'error');
        document.getElementById('totalWeight').focus();
        return false;
    }
    
    // التحقق من المواد الفعالة
    const activeIngredients = getActiveIngredients();
    if (activeIngredients.length === 0) {
        showToast('يرجى إضافة مادة فعالة واحدة على الأقل', 'error');
        return false;
    }
    
    // التحقق من المواد المضافة
    const excipients = getExcipients();
    if (excipients.length === 0) {
        showToast('يرجى إضافة المواد المساعدة', 'error');
        return false;
    }
    
    return true;
}

/**
 * تنسيق الأرقام مع فواصل
 */
function formatNumber(num, decimals = 2) {
    return parseFloat(num).toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * تقصير النص الطويل
 */
function truncateText(text, maxLength = 30) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}

// ===========================================
// معالجة المواد الفعالة
// ===========================================

/**
 * الحصول على قائمة المواد الفعالة
 */
function getActiveIngredients() {
    const activeIngredients = [];
    document.querySelectorAll('.ingredient-row').forEach((row, index) => {
        const name = row.querySelector('.active-ingredient').value;
        const amount = row.querySelector('.active-ingredient-amount').value;
        const unit = row.querySelector('.unit').textContent;
        
        if (name && amount && parseFloat(amount) > 0) {
            activeIngredients.push({
                id: Date.now() + index,
                name: name,
                displayName: row.querySelector('.active-ingredient option:checked').text.split('(')[0].trim(),
                amount: parseFloat(amount),
                unit: unit,
                technicalName: row.querySelector('.active-ingredient option:checked').text
            });
        }
    });
    return activeIngredients;
}

/**
 * إضافة صف جديد للمادة الفعالة
 */
function addIngredientRow() {
    const container = document.getElementById('activeIngredientsContainer');
    const rowCount = document.querySelectorAll('.ingredient-row').length;
    
    // تحديد الوحدة بناءً على شكل المنتج
    let unit = 'مجم';
    if (currentProductForm === 'syrup') {
        unit = 'ملجم/مل';
    } else if (currentProductForm === 'powder') {
        unit = 'جرام';
    }
    
    const row = document.createElement('div');
    row.className = 'ingredient-row';
    row.innerHTML = `
        <select class="active-ingredient" required>
            <option value="">اختر المادة الفعالة...</option>
            <option value="paracetamol">باراسيتامول (Paracetamol)</option>
            <option value="ibuprofen">آيبوبروفين (Ibuprofen)</option>
            <option value="amoxicillin">أموكسيسيلين (Amoxicillin)</option>
            <option value="silver-iodide">يوديد الفضة (Silver Iodide)</option>
            <option value="titanium-dioxide">ثاني أكسيد التيتانيوم (TiO₂)</option>
            <option value="sodium-hypochlorite">هيبوكلوريت الصوديوم (NaClO)</option>
            <option value="vitamin-c">فيتامين ج (Ascorbic Acid)</option>
            <option value="custom">مادة مخصصة...</option>
        </select>
        
        <div class="input-with-unit">
            <input type="number" class="active-ingredient-amount" min="0.1" max="10000" step="0.1" placeholder="الكمية" required>
            <div class="unit">${unit}</div>
        </div>
        
        <button type="button" class="remove-ingredient" onclick="removeIngredientRow(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(row);
    activeIngredientsCount++;
    
    // إضافة حدث للمادة المخصصة
    const select = row.querySelector('.active-ingredient');
    select.addEventListener('change', function() {
        if (this.value === 'custom') {
            // يمكن إضافة حقل نصي للمادة المخصصة
            const customInput = document.createElement('input');
            customInput.type = 'text';
            customInput.className = 'custom-ingredient-name';
            customInput.placeholder = 'اسم المادة المخصصة';
            customInput.style.marginTop = '10px';
            customInput.style.width = '100%';
            row.appendChild(customInput);
        } else {
            const existingInput = row.querySelector('.custom-ingredient-name');
            if (existingInput) existingInput.remove();
        }
    });
    
    showToast('تم إضافة حقل مادة فعالة جديد', 'success');
}

/**
 * إزالة صف المادة الفعالة
 */
function removeIngredientRow(button) {
    const row = button.closest('.ingredient-row');
    const rows = document.querySelectorAll('.ingredient-row');
    
    if (rows.length > 1) {
        row.style.transform = 'translateX(100%)';
        row.style.opacity = '0';
        
        setTimeout(() => {
            row.remove();
            activeIngredientsCount--;
            showToast('تم إزالة المادة الفعالة', 'warning');
        }, 300);
    } else {
        showToast('يجب أن يبقى حقل واحد للمادة الفعالة على الأقل', 'error');
    }
}

// ===========================================
// معالجة طريقة الإدخال
// ===========================================

/**
 * اختيار طريقة إدخال المواد المساعدة
 */
function selectInputMethod(method) {
    currentInputMethod = method;
    document.getElementById('inputMethod').value = method;
    
    // تحديث المظهر
    document.querySelectorAll('.input-method-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    document.getElementById('manualInputSection').style.display = 'none';
    document.getElementById('autoInputSection').style.display = 'none';
    
    if (method === 'manual') {
        document.getElementById('manualOption').classList.add('selected');
        document.getElementById('manualInputSection').style.display = 'block';
        showToast('تم تفعيل الإدخال اليدوي للمواد المساعدة', 'info');
    } else {
        document.getElementById('autoOption').classList.add('selected');
        document.getElementById('autoInputSection').style.display = 'block';
        updateAutoSuggestions();
        showToast('تم تفعيل الإدخال الآلي للمواد المساعدة', 'info');
    }
}

// ===========================================
// الإدخال اليدوي للمواد المساعدة
// ===========================================

/**
 * إضافة مادة مساعدة يدوياً
 */
function addManualExcipient() {
    const nameSelect = document.getElementById('excipientName');
    const name = nameSelect.value;
    
    if (!name) {
        showToast('يرجى اختيار اسم المادة المساعدة', 'error');
        nameSelect.focus();
        return;
    }
    
    // اسم العرض
    let displayName = nameSelect.options[nameSelect.selectedIndex].text;
    
    // إذا كانت مادة مخصصة
    if (name === 'custom') {
        const customName = document.getElementById('customExcipientName').value.trim();
        if (!customName) {
            showToast('يرجى إدخال اسم المادة المخصصة', 'error');
            document.getElementById('customExcipientName').focus();
            return;
        }
        displayName = customName;
    }
    
    // الوظيفة
    const functionSelect = document.getElementById('excipientFunction');
    const excipientFunction = functionSelect.value;
    const functionText = functionSelect.options[functionSelect.selectedIndex].text;
    
    // النسبة
    const percentage = parseFloat(document.getElementById('excipientPercentage').value);
    
    if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
        showToast('يرجى إدخال نسبة صحيحة بين 0.1 و 100%', 'error');
        document.getElementById('excipientPercentage').focus();
        return;
    }
    
    // إضافة للمصفوفة
    const excipient = {
        id: Date.now(),
        name: name,
        displayName: displayName,
        function: excipientFunction,
        functionText: functionText,
        percentage: percentage,
        cost: calculateExcipientCost(name, excipientFunction)
    };
    
    manualExcipients.push(excipient);
    updateManualExcipientsList();
    
    // إعادة تعيين الحقول
    nameSelect.value = '';
    document.getElementById('excipientPercentage').value = '5';
    document.getElementById('customExcipientName').style.display = 'none';
    document.getElementById('customExcipientName').value = '';
    
    showToast('تم إضافة المادة المساعدة بنجاح', 'success');
}

/**
 * تحديث قائمة المواد المساعدة اليدوية
 */
function updateManualExcipientsList() {
    const listElement = document.getElementById('manualExcipientsList');
    const countElement = document.getElementById('manualExcipientsCount');
    
    if (manualExcipients.length === 0) {
        listElement.innerHTML = `
            <div class="empty-list">
                <i class="fas fa-inbox"></i>
                <p>لم يتم إضافة أي مواد مساعدة بعد</p>
                <small>استخدم النموذج أعلاه لإضافة المواد</small>
            </div>
        `;
        countElement.textContent = '(0 مادة)';
        return;
    }
    
    // حساب المجموع
    const totalPercentage = manualExcipients.reduce((sum, exc) => sum + exc.percentage, 0);
    
    let html = '';
    manualExcipients.forEach(excipient => {
        html += `
            <div class="manual-excipient-item" id="excipient-${excipient.id}">
                <div class="excipient-info">
                    <h5>${excipient.displayName}</h5>
                    <div class="details">
                        <span><i class="fas fa-tag"></i> ${excipient.functionText}</span>
                        <span><i class="fas fa-percentage"></i> ${formatNumber(excipient.percentage)}%</span>
                        <span><i class="fas fa-dollar-sign"></i> ${excipient.cost}</span>
                    </div>
                </div>
                <button type="button" class="remove-manual-excipient" onclick="removeManualExcipient(${excipient.id})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });
    
    // إضافة المجموع
    html += `
        <div class="total-percentage">
            <strong>المجموع:</strong> ${formatNumber(totalPercentage)}%
            <small>${totalPercentage > 100 ? '❌ تجاوز 100%' : totalPercentage < 100 ? '⚠️ أقل من 100%' : '✅ مثالي'}</small>
        </div>
    `;
    
    listElement.innerHTML = html;
    countElement.textContent = `(${manualExcipients.length} مادة)`;
    
    // تحذير إذا تجاوز المجموع 100%
    if (totalPercentage > 100) {
        showToast('تحذير: مجموع النسب يتجاوز 100%', 'warning', 5000);
    } else if (totalPercentage < 100) {
        showToast('ملاحظة: مجموع النسب أقل من 100%', 'info', 5000);
    }
}

/**
 * إزالة مادة مساعدة يدوية
 */
function removeManualExcipient(id) {
    manualExcipients = manualExcipients.filter(excipient => excipient.id !== id);
    updateManualExcipientsList();
    showToast('تم إزالة المادة المساعدة', 'warning');
}

/**
 * مسح جميع المواد المساعدة اليدوية
 */
function clearManualExcipients() {
    if (manualExcipients.length === 0) {
        showToast('لا توجد مواد مساعدة للمسح', 'info');
        return;
    }
    
    if (confirm('هل أنت متأكد من مسح جميع المواد المساعدة؟')) {
        manualExcipients = [];
        updateManualExcipientsList();
        showToast('تم مسح جميع المواد المساعدة', 'success');
    }
}

/**
 * تحميل تركيبة شائعة
 */
function loadCommonFormulation() {
    const productForm = document.getElementById('productForm').value;
    
    if (!productForm) {
        showToast('يرجى اختيار شكل المنتج أولاً', 'error');
        return;
    }
    
    manualExcipients = [];
    
    // إضافة مواد حسب نوع المنتج
    if (productForm.includes('tablet')) {
        manualExcipients = [
            {
                id: Date.now(),
                name: 'mcc',
                displayName: 'سليولوز ميكروكريستاليني (MCC)',
                function: 'filler',
                functionText: 'مادة مالئة',
                percentage: 30,
                cost: '$0.05'
            },
            {
                id: Date.now() + 1,
                name: 'povidone',
                displayName: 'بوفيدون K30',
                function: 'binder',
                functionText: 'مادة رابطة',
                percentage: 2,
                cost: '$0.03'
            },
            {
                id: Date.now() + 2,
                name: 'croscarmellose',
                displayName: 'صوديوم كروكارميلوز',
                function: 'disintegrant',
                functionText: 'مادة مفككة',
                percentage: 1.5,
                cost: '$0.04'
            },
            {
                id: Date.now() + 3,
                name: 'magnesium-stearate',
                displayName: 'ستيرات المغنيسيوم',
                function: 'lubricant',
                functionText: 'مادة مزلقة',
                percentage: 0.5,
                cost: '$0.01'
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
                percentage: 35,
                cost: '$0.04'
            },
            {
                id: Date.now() + 1,
                name: 'magnesium-stearate',
                displayName: 'ستيرات المغنيسيوم',
                function: 'lubricant',
                functionText: 'مادة مزلقة',
                percentage: 0.5,
                cost: '$0.01'
            }
        ];
    } else if (productForm === 'syrup') {
        manualExcipients = [
            {
                id: Date.now(),
                name: 'sucrose',
                displayName: 'سكروز',
                function: 'sweetener',
                functionText: 'محلي',
                percentage: 60,
                cost: '$0.02'
            },
            {
                id: Date.now() + 1,
                name: 'methyl-paraben',
                displayName: 'ميثيل بارابين',
                function: 'preservative',
                functionText: 'مادة حافظة',
                percentage: 0.1,
                cost: '$0.15'
            },
            {
                id: Date.now() + 2,
                name: 'glycerin',
                displayName: 'جليسرين',
                function: 'solvent',
                functionText: 'مذيب',
                percentage: 15,
                cost: '$0.03'
            }
        ];
    }
    
    updateManualExcipientsList();
    showToast('تم تحميل تركيبة شائعة بناءً على نوع المنتج', 'success');
}

// ===========================================
// الإدخال الآلي للمواد المساعدة
// ===========================================

/**
 * تحديث المقترحات الآلية
 */
function updateAutoSuggestions() {
    const costStrategy = document.getElementById('costStrategy').value;
    const productionStrategy = document.getElementById('productionStrategy').value;
    const performancePriority = document.getElementById('performancePriority').value;
    const productForm = document.getElementById('productForm').value;
    
    let suggestions = [];
    
    // بناء المقترحات بناءً على الإعدادات
    if (productForm.includes('tablet')) {
        if (costStrategy === 'lowest') {
            suggestions = ['نشا الذرة', 'لاكتوز', 'ستيرات مغنيسيوم', 'نشا صوديوم جليكولات'];
        } else if (costStrategy === 'balanced') {
            suggestions = ['سليولوز ميكروكريستاليني', 'بوفيدون', 'كروسكارميلوز', 'ستيرات مغنيسيوم'];
        } else {
            suggestions = ['مانيتول', 'هيدروكسي بروبيل ميثيل سليولوز', 'كروسپوفيدون', 'ثاني أكسيد السيليكون'];
        }
        
        if (performancePriority === 'fast-release') {
            suggestions.push('سوبرديسبيرانت');
        }
    } else if (productForm === 'capsule') {
        suggestions = ['لاكتوز', 'ستيرات مغنيسيوم', 'ثاني أكسيد السيليكون'];
    } else if (productForm === 'syrup') {
        suggestions = ['سكروز', 'بروبيلين جليكول', 'ميثيل بارابين', 'نكهة'];
    } else if (productForm === 'powder') {
        suggestions = ['نشا الذرة', 'سليولوز', 'سليكا', 'تلك'];
    }
    
    // عرض المقترحات
    const previewElement = document.getElementById('autoExcipientsPreview');
    let html = '';
    suggestions.forEach((item, index) => {
        html += `<div class="auto-excipient-tag" style="animation-delay: ${index * 0.1}s">${item}</div>`;
    });
    previewElement.innerHTML = html;
}

/**
 * إعادة توليد المقترحات الآلية
 */
function regenerateAutoSuggestions() {
    updateAutoSuggestions();
    
    // تأثير مرئي
    const previewElement = document.getElementById('autoExcipientsPreview');
    previewElement.style.opacity = '0.5';
    previewElement.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
        previewElement.style.transition = 'all 0.3s ease';
        previewElement.style.opacity = '1';
        previewElement.style.transform = 'scale(1)';
    }, 100);
    
    showToast('تم إعادة توليد المقترحات الآلية', 'success');
}

/**
 * توليد المواد المساعدة آلياً
 */
function generateAutoExcipients() {
    const costStrategy = document.getElementById('costStrategy').value;
    const productionStrategy = document.getElementById('productionStrategy').value;
    const performancePriority = document.getElementById('performancePriority').value;
    const productForm = document.getElementById('productForm').value;
    
    let excipients = [];
    let baseId = Date.now();
    
    // مواد أساسية حسب شكل المنتج
    if (productForm.includes('tablet')) {
        excipients = [
            {
                id: baseId,
                name: 'filler',
                displayName: costStrategy === 'lowest' ? 'لاكتوز اللامائي' : 'سليولوز ميكروكريستاليني (MCC)',
                function: 'filler',
                functionText: 'مادة مالئة',
                percentage: costStrategy === 'lowest' ? 35 : 30,
                cost: calculateExcipientCost(costStrategy === 'lowest' ? 'lactose' : 'mcc', 'filler')
            },
            {
                id: baseId + 1,
                name: 'binder',
                displayName: 'بوفيدون K30',
                function: 'binder',
                functionText: 'مادة رابطة',
                percentage: performancePriority === 'fast-release' ? 1 : 2,
                cost: calculateExcipientCost('povidone', 'binder')
            },
            {
                id: baseId + 2,
                name: 'disintegrant',
                displayName: performancePriority === 'fast-release' ? 'نشا صوديوم جليكولات' : 'صوديوم كروكارميلوز',
                function: 'disintegrant',
                functionText: 'مادة مفككة',
                percentage: 1.5,
                cost: calculateExcipientCost(performancePriority === 'fast-release' ? 'sodium-starch-glycolate' : 'croscarmellose', 'disintegrant')
            },
            {
                id: baseId + 3,
                name: 'lubricant',
                displayName: 'ستيرات المغنيسيوم',
                function: 'lubricant',
                functionText: 'مادة مزلقة',
                percentage: 0.5,
                cost: calculateExcipientCost('magnesium-stearate', 'lubricant')
            }
        ];
    } else if (productForm === 'capsule') {
        excipients = [
            {
                id: baseId,
                name: 'filler',
                displayName: 'لاكتوز اللامائي',
                function: 'filler',
                functionText: 'مادة مالئة',
                percentage: 40,
                cost: calculateExcipientCost('lactose', 'filler')
            },
            {
                id: baseId + 1,
                name: 'lubricant',
                displayName: 'ستيرات المغنيسيوم',
                function: 'lubricant',
                functionText: 'مادة مزلقة',
                percentage: 0.5,
                cost: calculateExcipientCost('magnesium-stearate', 'lubricant')
            }
        ];
    } else if (productForm === 'syrup') {
        excipients = [
            {
                id: baseId,
                name: 'sweetener',
                displayName: 'سكروز',
                function: 'sweetener',
                functionText: 'محلي',
                percentage: 60,
                cost: calculateExcipientCost('sucrose', 'sweetener')
            },
            {
                id: baseId + 1,
                name: 'preservative',
                displayName: 'ميثيل بارابين',
                function: 'preservative',
                functionText: 'مادة حافظة',
                percentage: 0.1,
                cost: calculateExcipientCost('methyl-paraben', 'preservative')
            },
            {
                id: baseId + 2,
                name: 'solvent',
                displayName: 'جليسرين',
                function: 'solvent',
                functionText: 'مذيب',
                percentage: 15,
                cost: calculateExcipientCost('glycerin', 'solvent')
            }
        ];
    }
    
    return excipients;
}

// ===========================================
// معالجة المواد المساعدة
// ===========================================

/**
 * الحصول على المواد المساعدة بناءً على طريقة الإدخال
 */
function getExcipients() {
    if (currentInputMethod === 'manual') {
        return manualExcipients;
    } else {
        return generateAutoExcipients();
    }
}

// ===========================================
// معالجة النتائج
// ===========================================

/**
 * توليد النتائج
 */
function generateResults(formulaName, reference, productForm, primaryGoal, budget, activeIngredients, excipients, inputMethod) {
    showLoading(true);
    
    // محاكاة وقت المعالجة
    setTimeout(() => {
        try {
            // تحديث معلومات الصيغة
            document.getElementById('formulaNameDisplay').textContent = formulaName;
            document.getElementById('designDate').textContent = new Date().toLocaleDateString('ar-SA');
            
            // تحديث شارة المرجعية
            const referenceBadge = document.getElementById('referenceBadge');
            referenceBadge.textContent = reference.toUpperCase();
            referenceBadge.className = `meta-badge reference ${reference}`;
            
            // تحديث شارة الشكل
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
            updateFormulaTable(activeIngredients, excipients, reference);
            
            // تحديث التكلفة الإجمالية
            const totalCost = calculateTotalCost(activeIngredients, excipients);
            document.getElementById('totalCost').textContent = totalCost;
            
            // تحديث مواصفات الجودة
            updateSpecificationsTable(reference, productForm);
            
            // تحديث مقاييس الأداء
            updatePerformanceMetrics(primaryGoal, budget);
            
            // إضافة ملاحظة حول طريقة الإدخال
            addInputMethodNote(inputMethod, reference);
            
            // حفظ البيانات الحالية
            currentFormulaData = {
                name: formulaName,
                reference: reference,
                form: productForm,
                goal: primaryGoal,
                budget: budget,
                activeIngredients: activeIngredients,
                excipients: excipients,
                inputMethod: inputMethod,
                totalCost: totalCost,
                date: new Date().toISOString()
            };
            
            // إظهار النتائج
            document.getElementById('resultsPlaceholder').style.display = 'none';
            document.getElementById('resultsContent').style.display = 'block';
            
            // التمرير إلى النتائج
            document.getElementById('resultsContent').scrollIntoView({ behavior: 'smooth' });
            
            showLoading(false);
            showToast('🎉 تم تصميم التركيبة المثالية بنجاح!', 'success');
            
        } catch (error) {
            showLoading(false);
            showToast('❌ حدث خطأ أثناء معالجة البيانات: ' + error.message, 'error');
            console.error('Error generating results:', error);
        }
    }, 2000);
}

/**
 * تحديث جدول المكونات
 */
function updateFormulaTable(activeIngredients, excipients, reference) {
    const tbody = document.getElementById('formulaTable').querySelector('tbody');
    let totalPercentage = 0;
    
    let rows = '';
    
    // المواد الفعالة
    activeIngredients.forEach((ing, index) => {
        const cost = calculateActiveIngredientCost(ing.name, ing.amount);
        rows += `
            <tr class="active-ingredient-row">
                <td>${ing.displayName}</td>
                <td>${formatNumber(ing.amount)} ${ing.unit}</td>
                <td>مادة فعالة</td>
                <td>${cost}</td>
                <td><span class="compliance-badge ${reference}">${reference.toUpperCase()}</span></td>
            </tr>
        `;
        totalPercentage += (ing.amount / 1000) * 100; // تحويل مجم إلى نسبة مئوية
    });
    
    // المواد المساعدة
    excipients.forEach((excipient, index) => {
        rows += `
            <tr>
                <td>${excipient.displayName}</td>
                <td>${formatNumber(excipient.percentage)}%</td>
                <td>${excipient.functionText}</td>
                <td>${excipient.cost}</td>
                <td><span class="compliance-badge ${reference}">${reference.toUpperCase()}</span></td>
            </tr>
        `;
        totalPercentage += excipient.percentage;
    });
    
    // الصف الإجمالي
    rows += `
        <tr class="total-row">
            <td colspan="2"><strong>الإجمالي:</strong> ${formatNumber(totalPercentage)}%</td>
            <td colspan="3">
                ${totalPercentage === 100 ? '✅ توازن مثالي' : 
                  totalPercentage < 100 ? '⚠️ يحتاج لمواد مالئة' : 
                  '❌ تجاوز السعة'}
            </td>
        </tr>
    `;
    
    tbody.innerHTML = rows;
}

/**
 * تحديث جدول المواصفات
 */
function updateSpecificationsTable(reference, productForm) {
    const table = document.getElementById('specificationsTable');
    const tbody = document.getElementById('specificationsBody');
    
    // تحديث فئة الجدول
    table.className = `specifications-table ${reference}`;
    document.getElementById('specsReference').textContent = reference.toUpperCase();
    
    let rows = '';
    
    if (productForm.includes('tablet')) {
        rows = `
            <tr>
                <td>الانحلال</td>
                <td>≤ 15 دقيقة (BP)<br>≤ 30 دقيقة (USP)</td>
                <td>${reference === 'bp' ? '8.2 دقيقة' : '12.5 دقيقة'}</td>
                <td><span class="status success">✓ متوافق</span></td>
            </tr>
            <tr>
                <td>محتوى المادة الفعالة</td>
                <td>95% - 105% من الكمية المعلنة</td>
                <td>98.5%</td>
                <td><span class="status success">✓ متوافق</span></td>
            </tr>
            <tr>
                <td>التوحيد</td>
                <td>RSD ≤ 6%</td>
                <td>3.2%</td>
                <td><span class="status success">✓ متوافق</span></td>
            </tr>
            <tr>
                <td>متانة القرص</td>
                <td>≥ 50 N</td>
                <td>${reference === 'bp' ? '65 N' : '58 N'}</td>
                <td><span class="status success">✓ متوافق</span></td>
            </tr>
            <tr>
                <td>الثبات</td>
                <td>مستقر عند 40°C/75% RH لمدة 3 أشهر</td>
                <td>مستقر تماماً</td>
                <td><span class="status success">✓ متوافق</span></td>
            </tr>
        `;
    } else if (productForm === 'capsule') {
        rows = `
            <tr>
                <td>الانحلال</td>
                <td>≤ 30 دقيقة</td>
                <td>22 دقيقة</td>
                <td><span class="status success">✓ متوافق</span></td>
            </tr>
            <tr>
                <td>محتوى المادة الفعالة</td>
                <td>90% - 110% من الكمية المعلنة</td>
                <td>102.3%</td>
                <td><span class="status success">✓ متوافق</span></td>
            </tr>
            <tr>
                <td>الرطوبة</td>
                <td>≤ 7.0%</td>
                <td>5.2%</td>
                <td><span class="status success">✓ متوافق</span></td>
            </tr>
        `;
    } else if (productForm === 'syrup') {
        rows = `
            <tr>
                <td>الرقم الهيدروجيني</td>
                <td>4.0 - 6.0</td>
                <td>5.2</td>
                <td><span class="status success">✓ متوافق</span></td>
            </tr>
            <tr>
                <td>الكثافة</td>
                <td>1.10 - 1.30 g/mL</td>
                <td>1.22 g/mL</td>
                <td><span class="status success">✓ متوافق</span></td>
            </tr>
            <tr>
                <td>الثبات الميكروبي</td>
                <td>≤ 100 CFU/mL</td>
                <td>50 CFU/mL</td>
                <td><span class="status success">✓ متوافق</span></td>
            </tr>
        `;
    }
    
    tbody.innerHTML = rows;
}

/**
 * تحديث مقاييس الأداء
 */
function updatePerformanceMetrics(primaryGoal, budget) {
    const container = document.getElementById('performanceMetrics');
    
    // حساب المقاييس بناءً على الهدف والميزانية
    let metrics = {};
    
    switch(primaryGoal) {
        case 'min-cost':
            metrics = {
                costEfficiency: { value: '92%', label: 'كفاءة التكلفة', color: 'success' },
                productionSpeed: { value: '85%', label: 'سرعة الإنتاج', color: 'success' },
                materialCost: { value: `$${formatNumber(budget * 0.7)}`, label: 'تكلفة المواد', color: 'info' },
                annualSaving: { value: '$42,500', label: 'التوفير السنوي', color: 'warning' }
            };
            break;
            
        case 'max-performance':
            metrics = {
                performanceScore: { value: '98%', label: 'درجة الأداء', color: 'success' },
                dissolutionRate: { value: '4.2 دقيقة', label: 'معدل الانحلال', color: 'info' },
                materialCost: { value: `$${formatNumber(budget * 1.3)}`, label: 'تكلفة المواد', color: 'warning' },
                customerSatisfaction: { value: '96%', label: 'رضا العملاء', color: 'success' }
            };
            break;
            
        default: // balanced
            metrics = {
                costEfficiency: { value: '85%', label: 'كفاءة التكلفة', color: 'warning' },
                performanceScore: { value: '94%', label: 'درجة الأداء', color: 'success' },
                productionSpeed: { value: '88%', label: 'سرعة الإنتاج', color: 'info' },
                annualSaving: { value: '$18,300', label: 'التوفير السنوي', color: 'success' }
            };
    }
    
    // بناء HTML
    let html = '';
    Object.values(metrics).forEach(metric => {
        html += `
            <div class="metric-card">
                <h4>${metric.label}</h4>
                <p class="${metric.color}">${metric.value}</p>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

/**
 * إضافة ملاحظة حول طريقة الإدخال
 */
function addInputMethodNote(inputMethod, reference) {
    const existingNote = document.querySelector('.input-method-note');
    if (existingNote) existingNote.remove();
    
    const noteElement = document.createElement('div');
    noteElement.className = `info-card input-method-note`;
    noteElement.innerHTML = `
        <i class="fas fa-${inputMethod === 'manual' ? 'hand-pointer' : 'robot'}"></i>
        <strong>ملاحظة:</strong> 
        ${inputMethod === 'manual' 
            ? 'تم إدخال المواد المساعدة يدوياً بواسطة المستخدم.' 
            : 'تم اختيار المواد المساعدة آلياً بواسطة خوارزميات الذكاء الاصطناعي.'}
        <br>
        <small>جميع المواد مطابقة للمواصفات القياسية ${reference.toUpperCase()}.</small>
    `;
    
    document.querySelector('.formula-details').appendChild(noteElement);
}

// ===========================================
// دوال الحساب
// ===========================================

/**
 * حساب تكلفة المادة الفعالة
 */
function calculateActiveIngredientCost(name, amount) {
    const prices = {
        'paracetamol': 0.0005,  // دولار لكل ملجم
        'ibuprofen': 0.0008,
        'amoxicillin': 0.0012,
        'silver-iodide': 0.002,
        'titanium-dioxide': 0.0003,
        'vitamin-c': 0.0004,
        'sodium-hypochlorite': 0.0002
    };
    
    const unitPrice = prices[name] || 0.0006;
    const cost = unitPrice * amount;
    return `$${formatNumber(cost, 4)}`;
}

/**
 * حساب تكلفة المادة المساعدة
 */
function calculateExcipientCost(name, type) {
    const costs = {
        'filler': {
            'lactose': 0.04,
            'mcc': 0.05,
            'starch': 0.02,
            'mannitol': 0.08,
            'default': 0.04
        },
        'binder': {
            'povidone': 0.03,
            'hpmc': 0.04,
            'default': 0.035
        },
        'disintegrant': {
            'croscarmellose': 0.04,
            'sodium-starch-glycolate': 0.02,
            'default': 0.03
        },
        'lubricant': {
            'magnesium-stearate': 0.01,
            'talc': 0.005,
            'default': 0.01
        },
        'sweetener': {
            'sucrose': 0.02,
            'default': 0.02
        },
        'preservative': {
            'methyl-paraben': 0.15,
            'default': 0.15
        },
        'solvent': {
            'glycerin': 0.03,
            'default': 0.03
        }
    };
    
    const category = costs[type] || { 'default': 0.05 };
    const cost = category[name] || category['default'];
    return `$${formatNumber(cost, 3)}`;
}

/**
 * حساب التكلفة الإجمالية
 */
function calculateTotalCost(activeIngredients, excipients) {
    let total = 0;
    
    // تكلفة المواد الفعالة (لكل 1000 وحدة)
    activeIngredients.forEach(ing => {
        const prices = {
            'paracetamol': 0.0005,
            'ibuprofen': 0.0008,
            'amoxicillin': 0.0012,
            'silver-iodide': 0.002,
            'titanium-dioxide': 0.0003,
            'vitamin-c': 0.0004,
            'sodium-hypochlorite': 0.0002
        };
        
        const unitPrice = prices[ing.name] || 0.0006;
        total += unitPrice * ing.amount * 1000; // لكل 1000 وحدة
    });
    
    // تكلفة المواد المساعدة (لكل 1000 وحدة)
    excipients.forEach(excipient => {
        const costs = {
            'filler': 0.04,
            'binder': 0.035,
            'disintegrant': 0.03,
            'lubricant': 0.01,
            'sweetener': 0.02,
            'preservative': 0.15,
            'solvent': 0.03
        };
        
        const unitCost = costs[excipient.function] || 0.03;
        total += unitCost * (excipient.percentage / 100) * 1000;
    });
    
    // إضافة هامش الربح (20%)
    total *= 1.2;
    
    return `$${formatNumber(total)} / لكل 1000 وحدة`;
}

// ===========================================
// دوال التصدير والحفظ
// ===========================================

/**
 * تصدير النتائج
 */
function exportResults() {
    if (!currentFormulaData) {
        showToast('لا توجد بيانات للتصدير', 'error');
        return;
    }
    
    try {
        const data = {
            ...currentFormulaData,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        // إنشاء محتوى الملف
        let content = `تقرير التركيبة الكيميائية\n`;
        content += `============================\n\n`;
        content += `اسم التركيبة: ${data.name}\n`;
        content += `المرجعية: ${data.reference.toUpperCase()}\n`;
        content += `شكل المنتج: ${data.form}\n`;
        content += `الهدف: ${data.goal}\n`;
        content += `التكلفة: ${data.totalCost}\n`;
        content += `تاريخ التصميم: ${new Date(data.date).toLocaleString('ar-SA')}\n\n`;
        
        content += `المواد الفعالة:\n`;
        content += `--------------\n`;
        data.activeIngredients.forEach(ing => {
            content += `• ${ing.displayName}: ${ing.amount} ${ing.unit}\n`;
        });
        
        content += `\nالمواد المساعدة:\n`;
        content += `---------------\n`;
        data.excipients.forEach(exc => {
            content += `• ${exc.displayName}: ${exc.percentage}% (${exc.functionText})\n`;
        });
        
        content += `\nمواصفات الجودة (${data.reference.toUpperCase()}):\n`;
        content += `--------------------------------\n`;
        
        // إنشاء ملف نصي
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `تركيبة_${data.name.replace(/[^\w\u0600-\u06FF]/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('تم تصدير النتائج بنجاح', 'success');
        
    } catch (error) {
        showToast('حدث خطأ أثناء التصدير: ' + error.message, 'error');
        console.error('Export error:', error);
    }
}

/**
 * حفظ التركيبة
 */
function saveFormula() {
    if (!currentFormulaData) {
        showToast('لا توجد بيانات للحفظ', 'error');
        return;
    }
    
    try {
        // في بيئة حقيقية، هنا يتم الإرسال للخادم
        // للمثال، سنستخدم localStorage
        const key = `formula_${Date.now()}`;
        localStorage.setItem(key, JSON.stringify(currentFormulaData));
        
        // حفظ في قائمة المحفوظات
        let savedFormulas = JSON.parse(localStorage.getItem('savedFormulas') || '[]');
        savedFormulas.push({
            id: key,
            name: currentFormulaData.name,
            date: currentFormulaData.date,
            cost: currentFormulaData.totalCost
        });
        localStorage.setItem('savedFormulas', JSON.stringify(savedFormulas));
        
        showToast('تم حفظ التركيبة بنجاح في قاعدة البيانات المحلية', 'success');
        
    } catch (error) {
        showToast('حدث خطأ أثناء الحفظ: ' + error.message, 'error');
        console.error('Save error:', error);
    }
}

// ===========================================
// معالجة الأحداث
// ===========================================

/**
 * تهيئة الصفحة
 */
function initializePage() {
    console.log('تهيئة برنامج تصميم التركيبة الكيميائية...');
    
    // إعداد حدث السلايدر
    const budgetSlider = document.getElementById('budget');
    const budgetValue = document.getElementById('budgetValue');
    
    if (budgetSlider && budgetValue) {
        budgetSlider.addEventListener('input', function() {
            budgetValue.textContent = this.value;
            budgetValue.classList.add('pulse');
            setTimeout(() => budgetValue.classList.remove('pulse'), 300);
        });
    }
    
    // إعداد أحداث المرجعية
    document.querySelectorAll('.reference-badge').forEach(badge => {
        badge.addEventListener('click', function() {
            const reference = this.getAttribute('data-reference');
            document.getElementById('reference').value = reference;
            currentReference = reference;
            
            document.querySelectorAll('.reference-badge').forEach(b => {
                b.classList.remove('active');
            });
            this.classList.add('active');
            
            showToast(`تم اختيار المرجعية: ${reference.toUpperCase()}`, 'info');
        });
    });
    
    // إعداد أحداث شكل المنتج
    document.querySelectorAll('.product-form-option').forEach(option => {
        option.addEventListener('click', function() {
            const form = this.getAttribute('data-form');
            document.getElementById('productForm').value = form;
            currentProductForm = form;
            
            // تحديث وحدة الوزن
            updateUnitLabels(form);
            
            // تحديث المظهر
            document.querySelectorAll('.product-form-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            this.classList.add('selected');
            
            // تحديث المقترحات الآلية
            updateAutoSuggestions();
            
            showToast(`تم اختيار شكل المنتج: ${form}`, 'info');
        });
    });
    
    // إعداد حدث المادة المخصصة
    const excipientNameSelect = document.getElementById('excipientName');
    const customNameField = document.getElementById('customExcipientName');
    
    if (excipientNameSelect && customNameField) {
        excipientNameSelect.addEventListener('change', function() {
            if (this.value === 'custom') {
                customNameField.style.display = 'block';
                customNameField.required = true;
                customNameField.focus();
            } else {
                customNameField.style.display = 'none';
                customNameField.required = false;
            }
        });
    }
    
    // إعداد أحداث الاختيار الآلي
    document.getElementById('costStrategy')?.addEventListener('change', updateAutoSuggestions);
    document.getElementById('productionStrategy')?.addEventListener('change', updateAutoSuggestions);
    document.getElementById('performancePriority')?.addEventListener('change', updateAutoSuggestions);
    
    // إعداد النموذج الرئيسي
    const formulaForm = document.getElementById('formulaForm');
    if (formulaForm) {
        formulaForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!validateForm()) return;
            
            // جمع البيانات
            const formulaName = document.getElementById('formulaName').value;
            const reference = document.getElementById('reference').value;
            const productForm = document.getElementById('productForm').value;
            const inputMethod = document.getElementById('inputMethod').value;
            const primaryGoal = document.getElementById('primaryGoal').value;
            const budget = document.getElementById('budget').value;
            const notes = document.getElementById('notes').value;
            const totalWeight = document.getElementById('totalWeight').value;
            
            // جمع المواد الفعالة
            const activeIngredients = getActiveIngredients();
            
            // الحصول على المواد المضافة
            const excipients = getExcipients();
            
            // توليد النتائج
            generateResults(formulaName, reference, productForm, primaryGoal, budget, activeIngredients, excipients, inputMethod);
        });
    }
    
    // إعداد أحداث الأمثلة
    document.querySelectorAll('.example-card').forEach(card => {
        card.addEventListener('click', function() {
            const example = this.getAttribute('data-example');
            loadExample(example);
        });
    });
    
    // تهيئة المقترحات الآلية
    updateAutoSuggestions();
    
    // ترحيب
    setTimeout(() => {
        showToast('مرحباً! 🧪 تم تحميل برنامج تصميم التركيبة الكيميائية', 'info', 2000);
    }, 1000);
}

/**
 * تحديث تسميات الوحدات
 */
function updateUnitLabels(form) {
    const unitLabel = document.getElementById('totalUnitLabel');
    const ingredientUnitLabels = document.querySelectorAll('.unit:not(#totalUnitLabel)');
    
    let unit = 'مجم';
    if (form === 'syrup') {
        unit = 'ملجم/مل';
    } else if (form === 'powder') {
        unit = 'جرام';
    }
    
    if (unitLabel) unitLabel.textContent = `${unit} (لكل وحدة)`;
    
    ingredientUnitLabels.forEach(label => {
        label.textContent = form === 'syrup' ? 'ملجم/مل' : form === 'powder' ? 'جرام' : 'مجم';
    });
}

/**
 * تحميل مثال
 */
function loadExample(example) {
    const formulaNameInput = document.getElementById('formulaName');
    const activeIngredientSelect = document.querySelector('.active-ingredient');
    const activeIngredientAmount = document.querySelector('.active-ingredient-amount');
    
    if (!formulaNameInput || !activeIngredientSelect || !activeIngredientAmount) {
        showToast('خطأ في تحميل العناصر', 'error');
        return;
    }
    
    switch(example) {
        case 'paracetamol':
            formulaNameInput.value = 'باراسيتامول 500 مجم - تركيز عالي';
            activeIngredientSelect.value = 'paracetamol';
            activeIngredientAmount.value = '500';
            document.querySelector('.reference-badge.bp').click();
            document.querySelector('.product-form-option[data-form="tablet-uncoated"]').click();
            selectInputMethod('auto');
            break;
            
        case 'cloud-seeding':
            formulaNameInput.value = 'محلول استمطار السحب اقتصادي';
            activeIngredientSelect.value = 'silver-iodide';
            activeIngredientAmount.value = '10';
            document.querySelector('.product-form-option[data-form="syrup"]').click();
            selectInputMethod('manual');
            break;
            
        case 'paint':
            formulaNameInput.value = 'دهان داخلي عالي الجودة';
            activeIngredientSelect.value = 'titanium-dioxide';
            activeIngredientAmount.value = '25';
            document.querySelector('.product-form-option[data-form="powder"]').click();
            selectInputMethod('auto');
            break;
    }
    
    showToast(`تم تحميل مثال: ${example}`, 'success');
}

// ===========================================
// تشغيل التطبيق
// ===========================================

// انتظار تحميل DOM
document.addEventListener('DOMContentLoaded', initializePage);

// تعريف الدوال للنقر المباشر
window.selectInputMethod = selectInputMethod;
window.addIngredientRow = addIngredientRow;
window.removeIngredientRow = removeIngredientRow;
window.addManualExcipient = addManualExcipient;
window.removeManualExcipient = removeManualExcipient;
window.clearManualExcipients = clearManualExcipients;
window.loadCommonFormulation = loadCommonFormulation;
window.regenerateAutoSuggestions = regenerateAutoSuggestions;
window.exportResults = exportResults;
window.saveFormula = saveFormula;
window.loadExample = loadExample;
// كود تشخيصي مؤقت
console.log("تم تحميل script.js بنجاح");
const testButton = document.getElementById('calculateBtn');
if(testButton) {
    console.log("تم العثور على زر الحساب");
    testButton.addEventListener('click', function() {
        console.log("تم النقر على زر التصميم!");
        alert("زر التصميم يعمل! الخطأ في دالة generateResults الداخلية.");
    });
} else {
    console.error("لم يتم العثور على زر الحساب بالمعرف calculateBtn");
}
console.log('برنامج تصميم التركيبة الكيميائية جاهز للاستخدام!');
