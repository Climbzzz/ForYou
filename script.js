const ACCESS_CODE = "ForLai";
const ACCESS_KEY = "foryou-unlocked";
const GATE_FADE_OUT_MS = 500;
const REDUCED_FADE_OUT_MS = 300;
const LETTER_OPEN_MS = 700;
const REDUCED_LETTER_MS = 300;

const accessGate = document.querySelector("#access-gate");
const accessForm = document.querySelector("#access-form");
const accessCode = document.querySelector("#access-code");
const accessError = document.querySelector("#access-error");
const letterStage = document.querySelector("#letter-stage");
const letterButton = document.querySelector("#letter-button");
const siteContent = document.querySelector("#site-content");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function getMotionDuration(normalDuration) {
  return prefersReducedMotion.matches ? REDUCED_LETTER_MS : normalDuration;
}

function revealSite() {
  accessGate.hidden = true;
  if (letterStage) {
    letterStage.hidden = true;
  }
  showSiteContent();
}

function showSiteContent(onVisible) {
  siteContent.hidden = false;

  requestAnimationFrame(() => requestAnimationFrame(() => {
    siteContent.classList.add("is-visible");
    startHearts();
    startSparkles();
    if (onVisible) {
      onVisible();
    }
  }));
}

function revealLetter() {
  accessGate.hidden = true;
  letterStage.hidden = false;
  requestAnimationFrame(() => {
    letterStage.classList.add("is-visible");
  });
}

function openLetter() {
  letterButton.disabled = true;
  letterButton.classList.add("is-opening");

  window.setTimeout(() => {
    const handleLetterFade = (event) => {
      if (event.target !== letterButton || event.propertyName !== "opacity") {
        return;
      }

      letterButton.removeEventListener("transitionend", handleLetterFade);
      showSiteContent(() => {
        letterStage.hidden = true;
      });
    };

    letterButton.addEventListener("transitionend", handleLetterFade);
    letterButton.classList.add("is-approaching");
  }, getMotionDuration(LETTER_OPEN_MS));
}

function unlockSite() {
  sessionStorage.setItem(ACCESS_KEY, "true");

  const fadeOutDuration = getMotionDuration(GATE_FADE_OUT_MS);
  accessGate.classList.add("is-hiding");
  window.setTimeout(revealLetter, fadeOutDuration);
}

if (sessionStorage.getItem(ACCESS_KEY) === "true") {
  revealSite();
}

accessForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (accessCode.value.trim() !== ACCESS_CODE) {
    accessError.textContent = "That code doesn't look right. Try again.";
    accessCode.select();
    return;
  }

  unlockSite();
});

letterButton.addEventListener("click", openLetter);

// Show or hide the extra message when the button is clicked.
const noteButton = document.querySelector("#note-button");
const extraNote = document.querySelector("#extra-note");

const onReasonsPage = Boolean(document.querySelector("#reasons"));
let toTopButton = document.querySelector("#to-top-button");

// If the HTML doesn't already have the button, add it under the final message.
if (onReasonsPage && !toTopButton) {
  toTopButton = document.createElement("button");
  toTopButton.id = "to-top-button";
  toTopButton.type = "button";
  toTopButton.textContent = "Back to the top";
  extraNote.appendChild(toTopButton);
}
let resetPending = false;

function getScrollBehavior() {
  return prefersReducedMotion.matches ? "auto" : "smooth";
}

// WhyILoveYou page: reveal the ending and centre it on screen.
function openEnding() {
  noteButton.hidden = true;
  extraNote.hidden = false;

  requestAnimationFrame(() => requestAnimationFrame(() => {
    extraNote.scrollIntoView({ behavior: getScrollBehavior(), block: "center" });
  }));
}

// Put the page back the way it started so the ending can be opened again.
function resetEnding() {
  resetPending = false;
  extraNote.hidden = true;
  noteButton.hidden = false;
}

const noteButtonLabel = noteButton.textContent;
let noteOpen = false;
let noteAnim = null;

// Home page: the note fades in while its box (and the pink background) grows,
// and fades out while it shrinks.
function toggleNote() {
  noteOpen = !noteOpen;
  noteButton.textContent = noteOpen ? "Hide the message" : noteButtonLabel;

  // Clicked mid-animation: just play it backwards from where it is.
  if (noteAnim && noteAnim.playState === "running") {
    noteAnim.reverse();
    return;
  }

  if (noteOpen) {
    extraNote.hidden = false;
  }

  const styles = getComputedStyle(extraNote);
  const full = {
    height: extraNote.offsetHeight + "px",
    marginTop: styles.marginTop,
    marginBottom: styles.marginBottom,
    opacity: 1
  };
  const collapsed = {
    height: "0px",
    marginTop: "0px",
    marginBottom: "0px",
    opacity: 0
  };

  extraNote.style.overflow = "hidden";

  const anim = extraNote.animate(noteOpen ? [collapsed, full] : [full, collapsed], {
    duration: getMotionDuration(600),
    easing: "ease",
    fill: "both"
  });
  noteAnim = anim;

  anim.onfinish = () => {
    extraNote.style.overflow = "";
    if (!noteOpen) {
      extraNote.hidden = true;
    }
    anim.cancel();
    noteAnim = null;
  };
}

noteButton.addEventListener("click", function () {
  if (onReasonsPage) {
    openEnding();
    return;
  }

  toggleNote();
});

if (toTopButton) {
  toTopButton.addEventListener("click", function () {
    resetPending = true;
    window.scrollTo({ top: 0, behavior: getScrollBehavior() });

    if (window.scrollY < 10) {
      resetEnding();
    }
  });

  // Wait until the scroll has actually reached the top before resetting,
  // otherwise removing the ending would make the page jump.
  window.addEventListener("scroll", function () {
    if (resetPending && window.scrollY < 10) {
      resetEnding();
    }
  }, { passive: true });
}

let heartsStarted = false;

function startHearts() {
  const container = document.querySelector(".hearts");
  if (heartsStarted || !container || prefersReducedMotion.matches) return;
  heartsStarted = true;

  setInterval(() => {
    const heart = document.createElement("span");
    const duration = 8 + Math.random() * 6;
    heart.className = "heart";
    heart.textContent = "♥";
    heart.style.left = Math.random() * 100 + "vw";
    heart.style.fontSize = 12 + Math.random() * 18 + "px";
    heart.style.animationDuration = duration + "s";
    container.appendChild(heart);
    setTimeout(() => heart.remove(), duration * 1000);
  }, 900);
}

// Fade lines in and out as they scroll into and out of view (WhyILoveYou page only).
function setupScrollFade() {
  const reasons = document.querySelector("#reasons");
  if (!reasons || prefersReducedMotion.matches) return;

  const items = reasons.querySelectorAll(
    "h2, p:not(.big-gap-after):not(.bigger-gap-after), #note-button, #to-top-button"
  );

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const item = entry.target;

      if (entry.isIntersecting) {
        item.classList.remove("exited-top");
        item.classList.add("in-view");
      } else {
        item.classList.remove("in-view");
        // Remember whether it left through the top so it drifts up, not down.
        const leftThroughTop = entry.boundingClientRect.top < (entry.rootBounds ? entry.rootBounds.top : 0);
        item.classList.toggle("exited-top", leftThroughTop);
      }
    });
  }, { rootMargin: "-8% 0px -8% 0px", threshold: 0 });

  items.forEach((item) => {
    item.classList.add("scroll-fade");
    observer.observe(item);
  });
}

setupScrollFade();

// A little squeak made with the browser's built-in audio, so no sound file is needed.
let audioCtx = null;

function playSqueak() {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(650, now);
    osc.frequency.exponentialRampToValueAtTime(1900, now + 0.09);
    osc.frequency.exponentialRampToValueAtTime(1350, now + 0.2);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.22, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    osc.connect(gain).connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.24);
  } catch (error) {
    // If audio isn't available, the image swap still works.
  }
}

// Hold an image to swap it, let go to swap it back.
document.querySelectorAll(".press-image").forEach((button) => {
  const img = button.querySelector("img");
  const normalSrc = img.getAttribute("src");
  const pressedSrc = img.dataset.pressedSrc;

  // Load the squished image ahead of time so there's no flicker on first press.
  new Image().src = pressedSrc;

  let pressed = false; // stops a held key from re-squeaking over and over

  const press = () => {
    if (pressed) return;
    pressed = true;
    img.src = pressedSrc;
    playSqueak();
  };
  const release = () => {
    pressed = false;
    img.src = normalSrc;
  };

  button.addEventListener("pointerdown", (event) => {
    button.setPointerCapture(event.pointerId); // still detects release if your finger slides off
    press();
  });
  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("lostpointercapture", release);

  button.addEventListener("keydown", (event) => {
    if (event.key === " " || event.key === "Enter") press();
  });
  button.addEventListener("keyup", release);

  // Stops the long-press menu on phones from popping up.
  button.addEventListener("contextmenu", (event) => event.preventDefault());
});

// ---------------------------------------------------------------
// Little extras: sounds, sparkle trail, scroll reveal, cards
// ---------------------------------------------------------------

// Play a few short notes. Each note is [frequency, delay, length, wave type, volume].
function playNotes(notes) {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();

    const now = audioCtx.currentTime;
    notes.forEach(([freq, delay, length, type = "sine", volume = 0.14]) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const start = now + delay;

      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + length);

      osc.connect(gain).connect(audioCtx.destination);
      osc.start(start);
      osc.stop(start + length + 0.02);
    });
  } catch (error) {
    // No audio? Everything else still works.
  }
}

// Sparkle trail that follows the mouse or finger.
let spawnSparkles = null;

function startSparkles() {
  if (prefersReducedMotion.matches || spawnSparkles) return;

  const layer = document.createElement("div");
  layer.className = "sparkles";
  layer.setAttribute("aria-hidden", "true");
  document.body.appendChild(layer);

  const symbols = ["✦", "✧", "♥"];
  const colors = ["#ee8693", "#f8c3ca", "#ffffff", "#e7b86a", "#b52843"];
  let lastX = -100;
  let lastY = -100;

  spawnSparkles = (x, y, count = 1) => {
    for (let i = 0; i < count; i++) {
      if (layer.childElementCount > 70) return;

      const sparkle = document.createElement("span");
      sparkle.className = "sparkle";
      sparkle.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      sparkle.style.left = x + "px";
      sparkle.style.top = y + "px";
      sparkle.style.fontSize = 10 + Math.random() * 14 + "px";
      sparkle.style.color = colors[Math.floor(Math.random() * colors.length)];
      sparkle.style.setProperty("--dx", (Math.random() * 60 - 30) + "px");
      sparkle.style.setProperty("--dy", (15 + Math.random() * 40) + "px");
      sparkle.style.setProperty("--rot", (Math.random() * 140 - 70) + "deg");
      layer.appendChild(sparkle);
      setTimeout(() => sparkle.remove(), 900);
    }
  };

  window.addEventListener("pointermove", (event) => {
    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;
    if (dx * dx + dy * dy < 22 * 22) return;

    lastX = event.clientX;
    lastY = event.clientY;
    spawnSparkles(event.clientX, event.clientY);
  }, { passive: true });

  window.addEventListener("pointerdown", (event) => {
    spawnSparkles(event.clientX, event.clientY, 6);
  }, { passive: true });
}

function burstFromElement(element, count = 14) {
  if (!spawnSparkles) return;
  const box = element.getBoundingClientRect();
  spawnSparkles(box.left + box.width / 2, box.top + box.height / 2, count);
}

// Cards fade up the first time they scroll into view.
function setupReveal() {
  const items = document.querySelectorAll(".reveal");
  if (items.length === 0 || prefersReducedMotion.matches || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("revealed");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  items.forEach((item) => {
    item.classList.add("will-reveal");
    observer.observe(item);
  });
}

// Co-op card: press start and the bars fill up one by one.
function setupCoop() {
  const startButton = document.querySelector("#coop-button");
  if (!startButton) return;

  const rows = [...document.querySelectorAll(".stat-row")];
  const message = document.querySelector("#coop-message");
  let finished = false;
  let timers = [];

  function resetBars() {
    timers.forEach(clearTimeout);
    timers = [];
    rows.forEach((row) => {
      row.classList.remove("is-full");
      row.querySelector(".bar-fill").style.width = "0%";
      row.querySelector(".stat-value").textContent = "0%";
    });
    message.classList.remove("show");
    message.textContent = "";
  }

  function run() {
    startButton.disabled = true;
    startButton.textContent = "Loading...";

    rows.forEach((row, index) => {
      timers.push(setTimeout(() => {
        row.querySelector(".bar-fill").style.width = "100%";
        playNotes([[520 + index * 130, 0, 0.12, "square", 0.05]]);
      }, 150 + index * 500));

      timers.push(setTimeout(() => {
        row.classList.add("is-full");
        row.querySelector(".stat-value").textContent = row.dataset.final;
      }, 150 + index * 500 + getMotionDuration(1100)));
    });

    const total = 150 + rows.length * 500 + getMotionDuration(1100) + 200;
    timers.push(setTimeout(() => {
      message.textContent = "Player 2 has joined the game. It takes two ♥";
      message.classList.add("show");
      playNotes([[784, 0, 0.18, "triangle", 0.14], [988, 0.12, 0.18, "triangle", 0.14], [1319, 0.24, 0.4, "triangle", 0.14]]);
      burstFromElement(message, 18);
      startButton.disabled = false;
      startButton.textContent = "Play again";
      finished = true;
    }, total));
  }

  startButton.addEventListener("click", () => {
    if (finished) {
      finished = false;
      resetBars();
      timers.push(setTimeout(run, 80));
    } else {
      run();
    }
  });
}

// Love coupons: tap to stamp them as redeemed.
function setupCoupons() {
  const coupons = [...document.querySelectorAll(".coupon")];
  if (coupons.length === 0) return;

  coupons.forEach((coupon) => {
    coupon.addEventListener("click", () => {
      if (coupon.classList.contains("is-redeemed")) return;

      coupon.classList.add("is-redeemed");
      coupon.setAttribute("aria-pressed", "true");
      playNotes([[880, 0, 0.18, "sine", 0.14], [1320, 0.1, 0.35, "sine", 0.12]]);
      burstFromElement(coupon, 12);
    });
  });

  const resetButton = document.querySelector("#coupon-reset");
  if (resetButton) {
    resetButton.addEventListener("click", () => {
      coupons.forEach((coupon) => {
        coupon.classList.remove("is-redeemed");
        coupon.setAttribute("aria-pressed", "false");
      });
    });
  }
}

// "Give me a reason" button: shows every reason once before repeating any.
const LOVE_REASONS = [
  "Somehow, you always know exactly what to say when I can't find the words.",
  "You turn a quiet night in into my favorite part of the week.",
  "You celebrate my wins like they're your own.",
  "You make me want to be better without ever making me feel like I'm not enough.",
  "Even your silliest moments are my favorite moments.",
  "You notice the small things about me that I didn't think anyone saw.",
  "You're the first person I want to tell everything to, good or bad.",
  "You make the whole world feel a little softer.",
  "You get my jokes, even the terrible ones.",
  "I like who I get to be when I'm with you.",
  "You're my favorite part of every single day."
];

function setupReasonButton() {
  const button = document.querySelector("#reason-button");
  const card = document.querySelector("#reason-card");
  if (!button || !card) return;

  let bag = [];
  let last = -1;

  button.addEventListener("click", () => {
    if (bag.length === 0) {
      bag = LOVE_REASONS.map((_, index) => index).filter((index) => index !== last);
      for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
      }
    }

    last = bag.pop();
    card.textContent = LOVE_REASONS[last];
    card.classList.remove("pop");
    void card.offsetWidth; // restart the pop animation
    card.classList.add("pop");

    button.textContent = "Another one";
    playNotes([[660, 0, 0.12, "triangle", 0.12], [990, 0.08, 0.22, "triangle", 0.1]]);
    burstFromElement(card, 8);
  });
}

setupReveal();
setupCoop();
setupCoupons();
setupReasonButton();


// Spin-the-wheel: lands on a random prize, with ticking and a little fanfare.
const WHEEL_PRIZES = [
  "A Custom Site For You",
  "Pick the game",
  "Compliments",
  "Movie night",
  "Voice message",
  "1v1 On Valorant",
  "I teach you smth new",
  "Your choice"
];

function setupWheel() {
  const wheel = document.querySelector("#wheel");
  const spinButton = document.querySelector("#wheel-button");
  const result = document.querySelector("#wheel-result");
  if (!wheel || !spinButton || !result) return;

  const count = WHEEL_PRIZES.length;
  const slice = 360 / count;
  const ns = "http://www.w3.org/2000/svg";
  const toRad = (deg) => (deg * Math.PI) / 180;

  // Draw the wedges and labels. Wedge i is centred at (i * slice) degrees clockwise from the top.
  WHEEL_PRIZES.forEach((prize, i) => {
    const a1 = toRad((i - 0.5) * slice);
    const a2 = toRad((i + 0.5) * slice);
    const r = 98;

    const wedge = document.createElementNS(ns, "path");
    wedge.setAttribute("d",
      `M0 0 L${(r * Math.sin(a1)).toFixed(2)} ${(-r * Math.cos(a1)).toFixed(2)} ` +
      `A${r} ${r} 0 0 1 ${(r * Math.sin(a2)).toFixed(2)} ${(-r * Math.cos(a2)).toFixed(2)} Z`);
    wedge.setAttribute("fill", i % 2 === 0 ? "#d95168" : "#fde1df");
    wedge.setAttribute("stroke", "#ffffff");
    wedge.setAttribute("stroke-width", "1.5");
    wheel.appendChild(wedge);

    const label = document.createElementNS(ns, "text");
    label.textContent = prize;
    label.setAttribute("transform", `rotate(${i * slice - 90}) translate(25 0)`);
    label.setAttribute("dominant-baseline", "middle");
    label.setAttribute("font-size", "6.4");
    label.setAttribute("font-weight", "bold");
    label.setAttribute("font-family", "Arial, sans-serif");
    label.setAttribute("fill", i % 2 === 0 ? "#ffffff" : "#743d48");
    wheel.appendChild(label);
  });

  let rotation = 0;
  let spinning = false;
  let lastPrize = -1;
  let lastTickIndex = null;
  let lastTickTime = 0;
  let fallbackTimer = null;

  function currentAngle() {
    const matrix = getComputedStyle(wheel).transform;
    const match = matrix && matrix.match(/matrix\(([^)]+)\)/);
    if (!match) return rotation;
    const [a, b] = match[1].split(",").map(parseFloat);
    return (Math.atan2(b, a) * 180) / Math.PI;
  }

  // Tick every time a new wedge passes the pointer.
  function watchTicks() {
    if (!spinning) return;

    const wedgeIndex = Math.floor((((-currentAngle() + slice / 2) % 360) + 360) % 360 / slice);
    const now = performance.now();
    if (lastTickIndex !== null && wedgeIndex !== lastTickIndex && now - lastTickTime > 45) {
      playNotes([[1500, 0, 0.03, "square", 0.035]]);
      lastTickTime = now;
    }
    lastTickIndex = wedgeIndex;
    requestAnimationFrame(watchTicks);
  }

  function finishSpin(prizeIndex) {
    if (!spinning) return;
    spinning = false;
    clearTimeout(fallbackTimer);

    result.textContent = "You got: " + WHEEL_PRIZES[prizeIndex] + " ♥";
    spinButton.disabled = false;
    spinButton.textContent = "Spin again";
    playNotes([
      [523, 0, 0.16, "triangle", 0.13],
      [659, 0.11, 0.16, "triangle", 0.13],
      [784, 0.22, 0.16, "triangle", 0.13],
      [1047, 0.33, 0.45, "triangle", 0.13]
    ]);
    burstFromElement(wheel, 18);
  }

  spinButton.addEventListener("click", () => {
    if (spinning) return;
    spinning = true;
    spinButton.disabled = true;
    result.textContent = "Spinning...";

    // Pick a prize (never the same one twice in a row) and a spot inside its wedge.
    let prizeIndex;
    do {
      prizeIndex = Math.floor(Math.random() * count);
    } while (prizeIndex === lastPrize && count > 1);
    lastPrize = prizeIndex;

    const offset = (Math.random() - 0.5) * slice * 0.6;
    const wanted = (((-(prizeIndex * slice + offset)) % 360) + 360) % 360;
    const current = ((rotation % 360) + 360) % 360;
    const extra = (wanted - current + 360) % 360;
    const turns = prefersReducedMotion.matches ? 2 : 5 + Math.floor(Math.random() * 3);
    const duration = prefersReducedMotion.matches ? 1200 : 4800;

    rotation += turns * 360 + extra;
    wheel.style.transition = `transform ${duration}ms cubic-bezier(.12, .6, .1, 1)`;
    wheel.style.transform = `rotate(${rotation}deg)`;

    lastTickIndex = null;
    requestAnimationFrame(watchTicks);

    const onEnd = (event) => {
      if (event.propertyName !== "transform") return;
      wheel.removeEventListener("transitionend", onEnd);
      finishSpin(prizeIndex);
    };
    wheel.addEventListener("transitionend", onEnd);

    // Safety net in case the browser never fires transitionend.
    fallbackTimer = setTimeout(() => {
      wheel.removeEventListener("transitionend", onEnd);
      finishSpin(prizeIndex);
    }, duration + 400);
  });
}

setupWheel();
