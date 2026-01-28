# AI Model Selection Enhancement Plan

**Version:** 1.0  
**Date:** 28 January 2026  
**Status:** In Progress  
**Priority:** High

---

## Executive Summary

This document outlines the comprehensive enhancement of the HaberNexus AI model selection system. The goal is to implement a fully functional, user-configurable AI model selection interface in the admin panel that allows administrators to:

1. **Dynamically select AI models** for content generation, image generation, and summary creation
2. **Manage prompts** for each AI operation type (content, image, summary)
3. **Verify model usage** to ensure selected models are actually being used
4. **Research and integrate** the latest Google AI models (Gemini 3.0 series)

---

## Current State Analysis

### Existing Infrastructure ✓

| Component | Status | Details |
|-----------|--------|---------|
| **Gemini Models Config** | ✓ Complete | `lib/gemini-models.ts` - Well-structured model definitions |
| **Model Selection API** | ✓ Partial | `app/api/admin/content-engine/route.ts` - Fetches models but limited |
| **Admin UI** | ✓ Partial | `app/admin/content-engine/page.tsx` - Shows settings but incomplete |
| **Prompt Management** | ✓ Partial | `app/admin/promptlar/page.tsx` - Exists but needs enhancement |
| **Database Schema** | ✓ Complete | `SystemSetting` and `PromptTemplate` models ready |
| **Gemini Integration** | ✓ Partial | `lib/gemini.ts` - Uses configured models but needs verification |

### Identified Gaps

1. **Model Selection UI**: Admin panel doesn't fully expose model selection for image generation
2. **Prompt Management**: Prompt UI exists but needs better integration with model selection
3. **Model Verification**: No verification that selected models are actually being used
4. **Google AI Research**: Need to research latest Gemini 3.0 models and best practices
5. **Image Model Integration**: Image generation models need better configuration

---

## Research Findings

### Latest Google AI Models (January 2026)

**Gemini 3.0 Series (Latest)**
- `gemini-3-pro`: Most intelligent, multimodal, best for complex reasoning
- `gemini-3-flash`: Balanced speed and intelligence, recommended for scalable tasks

**Gemini 2.5 Series (Stable & Recommended)**
- `gemini-2.5-flash`: Best price-performance ratio
- `gemini-2.5-flash-lite`: Ultra-fast for high-volume simple tasks
- `gemini-2.5-pro`: Advanced thinking model for complex analysis

**Current Implementation**
- Models are already defined in `lib/gemini-models.ts`
- Configuration system uses `SystemSetting` table with keys like `ai_model_content`
- Prompts are stored in `PromptTemplate` table with type-based organization

---

## Development Goals

### Phase 1: Research & Verification (Current)
- [x] Analyze existing code structure
- [x] Verify database schema
- [x] Research latest Google AI models
- [ ] Verify current model usage in content generation
- [ ] Verify current model usage in image generation
- [ ] Test prompt interpolation system

### Phase 2: Enhancement Implementation
- [ ] Enhance admin UI for model selection (content, image, summary)
- [ ] Verify selected models are actually used in all operations
- [ ] Implement prompt management UI improvements
- [ ] Add model verification endpoints
- [ ] Test all model switching scenarios

### Phase 3: Testing & Validation
- [ ] Unit tests for model selection
- [ ] Integration tests for content generation
- [ ] Integration tests for image generation
- [ ] Integration tests for summary generation
- [ ] Manual testing with different model combinations

### Phase 4: Documentation & Deployment
- [ ] Update ROADMAP.md
- [ ] Document model selection workflow
- [ ] Create user guide for admin panel
- [ ] Deploy to production

---

## Step-by-Step Implementation

### Micro-Step 1: Verify Current Model Usage in Content Generation
**Files to modify:** `lib/gemini.ts`  
**Estimated time:** 10 minutes  
**Success criteria:** Confirm that `getConfiguredModel()` is working correctly

```bash
# Verification commands
npx tsc --noEmit
npm run lint
npm run build
```

**Tasks:**
1. Review `generateArticle()` function to ensure it uses `getConfiguredModel('content')`
2. Add console logging to verify model selection
3. Test with different configured models

---

### Micro-Step 2: Verify Current Model Usage in Image Generation
**Files to modify:** `lib/gemini.ts` (image generation functions)  
**Estimated time:** 10 minutes  
**Success criteria:** Confirm image generation uses selected model

```bash
npx tsc --noEmit
npm run lint
npm run build
```

**Tasks:**
1. Find image generation functions in `lib/gemini.ts`
2. Verify they use `getConfiguredModel('image')` or similar
3. Add logging for verification

---

### Micro-Step 3: Verify Current Model Usage in Summary Generation
**Files to modify:** `components/articles/AISummary.tsx`  
**Estimated time:** 10 minutes  
**Success criteria:** Confirm summary generation uses selected model

```bash
npx tsc --noEmit
npm run lint
npm run build
```

**Tasks:**
1. Review summary generation API calls
2. Verify model selection is passed correctly
3. Add logging for verification

---

### Micro-Step 4: Enhance Admin UI - Model Selection Section
**Files to modify:** `app/admin/content-engine/page.tsx`  
**Estimated time:** 20 minutes  
**Success criteria:** UI shows all available models with proper categorization

```bash
npx tsc --noEmit
npm run lint
npm run build
```

**Tasks:**
1. Add model selection dropdowns for:
   - Content generation model
   - Image generation model
   - Summary generation model
2. Group models by series (Gemini 3, Gemini 2.5)
3. Show model badges (Recommended, New, Pro, Lite)
4. Add descriptions for each model

---

### Micro-Step 5: Enhance Admin UI - Prompt Management Section
**Files to modify:** `app/admin/promptlar/page.tsx`  
**Estimated time:** 20 minutes  
**Success criteria:** Prompt UI clearly shows which model will use each prompt

```bash
npx tsc --noEmit
npm run lint
npm run build
```

**Tasks:**
1. Add model selection indicator to each prompt
2. Show prompt variables clearly
3. Add prompt preview
4. Improve save/reset functionality

---

### Micro-Step 6: Add Model Verification Endpoint
**Files to modify:** `app/api/admin/content-engine/route.ts`  
**Estimated time:** 15 minutes  
**Success criteria:** New endpoint returns current model configuration

```bash
npx tsc --noEmit
npm run lint
npm run build
```

**Tasks:**
1. Add new GET endpoint: `/api/admin/content-engine/verify-models`
2. Return current model configuration for all use cases
3. Include model details (name, tier, capabilities)

---

### Micro-Step 7: Add Model Usage Verification
**Files to modify:** `lib/gemini.ts`  
**Estimated time:** 15 minutes  
**Success criteria:** Functions log which model is being used

```bash
npx tsc --noEmit
npm run lint
npm run build
```

**Tasks:**
1. Add `verifyModelUsage()` function
2. Log model selection before API calls
3. Return model info with results

---

### Micro-Step 8: Update Content Engine Settings API
**Files to modify:** `app/api/admin/content-engine/route.ts`  
**Estimated time:** 15 minutes  
**Success criteria:** PUT endpoint properly saves model selection

```bash
npx tsc --noEmit
npm run lint
npm run build
```

**Tasks:**
1. Verify PUT endpoint saves `ai_model_content`, `ai_model_image`, `ai_model_summary`
2. Add validation for model IDs
3. Add error handling

---

### Micro-Step 9: Integration Testing
**Files to modify:** Test files (new)  
**Estimated time:** 20 minutes  
**Success criteria:** All tests pass

```bash
npm run test
npm run build
```

**Tasks:**
1. Create test for model selection
2. Create test for model switching
3. Create test for prompt usage

---

### Micro-Step 10: Documentation & Cleanup
**Files to modify:** `ROADMAP.md`, knowledge base  
**Estimated time:** 15 minutes  
**Success criteria:** All documentation updated

```bash
# No code changes, just documentation
```

**Tasks:**
1. Update ROADMAP.md with completion status
2. Add learnings to knowledge base
3. Document any issues encountered

---

## Success Criteria

### Functional Requirements
- [ ] Admin can select different AI models for content generation
- [ ] Admin can select different AI models for image generation
- [ ] Admin can select different AI models for summary generation
- [ ] Selected models are actually used in all operations
- [ ] Prompts can be customized per operation type
- [ ] Model switching works without restarting the application
- [ ] System falls back to defaults if model selection is invalid

### Non-Functional Requirements
- [ ] All TypeScript checks pass (`npx tsc --noEmit`)
- [ ] All ESLint checks pass (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] No console errors in development
- [ ] Response times acceptable (< 5 seconds for model selection)

### Testing Requirements
- [ ] Manual testing with different model combinations
- [ ] Verify content generation with each model
- [ ] Verify image generation with each model
- [ ] Verify summary generation with each model
- [ ] Test model switching mid-operation

---

## Known Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Model API changes | High | Monitor Google AI docs, maintain version info in code |
| Breaking changes in Gemini API | High | Keep fallback models, test regularly |
| Database migration issues | Medium | Test migrations in dev first |
| Performance degradation | Medium | Monitor API response times |

---

## Timeline

| Phase | Duration | Start | End |
|-------|----------|-------|-----|
| Research & Analysis | 2 hours | Jan 28 | Jan 28 |
| Implementation | 4 hours | Jan 28 | Jan 28 |
| Testing | 2 hours | Jan 28 | Jan 28 |
| Documentation | 1 hour | Jan 28 | Jan 28 |
| **Total** | **9 hours** | Jan 28 | Jan 28 |

---

## References

- [Google Gemini API Documentation](https://ai.google.dev/)
- [Gemini Models Guide](https://ai.google.dev/gemini-api/docs/models/gemini)
- [Current Implementation: lib/gemini-models.ts](../../../lib/gemini-models.ts)
- [Current Implementation: lib/gemini.ts](../../../lib/gemini.ts)

---

## Sign-Off

**AI Agent:** Manus  
**Task ID:** AI_MODEL_SELECTION_ENHANCEMENT  
**Status:** In Progress  
**Last Updated:** 28 January 2026
