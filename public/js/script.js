window.onload = function () {
  const loader = document.getElementById("loader");
  if (loader) {
    loader.classList.add("loader-hidden");
    setTimeout(() => {
      loader.style.display = "none";
    }, 500);
  }
  setActiveProgram("hnd", "HND");
};

function setActiveProgram(radioId, formType) {
  // Set active state for radio buttons
  ["hnd", "degree", "masters"].forEach((id) => {
    const radio = document.getElementById(id);
    if (radio) {
      radio.checked = id === radioId;
      radio.parentElement.classList.toggle("active", id === radioId);
    }
  });

  // Show only the selected form by ID
  ["HND", "Bachelor", "Masters"].forEach((formId) => {
    const form = document.getElementById(formId);
    if (form) {
      form.style.display = formId === formType ? "block" : "none";
    }
  });
}

// Attach event listeners to radio buttons
document.addEventListener("DOMContentLoaded", function () {
  // 1MB client-side file size validation for all file inputs
  const MAX_SIZE = 1 * 1024 * 1024;
  function validateFileInput(input) {
    const errorEl =
      input.nextElementSibling &&
      input.nextElementSibling.classList &&
      input.nextElementSibling.classList.contains("file-error")
        ? input.nextElementSibling
        : null;
    if (!input.files || input.files.length === 0) {
      if (errorEl) errorEl.textContent = "";
      return true;
    }
    const file = input.files[0];
    if (file.size > MAX_SIZE) {
      if (errorEl) errorEl.textContent = "File too large. Max size is 1MB.";
      input.value = ""; // reset invalid selection
      return false;
    }
    if (errorEl) errorEl.textContent = "";
    return true;
  }

  document.querySelectorAll('input[type="file"]').forEach((inp) => {
    inp.addEventListener("change", () => validateFileInput(inp));
  });

  // Block form submit if any file exceeds 1MB
  document.querySelectorAll("form.apply-now-form").forEach((form) => {
    form.addEventListener("submit", (e) => {
      let ok = true;
      form.querySelectorAll('input[type="file"]').forEach((inp) => {
        if (!validateFileInput(inp)) ok = false;
      });
      if (!ok) {
        e.preventDefault();
      }
    });
  });

  const hndRadio = document.getElementById("hnd");
  const degreeRadio = document.getElementById("degree");
  const mastersRadio = document.getElementById("masters");
  if (hndRadio) {
    hndRadio.addEventListener("click", function () {
      setActiveProgram("hnd", "HND");
    });
  }
  if (degreeRadio) {
    degreeRadio.addEventListener("click", function () {
      setActiveProgram("degree", "Bachelor");
    });
  }
  if (mastersRadio) {
    mastersRadio.addEventListener("click", function () {
      setActiveProgram("masters", "Masters");
    });
  }

  // Send contact forms to WhatsApp and prevent default submit
  const WHATSAPP_NUMBER = "237672815082";
  function buildWhatsAppMessage(form) {
    const parts = [];
    form.querySelectorAll("input, textarea, select").forEach((el) => {
      if (el.type === "file") return;
      if ((el.type === "checkbox" || el.type === "radio") && !el.checked)
        return;
      const associatedLabel = el.id
        ? form.querySelector(`label[for="${CSS.escape(el.id)}"]`)
        : null;
      const labelText = associatedLabel
        ? associatedLabel.textContent.trim()
        : el.placeholder || el.name || el.id || "field";
      const value = (el.value || "").toString().trim();
      if (value) parts.push(`${labelText}: ${value}`);
    });
    return parts.join("\n");
  }

  function getEmailInput(form) {
    return (
      form.querySelector('input[type="email"]') ||
      form.querySelector('input[name*="email" i]') ||
      form.querySelector('input[id*="email" i]')
    );
  }

  document.querySelectorAll('form[action="/submit"]').forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      // Email validation if present
      const emailEl = getEmailInput(form);
      if (emailEl) {
        const email = (emailEl.value || "").trim();
        const emailRegex = /^[\w.!#$%&'*+/=?^`{|}~-]+@[\w-]+(?:\.[\w-]+)+$/;
        emailEl.setCustomValidity("");
        if (!emailRegex.test(email)) {
          emailEl.setCustomValidity("Please enter a valid email address.");
          emailEl.reportValidity();
          emailEl.focus();
          return;
        }
      }
      const text = buildWhatsAppMessage(form);
      const base = `https://wa.me/${WHATSAPP_NUMBER}`;
      const query = `text=${encodeURIComponent(text)}&ref=${encodeURIComponent(
        window.location.pathname
      )}`;
      const url = `${base}?${query}`;
      // Prefer opening a new tab in the same browser window
      const win = window.open(url, "_blank");
      // If blocked, navigate current tab as a fallback
      if (!win) {
        window.location.assign(url);
      }
      // Reset after a short delay to avoid clearing before navigation on slow devices
      setTimeout(() => form.reset(), 300);
    });
  });

  // When closing the contact modal/overlay, reset its form
  function resetContactForms() {
    document
      .querySelectorAll(".contact-form-page form")
      .forEach((f) => f.reset());
  }
  document
    .querySelectorAll(".close-contact-us-page, .contact-us-overlay")
    .forEach((el) => {
      el.addEventListener("click", () => {
        // delay until checkbox hides the panel, then reset
        setTimeout(resetContactForms, 0);
      });
    });
});

// Reset button: clear forms, files, errors, and switch back to HND
function resetProgramSelection() {
  // Clear each program form fields
  ["HND", "Bachelor", "Masters"].forEach((formId) => {
    const form = document.getElementById(formId);
    if (form) {
      form.reset();
      // Clear file inputs and inline error texts
      form.querySelectorAll('input[type="file"]').forEach((inp) => {
        inp.value = "";
        const err =
          inp.nextElementSibling &&
          inp.nextElementSibling.classList &&
          inp.nextElementSibling.classList.contains("file-error")
            ? inp.nextElementSibling
            : null;
        if (err) err.textContent = "";
      });
    }
  });

  // Reset radios and show HND form
  setActiveProgram("hnd", "HND");
}
