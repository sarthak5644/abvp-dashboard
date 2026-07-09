// ABVP special occasions — month/day keyed
const ABVP_SPECIAL_DAYS = [
  { month: 7,  day: 9,  en: "National Student Day",   hi: "राष्ट्रीय विद्यार्थी दिवस" },
  { month: 12, day: 6,  en: "Social Equality Day",     hi: "सामाजिक समता दिवस" },
  { month: 1,  day: 12, en: "National Youth Day",      hi: "राष्ट्रीय युवा दिवस" }
];

function getTodaysOccasion() {
  const today = new Date();
  const month = today.getMonth() + 1; // JS months are 0-indexed
  const day = today.getDate();

  return ABVP_SPECIAL_DAYS.find(d => d.month === month && d.day === day) || null;
}

function renderOccasionBanner() {
  const occasion = getTodaysOccasion();
  const banner = document.getElementById("occasionBanner");
  if (!banner) return;

  if (occasion) {
    banner.innerHTML = `🚩 Today is <strong>${occasion.en}</strong>
      <div class="hindi">${occasion.hi}</div>`;
    banner.classList.add("show");
  } else {
    banner.classList.remove("show");
  }
}