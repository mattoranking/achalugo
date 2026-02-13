/**
 * create.js — Handles the "Create Valentine Link" form on index.html
 */
(function () {
  "use strict";

  const form       = document.getElementById("create-form");
  const submitBtn  = document.getElementById("submit-btn");
  const btnText    = submitBtn.querySelector(".btn-text");
  const btnLoading = submitBtn.querySelector(".btn-loading");

  const resultDiv       = document.getElementById("result");
  const resultRecipient = document.getElementById("result-recipient");
  const resultLink      = document.getElementById("result-link");
  const copyBtn         = document.getElementById("copy-btn");
  const closedNotice    = document.getElementById("closed-notice");
  const createAnother   = document.getElementById("create-another");

  let turnstileToken = null;

  // Turnstile callback — called globally by the widget
  window.onTurnstileSuccess = function (token) {
    turnstileToken = token;
    submitBtn.disabled = false;
  };

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const senderName    = document.getElementById("sender-name").value.trim();
    const recipientName = document.getElementById("recipient-name").value.trim();

    if (!senderName || !recipientName) return;
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
        }),
      });

      const data = await res.json();

      if (data.closed) {
        // Show closed state
        form.hidden         = true;
        closedNotice.hidden = false;
        return;
      }

      if (data.error) {
        alert(data.error);
        return;
      }

      // Success — show the link
      const fullUrl = window.location.origin + data.url;
      resultRecipient.textContent = recipientName;
      resultLink.value            = fullUrl;
      form.hidden                 = true;
      resultDiv.hidden            = false;

    } catch (err) {
      alert("Something went wrong. Please try again.");
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

  // ── Copy button ──────────────────────────────────────────────
  copyBtn.addEventListener("click", function () {
    resultLink.select();
    navigator.clipboard.writeText(resultLink.value).then(function () {
      copyBtn.textContent = "Copied!";
      setTimeout(function () {
        copyBtn.textContent = "Copy";
      }, 2000);
    });
  });

  // ── Create another ──────────────────────────────────────────
  createAnother.addEventListener("click", function () {
    resultDiv.hidden = true;
    form.hidden      = false;
    form.reset();
    submitBtn.disabled = true;
    if (window.turnstile) {
      turnstile.reset();
    }
  });
})();
