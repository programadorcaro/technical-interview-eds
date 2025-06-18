type AccordionItem = {
  title: string;
  content: string;
};

// ## Challenge Requirements

// ### 2. Modal Integration
// - Located at `src/components/accordion/accordion-modal.ts`
// - Open the accordion modal when clicking on the contact us button, you have free reign for where to add the button
// - Add validation to the form. First name, last name, and email should be required
// - Display clear and user-friendly error messages

// ## Stretch Goals
// If time permits, consider implementing these additional features:

// ### Accessibility Enhancements
// - Add keyboard navigation support
// - Implement ARIA attributes and roles
// - Add proper focus management
// - Ensure screen reader compatibility
// - Add appropriate aria-labels and descriptions

function decorateAccordion(accordion: HTMLElement) {
  const [header, ...list] = accordion.querySelectorAll("& > div");
  header.setAttribute("class", "accordion-main-title-block");

  const listItems = Array.from(list);
  const ITEMS_PER_LOAD = 4;
  let currentlyVisible = ITEMS_PER_LOAD;

  // Hide all items initially
  listItems.forEach((item, index) => {
    if (index >= ITEMS_PER_LOAD) {
      (item as HTMLElement).style.display = "none";
    }
  });

  // Create and add accordion functionality to visible items
  function setupAccordionItems(items: Element[]) {
    for (const item of items) {
      item.setAttribute("class", "accordion-item");
      const header = item.querySelector("& > div");
      const content = item.querySelector("& > div:nth-child(2)");

      if (content) {
        content.setAttribute("class", "accordion-content");
      }

      if (!header) continue;
      header.setAttribute("class", "accordion-header");

      // Create and append chevron image
      const chevron = document.createElement("img");
      chevron.src = "../../images/chevron-down-black.svg";
      chevron.alt = "Toggle accordion";
      chevron.className = "accordion-chevron";
      header.appendChild(chevron);

      item.addEventListener("click", () => {
        console.log("clicked");
        const isOpen = header.getAttribute("data-open") === "true";
        header.setAttribute("data-open", isOpen ? "false" : "true");
      });
    }
  }

  // Setup initial visible items
  setupAccordionItems(listItems.slice(0, ITEMS_PER_LOAD));

  // Create Load More button
  const loadMoreButton = document.createElement("button");
  loadMoreButton.textContent = "Load More";
  loadMoreButton.className = "load-more-button";

  // Load More functionality
  loadMoreButton.addEventListener("click", () => {
    const nextItems = listItems.slice(
      currentlyVisible,
      currentlyVisible + ITEMS_PER_LOAD
    );

    if (nextItems.length > 0) {
      nextItems.forEach((item) => {
        (item as HTMLElement).style.display = "block";
      });

      // Setup accordion functionality for newly loaded items
      setupAccordionItems(nextItems);

      currentlyVisible += ITEMS_PER_LOAD;

      // Hide button if all items are loaded
      if (currentlyVisible >= listItems.length) {
        loadMoreButton.style.display = "none";
      }
    }
  });

  // Hide button if there are 4 or fewer items total
  if (listItems.length <= ITEMS_PER_LOAD) {
    loadMoreButton.style.display = "none";
  }

  // Append the Load More button to the accordion
  accordion.appendChild(loadMoreButton);
}

window.addEventListener("DOMContentLoaded", () => {
  const accordion = document.querySelector<HTMLElement>(".accordion");
  if (!accordion) return;
  decorateAccordion(accordion);
});
