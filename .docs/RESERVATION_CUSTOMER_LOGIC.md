# Reservation Customer Logic - UPDATED

## Overview
The reservation system now **ONLY stores PRIMARY CUSTOMERS** (who book the room) in the Customer collection. Associate members' ID proofs are stored directly in the reservation's `guestIdProofs` array **without creating customer records**.

## Customer Storage Policy

### ✅ PRIMARY CUSTOMER (Index 0) - STORED IN DATABASE
**The person who books the room**

**Required Information:**
- ✅ Phone Number (required)
- ✅ Email (required)
- ✅ First Name & Last Name
- ✅ ID Proof (uploaded file)

**Behavior:**
- If a customer with the same phone number exists, their record is updated and reused
- Reservation count is incremented for the primary customer
- Only ONE primary customer per reservation
- **Stored in Customer collection**

**Example:**
```javascript
{
  _id: "694aae18365e99d4621739ac",
  phoneNumber: "9849563078",
  firstName: "Balaji",
  lastName: "Kumar",
  email: "balaji@gmail.com",
  idFile: "uploads/customer/Idproof/PAN-123.png",
  reservations: 1,
  hotelId: "69295015bcdb80fa7173a0de"
}
```

### ❌ ASSOCIATE MEMBERS (Index > 0) - NOT STORED IN DATABASE
**Guests traveling with the primary customer**

**Required Information:**
- ✅ ID Proof (uploaded file) **ONLY**
- ❌ Name (not needed)
- ❌ Phone Number (not needed)
- ❌ Email (not needed)

**Behavior:**
- **NO customer record is created**
- ID proof is stored directly in reservation's `guestIdProofs` array
- Can have multiple associate members per reservation
- **Not stored in Customer collection**

## Request Format

### Frontend should send customers array like this:

```javascript
customers: [
  // Index 0 = Primary Customer (REQUIRED)
  {
    phoneNumber: "9849563078",
    firstName: "Balaji",
    lastName: "Kumar",
    email: "balaji@gmail.com"
  },
  // Index 1+ = Associate Members (can be empty objects)
  {},  // Associate Member 1 - just upload ID proof
  {}   // Associate Member 2 - just upload ID proof
]
```

### File Upload
- Upload ID proofs in the **same order** as the customers array
- `req.files[0]` = Primary customer's ID
- `req.files[1]` = Associate member 1's ID
- `req.files[2]` = Associate member 2's ID
- etc.

## Database Storage

### Reservation Document
```javascript
{
  _id: "694ab6d9365e99d462173a2e",
  roomNo: "201",
  customers: [
    "694aae18365e99d4621739ac"  // ONLY primary customer ID
  ],
  guestIdProofs: [
    "uploads/customer/Idproof/PAN-123.png",      // Primary customer
    "uploads/customer/Idproof/Aadhar-456.png",   // Associate member 1
    "uploads/customer/Idproof/Aadhar-789.png"    // Associate member 2
  ]
}
```

### Customer Collection
**ONLY contains primary customers:**

```javascript
{
  _id: "694aae18365e99d4621739ac",
  phoneNumber: "9849563078",
  firstName: "Balaji",
  lastName: "Kumar",
  email: "balaji@gmail.com",
  idFile: "uploads/customer/Idproof/PAN-123.png",
  reservations: 1,
  hotelId: "69295015bcdb80fa7173a0de"
}
```

**NO "Associate Member" records are created!**

## Key Benefits

✅ **Clean Customer Database**: Only actual booking customers are stored
✅ **No Clutter**: No "Associate Member 1", "Associate Member 2" records
✅ **Primary Customer Tracking**: Easy to identify who made the booking
✅ **Simplified Data**: Associate members are just ID proofs in the reservation
✅ **Reusable Primary Customers**: Returning customers are recognized by phone number
✅ **Accurate Reservation Counts**: Only primary customers have reservation counts
✅ **Efficient Storage**: ID proofs stored directly in reservation, no extra customer records

## Console Logs

The system provides detailed logging:

```
📁 Files received: 3
👥 Customers count: 3
💾 Created primary customer: { id: '...', name: 'Balaji Kumar', phone: '9849563078', email: 'balaji@gmail.com' }
✅ Associate member 1: ID proof stored -> uploads/customer/Idproof/Aadhar-456.png
✅ Associate member 2: ID proof stored -> uploads/customer/Idproof/Aadhar-789.png
✅ Online reservation created with: { primaryCustomer: '...', totalGuests: 3, guestIdProofs: 3 }
```

## Changes from Previous Version

### Before:
- ❌ Created customer records for associate members
- ❌ Associate members had names like "Associate Member 1"
- ❌ Cluttered Customer collection with non-booking guests
- ❌ `customers` array had multiple IDs

### After:
- ✅ Only primary customer stored in Customer collection
- ✅ Associate member ID proofs stored in `guestIdProofs` array
- ✅ Clean Customer collection with only actual bookers
- ✅ `customers` array has only one ID (primary customer)

## API Changes

### Affected Endpoints:
- `POST /api/customer/doreservation` (Offline reservation)
- `POST /api/customer/doreservationOnline` (Online reservation)
- `GET /api/customer/viewallcustomer/:hotelId` (Now returns only primary customers)

### Response Format:
```javascript
{
  message: "Online Reservation Successful",
  reservation: {
    customers: ["694aae18365e99d4621739ac"], // Only primary customer
    guestIdProofs: [
      "uploads/customer/Idproof/PAN-123.png",
      "uploads/customer/Idproof/Aadhar-456.png",
      "uploads/customer/Idproof/Aadhar-789.png"
    ],
    // ... other reservation fields
  }
}
```
