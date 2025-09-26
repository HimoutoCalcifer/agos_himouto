/**
 * AGOS Main Gateway Controller
 * Central navigation and system overview
 *
 * Author: cri-kee-zel
 * Date: 2025-08-18 13:06:47 UTC
 */

// Main class for controlling the AGOS gateway functionality
class AGOSMainGateway {
  // Constructor - runs when new instance is created
  constructor() {
    // System state object to track current status and data
    this.state = {
      systemStatus: "online", // Overall system status
      sensors: {
        online: 3, // Number of sensors currently online
        total: 3, // Total number of sensors in system
      },
      currentData: {
        waterLevel: 47.8, // Current water level in cm
        flowRate: 1.24, // Current flow rate in m/s
        alertStatus: "NORMAL", // Current alert level
        batteryLevel: 85, // Battery percentage
      },
      systemStats: {
        aiAccuracy: 87.2, // AI model accuracy percentage
        uptime: 99.9, // System uptime percentage
      },
    };

    // Initialize the system when instance is created
    this.init();
  }

  /**
   * Initialize the main gateway
   * This method sets up all the initial functionality
   */
  init() {
    console.log("🌊 AGOS Main Gateway Initializing...");

    // Call individual initialization methods
    this.updateTimestamp(); // Set initial timestamp
    this.updateSystemStats(); // Display system statistics
    this.updateStatusOverview(); // Show current sensor readings
    this.setupAnimations(); // Initialize card animations
    this.startRealTimeUpdates(); // Begin periodic updates

    console.log("✅ AGOS Main Gateway Ready");
  }

  /**
   * Fetch system data from API
   * Retrieves live data from the server
   */
  async fetchSystemData() {
    try {
      const response = await fetch("/api/system-overview");
      const data = await response.json();

      // Update state with new data
      this.state = { ...this.state, ...data };

      console.log("📊 System data updated from API");
    } catch (error) {
      console.warn(
        "⚠️ Failed to fetch system data, using simulated data:",
        error
      );
    }
  }

  /**
   * Navigate to specific module
   * @param {string} moduleUrl - The URL/filename of the module to navigate to
   */
  navigateToModule(moduleUrl) {
    console.log(`🚀 Navigating to: ${moduleUrl}`);
    console.log("🔧 Creating loading overlay...");

    // Create and show loading overlay for better user experience
    const loadingOverlay = this.createLoadingOverlay();
    document.body.appendChild(loadingOverlay);

    console.log("🔧 Loading overlay added, waiting 800ms...");

    // Wait 800ms before navigation to show loading animation
    setTimeout(() => {
      console.log(`🔧 Navigating now to: ${moduleUrl}`);
      window.location.href = moduleUrl; // Navigate to the requested module
    }, 800);
  }

  /**
   * Create loading overlay for navigation
   * @returns {HTMLElement} - The loading overlay element
   */
  createLoadingOverlay() {
    // Create new div element for the overlay
    const overlay = document.createElement("div");

    // Set the HTML content of the overlay with inline styles
    overlay.innerHTML = `
            <div style="
                position: fixed;                  /* Fixed position to cover entire screen */
                top: 0;                          /* Align to top */
                left: 0;                         /* Align to left */
                width: 100%;                     /* Full width */
                height: 100%;                    /* Full height */
                background: rgba(15, 23, 42, 0.9); /* Semi-transparent dark background */
                display: flex;                   /* Flexbox for centering */
                align-items: center;             /* Center vertically */
                justify-content: center;         /* Center horizontally */
                z-index: 9999;                   /* High z-index to appear above everything */
                backdrop-filter: blur(10px);     /* Blur effect behind overlay */
            ">
                <div style="
                    text-align: center;          /* Center the content */
                    color: white;                /* White text */
                ">
                    <div style="
                        font-size: 3rem;            /* Large emoji */
                        margin-bottom: 1rem;        /* Space below */
                        animation: spin 1s linear infinite; /* Spinning animation */
                    ">🌊</div>
                    <p style="font-size: 1.2rem; opacity: 0.9;">Loading module...</p>
                </div>
            </div>
        `;

    // Create CSS style element for the spin animation
    const style = document.createElement("style");
    style.textContent = `
            @keyframes spin {
                from { transform: rotate(0deg); }   /* Start at 0 degrees */
                to { transform: rotate(360deg); }   /* End at 360 degrees */
            }
        `;
    document.head.appendChild(style); // Add styles to document head

    return overlay; // Return the created overlay element
  }

  /**
   * Update timestamp display
   * Updates the current time shown in the header
   */
  updateTimestamp() {
    // Get the timestamp display element
    const timeElement = document.getElementById("current-time");
    if (timeElement) {
      const now = new Date(); // Get current date and time
      // Format as YYYY-MM-DD HH:MM:SS UTC
      const utcString =
        now.toISOString().slice(0, 19).replace("T", " ") + " UTC";
      timeElement.textContent = utcString; // Update the display
    }
  }

  /**
   * Update system statistics
   * Updates the statistics shown in the welcome section
   */
  updateSystemStats() {
    // Update sensors online count
    const sensorsElement = document.getElementById("sensors-online");
    if (sensorsElement) {
      sensorsElement.textContent = this.state.sensors.online;
    }

    // Update AI accuracy percentage
    const aiAccuracyElement = document.getElementById("ai-accuracy");
    if (aiAccuracyElement) {
      aiAccuracyElement.textContent = `${this.state.systemStats.aiAccuracy}%`;
    }

    // Update system uptime percentage
    const uptimeElement = document.getElementById("uptime");
    if (uptimeElement) {
      uptimeElement.textContent = `${this.state.systemStats.uptime}%`;
    }
  }

  /**
   * Update status overview panel
   * Updates the real-time status readings in the overview panel
   */
  updateStatusOverview() {
    // Water level display update
    const waterLevelElement = document.getElementById("current-water-level");
    if (waterLevelElement) {
      waterLevelElement.textContent = `${this.state.currentData.waterLevel} cm`;
    }

    // Flow rate display update
    const flowRateElement = document.getElementById("current-flow-rate");
    if (flowRateElement) {
      flowRateElement.textContent = `${this.state.currentData.flowRate} m/s`;
    }

    // Alert status display update
    const alertStatusElement = document.getElementById("alert-status");
    if (alertStatusElement) {
      alertStatusElement.textContent = this.state.currentData.alertStatus;
    }

    // Battery level display update
    const batteryLevelElement = document.getElementById("battery-level");
    if (batteryLevelElement) {
      batteryLevelElement.textContent = `${this.state.currentData.batteryLevel}%`;
    }
  }

  /**
   * Setup module card animations
   * Adds entrance animations and interactive effects to module cards
   */
  setupAnimations() {
    // Get all module cards on the page
    const moduleCards = document.querySelectorAll(".module-card");

    // Loop through each card to set up animations
    moduleCards.forEach((card, index) => {
      // Stagger animation timing based on card position
      card.style.animationDelay = `${index * 0.1}s`;
      card.style.animation = "fadeInUp 0.6s ease-out forwards";

      // Add hover effects
      card.addEventListener("mouseenter", () => {
        card.style.transform = "translateY(-5px) scale(1.02)";
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "translateY(0) scale(1)";
      });
    });

    // Setup direct button click handlers as backup
    this.setupButtonHandlers();
  }

  /**
   * Setup direct button click handlers
   * Alternative to HTML onclick attributes
   */
  setupButtonHandlers() {
    console.log("🔧 Setting up button handlers...");

    // Get all module buttons
    const buttons = document.querySelectorAll(".module-btn");
    console.log(`🔧 Found ${buttons.length} module buttons`);

    buttons.forEach((button, index) => {
      console.log(`🔧 Setting up button ${index}:`, button.textContent.trim());

      // Add click event listener
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        console.log(`🔧 Button clicked:`, button.textContent.trim());

        // Determine the module URL based on button text or parent card
        let moduleUrl = "";
        const buttonText = button.textContent.toLowerCase();
        const card = button.closest(".module-card");
        const cardModule = card ? card.dataset.module : "";

        console.log(
          `🔧 Button text: ${buttonText}, Card module: ${cardModule}`
        );

        if (buttonText.includes("dashboard") || cardModule === "dashboard") {
          moduleUrl = "/dashboard";
        } else if (buttonText.includes("mapping") || cardModule === "mapping") {
          moduleUrl = "/mapping";
        } else if (
          buttonText.includes("analytics") ||
          cardModule === "analytics"
        ) {
          moduleUrl = "/analytics";
        } else if (
          buttonText.includes("emergency") ||
          cardModule === "emergency"
        ) {
          moduleUrl = "/emergency";
        }

        console.log(`🔧 Determined moduleUrl: ${moduleUrl}`);

        if (moduleUrl) {
          this.navigateToModule(moduleUrl);
        } else {
          console.error(
            "❌ Could not determine module URL for button:",
            button
          );
        }
      });
    });
  }

  /**
   * Start real-time updates
   * Begins periodic updates of system data
   */
  startRealTimeUpdates() {
    console.log("🔄 Starting real-time updates...");

    // Initial data fetch
    this.fetchSystemData();

    // Set up interval for periodic updates (every 5 seconds)
    setInterval(async () => {
      await this.fetchSystemData();
      this.updateTimestamp();
      this.updateSystemStats();
      this.updateStatusOverview();
    }, 5000);
  }
}

// Make navigateToModule available globally for onclick handlers
function navigateToModule(moduleUrl) {
  console.log(`🔧 Global navigateToModule called with: ${moduleUrl}`);

  if (window.agosMainGateway) {
    console.log("📱 Using AGOS gateway navigation");
    window.agosMainGateway.navigateToModule(moduleUrl);
  } else {
    console.log("📱 Using fallback direct navigation");
    // Fallback direct navigation
    window.location.href = moduleUrl;
  }
}

// Initialize the AGOS Main Gateway when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  console.log("🌊 AGOS Main Gateway Starting...");
  window.agosMainGateway = new AGOSMainGateway();
});
