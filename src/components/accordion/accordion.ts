import { renderAccordionModal } from "./accordion-modal.ts";

type AccordionItem = {
  title: string;
  content: string;
};

function decorateAccordion(accordion: HTMLElement) {
  const [header, ...list] = accordion.querySelectorAll("& > div");
  header.setAttribute("class", "accordion-main-title-block");

  const contactUsHeader = header.querySelector("div:last-child");

  if (contactUsHeader) {
    contactUsHeader.textContent = "Contact Us";
    contactUsHeader.setAttribute("class", "contact-us-button");
    contactUsHeader.role = "button";
    contactUsHeader.setAttribute("tabindex", "0");
    contactUsHeader.setAttribute("aria-label", "Open contact us form");
    contactUsHeader.addEventListener("click", () => {
      renderAccordionModal();
    });
    contactUsHeader.addEventListener("keydown", (e: Event) => {
      const keyEvent = e as KeyboardEvent;
      if (keyEvent.key === "Enter" || keyEvent.key === " ") {
        e.preventDefault();
        renderAccordionModal();
      }
    });
    header.appendChild(contactUsHeader);
  }

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
        content.setAttribute("aria-hidden", "true");
      }

      if (!header) continue;
      header.setAttribute("class", "accordion-header");
      header.setAttribute("role", "button");
      header.setAttribute("tabindex", "0");
      header.setAttribute("aria-expanded", "false");
      header.setAttribute(
        "aria-controls",
        `accordion-content-${Math.random().toString(36).substr(2, 9)}`
      );

      // Create and append chevron image
      const chevron = document.createElement("img");
      chevron.src = "../../images/chevron-down-black.svg";
      chevron.alt = "Toggle accordion";
      chevron.className = "accordion-chevron";
      chevron.setAttribute("aria-hidden", "true");
      header.appendChild(chevron);

      // Add unique ID to content for aria-controls
      if (content) {
        const contentId = header.getAttribute("aria-controls");
        if (contentId) {
          content.setAttribute("id", contentId);
        }
      }

      const toggleAccordion = () => {
        const isOpen = header.getAttribute("data-open") === "true";
        const newState = !isOpen;

        header.setAttribute("data-open", newState.toString());
        header.setAttribute("aria-expanded", newState.toString());

        if (content) {
          content.setAttribute("aria-hidden", (!newState).toString());
        }

        // Announce state change to screen readers
        const announcement = document.createElement("div");
        announcement.setAttribute("aria-live", "polite");
        announcement.setAttribute("aria-atomic", "true");
        announcement.style.position = "absolute";
        announcement.style.left = "-10000px";
        announcement.style.width = "1px";
        announcement.style.height = "1px";
        announcement.style.overflow = "hidden";
        announcement.textContent = `Accordion ${
          newState ? "expanded" : "collapsed"
        }`;
        document.body.appendChild(announcement);

        setTimeout(() => {
          document.body.removeChild(announcement);
        }, 100);
      };

      item.addEventListener("click", toggleAccordion);

      // Keyboard navigation
      header.addEventListener("keydown", (e: Event) => {
        const keyEvent = e as KeyboardEvent;
        switch (keyEvent.key) {
          case "Enter":
          case " ":
            e.preventDefault();
            toggleAccordion();
            break;
          case "ArrowDown":
            e.preventDefault();
            const nextItem = item.nextElementSibling;
            if (nextItem && nextItem.classList.contains("accordion-item")) {
              const nextHeader = nextItem.querySelector(
                ".accordion-header"
              ) as HTMLElement;
              nextHeader?.focus();
            }
            break;
          case "ArrowUp":
            e.preventDefault();
            const prevItem = item.previousElementSibling;
            if (prevItem && prevItem.classList.contains("accordion-item")) {
              const prevHeader = prevItem.querySelector(
                ".accordion-header"
              ) as HTMLElement;
              prevHeader?.focus();
            }
            break;
          case "Home":
            e.preventDefault();
            const firstHeader = accordion.querySelector(
              ".accordion-header"
            ) as HTMLElement;
            firstHeader?.focus();
            break;
          case "End":
            e.preventDefault();
            const headers = accordion.querySelectorAll(".accordion-header");
            const lastHeader = headers[headers.length - 1] as HTMLElement;
            lastHeader?.focus();
            break;
        }
      });
    }
  }

  // Setup initial visible items
  setupAccordionItems(listItems.slice(0, ITEMS_PER_LOAD));

  // Create Load More button
  const loadMoreButton = document.createElement("button");
  loadMoreButton.textContent = "Load More";
  loadMoreButton.className = "load-more-button";
  loadMoreButton.setAttribute(
    "aria-label",
    `Load ${Math.min(
      ITEMS_PER_LOAD,
      listItems.length - ITEMS_PER_LOAD
    )} more accordion items`
  );

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

      // Update button label
      const remainingItems = listItems.length - currentlyVisible;
      if (remainingItems > 0) {
        loadMoreButton.setAttribute(
          "aria-label",
          `Load ${Math.min(
            ITEMS_PER_LOAD,
            remainingItems
          )} more accordion items`
        );
      }

      // Hide button if all items are loaded
      if (currentlyVisible >= listItems.length) {
        loadMoreButton.style.display = "none";
      }

      // Announce to screen readers
      const announcement = document.createElement("div");
      announcement.setAttribute("aria-live", "polite");
      announcement.setAttribute("aria-atomic", "true");
      announcement.style.position = "absolute";
      announcement.style.left = "-10000px";
      announcement.style.width = "1px";
      announcement.style.height = "1px";
      announcement.style.overflow = "hidden";
      announcement.textContent = `Loaded ${nextItems.length} more items`;
      document.body.appendChild(announcement);

      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 100);
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

  // Set up accordion container with proper ARIA attributes
  accordion.setAttribute("role", "region");
  accordion.setAttribute("aria-label", "Accordion navigation");

  decorateAccordion(accordion);
});
