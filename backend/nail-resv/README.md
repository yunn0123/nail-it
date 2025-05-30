# Nail Reservation Backend

This is a simple Node.js/Express backend for a nail-artist reservation system. It allows technicians to:

* Define weekly availability by **weekday** with fixed time slots (e.g., Monday at 10:00, Wednesday at 14:00).
* Customers can fetch available slots for a given date.
* Book a slot (with an optional note), which removes it for that specific date.

All data is stored Supabase with user identification.

---

## Prerequisites

* Node.js v14+ installed
* Git (optional, to clone this repo)

---

## Setup & Run

1. **Install dependencies**

   ```bash
   npm install express
   ```
2. **Start the server**

   ```bash
   node server.js
   ```

   The server will listen on `http://localhost:4000` by default.

---

## API Endpoints & Testing

Use these **Windows CMD–compatible** `curl` one-liners to interact.

### 1. Technician: Set Weekly Availability

Define which weekdays and time slots the artist is available:

```cmd
curl -X POST http://localhost:4000/api/technicians/yunchen/availability   -H "Content-Type: application/json"   -d "{\"availability\":{\"Mon\":[\"10:00\"],\"Wed\":[\"12:00\",\"14:00\"],\"Fri\":[\"10:00\",\"18:00\"]}}"

```

* **`yunchen`**: just a testing artist name.
* **`Mon`, `Wed`, `Fri`**: weekdays.
* **Time slots**: any subset of `[10:00, 12:00, 14:00, 16:00, 18:00]`.

### 2. Customer: Fetch Available Slots

Get the technician’s free slots for a specific date. Only dates after **tomorrow** are accepted.

```cmd
curl "http://localhost:4000/api/technicians/yunchen/slots?date=2025-06-06"
```

* **Response**: JSON listing `availableSlots` for that date (or an error if outside the window or weekday not available).

### 3. Customer: Book a Reservation

Reserve a slot and optionally leave a note for the technician:

```cmd
curl -X POST http://localhost:4000/api/reservations/book   -H "Content-Type: application/json"   -d "{\"username\":\"ying\",\"studio\":\"yunchen\",\"date\":\"2025-06-06\",\"time\":\"12:00:00\",\"note\":\"Hi I am a flower\"}" 
```

* **`customerId`**: ID for the customer.
* **`artistId`** must match the technician.
* **Slot**: must appear in the fetched `availableSlots`.
* **Note**: optional string.

### 4. Verify Slot Removal

After booking, the slot is removed. Fetch again:

```cmd
curl "http://localhost:4000/api/technicians/yunchen/slots?date=2025-06-06"
```

You should see that the previously booked time is no longer listed.

---


