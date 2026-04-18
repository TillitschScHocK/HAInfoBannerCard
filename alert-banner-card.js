/* Alert Banner Card for Home Assistant
 * Repository: lovelace-alert-banner-card
 * File: alert-banner-card.js
 */

(() => {
  const CARD_VERSION = "1.2.0";

  // eslint-disable-next-line no-console
  console.info(
    `%c ALERT-BANNER-CARD %c v${CARD_VERSION} `,
    "background:#1976d2;color:#fff;font-weight:bold;border-radius:4px 0 0 4px;padding:2px 6px;",
    "background:#e8eaf6;color:#000;border-radius:0 4px 4px 0;padding:2px 6px;"
  );

  const SEVERITY_CONFIG = {
    info: {
      icon: "mdi:information-outline",
      color: "#1976d2",
      background: "rgba(25,118,210,0.12)",
    },
    success: {
      icon: "mdi:check-circle-outline",
      color: "#388e3c",
      background: "rgba(56,142,60,0.12)",
    },
    warning: {
      icon: "mdi:alert-outline",
      color: "#f57c00",
      background: "rgba(245,124,0,0.12)",
    },
    error: {
      icon: "mdi:alert-circle-outline",
      color: "#d32f2f",
      background: "rgba(211,47,47,0.12)",
    },
    custom: {
      icon: "mdi:bell-outline",
      color: "var(--primary-color)",
      background: "rgba(0,0,0,0.03)",
    },
  };

  class AlertBannerCard extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });

      this._config = null;
      this._hass = null;
      this._dismissed = false;
      this._autoRestoreTimeout = null;
      this._previousRenderData = null;
      this._controlStateKey = undefined;
      this._collapsedOpen = false;

      const style = document.createElement("style");
      style.textContent = this._buildStyle();
      this.shadowRoot.appendChild(style);

      this._container = document.createElement("div");
      this._container.classList.add("wrapper");
      this.shadowRoot.appendChild(this._container);
    }

    setConfig(config) {
      if (!config) {
        throw new Error("Invalid configuration for alert-banner-card.");
      }

      if (!config.message && !config.entity_message) {
        throw new Error(
          "alert-banner-card: Either \"message\" or \"entity_message\" must be set in the configuration."
        );
      }

      const defaults = {
        title: undefined,
        severity: "warning",
        icon: undefined,
        show_icon: true,
        dismissible: true,
        position: "bottom",
        float_side: "right",
        color: undefined,
        background: undefined,
        text_color: undefined,
        border_radius: "12px",
        font_size: "0.95rem",
        padding: "10px 16px",
        max_width: "900px",
        offset: "20px",
        z_index: 500,
        animate: true,
        conditions: [],
        dismiss_entity: undefined,
        dismiss_service: undefined,
        dismiss_service_data: undefined,
        auto_restore_ms: undefined,
        control_entity: undefined,
        collapsed_mode: false,
        collapsed_icon: undefined,
        collapsed_position: "top-right",
      };

      this._config = Object.assign({}, defaults, config);
      this._dismissed = false;
      this._collapsedOpen = false;
      this._clearAutoRestore();
      this._controlStateKey = undefined;

      this._previousRenderData = null;

      if (this._hass) {
        const data = this._computeRenderData();
        this._render(data);
        this._previousRenderData = data;
      }
    }

    set hass(hass) {
      this._hass = hass;
      if (!this._config) {
        return;
      }

      const data = this._computeRenderData();
      if (!this._hasRenderDataChanged(data)) {
        return;
      }

      this._render(data);
      this._previousRenderData = data;
    }

    getCardSize() {
      if (!this._config || !this._previousRenderData) {
        return 0;
      }

      if (this._config.position !== "inline") {
        return 0;
      }

      if (!this._previousRenderData.visible || this._dismissed) {
        return 0;
      }

      return 1;
    }

    getGridOptions() {
      if (this._config && this._config.position === "inline") {
        return {
          columns: 12,
          rows: 1,
        };
      }

      return {
        columns: 0,
        rows: 0,
      };
    }

    static getStubConfig() {
      return {
        message: "System will restart in 10 minutes!",
        severity: "warning",
      };
    }

    static getConfigElement() {
      return document.createElement("alert-banner-card-editor");
    }

    disconnectedCallback() {
      this._clearAutoRestore();
    }

    _buildStyle() {
      return `
        :host {
          display: block;
          box-sizing: border-box;
          font-family: var(--paper-font-body1_-_font-family, inherit);
        }

        .wrapper {
          box-sizing: border-box;
        }

        .banner-wrapper {
          box-sizing: border-box;
          pointer-events: auto;
        }

        .banner-wrapper.inline {
          position: relative;
          width: 100%;
        }

        .banner-wrapper.floating {
          position: fixed;
          max-width: var(--banner-max-width, 900px);
          z-index: var(--banner-z-index, 500);
        }

        .banner-wrapper.floating.bottom {
          bottom: calc(var(--banner-offset, 20px) + env(safe-area-inset-bottom, 0px));
        }

        .banner-wrapper.floating.top {
          top: calc(var(--banner-offset, 20px) + env(safe-area-inset-top, 0px));
        }

        .banner-wrapper.floating.right {
          right: var(--banner-offset, 20px);
        }

        .banner-wrapper.floating.left {
          left: var(--banner-offset, 20px);
        }

        .banner-wrapper.floating.center {
          left: 50%;
          transform: translateX(-50%);
        }

        @media (max-width: 768px) {
          .banner-wrapper.floating {
            left: 0 !important;
            right: 0 !important;
            transform: none !important;
          }

          .banner-wrapper.floating .banner {
            margin: 0 var(--banner-offset, 20px);
            max-width: none;
          }
        }

        .banner {
          display: flex;
          align-items: flex-start;
          box-sizing: border-box;
          width: 100%;
          border-left: 4px solid var(--banner-accent-color, var(--primary-color));
          background-color: var(--banner-background-color, var(--card-background-color, #fff));
          color: var(--banner-text-color, var(--primary-text-color, #000));
          border-radius: var(--banner-border-radius, 12px);
          padding: var(--banner-padding, 10px 16px);
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          font-size: var(--banner-font-size, 0.95rem);
        }

        .banner-content {
          display: flex;
          align-items: flex-start;
          width: 100%;
          gap: 10px;
        }

        .icon-container {
          flex: 0 0 auto;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: var(--banner-icon-background, rgba(0,0,0,0.05));
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 2px;
        }

        .icon-container ha-icon {
          --mdc-icon-size: 20px;
          color: var(--banner-accent-color, var(--primary-color));
        }

        .text-container {
          flex: 1 1 auto;
          min-width: 0;
        }

        .title {
          font-weight: 600;
          margin: 0 0 4px 0;
        }

        .message {
          margin: 0;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        .dismiss-container {
          flex: 0 0 auto;
          display: flex;
          align-items: flex-start;
          margin-left: 8px;
        }

        .dismiss-button {
          border: none;
          outline: none;
          background: transparent;
          color: inherit;
          cursor: pointer;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          line-height: 1;
          padding: 0;
          transition: background-color 120ms ease-in-out, transform 120ms ease-in-out;
        }

        .dismiss-button:hover {
          background-color: rgba(0,0,0,0.04);
          transform: translateY(-1px);
        }

        .dismiss-button:active {
          background-color: rgba(0,0,0,0.08);
          transform: translateY(0);
        }

        .banner-wrapper.enter .banner {
          animation: banner-enter 350ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .banner-wrapper.leave .banner {
          animation: banner-leave 200ms ease-out forwards;
        }

        @keyframes banner-enter {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes banner-leave {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(20px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .banner-wrapper.enter .banner,
          .banner-wrapper.leave 
