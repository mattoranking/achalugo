/**
 * waitlist.js — Handles the waitlist form on closed.html
 */
(function () {
  "use strict";

  // Guard: redirect to home if links are still available
  fetch("/api/remaining")
    .then(function (r) { return r.json(); })
    .then(function (d) { if (!d.closed) window.location.href = "/"; })
    .catch(function () {});

  const form       = document.getElementById("waitlist-form");
  const submitBtn  = document.getElementById("waitlist-btn");
  const btnText    = submitBtn.querySelector(".btn-text");
  const btnLoading = submitBtn.querySelector(".btn-loading");
  const successMsg = document.getElementById("waitlist-success");

  let turnstileToken = null;

  // Turnstile callback
  window.onTurnstileSuccess = function (token) {
    turnstileToken = token;
    submitBtn.disabled = false;
  };

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("waitlist-email").value.trim();
    if (!email || !turnstileToken) return;

    btnText.hidden    = true;
    btnLoading.hidden = false;
    submitBtn.disabled = true;

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, turnstileToken }),
      });

      const data = await res.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      // Success
      form.hidden        = true;
      successMsg.hidden  = false;

    } catch (err) {
      alert("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      btnText.hidden    = false;
      btnLoading.hidden = true;
      submitBtn.disabled = false;
      turnstileToken = null;
      if (window.turnstile) {
        turnstile.reset();
      }
    }
  });
})();
