const aiWeightInput = document.getElementById("aiWeight");
const totalWeightInput = document.getElementById("totalWeight");
const materialsTable = document.getElementById("materials");
const status = document.getElementById("status");
const modeRadios = document.querySelectorAll("input[name='mode']");

document.getElementById("addMaterial").onclick = () => {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td><input type="text" /></td>
    <td><input type="number" min="0" step="0.01" class="matWeight" /></td>
  `;
  materialsTable.appendChild(row);
};

function calculate() {
  const aiWeight = Number(aiWeightInput.value) || 0;
  let others = 0;

  document.querySelectorAll(".matWeight").forEach(i => {
    others += Number(i.value) || 0;
  });

  const mode = [...modeRadios].find(r => r.checked).value;

  if (mode === "manual") {
    const total = Number(totalWeightInput.value) || 0;

    if (aiWeight + others > total) {
      status.textContent = "❌ Error: weights exceed total unit weight";
      status.className = "error";
      return;
    }

    status.textContent =
      `✔ Remaining weight: ${(total - aiWeight - others).toFixed(2)} kg`;
    status.className = "ok";
  } else {
    const autoTotal = aiWeight + others;
    totalWeightInput.value = autoTotal.toFixed(2);
    totalWeightInput.disabled = true;

    status.textContent = `✔ Auto total weight: ${autoTotal.toFixed(2)} kg`;
    status.className = "ok";
  }
}

document.addEventListener("input", calculate);
modeRadios.forEach(r =>
  r.addEventListener("change", () => {
    totalWeightInput.disabled = r.value === "auto" && r.checked;
    calculate();
  })
);
