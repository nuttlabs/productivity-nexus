/* Productivity Nexus — homepage subscription form
 * Posts email + Cloudflare Turnstile token + honeypot to the Cloudflare
 * Worker (which verifies the token and forwards to Airtable), then
 * redirects to /one-more-step. Replaces Webflow's form handler.
 * ------------------------------------------------------------------ */
(function () {
  "use strict";

  // === CONFIG ============================================================
  // Your deployed Cloudflare Worker URL (e.g. https://pn-subscribe.<sub>.workers.dev)
  var ENDPOINT = "https://productivity-nexus-cloudflare-turnstile.nutt-labs.workers.dev";
  var REDIRECT = "/one-more-step";
  // ======================================================================

  var form = document.getElementById("wf-form-Subscription");
  if (!form) return;

  var wrap = form.closest(".w-form") || form.parentNode;
  var fail = wrap.querySelector(".w-form-fail");
  var submitBtn = form.querySelector('input[type="submit"]');
  var submitValue = submitBtn ? submitBtn.value : "";
  var submitWait = submitBtn ? (submitBtn.getAttribute("data-wait") || "") : "";

  function showError() {
    if (fail) fail.style.display = "block";
    if (submitBtn) { submitBtn.value = submitValue; submitBtn.disabled = false; }
    if (window.turnstile) { try { window.turnstile.reset(); } catch (e) {} }
  }

  // Capture phase so Webflow's delegated submit handler never fires.
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    e.stopImmediatePropagation();

    var emailInput = form.querySelector('input[name="email"]');
    var email = emailInput ? emailInput.value.trim() : "";
    if (!email) { showError(); return; }

    var honeypotInput = form.querySelector('input[name="company"]');
    var honeypot = honeypotInput ? honeypotInput.value : "";

    // Cloudflare Turnstile token (auto-injected hidden input, or API call)
    var token = "";
    var tokenInput = form.querySelector('input[name="cf-turnstile-response"]');
    if (tokenInput) token = tokenInput.value;
    if (!token && window.turnstile) {
      try { token = window.turnstile.getResponse(); } catch (err) {}
    }
    if (!token) { showError(); return; }

    if (fail) fail.style.display = "none";
    if (submitBtn) { submitBtn.disabled = true; if (submitWait) submitBtn.value = submitWait; }

    fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email,
        turnstileToken: token,
        company: honeypot
      })
    })
      .then(function (res) {
        if (!res.ok) throw new Error("Endpoint responded " + res.status);
        window.location.href = REDIRECT;
      })
      .catch(function () { showError(); });
  }, true);
})();
