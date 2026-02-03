# Product Requirements Document (PRD): Western Sports Hub

## 1. Project Overview
**Western Sports Hub** is a web application designed to be the central directory for rodeo and western lifestyle events in North America. It allows fans to find events and services, and enables producers/users to submit their own events.

**Core Value Proposition:**
1.  **Comprehensive Event Discovery:** Aggregating scattered rodeo schedules into one searchable map/list.
2.  **Service Directory:** Connecting users with western lifestyle service providers (Farriers, Trainers, etc.).
3.  **Community Driven:** allowing users to submit events and venues.

## 2. Target Audience
* **Fans:** Looking for weekend entertainment (Rodeos, Bull Riding).
* **Participants:** Looking for jackpots, clinics, and services.
* **Producers:** Need a free platform to promote their events.

## 3. Tech Stack (Strict Requirements)
* **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS.
* **Database & Auth:** Supabase (PostgreSQL).
* **Maps & Geocoding:** Mapbox (Selected for generous free tier).
* **Styling:** Mobile-first, clean, modern UI.

## 4. Key Features (MVP Scope)

### A. Authentication & User Roles
* **Auth:** Email/Password & Social Login (Google).
* **Roles:**
    * **Guest:** Can search and view events/services.
    * **User:** Can submit events/services, manage their own submissions, favorite items.
    * **Admin:** Can approve/reject submissions, edit any record.

### B. Event Engine
* **Discovery:**
    * Search by Location (Radius search).
    * Filter by Discipline (e.g., "Bull Riding", "Team Roping").
    * Filter by Date Range.
* **Submission (CRUD):**
    * Users can create an event.
    * **Recurring Logic:** UI helper to generate multiple event rows for a series (e.g., "Every Saturday for 6 weeks"). The DB stores individual events, not the rule.
    * **Data Points:** Title, Venue (linked), Date/Time, Disciplines (Tags), Sanctioning Bodies (Tags), Flyer Image, Website Link, Classes/Divisions (Text blob).
* **Approval System:**
    * User submissions default to `PENDING` status.
    * Admin dashboard to `APPROVE` or `REJECT`.
    * Public only sees `APPROVED` events.

### C. Service Directory
* **Categories:** Farriers, Stock Contractors, Trainers, Boarding, etc.
* **Submission:** Users submit business info + service radius.
* **Approval:** Defaults to `PENDING`. Needs Admin approval.

### D. Venues
* **Venue Database:** Distinct from events.
* **Inline Creation:** If a user submits an event at a new venue, they can create the venue within the flow.
* **Constraint:** An Event cannot be approved if its linked Venue is not approved.

### E. Geocoding Strategy
* When a Venue is created/updated, the address is sent to Mapbox Geocoding API.
* The returned `lat` and `long` are stored in the database for radius calculations.

## 5. Non-Functional Requirements
* **Mobile Responsiveness:** 80% of traffic will likely be mobile.
* **Performance:** Fast initial load (SSR).
* **SEO:** Events must be indexable (Schema.org/Event).
