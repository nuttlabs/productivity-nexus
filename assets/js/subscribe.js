/* Productivity Nexus — homepage subscription form
 * Invisible Cloudflare Turnstile. The widget renders hidden and the
 * challenge runs only after the visitor clicks submit (execution:
 * "execute" + appearance: "interaction-only"). On success it posts
 * email + token + honeypot to the Cloudflare Worker (which verifies the
 * token and forwards to Airtable), then redirects to /one-more-step.
 * ------------------------------------------------------------------ */
(function () {
  "use strict";

  // === CONFIG ============================================================
  var ENDPOINT = "https://productivity-nexus-cloudflare-turnstile.nutt-labs.workers.dev";
  var REDIRECT = "/one-more-step";
  var SITEKEY  = "0x4AAAAAADvPF-zygrhIcP0Z";
  // ======================================================================

  var form = document.getElementById("wf-form-Subscription");
  if (!form) return;

  var wrap = form.closest(".w-form") || form.parentNode;
  var fail = wrap.querySelector(".w-form-fail");
  var submitBtn = form.querySelector('input[type="submit"]');
  var submitValue = submitBtn ? submitBtn.value : "";
  var submitWait = submitBtn ? (submitBtn.getAttribute("data-wait") || "") : "";

  var widgetId = null;
  var pending = null; // { email, honeypot } captured when submit is clicked

  function showError() {
    if (fail) fail.style.display = "block";
    if (submitBtn) { submitBtn.value = submitValue; submitBtn.disabled = false; }
    pending = null;
    if (window.turnstile && widgetId !== null) {
      try { window.turnstile.reset(widgetId); } catch (e) {}
    }
  }

  function post(token) {
    if (!pending) return;
    var body = { email: pending.email, turnstileToken: token, company: pending.honeypot };

    fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })
      .then(function (res) {
        if (!res.ok) throw new Error("Endpoint responded " + res.status);
        window.location.href = REDIRECT;
      })
      .catch(function () { showError(); });
  }

  // Turnstile calls this once its API script has loaded (render=explicit).
  // The widget is hidden and idle until we call execute() on submit.
  window.onloadTurnstileCallback = function () {
    if (!window.turnstile) return;
    try {
      widgetId = window.turnstile.render("#cf-turnstile-widget", {
        sitekey: SITEKEY,
        execution: "execute",          // do not run the challenge on load
        appearance: "interaction-only", // stay invisible unless interaction is required
        callback: function (token) { post(token); },
        "error-callback": function () { showError(); },
        "expired-callback": function () { showError(); }
      });
    } catch (e) {}
  };

  // Capture phase so Webflow's delegated submit handler never fires.
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    e.stopImmediatePropagation();

    if (fail) fail.style.display = "none";

    var emailInput = form.querySelector('input[name="email"]');
    var email = emailInput ? emailInput.value.trim() : "";
    if (!email) { showError(); return; }

    var honeypotInput = form.querySelector('input[name="company"]');
    var honeypot = honeypotInput ? honeypotInput.value : "";

    if (!window.turnstile || widgetId === null) { showError(); return; }

    pending = { email: email, honeypot: honeypot };
    if (submitBtn) { submitBtn.disabled = true; if (submitWait) submitBtn.value = submitWait; }

    // Run the challenge now (after the click). Token arrives in the
    // success callback above, which then posts to the Worker.
    try {
      window.turnstile.execute(widgetId);
    } catch (err) {
      showError();
    }
  }, true);
})();
