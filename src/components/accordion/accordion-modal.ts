import { createModal } from "../modal/modal.ts";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
}

interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
}

function validateForm(data: FormData): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.firstName.trim()) {
    errors.firstName = "First name is required";
  }

  if (!data.lastName.trim()) {
    errors.lastName = "Last name is required";
  }

  if (!data.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Please enter a valid email address";
  }

  return errors;
}

function showFieldError(field: HTMLElement, message: string) {
  // Remove existing error
  const existingError = field.parentElement?.querySelector(".error-message");
  if (existingError) {
    existingError.remove();
  }

  // Add error styling to input
  field.classList.add("error");
  field.setAttribute("aria-invalid", "true");
  field.setAttribute("aria-describedby", `error-${field.id}`);

  // Create and add error message
  const errorElement = document.createElement("div");
  errorElement.className = "error-message";
  errorElement.id = `error-${field.id}`;
  errorElement.textContent = message;
  errorElement.setAttribute("role", "alert");
  errorElement.style.cssText = `
        color: #dc3545;
        font-size: 14px;
        margin-top: 4px;
        font-weight: 500;
    `;

  field.parentElement?.appendChild(errorElement);
}

function clearFieldError(field: HTMLElement) {
  field.classList.remove("error");
  field.removeAttribute("aria-invalid");
  field.removeAttribute("aria-describedby");
  const existingError = field.parentElement?.querySelector(".error-message");
  if (existingError) {
    existingError.remove();
  }
}

export async function renderAccordionModal() {
  const modalContent = document.createElement("form");
  modalContent.classList.add("contact-us-modal");
  modalContent.setAttribute("role", "dialog");
  modalContent.setAttribute("aria-labelledby", "contact-modal-title");
  modalContent.setAttribute("aria-describedby", "contact-modal-description");
  modalContent.setAttribute("aria-modal", "true");
  modalContent.setAttribute("novalidate", "");

  modalContent.innerHTML = `
        <h2 id="contact-modal-title">Contact Us</h2>
        <p id="contact-modal-description">Please fill out the form below to contact us. All fields marked with an asterisk (*) are required.</p>
        <div>
            <div class="form-group">
                <label for="firstName">First Name <span aria-label="required">*</span></label>
                <input type="text" id="firstName" name="firstName" required aria-required="true" autocomplete="given-name">
            </div>
            <div class="form-group">
                <label for="lastName">Last Name <span aria-label="required">*</span></label>
                <input type="text" id="lastName" name="lastName" required aria-required="true" autocomplete="family-name">
            </div>
            <div class="form-group">
                <label for="email">Email <span aria-label="required">*</span></label>
                <input type="email" id="email" name="email" required aria-required="true" autocomplete="email">
            </div>
            <div class="form-group">
                <label for="message">Message</label>
                <textarea id="message" name="message" rows="4" aria-describedby="message-help"></textarea>
                <div id="message-help" class="help-text">Optional: Please provide any additional information or questions you may have.</div>
            </div>
            <button class="button secondary" type="submit" aria-describedby="submit-help">Submit</button>
            <div id="submit-help" class="help-text">Press Enter or click to submit the form.</div>
        </div>
    `;

  // Add input event listeners to clear errors on input
  const requiredFields = ["firstName", "lastName", "email"];
  requiredFields.forEach((fieldName) => {
    const field = modalContent.querySelector(
      `#${fieldName}`
    ) as HTMLInputElement;
    if (field) {
      field.addEventListener("input", () => {
        clearFieldError(field);
      });

      // Add keyboard navigation for form fields
      field.addEventListener("keydown", (e: Event) => {
        const keyEvent = e as KeyboardEvent;
        if (keyEvent.key === "Tab") {
          // Allow normal tab navigation
          return;
        }

        if (keyEvent.key === "Escape") {
          // Close modal on Escape
          const dialog = modalContent.closest("dialog");
          if (dialog) {
            dialog.close();
          }
        }
      });
    }
  });

  // Add keyboard navigation for textarea
  const textarea = modalContent.querySelector(
    "#message"
  ) as HTMLTextAreaElement;
  if (textarea) {
    textarea.addEventListener("keydown", (e: Event) => {
      const keyEvent = e as KeyboardEvent;
      if (keyEvent.key === "Escape") {
        const dialog = modalContent.closest("dialog");
        if (dialog) {
          dialog.close();
        }
      }
    });
  }

  modalContent.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(modalContent);
    const data: FormData = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      message: formData.get("message") as string,
    };

    const errors = validateForm(data);

    // Clear all previous errors
    requiredFields.forEach((fieldName) => {
      const field = modalContent.querySelector(
        `#${fieldName}`
      ) as HTMLInputElement;
      if (field) {
        clearFieldError(field);
      }
    });

    // Show errors if any
    if (Object.keys(errors).length > 0) {
      // Create error summary for screen readers
      const errorSummary = document.createElement("div");
      errorSummary.setAttribute("role", "alert");
      errorSummary.setAttribute("aria-live", "polite");
      errorSummary.className = "error-summary";
      errorSummary.style.cssText = `
        color: #dc3545;
        font-size: 14px;
        margin-bottom: 16px;
        padding: 8px;
        border: 1px solid #dc3545;
        border-radius: 4px;
        background-color: #f8d7da;
      `;

      const errorList = Object.values(errors).join(", ");
      errorSummary.textContent = `Please fix the following errors: ${errorList}`;

      // Insert error summary at the top of the form
      const formTop = modalContent.querySelector("div");
      if (formTop) {
        formTop.insertBefore(errorSummary, formTop.firstChild);
      }

      Object.entries(errors).forEach(([fieldName, errorMessage]) => {
        const field = modalContent.querySelector(
          `#${fieldName}`
        ) as HTMLInputElement;
        if (field && errorMessage) {
          showFieldError(field, errorMessage);
        }
      });

      // Focus on first error field
      const firstErrorField = modalContent.querySelector(
        ".error"
      ) as HTMLElement;
      if (firstErrorField) {
        firstErrorField.focus();
      }

      return;
    }

    // Form is valid, show success message
    const successMessage = document.createElement("div");
    successMessage.setAttribute("role", "alert");
    successMessage.setAttribute("aria-live", "polite");
    successMessage.className = "success-message";
    successMessage.style.cssText = `
      color: #28a745;
      font-size: 14px;
      margin-bottom: 16px;
      padding: 8px;
      border: 1px solid #28a745;
      border-radius: 4px;
      background-color: #d4edda;
    `;
    successMessage.textContent = "Form submitted successfully!";

    // Insert success message at the top of the form
    const formTop = modalContent.querySelector("div");
    if (formTop) {
      formTop.insertBefore(successMessage, formTop.firstChild);
    }

    // Close the modal after a short delay to allow screen readers to announce success
    setTimeout(() => {
      const dialog = modalContent.closest("dialog");
      if (dialog) {
        dialog.close();
      }
    }, 2000);
  });

  const { block, showModal } = await createModal({
    contentNodes: [modalContent],
  });
  document.body.appendChild(block);
  showModal();

  // Focus on first input field when modal opens
  setTimeout(() => {
    const firstInput = modalContent.querySelector("input") as HTMLInputElement;
    if (firstInput) {
      firstInput.focus();
    }
  }, 100);
}
