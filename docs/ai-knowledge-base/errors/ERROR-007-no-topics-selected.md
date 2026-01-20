# ERROR-007: No Topics Selected for Content Generation

**Date:** 20 January 2026  
**Severity:** Medium  
**Status:** Resolved  
**Component:** Content Engine v3.0 - Trend Analyzer

---

## Error Message

```
Üretim Başarısız
Hatalar: No topics selected for content generation
```

---

## Root Cause Analysis

The error occurs in `lib/content-engine/trend-analyzer.ts` when the `analyzeTrends` function returns zero topics after the duplicate check process. This happens due to:

1. **Aggressive Duplicate Detection**: The original algorithm used substring matching (`titleLower.includes(existing) || existing.includes(titleLower)`) which was too strict and filtered out topics that were only partially similar.

2. **No Detailed Error Feedback**: The original error message was generic and didn't explain why no topics were selected.

3. **Missing Edge Case Handling**: The code didn't properly handle scenarios where:
   - RSS feeds return empty content
   - All topics are filtered as duplicates
   - No recent articles exist in the database

---

## Solution Applied

### 1. Improved Duplicate Detection Algorithm

Replaced the aggressive substring matching with a word-overlap similarity algorithm:

```typescript
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim()
  const s2 = str2.toLowerCase().trim()
  
  if (s1 === s2) return 1
  if (s1.length === 0 || s2.length === 0) return 0
  
  // Simple word overlap similarity
  const words1 = new Set(s1.split(/\s+/).filter(w => w.length > 3))
  const words2 = new Set(s2.split(/\s+/).filter(w => w.length > 3))
  
  if (words1.size === 0 || words2.size === 0) return 0
  
  let overlap = 0
  for (const word of words1) {
    if (words2.has(word)) overlap++
  }
  
  return overlap / Math.max(words1.size, words2.size)
}
```

- **Threshold**: 0.7 (70% similarity) instead of any substring match
- **Result**: More lenient duplicate detection that only filters truly similar content

### 2. Enhanced Error Messages

Added detailed, user-friendly error messages in Turkish:

- **Empty RSS feeds**: "RSS kaynaklarından hiç konu bulunamadı. Lütfen RSS feed'lerinizin aktif ve içerik içerdiğinden emin olun."
- **All duplicates**: "Tüm konular (X adet) son 7 gün içinde yayınlanan makalelerle benzer olduğu için filtrelendi. Yeni içerik için RSS kaynaklarının güncellenmesini bekleyin veya farklı RSS kaynakları ekleyin."

### 3. Type System Updates

- Added `error?: string` field to `TopicSelectionResult` interface
- Added `'debug'` level to `EngineLogEntry` type for detailed logging

---

## Files Modified

| File | Changes |
|------|---------|
| `lib/content-engine/trend-analyzer.ts` | Improved duplicate detection, added detailed error messages |
| `lib/content-engine/types.ts` | Added `error` field to `TopicSelectionResult`, added `debug` log level |
| `lib/content-engine/index.ts` | Updated error handling to use detailed messages |

---

## Prevention

1. **Monitor RSS Feed Health**: Regularly check if RSS feeds are returning content
2. **Adjust Similarity Threshold**: If too many duplicates are filtered, consider lowering the 0.7 threshold
3. **Add More RSS Sources**: Diversify content sources to reduce duplicate likelihood
4. **Review Duplicate Logs**: Check debug logs to understand why topics are being filtered

---

## Testing

After applying the fix:

1. Run `npx tsc --noEmit` - Should pass with no errors
2. Run `npm run lint` - Should pass (existing warnings are unrelated)
3. Run `npm run build` - Should complete successfully
4. Test content engine with various scenarios:
   - Empty database (no recent articles)
   - Database with some articles
   - RSS feeds with similar content

---

## Related Issues

- Content Engine v3.0 trend analysis
- RSS feed duplicate detection
- User feedback for content generation errors
