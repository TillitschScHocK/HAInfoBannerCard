<div align="center">

# Alert Banner Card

**Slim, animated alert banner for Home Assistant dashboards**

[![HACS](https://img.shields.io/badge/HACS-Default-blue?style=for-the-badge&logo=homeassistant)](https://hacs.xyz/)
[![Release](https://img.shields.io/github/v/release/TillitschScHocK/HAInfoBannerCard?style=for-the-badge)](https://github.com/TillitschScHocK/HAInfoBannerCard/releases)
[![License](https://img.shields.io/github/license/TillitschScHocK/HAInfoBannerCard?style=for-the-badge)](LICENSE)

[Installation](#-installation) • [Configuration](#-configuration) • [Examples](#-examples) • [Support](#-support)

</div>

---

## 🎯 What is this?

Alert Banner Card is a slim, eye-catching but not intrusive notification banner card for Home Assistant dashboards.[cite:7]
It can float at the top or bottom of the screen or sit inline in your dashboard grid while remaining fully customizable.

**Key Features:**
- ✨ Floating fixed banner at the top or bottom of the screen
- 📦 Inline mode behaving like a normal Lovelace card
- ❌ Optional dismiss button and optional service call on dismiss
- 🧠 Entity-based visibility conditions and dynamic messages from entity states
- 🎨 Severity presets (info, success, warning, error, custom) with sensible defaults
- 🧱 Fully configurable appearance (colors, radius, font size, max width, offset, z-index)
- 📱 Responsive on mobile and desktop, optional auto-fit to screen width (v1.3+)

---

## 🚀 Installation

### Via HACS (recommended)

1. Open **HACS** in Home Assistant.
2. Go to **Frontend**.
3. Click the **"+"** button.
4. Search for **"Alert Banner Card"**.
5. Install the card.
6. Ensure the resource exists under **Settings → Dashboards → Resources**:

   ```text
   URL: /hacsfiles/HAInfoBannerCard/alert-banner-card.js
   Type: module
   ```

7. Refresh the browser cache (Ctrl+F5).
8. Add a card of type `custom:alert-banner-card` to your dashboard.

### Manual installation

1. Download `alert-banner-card.js` from the latest release:
   https://github.com/TillitschScHocK/HAInfoBannerCard/releases
2. Copy the file into your `www` folder:

   ```text
   /config/www/alert-banner-card/alert-banner-card.js
   ```

3. Add a resource under **Settings → Dashboards → Resources**:

   ```text
   URL: /local/alert-banner-card/alert-banner-card.js
   Type: module
   ```

4. Refresh the browser cache (Ctrl+F5) and add `custom:alert-banner-card` to your dashboard.

---

## 🧩 Quick start

Minimal example:

```yaml
type: custom:alert-banner-card
message: "System will restart in 10 minutes!"
severity: warning
```

This shows an animated warning banner at the bottom of the screen with default styles and a dismiss button.

---

## ⚙️ Configuration

### Core options

| Name             | Type                                      | Default   | Description                                                                                         |
|------------------|-------------------------------------------|-----------|-----------------------------------------------------------------------------------------------------|
| `message`        | string                                    | —         | Static message text to display. At least one of `message` or `entity_message` must be set.         |
| `entity_message` | string (entity id)                        | —         | Entity whose state will be used as the banner message. Overrides `message` when defined.           |
| `title`          | string                                    | `null`    | Optional bold title shown above the message.                                                        |
| `severity`       | `info` \| `success` \| `warning` \| `error` \| `custom` | `warning` | Severity level controlling default icon and colors.                                                |
| `icon`           | string (mdi icon)                         | by severity | Custom icon, for example `mdi:restart-alert`.                                                      |
| `show_icon`      | boolean                                   | `true`    | Show or hide the icon.
| `dismissible`    | boolean                                   | `true`    | Show or hide the dismiss (✕) button.                                                               |

### Position and layout

| Name          | Type                                | Default   | Description                                                                                         |
|---------------|-------------------------------------|-----------|-----------------------------------------------------------------------------------------------------|
| `position`    | `bottom` \| `top` \| `inline`       | `bottom`  | `bottom`/`top` = floating fixed banner, `inline` = behaves like a regular Lovelace card.           |
| `float_side`  | `left` \| `right` \| `center`       | `right`   | Horizontal alignment in floating mode on desktop. Ignored in inline mode.                           |
| `auto_width`  | boolean                             | `false`   | If `true` and `position` is `top` or `bottom`, banner stretches to screen width with side margins. |
| `max_width`   | string                              | `"900px"` | Maximum width of the banner in floating mode when `auto_width` is `false`.                         |
| `offset`      | string                              | `"20px"` | Distance from viewport edges and horizontal margin on mobile.                                      |
| `z_index`     | number                              | `500`     | CSS `z-index` of the floating banner.                                                              |
| `animate`     | boolean                             | `true`    | Enable slide-in and fade-out animations (respects `prefers-reduced-motion`).                       |

### Appearance

| Name            | Type    | Default                         | Description                                                                                         |
|-----------------|---------|---------------------------------|-----------------------------------------------------------------------------------------------------|
| `color`         | string  | by severity                     | Accent color for left border and icon.                                                              |
| `background`    | string  | by severity                     | Background color of the banner.                                                                     |
| `text_color`    | string  | `var(--primary-text-color)`     | Text color of the banner content.                                                                   |
| `border_radius` | string  | `"12px"`                        | Border radius of the container.                                                                     |
| `font_size`     | string  | `"0.95rem"`                     | Font size of title and message.                                                                     |
| `padding`       | string  | `"10px 16px"`                   | Inner padding of the banner.                                                                        |

### Visibility and logic

| Name                    | Type                    | Default | Description                                                                                                               |
|-------------------------|-------------------------|---------|---------------------------------------------------------------------------------------------------------------------------|
| `conditions`            | list                    | `[]`    | All conditions must be true for the banner to show.                                                                       |
| `conditions[].entity`   | string                  | —       | Entity id to check.                                                                                                       |
| `conditions[].state`    | string                  | —       | Required state. If not matched, condition fails.                                                                          |
| `conditions[].state_not`| string                  | —       | Forbidden state. If matched, condition fails.                                                                             |
| `conditions[].above`    | number                  | —       | Numeric comparison: entity value must be greater than this value.                                                        |
| `conditions[].below`    | number                  | —       | Numeric comparison: entity value must be less than this value.                                                           |
| `conditions[].attribute`| string                  | —       | Attribute name to check instead of the entity state.                                                                      |
| `dismiss_entity`        | string (entity id)      | `null`  | Entity that hides the banner when state equals `off`, `false`, `0` or `0.0`.                                             |
| `dismiss_service`       | string (`domain.service`)| `null` | Service to call when the user dismisses the banner, e.g. `input_boolean.turn_off`.                                       |
| `dismiss_service_data`  | object                  | `{}`    | Additional data for `dismiss_service` (for example `{ entity_id: "input_boolean.banner_restart" }`).                    |
| `auto_restore_ms`       | number                  | `null`  | Time in milliseconds after dismiss before the banner automatically reappears, if conditions are still satisfied.         |
| `control_entity`        | string (entity id)      | `null`  | Optional entity that must be `on` to allow showing the banner at all (simple global on/off switch).                      |
| `collapsed_mode`        | boolean                 | `false` | Show a small floating icon that expands the banner on click instead of always showing the full banner.                   |
| `collapsed_icon`        | string (mdi icon)       | —       | Icon for the collapsed button (defaults to the main icon).                                                               |
| `collapsed_position`    | `top-left` \| `top-right` \| `bottom-left` \| `bottom-right` | `top-right` | Screen corner where the collapsed icon is fixed.                                   |

### Severity defaults

If no custom colors are set, the following defaults are used:

| Severity | Icon                       | Color            | Background                         |
|----------|----------------------------|------------------|------------------------------------|
| `info`   | `mdi:information-outline`  | `#1976d2`        | `rgba(25,118,210,0.12)`            |
| `success`| `mdi:check-circle-outline` | `#388e3c`        | `rgba(56,142,60,0.12)`             |
| `warning`| `mdi:alert-outline`        | `#f57c00`        | `rgba(245,124,0,0.12)`             |
| `error`  | `mdi:alert-circle-outline` | `#d32f2f`        | `rgba(211,47,47,0.12)`             |
| `custom` | `mdi:bell-outline`         | `var(--primary-color)` | `rgba(0,0,0,0.03)`         |

---

## 🧪 Template support

The `message` field supports simple Home Assistant-style templates like:

```text
{{ states('sensor.example') }}
```

Example:

```yaml
type: custom:alert-banner-card
title: "Outside temperature"
message: "Current temperature: {{ states('sensor.outdoor_temperature') }} °C"
severity: info
```

---

## 📘 Examples

### Floating maintenance warning with dismiss service

```yaml
type: custom:alert-banner-card
title: "Maintenance notice"
message: "⚡ System restart in 10 minutes!"
severity: warning
icon: mdi:restart-alert
show_icon: true
dismissible: true
position: bottom
float_side: center
auto_width: true
offset: "24px"
max_width: "500px"
border_radius: "10px"
font_size: "0.9rem"
padding: "10px 16px"
animate: true
z_index: 500
dismiss_service: input_boolean.turn_off
dismiss_service_data:
  entity_id: input_boolean.banner_restart
conditions:
  - entity: input_boolean.banner_restart
    state: "on"
```

### Dynamic status from entity

```yaml
type: custom:alert-banner-card
title: "Washer status"
entity_message: sensor.washing_machine_status
severity: info
icon: mdi:washing-machine
position: top
float_side: right
conditions:
  - entity: binary_sensor.washing_machine_running
    state: "on"
```

### Inline success banner with auto restore

```yaml
type: custom:alert-banner-card
title: "Backup completed"
message: "All backups finished successfully."
severity: success
icon: mdi:check-circle-outline
position: inline
dismissible: true
auto_restore_ms: 300000 # 5 minutes
conditions:
  - entity: binary_sensor.backup_last_run_success
    state: "on"
```

### Fully custom style

```yaml
type: custom:alert-banner-card
title: "Custom alert"
message: "Custom colored banner with all options set."
severity: custom
icon: mdi:bell-ring-outline
show_icon: true
dismissible: true
position: bottom
float_side: left
auto_width: false
offset: "16px"
max_width: "450px"
border_radius: "16px"
font_size: "1rem"
padding: "12px 18px"
color: "#9c27b0"
background: "rgba(156,39,176,0.12)"
text_color: "#1b0033"
animate: true
z_index: 600
dismiss_service: input_boolean.turn_off
dismiss_service_data:
  entity_id: input_boolean.custom_banner_state
conditions:
  - entity: input_boolean.custom_banner_state
    state: "on"
  - entity: sensor.custom_condition_value
    above: 10
```

---

## 🐛 Troubleshooting

| Problem                     | Solution                                                                                 |
|-----------------------------|------------------------------------------------------------------------------------------|
| Card not found              | Check that the resource URL is correct and the file is reachable, then reload resources. |
| Banner not visible          | Verify `conditions`, `control_entity`, and `dismiss_entity` states.                      |
| Dismiss action not working  | Confirm that `dismiss_service` and `dismiss_service_data` are valid.                    |
| Layout looks wrong on mobile| Try `auto_width: true` and adjust `offset`/`max_width`.                                 |

---

## ❤️ Support

If you find this card useful and want to support further development, you can donate via PayPal:

[![Donate](https://img.shields.io/badge/Donate-PayPal-blue?style=for-the-badge&logo=paypal)](https://paypal.me/Schock07)

---

## 📜 License

MIT License - see [LICENSE](LICENSE)
