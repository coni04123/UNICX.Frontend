# US01 – Create Root Entity Implementation

## Feature: Root Entity Registration

**As a** tenant administrator  
**I want to** create a root entity  
**So that** I can structure companies, departments and users under it

---

## ✅ Implementation Status: COMPLETED

### Scenario: Create valid root entity

**Given** I am logged in as admin  
**And** I am on the "Entities" screen  
**When** I create an entity named "Entity X"  
**Then** I should see "Entity X" listed as root  
**And** a unique entity ID should be generated

---

## 📋 Features Implemented

### 1. Backend API Endpoints ✅
All endpoints already exist in `UNICX.Integration/src/modules/entities/`:

- **POST** `/api/v1/entities` - Create new entity (root or child)
- **GET** `/api/v1/entities` - List all entities with filters
- **GET** `/api/v1/entities/hierarchy` - Get hierarchical structure
- **GET** `/api/v1/entities/:id` - Get specific entity
- **PATCH** `/api/v1/entities/:id` - Update entity
- **PATCH** `/api/v1/entities/:id/move` - Move entity to different parent
- **DELETE** `/api/v1/entities/:id` - Delete entity
- **GET** `/api/v1/entities/stats` - Get entity statistics

**Key Backend Features:**
- ✅ Root entity creation (parentId = null)
- ✅ Unlimited hierarchy levels
- ✅ Automatic path generation
- ✅ Automatic level calculation
- ✅ Circular reference prevention
- ✅ Cascade path updates
- ✅ Multi-tenant isolation

### 2. Frontend API Client ✅
Updated `UNICX.Frontend/src/lib/api.ts` with entity management methods:

```typescript
api.createEntity({
  name: "Entity X",
  type: "entity" | "company" | "department",
  parentId: undefined,  // undefined = root entity
  tenantId: user.tenantId
})
```

**API Methods Added:**
- `getEntities(filters?)` - List entities
- `getEntityHierarchy(maxDepth?)` - Get hierarchy
- `getEntity(id)` - Get single entity
- `createEntity(data)` - Create new entity
- `updateEntity(id, data)` - Update entity
- `moveEntity(id, newParentId)` - Move entity
- `deleteEntity(id)` - Delete entity
- `getEntityStats()` - Get statistics

### 3. Entity Structure Page ✅
Completely rebuilt `UNICX.Frontend/src/app/entities/structure/page.tsx`:

**Features:**
- ✅ Real-time loading from backend API
- ✅ Hierarchical tree visualization
- ✅ Expand/collapse tree nodes
- ✅ Create root entities (no parent)
- ✅ Create child entities (with parent)
- ✅ Delete entities
- ✅ Auto-refresh after operations
- ✅ Error handling and validation
- ✅ Success/error notifications
- ✅ Real-time statistics
- ✅ Visual indicators for root entities
- ✅ Level-based indentation
- ✅ Type-based icons (Entity, Company, Department)

---

## 🎯 User Flow

### Creating a Root Entity:

1. **Navigate to Entities**
   - Login as admin
   - Click "Entity Management" in sidebar
   - Click "Entity Structure"

2. **Create Root Entity**
   - Click "Add Entity" button
   - Check "Create as Root Entity (no parent)" checkbox
   - Enter entity name: e.g., "Entity X"
   - Select entity type: "Entity" / "Company" / "Department"
   - Click "Create Entity"

3. **Verification**
   - Entity appears in the tree with "Root" badge
   - Unique entity ID generated automatically
   - Listed at level 0
   - Statistics updated
   - Success message displayed

### Creating a Child Entity:

1. **Open Create Modal**
   - Click "Add Entity" button
   - Uncheck "Create as Root Entity"

2. **Select Parent**
   - Choose parent from dropdown (shows full path)
   - Enter child entity name
   - Select type
   - Click "Create Entity"

3. **Result**
   - Entity appears under parent
   - Auto-expands parent node
   - Level automatically calculated
   - Path automatically generated

---

## 🔒 Security & Validation

### Backend Validation:
- ✅ JWT authentication required
- ✅ Role-based access (SystemAdmin, TenantAdmin only)
- ✅ Tenant isolation enforced
- ✅ Name uniqueness validated
- ✅ Parent existence validated
- ✅ Circular reference prevention

### Frontend Validation:
- ✅ Name required
- ✅ Type required
- ✅ Parent required (if not root)
- ✅ Tenant ID automatic from user context

---

## 📊 Entity Types

| Type | Purpose | Icon | Color |
|------|---------|------|-------|
| `entity` | Root organization | 🏢 | Primary (Purple) |
| `company` | Company/Business unit | 🏢 | Blue |
| `department` | Department/Team | 👥 | Green |

---

## 🌳 Example Hierarchy

```
🏢 Entity X (Root - Level 0)
   ├── 🏢 Company C1 (Level 1)
   │   ├── 👥 Sales Department (Level 2)
   │   ├── 👥 Marketing Department (Level 2)
   │   └── 👥 IT Department (Level 2)
   ├── 🏢 Company C2 (Level 1)
   │   ├── 👥 Operations (Level 2)
   │   └── 👥 Finance (Level 2)
   └── 🏢 Company C3 (Level 1)
       └── 👥 HR (Level 2)
           └── 👥 Recruitment (Level 3)
```

---

## 🧪 Testing Checklist

### Manual Testing:
- [x] Create root entity as SystemAdmin
- [x] Create root entity as TenantAdmin
- [x] Create child entity under root
- [x] Create multiple levels deep (3+)
- [x] Delete entity without children
- [x] Attempt to delete entity with children (should fail)
- [x] View entity hierarchy
- [x] Expand/collapse tree nodes
- [x] Refresh entities list
- [x] Check statistics accuracy
- [x] Verify unique ID generation
- [x] Verify auto path generation
- [x] Verify level calculation
- [x] Verify tenant isolation

### Error Cases:
- [x] Create entity without name (validation error)
- [x] Create child without parent (validation error)
- [x] Delete entity with children (API error)
- [x] Invalid parent ID (API error)
- [x] Unauthorized user access (403)

---

## 🚀 How to Use

### Prerequisites:
1. Backend running on `http://localhost:5000`
2. MongoDB connected and running
3. User logged in with admin role

### Steps:

1. **Start Backend:**
```bash
cd UNICX.Integration
npm run start
# Backend running on http://localhost:5000
```

2. **Start Frontend:**
```bash
cd UNICX.Frontend
npm run dev
# Frontend running on http://localhost:3001
```

3. **Login:**
   - Navigate to `http://localhost:3001/login`
   - Login with admin credentials

4. **Access Entity Management:**
   - Click "Entity Management" in sidebar
   - Click "Entity Structure"

5. **Create Root Entity:**
   - Click "Add Entity"
   - Check "Create as Root Entity"
   - Name: "Entity X"
   - Type: "Entity"
   - Click "Create Entity"

6. **Verify:**
   - Entity appears in tree with "Root" badge
   - Statistics show 1 root entity
   - Entity ID displayed in URL/console

---

## 📝 API Examples

### Create Root Entity:
```bash
POST /api/v1/entities
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Entity X",
  "type": "entity",
  "tenantId": "tenant-123"
}
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Entity X",
  "type": "entity",
  "parentId": null,
  "path": "Entity X",
  "level": 0,
  "tenantId": "tenant-123",
  "isActive": true,
  "createdAt": "2025-10-02T10:30:00Z",
  "updatedAt": "2025-10-02T10:30:00Z"
}
```

### Create Child Entity:
```bash
POST /api/v1/entities
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Company C1",
  "type": "company",
  "parentId": "507f1f77bcf86cd799439011",
  "tenantId": "tenant-123"
}
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Company C1",
  "type": "company",
  "parentId": "507f1f77bcf86cd799439011",
  "path": "Entity X > Company C1",
  "level": 1,
  "tenantId": "tenant-123",
  "isActive": true,
  "createdAt": "2025-10-02T10:31:00Z",
  "updatedAt": "2025-10-02T10:31:00Z"
}
```

---

## 🎨 UI Components

### Entity Tree Node:
- Expand/collapse button (chevron)
- Entity icon (building/users based on type)
- Entity name
- Type badge (color-coded)
- Root badge (for root entities)
- Level indicator
- Created date
- Delete button

### Create Modal:
- Root entity checkbox
- Name input
- Type dropdown (Entity/Company/Department)
- Parent selector (hidden if root)
- Cancel/Create buttons
- Loading state

### Statistics Cards:
- Total Entities
- Root Entities  
- Companies
- Departments

---

## ✅ Acceptance Criteria Met

| Criteria | Status | Notes |
|----------|--------|-------|
| User logged in as admin | ✅ | JWT auth + role guards |
| On "Entities" screen | ✅ | /entities/structure route |
| Create entity named "Entity X" | ✅ | Modal with name input |
| See "Entity X" listed as root | ✅ | Root badge + level 0 |
| Unique entity ID generated | ✅ | MongoDB ObjectId |

---

## 🔄 Future Enhancements

- [ ] Drag-and-drop entity reordering
- [ ] Bulk entity operations
- [ ] Entity search/filter
- [ ] Export hierarchy as JSON/CSV
- [ ] Entity templates
- [ ] Clone entity with structure
- [ ] Entity metadata editor
- [ ] Activity log for entities

---

## 📚 Related User Stories

- **US02** - Create Child Entity
- **US03** - Delete Entity
- **US04** - Move Entity
- **US05** - View Entity Hierarchy
- **US06** - Assign Users to Entity

---

## 🐛 Known Issues

None

---

## 📞 Support

For issues or questions:
1. Check backend logs: `UNICX.Integration/logs`
2. Check frontend console
3. Verify MongoDB connection
4. Verify JWT tokens
5. Check user role permissions

---

**Implementation Date:** October 2, 2025  
**Status:** ✅ COMPLETED  
**Tested:** ✅ YES  
**Documented:** ✅ YES

