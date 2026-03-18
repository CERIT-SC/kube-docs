# AGENTS.md - Development Guidelines

## Project Overview
Documentation site for CESNET Data Storage services, using MDX content files with a Fumadocs-based frontend.

## Build/Lint/Test Commands
**Note:** This repository currently has no package.json or build configuration. When setup is complete, typical commands will likely include:
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
```

**Single tests:** No test framework currently configured.

## Code Style Guidelines

### TypeScript/React Conventions
- **File naming:** Use `.tsx` for React components, `.ts` for utilities
- **Component naming:** PascalCase (e.g., `Footer`, `ChatSolver`)
- **Function exports:** Prefer named exports over default exports
  ```tsx
  export function Footer() { }
  ```
- **Indentation:** 2 spaces (based on existing code)
- **Semicolons:** Use semicolons at end of statements
- **Quotes:** Double quotes for strings
- **JSX:** Use self-closing tags for components without children
- **Props:** Destructure props in function parameters
- **State management:** Keep state close to where it's used
- **Effects:** Clean up subscriptions and timers in useEffect return functions

### Imports
- No explicit import conventions established yet
- Follow standard ES module syntax when needed

### Formatting
- Keep lines reasonably sized (avoid excessive line length)
- Use trailing commas in multi-line objects/arrays
- Maintain consistent indentation throughout files

### Types
- Use TypeScript for all code files
- Define explicit types for function parameters and return values
- Use interfaces for structured data (e.g., assistant configurations)

### Naming Conventions
- **Components:** PascalCase (e.g., `Footer.tsx`)
- **Functions/variables:** camelCase
- **Files:** lowercase with hyphens for multi-word names
- **Directories:** lowercase with hyphens

### Error Handling
- Handle errors at API boundaries
- Show user-friendly error messages
- Log errors for debugging (avoid exposing sensitive info)

### MDX Content Guidelines
- Use frontmatter with `title` property
- Follow existing structure in `content/docs/`
- Use `<Callout>` component for warnings/notes
- Keep meta.json files for page ordering

### Directory Structure
```
/app          - API routes and app pages
/components   - Reusable React components
/content/docs - MDX documentation files
/public       - Static assets (fonts, images)
```

### Git Workflow
- Default branch: `fumadocs`
- Commit messages: lowercase, descriptive (e.g., "typo", "intro clarified")
- No commits without explicit user request

### API Conventions
- API routes follow Next.js App Router structure (`app/api/`)
- JSON files for configuration (e.g., `assistants.json`)
- Secure API endpoints by user session

### Notes
- No Cursor rules (`.cursor/rules/`) present
- No Copilot rules (`.github/copilot-instructions.md`) present
- Repository linked to CESNET/du-docs on GitHub
- Content organized by service area (S3, RBD, Perun, collaboration, etc.)

### Content Organization
Documentation is structured by service area:
- `introduction/` - General service overview and terms
- `object-storage-s3/` - S3 API access methods and tools
- `object-storage-rbd/` - Rados Block Device setup and usage
- `perun/` - Identity and access management procedures
- `collaboration/` - File sharing and sync services
- `faq/` - Frequently asked questions
- `internal/` - Internal operator documentation

### MDX Frontmatter
All MDX files should include frontmatter at the top:
```mdx
---
title: Page Title
---
```

### Component Patterns
- Components are simple functional components
- Use Tailwind CSS classes for styling (e.g., `className="mt-auto border-t py-12"`)
- Container classes for responsive layouts (`container`, `sm:flex-row`)

### API Route Structure
- Routes under `app/api/` return JSON
- Configuration stored in JSON files (e.g., `assistants.json`)
- Assistant configs include: `type`, `id`, `name`, `api_path`, `engine`, `enabled`

### Commit Message Style
- Lowercase first letter
- Descriptive and concise
- Examples from history: "typo", "intro clarified", "scenarios developed"

### Remote Repositories
- `origin`: CESNET/du-docs (primary)
- `upstream`: CERIT-SC/kube-docs (related project)

### Public Assets
- Fonts stored in `public/fonts/` (FiraCode, InterVariable)
- Images organized by project in `public/img/`

### Important Considerations
- This is an early-stage project; build tooling may be added
- Always verify file exists before editing (minimal codebase)
- Content changes should maintain existing MDX structure
- API endpoints must be secured by user session (per README TODO)

### Documentation Best Practices
- Write clear, concise technical documentation
- Include code examples where appropriate
- Use proper heading hierarchy (H2, H3, etc.)
- Link to related sections using relative paths
- Keep paragraphs short and scannable
- Use bullet points for lists of options or steps

### Security Considerations
- Never commit API keys or credentials
- Use environment variables for sensitive configuration
- Review API endpoint access controls
- Follow principle of least privilege for user access

### Working with MDX Files
- Frontmatter must be at the very top of the file
- Component imports go after frontmatter
- Use relative links for internal documentation references
- External links should use full URLs
- Test links after adding new content

### Code Review Guidelines
- Ensure new code follows existing patterns
- Verify TypeScript types are explicit
- Check for proper error handling
- Confirm API endpoints are secured
- Validate MDX content renders correctly
