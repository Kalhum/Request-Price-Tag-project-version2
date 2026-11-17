<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project Context & Guidelines: Request Price Tag System

## 1. Project Overview
ระบบ **Request Price Tag** เป็นเว็บแอปพลิเคชันสำหรับการจัดการคำขอและสั่งพิมพ์ป้ายราคาสินค้าตามสาขา (Store Branches) รองรับการสร้างคำขอรายชิ้น, การอัปโหลดไฟล์คำขอจำนวนมาก, การจัดการหมวดหมู่, การพรีวิวแผ่นพิมพ์ป้ายราคา (Print Sheet Preview) ตามรูปแบบสติกเกอร์ และการดูรายงานย้อนหลังพร้อมสั่งพิมพ์ซ้ำ (Reprint)

---

## 2. Tech Stack & Dependencies
- **Framework:** Next.js 16 (App Router)
- **Library:** React 19
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS v4
  - มีการกำหนด Design Tokens ผ่าน `@theme` ใน `app/globals.css` (เช่น `--color-primary: #00599e`, `--radius-button`, ฟอนต์ `--font-prompt`, `--font-roboto`)
  - ใช้ `@tailwindcss/postcss` ร่วมกับ `postcss.config.mjs` (**ห้ามลบไฟล์ config นี้**)
  - รองรับ Print stylesheet ผ่าน `@media print` สำหรับพิมพ์ป้ายราคา
- **Database:** MySQL (เชื่อมต่อผ่าน `mysql2/promise` ใน `libs/db.ts`)
- **Authentication:** NextAuth (`next-auth`)
- **Utilities:** `lucide-react`, `dayjs`, `clsx`, `tailwind-merge`

---

## 3. Architecture & Directory Structure
โปรเจกต์ใช้โครงสร้างแบบ **Separation of Concerns (Layered Architecture)** อย่างชัดเจน:

```
├── app/
│   ├── (dashboard)/            # Route Groups สำหรับหน้า Dashboard หลัก
│   │   ├── home/               # หน้าแดชบอร์ดสรุปสถิติ
│   │   ├── createRequest/      # หน้าสร้างคำขอป้ายราคา (เดี่ยว / อัปโหลดไฟล์)
│   │   ├── printingCategory/   # หน้าจัดการพิมพ์ตามหมวดหมู่
│   │   ├── printtingRequest/   # หน้าคิวคำขอพิมพ์และสั่งพิมพ์ป้าย
│   │   ├── manageCategory/     # หน้าจัดการหมวดหมู่ป้ายราคา
│   │   └── report/             # หน้ารายงานและประวัติการพิมพ์ซ้ำ
│   ├── api/                    # Route Handlers (RESTful Endpoints)
│   │   ├── auth/               # ระบบยืนยันตัวตน
│   │   ├── home/               # API ข้อมูลสถิติหน้าแรก
│   │   ├── products/           # API ข้อมูลสินค้า
│   │   ├── requests/           # API คำขอป้ายราคา
│   │   ├── printing/           # API จัดการงานพิมพ์และหมวดหมู่พิมพ์
│   │   └── reports/            # API รายงานและพิมพ์ซ้ำ
│   └── globals.css             # Theme Tokens & Global / Print Styles
├── components/                 # Reusable UI & Feature Components
├── hook/                       # Custom React Hooks สำหรับจัดการ State & Data Fetching
├── libs/                       # Core Utilities (DB connection, API response, Validator, Logger, Toast)
├── repo/                       # Data Access Layer (SQL queries ติดต่อฐานข้อมูล MySQL)
├── services/                   # Business Logic Layer
└── types/                      # TypeScript Definitions / Data Contracts
```

---

## 4. Coding Standards & Conventions

### 4.1 Data Flow Pattern
เมื่อเพิ่มหรือแก้ไขฟีเจอร์ ให้ทำตาม Flow ดังนี้เสมอ:
1. **Types (`types/`)**: กำหนด Data Type หรือ Interface ที่จำเป็น
2. **Repository (`repo/`)**: เขียนฟังก์ชัน Query ฐานข้อมูล (ใช้ Parameterized Query เสมอเพื่อป้องกัน SQL Injection)
3. **Service (`services/`)**: รวม Business Logic, ตรวจสอบเงื่อนไข, จัดรูปข้อมูล
4. **Route Handler (`app/api/`)**: รับ Request, Validate ข้อมูล, แล้วเรียก Service
5. **Custom Hook (`hook/`)**: เชื่อมต่อ API และจัดการ State บน Client
6. **Component (`components/` / `app/`)**: แสดงผล UI โดยใช้ Hook และแยก Presentational Component ให้ชัดเจน

### 4.2 Standard API Response
ทุก API Route ใน `app/api/` ต้องใช้ Response Helper มาตรฐานจาก `@/libs/api-response`:
```typescript
import { apiSuccess, apiError } from "@/libs/api-response";

// สำหรับกรณีสำเร็จ
return apiSuccess(data, 200); // หรือ 201

// สำหรับกรณี Error
return apiError("ข้อความแจ้งเตือน", 400, "ERROR_CODE");
```

### 4.3 Styling & UI Rules
- ใช้คลาสสีและขนาดจาก Design Tokens ใน `@theme` เช่น `bg-primary`, `text-secondary`, `rounded-button`, `p-card`, `shadow-card`
- หากเป็นปุ่มให้ใช้คลาส reusable: `.btn-primary`, `.btn-secondary`, `.btn-success`, `.btn-danger`
- สำหรับกล่องข้อความใช้: `.input-default`
- ระมัดระวังคลาสสำหรับการพิมพ์ (`.print-price-tag-sheet`, `.print-modal-backdrop` ฯลฯ) เพราะมีผลกับการปริ้นป้ายราคาจริง

---

## 5. Do's and Don'ts สำหรับ AI Agents
- **ห้าม** ลบหรือย้าย `postcss.config.mjs` เนื่องจากจำเป็นต่อการ compile Tailwind CSS v4 ใน Next.js 16
- **ห้าม** แนะนำให้ commit หรือ push โฟลเดอร์ `node_modules/` หรือ `.next/` เข้าสู่ Git เด็ดขาด
- **ห้าม** เขียน SQL Query ลงใน Component หรือ API Route โดยตรง ให้ส่งผ่าน `repo/` เสมอ
- **ควร** ใช้ Type Safety อย่างเคร่งครัด อ้างอิง Type จากโฟลเดอร์ `@/types`
