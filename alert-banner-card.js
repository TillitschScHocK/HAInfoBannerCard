/* Alert Banner Card for Home Assistant
 * Repository: lovelace-alert-banner-card
 * File: alert-banner-card.js
 */

(() => {
  const CARD_VERSION = "1.1.0";

  // Console banner
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
        position: "bottom", // bottom | top | inline
        float_side: "right", // left | right | center
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
        // New options
        control_entity: undefined,
        collapsed_mode: false,
        collapsed_icon: undefined,
        collapsed_position: "top-right", // top-left | top-right | bottom-left | bottom-right
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
          .banner-wrapper.leave .banner {
            animation-duration: 0.01ms !important;
          }

          .dismiss-button {
            transition: none;
          }
        }

        /* Collapsed icon mode */
        .collapsed-icon-wrapper {
          position: fixed;
          z-index: var(--banner-z-index, 500);
        }

        .collapsed-icon-wrapper.top-left {
          top: calc(var(--banner-offset, 20px) + env(safe-area-inset-top, 0px));
          left: var(--banner-offset, 20px);
        }

        .collapsed-icon-wrapper.top-right {
          top: calc(var(--banner-offset, 20px) + env(safe-area-inset-top, 0px));
          right: var(--banner-offset, 20px);
        }

        .collapsed-icon-wrapper.bottom-left {
          bottom: calc(var(--banner-offset, 20px) + env(safe-area-inset-bottom, 0px));
          left: var(--banner-offset, 20px);
        }

        .collapsed-icon-wrapper.bottom-right {
          bottom: calc(var(--banner-offset, 20px) + env(safe-area-inset-bottom, 0px));
          right: var(--banner-offset, 20px);
        }

        @media (max-width: 768px) {
          .collapsed-icon-wrapper {
            /* Keep explicit positions but respect safe areas */
          }
        }

        .collapsed-icon-button {
          border: none;
          outline: none;
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--banner-accent-color, var(--primary-color));
          color: #fff;
          box-shadow: 0 4px 16px rgba(0,0,0,0.25);
          transition: transform 120ms ease-in-out, box-shadow 120ms ease-in-out, background-color 120ms ease-in-out;
        }

        .collapsed-icon-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.3);
        }

        .collapsed-icon-button:active {
          transform: translateY(0);
          box-shadow: 0 4px 16px rgba(0,0,0,0.25);
        }

        .collapsed-icon-button ha-icon {
          --mdc-icon-size: 22px;
          color: #fff;
        }
      `;
    }

    _hasRenderDataChanged(data) {
      if (!this._previousRenderData) {
        return true;
      }
      try {
        return JSON.stringify(this._previousRenderData) !== JSON.stringify(data);
      } catch (_e) {
        return true;
      }
    }

    _computeRenderData() {
      const hass = this._hass;
      const cfg = this._config;

      if (!hass || !cfg) {
        return { visible: false };
      }

      let message = cfg.message || "";

      if (message) {
        message = this._resolveTemplate(message, hass);
      }

      if (cfg.entity_message) {
        const entity = hass.states[cfg.entity_message];
        if (entity) {
          message = String(entity.state);
        } else {
          message = "";
        }
      }

      const severityKey = cfg.severity || "warning";
      const severity = SEVERITY_CONFIG[severityKey] ? severityKey : "warning";
      const severityDef = SEVERITY_CONFIG[severity];

      const icon = cfg.icon || severityDef.icon;
      const accentColor = cfg.color || severityDef.color;
      const backgroundColor = cfg.background || severityDef.background;
      const textColor = cfg.text_color || "var(--primary-text-color)";

      const floating = cfg.position !== "inline";
      const floatSide = floating ? cfg.float_side || "right" : undefined;

      const control = cfg.control_entity ? hass.states[cfg.control_entity] : undefined;
      const controlState = control ? String(control.state).toLowerCase() : undefined;
      let controlAllowed = true;

      if (cfg.control_entity) {
        controlAllowed = controlState === "on";

        if (controlState !== this._controlStateKey) {
          if (this._controlStateKey && controlState === "on") {
            this._dismissed = false;
            this._collapsedOpen = false;
            this._clearAutoRestore();
          }
          this._controlStateKey = controlState;
        }
      }

      const visibleBase = this._shouldShow(hass, message);
      const visible = controlAllowed && visibleBase;

      const iconBackground = this._alphaColor(accentColor, 0.22) || backgroundColor;

      const collapsed = cfg.collapsed_mode === true;
      const collapsedIcon = cfg.collapsed_icon || icon;
      const collapsedPosition = cfg.collapsed_position || "top-right";

      return {
        visible,
        message,
        title: cfg.title,
        icon,
        severity,
        accentColor,
        backgroundColor,
        textColor,
        floating,
        position: cfg.position,
        floatSide,
        dismissible: cfg.dismissible !== false,
        showIcon: cfg.show_icon !== false,
        borderRadius: cfg.border_radius,
        fontSize: cfg.font_size,
        padding: cfg.padding,
        maxWidth: cfg.max_width,
        offset: cfg.offset,
        zIndex: cfg.z_index,
        animate: cfg.animate !== false,
        hasMessage: !!message,
        iconBackground,
        collapsed,
        collapsedIcon,
        collapsedPosition,
      };
    }

    _shouldShow(hass, message) {
      const cfg = this._config;
      if (!cfg) {
        return false;
      }

      if (!message) {
        return false;
      }

      if (this._dismissed) {
        return false;
      }

      const dismissEntityId = cfg.dismiss_entity;
      if (dismissEntityId) {
        const entity = hass.states[dismissEntityId];
        const state = entity ? String(entity.state).toLowerCase() : undefined;
        if (state === "off" || state === "false" || state === "0" || state === "0.0") {
          return false;
        }
      }

      const conditions = Array.isArray(cfg.conditions) ? cfg.conditions : [];
      for (let i = 0; i < conditions.length; i += 1) {
        const cond = conditions[i];
        if (!this._evaluateCondition(cond, hass)) {
          return false;
        }
      }

      return true;
    }

    _evaluateCondition(condition, hass) {
      if (!condition || !condition.entity) {
        return false;
      }

      const entity = hass.states[condition.entity];
      if (!entity) {
        return false;
      }

      const value = condition.attribute
        ? entity.attributes[condition.attribute]
        : entity.state;

      if (value === undefined || value === null) {
        return false;
      }

      const strValue = String(value);

      if (condition.state !== undefined) {
        if (strValue !== String(condition.state)) {
          return false;
        }
      }

      if (condition.state_not !== undefined) {
        if (strValue === String(condition.state_not)) {
          return false;
        }
      }

      if (condition.above !== undefined || condition.below !== undefined) {
        const num = Number(strValue);
        if (Number.isNaN(num)) {
          return false;
        }

        if (condition.above !== undefined && num <= Number(condition.above)) {
          return false;
        }

        if (condition.below !== undefined && num >= Number(condition.below)) {
          return false;
        }
      }

      return true;
    }

    _resolveTemplate(text, hass) {
      if (!text || typeof text !== "string") {
        return text;
      }

      const entityRegex = /{{\s*states\(['"]([^'\"]+)['"]\)\s*}}/g;

      return text.replace(entityRegex, (_match, entityId) => {
        const entity = hass.states[entityId];
        if (!entity) {
          return "";
        }
        return String(entity.state);
      });
    }

    _render(data) {
      const cfg = this._config;
      if (!cfg) {
        this._container.innerHTML = "";
        return;
      }

      this._container.innerHTML = "";
      this._container.className = "wrapper";

      if (!data || !data.visible) {
        return;
      }

      const fragment = document.createDocumentFragment();

      if (data.collapsed) {
        const iconWrapper = document.createElement("div");
        iconWrapper.classList.add("collapsed-icon-wrapper", data.collapsedPosition);
        iconWrapper.style.setProperty("--banner-accent-color", data.accentColor);
        iconWrapper.style.setProperty("--banner-offset", data.offset);
        iconWrapper.style.setProperty("--banner-z-index", data.zIndex);

        const iconButton = document.createElement("button");
        iconButton.classList.add("collapsed-icon-button");
        iconButton.setAttribute("aria-label", "Show alert banner");
        iconButton.type = "button";

        const icon = document.createElement("ha-icon");
        icon.setAttribute("icon", data.collapsedIcon || data.icon);
        iconButton.appendChild(icon);

        iconButton.addEventListener("click", (ev) => {
          ev.stopPropagation();
          this._collapsedOpen = !this._collapsedOpen;
          const nextData = this._computeRenderData();
          this._render(nextData);
          this._previousRenderData = nextData;
        });

        iconWrapper.appendChild(iconButton);
        fragment.appendChild(iconWrapper);
      }

      const shouldShowBanner = !data.collapsed || this._collapsedOpen;

      if (shouldShowBanner) {
        const wrapper = document.createElement("div");
        wrapper.classList.add("banner-wrapper");

        if (data.floating) {
          wrapper.classList.add("floating");
          wrapper.classList.add(data.position === "top" ? "top" : "bottom");

          if (data.floatSide === "left") {
            wrapper.classList.add("left");
          } else if (data.floatSide === "center") {
            wrapper.classList.add("center");
          } else {
            wrapper.classList.add("right");
          }
        } else {
          wrapper.classList.add("inline");
        }

        wrapper.style.setProperty("--banner-accent-color", data.accentColor);
        wrapper.style.setProperty("--banner-background-color", data.backgroundColor);
        wrapper.style.setProperty("--banner-text-color", data.textColor);
        wrapper.style.setProperty("--banner-border-radius", data.borderRadius);
        wrapper.style.setProperty("--banner-font-size", data.fontSize);
        wrapper.style.setProperty("--banner-padding", data.padding);
        wrapper.style.setProperty("--banner-max-width", data.maxWidth);
        wrapper.style.setProperty("--banner-offset", data.offset);
        wrapper.style.setProperty("--banner-z-index", data.zIndex);
        wrapper.style.setProperty("--banner-icon-background", data.iconBackground);

        const banner = document.createElement("div");
        banner.classList.add("banner");

        const content = document.createElement("div");
        content.classList.add("banner-content");

        if (data.showIcon && data.icon) {
          const iconContainer = document.createElement("div");
          iconContainer.classList.add("icon-container");

          const icon = document.createElement("ha-icon");
          icon.setAttribute("icon", data.icon);
          iconContainer.appendChild(icon);

          content.appendChild(iconContainer);
        }

        const textContainer = document.createElement("div");
        textContainer.classList.add("text-container");

        if (data.title) {
          const titleEl = document.createElement("div");
          titleEl.classList.add("title");
          titleEl.textContent = data.title;
          textContainer.appendChild(titleEl);
        }

        const messageEl = document.createElement("div");
        messageEl.classList.add("message");
        messageEl.textContent = data.message || "";
        textContainer.appendChild(messageEl);

        content.appendChild(textContainer);

        if (data.dismissible) {
          const dismissContainer = document.createElement("div");
          dismissContainer.classList.add("dismiss-container");

          const dismissButton = document.createElement("button");
          dismissButton.classList.add("dismiss-button");
          dismissButton.setAttribute("aria-label", "Dismiss");
          dismissButton.type = "button";
          dismissButton.textContent = "✕";
          dismissButton.addEventListener("click", (ev) => {
            ev.stopPropagation();
            this._dismiss(wrapper);
          });

          dismissContainer.appendChild(dismissButton);
          content.appendChild(dismissContainer);
        }

        banner.appendChild(content);
        wrapper.appendChild(banner);
        fragment.appendChild(wrapper);

        if (data.animate) {
          wrapper.classList.remove("enter");
          // Force reflow
          // eslint-disable-next-line no-unused-expressions
          wrapper.offsetWidth;
          wrapper.classList.add("enter");
        }
      }

      this._container.appendChild(fragment);
    }

    _dismiss(wrapper) {
      const cfg = this._config;
      if (!cfg) {
        return;
      }

      if (cfg.animate !== false && wrapper) {
        wrapper.classList.remove("enter");
        wrapper.classList.add("leave");

        window.setTimeout(() => {
          this._completeDismiss();
        }, 200);
      } else {
        this._completeDismiss();
      }
    }

    _completeDismiss() {
      this._dismissed = true;
      this._collapsedOpen = false;
      this._clearAutoRestore();
      this._callDismissService();

      const restoreMs = Number(this._config.auto_restore_ms);
      if (restoreMs && restoreMs > 0) {
        this._autoRestoreTimeout = window.setTimeout(() => {
          this._dismissed = false;
          this._collapsedOpen = false;
          if (!this._hass || !this._config) {
            return;
          }
          const data = this._computeRenderData();
          this._render(data);
          this._previousRenderData = data;
        }, restoreMs);
      } else if (this._hass && this._config) {
        const data = this._computeRenderData();
        this._render(data);
        this._previousRenderData = data;
      }
    }

    _callDismissService() {
      const cfg = this._config;
      const hass = this._hass;

      if (!cfg || !hass || !cfg.dismiss_service) {
        return;
      }

      const parts = String(cfg.dismiss_service).split(".");
      if (parts.length !== 2) {
        return;
      }

      const [domain, service] = parts;
      if (!domain || !service) {
        return;
      }

      const data = cfg.dismiss_service_data || {};
      hass.callService(domain, service, data);
    }

    _clearAutoRestore() {
      if (this._autoRestoreTimeout) {
        window.clearTimeout(this._autoRestoreTimeout);
        this._autoRestoreTimeout = null;
      }
    }

    _alphaColor(color, alpha) {
      if (!color || typeof color !== "string") {
        return null;
      }

      const hex = color.trim();
      if (!hex.startsWith("#")) {
        return null;
      }

      let value = hex.substring(1);
      if (value.length === 3) {
        value = value
          .split("")
          .map((c) => c + c)
          .join("");
      }

      if (value.length !== 6) {
        return null;
      }

      const r = parseInt(value.substring(0, 2), 16);
      const g = parseInt(value.substring(2, 4), 16);
      const b = parseInt(value.substring(4, 6), 16);

      if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
        return null;
      }

      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
  }

  class AlertBannerCardEditor extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this._config = {};
      this._hass = null;
      this._schema = this._buildSchema();
      this._render();
    }

    set hass(hass) {
      this._hass = hass;
      this._render();
    }

    setConfig(config) {
      this._config = config || {};
      this._render();
    }

    _buildSchema() {
      return [
        {
          name: "title",
          selector: { text: {} },
        },
        {
          name: "message",
          selector: { text: { multiline: true } },
        },
        {
          name: "entity_message",
          selector: { entity: {} },
        },
        {
          name: "severity",
          selector: {
            select: {
              options: [
                { value: "info", label: "Info" },
                { value: "success", label: "Success" },
                { value: "warning", label: "Warning" },
                { value: "error", label: "Error" },
                { value: "custom", label: "Custom" },
              ],
            },
          },
        },
        {
          name: "icon",
          selector: { icon: {} },
        },
        {
          name: "show_icon",
          selector: { boolean: {} },
        },
        {
          name: "dismissible",
          selector: { boolean: {} },
        },
        {
          name: "position",
          selector: {
            select: {
              options: [
                { value: "bottom", label: "Bottom (floating)" },
                { value: "top", label: "Top (floating)" },
                { value: "inline", label: "Inline" },
              ],
            },
          },
        },
        {
          name: "control_entity",
          selector: { entity: { domain: "input_boolean" } },
        },
        {
          name: "dismiss_entity",
          selector: { entity: {} },
        },
        {
          name: "auto_restore_ms",
          selector: { number: { min: 0, mode: "box" } },
        },
        {
          name: "color",
          selector: { text: {} },
        },
        {
          name: "background",
          selector: { text: {} },
        },
        {
          name: "text_color",
          selector: { text: {} },
        },
        {
          name: "border_radius",
          selector: { text: {} },
        },
        {
          name: "font_size",
          selector: { text: {} },
        },
        {
          name: "padding",
          selector: { text: {} },
        },
        {
          name: "max_width",
          selector: { text: {} },
        },
        {
          name: "offset",
          selector: { text: {} },
        },
        {
          name: "float_side",
          selector: {
            select: {
              options: [
                { value: "left", label: "Left" },
                { value: "right", label: "Right" },
                { value: "center", label: "Center" },
              ],
            },
          },
        },
        {
          name: "z_index",
          selector: { number: { mode: "box" } },
        },
        {
          name: "animate",
          selector: { boolean: {} },
        },
        {
          name: "collapsed_mode",
          selector: { boolean: {} },
        },
        {
          name: "collapsed_icon",
          selector: { icon: {} },
        },
        {
          name: "collapsed_position",
          selector: {
            select: {
              options: [
                { value: "top-left", label: "Top left" },
                { value: "top-right", label: "Top right" },
                { value: "bottom-left", label: "Bottom left" },
                { value: "bottom-right", label: "Bottom right" },
              ],
            },
          },
        },
      ];
    }

    _render() {
      if (!this.shadowRoot) {
        return;
      }

      this.shadowRoot.innerHTML = "";

      const style = document.createElement("style");
      style.textContent = `
        .editor {
          padding: 16px;
        }

        ha-form {
          --form-spacing: 12px;
        }
      `;
      this.shadowRoot.appendChild(style);

      const root = document.createElement("div");
      root.classList.add("editor");

      const form = document.createElement("ha-form");
      form.schema = this._schema;
      form.data = this._config;
      if (this._hass) {
        form.hass = this._hass;
      }

      form.addEventListener("value-changed", (ev) => {
        this._config = ev.detail.value || this._config;
        this.dispatchEvent(
          new CustomEvent("config-changed", {
            detail: { config: this._config },
            bubbles: true,
            composed: true,
          })
        );
      });

      root.appendChild(form);
      this.shadowRoot.appendChild(root);
    }
  }

  if (!customElements.get("alert-banner-card")) {
    customElements.define("alert-banner-card", AlertBannerCard);
  }

  if (!customElements.get("alert-banner-card-editor")) {
    customElements.define("alert-banner-card-editor", AlertBannerCardEditor);
  }

  window.customCards = window.customCards || [];
  window.customCards.push({
    type: "alert-banner-card",
    name: "Alert Banner Card",
    description: "Slim, animated alert banner card for Home Assistant dashboards.",
  });
})();
