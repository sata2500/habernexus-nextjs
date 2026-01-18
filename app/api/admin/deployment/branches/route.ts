import { NextResponse } from 'next/server'
import { auth } from '@/auth'

interface GitHubBranch {
  name: string
  commit: {
    sha: string
    url: string
  }
  protected: boolean
}

/**
 * GET /api/admin/deployment/branches
 * Fetches branches from GitHub repository
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

    // Fetch branches
    const response = await fetch(
      `https://api.github.com/repos/${repoOwner}/${repoName}/branches?per_page=50`,
      { headers }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('GitHub branches error:', errorText)
      return NextResponse.json(
        { error: 'Failed to fetch branches from GitHub' },
        { status: response.status }
      )
    }

    const branches: GitHubBranch[] = await response.json()

    // Get default branch
    const repoResponse = await fetch(
      `https://api.github.com/repos/${repoOwner}/${repoName}`,
      { headers }
    )
    
    let defaultBranch = 'master'
    if (repoResponse.ok) {
      const repoData = await repoResponse.json()
      defaultBranch = repoData.default_branch
    }

    // Format branches
    const formattedBranches = branches.map(branch => ({
      name: branch.name,
      commitSha: branch.commit.sha,
      shortSha: branch.commit.sha.substring(0, 8),
      isProtected: branch.protected,
      isDefault: branch.name === defaultBranch,
    }))

    // Sort: default branch first, then alphabetically
    formattedBranches.sort((a, b) => {
      if (a.isDefault) return -1
      if (b.isDefault) return 1
      return a.name.localeCompare(b.name)
    })

    return NextResponse.json({
      success: true,
      data: {
        branches: formattedBranches,
        defaultBranch,
        repository: {
          owner: repoOwner,
          name: repoName,
        },
      },
    })
  } catch (error) {
    console.error('Branches fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch branches' },
      { status: 500 }
    )
  }
}
