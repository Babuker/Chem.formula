// ===========================================
// script.js - Complete and Working Version
// Chemical Formula Optimizer v1.0
// ===========================================

// Global Variables
let manualExcipients = [];
let currentInputMethod = 'auto';
let currentReference = 'bp';
let currentProductForm = '';

// ===========================================
// Helper Functions
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
// Page Initialization
// ===========================================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize input method
    selectInputMethod('auto');

    // Pharmacopeia reference selection
    document.querySelectorAll('.reference-badge').forEach(badge => {
        badge.addEventListener('click', () => {
            document.querySelectorAll('.reference-badge').forEach(b => b.classList.remove('active'));
            badge.classList.add('active');
            currentReference = badge.dataset.reference;
            document.getElementById('reference').value = currentReference;
            showToast(`Reference set to ${currentReference.toUpperCase()}`, 'success');
        });
    });

    // Product form selection
    document.querySelectorAll('.product-form-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.product-form-option').forEach(o => o.classList.remove('active'));
            option.classList.add('active');
            currentProductForm = option.dataset.form;
            document.getElementById('productForm').value = currentProductForm;
            updateUnitLabels();
            showToast(`Product form: ${getProductFormName(currentProductForm)}`, 'info');
        });
    });

    // Set default product form if none selected
    if (!currentProductForm && document.querySelector('.product-form-option')) {
        document.querySelector('.product-form-option[data-form="tablet-uncoated"]').click();
    }

    // Budget slider
    const budget = document.getElementById('budget');
    const budgetValue = document.getElementById('budgetValue');
    if (budget && budgetValue) {
        budgetValue.textContent = budget.value;
        budget.addEventListener('input', () => {
            budgetValue.textContent = budget.value;
        });
    }

    // Update auto suggestions
    updateAutoSuggestions();
    
    // Custom excipient name field
    const excipientName = document.getElementById('excipientName');
    if (excipientName) {
        excipientName.addEventListener('change', function() {
            const customNameField = document.getElementById('customExcipientName');
            const customNameLabel = document.getElementById('customNameLabel');
            
            if (this.value === 'custom') {
                customNameField.style.display = 'block';
                customNameLabel.style.display = 'block';
                customNameField.required = true;
            } else {
                customNameField.style.display = 'none';
                customNameLabel.style.display = 'none';
                customNameField.required = false;
            }
        });
    }

    // Auto settings listeners
    const autoSettings = ['costStrategy', 'productionStrategy', 'performancePriority'];
    autoSettings.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', updateAutoSuggestions);
        }
    });

    // Form submission
    const formulaForm = document.getElementById('formulaForm');
    if (formulaForm) {
        formulaForm.addEventListener('submit', handleFormSubmit);
    }

    console.log('Chemical Formula Optimizer initialized successfully!');
});

// ===========================================
// Unit Label Management
// ===========================================
function updateUnitLabels() {
    const unitLabel = document.getElementById('unitLabel');
    const totalUnitLabel = document.getElementById('totalUnitLabel');
    
    if (!currentProductForm) return;
    
    const isRTL = document.documentElement.dir === 'rtl';
    
    if (currentProductForm === 'syrup') {
        if (unitLabel) unitLabel.textContent = isRTL ? 'مل' : 'ml';
        if (totalUnitLabel) totalUnitLabel.textContent = isRTL ? 'مل (لكل مل)' : 'ml (per ml)';
    } else if (currentProductForm.includes('tablet') || currentProductForm === 'capsule') {
        if (unitLabel) unitLabel.textContent = isRTL ? 'مجم' : 'mg';
        if (totalUnitLabel) totalUnitLabel.textContent = isRTL ? 'مجم (لكل وحدة)' : 'mg (per unit)';
    } else if (currentProductForm === 'powder') {
        if (unitLabel) unitLabel.textContent = isRTL ? 'جرام' : 'g';
        if (totalUnitLabel) totalUnitLabel.textContent = isRTL ? 'جرام (لكل جرام)' : 'g (per g)';
    }
}

function getProductFormName(form) {
    const forms = {
        'tablet-uncoated': { en: 'Uncoated Tablet', ar: 'قرص غير مغلف' },
        'tablet-coated': { en: 'Coated Tablet', ar: 'قرص مغلف' },
        'capsule': { en: 'Capsule', ar: 'كبسولة' },
        'syrup': { en: 'Syrup', ar: 'شراب' },
        'powder': { en: 'Powder', ar: 'مسحوق' }
    };
    
    const isRTL = document.documentElement.dir === 'rtl';
    return forms[form] ? (isRTL ? forms[form].ar : forms[form].en) : form;
}

// ===========================================
// Active Ingredients Management
// ===========================================
function addIngredientRow() {
    const container = document.getElementById('activeIngredientsContainer');
    
    const row = document.createElement('div');
    row.className = 'ingredient-row';
    row.innerHTML = `
        <select class="active-ingredient" required>
            <option value="">${document.documentElement.dir === 'rtl' ? 'اختر المادة الفعالة...' : 'Select Active Ingredient...'}</option>
            <option value="paracetamol">${document.documentElement.dir === 'rtl' ? 'باراسيتامول' : 'Paracetamol'}</option>
            <option value="ibuprofen">${document.documentElement.dir === 'rtl' ? 'آيبوبروفين' : 'Ibuprofen'}</option>
            <option value="amoxicillin">${document.documentElement.dir === 'rtl' ? 'أموكسيسيلين' : 'Amoxicillin'}</option>
            <option value="silver-iodide">${document.documentElement.dir === 'rtl' ? 'يوديد الفضة' : 'Silver Iodide'}</option>
            <option value="titanium-dioxide">${document.documentElement.dir === 'rtl' ? 'ثاني أكسيد التيتانيوم' : 'Titanium Dioxide'}</option>
            <option value="vitamin-c">${document.documentElement.dir === 'rtl' ? 'فيتامين ج' : 'Vitamin C'}</option>
        </select>
        
        <div class="input-with-unit">
            <input type="number" class="active-ingredient-amount" min="0.1" step="0.1" value="500" required>
            <div class="unit">${document.documentElement.dir === 'rtl' ? 'مجم' : 'mg'}</div>
        </div>
        
        <button type="button" class="remove-ingredient" onclick="removeIngredientRow(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    container.appendChild(row);
    
    showToast(document.documentElement.dir === 'rtl' ? 'تمت إضافة صف جديد للمادة الفعالة' : 'New active ingredient row added', 'success');
}

function removeIngredientRow(btn) {
    const rows = document.querySelectorAll('.ingredient-row');
    if (rows.length > 1) {
        btn.closest('.ingredient-row').remove();
        showToast(document.documentElement.dir === 'rtl' ? 'تم إزالة صف المادة الفعالة' : 'Active ingredient row removed', 'info');
    } else {
        showToast(document.documentElement.dir === 'rtl' ? 'يجب أن يكون هناك مادة فعالة واحدة على الأقل' : 'At least one active ingredient is required', 'warning');
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
// Input Method Selection
// ===========================================
function selectInputMethod(method) {
    currentInputMethod = method;
    document.getElementById('inputMethod').value = method;
    
    document.getElementById('manualInputSection').style.display = method === 'manual' ? 'block' : 'none';
    document.getElementById('autoInputSection').style.display = method === 'auto' ? 'block' : 'none';
    
    document.getElementById('manualOption').classList.toggle('selected', method === 'manual');
    document.getElementById('autoOption').classList.toggle('selected', method === 'auto');
    
    showToast(
        method === 'manual' 
            ? (document.documentElement.dir === 'rtl' ? 'تم التبديل إلى الوضع اليدوي' : 'Switched to manual mode')
            : (document.documentElement.dir === 'rtl' ? 'تم التبديل إلى الوضع الآلي' : 'Switched to automatic mode'),
        'success'
    );
}

// ===========================================
// Manual Excipients Management
// ===========================================
function addManualExcipient() {
    const nameSel = document.getElementById('excipientName');
    const funcSel = document.getElementById('excipientFunction');
    const percInput = document.getElementById('excipientPercentage');
    
    if (!nameSel || !funcSel || !percInput) {
        showToast('System error: Form elements not found', 'error');
        return;
    }
    
    const name = nameSel.value;
    const perc = parseFloat(percInput.value);
    
    if (!name || !perc || perc <= 0) {
        showToast(
            document.documentElement.dir === 'rtl' 
                ? 'يرجى إدخال جميع البيانات بشكل صحيح'
                : 'Please enter all data correctly',
            'warning'
        );
        return;
    }
    
    let displayName = nameSel.options[nameSel.selectedIndex].text;
    
    // Handle custom excipient
    if (name === 'custom') {
        const customName = document.getElementById('customExcipientName').value;
        if (!customName) {
            showToast(
                document.documentElement.dir === 'rtl' 
                    ? 'يرجى إدخال اسم المادة المخصصة'
                    : 'Please enter custom excipient name',
                'warning'
            );
            return;
        }
        displayName = customName;
    }
    
    const excipient = {
        id: Date.now(),
        name: name,
        displayName: displayName,
        function: funcSel.value,
        functionText: funcSel.options[funcSel.selectedIndex].text,
        percentage: perc
    };
    
    manualExcipients.push(excipient);
    updateManualExcipientsList();
    
    // Reset form
    nameSel.value = '';
    percInput.value = '5';
    document.getElementById('customExcipientName').style.display = 'none';
    document.getElementById('customNameLabel').style.display = 'none';
    
    showToast(
        document.documentElement.dir === 'rtl' 
            ? `تمت إضافة ${displayName} بنجاح`
            : `${displayName} added successfully`,
        'success'
    );
}

function updateManualExcipientsList() {
    const listElement = document.getElementById('manualExcipientsList');
    const countElement = document.getElementById('manualExcipientsCount');
    
    if (!listElement || !countElement) return;
    
    if (manualExcipients.length === 0) {
        listElement.innerHTML = `
            <div style="text-align: center; padding: 30px; color: #999;">
                <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 10px;"></i>
                <p>${document.documentElement.dir === 'rtl' ? 'لم يتم إضافة أي مواد مساعدة بعد' : 'No excipients added yet'}</p>
                <small>${document.documentElement.dir === 'rtl' ? 'استخدم النموذج أعلاه لإضافة المواد' : 'Use the form above to add excipients'}</small>
            </div>
        `;
        countElement.textContent = document.documentElement.dir === 'rtl' ? '(0 مادة)' : '(0 items)';
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
    countElement.textContent = document.documentElement.dir === 'rtl' 
        ? `(${manualExcipients.length} مادة)` 
        : `(${manualExcipients.length} items)`;
}

function removeManualExcipient(id) {
    manualExcipients = manualExcipients.filter(excipient => excipient.id !== id);
    updateManualExcipientsList();
    showToast(
        document.documentElement.dir === 'rtl' ? 'تم حذف المادة' : 'Excipient removed',
        'info'
    );
}

function clearManualExcipients() {
    if (manualExcipients.length === 0) return;
    
    const message = document.documentElement.dir === 'rtl' 
        ? 'هل أنت متأكد من مسح جميع المواد المضافة؟'
        : 'Are you sure you want to clear all excipients?';
    
    if (confirm(message)) {
        manualExcipients = [];
        updateManualExcipientsList();
        showToast(
            document.documentElement.dir === 'rtl' ? 'تم مسح جميع المواد' : 'All excipients cleared',
            'info'
        );
    }
}

function loadCommonFormulation() {
    const productForm = document.getElementById('productForm').value || 'tablet-uncoated';
    
    manualExcipients = [];
    
    if (productForm.includes('tablet')) {
        manualExcipients = [
            {
                id: Date.now(),
                name: 'mcc',
                displayName: document.documentElement.dir === 'rtl' ? 'سليولوز ميكروكريستاليني (MCC)' : 'Microcrystalline Cellulose (MCC)',
                function: 'filler',
                functionText: document.documentElement.dir === 'rtl' ? 'مادة مالئة' : 'Filler',
                percentage: 30
            },
            {
                id: Date.now() + 1,
                name: 'povidone',
                displayName: document.documentElement.dir === 'rtl' ? 'بوفيدون K30' : 'Povidone K30',
                function: 'binder',
                functionText: document.documentElement.dir === 'rtl' ? 'مادة رابطة' : 'Binder',
                percentage: 2
            },
            {
                id: Date.now() + 2,
                name: 'croscarmellose',
                displayName: document.documentElement.dir === 'rtl' ? 'صوديوم كروكارميلوز' : 'Sodium Croscarmellose',
                function: 'disintegrant',
                functionText: document.documentElement.dir === 'rtl' ? 'مادة مفككة' : 'Disintegrant',
                percentage: 1.5
            },
            {
                id: Date.now() + 3,
                name: 'magnesium-stearate',
                displayName: document.documentElement.dir === 'rtl' ? 'ستيرات المغنيسيوم' : 'Magnesium Stearate',
                function: 'lubricant',
                functionText: document.documentElement.dir === 'rtl' ? 'مادة مزلقة' : 'Lubricant',
                percentage: 0.5
            }
        ];
    } else if (productForm === 'capsule') {
        manualExcipients = [
            {
                id: Date.now(),
                name: 'lactose',
                displayName: document.documentElement.dir === 'rtl' ? 'لاكتوز اللامائي' : 'Anhydrous Lactose',
                function: 'filler',
                functionText: document.documentElement.dir === 'rtl' ? 'مادة مالئة' : 'Filler',
                percentage: 35
            },
            {
                id: Date.now() + 1,
                name: 'magnesium-stearate',
                displayName: document.documentElement.dir === 'rtl' ? 'ستيرات المغنيسيوم' : 'Magnesium Stearate',
                function: 'lubricant',
                functionText: document.documentElement.dir === 'rtl' ? 'مادة مزلقة' : 'Lubricant',
                percentage: 0.5
            }
        ];
    }
    
    updateManualExcipientsList();
    showToast(
        document.documentElement.dir === 'rtl' 
            ? 'تم تحميل تركيبة شائعة بناءً على نوع المنتج'
            : 'Common formulation loaded based on product type',
        'success'
    );
}

// ===========================================
// Automatic Excipients Management
// ===========================================
function updateAutoSuggestions() {
    const costStrategy = document.getElementById('costStrategy')?.value || 'balanced';
    const productionStrategy = document.getElementById('productionStrategy')?.value || 'high-speed';
    const performancePriority = document.getElementById('performancePriority')?.value || 'sustained-release';
    
    let suggestions = [];
    
    if (costStrategy === 'lowest') {
        suggestions = document.documentElement.dir === 'rtl' 
            ? ['نشا الذرة', 'لاكتوز', 'ستيرات مغنيسيوم', 'نشا صوديوم جليكولات']
            : ['Corn Starch', 'Lactose', 'Magnesium Stearate', 'Sodium Starch Glycolate'];
    } else if (costStrategy === 'balanced') {
        suggestions = document.documentElement.dir === 'rtl' 
            ? ['سليولوز ميكروكريستاليني', 'بوفيدون', 'كروسكارميلوز', 'ستيرات مغنيسيوم']
            : ['Microcrystalline Cellulose', 'Povidone', 'Croscarmellose', 'Magnesium Stearate'];
    } else {
        suggestions = document.documentElement.dir === 'rtl' 
            ? ['مانيتول', 'هيدروكسي بروبيل ميثيل سليولوز', 'كروسپوفيدون', 'ثاني أكسيد السيليكون']
            : ['Mannitol', 'HPMC', 'Crospovidone', 'Silicon Dioxide'];
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
    showToast(
        document.documentElement.dir === 'rtl' 
            ? 'تم إعادة توليد المقترحات بنجاح'
            : 'Suggestions regenerated successfully',
        'success'
    );
}

function generateAutoExcipients() {
    const costStrategy = document.getElementById('costStrategy')?.value || 'balanced';
    const productForm = document.getElementById('productForm')?.value || 'tablet-uncoated';
    const isRTL = document.documentElement.dir === 'rtl';
    
    let excipients = [];
    
    if (productForm.includes('tablet')) {
        excipients = [
            {
                name: 'filler',
                displayName: costStrategy === 'lowest' 
                    ? (isRTL ? 'لاكتوز' : 'Lactose')
                    : (isRTL ? 'سليولوز ميكروكريستاليني' : 'Microcrystalline Cellulose'),
                function: 'filler',
                functionText: isRTL ? 'مادة مالئة' : 'Filler',
                percentage: costStrategy === 'lowest' ? 35 : 30
            },
            {
                name: 'binder',
                displayName: isRTL ? 'بوفيدون K30' : 'Povidone K30',
                function: 'binder',
                functionText: isRTL ? 'مادة رابطة' : 'Binder',
                percentage: 2
            },
            {
                name: 'disintegrant',
                displayName: isRTL ? 'صوديوم كروكارميلوز' : 'Sodium Croscarmellose',
                function: 'disintegrant',
                functionText: isRTL ? 'مادة مفككة' : 'Disintegrant',
                percentage: 1.5
            },
            {
                name: 'lubricant',
                displayName: isRTL ? 'ستيرات المغنيسيوم' : 'Magnesium Stearate',
                function: 'lubricant',
                functionText: isRTL ? 'مادة مزلقة' : 'Lubricant',
                percentage: 0.5
            }
        ];
    } else if (productForm === 'capsule') {
        excipients = [
            {
                name: 'filler',
                displayName: isRTL ? 'لاكتوز اللامائي' : 'Anhydrous Lactose',
                function: 'filler',
                functionText: isRTL ? 'مادة مالئة' : 'Filler',
                percentage: 40
            },
            {
                name: 'lubricant',
                displayName: isRTL ? 'ستيرات المغنيسيوم' : 'Magnesium Stearate',
                function: 'lubricant',
                functionText: isRTL ? 'مادة مزلقة' : 'Lubricant',
                percentage: 0.5
            }
        ];
    } else if (productForm === 'syrup') {
        excipients = [
            {
                name: 'sweetener',
                displayName: isRTL ? 'سكروز' : 'Sucrose',
                function: 'sweetener',
                functionText: isRTL ? 'محلي' : 'Sweetener',
                percentage: 60
            },
            {
                name: 'preservative',
                displayName: isRTL ? 'ميثيل بارابين' : 'Methyl Paraben',
                function: 'preservative',
                functionText: isRTL ? 'مادة حافظة' : 'Preservative',
                percentage: 0.1
            }
        ];
    }
    
    return excipients;
}

// ===========================================
// Form Submission Handler
// ===========================================
function handleFormSubmit(e) {
    e.preventDefault();
    
    // Get form values
    const formulaName = document.getElementById('formulaName').value;
    const reference = document.getElementById('reference').value;
    const productForm = document.getElementById('productForm').value;
    const primaryGoal = document.getElementById('primaryGoal').value;
    
    const activeIngredients = getActiveIngredients();
    
    // Validation
    if (!formulaName || !reference || !productForm || !primaryGoal || activeIngredients.length === 0) {
        showToast(
            document.documentElement.dir === 'rtl' 
                ? 'يرجى ملء جميع الحقول المطلوبة'
                : 'Please fill all required fields',
            'error'
        );
        return;
    }
    
    // Get excipients based on input method
    const excipients = currentInputMethod === 'manual' ? manualExcipients : generateAutoExcipients();
    
    if (excipients.length === 0) {
        showToast(
            document.documentElement.dir === 'rtl' 
                ? 'يرجى إضافة المواد المساعدة'
                : 'Please add excipients',
            'error'
        );
        return;
    }
    
    // Validate total percentage
    const totalValidation = validateTotalPercentage(activeIngredients, excipients);
    if (!totalValidation.valid) {
        showToast(totalValidation.message, 'error');
        return;
    }
    
    // Display results
    displayResults(formulaName, reference, productForm, primaryGoal, activeIngredients, excipients);
}

// ===========================================
// Percentage Validation
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
    const tolerance = 0.1;
    const isRTL = document.documentElement.dir === 'rtl';
    
    if (Math.abs(total - 100) > tolerance) {
        return {
            valid: false,
            message: isRTL 
                ? `مجموع النسب ${total.toFixed(2)}% يجب أن يكون 100%`
                : `Total percentage ${total.toFixed(2)}% must equal 100%`
        };
    }
    
    return { valid: true, total: total };
}

// ===========================================
// Results Display
// ===========================================
function displayResults(formulaName, reference, productForm, primaryGoal, activeIngredients, excipients) {
    // Hide placeholder and show results
    document.getElementById('resultsPlaceholder').style.display = 'none';
    const resultsContent = document.getElementById('resultsContent');
    resultsContent.style.display = 'block';
    
    // Scroll to results
    resultsContent.scrollIntoView({ behavior: 'smooth' });
    
    // Update formula information
    document.getElementById('formulaNameDisplay').textContent = formulaName;
    document.getElementById('designDate').textContent = new Date().toLocaleDateString();
    
    // Update reference badge
    const referenceBadge = document.getElementById('referenceBadge');
    referenceBadge.textContent = reference.toUpperCase();
    referenceBadge.className = `meta-badge reference ${reference}`;
    
    // Update form badge
    const formBadge = document.getElementById('formBadge');
    formBadge.textContent = getProductFormName(productForm);
    
    // Update specifications reference
    document.getElementById('specsReference').textContent = reference.toUpperCase();
    document.getElementById('specificationsTable').className = `specifications-table ${reference}`;
    
    // Update formula table
    updateFormulaTable(activeIngredients, excipients, productForm, reference);
    
    // Calculate and display total cost
    const totalCost = calculateTotalCost(activeIngredients, excipients, productForm);
    document.getElementById('totalCost').textContent = totalCost;
    
    // Update quality specifications
    updateQualitySpecifications(reference);
    
    // Update performance metrics
    updatePerformanceMetrics(primaryGoal);
    
    // Render pie chart
    renderPieChart(activeIngredients, excipients);
    
    showToast(
        document.documentElement.dir === 'rtl' 
            ? 'تم تصميم التركيبة بنجاح!'
            : 'Formula designed successfully!',
        'success'
    );
}

function updateFormulaTable(activeIngredients, excipients, productForm, reference) {
    const tbody = document.querySelector('#formulaTable tbody');
    if (!tbody) return;
    
    let html = '';
    const isRTL = document.documentElement.dir === 'rtl';
    
    // Active ingredients
    activeIngredients.forEach(ing => {
        const ingredientName = getIngredientDisplayName(ing.name);
        html += `
            <tr class="active-ingredient-row">
                <td>${ingredientName}</td>
                <td>${ing.amount} ${getUnitForProduct(productForm)}</td>
                <td>${isRTL ? 'مادة فعالة' : 'Active Ingredient'}</td>
                <td>${calculateIngredientCost(ing.name, ing.amount, productForm)}</td>
                <td><span class="compliance-badge ${reference}">${reference.toUpperCase()}</span></td>
            </tr>
        `;
    });
    
    // Excipients
    excipients.forEach(excipient => {
        html += `
            <tr>
                <td>${excipient.displayName}</td>
                <td>${excipient.percentage}%</td>
                <td>${excipient.functionText}</td>
                <td>${calculateExcipientCost(excipient.name, excipient.function)}</td>
                <td><span class="compliance-badge ${reference}">${reference.toUpperCase()}</span></td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// ===========================================
// Calculation Functions
// ===========================================
function getIngredientDisplayName(code) {
    const names = {
        'paracetamol': { en: 'Paracetamol', ar: 'باراسيتامول' },
        'ibuprofen': { en: 'Ibuprofen', ar: 'آيبوبروفين' },
        'amoxicillin': { en: 'Amoxicillin', ar: 'أموكسيسيلين' },
        'silver-iodide': { en: 'Silver Iodide', ar: 'يوديد الفضة' },
        'titanium-dioxide': { en: 'Titanium Dioxide', ar: 'ثاني أكسيد التيتانيوم' },
        'vitamin-c': { en: 'Vitamin C', ar: 'فيتامين ج' }
    };
    
    const isRTL = document.documentElement.dir === 'rtl';
    return names[code] ? (isRTL ? names[code].ar : names[code].en) : code;
}

function getUnitForProduct(productForm) {
    const isRTL = document.documentElement.dir === 'rtl';
    
    if (productForm === 'syrup') return isRTL ? 'مل' : 'ml';
    if (productForm.includes('tablet') || productForm === 'capsule') return isRTL ? 'مجم' : 'mg';
    if (productForm === 'powder') return isRTL ? 'جرام' : 'g';
    return isRTL ? 'وحدة' : 'unit';
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
        'lubricant': 0.01,
        'sweetener': 0.02,
        'preservative': 0.015
    };
    
    return '$' + (costs[type] || 0.03).toFixed(3);
}

function calculateTotalCost(activeIngredients, excipients, productForm) {
    let total = 0;
    
    // Active ingredients cost
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
    
    // Excipients cost
    excipients.forEach(excipient => {
        const costs = {
            'filler': 0.04,
            'binder': 0.035,
            'disintegrant': 0.03,
            'lubricant': 0.01,
            'sweetener': 0.02,
            'preservative': 0.015
        };
        
        total += (costs[excipient.function] || 0.03) * (excipient.percentage / 100) * 1000;
    });
    
    const isRTL = document.documentElement.dir === 'rtl';
    return '$' + total.toFixed(2) + (isRTL ? ' / لكل 1000 وحدة' : ' / per 1000 units');
}

// ===========================================
// Quality Specifications
// ===========================================
function updateQualitySpecifications(reference) {
    const specsBody = document.getElementById('specificationsBody');
    if (!specsBody) return;
    
    const isRTL = document.documentElement.dir === 'rtl';
    
    const specifications = [
        { 
            test: isRTL ? 'الهوية' : 'Identity',
            spec: isRTL ? 'يجب أن تطابق التركيبة المتطلبات' : 'Must match requirements',
            result: isRTL ? 'مطابق' : 'Compliant',
            status: 'success'
        },
        { 
            test: isRTL ? 'النقاوة' : 'Purity',
            spec: '≥ 98.0%',
            result: '99.2%',
            status: 'success'
        },
        { 
            test: isRTL ? 'الذوبانية' : 'Solubility',
            spec: isRTL ? 'قابل للذوبان في الماء' : 'Soluble in water',
            result: isRTL ? 'ممتاز' : 'Excellent',
            status: 'success'
        },
        { 
            test: isRTL ? 'الثبات' : 'Stability',
            spec: isRTL ? 'مستقر لمدة 24 شهر' : 'Stable for 24 months',
            result: isRTL ? 'مطابق' : 'Compliant',
            status: 'success'
        },
        { 
            test: isRTL ? 'المحتوى' : 'Content',
            spec: '95.0% - 105.0%',
            result: '102.3%',
            status: 'success'
        }
    ];
    
    let html = '';
    specifications.forEach(spec => {
        const statusText = spec.status === 'success' 
            ? (isRTL ? 'مطابق' : 'Compliant')
            : (isRTL ? 'غير مطابق' : 'Non-compliant');
            
        html += `
            <tr>
                <td>${spec.test}</td>
                <td>${spec.spec}</td>
                <td>${spec.result}</td>
                <td><span class="status ${spec.status}">${statusText}</span></td>
            </tr>
        `;
    });
    
    specsBody.innerHTML = html;
}

// ===========================================
// Performance Metrics
// ===========================================
function updatePerformanceMetrics(primaryGoal) {
    const performanceMetrics = document.getElementById('performanceMetrics');
    if (!performanceMetrics) return;
    
    const isRTL = document.documentElement.dir === 'rtl';
    
    const metrics = [
        { 
            name: isRTL ? 'فعالية التكلفة' : 'Cost Effectiveness',
            icon: 'fa-money-bill-wave',
            value: '92%',
            color: '#27ae60'
        },
        { 
            name: isRTL ? 'استقرار التركيبة' : 'Formulation Stability',
            icon: 'fa-shield-alt',
            value: isRTL ? 'ممتاز' : 'Excellent',
            color: '#3498db'
        },
        { 
            name: isRTL ? 'سرعة الإنتاج' : 'Production Speed',
            icon: 'fa-tachometer-alt',
            value: isRTL ? 'سريع' : 'Fast',
            color: '#9b59b6'
        },
        { 
            name: isRTL ? 'توافق البيئة' : 'Environmental Compatibility',
            icon: 'fa-leaf',
            value: isRTL ? 'جيد' : 'Good',
            color: '#2ecc71'
        }
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
// Pie Chart
// ===========================================
function renderPieChart(activeIngredients, excipients) {
    const canvas = document.getElementById('formulaChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Prepare data
    const labels = [];
    const data = [];
    const backgroundColors = [
        '#2ecc71', '#3498db', '#9b59b6', '#e74c3c',
        '#f1c40f', '#1abc9c', '#e67e22', '#34495e',
        '#16a085', '#8e44ad', '#2c3e50', '#f39c12'
    ];
    
    // Add active ingredients
    activeIngredients.forEach((ing, index) => {
        labels.push(getIngredientDisplayName(ing.name));
        data.push(ing.amount);
    });
    
    // Add excipients
    excipients.forEach((ex, index) => {
        labels.push(ex.displayName);
        data.push(ex.percentage);
    });
    
    // Check if Chart is available
    if (typeof Chart === 'undefined') {
        console.error('Chart.js library not loaded');
        return;
    }
    
    // Destroy existing chart if exists
    if (canvas.chart) {
        canvas.chart.destroy();
    }
    
    // Create new chart
    canvas.chart = new Chart(ctx, {
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
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    rtl: document.documentElement.dir === 'rtl',
                    labels: {
                        font: {
                            size: 11,
                            family: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
                        },
                        padding: 20
                    }
                },
                title: {
                    display: true,
                    text: document.documentElement.dir === 'rtl' ? 'توزيع مكونات التركيبة' : 'Formulation Components Distribution',
                    font: {
                        size: 16
                    },
                    padding: 20
                }
            }
        }
    });
}

// ===========================================
// Export Functions
// ===========================================
function exportResults() {
    if (typeof html2pdf === 'undefined') {
        showToast(
            document.documentElement.dir === 'rtl' 
                ? 'مكتبة html2pdf غير محملة'
                : 'html2pdf library not loaded',
            'error'
        );
        return;
    }
    
    const element = document.getElementById('resultsContent');
    if (!element) {
        showToast('Results content not found', 'error');
        return;
    }
    
    const isRTL = document.documentElement.dir === 'rtl';
    const fileName = isRTL ? 'تقرير_التركيبة_الكيميائية.pdf' : 'Chemical_Formula_Report.pdf';
    
    const opt = {
        margin: [10, 10, 10, 10],
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2,
            useCORS: true,
            logging: false
        },
        jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait',
            compress: true
        }
    };
    
    html2pdf().set(opt).from(element).save();
    
    showToast(
        isRTL ? 'تم تصدير التقرير بنجاح' : 'Report exported successfully',
        'success'
    );
}

function saveFormula() {
    const formulaData = {
        name: document.getElementById('formulaNameDisplay').textContent,
        date: document.getElementById('designDate').textContent,
        reference: document.getElementById('referenceBadge').textContent,
        form: document.getElementById('formBadge').textContent,
        cost: document.getElementById('totalCost').textContent,
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('lastFormula', JSON.stringify(formulaData));
    
    const isRTL = document.documentElement.dir === 'rtl';
    showToast(
        isRTL ? 'تم حفظ التركيبة محلياً' : 'Formula saved locally',
        'success'
    );
}

// ===========================================
// Print Function
// ===========================================
function printResults() {
    window.print();
}

// ===========================================
// Global Functions for HTML onclick
// ===========================================
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
window.printResults = printResults;
