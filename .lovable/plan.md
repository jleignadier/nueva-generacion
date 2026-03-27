

# Recurring Events Feature

## Overview
Add recurrence settings to the admin event creation/edit form. When an admin creates a recurring event, the system generates individual event instances that share a `recurrence_group_id`. Volunteers can then register for the entire series or individual occurrences.

## Database Changes (1 migration)

Add columns to the `events` table:
- `recurrence_type TEXT NULL` — values: `weekly`, `biweekly`, `monthly`, or `NULL` (one-time)
- `recurrence_end_date DATE NULL` — when the recurrence stops generating instances
- `recurrence_group_id UUID NULL` — shared ID linking all instances of a recurring event

No new tables needed. Each recurrence instance is a full row in `events`, so existing registration, attendance, QR, and donation logic all work unchanged per instance.

## How It Works

**Admin creates a recurring event:**
1. Admin fills in the event form as usual (title, date, time, location, etc.)
2. Toggles "Evento Recurrente" switch ON
3. Selects frequency: Semanal / Bisemanal / Mensual
4. Picks a recurrence end date
5. On submit, the backend generates all individual event rows sharing the same `recurrence_group_id`

**Volunteer registration options:**
- On any event that belongs to a recurrence group, the volunteer sees two buttons:
  - "Registrarse para este evento" (single instance)
  - "Registrarse para toda la serie" (registers for all future instances in the group)

**Admin editing:**
- When editing a recurring event, admin is asked: "Editar solo este evento" or "Editar todos los eventos futuros de la serie"
- Single-edit updates only that row; series-edit updates all future instances in the group

## Frontend Changes

### 1. `EventForm.tsx` — Add recurrence fields
- Add a "Evento Recurrente" switch (like the existing multi-day toggle)
- When ON, show:
  - Radio group: Semanal / Bisemanal / Mensual
  - DatePicker for recurrence end date
- On submit, if recurring: generate event dates client-side, insert all rows via `addRecurringEvents` store method

### 2. `eventsStore.ts` — New `addRecurringEvents` method
- Accepts base event data + recurrence config
- Generates date array based on frequency
- Generates a shared `recurrence_group_id` (UUID)
- Batch-inserts all event rows into Supabase

### 3. `EventDetail.tsx` — Series registration option
- If event has a `recurrence_group_id`, show option to register for the full series
- "Register for series" calls `registerForEvent` for each future unregistered instance in the group

### 4. `AdminEvents.tsx` — Visual indicator
- Show a small "Recurrente" badge on events that belong to a recurrence group
- When deleting, ask: delete single instance or entire series

## Technical Details

- **Date generation**: use `date-fns` `addWeeks`/`addMonths` to compute instance dates from start date to recurrence end date
- **New DB columns**: `recurrence_type TEXT NULL`, `recurrence_end_date DATE NULL`, `recurrence_group_id UUID NULL`
- **Files modified**: `EventForm.tsx`, `eventsStore.ts`, `EventDetail.tsx`, `AdminEvents.tsx`
- **No new packages needed** — `date-fns` is already installed

