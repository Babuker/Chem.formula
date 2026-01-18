class PharmaEngine {
    constructor() { this.db = window.chemicalDatabase; }

    generateFormulation(apiId, targetWeight) {
        const api = this.db.apis[apiId];
        let formulation = [{ name: api.name, amount: api.standardWeight, role: "Active (API)" }];
        let currentTotal = api.standardWeight;

        api.suggestedExcipients.forEach(exName => {
            const info = this.db.excipients[exName];
            let amount = 0;
            if (info.function === "Lubricant") amount = targetWeight * 0.01;
            else if (info.function === "Binder") amount = targetWeight * 0.04;
            else amount = targetWeight - currentTotal - (targetWeight * 0.05); // الحشو

            if (amount > 0) {
                formulation.push({ name: exName, amount: amount.toFixed(1), role: info.function });
                currentTotal += amount;
            }
        });
        return formulation;
    }
}

document.getElementById('pharmaForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const engine = new PharmaEngine();
    const apiId = document.getElementById('apiName').value;
    const targetW = document.getElementById('targetWeight').value;
    const batchSize = document.getElementById('batchSize').value;

    const formulation = engine.generateFormulation(apiId, targetW);
    renderResults(formulation, batchSize, apiId);
});

function renderResults(formulation, batchSize, apiId) {
    const apiInfo = window.chemicalDatabase.apis[apiId];
    let totalBatchCost = 0;
    
    let rows = formulation.map(item => {
        const pricePerKg = window.chemicalDatabase.prices[item.name] || 0;
        const qtyPerBatchKg = (item.amount * batchSize) / 1000000;
        const itemCost = qtyPerBatchKg * pricePerKg;
        totalBatchCost += itemCost;

        return `<tr><td>${item.name}</td><td>${item.amount} mg</td><td>${qtyPerBatchKg.toFixed(3)} kg</td><td>${itemCost.toFixed(2)} $</td></tr>`;
    }).join('');

    document.getElementById('resultsContent').style.display = 'block';
    document.getElementById('resultOutput').innerHTML = `
        <h3><span class="status-badge">مكتمل التحليل</span> نتائج التركيبة</h3>
        <p><strong>تحذير التوافق:</strong> ${apiInfo.incompatibilities.join(', ')}</p>
        <table class="pharma-table">
            <thead><tr><th>المادة</th><th>للقرص</th><th>للتشغيلة</th><th>التكلفة</th></tr></thead>
            <tbody>${rows}</tbody>
            <tfoot><tr style="font-weight:bold; background:#eee"><td colspan="3">إجمالي تكلفة التشغيلة</td><td>${totalBatchCost.toFixed(2)} $</td></tr></tfoot>
        </table>`;
}
