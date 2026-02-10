# Tool Catalog

All custom skills available in Mission Control.

## Browser Skill

**File**: `browser.js`  
**Purpose**: Extract text content from URLs

### Tools

#### `BROWSER:READ_URL`
Extract and clean text from a webpage.

```javascript
async function readUrl(url) {
    const response = await fetch(url);
    const html = await response.text();
    const text = extractText(html); // Strip tags, clean
    return { text, length: text.length };
}
```

---

## GitHub Skill

**File**: `github.js`  
**Purpose**: Code repository operations via Octokit

### Tools

#### `GITHUB:LIST_ISSUES`
List open issues for a repository.

#### `GITHUB:CREATE_ISSUE`
Create a new issue.

#### `GITHUB:LIST_PRS`
List open pull requests.

#### `GITHUB:CREATE_PR`
Create a pull request from a branch.

```javascript
// Uses @octokit/rest
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
```

---

## Google Skill

**File**: `google.js`  
**Purpose**: Web search via SerpApi

### Tools

#### `GOOGLE:SEARCH`
Perform a web search and return top results.

```javascript
// Uses google-search-results-nodejs
async function search(query, limit = 5) {
    const engine = new SerpApi(process.env.SERPAPI_KEY);
    const results = await engine.search({ q: query, ...params });
    return results.organic_results.slice(0, limit);
}
```

---

## Security Skill

**File**: `security.js`  
**Purpose**: Code auditing and vulnerability scanning

### Tools

#### `SECURITY:SCAN_FILE`
Scan a file for security issues.

#### `SECURITY:CHECK_DEPENDENCIES`
Audit npm dependencies for vulnerabilities.

#### `SECURITY:AUDIT_SKILL`
Review a skill file for guardrails compliance.

#### `SECURITY:VERIFY_GUARDRAILS`
Check that all security measures are in place.

---

## Skill Interface

All skills export an object with this structure:

```javascript
export default {
    name: "SkillName",
    description: "What this skill does",
    tools: {
        TOOL_NAME: {
            description: "What this tool does",
            parameters: { ... },
            execute: async (params, context) => { ... },
        },
    },
};
```
