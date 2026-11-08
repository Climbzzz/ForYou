// ------------------------------------------------------------------
// PASSWORD: leave this empty ("") until you're ready.
// While it's empty, the page stays locked and nobody can get in.
// When you're ready, put the code between the quotes, e.g. "MyCode".
// ------------------------------------------------------------------
const PROPOSAL_CODE = "onelastthing";

const ACCESS_KEY = "proposal-unlocked";

const accessGate = document.querySelector("#access-gate");
const accessForm = document.querySelector("#access-form");
const accessCode = document.querySelector("#access-code");
const accessError = document.querySelector("#access-error");
const content = document.querySelector("#proposal-content");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function showProposal() {
  accessGate.hidden = true;
  content.hidden = false;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    content.classList.add("is-visible");
    startHearts();
  }));
}

// Already unlocked this session (and the code hasn't changed)?
if (PROPOSAL_CODE !== "" && sessionStorage.getItem(ACCESS_KEY) === PROPOSAL_CODE) {
  showProposal();
}

accessForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (PROPOSAL_CODE === "") {
    accessError.textContent = "This page isn't open yet. Come back soon ♥";
    return;
  }

  if (accessCode.value.trim() !== PROPOSAL_CODE) {
    accessError.textContent = "That code doesn't look right. Try again.";
    accessCode.select();
    return;
  }

  sessionStorage.setItem(ACCESS_KEY, PROPOSAL_CODE);
  accessGate.classList.add("is-hiding");
  setTimeout(showProposal, prefersReducedMotion.matches ? 300 : 500);
});

// Floating hearts in the background.
let heartsStarted = false;
function startHearts() {
  const container = document.querySelector(".hearts");
  if (heartsStarted || !container || prefersReducedMotion.matches) return;
  heartsStarted = true;

  setInterval(() => {
    spawnHeart(container, Math.random() * 100 + "vw");
  }, 900);
}

function spawnHeart(container, left, size) {
  const heart = document.createElement("span");
  const duration = 8 + Math.random() * 6;
  heart.className = "heart";
  heart.textContent = "♥";
  heart.style.left = left;
  heart.style.fontSize = (size || 12 + Math.random() * 18) + "px";
  heart.style.animationDuration = duration + "s";
  container.appendChild(heart);
  setTimeout(() => heart.remove(), duration * 1000);
}

// "For the question" button: reveals the question and the Yes / No buttons.
const askButton = document.querySelector("#ask-button");
const questionReveal = document.querySelector("#question-reveal");

// (The if-check keeps the rest of the page working even if the button is missing from the HTML.)
if (askButton && questionReveal) {
  askButton.addEventListener("click", () => {
    askButton.hidden = true;
    questionReveal.hidden = false;

    // Fade the question in (a little slide up, unless reduced motion is on).
    questionReveal.animate(
      prefersReducedMotion.matches
        ? [{ opacity: 0 }, { opacity: 1 }]
        : [{ opacity: 0, transform: "translateY(16px)" }, { opacity: 1, transform: "translateY(0)" }],
      { duration: prefersReducedMotion.matches ? 300 : 800, easing: "ease" }
    );
  });
}

// The "No" button runs away, and "Yes" grows a little each time.
const yesButton = document.querySelector("#yes-button");
const noButton = document.querySelector("#no-button");
let dodges = 0;

function dodge(event) {
  if (event) event.preventDefault();
  dodges += 1;

  const x = (Math.random() - 0.5) * 220;
  const y = (Math.random() - 0.5) * 120;
  noButton.style.transform = `translate(${x}px, ${y}px)`;
  yesButton.style.transform = `scale(${Math.min(1 + dodges * 0.12, 1.8)})`;
}

noButton.addEventListener("pointerenter", dodge);
noButton.addEventListener("touchstart", dodge, { passive: false });
noButton.addEventListener("click", dodge);

// She said yes!
yesButton.addEventListener("click", () => {
  document.querySelector("#proposal-question").hidden = true;
  document.querySelector("#proposal-answer").hidden = false;

  const container = document.querySelector(".hearts");
  for (let i = 0; i < 40; i++) {
    setTimeout(() => spawnHeart(container, Math.random() * 100 + "vw", 18 + Math.random() * 26), i * 70);
  }
});
