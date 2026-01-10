import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
  auth: process.env.GITHUB_PAT_TOKEN,
});

const GITHUB_OWNER = process.env.GITHUB_OWNER || '';
const GITHUB_REPO = process.env.GITHUB_REPO || 'EastD';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

export interface DeploymentFile {
  path: string;
  content: string;
}

export interface DeploymentResult {
  success: boolean;
  commitSha?: string;
  commitUrl?: string;
  error?: string;
}

/**
 * Deploy changes directly to GitHub (bypasses PR)
 * This pushes changes directly to the main branch and triggers Vercel deployment
 */
export async function deployToGitHub(
  files: DeploymentFile[],
  commitMessage: string
): Promise<DeploymentResult> {
  try {
    if (!process.env.GITHUB_PAT_TOKEN) {
      throw new Error('GITHUB_PAT_TOKEN is not configured');
    }

    if (!GITHUB_OWNER) {
      throw new Error('GITHUB_OWNER is not configured');
    }

    console.log(`Deploying ${files.length} file(s) to ${GITHUB_OWNER}/${GITHUB_REPO}:${GITHUB_BRANCH}`);

    // Step 1: Get the current reference (latest commit on branch)
    const { data: ref } = await octokit.git.getRef({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      ref: `heads/${GITHUB_BRANCH}`,
    });

    const currentCommitSha = ref.object.sha;
    console.log(`Current commit SHA: ${currentCommitSha}`);

    // Step 2: Get the tree SHA from the current commit
    const { data: currentCommit } = await octokit.git.getCommit({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      commit_sha: currentCommitSha,
    });

    const currentTreeSha = currentCommit.tree.sha;

    // Step 3: Create blobs for each file
    console.log('Creating blobs for modified files...');
    const blobCreationPromises = files.map(async (file) => {
      const { data: blob } = await octokit.git.createBlob({
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        content: Buffer.from(file.content).toString('base64'),
        encoding: 'base64',
      });
      return {
        path: file.path,
        sha: blob.sha,
      };
    });

    const blobs = await Promise.all(blobCreationPromises);

    // Step 4: Create a new tree with the modified files
    console.log('Creating new tree...');
    const { data: newTree } = await octokit.git.createTree({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      base_tree: currentTreeSha,
      tree: blobs.map((blob) => ({
        path: blob.path,
        mode: '100644' as const, // Regular file
        type: 'blob' as const,
        sha: blob.sha,
      })),
    });

    // Step 5: Create a new commit
    console.log('Creating commit...');
    const { data: newCommit } = await octokit.git.createCommit({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      message: `🤖 AI Builder: ${commitMessage}`,
      tree: newTree.sha,
      parents: [currentCommitSha],
    });

    console.log(`New commit SHA: ${newCommit.sha}`);

    // Step 6: Update the branch reference (DIRECT PUSH - NO PR)
    console.log(`Updating ${GITHUB_BRANCH} branch...`);
    await octokit.git.updateRef({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      ref: `heads/${GITHUB_BRANCH}`,
      sha: newCommit.sha,
      force: false, // Set to true to force push (use with caution)
    });

    const commitUrl = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/commit/${newCommit.sha}`;
    console.log(`Deployment successful: ${commitUrl}`);

    // Vercel will automatically deploy this commit if GitHub integration is set up
    // Optionally trigger Vercel deploy hook
    if (process.env.VERCEL_DEPLOY_HOOK_URL) {
      console.log('Triggering Vercel deployment...');
      await fetch(process.env.VERCEL_DEPLOY_HOOK_URL, {
        method: 'POST',
      });
    }

    return {
      success: true,
      commitSha: newCommit.sha,
      commitUrl,
    };
  } catch (error: any) {
    console.error('Deployment error:', error);
    return {
      success: false,
      error: error.message || 'Deployment failed',
    };
  }
}

/**
 * Get recent commits for rollback functionality
 */
export async function getRecentCommits(limit: number = 10) {
  try {
    const { data: commits } = await octokit.repos.listCommits({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      sha: GITHUB_BRANCH,
      per_page: limit,
    });

    return commits.map((commit) => ({
      sha: commit.sha,
      message: commit.commit.message,
      author: commit.commit.author?.name,
      date: commit.commit.author?.date,
      url: commit.html_url,
    }));
  } catch (error: any) {
    console.error('Error fetching commits:', error);
    throw error;
  }
}

/**
 * Rollback to a previous commit
 */
export async function rollbackToCommit(commitSha: string): Promise<DeploymentResult> {
  try {
    console.log(`Rolling back to commit: ${commitSha}`);

    await octokit.git.updateRef({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      ref: `heads/${GITHUB_BRANCH}`,
      sha: commitSha,
      force: true, // Force push required for rollback
    });

    console.log('Rollback successful');

    return {
      success: true,
      commitSha,
      commitUrl: `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/commit/${commitSha}`,
    };
  } catch (error: any) {
    console.error('Rollback error:', error);
    return {
      success: false,
      error: error.message || 'Rollback failed',
    };
  }
}

/**
 * Get file diff between two commits
 */
export async function getFileDiff(filePath: string, baseSha?: string) {
  try {
    const { data: commits } = await octokit.repos.listCommits({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: filePath,
      per_page: 2,
    });

    if (commits.length < 2 && !baseSha) {
      return null; // New file, no diff
    }

    const currentSha = commits[0].sha;
    const previousSha = baseSha || commits[1]?.sha;

    if (!previousSha) {
      return null;
    }

    const { data: comparison } = await octokit.repos.compareCommits({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      base: previousSha,
      head: currentSha,
    });

    const fileChange = comparison.files?.find((f) => f.filename === filePath);

    return {
      additions: fileChange?.additions || 0,
      deletions: fileChange?.deletions || 0,
      patch: fileChange?.patch,
    };
  } catch (error: any) {
    console.error('Error getting file diff:', error);
    return null;
  }
}
