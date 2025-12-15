![DevKnight Banner](./assets/devknight-banner.png)

---

# DevKnight-DMS

![Status](https://img.shields.io/badge/status-active-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-integrated-green)
![License](https://img.shields.io/badge/license-proprietary-red)

# DevKnight-DMS – Secure Document Management & Access Control Platform
> **Enterprise Prototype Repository (Open Source Components) — Final Commercial Version Owned by DevKnight (DKCDEVKNIGHT TECHNOLOGIES PRIVATE LIMITED)**  
> **Original Author & Developer: Azhaan Shaikh**

## 1. Overview  
DevKnight-DMS is a secure, modular Document Management System designed for organizations that need controlled access, auditability, and structured information governance.

Instead of being a simple file uploader, DevKnight-DMS is built as a role-aware access control system integrating:
- Document permissions  
- User roles & admin control  
- Share governance  
- Audit trails  
- Quarantine for suspicious documents  
- Supabase authentication  
- Next.js + TypeScript architecture  

The system is suitable for:
- Internal enterprise document workflows  
- Legal/HR governance  
- Multi-user collaboration  
- Sensitive document storage  

Built with **Next.js, TypeScript, and Supabase**, designed for modern cloud deployments.

## 2. Origin & Development History  
DevKnight-DMS was conceptualized and engineered primarily by **Azhaan Shaikh**, including architecture, access logic, admin UI, and Supabase integration.

Goals:
1. Create an auditable, secure DMS  
2. Build deterministic, reliable access models  
3. Evolve into SaaS-grade product  
4. Maintain modular extensibility  

Prototype → Alpha → Internal Production phases.

## 3. Ownership & Licensing Notice  

| Component | Ownership | License |
|----------|-----------|---------|
| Prototype (this repo) | Azhaan Shaikh | Open-source (Custom License – see §15) |
| Experimental builds | Azhaan Shaikh | Open-source |
| Final SaaS version | DevKnight (DKCDEVKNIGHT TECHNOLOGIES PRIVATE LIMITED) | Closed-source |
| Brand “DevKnight-DMS” | DevKnight | Commercial IP |

Prototype only. Commercial version is not open-source.

## 4. Prototype vs Commercial Product

| Feature | Prototype | Commercial SaaS |
|---------|----------|-----------------|
| Next.js App | ✅ | ✅ |
| Supabase Auth | ✅ | Advanced |
| Document Permissions | Basic | Enterprise RBAC |
| Audit Logs | Basic | Compliance-grade |
| Quarantine | Basic | Automated flagging |
| Teams/Spaces | ❌ | ✅ |
| Billing | ❌ | ✅ |
| SSO, OAuth | ❌ | Enterprise |

## 5. Architecture & Stack

\`\`\`
Next.js Frontend → Access Layer → Supabase Backend → Audit / Storage / Permissions
\`\`\`

✅ TypeScript backend  
✅ RLS-enforced access control  
✅ Supabase storage + auth  
✅ Admin workflow logic  

## 6. Features  
✅ Document uploads  
✅ Admin dashboard  
✅ User management  
✅ Share creation/deletion  
✅ Quarantine system  
✅ Audit logs (latest 100)  
✅ REST API endpoints  
✅ Environment-based config  

## 7. Installation & Setup
1️⃣ Clone repository
\`\`\`bash
git clone https://github.com/azhhhyyy/DevKnight-DMS/
cd devknight-dms
npm install
npm run dev
\`\`\`
2️⃣ Setup Environment Variables
Create `.env`:
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
\`\`\`

## 8. Deployment Options

| Deployment | Supported |
|-----------|-----------|
| Vercel | ✅ |
| Supabase Edge | ✅ |
| Docker | ✅ |
| Local | ✅ |
| Kubernetes | Prototype: ❌ / SaaS: ✅ |

## 9. Folder Structure

\`\`\`
devknight-dms/
│── app/
│── lib/
│── components/
│── config/
│── prototype/
│── README.md
│── LICENSE
\`\`\`

## 10. Roadmap (Prototype)

| Task | Status |
|------|--------|
| RBAC | ✅ |
| Audit Logs | ✅ |
| Quarantine | ✅ |
| Dashboard | Partial |
| Export Features | 🔜 |
| Org Roles | 🔜 |

## 11. Contribution Guidelines  
Forks welcome for prototype only.  
Commercial misuse prohibited.  
PRs allowed for bug fixes, docs, UI, plugins (non-commercial).

## 12. Legal Notice

- Created and engineered primarily by **Azhaan Shaikh**  
- All commercial rights belong to **DevKnight**  
- This repo is prototype-only  
- Commercial version cannot be reverse-engineered  

## 13. Credits  
**Azhaan Shaikh** — Founder, Architect, Full Stack Designer  
Internal DevKnight support team — Minor contributions  

No external institutions involved.

## 14. Contact & Support

📩 Business / Licensing: azhaanshaikh2005@gmail.com 👤 Creator & Author (Prototype): Azhaan Shaikh 🌐 Azhaan Shaikh: https://azhaanshaikh.com 🌐 DevKnight: https://devknight.club 🔒 Commercial product inquiries handled exclusively by DevKnight

## 15. License (Custom “Open-Source Prototype License”)

\`\`\`
You may:
✓ View, study, and modify the prototype  
✓ Fork for educational use  
✓ Extend for non-commercial use  

You may NOT:
✗ Use in commercial products  
✗ Use the name “DevKnight-DMS” commercially  
✗ Redistribute under a commercial license  
✗ Remove attribution  

Commercial version is CLOSED SOURCE and owned by DevKnight.
\`\`\`
