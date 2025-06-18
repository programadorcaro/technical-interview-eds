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

  // Create and add error message
  const errorElement = document.createElement("div");
  errorElement.className = "error-message";
  errorElement.textContent = message;
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
  const existingError = field.parentElement?.querySelector(".error-message");
  if (existingError) {
    existingError.remove();
  }
}

export async function renderAccordionModal() {
  const modalContent = document.createElement("form");
  modalContent.classList.add("contact-us-modal");
  modalContent.innerHTML = `
        <h2>Contact Us</h2>
        <div>
            <div class="form-group">
                <label for="firstName">First Name *</label>
                <input type="text" id="firstName" name="firstName" required>
            </div>
            <div class="form-group">
                <label for="lastName">Last Name *</label>
                <input type="text" id="lastName" name="lastName" required>
            </div>
            <div class="form-group">
                <label for="email">Email *</label>
                <input type="email" id="email" name="email" required>
            </div>
            <div class="form-group">
                <label for="message">Message</label>
                <textarea id="message" name="message" rows="4"></textarea>
            </div>
            <button class="button secondary" type="submit">Submit</button>
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
    }
  });

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
      Object.entries(errors).forEach(([fieldName, errorMessage]) => {
        const field = modalContent.querySelector(
          `#${fieldName}`
        ) as HTMLInputElement;
        if (field && errorMessage) {
          showFieldError(field, errorMessage);
        }
      });
      return;
    }

    // Form is valid, show success message
    alert("Form submitted successfully!\n\n" + JSON.stringify(data, null, 2));

    // Close the modal
    const dialog = modalContent.closest("dialog");
    if (dialog) {
      dialog.close();
    }
  });

  const { block, showModal } = await createModal({
    contentNodes: [modalContent],
  });
  document.body.appendChild(block);
  showModal();
}
