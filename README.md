# Alert Banner Card

[![HACS Default](https://img.shields.io/badge/HACS-Default-blue.svg)](https://hacs.xyz/)
[![GitHub Release](https://img.shields.io/github/v/release/TillitschScHocK/lovelace-alert-banner-card)](https://github.com/TillitschScHocK/lovelace-alert-banner-card/releases)
[![License](https://img.shields.io/github/license/TillitschScHocK/lovelace-alert-banner-card)](LICENSE)

A slim, eye-catching but not intrusive notification banner card for Home Assistant dashboards. It can be used as a floating, fixed banner (top or bottom of the viewport) or as a regular inline Lovelace card.

## Features

- ✨ Floating fixed banner at the top or bottom of the screen, independent of the dashboard grid  
- 📦 Inline mode behaving like a regular Lovelace card  
- ❌ Optional dismiss button with optional service call on dismiss  
- 🧠 Entity-based visibility conditions and dynamic messages from entity states  
- 🎨 Severity presets (info/success/warning/error/custom) with sensible default colors  
- 🧱 Fully configurable appearance (colors, radius, font size, max width, offset, z-index)  
- 🎬 Smooth slide-in and fade-out animations with respect for `prefers-reduced-motion`  
- 📱 Responsive behavior for mobile and desktop  

---

## Installation via HACS

1. Open **HACS** in your Home Assistant instance.  
2. Go to **Frontend**.  
3. Click on the **"+"** button in the bottom right corner.  
4. Search for **"Alert Banner Card"**.  
5. Click on the card, then click **Install**.  
6. After installation, go to **Settings → Dashboards → Resources** and ensure that a resource is added for the card if HACS did not create one automatically:

   ```text
   URL: /hacsfiles/lovelace-alert-banner-card/alert-banner-card.js
   Type: module
   ```

7. Refresh your browser cache (Ctrl+F5) and edit your dashboard.  
8. Add a card with type `custom:alert-banner-card`.  

---

## Manual installation

1. Download `alert-banner-card.js` from the latest release:  
   https://github.com/TillitschScHocK/lovelace-alert-banner-card/releases

2. Copy the file to your Home Assistant `www` folder (create it if it does not exist):

   ```text
   /config/www/alert-banner-card/alert-banner-card.js
   ```

3. In Home Assistant, go to **Settings → Dashboards → Resources** and add:

   ```text
   URL: /local/alert-banner-card/alert-banner-card.js
   Type: module
   ```

4. Save, then refresh your browser cache (Ctrl+F5).  
5. Edit your dashboard and add a card with type `custom:alert-banner-card`.  

---

## Quick start

Minimal configuration example:

```yaml
type: custom:alert-banner-card
message: "System will restart in 10 minutes!"
severity: warning
```

This will show an animated warning banner at the bottom of the screen with default styles and a dismiss button.

---

## Configuration

### Basic options

| Name             | Type                          | Default    | Description                                                                                     |
|------------------|-------------------------------|------------|-------------------------------------------------------------------------------------------------|
| `message`        | string                        | —          | Static message text to display. At least one of `message` or `entity_message` must be set.     |
| `entity_message` | string (entity id)            | —          | Entity whose state will be used as the banner message. Overrides `message` when defined.       |
| `title`          | string                        | `null`     | Optional bold title displayed above the message.                                               |
| `severity`       | `info` \| `success` \| `warning` \| `error` \| `custom` | `warning`  | Severity level controlling default icon and colors.                                            |
| `icon`           | string (mdi icon)             | by severity| Override icon, e.g. `mdi:restart-alert`.                                                       |
| `show_icon`      | boolean                       | `true`     | Show or hide the icon circle.                                                                  |
| `dismissible`    | boolean                       | `true`     | Show or hide the dismiss (✕) button.                                                           |
| `position`       | `bottom` \| `top` \| `inline` | `bottom`   | `bottom`/`top` create a floating fixed banner, `inline` behaves as normal Lovelace card.       |

### Appearance

| Name            | Type    | Default         | Description                                                                                                       |
|-----------------|---------|-----------------|-------------------------------------------------------------------------------------------------------------------|
| `color`         | string  | by severity     | Accent color for left border and icon (CSS color or hex).                                                        |
| `background`    | string  | by severity     | Background color of the banner. Defaults to a semi-transparent variant of the severity color.                    |
| `text_color`    | string  | `var(--primary-text-color)` | Text color of the banner content.                                                                                |
| `border_radius` | string  | `"12px"`        | Border radius of the banner container.                                                                           |
| `font_size`     | string  | `"0.95rem"`     | Font size of the banner text.                                                                                    |
| `padding`       | string  | `"10px 16px"`   | Inner padding of the banner.                                                                                     |
| `max_width`     | string  | `"900px"`       | Maximum width of the banner in floating mode.                                                                    |
| `offset`        | string  | `"20px"`        | Distance from viewport edges in floating mode (also used as horizontal margin on mobile).                        |
| `float_side`    | `left` \| `right` \| `center` | `"right"` | Horizontal alignment in floating mode on desktop. Ignored on mobile.                                             |
| `z_index`       | number  | `500`           | CSS `z-index` for the floating banner.                                                                           |
| `animate`       | boolean | `true`          | Enable slide-in animation on show and fade-out animation on dismiss.                                             |

### Visibility and logic

| Name                 | Type         | Default | Description                                                                                                                                     |
|----------------------|-------------|---------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| `conditions`         | list        | `[]`    | List of conditions that all must be true for the banner to be shown.                                                                           |
| `conditions[].entity`    | string | —       | Entity id to check.                                                                                                                             |
| `conditions[].state`     | string | —       | Required state. If set and the entity's value does not match, the condition fails.                                                             |
| `conditions[].state_not` | string | —       | Forbidden state. If set and the entity's value matches, the condition fails.                                                                   |
| `conditions[].above`     | number | —       | Numeric comparison (entity value must be strictly greater than this value).                                                                    |
| `conditions[].below`     | number | —       | Numeric comparison (entity value must be strictly less than this value).                                                                       |
| `conditions[].attribute` | string | —       | Attribute name to check instead of the entity state.                                                                                           |
| `dismiss_entity`     | string (entity id) | `null` | Entity whose state hides the banner when it is `"off"`, `"false"`, `"0"` or `"0.0"`.                                                           |
| `dismiss_service`    | string (domain.service) | `null` | Service to call when the user dismisses the banner, e.g. `input_boolean.turn_off`.                                                            |
| `dismiss_service_data` | map      | `{}`    | Additional data for `dismiss_service`, e.g. `{ entity_id: "input_boolean.banner_neustart" }`.                                                  |
| `auto_restore_ms`    | number      | `null` | Time in milliseconds after which the banner will automatically reappear after being dismissed (if conditions are still met).                   |

### Severity defaults

If not overridden by custom colors, the following defaults apply:

| Severity | Icon                        | Color      | Background                          |
|----------|-----------------------------|------------|-------------------------------------|
| `info`   | `mdi:information-outline`   | `#1976d2`  | `rgba(25,118,210,0.12)`             |
| `success`| `mdi:check-circle-outline`  | `#388e3c`  | `rgba(56,142,60,0.12)`              |
| `warning`| `mdi:alert-outline`         | `#f57c00`  | `rgba(245,124,0,0.12)`              |
| `error`  | `mdi:alert-circle-outline`  | `#d32f2f`  | `rgba(211,47,47,0.12)`              |
| `custom` | `mdi:bell-outline`         | `var(--primary-color)` | `rgba(0,0,0,0.03)`       |

---

## Template support

The `message` string supports simple Home Assistant-style templates of the form:

```text
{{ states('sensor.example') }}
```

These expressions will be replaced with the corresponding entity state.

Example:

```yaml
type: custom:alert-banner-card
title: "Outside temperature"
message: "Current temperature: {{ states('sensor.outdoor_temperature') }} °C"
severity: info
```

---

## YAML examples

### a) Floating warning with `dismiss_service`

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
offset: "24px"
max_width: "500px"
border_radius: "10px"
font_size: "0.9rem"
padding: "10px 16px"
animate: true
z_index: 500
dismiss_service: input_boolean.turn_off
dismiss_service_data:
  entity_id: input_boolean.banner_neustart
conditions:
  - entity: input_boolean.banner_neustart
    state: "on"
```

This configuration shows a floating warning banner at the bottom center. When dismissed, it calls `input_boolean.turn_off` for `input_boolean.banner_neustart`.

---

### b) Dynamic message from entity

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

Here the message is taken directly from `sensor.washing_machine_status`. The banner is only shown while `binary_sensor.washing_machine_running` is `on`.

---

### c) Inline success banner with auto restore

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

This banner is rendered inline in the dashboard grid, can be dismissed, and will automatically reappear after 5 minutes if the condition is still satisfied.

---

### d) Fully custom appearance

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

This example shows a completely customized banner with its own colors, padding, and conditions.

---

## Contributing

Contributions are welcome.

1. Fork the repository on GitHub.  
2. Create a feature branch for your change.  
3. Implement your changes and add or update examples where appropriate.  
4. Ensure that the card still works in both floating and inline modes and that the documentation is up to date.  
5. Open a pull request with a clear description of your changes.  

Bug reports and feature suggestions can also be opened as GitHub issues.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
