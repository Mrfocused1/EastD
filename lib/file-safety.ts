import * as fs from 'fs';
import * as path from 'path';

// Whitelist: Patterns for files that CAN be modified
const ALLOWED_PATHS = [
  /^app\/(?!api\/).*\.tsx?$/,  // App router pages (except API routes)
  /^app\/.*\.css$/,             // CSS files in app
  /^components\/.*\.tsx?$/,     // React components
  /^app\/globals\.css$/,        // Global styles
  /^tailwind\.config\.ts$/,     // Tailwind config
];

// Blacklist: Patterns for files that CANNOT be modified (takes precedence)
const FORBIDDEN_PATHS = [
  /^\.env/,                     // Environment files
  /^\.env\./,                   // Environment files (.env.local, etc.)
  /^app\/api\//,                // API routes (backend)
  /^lib\/supabase/,             // Database config
  /^lib\/stripe/,               // Payment config
  /^lib\/email/,                // Email config
  /^lib\/googleCalendar/,       // Google Calendar config
  /^package\.json$/,            // Dependencies
  /^package-lock\.json$/,       // Lock file
  /^next\.config/,              // Next config
  /^tsconfig\.json$/,           // TypeScript config
  /^vercel\.json$/,             // Vercel config
  /^\.git/,                     // Git files
  /^node_modules\//,            // Dependencies
];

// Dangerous code patterns that should not be in modified files
const DANGEROUS_PATTERNS = [
  /eval\s*\(/,                  // eval() calls
  /Function\s*\(/,              // Function constructor
  /dangerouslySetInnerHTML/,    // XSS vulnerability
  /require\s*\(\s*['"]child_process['"]\s*\)/, // Child process
  /require\s*\(\s*['"]fs['"]\s*\)/,            // File system (in client code)
  /process\.env\./,             // Direct env access in client code
];

export interface FileSafetyResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Check if a file path is allowed to be modified
 */
export function canModifyFile(filePath: string): FileSafetyResult {
  // Normalize path (remove leading ./ or /)
  const normalizedPath = filePath.replace(/^\.?\//, '');

  // Check blacklist first (takes precedence)
  for (const pattern of FORBIDDEN_PATHS) {
    if (pattern.test(normalizedPath)) {
      return {
        allowed: false,
        reason: `This file is protected and cannot be modified: ${normalizedPath}`,
      };
    }
  }

  // Check whitelist
  let isAllowed = false;
  for (const pattern of ALLOWED_PATHS) {
    if (pattern.test(normalizedPath)) {
      isAllowed = true;
      break;
    }
  }

  if (!isAllowed) {
    return {
      allowed: false,
      reason: `This file type is not allowed to be modified: ${normalizedPath}`,
    };
  }

  return { allowed: true };
}

/**
 * Validate file content for dangerous patterns
 */
export function validateFileContent(content: string, filePath: string): FileSafetyResult {
  // Only check client-side files for dangerous patterns
  const isClientFile = filePath.match(/\.(tsx|jsx)$/) && !filePath.includes('/api/');

  if (isClientFile) {
    for (const pattern of DANGEROUS_PATTERNS) {
      if (pattern.test(content)) {
        return {
          allowed: false,
          reason: `File content contains potentially dangerous code pattern: ${pattern.source}`,
        };
      }
    }
  }

  return { allowed: true };
}

/**
 * Read file contents safely
 */
export async function readFileSafe(filePath: string): Promise<string> {
  const projectRoot = process.cwd();
  const fullPath = path.join(projectRoot, filePath);

  // Security check: Ensure path doesn't escape project directory
  const resolvedPath = path.resolve(fullPath);
  if (!resolvedPath.startsWith(projectRoot)) {
    throw new Error('Invalid file path: Path escapes project directory');
  }

  // Check if file exists
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  return fs.readFileSync(resolvedPath, 'utf-8');
}

/**
 * Write file contents safely
 */
export async function writeFileSafe(
  filePath: string,
  content: string
): Promise<void> {
  const projectRoot = process.cwd();

  // Check if modification is allowed
  const safetyCheck = canModifyFile(filePath);
  if (!safetyCheck.allowed) {
    throw new Error(safetyCheck.reason);
  }

  // Validate content
  const contentCheck = validateFileContent(content, filePath);
  if (!contentCheck.allowed) {
    throw new Error(contentCheck.reason);
  }

  const fullPath = path.join(projectRoot, filePath);

  // Security check: Ensure path doesn't escape project directory
  const resolvedPath = path.resolve(fullPath);
  if (!resolvedPath.startsWith(projectRoot)) {
    throw new Error('Invalid file path: Path escapes project directory');
  }

  // Create directory if it doesn't exist
  const directory = path.dirname(resolvedPath);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  // Write file
  fs.writeFileSync(resolvedPath, content, 'utf-8');
}

/**
 * List files in a directory safely
 */
export async function listFilesSafe(directory: string): Promise<string[]> {
  const projectRoot = process.cwd();
  const fullPath = path.join(projectRoot, directory);

  // Security check: Ensure path doesn't escape project directory
  const resolvedPath = path.resolve(fullPath);
  if (!resolvedPath.startsWith(projectRoot)) {
    throw new Error('Invalid directory path: Path escapes project directory');
  }

  // Check if directory exists
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Directory not found: ${directory}`);
  }

  // Read directory
  const entries = fs.readdirSync(resolvedPath, { withFileTypes: true });

  // Return file names and subdirectories
  return entries.map((entry) => {
    const type = entry.isDirectory() ? '[DIR]' : '[FILE]';
    return `${type} ${entry.name}`;
  });
}

/**
 * Search for code patterns in files
 */
export async function searchCode(
  query: string,
  filePattern?: string
): Promise<Array<{ file: string; line: number; content: string }>> {
  const projectRoot = process.cwd();
  const results: Array<{ file: string; line: number; content: string }> = [];

  // Simple search implementation (can be enhanced with proper grep/ripgrep)
  const searchInDirectory = (dir: string) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(projectRoot, fullPath);

      // Skip node_modules and .git
      if (relativePath.includes('node_modules') || relativePath.includes('.git')) {
        continue;
      }

      if (entry.isDirectory()) {
        searchInDirectory(fullPath);
      } else if (entry.isFile()) {
        // Check file pattern if provided
        if (filePattern && !relativePath.match(filePattern)) {
          continue;
        }

        // Only search in text files
        if (
          fullPath.match(/\.(tsx?|jsx?|css|json|md)$/)
        ) {
          try {
            const content = fs.readFileSync(fullPath, 'utf-8');
            const lines = content.split('\n');

            lines.forEach((line, index) => {
              if (line.toLowerCase().includes(query.toLowerCase())) {
                results.push({
                  file: relativePath,
                  line: index + 1,
                  content: line.trim(),
                });
              }
            });
          } catch (err) {
            // Skip files that can't be read
          }
        }
      }
    }
  };

  // Start search from appropriate directories
  const searchDirs = ['app', 'components', 'lib'];
  for (const dir of searchDirs) {
    const fullDir = path.join(projectRoot, dir);
    if (fs.existsSync(fullDir)) {
      searchInDirectory(fullDir);
    }
  }

  // Limit results to avoid overwhelming the response
  return results.slice(0, 50);
}
