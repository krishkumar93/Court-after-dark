# Courts After Dark — REST API Reference & Payload Specifications

Comprehensive developer documentation for Courts After Dark backend APIs.

---

## 1. Authentication Endpoints

### `POST /api/auth/login`
Authenticates user credentials and sets a signed HTTP-only JWT cookie (`cad_token`).

**Request Body:**
```json
{
  "email": "aarav@example.com",
  "password": "player123"
}
```

**Success Response (200 OK):**
```json
{
  "user": {
    "id": "6724fa10b...",
    "name": "Aarav Sharma",
    "email": "aarav@example.com",
    "role": "player"
  }
}
```

---

### `POST /api/auth/demo`
Provides instant 1-click authentication without entering credentials.

**Request Body:**
```json
{
  "role": "player" // or "admin"
}
```

---

## 2. Facilities & Availability Endpoints

### `GET /api/facilities`
Lists sports venues with optional query filters.

**Query Parameters:**
- `sport`: (Optional) e.g. "Badminton", "Cricket", "Football"
- `city`: (Optional) e.g. "Downtown", "Uptown"
- `search`: (Optional) Text search by name or location
- `limit`: (Optional) Number of results (default 50)

---

### `GET /api/facilities/:id/availability?date=YYYY-MM-DD`
Computes real-time 1-hour slot states for the specified venue and date.

**Response Structure:**
```json
{
  "date": "2026-11-01",
  "facility": {
    "_id": "6ae06e4f197f4219e9215720",
    "name": "Apex Arena Badminton 1",
    "type": "Badminton Court",
    "pricePerHour": 35
  },
  "slots": [
    {
      "slot": "18:00-19:00",
      "status": "Available",
      "isPrime": true,
      "waitlistCount": 0
    }
  ]
}
```

---

## 3. Booking Endpoints

### `POST /api/bookings`
Creates a verified court reservation with atomic double-booking conflict prevention.

**Headers:**
`Cookie: cad_token=...`

**Request Body:**
```json
{
  "facilityId": "6ae06e4f197f4219e9215720",
  "date": "2026-11-01",
  "startTime": "18:00",
  "endTime": "19:00",
  "equipmentAddons": [
    { "equipmentId": "eq_01", "name": "Yonex Nanoflare", "quantity": 2, "price": 8 }
  ],
  "paymentMethod": "Razorpay",
  "paymentDetails": {
    "method": "Razorpay",
    "razorpayPaymentId": "pay_CAD123456789",
    "upiId": "athlete@okhdfcbank"
  }
}
```

---

## 4. Equipment Rental Endpoints

### `GET /api/equipment`
Returns catalog of sports gear with live inventory counters (`totalQuantity` & `availableQuantity`).

### `POST /api/equipment/checkout`
Checks out sports gear directly. Decrements available stock atomically.

---

## 5. Waitlist Queue Endpoints

### `POST /api/waitlist`
Queues the authenticated athlete for a booked time slot. If the current reservation is cancelled, waitlisted athletes are notified in FIFO sequence.
