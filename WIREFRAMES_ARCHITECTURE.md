# 🎨 Wireframes Feature - Architecture & Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     WIREFRAMES PAGE (React)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Tools Panel  │  │ Canvas/Editor│  │ Layers Panel        │  │
│  │              │  │              │  │                      │  │
│  │ • Select     │  │ • Drag/Drop  │  │ • Element List      │  │
│  │ • Move       │  │ • Zoom       │  │ • Add/Delete        │  │
│  │ • Rectangle  │  │ • Edit Props │  │ • Quick Edit        │  │
│  │ • Circle     │  │ • Real-time  │  │ • Opacity Control   │  │
│  │ • Text       │  │   Updates    │  │                      │  │
│  │ • Image      │  │              │  │                      │  │
│  │ • Line       │  │              │  │                      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ New Wireframe Modal / Edit Element Modal / PRD Selector  │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Recent Wireframes List (clickable thumbnails)             │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       │ 1. Opens Wireframes Page
       ▼
┌──────────────────────────┐
│ fetchData()              │
├──────────────────────────┤
│ Fetch PRDs from DB       │
│ Fetch Wireframes from DB │
└──────────┬───────────────┘
           │
           ├─────────────────────────────────────────┐
           │                                         │
           ▼                                         ▼
    ┌─────────────────┐                  ┌──────────────────────┐
    │ PRDs Dropdown   │                  │ Recent Wireframes    │
    │ (Real PRDs)     │                  │ (Real from DB)       │
    └────────┬────────┘                  └──────────────────────┘
             │
             │ 2. User selects PRD
             ▼
    ┌──────────────────────────────────┐
    │ User clicks "Generate"           │
    └────────┬─────────────────────────┘
             │
             ▼
    ┌──────────────────────────────────┐
    │ generateWireframeFromPRD()        │
    │ (Calls Gemini API)               │
    ├──────────────────────────────────┤
    │ • Read PRD content               │
    │ • Analyze structure              │
    │ • Create element layout          │
    │ • Return JSON                    │
    └────────┬─────────────────────────┘
             │
             ▼
    ┌──────────────────────────────────┐
    │ Wireframe loaded on canvas       │
    │ (No DB save yet)                 │
    └────────┬─────────────────────────┘
             │
             │ 3. User edits wireframe
             ├─────────────────────────┐
             │                         │
             ▼                         ▼
         Add Element            Edit Element Props
         Move Element           Change Colors
         Delete Element         Update Position/Size
                               Adjust Opacity
             │                         │
             └─────────────────────────┘
                     │
                     │
                     ▼
            ┌──────────────────────┐
            │ User clicks "Save"   │
            └──────────┬───────────┘
                       │
                       ▼
            ┌──────────────────────────────────┐
            │ saveWireframe()                  │
            ├──────────────────────────────────┤
            │ IF new wireframe:                │
            │   INSERT into wireframes table   │
            │ ELSE:                            │
            │   UPDATE wireframes record       │
            └──────────┬───────────────────────┘
                       │
                       ▼
            ┌──────────────────────────────────┐
            │ Stored in Supabase DB            │
            │ • All elements saved as JSON     │
            │ • Timestamps updated             │
            │ • Workspace linked               │
            └──────────┬───────────────────────┘
                       │
                       ▼
            ┌──────────────────────────────────┐
            │ Toast: "Saved Successfully!"     │
            │ Recent wireframes updated        │
            └──────────────────────────────────┘
```

---

## Database Schema Relationship

```
┌─────────────────────────────────────────────────────────────┐
│                        workspaces                            │
├──────────────────────────────────────────────────────────────┤
│ id (UUID, PK)                                                │
│ user_id (FK -> auth.users)                                   │
│ name (TEXT)                                                  │
│ created_at (TIMESTAMPTZ)                                     │
└────────────────┬──────────────────┬──────────────────────────┘
                 │                  │
                 │ has many         │ has many
                 │                  │
                 ▼                  ▼
    ┌────────────────────┐   ┌──────────────────────────┐
    │       prds         │   │    wireframes (NEW!)     │
    ├────────────────────┤   ├──────────────────────────┤
    │ id (UUID, PK)      │   │ id (UUID, PK)            │
    │ workspace_id (FK)  │   │ workspace_id (FK) ◄─────┐│
    │ title (TEXT)       │   │ prd_id (FK) ──────┐     ││
    │ description (TEXT) │   │ title (TEXT)       │     ││
    │ content (TEXT)     │◄──┼─────────────────┐ │     ││
    │ created_at (TS)    │   │ description     │ │     ││
    └────────────────────┘   │ content (JSONB) │ │     ││
                             │ status (TEXT)   │ │     ││
                             │ created_at (TS) │ │     ││
                             │ updated_at (TS) │ │     ││
                             └──────────────────┘     ││
                                                      ││
        ┌───────────────────────────────────────────┘│
        │  Optional Link (PRD → Wireframe)            │
        │  Can create wireframes WITHOUT PRD          │
        └────────────────────────────────────────────┘
```

**Key Relationships:**

- `wireframes.workspace_id` → `workspaces.id` (required)
- `wireframes.prd_id` → `prds.id` (optional)
- Cascade delete: If workspace deleted, all wireframes deleted
- Set null: If PRD deleted, wireframe remains but prd_id becomes null

---

## Component Hierarchy

```
WireframesPage
├── Header Section
│   ├── Title
│   ├── Description
│   └── Action Buttons
│       ├── Refresh
│       └── New Wireframe
│
├── Main Content Area (Flex Row / Column responsive)
│   ├── Tools Panel
│   │   └── Tool Buttons (7 tools)
│   │
│   ├── Canvas Area
│   │   ├── Canvas Header
│   │   │   ├── Title & Status
│   │   │   ├── Zoom Controls
│   │   │   ├── Export Button
│   │   │   └── Save Button
│   │   │
│   │   └── Canvas
│   │       └── WireframeElements[]
│   │           ├── Drag & Drop Handler
│   │           ├── Click to Edit Handler
│   │           ├── Hover Effects
│   │           └── Delete Button
│   │
│   └── Layers Panel
│       ├── Panel Header
│       │   ├── Title
│       │   └── Add Button
│       │
│       └── Elements List
│           └── Element Item[]
│               ├── Label
│               ├── Click to Edit
│               └── Delete Button
│
├── Bottom: Recent Wireframes
│   └── Wireframe Cards[]
│       ├── Title
│       ├── Element Count
│       ├── Select Button
│       └── Delete Button
│
└── Modals
    ├── New Wireframe Dialog
    │   ├── Title Input
    │   ├── Description Textarea
    │   ├── PRD Selector
    │   ├── Generate Button (conditional)
    │   └── Create/Update Button
    │
    └── Edit Element Dialog
        ├── Label Input
        ├── Position Inputs (X, Y)
        ├── Size Inputs (Width, Height)
        ├── Color Selector
        ├── Opacity Slider
        └── Save Changes Button
```

---

## State Management

```
WireframesPage Component State:

├── UI State
│   ├── activeTool: string
│   ├── zoom: number (50-200)
│   ├── newWireframeModal: boolean
│   ├── editElementModal: boolean
│   ├── editingElement: WireframeElement | null
│   └── loading: boolean
│
├── Data State
│   ├── prds: PRD[]
│   ├── wireframes: Wireframe[]
│   ├── selectedWireframe: Wireframe | null
│   ├── selectedPRD: string
│   └── selectedWorkspace: Workspace | null
│
├── Form State
│   ├── wireframeTitle: string
│   ├── wireframeDescription: string
│   └── generating: boolean
│
└── Canvas State
    ├── draggingElement: WireframeElement | null
    ├── dragOffset: { x: number, y: number }
    └── canvasRef: React.Ref
```

---

## API Calls Sequence

```
1. Component Mount
   └─ fetchData()
      ├─ fetch PRDs from workspace
      └─ fetch Wireframes from workspace

2. User clicks "Generate"
   └─ handleGenerateWireframe()
      ├─ Call generateWireframeFromPRD(prdContent, prdTitle)
      │  └─ Calls Gemini API (generateContent)
      │     └─ Returns WireframeContent JSON
      └─ Sets selectedWireframe with generated content

3. User clicks "Save"
   └─ saveWireframe()
      └─ IF id exists:
         │  └─ UPDATE wireframes table
         └─ ELSE:
            └─ INSERT into wireframes table

4. User clicks "Delete"
   └─ deleteWireframe()
      ├─ Show confirmation dialog
      └─ DELETE from wireframes table

5. Any data change
   └─ fetchData() (refresh list)
```

---

## Type Definitions

```typescript
// From geiminiApi.ts
interface WireframeElement {
  id: string;
  type: "rect" | "circle" | "text" | "image" | "line" | "frame";
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  color?: string;
  content?: string;
  rotation?: number;
  opacity?: number;
}

interface WireframeContent {
  elements: WireframeElement[];
  zoom: number;
  backgroundColor?: string;
  name?: string;
}

// From wireframes-page.tsx
type PRD = {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  created_at?: string | null;
};

type Wireframe = {
  id: string;
  workspace_id: string;
  prd_id: string | null;
  title: string;
  description: string | null;
  content: WireframeContent;
  status: string;
  created_at?: string;
  updated_at?: string;
};
```

---

## Error Handling Flow

```
User Action
    │
    ├─ Try {
    │  ├─ API Call / DB Operation
    │  │  ├─ Success
    │  │  │  └─ Toast: "Success message"
    │  │  │
    │  │  └─ Fail
    │  │     └─ Throw Error
    │  │
    │  └─ Update UI State
    │
    └─ Catch {
       ├─ Log to console
       ├─ Toast: "Error message"
       └─ Show user-friendly message
```

---

## Mobile Responsiveness

```
MOBILE (< 768px)
┌─────────────────────────────────────┐
│ Header                              │
├─────────────────────────────────────┤
│ Tools (horizontal scrollable)       │
├─────────────────────────────────────┤
│ Canvas (full width)                 │
│ (scrollable)                        │
├─────────────────────────────────────┤
│ Layers Panel (visible but narrow)   │
├─────────────────────────────────────┤
│ Recent Wireframes (grid)            │
└─────────────────────────────────────┘

TABLET (768px - 1024px)
┌────────────────────────────────────┐
│ Header                             │
├────────────────────────────────────┤
│ Tools    │  Canvas      │ Layers  │
│ (vert)   │              │ Panel   │
│          │  (scrollable)│         │
│          │              │         │
├────────────────────────────────────┤
│ Recent Wireframes (grid)           │
└────────────────────────────────────┘

DESKTOP (> 1024px)
┌────────────────────────────────────────────────┐
│ Header                                         │
├────────────────────────────────────────────────┤
│ Tools │ Canvas Section          │ Layers     │
│       │ • Header                │ • Elements │
│ •Sel  │ • Canvas (large)        │ • Add Btn  │
│ •Move │ • Zoom Controls         │ • Edit    │
│ •Rect │                          │           │
│ •Circ │                          │           │
│ •Text │                          │           │
│ •Img  │                          │           │
│ •Line │                          │           │
├────────────────────────────────────────────────┤
│ Recent Wireframes (horizontal scrollable)     │
└────────────────────────────────────────────────┘
```

---

## Key Features Implementation

### 1. AI Generation

- **File**: `src/lib/geiminiApi.ts`
- **Function**: `generateWireframeFromPRD()`
- **Input**: PRD content + title
- **Output**: WireframeContent with elements array
- **Model**: Gemini 2.0 Flash

### 2. Element Editing

- **Click** on element → Opens edit modal
- **Drag** with Move tool → Updates X/Y position
- **Edit Modal** → Adjust all properties
- **Delete** → Remove from elements array

### 3. Canvas Rendering

- **1280px × 800px** default size
- **Zoom** affects scale transform
- **Grid background** for alignment
- **Real-time** position updates

### 4. Database Persistence

- **JSONB** storage for flexibility
- **Workspace isolation** via foreign key
- **Timestamps** auto-managed via trigger
- **Cascade delete** for data integrity

---

## Performance Considerations

```
Optimization Strategy:

1. Lazy Loading
   └─ Load wireframes only when workspace selected

2. State Batching
   └─ Batch multiple element updates

3. Query Optimization
   └─ Use indexed columns (workspace_id, prd_id)

4. JSONB Efficiency
   └─ Store all elements as single JSON field

5. Responsive Rendering
   └─ Minimal re-renders with smart state updates

6. Modal Performance
   └─ Dialog components lazy-loaded
```

---

This architecture ensures:

- ✅ **Scalability**: Can handle many wireframes per workspace
- ✅ **Performance**: Optimized queries and state management
- ✅ **Maintainability**: Clear component hierarchy and separation of concerns
- ✅ **Responsiveness**: Works on all device sizes
- ✅ **Reliability**: Comprehensive error handling
- ✅ **Type Safety**: Full TypeScript coverage
