# Unified Content Engine Development Plan

**Date:** 20 January 2026  
**Developer:** Salih TANRISEVEN (AI Agent)  
**Status:** Completed

---

## 1. Objective

İki ayrı içerik üretim sistemini (content-engine.ts ve advanced-content-engine.ts) tek bir birleşik, sağlam içerik üretim sistemi olarak birleştirmek.

---

## 2. Current State Analysis

### 2.1 Simple Content Engine (content-engine.ts)
- **Location:** `lib/content-engine.ts`
- **API Route:** `app/api/admin/content-engine/route.ts`
- **UI:** Admin dashboard "AI Çalıştır" button
- **Features:**
  - Direct RSS to article conversion
  - Basic AI content generation via Gemini
  - Image handling (AI generation, RSS optimization, placeholder)
  - Simple and fast approach

### 2.2 Advanced Content Engine (advanced-content-engine.ts)
- **Location:** `lib/advanced-content-engine.ts`
- **API Route:** `app/api/admin/advanced-content-engine/route.ts`
- **UI:** Dedicated "Gelişmiş İçerik Motoru" page
- **Features:**
  - 4-stage pipeline: Topic Selection → Research → Synthesis → Publishing
  - AI-powered topic scoring and selection
  - Deep web research with Gemini grounding
  - Quality scoring and filtering
  - More comprehensive content generation

### 2.3 Supporting Modules
- `lib/topic-selector.ts` - Topic selection and scoring
- `lib/research-agent.ts` - Web research using Gemini
- `lib/content-synthesizer.ts` - Article generation from research
- `lib/gemini.ts` - Basic Gemini integration
- `lib/imagen.ts` - Image generation
- `lib/image-optimizer.ts` - RSS image optimization

---

## 3. Unified System Design

### 3.1 Architecture
The unified system will:
1. Keep the advanced pipeline as the core engine
2. Add a "quick mode" option for simple/fast generation
3. Consolidate API endpoints
4. Update UI to provide unified access

### 3.2 Modes of Operation
- **Quick Mode:** Direct RSS to article (like old content-engine)
- **Standard Mode:** Full pipeline with research (default)
- **Preview Mode:** Topic selection only
- **Test Mode:** Single topic full pipeline

### 3.3 File Changes

#### Files to Modify:
1. `lib/unified-content-engine.ts` - New unified engine (replaces both)
2. `app/api/admin/content-engine/route.ts` - Updated API
3. `app/admin/page.tsx` - Updated dashboard button
4. `app/admin/components/ContentEngineButton.tsx` - Enhanced button
5. `app/admin/gelismis-icerik-motoru/page.tsx` - Redirect or remove

#### Files to Keep (Dependencies):
- `lib/topic-selector.ts`
- `lib/research-agent.ts`
- `lib/content-synthesizer.ts`
- `lib/gemini.ts`
- `lib/imagen.ts`
- `lib/image-optimizer.ts`

#### Files to Deprecate:
- `lib/content-engine.ts` - Replace with unified engine
- `lib/advanced-content-engine.ts` - Merge into unified engine
- `app/api/admin/advanced-content-engine/route.ts` - Merge into main API

---

## 4. Implementation Steps

### Step 1: Create Unified Content Engine
- Create `lib/unified-content-engine.ts`
- Implement both quick and standard modes
- Maintain backward compatibility

### Step 2: Update API Route
- Modify `app/api/admin/content-engine/route.ts`
- Add mode parameter support
- Support all actions (run, preview, test)

### Step 3: Update Admin Dashboard
- Enhance ContentEngineButton with mode selection
- Add quick access to different modes

### Step 4: Update/Remove Advanced Engine Page
- Either redirect to unified system or update to use unified API

### Step 5: Cleanup
- Remove deprecated files
- Update imports throughout codebase

---

## 5. Verification Checklist

After each step:
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` passes

---

## 6. Error Log

(To be filled during implementation)

---

## 7. Test Results

(To be filled after implementation)


---

## 8. Implementation Summary

### Files Created
- `lib/unified-content-engine.ts` - New unified content engine with multiple modes

### Files Modified
- `app/api/admin/content-engine/route.ts` - Updated to use unified engine
- `app/admin/page.tsx` - Updated dashboard with unified engine status
- `app/admin/components/ContentEngineButton.tsx` - Enhanced with mode selection
- `app/admin/gelismis-icerik-motoru/page.tsx` - Updated to use unified API
- `lib/scheduler.ts` - Updated to use unified engine

### Files Deprecated (moved to .deprecated/)
- `lib/content-engine.ts` - Old simple content engine
- `lib/advanced-content-engine.ts` - Old advanced content engine
- `app/api/admin/advanced-content-engine/` - Old advanced API route

---

## 9. Test Results

### TypeScript Compilation
- **Status:** ✅ PASSED
- **Command:** `npx tsc --noEmit`
- **Result:** No errors

### ESLint
- **Status:** ✅ PASSED (only pre-existing warnings)
- **Command:** `npm run lint`
- **Result:** 6 warnings (all pre-existing), 1 error (pre-existing in scripts/create-admin.js)

### Build
- **Status:** ✅ PASSED
- **Command:** `npm run build`
- **Result:** Build completed successfully

---

## 10. New Features

### Unified Content Engine Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| `quick` | Direct RSS to article conversion | Fast content generation without research |
| `standard` | Full pipeline with research | High-quality content with deep research |
| `preview` | Topic selection only | Preview topics before generation |
| `test` | Single topic full pipeline | Testing without publishing |

### API Endpoints

**GET /api/admin/content-engine**
- Returns unified engine status
- Includes diagnostics and configuration

**POST /api/admin/content-engine**
- Body: `{ mode: 'quick' | 'standard' | 'preview' | 'test', maxTopics?: number }`
- Triggers content generation in specified mode

### UI Improvements

1. **Dashboard AI Button**
   - Dropdown menu for mode selection
   - Quick access to both modes

2. **Advanced Content Engine Page**
   - Unified interface for all operations
   - Pipeline visualization
   - Mode comparison
   - Detailed results display

---

## 11. Migration Notes

The old API endpoints and functions are still available for backward compatibility:
- `processAllFeeds()` - Maps to quick mode
- `processFeed(feedId)` - Maps to quick mode with specific feed

The scheduler now uses the unified engine automatically.
