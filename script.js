// ===========================================
// script.js - الملف الكامل والصحيح
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
 */
function showToast(message, type = 'info', duration = 3000) {
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
}

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
 * تنسيق الأرقام مع فواصل
 */
function formatNumber(num, decimals = 2) {
    return parseFloat(num).toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// ===========================================
// معالجة المواد الفعالة
// ===========================================

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

function addIngredientRow() {
    const container = document.getElementById('activeIngredientsContainer');
    const rowCount = document.querySelectorAll('.ingredient-row').length;
    
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
            <input type="number" class="active-ingredient-amount" min="0.1" max="10000" step="0.1" placeholder
