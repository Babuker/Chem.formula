// ===========================================
// Chemical Formula Optimizer - WORKING VERSION
// ===========================================

console.log('Chemical Formula Optimizer script loaded!');

// Global variables
let manualExcipients = [];
let currentInputMethod = 'auto';

// Toast notification function
function showToast(message, type = 'info') {
    // Remove existing toasts
    document.querySelectorAll('.toast').forEach(toast => toast.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas fa-info-circle"></i> ${message}`;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 50);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) toast.remove();
        }, 300);
    }, 3000);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing Chemical Formula Optimizer...');
    
    // Set up reference badges
    document.querySelectorAll('.reference-badge').forEach(badge => {
        badge.addEventListener('click', function() {
            document.querySelectorAll('.reference-badge').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            document.getElementById('reference').value = this.dataset.reference;
            showToast(`Reference set to ${this.dataset.reference.toUpperCase()}`, 'success');
        });
    });
    
    // Set up product form selection
    document.querySelectorAll('.product-form-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.product-form-option').forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            document.getElementById('productForm').value = this.dataset.form;
            showToast(`Product form: ${this.querySelector('div').textContent}`, 'info');
        });
    });
    
    // Set up budget slider
    const budgetSlider = document.getElementById('budget');
    const budgetValue = document.getElementById('budgetValue');
    if (budgetSlider && budgetValue) {
        budgetValue.textContent = budgetSlider.value;
        budgetSlider.addEventListener('input', function() {
            budgetValue.textContent = this.value;
        });
    }
    
    // Set up form submission
    const formulaForm = document.getElementById('formulaForm');
    if (formulaForm) {
        formulaForm.addEventListener('submit', function(event) {
            event.preventDefault();
            console.log('Form submitted - calculating results...');
            calculateFormula();
        });
    }
    
    // Initialize auto suggestions
    updateAutoSuggestions();
    
    console.log('Initialization complete!');
});

// Input method selection
function selectInputMethod(method) {
    currentInputMethod = method;
    document.getElementById('inputMethod').value = method;
    
    // Update UI
    const manualSection = document.getElementById('manualInputSection');
    const autoSection = document.getElementById('autoInput
