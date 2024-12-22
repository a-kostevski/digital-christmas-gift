// ============================
// Configuration and Constants
// ============================
const CONFIG = {
  TIMEOUT_MS: 5000,
  ERROR_DISPLAY_TIME: 3000,
  ANIMATION_DURATION: 300,
};

const SECTIONS = {
  ANNOUNCEMENT: "announcement-section",
  CHARACTER_SELECTION: "character-selection-section",
};

const FIGHTERS_DATA = {
  fighters: {
    Maika: {
      imageUrl: "assets/img/maika.png",
      //bio: "A 10-month-old Rhodesian Ridgeback pup who secretly thinks she's a kangaroo,. While technically bred to hunt lions, Maika's more likely to be startled by her own shadow or a suspicious-looking leaf. Despite her impressive speed and agility, her courage stat suggests she'd rather bounce away from danger than face it. Currently mastering the art of being everywhere at once.",
      bio: "At just 10 months old, this Christmas puppy brings more energy than Santa's reindeer. While bred to hunt lions, our precious Maika would rather chase snowflakes and run from her own jingle bells. A bouncing bundle of holiday joy with the heart of a cautious elf - she might need some convincing that the obstacle course isn't hiding the abominable snowman!",
      stats: {
        strength: 40,
        intelligence: 43,
        dexterity: 77,
        endurance: 46,
        courage: 15,
        speed: 73,
      },
      advantages: ["Water enthusiast", "Agile and quick", "High energy"],
      limitations: ["Inexperienced", "Easily distracted", "Low courage"],
    },
    Leon: {
      imageUrl: "assets/img/leon.png",
      bio: "This 2.5-year-old gentle giant has the spirit of Santa but the grace of a snowman in spring! While not quite making the cut for Santa's problem-solving elf team, Leon brings the strength of all nine reindeer combined. His strategy for the obstacle course? Powering through like a Christmas train that forgot its brakes. Just don't expect him to read the course map - navigation isn't on his list of Christmas miracles!",
      //bio: "At 2.5 years old, this big fellow proves that brains aren't everything. Built like a tank but moves like one too. While not the sharpest tool in the shed, Leon makes up for it with unwavering loyalty and raw power. His strategy in any situation? If it can't be solved by brute force, you're simply not using enough of it. Just don't expect him to solve any puzzles... or find his way home without help.",
      stats: {
        strength: 84,
        intelligence: 18,
        dexterity: 27,
        endurance: 66,
        courage: 75,
        speed: 42,
      },
      advantages: [
        "Loyal companion",
        "Veteran runner",
        "High strength and constitution",
      ],
      limitations: ["Jealous tendencies", "Water phobia", "Flight risk"],
    },
  },
};
// ============================
// Custom Error Types
// ============================
class FighterSelectionError extends Error {
  constructor(message) {
    super(message);
    this.name = "FighterSelectionError";
  }
}

// ============================
// State Management
// ============================
const gameState = {
  selectedFighter: null,
  initialized: false,
};

// ============================
// Error Handling
// ============================
const showError = (message) => {
  console.log(message);
};
// ============================
// Data Validation
// ============================
const validateFighterData = (fighter) => {
  const requiredProps = ["stats", "advantages", "limitations"];
  const requiredStats = [
    "strength",
    "intelligence",
    "dexterity",
    "endurance",
    "courage",
    "speed",
  ];

  return (
    requiredProps.every(
      (prop) =>
        fighter.hasOwnProperty(prop) &&
        fighter[prop] !== null &&
        typeof fighter[prop] === "object",
    ) &&
    requiredStats.every(
      (stat) =>
        fighter.stats.hasOwnProperty(stat) &&
        typeof fighter.stats[stat] === "number" &&
        fighter.stats[stat] >= 0 &&
        fighter.stats[stat] <= 100,
    )
  );
};

// ============================
// Fighter Management
// ============================
const loadFighters = async () => {
  try {
    return Object.entries(FIGHTERS_DATA.fighters).map(([id, fighter]) => {
      if (!validateFighterData(fighter)) {
        throw new FighterSelectionError(`Invalid fighter data for ${id}`);
      }
      return { id, ...fighter };
    });
  } catch (error) {
    showError(`Failed to load fighters: ${error.message}`);
    return [];
  }
};

// ============================
// UI Rendering
// ============================
const renderFighters = (fighters) => {
  const template = document.getElementById("fighter-template");
  const container = document.querySelector(".fighters-grid");

  fighters.forEach((fighter) => {
    const clone = document.importNode(template.content, true);

    const avatarImg = clone.querySelector(".avatar-img");
    const miniAvatarImg = clone.querySelector(".avatar-mini-img");
    avatarImg.src = fighter.imageUrl;
    miniAvatarImg.src = fighter.imageUrl;
    avatarImg.alt = `${fighter.id} avatar`;
    miniAvatarImg.alt = `${fighter.id} mini avatar`;

    // Set fighter name and header
    clone.querySelector(".fighter-header").textContent =
      fighter.id.toUpperCase();
    clone.querySelectorAll(".fighter-name").forEach((el) => {
      el.textContent = fighter.id;
    });

    if (fighter.bio) {
      const bioElement = clone.querySelector(".fighter-bio");
      bioElement.textContent = fighter.bio;
    }
    // Render stats
    const statsList = clone.querySelector(".stats-list");
    Object.entries(fighter.stats).forEach(([stat, value]) => {
      const li = document.createElement("li");
      li.innerHTML = `
                <div class="stat-label">
                    <span class="stat-name">${stat.toUpperCase()}</span>
                    <span class="stat-value">${value}</span>
                </div>
                <div class="stat-bar-bg">
                    <div class="stat-bar" style="width: ${value}%"></div>
                </div>
            `;
      statsList.appendChild(li);
    });

    // Render advantages and limitations
    const renderList = (items, container) => {
      items.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        container.appendChild(li);
      });
    };

    renderList(fighter.advantages, clone.querySelector(".advantages"));
    renderList(fighter.limitations, clone.querySelector(".limitations"));

    // Add event listener to select button
    const selectButton = clone.querySelector(".select-button");
    selectButton.addEventListener("click", () => selectFighter(fighter.id));

    container.appendChild(clone);
  });
};

// ============================
// Fighter Selection
// ============================
const selectFighter = (fighterId) => {
  try {
    if (gameState.selectedFighter === fighterId) {
      return;
    }

    // Update selection state
    gameState.selectedFighter = fighterId;

    // Show custom confirmation modal
    showConfirmationModal(fighterId);
  } catch (error) {
    showError("Error selecting fighter");
    console.error("Selection error:", error);
  }
};

const showConfirmationModal = (fighterId) => {
  const modal = document.getElementById("confirmationModal");
  const message = document.getElementById("confirmationMessage");
  const otherFighterId = Object.keys(FIGHTERS_DATA.fighters).find(
    (id) => id !== fighterId,
  );

  console.log(fighterId);
  message.textContent = `Are you sure you want ${fighterId}?`;
  modal.classList.add("showing");

  // Handle confirmation
  document.getElementById("confirmChoice").onclick = () => {
    document.querySelectorAll(".fighter-container").forEach((container) => {
      container.classList.toggle(
        "selected",
        container.querySelector(".fighter-name").textContent === fighterId,
      );
    });
    modal.classList.remove("showing");
    handleConfirmedSelection(fighterId);
  };

  // Handle cancellation
  document.getElementById("cancelChoice").onclick = () => {
    modal.classList.remove("showing");
    gameState.selectedFighter = null;
    document.querySelectorAll(".fighter-container").forEach((container) => {
      container.classList.remove("selected");
    });
  };
};
// ============================
// Event Handlers
// ============================
const setupEventListeners = () => {
  // Handle keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      // Cancel current selection
      if (gameState.selectedFighter) {
        gameState.selectedFighter = null;
        document.querySelectorAll(".fighter-container").forEach((container) => {
          container.classList.remove("selected");
        });
      }

      // Close modal if it's open
      const modal = document.getElementById("confirmationModal");
      if (modal.classList.contains("showing")) {
        modal.classList.remove("showing");
        gameState.selectedFighter = null;
        document.querySelectorAll(".fighter-container").forEach((container) => {
          container.classList.remove("selected");
        });
      }
    }
  });
};

// ============================
// Selection Handler
// ============================
const handleConfirmedSelection = (fighterId) => {
  // Here you can add what happens after a fighter is selected
  console.log(`Fighter ${fighterId} selected!`);
  // For example, redirect to game page or show next screen
};

// ============================
// Initialization
// ============================
//
//

//// Add this to your initialization function
const initNavigation = () => {
  document.body.classList.add("no-scroll");

  const openButton = document.getElementById("open-button");
  const openDiv = document.getElementById("open-div");
  const continueDiv = document.getElementById("continue-div");
  const continueButton = document.getElementById("continue-button");
  const announcementSection = document.getElementById("announcement-section");
  const characterSelectionSection = document.getElementById(
    "character-selection-section",
  );

  openButton.addEventListener("click", function () {
    openDiv.classList.add("hidden-section");
    openDiv.classList.remove("active-section");
    continueDiv.classList.add("active-section");
    continueDiv.classList.remove("hidden-section");
  });

  continueButton.addEventListener("click", function () {
    document.body.classList.remove("no-scroll");
    // Hide the announcement section
    announcementSection.classList.add("hidden-section");
    announcementSection.classList.remove("active-section");

    // Show the character selection section
    characterSelectionSection.classList.add("active-section");
    characterSelectionSection.classList.remove("hidden-section");
  });
};

const initScrollIndicators = () => {
  if (window.innerWidth <= 768) {
    const fightersGrid = document.querySelector(".fighters-grid");
    const fighters = document.querySelectorAll(".fighter-container");

    // Create scroll indicators
    const indicatorContainer = document.createElement("div");
    indicatorContainer.className = "scroll-indicator";

    fighters.forEach((_, index) => {
      const dot = document.createElement("div");
      dot.className = "scroll-dot";
      if (index === 0) dot.classList.add("active");
      indicatorContainer.appendChild(dot);
    });

    // Insert indicators after the fighters grid
    fightersGrid.parentNode.insertBefore(
      indicatorContainer,
      fightersGrid.nextSibling,
    );

    // Update active dot on scroll
    fightersGrid.addEventListener("scroll", () => {
      const scrollPosition = fightersGrid.scrollLeft;
      const containerWidth = fightersGrid.offsetWidth;
      const activeIndex = Math.round(scrollPosition / containerWidth);

      document.querySelectorAll(".scroll-dot").forEach((dot, index) => {
        dot.classList.toggle("active", index === activeIndex);
      });
    });
  }
};

const initScrollArrows = () => {
  if (window.innerWidth <= 768) {
    const fightersGrid = document.querySelector(".fighters-grid");
    const leftArrow = document.querySelector(".scroll-left");
    const rightArrow = document.querySelector(".scroll-right");
    let hasScrolled = false;

    // Vertical scroll handler for the whole page
    const handleVerticalScroll = () => {
      const characterSection = document.getElementById(
        "character-selection-section",
      );
      const sectionTop = characterSection.offsetTop;
      const scrollPosition =
        window.pageYOffset || document.documentElement.scrollTop;

      // Check if we've scrolled to or past the character selection section
      if (scrollPosition >= sectionTop && !hasScrolled) {
        hasScrolled = true;
        // Show the right arrow since we're at the start
        rightArrow.classList.remove("hidden");
      }
    };

    // Horizontal scroll handler for the fighters grid
    const handleHorizontalScroll = () => {
      const isAtStart = fightersGrid.scrollLeft < fightersGrid.offsetWidth / 2;
      const isAtEnd = fightersGrid.scrollLeft >= fightersGrid.offsetWidth / 2;

      leftArrow.classList.toggle("hidden", isAtStart);
      rightArrow.classList.toggle("hidden", isAtEnd);
    };

    // Initial state - hide both arrows
    leftArrow.classList.add("hidden");
    rightArrow.classList.add("hidden");

    // Add scroll listeners
    window.addEventListener("scroll", handleVerticalScroll);
    fightersGrid.addEventListener("scroll", handleHorizontalScroll);

    // Scroll buttons functionality
    leftArrow.addEventListener("click", () => {
      fightersGrid.scrollTo({
        left: 0,
        behavior: "smooth",
      });
    });

    rightArrow.addEventListener("click", () => {
      fightersGrid.scrollTo({
        left: fightersGrid.scrollWidth,
        behavior: "smooth",
      });
    });
  }
};

const initStickyHeaders = () => {
  if (window.innerWidth <= 768) {
    const fightersGrid = document.querySelector(".fighters-grid");
    const fighters = document.querySelectorAll(".fighter-container");

    fightersGrid.addEventListener("scroll", () => {
      const scrollPosition = fightersGrid.scrollLeft;
      const containerWidth = fightersGrid.offsetWidth;

      fighters.forEach((fighter) => {
        const rect = fighter.getBoundingClientRect();
        const stickyHeader = fighter.querySelector(".fighter-sticky-header");

        // Check if the fighter container is more than 50% visible
        if (rect.left < containerWidth / 2 && rect.right > containerWidth / 2) {
          // This is the currently centered fighter
          document
            .querySelectorAll(".fighter-sticky-header")
            .forEach((header) => {
              header.classList.remove("visible");
            });
          stickyHeader.classList.add("visible");
        }
      });
    });

    // Handle vertical scroll for showing/hiding the sticky header
    window.addEventListener("scroll", () => {
      const characterSection = document.getElementById(
        "character-selection-section",
      );
      const sectionRect = characterSection.getBoundingClientRect();

      // Only show sticky headers if we've scrolled past the top of the section
      if (sectionRect.top < 0) {
        const scrollPosition = fightersGrid.scrollLeft;
        fighters.forEach((fighter) => {
          const rect = fighter.getBoundingClientRect();
          const stickyHeader = fighter.querySelector(".fighter-sticky-header");

          // Calculate how centered the fighter is
          const centerPoint = containerWidth / 2;
          const fighterCenter = rect.left + rect.width / 2;
          const distanceFromCenter = Math.abs(fighterCenter - centerPoint);

          if (distanceFromCenter < rect.width / 2) {
            stickyHeader.classList.add("visible");
          } else {
            stickyHeader.classList.remove("visible");
          }
        });
      } else {
        // Hide all sticky headers when section is at top
        document
          .querySelectorAll(".fighter-sticky-header")
          .forEach((header) => {
            header.classList.remove("visible");
          });
      }
    });
  }
};

const init = async () => {
  if (gameState.initialized) return;

  try {
    const fighters = await loadFighters();

    if (fighters.length === 0) {
      showError("No fighters available. Please try again later.");
      return;
    }

    renderFighters(fighters);
    setupEventListeners();
    initNavigation();
    initScrollIndicators();
    initScrollArrows();
    initStickyHeaders();
    gameState.initialized = true;
  } catch (error) {
    showError("Failed to initialize application");
    console.error("Initialization error:", error);
  }
};

// Start initialization when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

// Global error handling
window.addEventListener("error", (event) => {
  console.error("Global error:", event.error);
  showError("An unexpected error occurred. Please refresh the page.");
});
