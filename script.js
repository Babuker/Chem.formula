const aiWeight = document.getElementById("aiWeight");
const aiName = document.getElementById("aiName");
const totalWeight = document.getElementById("totalWeight");
const materials = document.getElementById("materials");
const status = document.getElementById("status");
const modes = document.querySelectorAll("input[name='mode']");

let chart;

document.getElementById("addMaterial").onclick = () => {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td><input></td>
    <td><input type="number" step="0.01" class="mw"></td>`;
  materials.appendChild(tr);
};

function calculate() {
  const ai = Number(aiWeight.value) || 0;
  let others = 0;
  document.querySelectorAll(".mw").forEach(i => others += Number(i.value) || 0);

  const mode = [...modes].find(r => r.checked).value;

  if (mode === "manual") {
    const total = Number(totalWeight.value) || 0;
    if (ai + others > total) {
      status.textContent = "❌ Invalid formulation";
      return;
    }
    status.textContent = `✔ Remaining: ${(total - ai - others).toFixed(2)} kg`;
  } else {
    totalWeight.value = (ai + others).toFixed(2);
    totalWeight.disabled = true;
    status.textContent = "✔ Auto calculation applied";
  }

  drawChart();
}

function drawChart() {
  const labels = [aiName.value || "Active Ingredient"];
  const data = [Number(aiWeight.value) || 0];

  document.querySelectorAll("#materials tr").forEach(r => {
    const i = r.querySelectorAll("input");
    labels.push(i[0].value || "Material");
    data.push(Number(i[1].value) || 0);
  });

  if (chart) chart.destroy();
  chart = new Chart(document.getElementById("chart"), {
    type: "pie",
    data: { labels, datasets: [{ data }] }
  });
}

document.addEventListener("input", calculate);

// PDF Export
document.getElementById("exportPDF").onclick = () => {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();
  pdf.text("ChemFormula™ – Official Report", 10, 15);
  pdf.text(`Active Ingredient: ${aiName.value}`, 10, 30);
  pdf.text(`Weight: ${aiWeight.value} kg`, 10, 40);
  pdf.text(`Total Weight: ${totalWeight.value} kg`, 10, 50);
  pdf.text("Disclaimer: For professional use only.", 10, 80);
  pdf.save("ChemFormula_Report.pdf");
};
