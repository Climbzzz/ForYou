const ACCESS_CODE = "";
const ACCESS_KEY = "";
const GATE_FADE_OUT_MS = 500;
const REDUCED_FADE_OUT_MS = 300;

const accessGate = document.querySelector("#access-gate");
const accessForm = document.querySelector("#access-form");
const accessCode = document.querySelector("#access-code");
const accessError = document.querySelector("#access-error");
const siteContent = document.querySelector("#site-content");

function animateReasons() {
  const reasonItems = document.querySelectorAll(
    "#reasons h2, #reasons p:not(.big-gap-after):not(.bigger-gap-after)"
  );

  if (reasonItems.length === 0) {
    return;
  }

  const activateObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    {
      rootMargin: "-180px 0px -180px 0px",
      threshold: 0
    }
  );

  const deactivateObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          entry.target.classList.remove("visible");
        }
      });
    },
    {
      rootMargin: "-80px 0px -80px 0px",
      threshold: 0
    }
  );

  reasonItems.forEach((item) => {
    activateObserver.observe(item);
    deactivateObserver.observe(item);
  });

  const noteButton = document.querySelector("#note-button");
  if (noteButton) {
    const buttonObserver = new IntersectionObserver(
      ([entry]) => {
        noteButton.classList.toggle("visible", entry.isIntersecting);
      },
      {
        rootMargin: "-80px 0px 0px 0px",
        threshold: 0
      }
    );

    buttonObserver.observe(noteButton);
  }
}

function revealSite() {
  accessGate.hidden = true;
  siteContent.hidden = false;
  requestAnimationFrame(() => {
    siteContent.classList.add("is-visible");
    animateReasons();
  });
}

function unlockSite() {
  sessionStorage.setItem(ACCESS_KEY, "true");

  const fadeOutDuration = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? REDUCED_FADE_OUT_MS
    : GATE_FADE_OUT_MS;
  accessGate.classList.add("is-hiding");
  window.setTimeout(revealSite, fadeOutDuration);
}

if (sessionStorage.getItem(ACCESS_KEY) === "true") {
  revealSite();
}

accessForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (accessCode.value !== ACCESS_CODE) {
    accessError.textContent = "That code doesn't look right. Try again.";
    accessCode.select();
    return;
  }

  unlockSite();
});

// Show or hide the extra message when the button is clicked.
const noteButton = document.querySelector("#note-button");
const extraNote = document.querySelector("#extra-note");

noteButton.addEventListener("click", function () {
  extraNote.hidden = !extraNote.hidden;

  if (extraNote.hidden) {
    noteButton.textContent = "Read one more thing";
  } else {
    noteButton.textContent = "Hide the message";
  }
});
