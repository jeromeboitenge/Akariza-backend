# Messaging Permissions by Role

## 📱 CASHIER
**Can message:**
- ✅ Other cashiers in the same branch
- ✅ Their branch manager
- ❌ Cannot message other branches
- ❌ Cannot broadcast to branch

**Example:**
```
Cashier A (Branch 1) → Cashier B (Branch 1) ✅
Cashier A (Branch 1) → Manager (Branch 1) ✅
Cashier A (Branch 1) → Cashier C (Branch 2) ❌
```

**Endpoint:**
```json
POST /api/v1/messages
{
  "receiverId": "user-id",
  "message": "Need help at counter 2"
}
```

---

## 👔 MANAGER
**Can message:**
- ✅ All users in their branch (cashiers, other managers)
- ✅ Broadcast to entire branch
- ✅ Direct message to BOSS
- ❌ Cannot message other branches
- ❌ Cannot broadcast to all branches

**Example:**
```
Manager (Branch 1) → All Branch 1 staff ✅
Manager (Branch 1) → Cashier (Branch 1) ✅
Manager (Branch 1) → BOSS ✅
Manager (Branch 1) → Manager (Branch 2) ❌
Manager (Branch 1) → All branches ❌
```

**Endpoints:**
```json
// Direct message
POST /api/v1/messages
{
  "receiverId": "user-id",
  "message": "Please check inventory"
}

// Branch broadcast
POST /api/v1/messages
{
  "targetType": "BRANCH",
  "receiverBranchId": "branch-id",
  "message": "Team meeting at 3 PM"
}
```

---

## 👨‍💼 BOSS
**Can message:**
- ✅ Any user in any branch
- ✅ Broadcast to specific branch
- ✅ Broadcast to ALL branches (organization-wide)
- ✅ Direct message anyone

**Example:**
```
BOSS → Any user in any branch ✅
BOSS → Specific branch ✅
BOSS → All branches ✅
```

**Endpoints:**
```json
// Direct message
POST /api/v1/messages
{
  "receiverId": "user-id",
  "message": "Great job on sales today!"
}

// Branch broadcast
POST /api/v1/messages
{
  "targetType": "BRANCH",
  "receiverBranchId": "branch-id",
  "message": "Branch 1 - New promotion starts tomorrow"
}

// Organization-wide broadcast
POST /api/v1/messages
{
  "targetType": "ALL_BRANCHES",
  "message": "Company meeting on Friday at 10 AM"
}
```

---

## 🔐 SYSTEM_ADMIN
**Can message:**
- ✅ Any user in any organization
- ✅ View all messages across all organizations
- ✅ Full access (for system management)

---

## 📊 Message Visibility

### CASHIER sees:
- Messages sent by them
- Messages sent to them
- **Cannot see** branch broadcasts (unless directly mentioned)

### MANAGER sees:
- All messages in their branch
- Messages sent by them
- Messages sent to them
- Branch broadcasts for their branch

### BOSS sees:
- All messages in the organization
- All branch communications
- All direct messages

---

## 🎯 Common Use Cases

### 1. Cashier needs help
```
Cashier → Manager (same branch)
"Customer asking about product X, need assistance"
```

### 2. Manager announces to team
```
Manager → Branch Broadcast
"Team meeting at 3 PM today in the break room"
```

### 3. Boss announces new policy
```
BOSS → All Branches
"New return policy effective tomorrow - check your email"
```

### 4. Manager reports to Boss
```
Manager → BOSS
"Daily sales report: 2.5M RWF today"
```

### 5. Cashier to Cashier (same branch)
```
Cashier A → Cashier B (same branch)
"Can you cover my register for 5 minutes?"
```

---

## ⚠️ Restrictions

1. **Cross-branch messaging:**
   - CASHIER: ❌ Cannot message other branches
   - MANAGER: ❌ Cannot message other branches
   - BOSS: ✅ Can message any branch

2. **Broadcasting:**
   - CASHIER: ❌ Cannot broadcast
   - MANAGER: ✅ Can broadcast to their branch only
   - BOSS: ✅ Can broadcast to any/all branches

3. **Message deletion:**
   - ❌ No one can delete messages (audit trail)
   - ✅ Can only mark as read

---

## 📱 Get Messages

```
GET /api/v1/messages?limit=50
```

**Returns:**
- CASHIER: Only their direct messages
- MANAGER: All branch messages + their direct messages
- BOSS: All organization messages
