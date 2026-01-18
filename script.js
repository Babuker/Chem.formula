// script.js - منطق برنامج تصميم التركيبة الكيميائية

document.addEventListener('DOMContentLoaded', () => {
    const formulaForm = document.getElementById('formulaForm');
    const resultsPlaceholder = document.getElementById('resultsPlaceholder');
    const resultsContent = document.getElementById('resultsContent');

    // 1. التعامل مع اختيار "شكل المنتج"
    const productOptions = document.querySelectorAll('.product-form-option');
    productOptions.forEach(option => {
        option.addEventListener('click', function() {
            productOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            document.getElementById('productForm').value = this.dataset.form;
        });
    });

    // 2. وظيفة إضافة صف مادة فعالة جديدة
    window.addIngredientRow = function() {
        const container = document.getElementById('activeIngredientsContainer');
        const newRow = document.createElement('div');
        newRow.className = 'ingredient-row';
        newRow.innerHTML = `
            <select class="active-ingredient" required>
                <option value="">اختر المادة الفعالة...</option>
                <option value="paracetamol">باراسيتامول</option>
                <option value="ibuprofen">آيبوبروفين</option>
                <option value="custom">مادة مخصصة...</option>
            </select>
            <div class="input-with-unit">
                <input type="number" class="active-ingredient-amount" value="500" required>
                <div class="unit">مجم</div>
            </div>
            <button type="button" class="remove-ingredient" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        container.appendChild(newRow);
    };

    // 3. منطق التبديل بين الإدخال اليدوي والآلي
    window.selectInputMethod = function(method) {
        const manualSection = document.getElementById('manualInputSection');
        const autoSection = document.getElementById('autoInputSection');
        const manualOpt = document.getElementById('manualOption');
        const autoOpt = document.getElementById('autoOption');

        if (method === 'manual') {
            manualSection.style.display = 'block';
            autoSection.style.display = 'none';
            manualOpt.classList.add('selected');
            autoOpt.classList.remove('selected');
        } else {
            manualSection.style.display = 'none';
            autoSection.style.display = 'block';
            autoOpt.classList.add('selected');
            manualOpt.classList.remove('selected');
        }
        document.getElementById('inputMethod').value = method;
    };

    // 4. محاكاة حساب التركيبة المثالية عند إرسال النموذج
    formulaForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // إظهار قسم النتائج وإخفاء الرسالة الترحيبية
        resultsPlaceholder.style.display = 'none';
        resultsContent.style.display = 'block';

        // تحديث البيانات الأساسية في الواجهة
        document.getElementById('formulaNameDisplay').innerText = document.getElementById('formulaName').value;
        document.getElementById('designDate').innerText = new Date().toLocaleDateString('ar-EG');
        
        const reference = document.getElementById('reference').value;
        const refBadge = document.getElementById('referenceBadge');
        refBadge.innerText = reference.toUpperCase();
        refBadge.className = `meta-badge reference ${reference}`;

        // توليد جدول افتراضي للمكونات (يمكنك ربطه بقاعدة بيانات لاحقاً)
        const tableBody = document.querySelector('#formulaTable tbody');
        tableBody.innerHTML = `
            <tr>
                <td>المادة الفعالة المختار</td>
                <td>500 مجم</td>
                <td>مادة فعالة</td>
                <td>$0.25</td>
                <td>USP/BP</td>
            </tr>
            <tr class="total-row">
                <td>الإجمالي</td>
                <td>100%</td>
                <td>-</td>
                <td>$0.42</td>
                <td>-</td>
            </tr>
        `;

        // التمرير التلقائي للنتائج
        resultsContent.scrollIntoView({ behavior: 'smooth' });
    });
});
