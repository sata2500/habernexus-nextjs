import { NextResponse } from 'next/server'
import { auth } from '@/auth'

interface GitHubRelease {
  id: number
  tag_name: string
  name: string
  body: string
  draft: boolean
  prerelease: boolean
  created_at: string
  published_at: string
  html_url: string
  author: {
    login: string
    avatar_url: string
  }
}

interface GitHubTag {
  name: string
  commit: {
    sha: string
    url: string
  }
}

/**
 * GET /api/admin/deployment/releases
 * Fetches releases and tags from GitHub repository
 */
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const githubToken = process.env.GITHUB_PAT
    const repoOwner = process.env.GITHUB_REPO_OWNER || 'sata2500'
    const repoName = process.env.GITHUB_REPO_NAME || 'habernexus-nextjs'

    if (!githubToken) {
      return NextResponse.json(
        { error: 'GitHub PAT not configured' },
        { status: 500 }
      )
    }

    const headers = {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${githubToken}`,
      'X-GitHub-Api-Version': '2022-11-28',
    }

    // Fetch releases
    const releasesResponse = await fetch(
      `https://api.github.com/repos/${repoOwner}/${repoName}/releases?per_page=50`,
      { headers }
    )

    if (!releasesResponse.ok) {
      const errorText = await releasesResponse.text()
      console.error('GitHub releases error:', errorText)
      return NextResponse.json(
        { error: 'Failed to fetch releases from GitHub' },
        { status: releasesResponse.status }
      )
    }

    const releases: GitHubRelease[] = await releasesResponse.json()

    // Fetch tags (for releases that might not have a formal release)
    const tagsResponse = await fetch(
      `https://api.github.com/repos/${repoOwner}/${repoName}/tags?per_page=50`,
      { headers }
    )

    let tags: GitHubTag[] = []
    if (tagsResponse.ok) {
      tags = await tagsResponse.json()
    }

    // Get latest release
    let latestRelease = null
    try {
      const latestResponse = await fetch(
        `https://api.github.com/repos/${repoOwner}/${repoName}/releases/latest`,
        { headers }
      )
      if (latestResponse.ok) {
        latestRelease = await latestResponse.json()
      }
    } catch {
      // No latest release
    }

    // Format releases
    const formattedReleases = releases.map(release => ({
      id: release.id,
      tagName: release.tag_name,
      name: release.name || release.tag_name,
      description: release.body,
      isDraft: release.draft,
      isPrerelease: release.prerelease,
      createdAt: release.created_at,
      publishedAt: release.published_at,
      htmlUrl: release.html_url,
      author: {
        login: release.author.login,
        avatarUrl: release.author.avatar_url,
      },
    }))

    // Format tags (only those not in releases)
    const releaseTagNames = new Set(releases.map(r => r.tag_name))
    const additionalTags = tags
      .filter(tag => !releaseTagNames.has(tag.name))
      .map(tag => ({
        name: tag.name,
        commitSha: tag.commit.sha,
        shortSha: tag.commit.sha.substring(0, 8),
      }))

    return NextResponse.json({
      success: true,
      data: {
        releases: formattedReleases,
        tags: additionalTags,
        latestRelease: latestRelease ? {
          tagName: latestRelease.tag_name,
          name: latestRelease.name,
          publishedAt: latestRelease.published_at,
        } : null,
        repository: {
          owner: repoOwner,
          name: repoName,
        },
      },
    })
  } catch (error) {
    console.error('Releases fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch releases' },
      { status: 500 }
    )
  }
}
