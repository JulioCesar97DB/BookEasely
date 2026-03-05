# Analytics Dashboard + Responsive Polish Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an analytics dashboard with 5 interactive charts for business owners, and polish responsive design across the web app.

**Architecture:** Server Component fetches all analytics data via parallel Supabase queries, passes serialized data as props to a dynamically-imported Client Component. Each chart is a separate component (SRP). Uses shadcn/ui chart (wraps recharts) for consistent theming with existing CSS variables (`--chart-1` through `--chart-5`).

**Tech Stack:** shadcn/ui chart component, recharts@2.15.4, Next.js 16 App Router, Tailwind CSS 4, framer-motion

---

## Task 1: Install shadcn chart component + recharts dependency

**Files:**
- Modify: `web/package.json` (recharts added automatically)
- Create: `web/src/components/ui/chart.tsx` (added by shadcn CLI)

**Step 1: Install the chart component**

```bash
cd /Users/juliocesardb/Documents/GitHub/BookEasely/web && npx shadcn@latest add chart -y
```

**Step 2: Verify installation**

```bash
ls web/src/components/ui/chart.tsx && grep recharts web/package.json
```

Expected: chart.tsx exists, recharts in dependencies.

**Step 3: Commit**

```bash
git add web/src/components/ui/chart.tsx web/package.json web/package-lock.json
git commit -m "feat: install shadcn chart component with recharts"
```

---

## Task 2: Add Analytics nav item to sidebar

**Files:**
- Modify: `web/src/components/dashboard-sidebar.tsx`
- Modify: `web/src/components/mobile-header.tsx` (uses same nav arrays)

**Step 1: Add BarChart3 icon import and Analytics nav item**

In `dashboard-sidebar.tsx`, add `BarChart3` to the lucide-react import, then add to `businessNav` array after the Dashboard item:

```typescript
{ label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
```

Position: index 1 in `businessNav` (right after Dashboard).

**Step 2: Verify sidebar renders**

Run dev server and check sidebar shows Analytics item for business owners.

**Step 3: Commit**

```bash
git add web/src/components/dashboard-sidebar.tsx
git commit -m "feat: add analytics nav item to business owner sidebar"
```

---

## Task 3: Create analytics server actions (data fetching)

**Files:**
- Create: `web/src/app/dashboard/analytics/actions.ts`

**Step 1: Create the server actions file**

This file exports a single `getAnalyticsData()` function that runs all queries in parallel via `Promise.all()`. It returns pre-aggregated data ready for charts.

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'

export interface BookingTrendPoint {
  date: string
  completed: number
  cancelled: number
}

export interface RevenuePeriod {
  week: string
  revenue: number
}

export interface PopularService {
  name: string
  bookings: number
  fill: string
}

export interface StatusCount {
  status: string
  count: number
  fill: string
}

export interface WorkerBookings {
  name: string
  bookings: number
}

export interface AnalyticsData {
  bookingTrend: BookingTrendPoint[]
  revenue: RevenuePeriod[]
  popularServices: PopularService[]
  statusBreakdown: StatusCount[]
  workerUtilization: WorkerBookings[]
  totalRevenue: number
  totalBookings: number
  completionRate: number
}

const STATUS_COLORS: Record<string, string> = {
  completed: 'var(--chart-1)',
  confirmed: 'var(--chart-2)',
  pending: 'var(--chart-3)',
  cancelled: 'var(--chart-4)',
  no_show: 'var(--chart-5)',
}

const SERVICE_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

export async function getAnalyticsData(businessId: string): Promise<AnalyticsData | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Verify ownership
  const { data: biz } = await supabase
    .from('businesses')
    .select('id')
    .eq('id', businessId)
    .eq('owner_id', user.id)
    .single()
  if (!biz) return null

  // Date ranges
  const now = new Date()
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 86400000).toISOString().split('T')[0]!
  const today = now.toISOString().split('T')[0]!

  // Parallel queries
  const [bookingsRes, servicesRes, workersRes] = await Promise.all([
    supabase
      .from('bookings')
      .select('id, date, status, service_id, worker_id, services(price)')
      .eq('business_id', businessId)
      .gte('date', ninetyDaysAgo)
      .lte('date', today)
      .order('date'),
    supabase
      .from('services')
      .select('id, name')
      .eq('business_id', businessId)
      .eq('is_active', true),
    supabase
      .from('workers')
      .select('id, display_name')
      .eq('business_id', businessId)
      .eq('is_active', true),
  ])

  const bookings = (bookingsRes.data ?? []) as Array<{
    id: string
    date: string
    status: string
    service_id: string
    worker_id: string
    services: { price: number } | null
  }>
  const services = servicesRes.data ?? []
  const workers = workersRes.data ?? []

  // --- Aggregate: Booking trend (daily, last 90 days) ---
  const trendMap = new Map<string, { completed: number; cancelled: number }>()
  for (const b of bookings) {
    const entry = trendMap.get(b.date) ?? { completed: 0, cancelled: 0 }
    if (b.status === 'completed') entry.completed++
    if (b.status === 'cancelled') entry.cancelled++
    trendMap.set(b.date, entry)
  }
  const bookingTrend: BookingTrendPoint[] = Array.from(trendMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, counts]) => ({ date, ...counts }))

  // --- Aggregate: Revenue by week ---
  const weekMap = new Map<string, number>()
  for (const b of bookings) {
    if (b.status !== 'completed' || !b.services?.price) continue
    const d = new Date(b.date)
    const weekStart = new Date(d)
    weekStart.setDate(d.getDate() - d.getDay())
    const key = weekStart.toISOString().split('T')[0]!
    weekMap.set(key, (weekMap.get(key) ?? 0) + Number(b.services.price))
  }
  const revenue: RevenuePeriod[] = Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, revenue]) => ({ week, revenue }))

  // --- Aggregate: Popular services (top 5) ---
  const serviceCountMap = new Map<string, number>()
  for (const b of bookings) {
    serviceCountMap.set(b.service_id, (serviceCountMap.get(b.service_id) ?? 0) + 1)
  }
  const serviceNameMap = new Map(services.map((s) => [s.id, s.name]))
  const popularServices: PopularService[] = Array.from(serviceCountMap.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id, count], i) => ({
      name: serviceNameMap.get(id) ?? 'Unknown',
      bookings: count,
      fill: SERVICE_COLORS[i % SERVICE_COLORS.length]!,
    }))

  // --- Aggregate: Status breakdown ---
  const statusMap = new Map<string, number>()
  for (const b of bookings) {
    statusMap.set(b.status, (statusMap.get(b.status) ?? 0) + 1)
  }
  const statusBreakdown: StatusCount[] = Array.from(statusMap.entries()).map(([status, count]) => ({
    status,
    count,
    fill: STATUS_COLORS[status] ?? 'var(--chart-5)',
  }))

  // --- Aggregate: Worker utilization ---
  const workerCountMap = new Map<string, number>()
  for (const b of bookings) {
    if (b.status === 'completed' || b.status === 'confirmed' || b.status === 'pending') {
      workerCountMap.set(b.worker_id, (workerCountMap.get(b.worker_id) ?? 0) + 1)
    }
  }
  const workerNameMap = new Map(workers.map((w) => [w.id, w.display_name]))
  const workerUtilization: WorkerBookings[] = Array.from(workerCountMap.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([id, count]) => ({
      name: workerNameMap.get(id) ?? 'Unknown',
      bookings: count,
    }))

  // --- Totals ---
  const totalRevenue = revenue.reduce((sum, r) => sum + r.revenue, 0)
  const totalBookings = bookings.length
  const completedCount = bookings.filter((b) => b.status === 'completed').length
  const completionRate = totalBookings > 0 ? Math.round((completedCount / totalBookings) * 100) : 0

  return {
    bookingTrend,
    revenue,
    popularServices,
    statusBreakdown,
    workerUtilization,
    totalRevenue,
    totalBookings,
    completionRate,
  }
}
```

**Step 2: Commit**

```bash
git add web/src/app/dashboard/analytics/actions.ts
git commit -m "feat: add analytics data fetching server action"
```

---

## Task 4: Create analytics page (Server Component)

**Files:**
- Create: `web/src/app/dashboard/analytics/page.tsx`
- Create: `web/src/app/dashboard/analytics/loading.tsx`

**Step 1: Create loading skeleton**

```typescript
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function AnalyticsLoading() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-9 w-48" />
        <Skeleton className="mt-1 h-5 w-72" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-2 h-8 w-16" />
          </Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-[250px] w-full" />
          </Card>
        ))}
      </div>
    </div>
  )
}
```

**Step 2: Create the page**

```typescript
import { getAuthUser } from '@/lib/supabase/auth-cache'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAnalyticsData } from './actions'
import { AnalyticsClient } from './analytics-client'

export default async function AnalyticsPage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const supabase = await createClient()
  const { data: business } = await supabase
    .from('businesses')
    .select('id, name')
    .eq('owner_id', user.id)
    .single()

  if (!business) redirect('/dashboard')

  const data = await getAnalyticsData(business.id)
  if (!data) redirect('/dashboard')

  return <AnalyticsClient data={data} businessName={business.name} />
}
```

**Step 3: Commit**

```bash
git add web/src/app/dashboard/analytics/page.tsx web/src/app/dashboard/analytics/loading.tsx
git commit -m "feat: add analytics page server component with loading skeleton"
```

---

## Task 5: Create chart components (5 files)

**Files:**
- Create: `web/src/app/dashboard/analytics/components/bookings-trend-chart.tsx`
- Create: `web/src/app/dashboard/analytics/components/revenue-chart.tsx`
- Create: `web/src/app/dashboard/analytics/components/popular-services-chart.tsx`
- Create: `web/src/app/dashboard/analytics/components/status-breakdown-chart.tsx`
- Create: `web/src/app/dashboard/analytics/components/worker-utilization-chart.tsx`

Each chart component:
- Is a `"use client"` component
- Uses shadcn `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`
- Uses shadcn `ChartContainer`, `ChartTooltip`, `ChartTooltipContent`, `ChartConfig`
- Receives data as typed props
- Uses `aspect-auto h-[250px] w-full` for responsive sizing

### 5a: Bookings Trend (Area Chart with time range selector)

Uses `AreaChart` with two areas (completed, cancelled). Has a `Select` dropdown for 7d/30d/90d.

### 5b: Revenue (Bar Chart)

Uses `BarChart` showing weekly revenue bars. Tooltip shows formatted currency.

### 5c: Popular Services (Horizontal Bar Chart)

Uses `BarChart` with `layout="vertical"` for top 5 services by booking count.

### 5d: Status Breakdown (Donut with center text)

Uses `PieChart` with `Pie` (innerRadius=60). Center text shows total bookings count.

### 5e: Worker Utilization (Bar Chart)

Uses `BarChart` showing bookings per worker.

**Step 1: Create all 5 chart component files** (see full code in implementation)

**Step 2: Commit**

```bash
git add web/src/app/dashboard/analytics/components/
git commit -m "feat: add 5 analytics chart components"
```

---

## Task 6: Create analytics client orchestrator

**Files:**
- Create: `web/src/app/dashboard/analytics/analytics-client.tsx`

**Step 1: Create the client component**

This is a `"use client"` component that composes all chart components with the existing `AnimatedCard`/`AnimatedSection` animation wrappers and stat cards for summary metrics (total revenue, total bookings, completion rate).

Uses `next/dynamic` to lazy-load chart components (recharts is ~45KB gzipped, so dynamic import prevents blocking initial render).

Layout grid:
- 3 stat cards at top: `grid gap-4 sm:grid-cols-3`
- Bookings trend: full width
- Revenue + Status breakdown: `grid gap-4 lg:grid-cols-2`
- Popular services + Worker utilization: `grid gap-4 lg:grid-cols-2`

**Step 2: Commit**

```bash
git add web/src/app/dashboard/analytics/analytics-client.tsx
git commit -m "feat: add analytics client orchestrator with dynamic chart imports"
```

---

## Task 7: Responsive design polish

**Files:**
- Audit and fix: various dashboard pages for responsive consistency

**Step 1: Calendar week view mobile scroll**

In `web/src/app/dashboard/calendar/week-view.tsx`, ensure the time grid container has `overflow-x-auto` for horizontal scrolling on mobile with a `min-w-[640px]` on the inner grid.

**Step 2: Verify all dashboard pages spacing**

Ensure consistent `px-4 py-6 sm:px-6 sm:py-8` padding pattern across all dashboard content areas.

**Step 3: Verify analytics charts are responsive**

All chart containers use `aspect-auto h-[250px] w-full` which recharts handles responsively via ChartContainer.

**Step 4: Commit**

```bash
git add -A
git commit -m "fix: polish responsive design across dashboard pages"
```

---

## Task 8: Final verification

**Step 1: Run build**

```bash
cd /Users/juliocesardb/Documents/GitHub/BookEasely/web && npm run build
```

Expected: Build succeeds with no errors.

**Step 2: Run lint**

```bash
cd /Users/juliocesardb/Documents/GitHub/BookEasely/web && npm run lint
```

Expected: No lint errors.

**Step 3: Manual verification**

- Navigate to `/dashboard/analytics` as business owner
- Verify all 5 charts render
- Verify responsive behavior (resize browser)
- Verify dark mode works on all charts
- Verify sidebar shows Analytics item

**Step 4: Final commit if needed**

```bash
git add -A
git commit -m "chore: fix any build/lint issues"
```
