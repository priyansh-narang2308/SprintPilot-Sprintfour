# 🎯 Quick Start - Wireframes Feature

## What Was Built

A **complete, production-ready wireframing tool** integrated with your PRD system that allows users to:

- Generate wireframes from PRDs using AI
- Create wireframes from scratch
- Edit elements interactively on a canvas
- Manage wireframe library with real database persistence
- Responsive design for all devices

---

## 🚀 Getting Started

### Step 1: Apply Database Migration

Before using the feature, run this in your Supabase SQL editor:

```sql
-- Copy the contents of: supabase-schema/007_create_wireframes.sql
```

### Step 2: Ensure Workspace Selected

The feature requires an active workspace. Make sure to select one from PRD Builder first.

### Step 3: Create Your First Wireframe

**Option A: From a PRD (Recommended)**

1. Go to Wireframes page
2. Click "New Wireframe"
3. Enter title
4. Select a PRD from dropdown
5. Click "Generate Wireframe from PRD"
6. Let AI create the layout (5-15 seconds)
7. Review and edit as needed
8. Click "Create" to save

**Option B: Blank Wireframe**

1. Go to Wireframes page
2. Click "New Wireframe"
3. Enter title and description
4. Skip PRD selection
5. Click "Create"
6. Add elements manually using tools

---

## 🎨 Editor Features

### Tools Panel (Left/Top)

- **Select** - Select elements
- **Move** - Drag elements around canvas
- **Rectangle** - Add rectangular elements
- **Circle** - Add circular elements
- **Text** - Add text elements
- **Image** - Add image placeholders
- **Line** - Add line elements

### Canvas (Center)

- Zoom 50%-200%
- Drag elements with Move tool
- Click to select and edit
- Grid background for alignment
- Real-time updates

### Layers Panel (Right)

- View all elements
- Quick edit by clicking element
- Delete with trash icon
- Add new elements with "+" button

---

## 💾 Data Persistence

All wireframes are automatically saved to the `wireframes` table with:

- Workspace association (can't access other workspaces' wireframes)
- PRD reference (optional)
- Full element data as JSON
- Creation and update timestamps
- Draft status tracking

---

## 📱 Responsive Behavior

- **Mobile**: Tools stack at top, canvas full width below
- **Tablet**: Tools sidebar on left, canvas and layers beside
- **Desktop**: Full layout with all panels visible

All functionality works on all screen sizes!

---

## ⚙️ Technical Details

### Database Fields

```typescript
id: UUID (primary key)
workspace_id: UUID (required, cascade delete)
prd_id: UUID (optional, set null on delete)
title: TEXT (required)
description: TEXT (optional)
content: JSONB (wireframe elements array)
status: TEXT (default: 'draft')
created_at: TIMESTAMPTZ (auto)
updated_at: TIMESTAMPTZ (auto)
```

### Content Structure

```typescript
{
  elements: WireframeElement[],
  zoom: number,
  backgroundColor?: string,
  name?: string
}
```

### Element Structure

```typescript
{
  id: string (unique)
  type: 'rect' | 'circle' | 'text' | 'image' | 'line' | 'frame'
  x: number (pixel position)
  y: number (pixel position)
  width: number
  height: number
  label: string (description)
  color?: string (Tailwind class)
  content?: string (for text elements)
  opacity?: number (0-1)
  rotation?: number
}
```

---

## 🤖 AI Generation

When you select a PRD and click "Generate Wireframe from PRD":

1. **Analysis**: Gemini reads your PRD content
2. **Generation**: AI creates a complete wireframe structure with:

   - Header/Navigation area
   - Hero section
   - Main content areas
   - Feature sections
   - CTAs (Call-to-Action buttons)
   - Footer
   - Realistic sizing and positioning

3. **JSON Response**: Pure JSON with element data
4. **Display**: Wireframe loaded into canvas immediately
