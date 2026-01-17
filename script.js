// ===========================================
// script.js - الملف الكامل والصحيح
// ===========================================

// ===========================================
// المتغيرات العامة
// ===========================================
let manualExcipients = [];
let currentInputMethod = 'auto';
let currentReference = 'bp';
let currentProductForm = '';
let currentFormulaData = null;

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
            updateUnits();
        });
    });

    // الميزانية
    const budget = document.getElementById('budget');
    const budgetValue = document.getElementById('budgetValue');
    budgetValue.textContent = budget.value;
    budget.addEventListener('input', () => budgetValue.textContent = budget.value);
});

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
            <input type="number" class="active-ingredient-amount" min="0.1" step="0.1" required>
            <div class="unit" id="unitLabel">مجم</div>
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

    manualExcipients.push({
        id: Date.now(),
        name: nameSel.value,
        displayName: nameSel.options[nameSel.selectedIndex].text,
        function: funcSel.value,
        functionText: funcSel.options[funcSel.selectedIndex].text,
        percentage: perc
    });

    updateManualList();
}

function updateManualList() {
    const list = document.getElementById('manualExcipientsList');
    const count = document.getElementById('manualExcipientsCount');
    list.innerHTML = '';

    if (manualExcipients.length === 0) {
        list.innerHTML = `<div class="empty-list"><i class="fas fa-inbox"></i><p>لا توجد مواد</p></div>`;
        count.textContent = '(0 مادة)';
        return;
    }

    manualExcipients.forEach(e => {
        list.innerHTML += `
            <div class="manual-excipient-item">
                <strong>${e.displayName}</strong>
                <span>${e.percentage}% - ${e.functionText}</span>
                <button onclick="removeManualExcipient(${e.id})">×</button>
            </div>
        `;
    });

    count.textContent = `(${manualExcipients.length} مادة)`;
}

function removeManualExcipient(id) {
    manualExcipients = manualExcipients.filter(e => e.id !== id);
    updateManualList();
}

function clearManualExcipients() {
    manualExcipients = [];
    updateManualList();
}

// ===========================================
// المواد المساعدة (آلي)
// ===========================================
function generateAutoExcipients() {
    if (currentProductForm.includes('tablet')) {
        return [
            { displayName: 'MCC', functionText: 'مادة مالئة', percentage: 30 },
            { displayName: 'Povidone', functionText: 'رابطة',
function validateTotalPercentage(items) {
  const total = items.reduce((s, i) => s + i.percentage, 0);
  return Math.round(total * 100) / 100;
}
if (validateTotalPercentage(excipients) !== 100) {
  showToast("Total percentage must equal 100%", "error");
  return;
}
function renderPieChart(data) {
  new Chart(document.getElementById("formulaChart"), {
    type: "pie",
    data: {
      labels: data.map(d => d.name),
      datasets: [{
        data: data.map(d => d.percentage)
      }]
    }
  });
}
function exportResults() {
  html2pdf().from(document.getElementById("resultsContent")).set({
    filename: "Chemical_Formula_Report_v1.0.pdf",
    html2canvas: { scale: 2 },
    jsPDF: { format: "a4" }
  }).save();
}
