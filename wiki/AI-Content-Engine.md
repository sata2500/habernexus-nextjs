# AI Content Engine

This page provides a detailed overview of the AI Content Engine, the core of HaberNexus's automated content generation pipeline.

## 1. Overview

The AI Content Engine is responsible for:

- Fetching new articles from RSS feeds.
- Extracting the full content of each article.
- Using Google Gemini to generate a new, unique article.
- Generating a relevant image for the new article.
- Storing the new article and image in the database.

## 2. Technologies Used

| Technology | Purpose |
|---|---|
| **`node-cron`** | Schedules the content fetching process to run periodically. |
| **Google Gemini API** | Powers the content analysis, generation, and image creation. |
| **Prisma** | Stores the generated articles and image paths in the SQLite database. |

## 3. Process Flow

1.  **Scheduled Task (`node-cron`):** A cron job, configured in the admin panel, triggers the content fetching process periodically.
2.  **RSS Fetching:** The system fetches new entries from all registered RSS feeds.
3.  **Content Extraction:** For each new entry, the full article content is extracted from the source URL.
4.  **AI Processing (Gemini):**
    *   The content is analyzed to determine its category and relevance.
    *   A new, unique article is generated based on the source content.
    *   A relevant image is generated for the new article.
5.  **Data Storage (SQLite/Prisma):** The new article, its category, and the path to the generated image are saved to the SQLite database.
6.  **Image Storage:** The generated image is optimized and saved to the `public/media/` directory on the local filesystem.

## 4. Future Enhancements

- **Video Summarization:** Use Gemini to generate video summaries from source URLs.
- **Audio Generation:** Use Gemini to generate audio versions of articles.
- **Multi-language Support:** Translate articles into multiple languages.
