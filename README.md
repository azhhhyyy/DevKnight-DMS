![DevKnight Banner](https://raw.githubusercontent.com/azhhhyyy/DevKnight-DMS/refs/heads/main/assets/devknight-banner.png)

---

# DevKnight-DMS

![Status](https://img.shields.io/badge/status-active-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-integrated-green)
![License](https://img.shields.io/badge/license-proprietary-red)

---

## ⚡ Overview

DevKnight-DMS is a secure, scalable, and modern Document Management System engineered for teams that need tight access control, clear auditability, and structured document governance.  
The system integrates role-based permissions, a sharing engine, an admin console, and comprehensive action tracking — built with **Next.js**, **TypeScript**, and **Supabase**.

---

## 🧩 Core Features

### 🔐 Role-Based Access Control  
TypeScript-powered authentication & authorization with robust permission checks.

### 🔗 Document Sharing Control  
Admin-controlled sharing workflows through `/api/admin/shares`.

### 🛠️ Admin Management Console  
User management, access supervision, and share governance.

### 📝 Audit Logging  
Retrieves the last 100 system actions via `/api/audit-logs` for compliance and visibility.

### 🧪 Quarantine System  
Isolates suspicious or restricted files from general access.

---

## 🏛️ System Architecture

```txt
┌──────────────────────────┐
│        Next.js App       │
│  (UI, API Routes, Auth)  │
└──────────────┬───────────┘
               │
               │ Supabase Client
               ▼
┌──────────────────────────┐
│        Supabase          │
│ Auth • Database • RLS    │
│ Tables: users, shares,   │
│ audit_logs, quarantine   │
└──────────────────────────┘
````

---

## 📦 Requirements

* Node.js ≥ 16
* npm or yarn
* TypeScript
* Supabase project with authentication enabled

---

## 🚀 Quickstart

### 1. Clone

```bash
git clone https://github.com/azhhhyyy/DevKnight-DMS.git
cd DevKnight-DMS
```

### 2. Install

```bash
npm install
# or
yarn install
```

### 3. Configure Supabase

Create `.env`:

```
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

### 4. Database Setup

Required tables include:

* `audit_logs`
* `shares`
* `users` (managed by Supabase Auth)
* optional: `quarantine`

Enable RLS and define role-based policies.

### 5. Run

```bash
npm run dev
# or
yarn dev
```

App runs at:
**[http://localhost:3000](http://localhost:3000)**

---

## 📡 API Reference

| Endpoint                 | Method | Description                            |
| ------------------------ | ------ | -------------------------------------- |
| `/api/admin/users`       | GET    | Fetch all users (Admin only)           |
| `/api/admin/shares`      | GET    | Fetch all document shares (Admin only) |
| `/api/admin/shares/[id]` | DELETE | Delete a share entry (Admin only)      |
| `/api/audit-logs`        | GET    | Fetch latest 100 audit logs            |

---

## 🧪 Example Endpoint Implementation

```ts
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)

    if (error) {
      console.error("Audit logs fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Unexpected error fetching audit logs:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
```

---

## ⚙️ Configuration

* Controlled through `.env`
* Depends heavily on Supabase RLS policies
* Admin privileges enforced through server-side helpers:

  * `getCurrentUser()`
  * `getUserRole()`
  * `canManageUsers()`

---

## 🤝 Contributing

1. Fork
2. Create a feature branch
3. Commit & test
4. Open a pull request

Clear and concise PR descriptions are appreciated.

---

## 📄 License

All rights reserved to **azhhhyyy**.
License terms not publicly specified.

---

## 🙌 Acknowledgments

* **Next.js** — UI framework
* **Supabase** — Auth + DB stack
* **TypeScript** — Strong, scalable codebase

---

If you want, I can also generate:

* a polished logo banner,
* a “Tech Stack” infographic,
* an architecture diagram SVG,
* or a fully branded DevKnight README theme.


## 🧾 License

You are free to use this code as inspiration. Please do not copy it directly. Crediting the author is appreciated. Please remove all personal information (images, etc.)

---

## 📬 Contact

* **Owner:** azhhhyyy
* **Repo:** `github.com/azhhhyyy/DevKnight-DMS`
* **Email:** `hello@devknight.club`

---
