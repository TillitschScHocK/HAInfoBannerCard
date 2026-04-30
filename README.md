<div align="center">

# Alert Banner Card

**Slim, animated alert banner for Home Assistant dashboards**

[![HACS](https://img.shields.io/badge/HACS-Default-blue?style=for-the-badge&logo=homeassistant)](https://hacs.xyz/)
[![Release](https://img.shields.io/github/v/release/TillitschScHocK/HAInfoBannerCard?style=for-the-badge)](https://github.com/TillitschScHocK/HAInfoBannerCard/releases)
[![License](https://img.shields.io/github/license/TillitschScHocK/HAInfoBannerCard?style=for-the-badge)](LICENSE)

[🚀 Installation](#-installation) • [⚙️ Configuration](#️-configuration) • [🖼 Examples](#-visual-examples--previews) • [❤️ Support](#️-support)

</div>

---

## 🎯 What is this?

Alert Banner Card is a slim, eye-catching but not intrusive notification banner card for Home Assistant dashboards.
It can float at the top or bottom of the screen or sit inline in your dashboard grid while remaining fully customizable.

**Key Features:**
- ✨ **Floating Modes:** Fixed at the top or bottom of the screen.
- 📦 **Inline Mode:** Behaves like a standard Lovelace card.
- 🧠 **Smart Visibility:** Entity-based conditions and dynamic templates.
- 🎨 **Styling:** Severity presets (`info`, `success`, `warning`, `error`, `custom`).
- 📱 **Responsive:** Auto-fit options for mobile and desktop.

---

## 🚀 Installation

<details>
<summary><b>Click to expand Installation Instructions</b></summary>

### Via HACS (recommended)

1. Open **HACS** → **Custom repositories**.
2. Add: `https://github.com/TillitschScHocK/HAInfoBannerCard` (Category: Dashboard).
3. Search for **Alert Banner Card** and install.
4. Refresh browser cache (`Ctrl+F5`).

### Manual installation

1. Download `alert-banner-card.js` from [Releases](https://github.com/TillitschScHocK/HAInfoBannerCard/releases).
2. Copy it to `/config/www/alert-banner-card/`.
3. Add the resource `/local/alert-banner-card/alert-banner-card.js` with type `module`.

</details>

---

## 🧩 Quick start

```yaml
type: custom:alert-banner-card
message: "System will restart in 10 minutes!"
severity: warning
```

---

## ⚙️ Configuration

The card is highly flexible. Below you find all available options grouped by category.

<details>
<summary><b>🛠 Core Options & Appearance</b></summary>

### Core options

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `message` | string | — | Static message text. |
| `entity_message` | string | — | Use an entity's state as the message. |
| `title` | string | `null` | Optional bold title. |
| `severity` | string | `info` | `info`, `success`, `warning`, `error`, `custom`. |
| `icon` | string | by severity | Custom MDI icon. |

### Appearance (Styling)

| Name | Default | Description |
|------|---------|-------------|
| `color` | by severity | Accent color for border and icon. |
| `background` | by severity | Background color. |
| `border_radius` | `12px` | Corner rounding. |
| `font_size` | `0.95rem` | Text size. |

</details>

<details>
<summary><b>📐 Position & Layout</b></summary>

| Name | Default | Description |
|------|---------|-------------|
| `position` | `bottom` | `bottom`, `top`, or `inline`. |
| `float_side` | `right` | `left`, `right`, or `center` on desktop. |
| `auto_width` | `false` | Stretch to screen width. |
| `max_width` | `900px` | Max width if `auto_width` is disabled. |
| `animate` | `true` | Slide-in and slide-out animations. |

</details>

<details>
<summary><b>👁 Visibility & Logic</b></summary>

| Name | Description |
|------|-------------|
| `conditions` | List of conditions such as `entity`, `state`, `above`, or `below`. |
| `dismiss_service` | Service called when clicking the close button. |
| `control_entity` | Global on/off switch for the banner. |
| `collapsed_mode` | Show as an icon that expands on click. |

</details>

---

## 🖼 Visual Examples & Previews

Hier findest du die verschiedenen Styles mit den passenden Texten.

<details>
<summary><b>ℹ️ Info Style (Preview)</b></summary>

```yaml
type: custom:alert-banner-card
title: "Useless Fact of the Day"
message: "I exist purely to take up 50 pixels of your screen. You look great today!"
severity: info
```

![Info Banner](https://raw.githubusercontent.com/TillitschScHocK/HAInfoBannerCard/main/examples/info-banner.png)

</details>

<details>
<summary><b>✅ Success Style (Preview)</b></summary>

```yaml
type: custom:alert-banner-card
title: "Task Failed Successfully"
message: "I don't know what you just did, but the house didn't explode. High five! ✋"
severity: success
```

![Success Banner](https://raw.githubusercontent.com/TillitschScHocK/HAInfoBannerCard/main/examples/success-banner.png)

</details>

<details>
<summary><b>⚠️ Warning Style (Preview)</b></summary>

```yaml
type: custom:alert-banner-card
title: "Emotional Damage Imminent"
message: "Something is slightly wrong, but I'm not going to tell you what."
severity: warning
```

![Warning Banner](https://raw.githubusercontent.com/TillitschScHocK/HAInfoBannerCard/main/examples/warning-banner.png)

</details>

<details>
<summary><b>🚨 Error Style (Preview)</b></summary>

```yaml
type: custom:alert-banner-card
title: "Everything is Fine™"
message: "The smart home is currently screaming into a pillow. Don't touch anything!"
severity: error
```

![Error Banner](https://raw.githubusercontent.com/TillitschScHocK/HAInfoBannerCard/main/examples/error-banner.png)

</details>

<details>
<summary><b>✨ Custom Style (Preview)</b></summary>

```yaml
type: custom:alert-banner-card
title: "I'm Special"
message: "I don't fit into your boxes. I'm a rebel banner. I'm the main character now."
severity: custom
color: "#9c27b0"
background: "rgba(156,39,176,0.12)"
```

![Custom Banner](https://raw.githubusercontent.com/TillitschScHocK/HAInfoBannerCard/main/examples/custom-banner.png)

</details>

---

## ❤️ Support

If you find this card useful and want to support further development, feel free to leave a star on GitHub.

---

## 📜 License

MIT License, see [LICENSE](LICENSE)
