import { NextRequest, NextResponse } from 'next/server';
import { deployToGitHub, getRecentCommits, rollbackToCommit } from '@/lib/github-deployer';
import { canModifyFile } from '@/lib/file-safety';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, files, message, commitSha } = body;

    // Handle different actions
    switch (action) {
      case 'deploy': {
        if (!files || !Array.isArray(files) || files.length === 0) {
          return NextResponse.json(
            { error: 'Files array is required for deployment' },
            { status: 400 }
          );
        }

        if (!message) {
          return NextResponse.json(
            { error: 'Commit message is required' },
            { status: 400 }
          );
        }

        // Validate all files before deploying
        const invalidFiles = [];
        for (const file of files) {
          const safetyCheck = canModifyFile(file.path);
          if (!safetyCheck.allowed) {
            invalidFiles.push({
              path: file.path,
              reason: safetyCheck.reason,
            });
          }
        }

        if (invalidFiles.length > 0) {
          return NextResponse.json(
            {
              error: 'Some files cannot be deployed',
              invalidFiles,
            },
            { status: 400 }
          );
        }

        // Deploy to GitHub
        const result = await deployToGitHub(files, message);

        if (result.success) {
          return NextResponse.json({
            success: true,
            message: 'Deployment successful! Vercel will deploy your changes shortly.',
            commitSha: result.commitSha,
            commitUrl: result.commitUrl,
          });
        } else {
          return NextResponse.json(
            {
              error: result.error || 'Deployment failed',
            },
            { status: 500 }
          );
        }
      }

      case 'rollback': {
        if (!commitSha) {
          return NextResponse.json(
            { error: 'Commit SHA is required for rollback' },
            { status: 400 }
          );
        }

        const result = await rollbackToCommit(commitSha);

        if (result.success) {
          return NextResponse.json({
            success: true,
            message: 'Rollback successful!',
            commitSha: result.commitSha,
            commitUrl: result.commitUrl,
          });
        } else {
          return NextResponse.json(
            {
              error: result.error || 'Rollback failed',
            },
            { status: 500 }
          );
        }
      }

      case 'history': {
        const commits = await getRecentCommits(10);
        return NextResponse.json({
          success: true,
          commits,
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use "deploy", "rollback", or "history"' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Deploy API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint for fetching deployment history
export async function GET(request: NextRequest) {
  try {
    const commits = await getRecentCommits(10);
    return NextResponse.json({
      success: true,
      commits,
    });
  } catch (error: any) {
    console.error('Error fetching deployment history:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch deployment history' },
      { status: 500 }
    );
  }
}
