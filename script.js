const ACCESS_CODE = "ForLai";
const ACCESS_KEY = "foryou-unlocked";
const GATE_FADE_OUT_MS = 500;
const REDUCED_FADE_OUT_MS = 300;
const LETTER_OPEN_MS = 700;
const LETTER_ZOOM_MS = 2000;
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
  if (letterStage) {
    letterStage.hidden = true;
  }
  showSiteContent();
}

function showSiteContent() {
  siteContent.hidden = false;
  siteContent.classList.add("is-entering");

  requestAnimationFrame(() => {
    siteContent.classList.add("is-visible");

    const entryItems = [...siteContent.querySelectorAll(
      "main > section:not(#reasons) h1, main > section:not(#reasons) h2, main > section:not(#reasons) p:not(.big-gap-after):not(.bigger-gap-after), main > section:not(#reasons) a.button, main > section:not(#reasons) button, footer p"
    )].filter((item) => {
      if (item.closest("[hidden]")) {
        return false;
      }

      const bounds = item.getBoundingClientRect();
      return bounds.bottom > 0 && bounds.top < window.innerHeight;
    });

    if (entryItems.length === 0) {
      siteContent.classList.remove("is-entering");
      animateReasons();
      return;
    }

    entryItems.forEach((item, index) => {
      item.classList.add("page-entry-item");
      window.setTimeout(() => {
        item.classList.add("page-entry-visible");
      }, index * 100);
    });

    const entryDuration = prefersReducedMotion.matches ? 300 : 650;
    const sequenceDuration = (entryItems.length - 1) * 100 + entryDuration;
    window.setTimeout(() => {
      siteContent.classList.remove("is-entering");
      entryItems.forEach((item) => {
        item.classList.remove("page-entry-item", "page-entry-visible");
      });
      animateReasons();
    }, sequenceDuration);
  });
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
    letterButton.classList.add("is-approaching");
    showSiteContent();
    window.setTimeout(() => {
      letterStage.hidden = true;
    }, LETTER_ZOOM_MS);
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

noteButton.addEventListener("click", function () {
  extraNote.hidden = !extraNote.hidden;

  if (extraNote.hidden) {
    noteButton.textContent = "Read one more thing";
  } else {
    noteButton.textContent = "Hide the message";
  }
});
