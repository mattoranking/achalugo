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
  const yesBtn       = document.getElementById("yes-btn");
  const noBtn        = document.getElementById("no-btn");
  const youtubePlayer     = document.getElementById("youtube-player");
  const celebrationSub    = document.getElementById("celebration-sub");

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

    if (data.youtubeUrl) {
      // Clone the video into the already-accepted card
      var playerClone = document.createElement("div");
      playerClone.className = "youtube-embed";
      alreadyEl.querySelector(".confetti-zone").before(playerClone);
      embedYoutube(playerClone, data.youtubeUrl);
    }
  }

  function showValentine(data) {
    loadingEl.hidden   = true;
    recipientEl.textContent = data.recipientName;
    valentineEl.hidden      = false;

    // Initialize the evil "No" button behavior
    initRunawayButton();
  }

  // ── The Evil "No" Button ────────────────────────────────────
  // Starts side by side, then runs away when user tries to touch it
  function initRunawayButton() {
    const container = document.querySelector(".valentine-buttons");
    let noEscapeCount = 0;

    const noLabels = window.ACHALUGO_CONFIG.NO_LABELS;

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
      var endearments = window.ACHALUGO_CONFIG.ENDEARMENTS;
      var pick = endearments[Math.floor(Math.random() * endearments.length)];
      celebrationSub.textContent = "Happy Valentine's Day " + pick + "! 💕";
      acceptedEl.hidden  = false;

      startConfetti();

      // Play YouTube video if attached
      if (data.youtubeUrl) {
        showYoutubeVideo(data.youtubeUrl);
      }

    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again!");
    } finally {
      yesBtn.disabled = false;
    }
  });

  // ── YouTube Video ────────────────────────────────────────────
  function extractYoutubeId(url) {
    // Handle youtu.be/ID, youtube.com/watch?v=ID, /embed/ID, /shorts/ID, /live/ID
    var match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/|live\/))([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  }

  function embedYoutube(container, url) {
    var videoId = extractYoutubeId(url);
    if (!videoId) return;
    var iframe = document.createElement("iframe");
    iframe.src = "https://www.youtube.com/embed/" + videoId + "?autoplay=1&loop=1&playlist=" + videoId;
    iframe.width = "100%";
    iframe.height = "220";
    iframe.frameBorder = "0";
    iframe.allow = "autoplay; encrypted-media";
    iframe.allowFullscreen = true;
    iframe.style.borderRadius = "12px";
    iframe.style.marginTop = "1.2rem";
    container.appendChild(iframe);
    container.hidden = false;
  }

  function showYoutubeVideo(url) {
    embedYoutube(youtubePlayer, url);
  }

  // ── Init ────────────────────────────────────────────────────
  loadLink();
})();
