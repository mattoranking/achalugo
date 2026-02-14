/**
 * valentine.js — The evil interaction page
 * - Fetches link data
 * - Makes the "No" button run away from the cursor
 * - Handles "Yes" click → confetti celebration
 */
(function () {
  "use strict";

  const pathParts = window.location.pathname.split("/");
  const linkId    = pathParts[pathParts.length - 1];

  // DOM elements
  const loadingEl    = document.getElementById("loading");
  const notFoundEl   = document.getElementById("not-found");
  const alreadyEl    = document.getElementById("already-accepted");
  const alreadyMsg   = document.getElementById("already-msg");
  const valentineEl  = document.getElementById("valentine-card");
  const acceptedEl   = document.getElementById("accepted-card");

  const recipientEl  = document.getElementById("recipient-name");
  const senderEl     = document.getElementById("sender-name");
  const yesBtn       = document.getElementById("yes-btn");
  const noBtn        = document.getElementById("no-btn");

  const acceptedRecipient = document.getElementById("accepted-recipient");
  const acceptedSender    = document.getElementById("accepted-sender");

  let linkData = null;

  async function loadLink() {
    if (!linkId) {
      showNotFound();
      return;
    }

    try {
      const res  = await fetch("/api/link/" + linkId);
      const data = await res.json();

      if (data.error) {
        showNotFound();
        return;
      }

      linkData = data;

      if (data.accepted) {
        showAlreadyAccepted(data);
        return;
      }

      showValentine(data);

    } catch (err) {
      console.error(err);
      showNotFound();
    }
  }

  function showNotFound() {
    loadingEl.hidden  = true;
    notFoundEl.hidden = false;
  }

  function showAlreadyAccepted(data) {
    loadingEl.hidden = true;
    alreadyMsg.textContent =
      data.recipientName + " already said YES to " + data.senderName + "! 💕";
    alreadyEl.hidden = false;
    startConfetti();
  }

  function showValentine(data) {
    loadingEl.hidden   = true;
    recipientEl.textContent = data.recipientName;
    senderEl.textContent    = data.senderName;
    valentineEl.hidden      = false;

    // Initialize the evil "No" button behavior
    initRunawayButton();
  }

  // ── The Evil "No" Button ────────────────────────────────────
  // Starts side by side, then runs away when user tries to touch it
  function initRunawayButton() {
    const container = document.querySelector(".valentine-buttons");
    let noEscapeCount = 0;

    // Escalating labels — mix of playful English + Igbo/Nigerian flavor
    const noLabels = [
      "No 💔",              // 0 — starting text
      "Nope! 😅",           // 1
      "Catch me if you can! 😜", // 2
      "Can't catch me! 🏃",  // 3
      "Why are you running? 😂", // 4
      "Just Say Yes, Alákorí 😈", // 5
      "You no dey tire? 😩",     // 6
      "Say Yes Nah, Achalugo 💕", // 7
      "Give up already! 🙄",     // 8
      "Try YES, it's easier! 😏", // 9
      "Say Yes Sweetie! 🥺",     // 10
      "Obim, say yes nah 💘",    // 11
      "Una go tire! 😂",          // 12
      "Say Yes! Atóolè 😂",       // 13
      "JUST CLICK YES! 😤",      // 14
    ];

    function getNoLabel() {
      // Cycle through labels endlessly (loops back after reaching the end)
      var idx = noEscapeCount % noLabels.length;
      return noLabels[idx];
    }

    function moveNoButton(cursorX, cursorY) {
      const btnRect    = noBtn.getBoundingClientRect();
      const btnCenterX = btnRect.left + btnRect.width / 2;
      const btnCenterY = btnRect.top + btnRect.height / 2;

      const dx = cursorX - btnCenterX;
      const dy = cursorY - btnCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Only move if cursor is within 150px
      if (distance < 150) {
        noEscapeCount++;

        // Update the button text
        noBtn.textContent = getNoLabel();

        // Calculate escape direction — add random angle offset so it jumps all around
        const baseAngle = Math.atan2(dy, dx);
        const randomOffset = (Math.random() - 0.5) * Math.PI; // ±90° variation
        const angle = baseAngle + randomOffset;
        const jumpDist = 150 + Math.random() * 150;

        // Pick a random spot biased away from cursor
        let newX = btnRect.left - Math.cos(angle) * jumpDist;
        let newY = btnRect.top  - Math.sin(angle) * jumpDist;

        // If it would land near an edge, flip to the opposite side of the screen
        const margin = 20;
        const maxX = window.innerWidth - btnRect.width - margin;
        const maxY = window.innerHeight - btnRect.height - margin;

        if (newX < margin || newX > maxX) {
          newX = newX < margin
            ? maxX - Math.random() * (maxX / 2)
            : margin + Math.random() * (maxX / 2);
        }
        if (newY < margin || newY > maxY) {
          newY = newY < margin
            ? maxY - Math.random() * (maxY / 2)
            : margin + Math.random() * (maxY / 2);
        }

        newX = Math.max(margin, Math.min(newX, maxX));
        newY = Math.max(margin, Math.min(newY, maxY));

        noBtn.style.position = "fixed";
        noBtn.style.left     = newX + "px";
        noBtn.style.top      = newY + "px";
        noBtn.style.transition = "none";

        // Meanwhile, grow the Yes button slightly
        if (noEscapeCount > 3) {
          const yesScale = Math.min(1.4, 1 + noEscapeCount * 0.02);
          yesBtn.style.transform = "scale(" + yesScale + ")";
        }
      }
    }

    // Mouse events (desktop)
    document.addEventListener("mousemove", function (e) {
      moveNoButton(e.clientX, e.clientY);
    });

    // Touch events (mobile)
    noBtn.addEventListener("touchstart", function (e) {
      e.preventDefault();
      const touch = e.touches[0];
      moveNoButton(touch.clientX, touch.clientY);
    }, { passive: false });

    // Just in case someone manages to click No
    noBtn.addEventListener("click", function (e) {
      e.preventDefault();
      noEscapeCount += 3;
      const rect = noBtn.getBoundingClientRect();
      moveNoButton(rect.left + rect.width / 2, rect.top + rect.height / 2);
    });
  }

  // ── "Yes" Button Click ──────────────────────────────────────
  yesBtn.addEventListener("click", async function () {
    yesBtn.disabled    = true;
    yesBtn.textContent = "Sending... 💌";

    try {
      const res  = await fetch("/api/accept/" + linkId, { method: "POST" });
      const data = await res.json();

      if (data.error) {
        alert("Something went wrong!");
        return;
      }

      // Show celebration
      valentineEl.hidden = true;
      acceptedRecipient.textContent = data.recipientName;
      acceptedSender.textContent    = data.senderName;
      acceptedEl.hidden  = false;

      startConfetti();

    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again!");
    } finally {
      yesBtn.disabled = false;
    }
  });

  // ── Init ────────────────────────────────────────────────────
  loadLink();
})();
