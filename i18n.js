let currentLang = "en";

async function loadLanguage(lang) {
  const res = await fetch(`lang/${lang}.json`);
  const data = await res.json();

  document.querySelectorAll("[data-i18n]").forEach(el => {
    el.textContent = data[el.dataset.i18n];
  });

  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  currentLang = lang;
}
