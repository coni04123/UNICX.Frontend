# Role System Rewrite - 2N5 JOB1

## Overview
The system roles have been rewritten to align with the client's requirements for elastic entity management and E164 user monitoring.

## New Role Structure

### 1. **System Administrator** 
- **Role Code**: `SystemAdmin`
- **Description**: Full system access across all tenants and system management
- **Max Members**: 25
- **Key Permissions**:
  - Manage all tenants and system settings
  - Full access to all WhatsApp accounts and spy numbers
  - Complete entity hierarchy management
  - System-wide monitoring and administration
  - Manage all sub-tenants across the system

### 2. **Tenant Administrator**
- **Role Code**: `TenantAdmin` 
- **Description**: Manages tenant and sub-tenants (companies/departments), monitors E164 users
- **Max Members**: Unlimited
- **Key Permissions**:
  - **Sub-tenant Management**: Can create, edit, and delete companies/departments under their tenant
  - **E164 User Management**: Manage E164 users within their sub-tenants
  - **Message Monitoring**: Monitor WhatsApp messages from all E164 users in their tenant scope
  - **Entity Structure**: Full control over their elastic entity hierarchy
  - **User Administration**: Manage users within their tenant
  - **Limited System Access**: Cannot access system-wide settings or other tenants

### 3. **User (E164 User)**
- **Role Code**: `User`
- **Description**: Basic element user with limited access to own messages and profile
- **Max Members**: Unlimited
- **Key Permissions**:
  - **Own Messages**: View and manage their own WhatsApp messages
  - **Profile Management**: Update their own profile and settings
  - **WhatsApp Connection**: Connect their WhatsApp account via QR code
  - **Read-Only Access**: View entities and basic system information
  - **No Administrative Rights**: Cannot manage other users or sub-tenants

## Elastic Entity Structure Implementation

Based on the client's example: "Entity X has 3 companies C1,C2,C3 and each company has different number of departments and each department has different users. User is the E164 which is the basic element."

### Hierarchy Structure:
```
Entity X (Tenant)
├── Company C1 (Sub-tenant)
│   ├── Sales Department (Sub-tenant)
│   │   ├── E164 User: +14155551001 (Sarah Johnson)
│   │   └── E164 User: +14155551002 (Michael Davis)
│   ├── Marketing Department (Sub-tenant)
│   │   ├── E164 User: +14155551003 (Emily Wilson)
│   │   └── E164 User: +14155551004 (James Brown)
│   └── IT Department (Sub-tenant)
│       └── E164 User: +14155551005 (Lisa Anderson)
├── Company C2 (Sub-tenant)
│   ├── Operations Department (Sub-tenant)
│   │   ├── E164 User: +14155551006 (David Miller)
│   │   └── E164 User: +14155551007 (Jessica Taylor)
│   └── Finance Department (Sub-tenant)
│       └── E164 User: +14155551008 (Robert Garcia)
└── Company C3 (Sub-tenant)
    ├── Human Resources (Sub-tenant)
    │   ├── E164 User: +14155551009 (Amanda White)
    │   └── E164 User: +14155551010 (Christopher Lee)
    └── Legal Department (Sub-tenant)
```

## Role Permissions Matrix

| Permission | System Admin | Tenant Admin | E164 User |
|------------|-------------|-------------|-----------|
| **System Management** |
| Manage all tenants | ✅ | ❌ | ❌ |
| System settings | ✅ | ❌ | ❌ |
| **Sub-tenant Management** |
| View sub-tenants | ✅ | ✅ | ❌ |
| Create sub-tenants | ✅ | ✅ | ❌ |
| Edit sub-tenants | ✅ | ✅ | ❌ |
| Delete sub-tenants | ✅ | ✅ | ❌ |
| **User Management** |
| Manage sub-tenant users | ✅ | ✅ | ❌ |
| Monitor E164 messages | ✅ | ✅ | ❌ (own only) |
| **Entity Structure** |
| Manage entity hierarchy | ✅ | ✅ | ❌ |
| **WhatsApp Management** |
| Add WhatsApp accounts | ✅ | ✅ | ❌ |
| View all messages | ✅ | ✅ (tenant scope) | ❌ (own only) |

## Key Features for Tenant Administrators

### Sub-tenant Management
- **Create Companies**: Add new companies under their tenant
- **Create Departments**: Add departments under companies
- **Manage Structure**: Reorganize the elastic hierarchy as needed
- **User Assignment**: Assign E164 users to appropriate departments

### E164 User Monitoring
- **Message Tracking**: Monitor all WhatsApp messages from E164 users in their scope
- **Registration Management**: Track user registration status (pending, invited, registered, cancelled)
- **Connection Status**: Monitor WhatsApp connection status for each E164 user
- **Filtering**: Filter messages by entity path, user, time period, etc.

### User Lifecycle Management
- **User Creation**: Create new E164 users in their sub-tenants
- **Email Invitations**: Send QR code invitations to E164 users
- **Status Tracking**: Monitor registration and connection status
- **User Updates**: Update user information and assignments

## Technical Implementation

### Updated Permissions System
- Added `viewSubTenants`, `createSubTenant`, `editSubTenant`, `deleteSubTenant`
- Added `manageSubTenantUsers`, `monitorSubTenantMessages`
- Role-based access control with proper inheritance

### Enhanced Mock Data
- Updated user roles to reflect new structure
- Added sub-tenant management permissions
- Updated translations and UI labels

### Menu Structure
- **Entity Management**: Available to System Admin and Tenant Admin
  - Entity Structure: Manage elastic hierarchy
  - User Management: Manage E164 users
  - Registration Status: Track user registration states
- **Communications**: Available to all roles with appropriate scope
  - WhatsApp Monitoring: Monitor messages within role scope
  - Message Filtering: Advanced filtering capabilities

## Benefits of New Structure

### For System Administrators
- Complete system oversight
- Multi-tenant management
- System-wide monitoring capabilities

### For Tenant Administrators
- **Autonomous Management**: Full control over their tenant's structure
- **Scalable Organization**: Can create unlimited sub-tenants (companies/departments)
- **E164 Monitoring**: Monitor all users within their scope
- **User Lifecycle**: Complete user management from invitation to monitoring

### For E164 Users
- **Simple Interface**: Access only what they need
- **Privacy Protection**: Can only see their own messages
- **Easy Connection**: QR code-based WhatsApp connection
- **Profile Control**: Manage their own information

This role structure perfectly aligns with the client's elastic entity concept while providing clear separation of responsibilities and appropriate access controls for monitoring E164 users at scale.
