(function () {
  "use strict";

  const header = document.getElementById("header");
  const cards = Array.from(document.querySelectorAll(".project-card--interactive[data-detail]"));
  const inertTargets = [header, document.querySelector(".main-content"), document.querySelector(".footer")].filter(Boolean);
  const focusable = 'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';
  const CLOSE_MS = 220;

  let activeCard = null;
  let activeDetail = null;
  let closing = false;

  document.querySelector('.nav__link[href="#projects"]')?.addEventListener("click", (event) => {
    event.preventDefault();
    document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
  });

  cards.forEach((card, index) => {
    card.style.setProperty("--card-delay", `${index * 0.08}s`);
  });

  const setInert = (enabled) => {
    inertTargets.forEach((element) => {
      element.inert = enabled;
    });
  };

  const openDetail = (card) => {
    const detail = document.getElementById(card.dataset.detail);

    if (!card || !detail || detail.classList.contains("is-open") || closing) return;

    activeCard = card;
    activeDetail = detail;

    detail.classList.remove("is-closing");
    detail.classList.add("is-open", "is-opening");
    detail.setAttribute("aria-hidden", "false");
    card.classList.add("is-active");
    card.setAttribute("aria-expanded", "true");
    document.body.classList.add("modal-open");
    setInert(true);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        detail.classList.remove("is-opening");
        detail.querySelector(".project-detail__close")?.focus();
      });
    });
  };

  const finalizeClose = () => {
    if (!activeDetail || !activeCard) {
      closing = false;
      return;
    }

    activeDetail.classList.remove("is-open", "is-closing", "is-opening");
    activeDetail.setAttribute("aria-hidden", "true");
    activeCard.classList.remove("is-active");
    activeCard.setAttribute("aria-expanded", "false");
    document.body.classList.remove("modal-open");
    setInert(false);
    activeCard.focus();
    activeCard = null;
    activeDetail = null;
    closing = false;
  };

  const closeDetail = () => {
    if (!activeDetail?.classList.contains("is-open") || closing) return;

    closing = true;
    const panel = activeDetail.querySelector(".project-detail__panel");

    requestAnimationFrame(() => {
      activeDetail.classList.add("is-closing");
    });

    if (!panel) {
      setTimeout(finalizeClose, CLOSE_MS);
      return;
    }

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      panel.removeEventListener("transitionend", onTransitionEnd);
      finalizeClose();
    };

    const onTransitionEnd = (event) => {
      if (event.target === panel && event.propertyName === "opacity") finish();
    };

    panel.addEventListener("transitionend", onTransitionEnd);
    setTimeout(finish, CLOSE_MS + 50);
  };

  cards.forEach((card) => {
    card.addEventListener("click", () => openDetail(card));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openDetail(card);
      }
    });
  });

  document.querySelectorAll(".project-detail").forEach((detail) => {
    detail.addEventListener("click", (event) => {
      if (event.target.closest("[data-close-detail]")) closeDetail();
    });
  });

  document.addEventListener("keydown", (event) => {
    if (!activeDetail?.classList.contains("is-open") || activeDetail.classList.contains("is-closing")) return;

    if (event.key === "Escape") {
      closeDetail();
      return;
    }

    if (event.key !== "Tab") return;

    const items = activeDetail.querySelectorAll(focusable);
    if (!items.length) return;

    const first = items[0];
    const last = items[items.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  window.addEventListener("load", () => document.body.classList.add("is-ready"));

  if (header) {
    window.addEventListener("scroll", () => {
      header.style.backgroundColor = window.scrollY > 18 ? "rgba(13, 14, 18, 0.88)" : "rgba(13, 14, 18, 0.72)";
    }, { passive: true });
  }
})();
