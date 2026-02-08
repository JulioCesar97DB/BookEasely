# BookEasely -- Complete Requirements Document

**Project:** BookEasely -- Booking Platform for Small & Medium Businesses  
**Author:** Julio  
**Date:** February 2026  
**Version:** 2.0

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [User Roles & Permissions](#2-user-roles--permissions)
3. [Functional Requirements](#3-functional-requirements)
   - 3.1 [Authentication & Authorization](#31-authentication--authorization)
   - 3.2 [Client Features](#32-client-features)
   - 3.3 [Business Owner Features](#33-business-owner-features)
   - 3.4 [Worker Features](#34-worker-features)
   - 3.5 [Booking Logic](#35-booking-logic)
   - 3.6 [Notifications](#36-notifications)
   - 3.7 [Reviews & Ratings](#37-reviews--ratings)
   - 3.8 [Admin Panel (Web)](#38-admin-panel-web)
   - 3.9 [Payments (Future Phase)](#39-payments-future-phase)
4. [User Interface & Experience](#4-user-interface--experience)
   - 4.1 [Mobile App (React Native + Expo)](#41-mobile-app-react-native--expo)
   - 4.2 [Web App (Next.js)](#42-web-app-nextjs)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [Data Model Overview](#6-data-model-overview)
7. [Third-Party Integrations](#7-third-party-integrations)
8. [Deployment & Infrastructure](#8-deployment--infrastructure)
9. [Milestones & Delivery Phases](#9-milestones--delivery-phases)
10. [Acceptance Criteria](#10-acceptance-criteria)

---

## 1. Product Overview

### 1.1 What is BookEasely?

**BookEasely** is a modern booking platform designed for small and medium businesses (SMBs). It serves as a marketplace where clients discover businesses, browse their services, view worker profiles, and book appointments -- all from a single platform available on both web and mobile.

BookEasely is not just a scheduling tool. It is a search-and-book experience: anyone can search for businesses by name, category, or location and explore business profiles with photos, reviews, and service menus -- all without creating an account. The landing page itself is the discovery experience, with a prominent search bar and category browsing. When a user decides to book an appointment, they are prompted to sign up or log in. This removes friction for discovery while ensuring only verified users make bookings.

### 1.2 Problem It Solves

**For Clients:**

| Problem                                                | How BookEasely Solves It                                             |
| ------------------------------------------------------ | -------------------------------------------------------------------- |
| Playing phone tag to schedule appointments             | Book instantly online, 24/7                                          |
| Difficulty discovering quality local businesses        | Search by category, location, ratings, and reviews                   |
| No visibility into real-time availability              | See live time slots based on actual worker schedules                 |
| Outdated business information scattered across the web | One up-to-date profile with hours, services, photos, and reviews     |
| No centralized place to manage upcoming appointments   | Personal booking dashboard with history, upcoming, and notifications |

**For Businesses:**

| Problem                                               | How BookEasely Solves It                                        |
| ----------------------------------------------------- | --------------------------------------------------------------- |
| Manual scheduling via phone, paper, or messaging apps | Automated online booking system with calendar management        |
| High no-show rates                                    | Automated email and push reminders before appointments          |
| No professional online presence                       | Business profile page with photos, services, reviews, and hours |
| Lost clients who cannot reach them after hours        | Clients book anytime, even outside business hours               |
| Complex or expensive scheduling software              | Simple, affordable platform built for SMBs                      |

### 1.3 Value Proposition

> **"One platform to manage your business bookings end-to-end."**

For **clients**: Discover local businesses, see real availability, and book in seconds -- no phone calls, no guesswork.

For **businesses**: Fill your calendar automatically, reduce no-shows, and look professional online without the complexity or cost of enterprise tools.

### 1.4 Architecture

BookEasely is built as a **monorepo** with three main components:

| Component  | Technology                                                     | Purpose                                                                               |
| ---------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Web App    | Next.js (App Router)                                           | Client-facing website, business dashboards, admin panel                               |
| Mobile App | React Native + Expo                                            | iOS and Android app for clients and business owners/workers                           |
| Backend    | Supabase (PostgreSQL, Auth, Storage, Edge Functions, Realtime) | Database, authentication, file storage, serverless functions, real-time subscriptions |

The monorepo structure ensures shared types, consistent business logic, and streamlined development across platforms.

---

## 2. User Roles & Permissions

BookEasely supports four distinct user roles. Each role has specific permissions governing what the user can see and do within the platform.

### 2.0 Guest (Unauthenticated)

Any visitor to the platform -- no account required. Guests can browse the entire marketplace but cannot take actions that modify data.

| Permission                   | Description                                                                                      |
| ---------------------------- | ------------------------------------------------------------------------------------------------ |
| Search & discover businesses | Browse businesses by name, service type, category, or location from the landing page             |
| View business profiles       | See photos, services, workers, reviews, hours of operation                                       |
| View search results          | Filter and sort businesses by category, rating, etc.                                             |
| **Cannot** book              | Attempting to book redirects to sign-up/login. After auth, the user returns to the booking flow. |
| **Cannot** leave reviews     | Must be authenticated with a completed booking                                                   |
| **Cannot** save favorites    | Must be authenticated                                                                            |

### 2.1 Client

The default role for users who sign up to find and book services. Phone number is required at registration.

| Permission                   | Description                                                                              |
| ---------------------------- | ---------------------------------------------------------------------------------------- |
| Search & discover businesses | Browse businesses by name, service type, category, or location                           |
| View business profiles       | See photos, services, workers, reviews, hours of operation                               |
| Book appointments            | Select a service, pick a worker (or "any available"), choose a time slot, and confirm    |
| Manage own bookings          | View upcoming and past bookings; cancel or reschedule subject to business policy         |
| Leave reviews                | Rate (1-5 stars) and write text reviews for completed appointments                       |
| Save favorites               | Bookmark businesses for quick access later                                               |
| Manage profile               | Edit name, photo, phone number, and notification preferences                             |
| Receive notifications        | Get push and email notifications for booking confirmations, reminders, and cancellations |

### 2.2 Business Owner

Users who register a business on the platform. A business owner manages the business profile, services, workers, and bookings.

| Permission                       | Description                                                                                   |
| -------------------------------- | --------------------------------------------------------------------------------------------- |
| Create & manage business profile | Set name, description, category, address, phone, photos, logo, hours of operation             |
| Manage services                  | Add, edit, remove services with name, description, price, duration, and assigned workers      |
| Manage workers                   | Invite workers by email, assign roles, set permissions, remove workers                        |
| Add self as worker               | If operating solo, add yourself as the single worker for the business                         |
| Configure business settings      | Set cancellation policy, auto-confirm vs. manual confirm, buffer time between appointments    |
| View full business calendar      | See all workers' bookings in a unified calendar view                                          |
| Manage bookings                  | Approve, complete, cancel, or mark bookings as no-show                                        |
| View analytics dashboard         | Access total bookings, revenue estimates, ratings, peak hours, and worker performance metrics |
| Respond to reviews               | Write public responses to client reviews                                                      |
| Receive notifications            | Get push and email alerts for new bookings, cancellations, and reviews                        |

### 2.3 Worker (Staff Member)

Workers are staff members added to a business by the business owner. They have their own schedules and can manage their own bookings.

| Permission                 | Description                                                                |
| -------------------------- | -------------------------------------------------------------------------- |
| View personal schedule     | See own calendar with assigned bookings                                    |
| Set weekly availability    | Define recurring weekly schedule (e.g., Mon-Fri 9:00 AM - 5:00 PM)         |
| Block specific dates/times | Mark time off, holidays, or unavailable periods                            |
| View assigned bookings     | See booking details including client name, service, date, time, and notes  |
| Update booking status      | Mark bookings as completed or no-show                                      |
| Edit personal profile      | Update name, photo, bio, and specialties displayed on the business profile |
| Receive notifications      | Get push and email alerts for new, changed, or cancelled bookings          |

### 2.4 Admin

Platform administrators with system-wide access. Admin panel is web-only.

| Permission          | Description                                                                      |
| ------------------- | -------------------------------------------------------------------------------- |
| Platform dashboard  | View system-wide statistics (total users, businesses, bookings, revenue)         |
| User management     | View, suspend, or delete any user account                                        |
| Content moderation  | Review and remove inappropriate reviews or business content                      |
| Category management | Add, edit, remove, and reorder service categories                                |
| System settings     | Configure platform-wide booking rules, notification templates, and feature flags |

---

## 3. Functional Requirements

### 3.1 Authentication & Authorization

| ID      | Requirement                               | Priority | Platform     | Details                                                                                                                                                                                                                           |
| ------- | ----------------------------------------- | -------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AUTH-1  | Email/password sign-up and login          | P0       | Web + Mobile | Standard email and password registration with email verification. Phone number is required during signup. Passwords must meet minimum complexity requirements (8+ characters, at least one uppercase, one lowercase, one number). |
| AUTH-2  | Google OAuth                              | P0       | Web only     | Google Sign-In via Supabase Auth for one-click registration and login. Mobile Google OAuth is deferred to post-MVP due to additional native configuration complexity.                                                             |
| AUTH-3  | Apple Sign-In                             | Post-MVP | Mobile only  | Apple Sign-In for iOS users. Deferred due to Apple developer configuration requirements and mobile-specific complexity.                                                                                                           |
| AUTH-4  | Role-based access control                 | P0       | Web + Mobile | Enforce permissions based on user role (Client, Business Owner, Worker, Admin). Supabase RLS policies must restrict data access per role.                                                                                         |
| AUTH-5  | Password reset via email                  | P0       | Web + Mobile | "Forgot Password" flow sends a secure, time-limited reset link to the user's email address. Link expires after 24 hours.                                                                                                          |
| AUTH-6  | Session management with JWT               | P0       | Web + Mobile | Supabase Auth manages sessions via JWT tokens. Tokens auto-refresh. Sessions persist across app restarts on mobile.                                                                                                               |
| AUTH-7  | Profile completion flow after first login | P0       | Web + Mobile | After initial registration, guide users through role-specific onboarding: Clients complete name and preferences; Business Owners complete business profile setup.                                                                 |
| AUTH-8  | Account type selection during signup      | P0       | Web + Mobile | During registration, users choose whether they are signing up as a Client or a Business Owner. This determines their role and post-signup flow.                                                                                   |
| AUTH-9  | Guest browsing (no account required)      | P0       | Web + Mobile | Unauthenticated users can search for businesses, view search results, browse business profiles (services, workers, reviews, hours) without signing up. No login wall for discovery.                                               |
| AUTH-10 | Auth gate on booking action               | P0       | Web + Mobile | When a guest taps "Book Now" or starts a booking flow, the app redirects to sign-up/login. After successful authentication, the user is returned to the exact point in the booking flow they left off (deep-link return).         |
| AUTH-11 | Phone number required at registration     | P0       | Web + Mobile | Phone number is a mandatory field during account creation for all roles (Client and Business Owner). Stored in the user profile for booking contact purposes.                                                                     |

### 3.2 Client Features

| ID    | Requirement                                                    | Priority | Details                                                                                                                                                                                                                                                                           |
| ----- | -------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CL-1  | Search businesses by name, service type, category, or location | P0       | Full-text search with filters. Results sorted by relevance, distance, or rating. Supports search-as-you-type with debounced queries.                                                                                                                                              |
| CL-2  | Browse business profiles                                       | P0       | Business profile page includes: cover photo, logo, name, description, category, address, phone, hours of operation, list of services with prices and durations, list of workers, and aggregated reviews.                                                                          |
| CL-3  | View worker profiles within a business                         | P0       | Each worker has a mini-profile showing name, photo, bio, specialties, and the services they can perform. Visible on the business profile page.                                                                                                                                    |
| CL-4  | Select a service, pick a worker, choose time slot              | P0       | Multi-step booking flow: (1) Select a service, (2) Pick a specific worker or choose "Any Available Worker", (3) View calendar with available time slots generated from worker availability minus existing bookings, (4) Select a date and time slot.                              |
| CL-5  | Confirm booking with optional note                             | P0       | Review screen shows service name, worker, date, time, duration, and price. Client can add an optional note (e.g., "Running 5 minutes late"). Confirm button finalizes the booking.                                                                                                |
| CL-6  | View upcoming and past bookings                                | P0       | "My Bookings" section with tabs: Upcoming (sorted by date ascending), Past (sorted by date descending), and Cancelled. Each entry shows business name, service, worker, date, time, and status.                                                                                   |
| CL-7  | Cancel or reschedule bookings                                  | P1       | Clients can cancel or reschedule subject to the business's cancellation policy (e.g., free cancellation up to 24 hours before). If within the restricted window, cancellation may be blocked or flagged. Rescheduling shows available time slots for the same service and worker. |
| CL-8  | Receive push/email notifications for booking events            | P1       | Notifications sent for: booking confirmation, booking reminder (24 hours and 2 hours before), cancellation by business, and rescheduling confirmation.                                                                                                                            |
| CL-9  | Rate and review a business after a completed appointment       | P1       | After an appointment status changes to "completed," the client can leave a 1-5 star rating with an optional text review. One review per completed booking.                                                                                                                        |
| CL-10 | Save favorite businesses                                       | P1       | Heart/bookmark icon on business profiles and search results. Favorites are accessible from a dedicated "Favorites" section in the client's profile.                                                                                                                               |
| CL-11 | Edit personal profile                                          | P1       | Client can update: full name, profile photo (uploaded to Supabase Storage), phone number, and notification preferences.                                                                                                                                                           |

### 3.3 Business Owner Features

| ID    | Requirement                                      | Priority | Details                                                                                                                                                                                                                                                                                                     |
| ----- | ------------------------------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BO-1  | Create/edit business profile                     | P0       | Fields: business name, description, category (from predefined list), street address, city, state, zip code, country, phone, email, website URL, cover image, logo image, hours of operation. Slug auto-generated from name for public URL.                                                                  |
| BO-2  | Add/edit/remove services                         | P0       | Each service has: name, description, price (decimal), duration in minutes, active/inactive toggle, and assigned workers (which workers can perform this service). Services displayed on the public business profile.                                                                                        |
| BO-3  | Add/manage workers                               | P0       | Invite workers by email address. Invited workers receive an email with a link to create an account (or link an existing account) as a Worker role. Business owner can view all workers, toggle active/inactive, and remove workers.                                                                         |
| BO-4  | Add self as the single worker (solo operator)    | P0       | If the business owner operates alone, they add themselves as a worker. This creates a worker record linked to their user account. All services are assigned to this single worker.                                                                                                                          |
| BO-5  | Set business-level settings                      | P0       | Configurable settings: cancellation policy (free cancellation window in hours, e.g., 24h), auto-confirm bookings (boolean -- if true, bookings are immediately confirmed; if false, they enter "pending" until approved), buffer time between appointments (in minutes, e.g., 15 minutes between bookings). |
| BO-6  | View full business calendar                      | P0       | Unified calendar view showing all workers' bookings. Supports day, week, and month views. Color-coded by worker or status. Clicking a booking opens its details.                                                                                                                                            |
| BO-7  | Manage bookings                                  | P0       | Business owner can: approve pending bookings (if auto-confirm is off), mark bookings as completed, cancel bookings (with a required reason sent to the client), and mark bookings as no-show.                                                                                                               |
| BO-8  | View analytics dashboard                         | P1       | Dashboard metrics: total bookings (this week, month, all-time), estimated revenue, average rating, number of reviews, peak booking hours/days, and per-worker booking counts. Data visualized with charts.                                                                                                  |
| BO-9  | Receive notifications for new/cancelled bookings | P0       | Push and email notifications when: a new booking is created, a client cancels, or a new review is posted.                                                                                                                                                                                                   |
| BO-10 | Respond to client reviews                        | P1       | Business owner can write a single public response to each client review. Responses are displayed below the review on the business profile.                                                                                                                                                                  |

### 3.4 Worker Features

| ID   | Requirement                                    | Priority | Details                                                                                                                                                                                                              |
| ---- | ---------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| WK-1 | View personal schedule/calendar                | P0       | Workers see their own calendar with all assigned bookings. Supports day and week views. Each booking shows client name, service, time, and status.                                                                   |
| WK-2 | Set own weekly availability                    | P0       | Workers define their recurring weekly schedule per day of the week (e.g., Monday: 9:00 AM - 5:00 PM, Tuesday: 10:00 AM - 6:00 PM, Sunday: closed). This availability is used to generate bookable time slots.        |
| WK-3 | Block specific dates/times                     | P0       | Workers can block full days or specific time ranges for time off, holidays, or personal reasons. Blocked times are excluded from available time slots. An optional reason field is available for internal reference. |
| WK-4 | View assigned bookings with client details     | P0       | Each booking displays: client name, service booked, date, start time, end time, booking status, and any client-provided notes.                                                                                       |
| WK-5 | Update booking status                          | P1       | Workers can mark bookings as "completed" after the appointment or "no-show" if the client did not arrive. Other status transitions (cancel, approve) are reserved for the business owner.                            |
| WK-6 | Receive notifications for new/changed bookings | P1       | Push and email notifications when: a new booking is assigned to the worker, a booking is cancelled, or a booking is rescheduled.                                                                                     |
| WK-7 | Edit personal profile                          | P1       | Workers can update: display name, profile photo, bio/description, and specialties (displayed as tags on the business profile).                                                                                       |

### 3.5 Booking Logic

| ID   | Requirement                                                           | Priority | Details                                                                                                                                                                                                                                                                                                                                                   |
| ---- | --------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BK-1 | Time slots auto-generated from worker availability + service duration | P0       | Available time slots are computed by: (1) taking the worker's weekly availability for the selected date, (2) subtracting existing confirmed bookings, (3) subtracting blocked dates/times, (4) dividing remaining windows into slots based on the selected service's duration plus the business's configured buffer time.                                 |
| BK-2 | Prevent double bookings                                               | P0       | A database-level unique constraint (or exclusion constraint) ensures no two confirmed bookings overlap for the same worker on the same date/time range. Application-level checks are performed before insert. Optimistic locking or row-level locks used for concurrent booking attempts.                                                                 |
| BK-3 | Booking lifecycle                                                     | P0       | Statuses: `pending` (awaiting business approval), `confirmed` (approved or auto-confirmed), `completed` (service rendered), `cancelled` (cancelled by client or business), `no_show` (client did not attend). Transitions: pending -> confirmed -> completed; pending -> cancelled; confirmed -> cancelled; confirmed -> completed; confirmed -> no_show. |
| BK-4 | Auto-confirm or manual confirm per business setting                   | P0       | If the business has `auto_confirm = true`, new bookings are immediately set to "confirmed." If `auto_confirm = false`, bookings start as "pending" and the business owner must approve them.                                                                                                                                                              |
| BK-5 | Cancellation respects business-defined policy                         | P1       | Each business defines a `cancellation_hours` value (e.g., 24). Clients can freely cancel up to that many hours before the appointment. Cancellations within the restricted window display the policy and may be blocked or require acknowledgment.                                                                                                        |
| BK-6 | Configurable buffer time between appointments                         | P1       | Business owners set `buffer_minutes` (e.g., 15). This buffer is added after each booking when computing available time slots, ensuring workers have transition time between appointments.                                                                                                                                                                 |
| BK-7 | "Any available worker" option                                         | P1       | When a client selects "Any Available Worker" instead of a specific worker, the system finds all workers who can perform the selected service and have availability at the chosen time. The system auto-assigns the first available worker (or the worker with the fewest bookings that day for load balancing).                                           |
| BK-8 | Bookings tied to specific worker + service + time slot                | P0       | Every booking record references a specific `worker_id`, `service_id`, `date`, `start_time`, and `end_time`. Even when the client selects "any available worker," the system resolves and stores the specific worker.                                                                                                                                      |

### 3.6 Notifications

| ID   | Requirement                 | Priority | Details                                                                                                                                                                                                                    |
| ---- | --------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NT-1 | Push notifications (mobile) | P1       | Delivered via Expo Push Notification Service (which routes to FCM for Android and APNs for iOS). Used for: new booking confirmations, booking reminders, cancellations, and new reviews.                                   |
| NT-2 | Email notifications         | P0       | Transactional emails sent via Resend for: booking confirmation (to client and business), booking reminders (24h and 2h before appointment), cancellation notices, and password reset. Emails use branded HTML templates.   |
| NT-3 | In-app notification center  | P1       | A notification bell icon in the app header shows unread count. Tapping opens a list of all notifications (new bookings, reminders, cancellations, reviews) sorted by most recent. Each notification can be marked as read. |
| NT-4 | Notification preferences    | P2       | Users can opt in or out of specific notification types (e.g., enable push for bookings but disable email for reminders). Preferences stored per user in the database.                                                      |

### 3.7 Reviews & Ratings

| ID   | Requirement                                      | Priority | Details                                                                                                                                                                                                                                                |
| ---- | ------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| RV-1 | Client star rating with optional text review     | P1       | After a booking is marked as "completed," the client can submit a rating (1 to 5 stars, required) and an optional text comment (max 2,000 characters).                                                                                                 |
| RV-2 | Reviews tied to completed bookings only          | P1       | A review can only be created if the associated booking has a status of "completed." Each booking allows at most one review. Attempting to review a pending, cancelled, or no-show booking is rejected.                                                 |
| RV-3 | Business average rating calculated and displayed | P1       | The `businesses` table stores `rating_avg` (decimal, 1-5) and `rating_count` (integer). These are updated (recalculated) whenever a new review is submitted. The average rating and count are displayed on the business profile and in search results. |
| RV-4 | Admin can moderate/remove inappropriate reviews  | P2       | Admins can flag reviews as inappropriate and remove them from public display. A `is_flagged` boolean on the reviews table supports this. Flagged reviews are hidden from the public profile but retained in the database for audit.                    |

### 3.8 Admin Panel (Web)

| ID   | Requirement                        | Priority | Details                                                                                                                                                                                |
| ---- | ---------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AD-1 | Dashboard with platform-wide stats | Post-MVP | Admin dashboard displays: total registered users (by role), total businesses, total bookings (by status), total reviews, and new signups over time.                                    |
| AD-2 | User management                    | Post-MVP | Admins can search for users by name or email, view user details, suspend accounts (preventing login), and permanently delete accounts (with cascading data cleanup).                   |
| AD-3 | Review moderation queue            | Post-MVP | A list of reviews sorted by most recent, with the ability to flag, hide, or delete reviews that violate platform guidelines. Business owners can also report reviews for admin review. |
| AD-4 | Manage service categories          | Post-MVP | Admins can add, edit, reorder, and deactivate service categories. Each category has a name, slug, icon URL, and sort order.                                                            |
| AD-5 | System settings                    | Post-MVP | Configure platform-wide defaults: default cancellation window, notification email templates, feature flags (e.g., enable/disable reviews), and maintenance mode.                       |

### 3.9 Payments (Future Phase)

| ID   | Requirement                            | Priority | Details                                                                                                                                                                                  |
| ---- | -------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PY-1 | Stripe integration for online payments | Post-MVP | Integrate Stripe Connect to allow clients to pay for appointments online. Businesses onboard to Stripe via OAuth. Payments processed at booking time or upon completion.                 |
| PY-2 | Business payout management             | Post-MVP | Businesses view their payout history and pending balances. Stripe handles payouts to the business's connected bank account on a configurable schedule.                                   |
| PY-3 | Booking deposit or prepayment options  | Post-MVP | Businesses can configure whether to charge a deposit (percentage or fixed amount) at booking time, full prepayment, or pay-at-location (no online charge).                               |
| PY-4 | Refund handling on cancellations       | Post-MVP | When a booking is cancelled within the allowed window, any collected payment is automatically refunded via Stripe. Cancellations outside the window follow the business's refund policy. |

---

## 4. User Interface & Experience

### 4.1 Mobile App (React Native + Expo)

The mobile app targets both iOS and Android via React Native and Expo. Authentication on mobile uses email/password only for MVP (Google and Apple OAuth deferred). **The app opens directly to the Home/Discovery screen without requiring login.** Users can search and browse businesses freely. Authentication is only required when attempting to book, save favorites, or access account-specific features.

| Screen                        | Description                                        | Key Elements                                                                                                                                        |
| ----------------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home / Discovery              | Main landing screen (no auth required)             | Search bar, horizontal category chips, featured/nearby businesses carousel, recent searches. Accessible to all users including guests.              |
| Sign Up                       | Account creation (triggered by booking or profile) | Email, password, confirm password, phone (required), account type toggle (Client / Business Owner), terms checkbox                                  |
| Login                         | Existing user authentication                       | Email, password, "Forgot Password" link                                                                                                             |
| Search Results                | Filtered list of businesses matching query         | Business cards (photo, name, category, rating, distance), filter/sort controls, optional map toggle                                                 |
| Business Profile              | Full business detail page                          | Cover photo, logo, name, description, hours, address with map, services list (name, price, duration), workers list, reviews section, "Book Now" CTA |
| Worker Profile                | Worker detail within a business                    | Photo, name, bio, specialties tags, services they perform, "Book with [Name]" CTA                                                                   |
| Booking Flow - Select Service | Step 1 of booking                                  | List of services with name, price, duration; tap to select                                                                                          |
| Booking Flow - Select Worker  | Step 2 of booking                                  | List of available workers with photo and name; "Any Available" option at top                                                                        |
| Booking Flow - Pick Date/Time | Step 3 of booking                                  | Calendar date picker, time slot grid for selected date, slots grayed out if unavailable                                                             |
| Booking Flow - Confirm        | Step 4 of booking                                  | Summary card (service, worker, date, time, price), optional note text field, "Confirm Booking" button                                               |
| Booking Confirmation          | Success screen after booking                       | Confirmation checkmark, booking details, "View My Bookings" and "Back to Home" buttons                                                              |
| My Bookings                   | Client booking management                          | Tabs: Upcoming, Past, Cancelled; each entry shows business, service, worker, date, time, status; tap to view details or cancel/reschedule           |
| Notifications                 | Notification center                                | List of notifications with icon, title, body, timestamp, read/unread indicator                                                                      |
| Favorites                     | Saved businesses                                   | Grid or list of favorited businesses with quick-book access                                                                                         |
| Profile / Settings            | User account management                            | Avatar, name, email (read-only), phone, notification preferences, "Log Out" button, "Delete Account"                                                |
| Business Owner Dashboard      | Business management hub (if role = business_owner) | Today's bookings count, upcoming bookings list, quick links to calendar, services, workers, analytics                                               |
| Worker Dashboard              | Worker schedule hub (if role = worker)             | Today's schedule, upcoming bookings, availability settings link                                                                                     |

### 4.2 Web App (Next.js)

The web app uses Next.js with the App Router. It serves both the public-facing pages (search, business profiles) and authenticated dashboards. Web auth supports email/password and Google OAuth. **The landing page is the discovery experience itself** -- visitors see a search bar, categories, and featured businesses immediately. No login is required to browse. Authentication is triggered only when a user attempts to book an appointment.

| Page                        | Description                                           | Key Elements                                                                                                                                                               |
| --------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Landing / Home              | Public homepage = search/discovery (no auth required) | Hero search bar, category grid, featured businesses. This IS the landing page -- search and browse without logging in.                                                     |
| Search Results              | Business search results (no auth required)            | Left sidebar filters (category, rating, distance), main area with business cards, map view toggle, pagination                                                              |
| Business Profile Page       | Public-facing business detail (no auth required)      | Cover image, logo, name, description, tabbed sections (Services, Workers, Reviews, Hours/Location), "Book Now" button. Clicking "Book Now" triggers auth if not logged in. |
| Login / Register            | Authentication pages (shown on demand)                | Tab toggle between Login and Register, email/password form, phone (required), Google OAuth button, account type selection on register                                      |
| Client Dashboard            | Logged-in client hub                                  | Upcoming bookings, past bookings, favorites, profile settings links                                                                                                        |
| Business Owner Dashboard    | Main business management page                         | Key metrics cards (bookings today, this week, rating, pending approvals), recent bookings list, quick action buttons                                                       |
| Business Profile Management | Edit business public profile                          | Form fields for all business profile data (name, description, address, photos, hours), live preview                                                                        |
| Service Management          | CRUD for services                                     | Table/list of services with inline editing, "Add Service" button, drag to reorder, assign workers per service                                                              |
| Worker Management           | Manage business staff                                 | List of workers with status, "Invite Worker" button (email input), view individual worker schedules, toggle active/inactive                                                |
| Availability Settings       | Per-worker schedule configuration                     | Weekly grid (days x hours), toggle available/unavailable per slot, blocked dates calendar with add/remove                                                                  |
| Booking Management          | View and manage all bookings                          | Table with filters (date range, status, worker), bulk actions, click to view details, approve/cancel/complete buttons                                                      |
| Reviews                     | View and respond to reviews                           | List of reviews with rating, text, date, client name; "Respond" button per review; average rating summary                                                                  |
| Analytics                   | Business performance metrics                          | Charts: bookings over time, revenue over time, bookings by day of week, bookings by worker, top services, rating trend                                                     |
| Admin Panel                 | Admin-only platform management                        | Sidebar navigation: Dashboard, Users, Businesses, Reviews, Categories, Settings; data tables with search and actions                                                       |
| Profile Settings            | User account settings                                 | Edit name, email, phone, avatar; change password; notification preferences; delete account                                                                                 |

---

## 5. Non-Functional Requirements

| Category        | Requirement              | Target                           | Details                                                                                                                                                                                   |
| --------------- | ------------------------ | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Performance     | API response time        | < 500ms at p95                   | All API endpoints (Supabase queries, Edge Functions) must respond within 500ms for the 95th percentile under normal load.                                                                 |
| Performance     | Page load time (web)     | < 3s on 3G                       | Initial page load (LCP) should be under 3 seconds on a simulated 3G connection. Leverage Next.js SSR/SSG and image optimization.                                                          |
| Performance     | App launch time (mobile) | < 2s                             | Time from app icon tap to interactive home screen should be under 2 seconds on mid-range devices.                                                                                         |
| Scalability     | Concurrent users         | 10,000+                          | The platform must support at least 10,000 concurrent users without degradation. Supabase connection pooling and CDN caching support this target.                                          |
| Scalability     | Database                 | 100,000+ bookings                | The data model and indexes must efficiently handle at least 100,000 bookings without query performance degradation.                                                                       |
| Security        | Transport                | HTTPS everywhere                 | All communication between clients and servers must use HTTPS/TLS. No HTTP fallback.                                                                                                       |
| Security        | Data access              | Row Level Security (RLS)         | Supabase RLS policies enforced on every table. Users can only read/write data they are authorized to access based on their role.                                                          |
| Security        | Input validation         | Server-side validation           | All user inputs validated on the server (Edge Functions or database constraints). Client-side validation for UX only.                                                                     |
| Security        | Authentication           | Secure token handling            | JWT tokens stored securely (httpOnly cookies on web, secure storage on mobile). Tokens refreshed automatically.                                                                           |
| Accessibility   | Web                      | WCAG 2.1 AA                      | Web app must meet WCAG 2.1 Level AA standards: proper heading hierarchy, alt text for images, keyboard navigation, sufficient color contrast, ARIA labels where needed.                   |
| Accessibility   | Mobile                   | Accessible components            | React Native components must support screen readers (VoiceOver on iOS, TalkBack on Android). Minimum touch target size of 44x44 points.                                                   |
| Offline Support | Mobile caching           | Recent bookings cached           | Mobile app caches the user's recent and upcoming bookings for offline viewing. Search and booking creation require connectivity.                                                          |
| Localization    | Language                 | English default, i18n-ready      | The app launches in English. All user-facing strings must be extracted into locale files using an i18n library (e.g., `react-i18next` / `next-intl`) to support future Spanish expansion. |
| Testing         | Unit tests               | Jest or Vitest                   | All utility functions, hooks, and business logic must have unit test coverage. Target: 80%+ coverage on business logic modules.                                                           |
| Testing         | Integration tests        | API and component tests          | Test key user flows at the API level and component interaction level.                                                                                                                     |
| Testing         | End-to-end tests         | Playwright (web), Detox (mobile) | E2E tests for critical paths: sign up, search, book appointment, cancel appointment, business onboarding.                                                                                 |
| Reliability     | Uptime                   | 99.5%                            | Target 99.5% uptime, leveraging Supabase managed infrastructure and Vercel's global edge network.                                                                                         |

---

## 6. Data Model Overview

The following tables define the core data model for BookEasely. All tables use UUID primary keys and include timestamp columns. Foreign key relationships and indexes are specified where relevant.

### 6.1 `users`

Managed in conjunction with Supabase Auth. The `id` field corresponds to the Supabase Auth user ID.

| Column     | Type         | Constraints                     | Description                                           |
| ---------- | ------------ | ------------------------------- | ----------------------------------------------------- |
| id         | UUID         | PK, default `gen_random_uuid()` | Primary key, matches Supabase Auth `auth.users.id`    |
| email      | VARCHAR(255) | UNIQUE, NOT NULL                | User's email address                                  |
| role       | VARCHAR(20)  | NOT NULL, default `'client'`    | One of: `client`, `business_owner`, `worker`, `admin` |
| full_name  | VARCHAR(255) | NOT NULL                        | User's full display name                              |
| avatar_url | TEXT         | NULLABLE                        | URL to profile photo in Supabase Storage              |
| phone      | VARCHAR(20)  | NOT NULL                        | Phone number (required at registration)               |
| created_at | TIMESTAMPTZ  | NOT NULL, default `now()`       | Account creation timestamp                            |
| updated_at | TIMESTAMPTZ  | NOT NULL, default `now()`       | Last profile update timestamp                         |

### 6.2 `businesses`

Each business is owned by one user (the business owner).

| Column              | Type          | Constraints                     | Description                                                |
| ------------------- | ------------- | ------------------------------- | ---------------------------------------------------------- |
| id                  | UUID          | PK, default `gen_random_uuid()` | Primary key                                                |
| owner_id            | UUID          | FK -> users(id), NOT NULL       | The business owner's user ID                               |
| name                | VARCHAR(255)  | NOT NULL                        | Business display name                                      |
| slug                | VARCHAR(255)  | UNIQUE, NOT NULL                | URL-friendly identifier (auto-generated from name)         |
| description         | TEXT          | NULLABLE                        | Public business description                                |
| category_id         | UUID          | FK -> categories(id), NULLABLE  | Primary service category                                   |
| address             | VARCHAR(500)  | NOT NULL                        | Street address                                             |
| city                | VARCHAR(100)  | NOT NULL                        | City                                                       |
| state               | VARCHAR(50)   | NOT NULL                        | State/province                                             |
| zip_code            | VARCHAR(10)   | NOT NULL                        | Postal code                                                |
| country             | VARCHAR(50)   | NOT NULL, default `'US'`        | Country code                                               |
| phone               | VARCHAR(20)   | NOT NULL                        | Business phone number                                      |
| email               | VARCHAR(255)  | NULLABLE                        | Business contact email                                     |
| website             | VARCHAR(500)  | NULLABLE                        | Business website URL                                       |
| latitude            | DECIMAL(10,8) | NULLABLE                        | Geographic latitude for location search                    |
| longitude           | DECIMAL(11,8) | NULLABLE                        | Geographic longitude for location search                   |
| cover_image_url     | TEXT          | NULLABLE                        | URL to cover/banner image                                  |
| logo_url            | TEXT          | NULLABLE                        | URL to business logo                                       |
| cancellation_policy | TEXT          | NULLABLE                        | Human-readable cancellation policy text                    |
| cancellation_hours  | INTEGER       | NOT NULL, default `24`          | Hours before appointment that free cancellation is allowed |
| auto_confirm        | BOOLEAN       | NOT NULL, default `true`        | Whether new bookings are auto-confirmed                    |
| buffer_minutes      | INTEGER       | NOT NULL, default `0`           | Buffer time in minutes between consecutive appointments    |
| rating_avg          | DECIMAL(3,2)  | NOT NULL, default `0`           | Average star rating (1.00 - 5.00)                          |
| rating_count        | INTEGER       | NOT NULL, default `0`           | Total number of reviews                                    |
| is_active           | BOOLEAN       | NOT NULL, default `true`        | Whether the business is publicly visible                   |
| created_at          | TIMESTAMPTZ   | NOT NULL, default `now()`       | Record creation timestamp                                  |
| updated_at          | TIMESTAMPTZ   | NOT NULL, default `now()`       | Last update timestamp                                      |

### 6.3 `business_hours`

Weekly operating hours for a business. One row per day of the week.

| Column      | Type     | Constraints                                      | Description                                                            |
| ----------- | -------- | ------------------------------------------------ | ---------------------------------------------------------------------- |
| id          | UUID     | PK, default `gen_random_uuid()`                  | Primary key                                                            |
| business_id | UUID     | FK -> businesses(id) ON DELETE CASCADE, NOT NULL | Parent business                                                        |
| day_of_week | SMALLINT | NOT NULL, CHECK (0-6)                            | Day of week: 0 = Sunday, 1 = Monday, ..., 6 = Saturday                 |
| open_time   | TIME     | NOT NULL                                         | Opening time for this day                                              |
| close_time  | TIME     | NOT NULL                                         | Closing time for this day                                              |
| is_closed   | BOOLEAN  | NOT NULL, default `false`                        | If true, the business is closed on this day (open/close times ignored) |

**Unique constraint:** `(business_id, day_of_week)` -- one entry per business per day.

### 6.4 `workers`

Staff members associated with a business. A worker is linked to a user account.

| Column       | Type         | Constraints                                      | Description                                               |
| ------------ | ------------ | ------------------------------------------------ | --------------------------------------------------------- |
| id           | UUID         | PK, default `gen_random_uuid()`                  | Primary key                                               |
| user_id      | UUID         | FK -> users(id), NOT NULL                        | The worker's user account                                 |
| business_id  | UUID         | FK -> businesses(id) ON DELETE CASCADE, NOT NULL | The business this worker belongs to                       |
| display_name | VARCHAR(255) | NOT NULL                                         | Name displayed on the business profile                    |
| bio          | TEXT         | NULLABLE                                         | Short biography or description                            |
| avatar_url   | TEXT         | NULLABLE                                         | URL to worker's profile photo                             |
| specialties  | TEXT[]       | NULLABLE                                         | Array of specialty tags (e.g., `{"Fades", "Beard Trim"}`) |
| is_active    | BOOLEAN      | NOT NULL, default `true`                         | Whether the worker is currently active and bookable       |
| created_at   | TIMESTAMPTZ  | NOT NULL, default `now()`                        | Record creation timestamp                                 |

**Unique constraint:** `(user_id, business_id)` -- a user can only be a worker once per business.

### 6.5 `worker_availability`

Recurring weekly availability for each worker. Defines the time windows when a worker is bookable.

| Column      | Type     | Constraints                                   | Description                                        |
| ----------- | -------- | --------------------------------------------- | -------------------------------------------------- |
| id          | UUID     | PK, default `gen_random_uuid()`               | Primary key                                        |
| worker_id   | UUID     | FK -> workers(id) ON DELETE CASCADE, NOT NULL | The worker                                         |
| day_of_week | SMALLINT | NOT NULL, CHECK (0-6)                         | Day of week: 0 = Sunday, ..., 6 = Saturday         |
| start_time  | TIME     | NOT NULL                                      | Availability window start                          |
| end_time    | TIME     | NOT NULL                                      | Availability window end                            |
| is_active   | BOOLEAN  | NOT NULL, default `true`                      | Whether this availability slot is currently active |

**Note:** A worker can have multiple availability entries per day (e.g., split shifts: 9:00-12:00 and 14:00-18:00).

### 6.6 `worker_blocked_dates`

One-off blocked periods for a worker (time off, holidays, etc.).

| Column     | Type | Constraints                                   | Description                                                                            |
| ---------- | ---- | --------------------------------------------- | -------------------------------------------------------------------------------------- |
| id         | UUID | PK, default `gen_random_uuid()`               | Primary key                                                                            |
| worker_id  | UUID | FK -> workers(id) ON DELETE CASCADE, NOT NULL | The worker                                                                             |
| date       | DATE | NOT NULL                                      | The blocked date                                                                       |
| start_time | TIME | NULLABLE                                      | Start time of blocked period. If NULL, the entire day is blocked.                      |
| end_time   | TIME | NULLABLE                                      | End time of blocked period. If NULL (with NULL start_time), the entire day is blocked. |
| reason     | TEXT | NULLABLE                                      | Internal reason for the block (not shown to clients)                                   |

### 6.7 `services`

Services offered by a business.

| Column           | Type          | Constraints                                      | Description                              |
| ---------------- | ------------- | ------------------------------------------------ | ---------------------------------------- |
| id               | UUID          | PK, default `gen_random_uuid()`                  | Primary key                              |
| business_id      | UUID          | FK -> businesses(id) ON DELETE CASCADE, NOT NULL | Parent business                          |
| name             | VARCHAR(255)  | NOT NULL                                         | Service name (e.g., "Men's Haircut")     |
| description      | TEXT          | NULLABLE                                         | Detailed description of the service      |
| price            | DECIMAL(10,2) | NOT NULL                                         | Price in USD                             |
| duration_minutes | INTEGER       | NOT NULL                                         | Duration of the service in minutes       |
| is_active        | BOOLEAN       | NOT NULL, default `true`                         | Whether the service is currently offered |
| created_at       | TIMESTAMPTZ   | NOT NULL, default `now()`                        | Record creation timestamp                |

### 6.8 `service_workers`

Many-to-many relationship: which workers can perform which services.

| Column     | Type | Constraints                                    | Description                             |
| ---------- | ---- | ---------------------------------------------- | --------------------------------------- |
| id         | UUID | PK, default `gen_random_uuid()`                | Primary key                             |
| service_id | UUID | FK -> services(id) ON DELETE CASCADE, NOT NULL | The service                             |
| worker_id  | UUID | FK -> workers(id) ON DELETE CASCADE, NOT NULL  | The worker who can perform this service |

**Unique constraint:** `(service_id, worker_id)` -- prevents duplicate assignments.

### 6.9 `bookings`

The core booking/appointment record.

| Column              | Type        | Constraints                     | Description                                                         |
| ------------------- | ----------- | ------------------------------- | ------------------------------------------------------------------- |
| id                  | UUID        | PK, default `gen_random_uuid()` | Primary key                                                         |
| client_id           | UUID        | FK -> users(id), NOT NULL       | The client who made the booking                                     |
| business_id         | UUID        | FK -> businesses(id), NOT NULL  | The business being booked                                           |
| worker_id           | UUID        | FK -> workers(id), NOT NULL     | The specific worker assigned                                        |
| service_id          | UUID        | FK -> services(id), NOT NULL    | The service being booked                                            |
| date                | DATE        | NOT NULL                        | Appointment date                                                    |
| start_time          | TIME        | NOT NULL                        | Appointment start time                                              |
| end_time            | TIME        | NOT NULL                        | Appointment end time (start_time + service duration)                |
| status              | VARCHAR(20) | NOT NULL, default `'pending'`   | One of: `pending`, `confirmed`, `completed`, `cancelled`, `no_show` |
| note                | TEXT        | NULLABLE                        | Client-provided note at booking time                                |
| cancelled_by        | UUID        | FK -> users(id), NULLABLE       | User ID of who cancelled (if status = cancelled)                    |
| cancellation_reason | TEXT        | NULLABLE                        | Reason for cancellation                                             |
| created_at          | TIMESTAMPTZ | NOT NULL, default `now()`       | Booking creation timestamp                                          |
| updated_at          | TIMESTAMPTZ | NOT NULL, default `now()`       | Last update timestamp                                               |

**Index:** `(worker_id, date, start_time)` for fast availability checks.  
**Exclusion constraint (recommended):** Prevent overlapping bookings for the same worker on the same date where status is not `cancelled` or `no_show`.

### 6.10 `reviews`

Client reviews for completed bookings.

| Column            | Type        | Constraints                          | Description                                                       |
| ----------------- | ----------- | ------------------------------------ | ----------------------------------------------------------------- |
| id                | UUID        | PK, default `gen_random_uuid()`      | Primary key                                                       |
| booking_id        | UUID        | FK -> bookings(id), UNIQUE, NOT NULL | The completed booking this review is for (one review per booking) |
| client_id         | UUID        | FK -> users(id), NOT NULL            | The client who wrote the review                                   |
| business_id       | UUID        | FK -> businesses(id), NOT NULL       | The business being reviewed                                       |
| rating            | SMALLINT    | NOT NULL, CHECK (1-5)                | Star rating: 1 (worst) to 5 (best)                                |
| comment           | TEXT        | NULLABLE                             | Optional text review (max 2,000 characters enforced at app level) |
| business_response | TEXT        | NULLABLE                             | Business owner's public response to the review                    |
| is_flagged        | BOOLEAN     | NOT NULL, default `false`            | Whether the review has been flagged by admin for moderation       |
| created_at        | TIMESTAMPTZ | NOT NULL, default `now()`            | Review creation timestamp                                         |
| updated_at        | TIMESTAMPTZ | NOT NULL, default `now()`            | Last update timestamp                                             |

### 6.11 `categories`

Predefined service categories managed by admins.

| Column     | Type         | Constraints                     | Description                                   |
| ---------- | ------------ | ------------------------------- | --------------------------------------------- |
| id         | UUID         | PK, default `gen_random_uuid()` | Primary key                                   |
| name       | VARCHAR(100) | UNIQUE, NOT NULL                | Category display name (e.g., "Barbershops")   |
| slug       | VARCHAR(100) | UNIQUE, NOT NULL                | URL-friendly identifier (e.g., "barbershops") |
| icon_url   | TEXT         | NULLABLE                        | URL to category icon image                    |
| sort_order | INTEGER      | NOT NULL, default `0`           | Display order (ascending)                     |

### 6.12 `notifications`

In-app notifications for all user types.

| Column     | Type         | Constraints                                 | Description                                                                                          |
| ---------- | ------------ | ------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| id         | UUID         | PK, default `gen_random_uuid()`             | Primary key                                                                                          |
| user_id    | UUID         | FK -> users(id) ON DELETE CASCADE, NOT NULL | Recipient user                                                                                       |
| type       | VARCHAR(50)  | NOT NULL                                    | Notification type (e.g., `booking_confirmed`, `booking_reminder`, `booking_cancelled`, `new_review`) |
| title      | VARCHAR(255) | NOT NULL                                    | Notification title                                                                                   |
| body       | TEXT         | NOT NULL                                    | Notification body text                                                                               |
| is_read    | BOOLEAN      | NOT NULL, default `false`                   | Whether the user has read this notification                                                          |
| data       | JSONB        | NULLABLE                                    | Additional structured data (e.g., `{"booking_id": "...", "business_id": "..."}`) for deep linking    |
| created_at | TIMESTAMPTZ  | NOT NULL, default `now()`                   | Notification creation timestamp                                                                      |

### 6.13 `favorites`

Client-saved favorite businesses.

| Column      | Type        | Constraints                                      | Description                 |
| ----------- | ----------- | ------------------------------------------------ | --------------------------- |
| id          | UUID        | PK, default `gen_random_uuid()`                  | Primary key                 |
| client_id   | UUID        | FK -> users(id) ON DELETE CASCADE, NOT NULL      | The client                  |
| business_id | UUID        | FK -> businesses(id) ON DELETE CASCADE, NOT NULL | The favorited business      |
| created_at  | TIMESTAMPTZ | NOT NULL, default `now()`                        | When the favorite was saved |

**Unique constraint:** `(client_id, business_id)` -- a client can favorite a business only once.

---

## 7. Third-Party Integrations

| Service                            | Purpose                       | Details                                                                                                                                                                                             |
| ---------------------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Supabase Auth**                  | Authentication                | Email/password, Google OAuth (web), JWT session management, password reset flows                                                                                                                    |
| **Supabase Database (PostgreSQL)** | Primary data store            | All application data, RLS policies for security, database functions for complex queries                                                                                                             |
| **Supabase Storage**               | File storage                  | Profile photos, business images (logos, covers), uploaded via signed URLs                                                                                                                           |
| **Supabase Realtime**              | Live updates                  | Real-time subscriptions for booking status changes, new notifications, calendar updates                                                                                                             |
| **Supabase Edge Functions**        | Serverless backend            | Business logic that cannot run client-side: time slot computation, booking validation, notification dispatch, review aggregation                                                                    |
| **Expo Push Notifications**        | Mobile push delivery          | Routes to FCM (Android) and APNs (iOS). Push tokens registered at app launch and stored per user.                                                                                                   |
| **Resend**                         | Transactional emails          | Booking confirmations, reminders, cancellation notices, password resets. Branded HTML email templates.                                                                                              |
| **Stripe**                         | Online payments (future)      | Stripe Connect for marketplace payments. Clients pay, platform takes a fee, businesses receive payouts. Deferred to post-MVP.                                                                       |
| **PostGIS**                        | Geolocation search (optional) | PostgreSQL extension for geographic queries (e.g., "businesses within 10 miles"). Can be enabled in Supabase. Deferred to post-MVP if needed; basic lat/lng distance queries may suffice initially. |

---

## 8. Deployment & Infrastructure

| Component      | Platform                                 | Details                                                                                                                                                                               |
| -------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mobile App** | Expo EAS Build -> App Store + Play Store | Expo Application Services (EAS) for building production binaries. Over-the-air updates via EAS Update for minor patches. App Store and Play Store submissions managed via EAS Submit. |
| **Web App**    | Vercel                                   | Next.js deployed on Vercel with automatic preview deployments per PR. Production deployment on merge to main branch. Vercel Edge Network for global CDN and edge rendering.           |
| **Backend**    | Supabase (managed)                       | Fully managed PostgreSQL database, Auth, Storage, Realtime, and Edge Functions. Supabase dashboard for database management and monitoring.                                            |
| **CI/CD**      | GitHub Actions                           | Automated pipelines: lint, type-check, unit tests, and build on every PR. E2E tests on merge to main. Automatic deployment triggers for Vercel (web) and EAS (mobile).                |
| **Monitoring** | Sentry + Supabase Dashboard              | Sentry for error tracking and performance monitoring on both web and mobile. Supabase Dashboard for database performance, API usage, and auth analytics.                              |
| **Domain**     | Custom domain via Vercel                 | Custom domain (e.g., `bookeasely.com`) configured in Vercel with automatic SSL. Supabase custom domain for API (optional).                                                            |

---

## 9. Milestones & Delivery Phases

### Phase 1 -- Foundation & Auth (MVP Step 1)

| Task                                  | Description                                                                                                               |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Database schema design and migrations | Create all core tables (users, businesses, services, workers, bookings, etc.) with constraints, indexes, and RLS policies |
| Supabase project setup                | Configure Auth providers (email/password, Google OAuth), Storage buckets, and initial Edge Functions                      |
| Email/password authentication         | Sign up, login, email verification, and password reset flows on both web and mobile                                       |
| Google OAuth (web only)               | Google Sign-In integration on the Next.js web app via Supabase Auth                                                       |
| Role selection during signup          | Account type picker (Client or Business Owner) shown during the registration flow                                         |
| Profile completion flows              | Post-signup onboarding: Clients fill in name and preferences; Business Owners begin business profile setup                |
| Basic navigation and layout           | App shell with role-based navigation (client nav, business owner nav, worker nav) on both web and mobile                  |

### Phase 2 -- Business Setup (MVP Step 2)

| Task                                     | Description                                                                                   |
| ---------------------------------------- | --------------------------------------------------------------------------------------------- |
| Business profile creation and management | Full CRUD for business profile: name, description, category, address, photos, hours, settings |
| Service management                       | Add, edit, remove services with name, description, price, duration, and worker assignments    |
| Worker management                        | Add self as worker (solo operator), invite workers by email, manage worker list               |
| Worker availability configuration        | Per-worker weekly schedule setup (day, start time, end time) with support for split shifts    |
| Worker blocked dates                     | Interface for workers and business owners to block specific dates or time ranges              |
| Business hours configuration             | Set open/close times per day of the week, mark days as closed                                 |

### Phase 3 -- Search & Discovery (MVP Step 3)

| Task                         | Description                                                                                             |
| ---------------------------- | ------------------------------------------------------------------------------------------------------- |
| Business listing and search  | Search bar with full-text search across business names, service names, and categories                   |
| Category browsing            | Category grid/list on home page; tap category to see filtered results                                   |
| Business profile public page | Public-facing detail page with all business information, services, workers, and reviews                 |
| Search filters and sorting   | Filter by category, sort by rating or relevance. Location-based filtering if coordinates are available. |
| Home / Discovery page        | Featured businesses, nearby businesses, popular categories, and search bar on the main landing screen   |

### Phase 4 -- Booking System (MVP Step 4)

| Task                               | Description                                                                                                                                |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Time slot generation               | Algorithm that computes available time slots from worker availability, blocked dates, existing bookings, service duration, and buffer time |
| Booking flow UI                    | Multi-step flow: select service -> select worker -> pick date/time -> review and confirm                                                   |
| Booking creation and validation    | Server-side booking creation with double-booking prevention (exclusion constraints, optimistic locking)                                    |
| Booking management (client side)   | "My Bookings" with upcoming, past, and cancelled tabs; cancel and reschedule actions                                                       |
| Booking management (business side) | Business calendar view, approve/reject pending bookings, mark complete, mark no-show                                                       |
| Booking status lifecycle           | State machine enforcement: pending -> confirmed -> completed / cancelled / no_show                                                         |
| "Any available worker" logic       | Auto-assignment of workers based on availability and load balancing                                                                        |

### Phase 5 -- Notifications & Reviews (MVP Step 5)

| Task                        | Description                                                                                          |
| --------------------------- | ---------------------------------------------------------------------------------------------------- |
| Email notifications         | Booking confirmation, 24-hour reminder, 2-hour reminder, cancellation notice via Resend              |
| Push notifications (mobile) | Expo Push for booking confirmations, reminders, and cancellations on iOS and Android                 |
| In-app notification center  | Notification bell with unread count, scrollable notification list, mark as read                      |
| Review and rating system    | Post-completion review flow: star rating + optional text, one review per booking, business responses |
| Rating aggregation          | Auto-update `rating_avg` and `rating_count` on the businesses table when reviews are created         |

### Phase 6 -- Polish & Launch (MVP Step 6)

| Task                                    | Description                                                                                                  |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Analytics dashboard for business owners | Charts and metrics: bookings over time, revenue, peak hours, per-worker performance, rating trends           |
| Favorites system                        | Save/unsave businesses, favorites list in client profile                                                     |
| Cancellation policy enforcement         | Respect business-defined cancellation windows; block or warn clients cancelling too late                     |
| UI/UX polish                            | Consistent design language, loading states, error states, empty states, micro-animations, responsive layouts |
| Performance optimization                | Image optimization, lazy loading, query optimization, caching strategies, bundle size reduction              |
| Testing and QA                          | Unit tests for business logic, integration tests for API, E2E tests for critical flows, manual QA pass       |

### Post-MVP

| Task                     | Description                                                                                        |
| ------------------------ | -------------------------------------------------------------------------------------------------- |
| Admin panel              | Web-only admin dashboard for platform management: users, businesses, reviews, categories, settings |
| Stripe payments          | Online payment collection, business payouts, deposits, and refund handling via Stripe Connect      |
| Apple Sign-In (mobile)   | Apple OAuth on iOS via Supabase Auth and Expo AuthSession                                          |
| Google OAuth (mobile)    | Google Sign-In on mobile via Supabase Auth and Expo AuthSession                                    |
| PostGIS location search  | Enable PostGIS extension for radius-based geographic queries ("businesses within X miles")         |
| Multi-language (Spanish) | Add Spanish locale files, language switcher in settings, translate all user-facing strings         |
| Marketing site           | Dedicated landing page for business acquisition with pricing, testimonials, and signup CTA         |

---

## 10. Acceptance Criteria

The following table defines the acceptance criteria for each major feature area. A feature is considered complete only when all its listed criteria are satisfied.

| Feature                           | Acceptance Criteria                                                                                                                                                                                                                                                                             |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Guest Browsing**                | Unauthenticated users can access the landing page, search for businesses, view search results, and open full business profiles (services, workers, reviews, hours) without logging in. No auth wall on any discovery page.                                                                      |
| **Auth Gate on Booking**          | When a guest taps "Book Now," they are redirected to sign-up/login. After successful authentication, they are returned to the business profile or booking step they were on. The return flow works on both web and mobile.                                                                      |
| **Email/Password Auth**           | User can register with email, password, and phone number (required). Email verification link is sent and works. User can log in with verified credentials. User sees an error for invalid credentials. Password must meet complexity requirements (8+ chars, uppercase, lowercase, number).     |
| **Google OAuth (Web)**            | User can click "Sign in with Google" on the web app. A new account is created if one does not exist. An existing account is linked if the email matches. Phone number is requested on first OAuth login if not provided by Google. User is redirected to the appropriate dashboard after login. |
| **Role Selection**                | During signup, user selects "Client" or "Business Owner." Selection determines the user's role in the database and the post-signup flow. Clients are directed to profile completion. Business owners are directed to business setup.                                                            |
| **Password Reset**                | User clicks "Forgot Password" and enters their email. A reset link is sent within 1 minute. Clicking the link allows setting a new password. The link expires after 24 hours. Old password no longer works after reset.                                                                         |
| **Business Profile Creation**     | Business owner completes all required fields (name, category, address, phone). A slug is auto-generated. The business appears in search results after creation. Profile is editable. Photos can be uploaded.                                                                                    |
| **Service Management**            | Business owner can add a service with name, price, and duration. Services appear on the public business profile. Services can be edited and deactivated. At least one worker must be assigned to a service for it to be bookable.                                                               |
| **Worker Management**             | Business owner can add themselves as a worker. Business owner can invite a worker by email. Invited worker receives an email and can accept. Worker appears in the business's worker list. Worker can be deactivated.                                                                           |
| **Worker Availability**           | Worker can set a recurring weekly schedule (day + start/end time). Multiple time windows per day are supported (split shifts). Availability is reflected in time slot generation.                                                                                                               |
| **Blocked Dates**                 | Worker can block a full day or specific time range. Blocked periods do not appear as available time slots. A reason can optionally be recorded.                                                                                                                                                 |
| **Business Search**               | Client can search by business name. Client can search by service name. Client can browse by category. Results display business name, category, rating, and photo. Results load within 500ms.                                                                                                    |
| **Business Profile (Public)**     | Public profile shows: name, description, category, address, hours, services with prices, workers, and reviews. "Book Now" button is prominently displayed. Profile loads without authentication.                                                                                                |
| **Booking Flow**                  | Client selects a service, then a worker (or "any available"), then a date, then a time slot. Only genuinely available slots are shown. Confirmation screen shows all details. Booking is created on confirm. Client receives a confirmation email.                                              |
| **Double-Booking Prevention**     | Two clients attempting to book the same worker at the same time: only one succeeds, the other receives a clear error message. No overlapping confirmed bookings exist for the same worker at the database level.                                                                                |
| **Booking Management (Client)**   | Client can view upcoming bookings sorted by date. Client can view past bookings. Client can cancel a booking (if within policy window). Cancelled booking status updates immediately.                                                                                                           |
| **Booking Management (Business)** | Business owner can view all bookings across workers. Pending bookings can be approved or rejected (if auto-confirm is off). Bookings can be marked as completed or no-show. Calendar view shows bookings by day/week.                                                                           |
| **Email Notifications**           | Booking confirmation email sent to client and business owner within 1 minute. Reminder emails sent at 24 hours and 2 hours before appointment. Cancellation email sent immediately on cancellation. Emails render correctly and contain accurate booking details.                               |
| **Push Notifications (Mobile)**   | Push token is registered on app launch. Push received for booking confirmation, reminder, and cancellation. Tapping a push notification deep-links to the relevant booking. Notifications work on both iOS and Android.                                                                         |
| **In-App Notifications**          | Notification bell shows unread count. Notification list displays all notifications in reverse chronological order. Tapping a notification marks it as read. Notifications are created for booking events and new reviews.                                                                       |
| **Reviews & Ratings**             | Client can leave a review (1-5 stars + optional text) for a completed booking. Only one review per booking is allowed. Business average rating updates after a new review. Business owner can respond to reviews. Reviews are displayed on the business profile.                                |
| **Favorites**                     | Client can save a business as a favorite. Favorite icon toggles state. Favorites list is accessible from the client's profile. Removing a favorite removes it from the list.                                                                                                                    |
| **Analytics Dashboard**           | Business owner sees total bookings for current week and month. Revenue estimate is displayed. Rating trend is shown. Per-worker booking count is available. Peak hours visualization is present.                                                                                                |
| **Cancellation Policy**           | Business owner can set cancellation window (in hours). Client attempting to cancel within the window sees the policy and is blocked or warned. Cancellations outside the window proceed freely.                                                                                                 |

---

_This document serves as the single source of truth for the BookEasely project. All implementation decisions should reference these requirements. Updated: February 2026._
