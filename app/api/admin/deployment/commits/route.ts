import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

interface GitHubCommit {
  sha: string
  commit: {
    message: string
    author: {
      name: string
      email: string
      date: string
    }
  }
  html_url: string
  author: {
    login: string
    avatar_url: string
  } | null
}

/**
 * GET /api/admin/deployment/commits
 * Fetches recent commits from GitHub repository
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const branch = searchParams.get('branch') || 'master'
    const perPage = parseInt(searchParams.get('per_page') || '30')

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

    // Fetch commits
    const response = await fetch(
      `https://api.github.com/repos/${repoOwner}/${repoName}/commits?sha=${branch}&per_page=${perPage}`,
      { headers }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('GitHub commits error:', errorText)
      return NextResponse.json(
        { error: 'Failed to fetch commits from GitHub' },
        { status: response.status }
      )
    }

    const commits: GitHubCommit[] = await response.json()

    // Format commits
    const formattedCommits = commits.map(commit => ({
      sha: commit.sha,
      shortSha: commit.sha.substring(0, 8),
      message: commit.commit.message.split('\n')[0], // First line only
      fullMessage: commit.commit.message,
      author: {
        name: commit.commit.author.name,
        email: commit.commit.author.email,
        login: commit.author?.login || null,
        avatarUrl: commit.author?.avatar_url || null,
      },
      date: commit.commit.author.date,
      htmlUrl: commit.html_url,
    }))

    return NextResponse.json({
      success: true,
      data: {
        commits: formattedCommits,
        branch,
        repository: {
          owner: repoOwner,
          name: repoName,
        },
      },
    })
  } catch (error) {
    console.error('Commits fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch commits' },
      { status: 500 }
    )
  }
}
