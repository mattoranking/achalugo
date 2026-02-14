/**
 * create.js — Handles the "Create Valentine Link" form on index.html
 */
(function () {
  "use strict";

  const form       = document.getElementById("create-form");
  const submitBtn  = document.getElementById("submit-btn");
  const btnText    = submitBtn.querySelector(".btn-text");
  const btnLoading = submitBtn.querySelector(".btn-loading");

  const closedNotice    = document.getElementById("closed-notice");
  const countdownBadge  = document.getElementById("countdown-badge");
  const remainingCount  = document.getElementById("remaining-count");
  const totalCount      = document.getElementById("total-count");
  const flashEl         = document.getElementById("flash-message");
  const flashText       = document.getElementById("flash-text");

  let turnstileToken = null;
  let flashTimer = null;

  // ── Flash message (replaces alert) ──────────────────────────
  function showFlash(message, type = "error") {
    clearTimeout(flashTimer);
    flashEl.className = "flash-message flash-" + type;
    flashText.textContent = message;
    flashEl.hidden = false;
    // Re-trigger animation
    flashEl.style.animation = "none";
    flashEl.offsetHeight;              // force reflow
    flashEl.style.animation = "";
    flashTimer = setTimeout(function () {
      flashEl.hidden = true;
    }, 5000);
  }

  // ── Fetch personal usage on load ────────────────────────────
  function showClosed() {
    window.location.href = "/closed";
  }

  async function loadRemaining() {
    try {
      const res  = await fetch("/api/remaining");
      const data = await res.json();

      if (data.closed) {
        showClosed();
        return;
      }

      remainingCount.textContent = data.personalRemaining;
      totalCount.textContent     = data.personalLimit;
      countdownBadge.hidden      = false;

      // Urgency when personal links is exhausted
      if (data.personalRemaining === 0) {
        countdownBadge.classList.add("countdown-urgent");
      } else if (data.personalRemaining === 1) {
        countdownBadge.classList.add("countdown-warning");
      }
    } catch (err) {
      console.error("Could not load remaining count:", err);
    }
  }

  loadRemaining();

  // Turnstile callback — called globally by the widget
  window.onTurnstileSuccess = function (token) {
    turnstileToken = token;
    submitBtn.disabled = false;
  };

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const senderName    = document.getElementById("sender-name").value.trim();
    const recipientName = document.getElementById("recipient-name").value.trim();
    const youtubeUrl    = document.getElementById("youtube-url").value.trim();

    if (!senderName || !recipientName) return;

    // Validate names — letters, spaces, hyphens, apostrophes only
    var namePattern = /^[\p{L}\p{M}' .\-]{2,50}$/u;
    if (!namePattern.test(senderName) || !namePattern.test(recipientName)) {
      showFlash("😅 Names can only contain letters, spaces, hyphens and apostrophes (min 2 chars)");
      return;
    }

    if (!turnstileToken) return;

    // Show loading
    btnText.hidden    = true;
    btnLoading.hidden = false;
    submitBtn.disabled = true;

    try {
      const res = await fetch("/api/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderName,
          recipientName,
          turnstileToken,
          ...(youtubeUrl ? { youtubeUrl } : {}),
        }),
      });

      const data = await res.json();

      if (data.closed) {
        showClosed();
        return;
      }

      if (data.error) {
        // Make rate-limit message extra fun
        const msg = data.error.includes("Too many")
          ? "💘 Cupid says slow down! " + data.error
          : "😅 " + data.error;
        showFlash(msg);
        return;
      }

      // Success — redirect to success page
      window.location.href = "/success.html?recipient=" +
        encodeURIComponent(recipientName) +
        "&link=" + encodeURIComponent(data.url);

    } catch (err) {
      showFlash("💔 Oops! Something went wrong. Try again, lover!");
      console.error(err);
    } finally {
      btnText.hidden    = false;
      btnLoading.hidden = true;
      submitBtn.disabled = false;
      // Reset Turnstile for next use
      turnstileToken = null;
      if (window.turnstile) {
        turnstile.reset();
      }
    }
  });
})();
