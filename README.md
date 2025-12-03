![DevKnight Banner](https://raw.githubusercontent.com/azhhhyyy/DevKnight-DMS/refs/heads/main/assets/devknight-banner.png)

---

# DevKnight-DMS 

![Status](https://img.shields.io/badge/status-active-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-integrated-green)
![License](https://img.shields.io/badge/license-proprietary-red)

---

> **DevKnight DMS** — a secure, modern Document Management System for teams that demand airtight governance, auditable workflows, and developer ergonomics.

---

## 🎯 Brand Essence

* **Name:** DevKnight
* **Positioning:** MSME Friendly, developer-first DMS with productized security and simple admin workflows.
* **Tone:** Confident, precise, technical-friendly, serviceable.

---

## 🎨 Visual Identity

### Logo

* Primary: `assets/devknight-logo.svg`
* Variant: `assets/devknight-mark.svg`

### Color Palette

* `--dk-primary: #0F172A` (Rich Night — primary background / dark text)
* `--dk-accent: #00E5A8` (Neon Mint — accents, CTAs)
* `--dk-contrast: #FFFFFF` (White — typography on dark)
* `--dk-muted: #9AA4B2` (Muted Slate — secondary text)
* `--dk-danger: #FF5C5C` (Alert Red — errors & warnings)

**Palette swatches:**

| Name        |       Hex |
| ----------- | --------: |
| Rich Night  | `#0F172A` |
| Neon Mint   | `#00E5A8` |
| White       | `#FFFFFF` |
| Muted Slate | `#9AA4B2` |
| Alert Red   | `#FF5C5C` |

### Typography

* Headings: **Inter** (700) — modern, geometric
* Body: **Inter** (400) or system-ui fallback
* Mono (code): **JetBrains Mono** or `ui-monospace, SFMono-Regular`

CSS snippet for README rendering (optional):

```css
:root{
  --dk-primary:#0F172A; --dk-accent:#00E5A8; --dk-contrast:#FFFFFF; --dk-muted:#9AA4B2; --dk-danger:#FF5C5C;
}
.readme-hero{background:linear-gradient(180deg, rgba(15,23,42,1) 0%, rgba(6,10,27,1) 100%); color:var(--dk-contrast); padding:48px; border-radius:12px}
.readme-cta{background:var(--dk-accent); color:var(--dk-primary); padding:10px 18px; border-radius:8px; font-weight:600}
```

---

## 🚀 Hero / Quick Summary (copy for README top)

> **DevKnight — Secure Document Management for modern teams.**
>
> Role-based access, audited sharing, and quarantine-first policies. Built with Next.js, TypeScript, and Supabase.

---

## 📦 Quick Start (developer flow)

```bash
# clone
git clone https://github.com/azhhhyyy/DevKnight-DMS.git
cd DevKnight-DMS

# install
npm install
# or
yarn install

# env
cp .env.example .env
# populate NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

# dev server
npm run dev
```

**Local:** [http://localhost:3000](http://localhost:3000)

---

## ✨ Features (branded highlights)

* **Knight-Level Security** — Role-based access controls, RLS-backed policies in Supabase.
* **Sharable Vaults** — Admin-manageable shares with expiration and scope.
* **Audit Trail** — Immutable `audit_logs` for traceability.
* **Quarantine Mode** — Isolate suspicious uploads from main storage.
* **Developer Ergonomics** — TypeScript-first, server helpers (`getCurrentUser`, `getUserRole`).

---

## 🔌 API Examples (branded)

**Fetch latest audit logs**

```ts
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100)

  if (error) return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  return NextResponse.json({ data })
}
```

---

## 🏗 Architecture (diagram and explanation)

**High level:**

```
[Browser/Client] <---> [Next.js App (API routes + UI)] <---> [Supabase (Auth, Postgres, Storage)]
                                   |
                                   +--> Optional: Worker (background tasks)
```

**Notes:**

* Supabase Auth manages users and sessions. Use RLS policies for server-side enforcement.
* Store files in Supabase Storage; use signed URLs for short-lived access.
* Use `audit_logs` table for append-only event tracking.

---

## 🧩 Brand Assets (suggested repo layout)

```
/assets
  /logo
    devknight-logo.svg
    devknight-mark.svg
  /banners
    devknight-banner.svg
  /icons
    lock.svg
    shield.svg
/README.md
/CONTRIBUTING.md
/LICENSE
```

---

## 📸 Screenshots & Demos

* `assets/screens/dashboard.png` — Admin dashboard
* `assets/screens/shares.png` — Shares list and controls
* `assets/screens/audit.png` — Audit logs UI

Include these images in the README using markdown image links so the project page looks polished.

---

## ♟️ UX Patterns & Component Guidance

* **Action Rows:** compact rows with contextual actions (revoke, extend, audit)
* **Permission Chips:** show scope: `viewer`, `editor`, `owner` — colored by severity
* **Quarantine Banner:** sticky banner in UI when quarantine contains items
* **Audit Timeline:** timeline view with filters (user, date, action)

---

## 🛡 Security Checklist (ship only when)

* RLS policies for all sensitive tables
* Signed URLs for file downloads
* Rate-limiting on share endpoints
* Admin MFA for critical actions (deleting shares, bulk export)
* Periodic audit log export (S3 or data-warehouse)

---

## 🧭 Contribution Guidelines (concise)

1. Fork → feature branch → PR. Use clear, atomic commits.
2. Follow TypeScript linting rules: `npm run lint`.
3. Write unit tests for business logic and API behavior.
4. Use `CONTRIBUTING.md` template for PR description and checklist.

---

## 📣 Release & Changelog

* Use `Keep a Changelog` format. Tag releases like `v0.1.0`.

---

## 📎 Templates

Provide small templates in `.github/` for issues and PRs:

* `bug_report.md`
* `feature_request.md`
* `pr_template.md`

---

## 🧾 License

* Proprietary / All rights reserved to **azhhhyyy** (or replace with your chosen open-source license).

---

## 📬 Contact

* **Owner:** azhhhyyy
* **Repo:** `github.com/azhhhyyy/DevKnight-DMS`
* **Email:** `devknight@yourdomain.com` (replace as appropriate)

---
