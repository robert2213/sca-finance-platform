# Screenshots

Add your screenshots here after running `npm run dev`.

## Recommended Captures

Capture these pages at 1440×900 (desktop) and 375×812 (mobile):

| Filename | Page | What to Show |
|----------|------|-------------|
| `01-dashboard.png` | `/` | Full page with KPI cards, chart, and risk alerts visible |
| `02-dashboard-summary.png` | `/` | Scroll down to Executive Summary box |
| `03-agents.png` | `/agents` | All 6 agent cards in the grid |
| `04-cfo-chat.png` | `/cfo` | Chat panel with a response visible (stream complete) |
| `05-cfo-risks.png` | `/cfo` | Risk alerts panel with all flags |
| `06-fpa-variance.png` | `/fpa` | Variance table + chart in view |
| `07-fpa-chat.png` | `/fpa` | FP&A Agent answering "what's driving the variance?" |
| `08-vendors.png` | `/vendors` | Vendor table with expiry highlights |
| `09-vendors-chat.png` | `/vendors` | Procurement Agent contract expiry response |
| `10-external-labor.png` | `/external-labor` | Over-budget alert banner + contractor table |
| `11-headcount.png` | `/headcount` | Donut chart + fill rate bars + open reqs |
| `12-cio-cloud.png` | `/cio` | Cloud trend chart + provider cards |
| `13-cio-talking.png` | `/cio` | CIO Agent talking points response |
| `14-mobile-dashboard.png` | `/` | Mobile view (375px) with sidebar closed |
| `15-mobile-sidebar.png` | `/` | Mobile view with sidebar open |

## How to Take Screenshots

### Chrome DevTools
1. F12 → Toggle device toolbar (Ctrl+Shift+M)
2. Set custom resolution: 1440 × 900
3. Capture: ⋮ menu → "Capture screenshot" or "Capture full size screenshot"

### macOS
- `Cmd+Shift+4` → drag to select area
- `Cmd+Shift+5` → full screen capture tool

### Windows
- `Win+Shift+S` → snipping tool
- Or use ShareX for full-page captures

## Screenshot Tips for LinkedIn / GitHub

- **Prefer full-page over viewport** captures for README embeds
- **Show a completed chat response** — the streaming state doesn't look as good in stills
- **Pick the CFO chat or FP&A variance** response as your hero image — it best demonstrates the agent quality
- **Use dark background pages** (CFO Executive Summary, Agent Command banner) for contrast
- Crop to remove browser chrome (address bar, tabs) for cleaner portfolio images

## After Taking Screenshots

Update the README.md image references:

```markdown
![Dashboard](screenshots/01-dashboard.png)
![CFO Agent Chat](screenshots/04-cfo-chat.png)
![FP&A Variance Analysis](screenshots/06-fpa-variance.png)
```
