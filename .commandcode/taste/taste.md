# Taste (Continuously Learned by [CommandCode][cmd])

[cmd]: https://commandcode.ai/

# agents
- Define commandcode agents as proper agent files (e.g., `.commandcode/agents/`), not as plain text documentation in AGENTS.md. Confidence: 0.65

# configuration
- When setting up database or infrastructure credentials in `.env` files, create placeholder/template configs and let the user fill in sensitive credentials themselves rather than trying to discover or guess passwords. Confidence: 0.80

# supabase
- Always use supabase skills and supabase MCP for any Supabase-related work. Confidence: 0.85
- For Prisma migration issues with Supabase, reference the troubleshooting guide at https://supabase.com/docs/guides/database/prisma/prisma-troubleshooting. Confidence: 0.70

# ui-ux
- Use the 'ui-ux-pro-max' skill for all UI/UX design work (design system generation, searches, implementation). Confidence: 0.75

# authentication
- Prefer Better-Auth for auth implementation (email/password, database sessions, invite-only). Confidence: 0.60
