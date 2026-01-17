const dict = {
  en: { active:"Active Ingredient", total:"Total Unit Weight" },
  ar: { active:"المادة الفعالة", total:"الوزن الكلي للوحدة" }
};

function setLang(l) {
  document.documentElement.lang = l;
  document.body.dir = l === "ar" ? "rtl" : "ltr";
  document.querySelectorAll("[data-i18n]").forEach(e=>{
    e.textContent = dict[l][e.dataset.i18n];
  });
}
