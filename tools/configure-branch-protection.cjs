#!/usr/bin/env node
/**
 * configure-branch-protection.cjs
 *
 * Simple script to create/update branch protection settings on a repository
 * via the GitHub REST API.
 *
 * Usage (recommended from CI):
 *   - Set env GITHUB_ADMIN_TOKEN to a PAT with repo:admin permissions
 *   - Run: node tools/configure-branch-protection.cjs owner/repo branchName
 */

const { spawnSync } = require('child_process');
const [repoArg, branchArg] = process.argv.slice(2);

if (!repoArg || !branchArg) {
  console.error('Usage: node tools/configure-branch-protection.cjs <owner/repo> <branch>');
  process.exit(2);
}

// Accept either the older name (GITHUB_ADMIN_TOKEN) or your repo-specific
// token name (PPM_ADMIN_TOKEN) — workflow will set PPM_ADMIN_TOKEN.
const TOKEN = process.env.GITHUB_ADMIN_TOKEN || process.env.PPM_ADMIN_TOKEN;
if (!TOKEN) {
  console.error('GITHUB_ADMIN_TOKEN or PPM_ADMIN_TOKEN environment variable is required (PAT with repo admin scope)');
  process.exit(3);
}

const repo = repoArg; // e.g. owner/repo
const branch = encodeURIComponent(branchArg);

// Minimal protection payload — customize as needed
const protectionPayload = {
  required_status_checks: {
    strict: true,
    contexts: ['CI — Frontend & Backend']
  },
  enforce_admins: true,
  required_pull_request_reviews: {
    dismiss_stale_reviews: true,
    require_code_owner_reviews: false,
    required_approving_review_count: 1
  },
  restrictions: null,
  allow_deletions: false,
  allow_force_pushes: false,
  required_linear_history: true,
  required_conversation_resolution: true
};

const payloadStr = JSON.stringify(protectionPayload);

console.log(`Applying branch protection for ${repo}@${branchArg}`);

const url = `https://api.github.com/repos/${repo}/branches/${branch}/protection`;

const curl = `curl -sS -X PUT \ 
  -H "Accept: application/vnd.github+json" \ 
  -H "Authorization: Bearer ${TOKEN}" \ 
  -H "X-GitHub-Api-Version: 2022-11-28" \ 
  -d '${payloadStr}' \ 
  "${url}"`;

console.log('Sending request to GitHub API...');
const res = spawnSync(curl, { shell: true, stdio: 'inherit' });

if (res.status !== 0) {
  console.error('Failed to apply branch protection. exit code:', res.status);
  process.exit(res.status);
}

console.log('Done');
