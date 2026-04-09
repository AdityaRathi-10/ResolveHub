<div align="center">

# 🎯 ResolveIt

**Complete Complaint Resolution Workflow**

_Students report • Caretakers execute • Supervisors monitor_

![Next.js](https://img.shields.io/badge/Next.js-16-000?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-087ea4?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2d3748?style=for-the-badge&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14-336791?style=for-the-badge&logo=postgresql)

</div>

---

## The Problem

- Complaints scattered across WhatsApp, email, chats
- No clear ownership or accountability
- Progress invisible to supervisors
- Proof of work never requested

**ResolveIt solves this** with a single governed workflow.

---

## Complete Workflow (End-to-End)

| Step | Actor | Action | Input | Output |
|------|-------|--------|-------|--------|
| **1** | Student | Create complaint | Title, description, priority, attachments | Complaint created with deadline (based on priority) |
| **2** | Caretaker | Claim & start work | Click "Assign to me", then "Start work" | Complaint status → IN PROGRESS |
| **3** | Caretaker | Submit resolution | Write description + upload proof (photos/docs/notes) | Resolution status → AWAITING REVIEW |
| **4a** | Student | Approve resolution | Review proof, click "Mark Resolved" | Complaint status → RESOLVED, Caretaker gets points |
| **4b** | Student | Reject resolution | Write rejection reason, click "Request changes" | Complaint status → IN PROGRESS, Caretaker returns to work |
| **5** | Student | Close complaint | Click "Close complaint" | Complaint status → CLOSED |
| **6** | Supervisor | Monitor & track | View dashboard, audit trail, leaderboard | See performance metrics and full history |

---

## Role Responsibilities

| Role | What They Do | Why It Matters |
|------|--------------|----------------|
| **🎓 Student** | Report issue, upvote, comment, review & approve solutions | Ensures fixes actually work |
| **🔧 Caretaker** | Claim task, execute work, submit proof, handle feedback | Brings accountability to execution |
| **📊 Supervisor** | Monitor progress, track performance, ensure quality | Maintains governance and metrics |

---

## Complaint States

**PENDING** → (Caretaker claims) → **IN PROGRESS** → (Caretaker submits proof) → **AWAITING REVIEW**

At AWAITING REVIEW, student chooses:
- ✅ **APPROVE** → **RESOLVED** → (Student closes) → **CLOSED**
- ❌ **REJECT** → Returns to **IN PROGRESS** (Caretaker reworks & resubmits)

---

## What Caretaker Points Reward

## Caretaker Points System

**Base**: 100 points per approved resolution

**Quality Penalty**: -10 points per rejected attempt  
**Timeliness Penalty**: -10 points per day overdue (minimum 70 points total)

Example: Approved on 1st try, 1 day late = 90 points

---

## System Architecture

**Frontend**: Next.js App Router + React  
→ **Middle Layer**: NextAuth (auth) + Server Actions (logic) + Supabase Subscribe (realtime)  
→ **Data Layer**: Prisma ORM → PostgreSQL  
→ **External**: Supabase Realtime (sync events), Cloudinary (media storage)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, TypeScript 5 |
| **Styling** | Tailwind CSS 4, shadcn/ui, Radix UI |
| **Forms** | React Hook Form + Zod validation |
| **Auth** | NextAuth.js (Credentials + JWT) |
| **Database** | PostgreSQL + Prisma ORM |
| **Realtime** | Supabase Realtime channels |
| **Media** | Cloudinary (next-cloudinary) |
| **Notifications** | Sonner toasts |

---

## ✨ Key Features

### Workflow & Governance
✅ Three distinct roles with clear boundaries  
✅ Complaint state machine prevents invalid transitions  
✅ **Proof-first**: Resolution must include description or media  
✅ Rejection loop forces quality enforcement  
✅ Immutable audit trail for accountability  

### Real-Time & Collaboration
✅ Live updates across all clients via Supabase  
✅ Per-complaint discussion threads  
✅ Community upvoting surfaces urgent issues  
✅ Media attachments (photos, documents, screenshots)  
✅ Full activity timeline visible to all roles  

### Performance & Monitoring
✅ Caretaker points system (quality + timeliness)  
✅ Supervisor leaderboard for team comparison  
✅ Deadline escalation when overdue  
✅ Efficiency metrics (resolutions per complaint)  

---

## 💼 Why This Matters for Your Portfolio

ResolveIt demonstrates genuine full-stack maturity:

✓ **Real role orchestration**  
Not a toy project—three distinct personas with conflicting needs, unified through clear workflows

✓ **Complete operational lifecycle**  
From intake through execution, proof submission, review, iteration, and closure

✓ **Evidence-driven design**  
No status updates without proof; prevents rubber-stamping and enforces accountability

✓ **Realtime synchronization**  
Supabase subscriptions keep distributed clients in perfect sync—comments, status, approvals, audit events all live

✓ **Governance patterns**  
Audit logging, role-based guards, deadline tracking—enterprise-grade accountability

✓ **Performance incentives**  
Points system that rewards both speed and quality, not just completion

---

<div align="center">

**ResolveIt is not a forms builder.**  
**It's a complete, governed workflow system for accountability.**

</div>
