/* Alert Banner Card for Home Assistant
 * Repository: lovelace-alert-banner-card
 * File: alert-banner-card.js
 */

(() => {
  const CARD_VERSION = '1.0.0';

  // Console banner
  /* eslint-disable no-console */
  console.info(
    `%c ALERT-BANNER-CARD %c v${CARD_VERSION} `,
    'background:#1976d2;color:#fff;font-weight:bold;border-radius:4px 0 0 4px;padding:2px 6px;',
    'background:#e8eaf6;color:#000;border-radius:0 4px 4px 0;padding:2px 6px;'
  );
  /* eslint-enable no-console */

  const SEVERITY_CONFIG = {
    info: {
      icon: 'mdi:information-outline',
      color: '#1976d2',
      background: 'rgba(25,118,210,0.12)',
    },
    success: {
      icon: 'mdi:check-circle-outline',
      color: '#388e3c',
      background: 'rgba(56,142,60,0.12)',
    },
    warning: {
      icon: 'mdi:alert-outline',
      color: '#f57c00',
      background: 'rgba(245,124,0,0.12)',
    },
    error: {
      icon: 'mdi:alert-circle-outline',
      color: '#d32f2f',
      background: 'rgba(211,47,47,0.12)',
    },
    custom: {
      icon: 'mdi:bell-outline',
      color: 'var(--primary-color)',
      background: 'rgba(0,0,0,0.03)',
    },
  };

  class AlertBannerCard extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });

      this._config = null;
      this._hass = null;
      this._dismissed = false;
      this._autoRestoreTimeout = null;
      this._previousRenderData = null;

      const style = document.createElement('style');
      style.textContent = this._buildStyle();
      this.shadowRoot.appendChild(style);

      this._container = document.createElement('div');
      this._container.classList.add('wrapper');
      this.shadowRoot.appendChild(this._container);
    }

    setConfig(config) {
      if (!config) {
        throw new Error('Invalid configuration for alert-banner-card.');
      }

      if (!config.message && !config.entity_message) {
        throw new Error(
          'alert-banner-card: Either "message" or "entity_message" must be set in the configuration.'
        );
      }

      const defaults = {
        title: undefined,
        severity: 'warning',
        icon: undefined,
        show_icon: true,
        dismissible: true,
        position: 'bottom', // bottom | top | inline
        float_side: 'right', // left | right | center
        color: undefined,
        background: undefined,
        text_color: undefined,
        border_radius: '12px',
        font_size: '0.95rem',
        padding: '10px 16px',
        max_width: '900px',
        offset: '20px',
        z_index: 500,
        animate: true,
        conditions: [],
        dismiss_entity: undefined,
        dismiss_service: undefined,
        dismiss_service_data: undefined,
        auto_restore_ms: undefined,
      };

      this._config = Object.assign({}, defaults, config);
      this._dismissed = false;
      this._clearAutoRestore();

      // Reset previous render data so that first hass update forces a render
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

      if (this._config.position !== 'inline') {
        return 0;
      }

      if (!this._previousRenderData.visible || this._dismissed) {
        return 0;
      }

      // A single row banner
      return 1;
    }

    getGridOptions() {
      if (this._config && this._config.position === 'inline') {
        return {
          columns: 12,
          rows: 1,
        };
      }

      // For floating cards we do not require grid space
      return {
        columns: 0,
        rows: 0,
      };
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
          bottom: var(--banner-offset, 20px);
        }

        .banner-wrapper.floating.top {
          top: var(--banner-offset, 20px);
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

      let message = cfg.message || '';

      if (message) {
        message = this._resolveTemplate(message, hass);
      }

      if (cfg.entity_message) {
        const entity = hass.states[cfg.entity_message];
        if (entity) {
          message = String(entity.state);
        } else {
          message = '';
        }
      }

      const severityKey = cfg.severity || 'warning';
      const severity = SEVERITY_CONFIG[severityKey] ? severityKey : 'warning';
      const severityDef = SEVERITY_CONFIG[severity];

      const icon = cfg.icon || severityDef.icon;
      const accentColor = cfg.color || severityDef.color;
      const backgroundColor = cfg.background || severityDef.background;
      const textColor = cfg.text_color || 'var(--primary-text-color)';

      const floating = cfg.position !== 'inline';
      const floatSide = floating ? (cfg.float_side || 'right') : undefined;

      const visible = this._shouldShow(hass, message);

      const iconBackground = this._alphaColor(accentColor, 0.22) || backgroundColor;

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
        if (state === 'off' || state === 'false' || state === '0' || state === '0.0') {
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

      let value = condition.attribute
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
      if (!text || typeof text !== 'string') {
        return text;
      }

      const entityRegex = /{{\s*states\(['"]([^'"]+)['"]\)\s*}}/g;

      return text.replace(entityRegex, (_match, entityId) => {
        const entity = hass.states[entityId];
        if (!entity) {
          return '';
        }
        return String(entity.state);
      });
    }

    _render(data) {
      const cfg = this._config;
      if (!cfg) {
        this._container.innerHTML = '';
        return;
      }

      this._container.innerHTML = '';
      this._container.className = 'wrapper';

      if (!data || !data.visible) {
        return;
      }

      const wrapper = document.createElement('div');
      wrapper.classList.add('banner-wrapper');

      if (data.floating) {
        wrapper.classList.add('floating');
        wrapper.classList.add(data.position === 'top' ? 'top' : 'bottom');

        if (data.floatSide === 'left') {
          wrapper.classList.add('left');
        } else if (data.floatSide === 'center') {
          wrapper.classList.add('center');
        } else {
          wrapper.classList.add('right');
        }
      } else {
        wrapper.classList.add('inline');
      }

      wrapper.style.setProperty('--banner-accent-color', data.accentColor);
      wrapper.style.setProperty('--banner-background-color', data.backgroundColor);
      wrapper.style.setProperty('--banner-text-color', data.textColor);
      wrapper.style.setProperty('--banner-border-radius', data.borderRadius);
      wrapper.style.setProperty('--banner-font-size', data.fontSize);
      wrapper.style.setProperty('--banner-padding', data.padding);
      wrapper.style.setProperty('--banner-max-width', data.maxWidth);
      wrapper.style.setProperty('--banner-offset', data.offset);
      wrapper.style.setProperty('--banner-z-index', data.zIndex);
      wrapper.style.setProperty('--banner-icon-background', data.iconBackground);

      const banner = document.createElement('div');
      banner.classList.add('banner');

      const content = document.createElement('div');
      content.classList.add('banner-content');

      if (data.showIcon && data.icon) {
        const iconContainer = document.createElement('div');
        iconContainer.classList.add('icon-container');

        const icon = document.createElement('ha-icon');
        icon.setAttribute('icon', data.icon);
        iconContainer.appendChild(icon);

        content.appendChild(iconContainer);
      }

      const textContainer = document.createElement('div');
      textContainer.classList.add('text-container');

      if (data.title) {
        const titleEl = document.createElement('div');
        titleEl.classList.add('title');
        titleEl.textContent = data.title;
        textContainer.appendChild(titleEl);
      }

      const messageEl = document.createElement('div');
      messageEl.classList.add('message');
      messageEl.textContent = data.message || '';
      textContainer.appendChild(messageEl);

      content.appendChild(textContainer);

      if (data.dismissible) {
        const dismissContainer = document.createElement('div');
        dismissContainer.classList.add('dismiss-container');

        const dismissButton = document.createElement('button');
        dismissButton.classList.add('dismiss-button');
        dismissButton.setAttribute('aria-label', 'Dismiss');
        dismissButton.type = 'button';
        dismissButton.textContent = '✕';
        dismissButton.addEventListener('click', (ev) => {
          ev.stopPropagation();
          this._dismiss(wrapper);
        });

        dismissContainer.appendChild(dismissButton);
        content.appendChild(dismissContainer);
      }

      banner.appendChild(content);
      wrapper.appendChild(banner);
      this._container.appendChild(wrapper);

      if (data.animate) {
        // Restart enter animation
        wrapper.classList.remove('enter');
        // Force reflow
        // eslint-disable-next-line no-unused-expressions
        wrapper.offsetWidth;
        wrapper.classList.add('enter');
      }
    }

    _dismiss(wrapper) {
      const cfg = this._config;
      if (!cfg) {
        return;
      }

      if (cfg.animate !== false && wrapper) {
        wrapper.classList.remove('enter');
        wrapper.classList.add('leave');

        window.setTimeout(() => {
          this._completeDismiss();
        }, 200);
      } else {
        this._completeDismiss();
      }
    }

    _completeDismiss() {
      this._dismissed = true;
      this._clearAutoRestore();
      this._callDismissService();

      const restoreMs = Number(this._config.auto_restore_ms);
      if (restoreMs && restoreMs > 0) {
        this._autoRestoreTimeout = window.setTimeout(() => {
          this._dismissed = false;
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

      const parts = String(cfg.dismiss_service).split('.');
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
      if (!color || typeof color !== 'string') {
        return null;
      }

      const hex = color.trim();
      if (!hex.startsWith('#')) {
        return null;
      }

      let value = hex.substring(1);
      if (value.length === 3) {
        value = value
          .split('')
          .map((c) => c + c)
          .join('');
      }

      if (value.length !== 6) {
        return null;
      }

      const r = parseInt(value.substring(0, 2), 16);
      const g = parseInt(value.substring(2, 4), 16);
      const b = parseInt(value.substring(4, 6), 16);

      if (
        Number.isNaN(r) ||
        Number.isNaN(g) ||
        Number.isNaN(b)
      ) {
        return null;
      }

      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    static getStubConfig() {
      return {
        message: 'System will restart in 10 minutes!',
        severity: 'warning',
      };
    }
  }

  if (!customElements.get('alert-banner-card')) {
    customElements.define('alert-banner-card', AlertBannerCard);
  }

  // Home Assistant card picker metadata
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: 'alert-banner-card',
    name: 'Alert Banner Card',
    description: 'Slim, animated alert banner card for Home Assistant dashboards.',
  });
})();
