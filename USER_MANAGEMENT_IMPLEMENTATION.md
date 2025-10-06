# User Management Implementation Guide

## Overview
A comprehensive User Management page that fully integrates with the backend API for complete CRUD operations on users.

## Location
`UNICX.Frontend/src/app/entities/users/page.tsx`

## Features Implemented

### 1. **User List & Display**
- Displays all users in a responsive table format
- Shows user details: name, email, phone number, entity, role, status, WhatsApp connection
- Real-time data loading from backend API
- Empty state handling

### 2. **Advanced Filtering**
- **Search**: Search by name, email, phone number, or entity path
- **Registration Status Filter**: Filter by registered, invited, pending, or cancelled
- **Role Filter**: Filter by SystemAdmin, TenantAdmin, or User
- **WhatsApp Status Filter**: Filter by connected, disconnected, connecting, or failed
- All filters work independently and can be combined

### 3. **Create User (POST /api/v1/users)**
- Modal form with validation
- Fields:
  - First Name & Last Name
  - Email address
  - Phone Number (E.164 format validation)
  - Password
  - Entity selection (dropdown)
  - Role selection (User, TenantAdmin, SystemAdmin*)
- E.164 phone number format validation
- Auto-refresh after creation
- Success/error messaging

### 4. **Invite User (POST /api/v1/users/invite)**
- Separate modal for inviting users
- Similar fields to Create User (except password)
- Automatically generates temporary password
- Sends invitation to user
- Sets user status to "invited"
- Success/error messaging

### 5. **Edit User (PATCH /api/v1/users/:id)**
- Modal form pre-filled with current user data
- Update fields:
  - First Name & Last Name
  - Email address
  - Phone Number
  - Entity
  - Role
- Real-time validation
- Success/error messaging

### 6. **Delete User (DELETE /api/v1/users/:id)**
- Confirmation dialog before deletion
- Soft delete (user.isActive = false)
- Auto-refresh after deletion
- Success/error messaging

### 7. **Statistics Dashboard**
- Total Users count
- Registration status breakdown:
  - Registered users
  - Invited users
  - Pending users
  - Cancelled users
- Color-coded cards for quick visibility
- Real-time updates from backend

### 8. **Role-Based Access Control**
- SystemAdmin can see all users and assign any role
- TenantAdmin can manage users within their tenant
- Proper permission checks on all operations

### 9. **UI/UX Features**
- Modern, clean interface following existing design patterns
- Loading states with spinner animations
- Success/error message toasts
- Confirmation dialogs for destructive actions
- Responsive design for mobile/tablet/desktop
- Status badges with color coding:
  - Green: Registered/Connected
  - Blue: Invited
  - Yellow: Pending/Connecting
  - Red: Cancelled/Failed
- Role badges with distinct colors

## API Integration

### API Client Updates (`UNICX.Frontend/src/lib/api.ts`)

Added the following methods:

```typescript
// List users with filters
async getUsers(filters?: {
  registrationStatus?: string;
  role?: string;
  entityId?: string;
  whatsappConnectionStatus?: string;
  search?: string;
}): Promise<any[]>

// Get single user
async getUser(id: string): Promise<any>

// Create user with password
async createUser(data: CreateUserData): Promise<any>

// Invite user (generates temp password)
async inviteUser(data: InviteUserData): Promise<any>

// Bulk invite multiple users
async bulkInviteUsers(data: BulkInviteData): Promise<any>

// Update user details
async updateUser(id: string, data: UpdateUserData): Promise<any>

// Update registration status
async updateUserRegistrationStatus(id: string, status: string): Promise<any>

// Update WhatsApp status
async updateUserWhatsAppStatus(id: string, status: string): Promise<any>

// Delete user (soft delete)
async deleteUser(id: string): Promise<any>

// Get user statistics
async getUserStats(): Promise<any>

// Search users by query
async searchUsers(query: string): Promise<any[]>
```

## Backend Endpoints Used

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users` | List all users with filters |
| GET | `/api/v1/users/:id` | Get single user |
| POST | `/api/v1/users` | Create new user |
| POST | `/api/v1/users/invite` | Invite user |
| POST | `/api/v1/users/bulk-invite` | Bulk invite users |
| PATCH | `/api/v1/users/:id` | Update user |
| PATCH | `/api/v1/users/:id/registration-status` | Update registration status |
| PATCH | `/api/v1/users/:id/whatsapp-status` | Update WhatsApp status |
| DELETE | `/api/v1/users/:id` | Delete user |
| GET | `/api/v1/users/stats` | Get statistics |
| GET | `/api/v1/users/search?q=` | Search users |

## Data Flow

1. **On Page Load**:
   - Fetches all users from backend
   - Fetches all entities for dropdown selections
   - Fetches user statistics for dashboard

2. **On Filter Change**:
   - Automatically re-fetches users with new filters
   - No manual refresh needed

3. **On Create/Edit/Delete**:
   - Performs action via API
   - Shows success/error message
   - Auto-refreshes user list and statistics
   - Closes modal on success

## Validation

### Phone Number Validation
- Must be in E.164 format
- Must start with '+' followed by country code
- Example: +1234567890

### Email Validation
- Standard email format validation
- Checked for uniqueness on backend

### Required Fields
- All fields marked with * are required
- Frontend validation before API call
- Backend validation as final check

## Error Handling

- Network errors caught and displayed
- Backend validation errors shown to user
- User-friendly error messages
- Automatic error dismissal after actions

## Success Indicators

- Green success banners for completed actions
- Auto-dismiss after 3 seconds
- Real-time list updates
- Statistics refresh

## Usage Examples

### Creating a New User
1. Click "Create User" button
2. Fill in all required fields
3. Select entity from dropdown
4. Choose role (User/TenantAdmin/SystemAdmin)
5. Enter password
6. Click "Create User"
7. User appears in list immediately

### Inviting a User
1. Click "Invite User" button
2. Fill in user details (no password required)
3. Select entity and role
4. Click "Send Invitation"
5. System generates temp password
6. Invitation sent automatically

### Editing a User
1. Click edit icon (pencil) next to user
2. Modal opens with current data
3. Modify any fields
4. Click "Update User"
5. Changes reflected immediately

### Deleting a User
1. Click delete icon (trash) next to user
2. Confirm deletion in dialog
3. User soft-deleted (isActive = false)
4. User removed from list

## Testing Checklist

- [x] Load users from backend
- [x] Create new user with all fields
- [x] Invite user without password
- [x] Edit existing user
- [x] Delete user with confirmation
- [x] Filter by registration status
- [x] Filter by role
- [x] Filter by WhatsApp status
- [x] Search functionality
- [x] Statistics display correctly
- [x] E.164 phone validation
- [x] Error handling and display
- [x] Success messages
- [x] Loading states
- [x] Responsive design
- [x] Role-based permissions

## Future Enhancements

Potential features to add:
- Bulk user operations (select multiple, bulk delete/update)
- Export users to CSV/Excel
- Import users from CSV
- Advanced user profile view
- User activity logs
- Password reset functionality
- QR code generation for invitations
- Email/SMS notification integration
- User avatar upload
- Custom fields per entity

## Dependencies

- React 18+
- Next.js 14+
- Heroicons for icons
- Backend API (NestJS)
- JWT authentication
- MongoDB database

## Notes

- All operations require authentication
- TenantAdmin can only manage users in their tenant
- SystemAdmin has full access across all tenants
- Phone numbers must be unique per tenant
- Email addresses must be unique per tenant
- Passwords are hashed on backend using bcrypt
- Soft delete preserves data for audit purposes

