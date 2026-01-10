import { Octokit } from '@octokit/rest';
import { canModifyFile, validateFileContent } from './file-safety';

const octokit = new Octokit({
  auth: process.env.GITHUB_PAT_TOKEN,
});

const GITHUB_OWNER = process.env.GITHUB_OWNER || '';
const GITHUB_REPO = process.env.GITHUB_REPO || 'EastD';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

/**
 * Read a file from GitHub repository
 */
export async function readFileFromGitHub(filePath: string): Promise<string> {
  try {
    const { data } = await octokit.repos.getContent({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: filePath,
      ref: GITHUB_BRANCH,
    });

    // Check if it's a file (not a directory)
    if (!('content' in data) || Array.isArray(data)) {
      throw new Error(`${filePath} is not a file`);
    }

    // Decode base64 content
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    return content;
  } catch (error: any) {
    if (error.status === 404) {
      throw new Error(`File not found: ${filePath}`);
    }
    throw new Error(`Failed to read file: ${error.message}`);
  }
}

/**
 * Write a file to GitHub repository (creates a commit)
 */
export async function writeFileToGitHub(
  filePath: string,
  content: string,
  commitMessage?: string
): Promise<{ success: boolean; sha?: string }> {
  try {
    // Validate file can be modified
    const safetyCheck = canModifyFile(filePath);
    if (!safetyCheck.allowed) {
      throw new Error(safetyCheck.reason);
    }

    // Validate content
    const contentCheck = validateFileContent(content, filePath);
    if (!contentCheck.allowed) {
      throw new Error(contentCheck.reason);
    }

    // Check if file exists to get its SHA (required for updates)
    let fileSha: string | undefined;
    try {
      const { data } = await octokit.repos.getContent({
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        path: filePath,
        ref: GITHUB_BRANCH,
      });

      if (!Array.isArray(data) && 'sha' in data) {
        fileSha = data.sha;
      }
    } catch (error: any) {
      // File doesn't exist, that's ok - we'll create it
      if (error.status !== 404) {
        throw error;
      }
    }

    // Create or update file
    const { data } = await octokit.repos.createOrUpdateFileContents({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: filePath,
      message: commitMessage || `Update ${filePath}`,
      content: Buffer.from(content).toString('base64'),
      branch: GITHUB_BRANCH,
      sha: fileSha, // Required for updates, undefined for new files
    });

    return {
      success: true,
      sha: data.commit.sha,
    };
  } catch (error: any) {
    throw new Error(`Failed to write file: ${error.message}`);
  }
}

/**
 * List files/directories in a GitHub repository path
 */
export async function listFilesInGitHub(directoryPath: string): Promise<string[]> {
  try {
    const { data } = await octokit.repos.getContent({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: directoryPath,
      ref: GITHUB_BRANCH,
    });

    if (!Array.isArray(data)) {
      throw new Error(`${directoryPath} is not a directory`);
    }

    return data.map((item) => {
      const type = item.type === 'dir' ? '[DIR]' : '[FILE]';
      return `${type} ${item.name}`;
    });
  } catch (error: any) {
    if (error.status === 404) {
      throw new Error(`Directory not found: ${directoryPath}`);
    }
    throw new Error(`Failed to list files: ${error.message}`);
  }
}

/**
 * Search for code in the GitHub repository
 */
export async function searchCodeInGitHub(
  query: string,
  filePattern?: string
): Promise<Array<{ file: string; line: number; content: string }>> {
  try {
    // Use GitHub's code search API
    const searchQuery = `${query} repo:${GITHUB_OWNER}/${GITHUB_REPO}${
      filePattern ? ` path:${filePattern}` : ''
    }`;

    const { data } = await octokit.search.code({
      q: searchQuery,
      per_page: 50,
    });

    const results: Array<{ file: string; line: number; content: string }> = [];

    // For each file found, get its content and find matching lines
    for (const item of data.items) {
      try {
        const content = await readFileFromGitHub(item.path);
        const lines = content.split('\n');

        lines.forEach((line, index) => {
          if (line.toLowerCase().includes(query.toLowerCase())) {
            results.push({
              file: item.path,
              line: index + 1,
              content: line.trim(),
            });
          }
        });
      } catch (error) {
        // Skip files that can't be read
        continue;
      }
    }

    return results.slice(0, 50); // Limit to 50 results
  } catch (error: any) {
    throw new Error(`Failed to search code: ${error.message}`);
  }
}

/**
 * Get repository tree structure
 */
export async function getRepositoryTree(): Promise<string[]> {
  try {
    const { data } = await octokit.git.getTree({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      tree_sha: GITHUB_BRANCH,
      recursive: '1',
    });

    // Filter to only show relevant directories
    const relevantPaths = data.tree
      .filter((item) => {
        const path = item.path || '';
        return (
          (path.startsWith('app/') ||
            path.startsWith('components/') ||
            path.startsWith('lib/')) &&
          !path.includes('node_modules') &&
          !path.includes('.next')
        );
      })
      .map((item) => {
        const type = item.type === 'tree' ? '[DIR]' : '[FILE]';
        return `${type} ${item.path}`;
      });

    return relevantPaths.slice(0, 100); // Limit to 100 items
  } catch (error: any) {
    throw new Error(`Failed to get repository tree: ${error.message}`);
  }
}
