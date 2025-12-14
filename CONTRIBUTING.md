# Contributing to n8n Workflow Development Toolkit

Thank you for your interest in contributing! This toolkit is designed for AI-assisted n8n workflow development with Claude Code.

## Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/yourusername/n8n-workflow-toolkit.git
   cd n8n-workflow-toolkit
   ```
3. **Install dependencies**
   ```bash
   npm install
   ```
4. **Set up your environment**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

## Project Philosophy

This toolkit follows the "Mechanic's Garage" philosophy:
- Every tool has its place
- Every workflow request has a protocol
- Never reinvent the wheel - search existing solutions first

Read **CLAUDE.md** for the complete development playbook.

## Areas for Contribution

### 1. YouTube Knowledge Base
- Add new n8n tutorial channels to `context/youtube-knowledge/video-index.json`
- Improve tag inference in `scripts/youtube-indexer.js`
- Cache more transcripts for commonly used videos

### 2. Workflow Patterns
- Document new workflow patterns in `context/workflow-patterns/`
- Add real-world examples to pattern documentation
- Contribute pre-built workflow templates

### 3. n8n Skills
- Enhance existing skills in `.claude/skills/`
- Add new code examples to skill documentation
- Improve error catalogs and troubleshooting guides

### 4. MCP Integration
- Test and document new MCP servers
- Improve existing integration protocols
- Add fallback strategies for API rate limits

### 5. Slash Commands
- Create new slash commands in `.claude/commands/`
- Improve existing command documentation
- Add examples and use cases

## Contribution Guidelines

### Code Style
- Use clear, descriptive variable names
- Add comments for complex logic
- Follow existing file structure and naming conventions

### Documentation
- Update README.md if adding new features
- Keep CLAUDE.md in sync with changes
- Document all new MCP integrations in PROTOCOL.md files

### Security
- **NEVER** commit API keys, tokens, or credentials
- Use environment variables for all secrets
- Update .gitignore if adding new sensitive file types
- Test that .env is properly excluded before committing

### Git Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the project structure
   - Test your changes thoroughly
   - Update documentation

3. **Commit with descriptive messages**
   ```bash
   git add .
   git commit -m "Add feature: your feature description"
   ```

4. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**
   - Describe what your changes do
   - Reference any related issues
   - Include examples if applicable

## Testing

Before submitting:

1. **Test YouTube indexing** (if modified)
   ```bash
   npm run index:youtube
   ```

2. **Validate workflow patterns** (if modified)
   - Use n8n-MCP validation tools
   - Test in a dev n8n instance

3. **Check for secrets**
   ```bash
   git diff --staged
   # Manually review for any exposed secrets
   ```

## Knowledge Base Updates

### Adding YouTube Channels

1. Update `context/youtube-knowledge/video-index.json`:
   ```json
   "channels": {
     "CHANNEL_ID": "Channel Name"
   }
   ```

2. Run the indexer:
   ```bash
   npm run index:youtube
   ```

3. Commit both video-index.json and any new transcripts

### Adding MCP Servers

1. Create protocol in `context/{mcp-name}-knowledge/PROTOCOL.md`
2. Update `config/mcp-servers.json`
3. Document setup in README.md
4. Update CLAUDE.md Pre-Flight Checklist

## Questions or Issues?

- Open an issue for bugs or feature requests
- Join the n8n Discord for community help
- Check existing issues before creating duplicates

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for making n8n workflow development better! 🚀
