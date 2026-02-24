# 💬 Organization Chat Portal

## Overview
Each organization has its own private chat portal where all users within the organization can communicate with each other. Users can send broadcast messages to everyone or direct messages to specific users.

---

## Features

### ✅ Organization-Wide Chat
- All users in the same organization can see and participate
- Broadcast messages visible to everyone
- Direct messages between two users
- Real-time conversation threads

### ✅ User Directory
- View all active users in your organization
- See user roles (BOSS, MANAGER, CASHIER)
- Quick access to start conversations

### ✅ Message Management
- Send messages (broadcast or direct)
- View message history
- Mark messages as read
- Delete your own messages
- Unread message counter

### ✅ Privacy & Security
- Organization-isolated (can't see other org's messages)
- Only message sender can delete their messages
- Only message recipient can mark as read
- Role-based access maintained

---

## API Endpoints

### Base URL: `/api/v1/org-chat`

---

### 1. **Send Message**
```http
POST /api/v1/org-chat/send
Authorization: Bearer <token>
```

**Broadcast to All Users:**
```json
{
  "message": "Team meeting at 3 PM today in the conference room!"
}
```

**Direct Message to Specific User:**
```json
{
  "recipientId": "user-id-here",
  "message": "Can you check the inventory report?"
}
```

**Response:**
```json
{
  "id": "msg-id",
  "organizationId": "org-id",
  "senderId": "sender-id",
  "receiverId": "recipient-id",
  "message": "Team meeting at 3 PM today!",
  "isRead": false,
  "createdAt": "2026-02-24T15:30:00Z",
  "sender": {
    "name": "John Doe",
    "email": "john@store.com"
  },
  "receiver": {
    "name": "Jane Smith",
    "email": "jane@store.com"
  }
}
```

---

### 2. **Get Organization Messages**
```http
GET /api/v1/org-chat/messages?limit=50
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (optional) - Number of messages to retrieve (default: 50)

**Response:**
```json
[
  {
    "id": "msg-1",
    "message": "Team meeting at 3 PM",
    "createdAt": "2026-02-24T15:30:00Z",
    "sender": {
      "name": "John Doe",
      "email": "john@store.com",
      "role": "BOSS"
    },
    "receiver": null
  },
  {
    "id": "msg-2",
    "message": "Check inventory report",
    "createdAt": "2026-02-24T15:25:00Z",
    "sender": {
      "name": "Manager",
      "email": "manager@store.com",
      "role": "MANAGER"
    },
    "receiver": {
      "name": "Cashier",
      "email": "cashier@store.com"
    }
  }
]
```

---

### 3. **Get Conversation with User**
```http
GET /api/v1/org-chat/conversation/:userId
Authorization: Bearer <token>
```

**Example:**
```http
GET /api/v1/org-chat/conversation/user-123
```

**Response:**
```json
[
  {
    "id": "msg-1",
    "message": "Hi, can you help me?",
    "createdAt": "2026-02-24T14:00:00Z",
    "sender": {
      "name": "You",
      "email": "you@store.com"
    }
  },
  {
    "id": "msg-2",
    "message": "Sure, what do you need?",
    "createdAt": "2026-02-24T14:01:00Z",
    "sender": {
      "name": "Other User",
      "email": "other@store.com"
    }
  }
]
```

---

### 4. **Get Organization Users**
```http
GET /api/v1/org-chat/users
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "user-1",
    "name": "John Doe",
    "email": "john@store.com",
    "role": "BOSS"
  },
  {
    "id": "user-2",
    "name": "Jane Smith",
    "email": "jane@store.com",
    "role": "MANAGER"
  },
  {
    "id": "user-3",
    "name": "Bob Wilson",
    "email": "bob@store.com",
    "role": "CASHIER"
  }
]
```

---

### 5. **Mark Message as Read**
```http
POST /api/v1/org-chat/:messageId/read
Authorization: Bearer <token>
```

**Example:**
```http
POST /api/v1/org-chat/msg-123/read
```

**Response:**
```json
{
  "id": "msg-123",
  "isRead": true,
  "message": "Check inventory report"
}
```

---

### 6. **Get Unread Count**
```http
GET /api/v1/org-chat/unread-count
Authorization: Bearer <token>
```

**Response:**
```json
{
  "count": 5
}
```

---

### 7. **Delete Message**
```http
DELETE /api/v1/org-chat/:messageId
Authorization: Bearer <token>
```

**Example:**
```http
DELETE /api/v1/org-chat/msg-123
```

**Note:** Only the sender can delete their own messages.

---

## Usage Examples

### Example 1: Boss Sends Announcement
```bash
# Login as Boss
TOKEN=$(curl -s -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"boss@store.com","password":"boss123"}' | jq -r '.accessToken')

# Send broadcast message
curl -X POST http://localhost:5000/api/v1/org-chat/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Great work team! Sales are up 20% this month!"
  }'
```

---

### Example 2: Manager Sends Direct Message to Cashier
```bash
# Login as Manager
TOKEN=$(curl -s -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@store.com","password":"manager123"}' | jq -r '.accessToken')

# Get list of users
curl -X GET http://localhost:5000/api/v1/org-chat/users \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# Send direct message to cashier
curl -X POST http://localhost:5000/api/v1/org-chat/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientId": "cashier-user-id",
    "message": "Please count the cash drawer at end of shift"
  }'
```

---

### Example 3: View Organization Chat
```bash
# Login
TOKEN=$(curl -s -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"cashier@store.com","password":"cashier123"}' | jq -r '.accessToken')

# Get all organization messages
curl -X GET http://localhost:5000/api/v1/org-chat/messages?limit=20 \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# Check unread count
curl -X GET http://localhost:5000/api/v1/org-chat/unread-count \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

---

### Example 4: Private Conversation
```bash
# Get conversation with specific user
curl -X GET http://localhost:5000/api/v1/org-chat/conversation/user-id \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# Mark message as read
curl -X POST http://localhost:5000/api/v1/org-chat/msg-123/read \
  -H "Authorization: Bearer $TOKEN"
```

---

## Use Cases

### 1. **Team Announcements**
Boss or Manager broadcasts important updates to entire team:
- "Store closing early today"
- "New products arriving tomorrow"
- "Monthly sales target achieved!"

### 2. **Task Coordination**
Manager assigns tasks to specific team members:
- "Please restock aisle 3"
- "Check inventory for product X"
- "Prepare end-of-day report"

### 3. **Quick Questions**
Team members ask quick questions:
- "What's the price for product Y?"
- "Can I take lunch break now?"
- "Where is the stock for item Z?"

### 4. **Shift Handover**
Outgoing shift communicates with incoming shift:
- "Cash drawer count: 500,000 RWF"
- "Customer complained about product X"
- "Delivery expected at 4 PM"

### 5. **Emergency Alerts**
Urgent notifications to team:
- "System maintenance in 10 minutes"
- "Important customer arriving"
- "Stock shortage alert"

---

## Features Breakdown

### Message Types

#### 1. **Broadcast Messages**
- No `recipientId` specified
- Visible to all users in organization
- Used for announcements
- Example: Team meetings, policy updates

#### 2. **Direct Messages**
- `recipientId` specified
- Only visible to sender and recipient
- Used for private communication
- Example: Task assignments, private questions

---

## Security & Privacy

### ✅ Organization Isolation
- Users can only see messages from their organization
- Cannot access other organizations' chats
- Automatic filtering by `organizationId`

### ✅ Message Permissions
- Only sender can delete their messages
- Only recipient can mark messages as read
- All users can view organization broadcasts

### ✅ User Authentication
- All endpoints require valid JWT token
- Token contains user's organization ID
- Automatic user identification

---

## Integration with Existing Features

### Works With:
- ✅ **Users Module** - User directory
- ✅ **Organizations Module** - Organization isolation
- ✅ **Auth Module** - JWT authentication
- ✅ **Notifications Module** - Can trigger notifications

### Future Enhancements:
- 🔄 Real-time WebSocket support
- 🔄 File attachments
- 🔄 Message reactions (like, emoji)
- 🔄 Message threading
- 🔄 Search messages
- 🔄 Message pinning
- 🔄 Typing indicators
- 🔄 Online/offline status

---

## Testing in Swagger

1. **Open Swagger UI:**
   ```
   http://localhost:5000/api/v1/docs
   ```

2. **Find "Organization Chat" section**

3. **Authorize with token:**
   - Click "Authorize" button
   - Enter: `Bearer <your-token>`

4. **Try the endpoints:**
   - Send broadcast message
   - Send direct message
   - View messages
   - Get user list
   - Check unread count

---

## Database Schema

Messages are stored in the existing `Message` table:

```prisma
model Message {
  id             String   @id @default(uuid())
  organizationId String
  senderId       String
  receiverId     String?  // null = broadcast
  message        String
  isRead         Boolean  @default(false)
  createdAt      DateTime @default(now())
  
  organization   Organization @relation(...)
  sender         User         @relation(...)
  receiver       User?        @relation(...)
}
```

---

## Summary

✅ **Organization Chat Portal is Complete!**

**Features:**
- ✅ Broadcast messages to all users
- ✅ Direct messages between users
- ✅ View organization message history
- ✅ User directory
- ✅ Unread message counter
- ✅ Mark as read
- ✅ Delete messages
- ✅ Organization isolation
- ✅ Complete Swagger documentation

**Endpoints:** 7 endpoints
**Use Cases:** Team communication, task coordination, announcements

**Ready to use!** 🚀
