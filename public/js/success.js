/**
 * success.js — Populates the success page with link data from URL params
 */
(function () {
  "use strict";

  // Read params: ?recipient=Jamie&link=/l/abc123
  const params    = new URLSearchParams(window.location.search);
  const recipient = params.get("recipient");
  const linkPath  = params.get("link");

  if (!recipient || !linkPath) {
    // No data — redirect back to create page
    window.location.href = "/";
    return;
  }

  const fullUrl = window.location.origin + linkPath;

  // Populate the page
  document.getElementById("result-recipient").textContent = recipient;
  document.getElementById("result-link").value = fullUrl;

  // Share links
  const shareText = "Hey " + recipient + "! Someone has a Valentine's surprise for you 💘";
  document.getElementById("share-whatsapp").href =
    "https://wa.me/?text=" + encodeURIComponent(shareText + "\n" + fullUrl);
  document.getElementById("share-twitter").href =
    "https://twitter.com/intent/tweet?text=" + encodeURIComponent(shareText) +
    "&url=" + encodeURIComponent(fullUrl);

  // Copy button
  var copyBtn = document.getElementById("copy-btn");
  copyBtn.addEventListener("click", function () {
    var linkInput = document.getElementById("result-link");
    linkInput.select();
    navigator.clipboard.writeText(linkInput.value).then(function () {
      copyBtn.textContent = "Copied! ✅";
      setTimeout(function () {
        copyBtn.textContent = "Copy";
      }, 2000);
    });
  });
})();
