# Analysis of 6,000+ n8n Marketplace Workflows

> Analysis of what people are actually building with n8n - scraped from the official n8n marketplace
> Source: Reddit r/n8n by u/automata_n8n
> GitHub: https://github.com/MuLIAICHI/MuLIAICHI-n8n-what-the-hell-is-everyone-building
> Medium Article: https://medium.com/@mustaphaliaichi/what-are-people-actually-building-in-n8n-i-scraped-over-6-000-workflows-to-find-out-59eb8e34c317
> Apify Actor: https://apify.com/scraper_guru/n8n-marketplace-analyzer

---

## 📊 TL;DR - Key Statistics

- **HTTP Request node**: Used in **73%** of workflows (3,357 uses)
- **Chatbots dominate**: Top workflow has **800K views** (#1, #2, #3, #5 are all chatbots)
- **Simple workflows win**: **40% have 5 nodes or less**
- **AI explosion**: **11,000+ AI-related category tags**
- **Pricing**: **86% are free**, 14% paid (average $15)
- **Average complexity**: **8.2 nodes per workflow**

---

## 🔥 Key Findings

### 1. HTTP Request Node is Everywhere (73%)

**3,357 workflows use it** - If you're still intimidated by the HTTP Request node, you're missing out on most of n8n's power.

**Why it matters**:
- Every API integration depends on it
- Every web scraper needs it
- Every webhook handler uses it

**Learning Priority**: #1 - Master this node first

---

### 2. The Chatbot Boom is Real

**Top workflow: 800,000 views** - It's an AI chatbot. So are #2, #3, and #5.

**Popular chatbot types**:
- WhatsApp bots
- Telegram bots
- AI assistants
- Customer service automation

**Market insight**: This is where the attention and demand is right now.

---

### 3. Code Node = Superpower (3,079 uses)

**Why it matters**:
> "Learning the Code node is the difference between following tutorials and building custom solutions."

**JavaScript looks scary**, but:
- 3,079 workflows successfully use it
- Enables custom logic impossible with standard nodes
- Unlocks advanced data transformations
- Critical for complex workflows

**Learning Priority**: #2 - Learn JavaScript basics + n8n Code node patterns

---

### 4. AI is Already Infrastructure

**Over 11,000 AI-related tags** - People aren't experimenting, they're shipping production.

**What people are building**:
- AI Agents (2,265 uses)
- RAG systems
- OpenAI integrations
- LangChain workflows

**Market insight**: AI isn't future-tech anymore, it's current infrastructure.

---

### 5. Simple Wins (40% have ≤5 nodes)

**40% of workflows have 5 nodes or less**

**Takeaway**: You don't need complex circuit-board workflows to solve real problems.

**Distribution**:
- 5 nodes or less: 40%
- Average: 8.2 nodes
- Complex workflows: minority

**Building tip**: Start simple, add complexity only when needed.

---

### 6. Google Sheets Everywhere (2,006 uses)

**People are building legit solutions with spreadsheets as databases.**

**Why Sheets works**:
- Zero setup
- Familiar interface
- Easy collaboration
- "Good enough" for many use cases

**Important discussions from comments**:
- Sheets vs real databases debate
- SQL injection concerns with n8n's MySQL adapter (uses string replacement, not prepared statements)
- Supabase/Airtable as middle ground
- n8n's built-in data tables as alternative

**When to use Sheets**:
✅ Small datasets (<10K rows)
✅ Non-technical users need access
✅ Prototyping/MVP stage

**When to upgrade to database**:
❌ Large datasets (>10K rows)
❌ Need data validation/constraints
❌ High-frequency read/write operations
❌ Multiple automations accessing same data

---

## 📈 Most Used Nodes (Top 4)

1. **HTTP Request**: 3,357 uses (73%)
2. **Code**: 3,079 uses
3. **AI Agent**: 2,265 uses
4. **Google Sheets**: 2,006 uses

---

## 🏷️ Top Categories

1. **AI/LangChain**: 11,396 tags each
2. **Development**: 7,249 tags
3. **Core Nodes**: 7,179 tags

---

## 💰 Pricing Breakdown

- **Free workflows**: 86%
- **Paid workflows**: 14%
- **Average paid price**: $15

**Market insight**: The marketplace is dominated by free, community-shared solutions.

---

## 🎯 Recommendations for Learners

### Focus on the Big 3:

1. **HTTP Request node** - Foundation of API integrations
2. **Code node** - Unlocks custom solutions
3. **AI integrations** - Current market demand

> "That's 80% of what successful workflows use."

### Building Strategy:

**Clone and Adapt**:
> "Clone high-view workflows and adapt them. That's not cheating - it's smart."

**Start Simple**:
- 40% of successful workflows use ≤5 nodes
- Don't over-engineer
- Add complexity only when needed

---

## 📊 Surprising Stats

### Node Usage
- **73%** use HTTP Request
- **3,079** use Code node
- **2,265** use AI Agent
- **2,006** use Google Sheets

### Categories
- **AI/LangChain**: 11,396 tags each (massive)
- **Development**: 7,249 tags
- **Core Nodes**: 7,179 tags

### Workflow Complexity
- **40%** have 5 nodes or less
- **Average**: 8.2 nodes per workflow

### Pricing
- **86%** free
- **14%** paid
- **$15** average for paid workflows

---

## 🛠️ Tools & Resources

### GitHub Repository
**Repo**: https://github.com/MuLIAICHI/MuLIAICHI-n8n-what-the-hell-is-everyone-building

**Includes**:
- Python scraper (respects rate limits)
- Analysis scripts with visualizations
- Sample data
- All charts generated

**No API keys needed** - just run the scripts

### Apify Actor
**Link**: https://apify.com/scraper_guru/n8n-marketplace-analyzer

**Features**:
- Automated marketplace scraping
- Analytics generation
- ML training data generation
- Currently free (collecting feedback)

### Medium Article
**Full deep-dive**: https://medium.com/@mustaphaliaichi/what-are-people-actually-building-in-n8n-i-scraped-over-6-000-workflows-to-find-out-59eb8e34c317

---

## 🔮 Future Plans

### Monthly Tracking
Community is interested in seeing:
- Trends over time
- Rising/falling node popularity
- New categories emerging
- Price changes

### Part 2: AI-Generated Workflows
> "Fine-tuning Llama 3 on this data to generate workflows from natural language."

**Status**: In progress
**Previous attempt**: Mistral 7B failed

---

## 💬 Community Insights (from Reddit comments)

### Google Sheets as Database Debate

**Problem identified**:
> "Someone out there is definitely using it as a database when what they actually need IS a database."

**Sheets limitations**:
- Data formats aren't predictable
- Can't put constraints
- Automations inevitably break
- Poor performance at scale

**Alternatives discussed**:
- **Supabase**: Great for most use cases
- **Airtable**: User-friendly, good for teams
- **n8n Data Tables**: Built-in, easy to use
- **MS SQL/PostgreSQL**: For serious applications

### MySQL Adapter Issues

**Critical security concern**:
> "doesn't actually use prepared statements; just string replacements. it's wide open to sql injection"

**Problems**:
- SQL injection vulnerability
- Difficult to handle quotes and escape characters
- Workarounds are "a pain in the butt"

**Recommendation**: Use proper prepared statements, contribute to fixing the adapter

### Monthly Trend Tracking

Community wants to see:
- Monthly snapshots of top nodes
- Rising/falling workflow categories
- AI adoption over time
- New integration trends

---

## 🎓 Learning Path Based on Marketplace Data

### Phase 1: Foundation (Week 1-2)
1. **HTTP Request node** mastery
   - GET/POST/PUT/DELETE requests
   - Headers and authentication
   - Query parameters
   - Response handling

2. **Google Sheets integration**
   - Read/write operations
   - When to use vs database
   - Common patterns

### Phase 2: Power User (Week 3-4)
3. **Code node** fundamentals
   - JavaScript basics for n8n
   - Common data transformations
   - Working with $json and $node
   - Error handling

4. **AI Agent node**
   - OpenAI integration
   - LangChain basics
   - Prompt engineering
   - Memory and context

### Phase 3: Production (Week 5+)
5. **Workflow architecture**
   - Start simple (≤5 nodes)
   - Error handling patterns
   - Webhook security
   - Performance optimization

6. **Clone and adapt**
   - Study high-view marketplace workflows
   - Understand common patterns
   - Adapt to your use cases
   - Share back to community

---

## 📊 Marketplace vs Community Repository Analysis

### This Analysis (Marketplace - 6,000+ workflows)
**Focus**: What people are BUILDING and USING
- Most popular nodes
- Most viewed workflows
- Pricing trends
- Category popularity

**Data source**: n8n official marketplace
**Insight type**: Market demand, user preferences

### Complementary Analysis (Repository - 2,050 workflows)
**Focus**: What's WORKING and what's BROKEN
- Error handling gaps (97%)
- Security vulnerabilities (472 found)
- Efficiency issues
- Best practices

**Data source**: Zie619 community repository
**Insight type**: Code quality, production readiness

### Combined Strategy
1. **Use marketplace data** to understand WHAT to build
2. **Use repository analysis** to understand HOW to build it well
3. **Combine both** for production-ready, market-relevant workflows

---

## 🔗 Related Resources

### Official n8n Marketplace
- Browse 6,000+ workflows: https://n8n.io/workflows/

### Analysis Tools
- **GitHub Scraper**: https://github.com/MuLIAICHI/MuLIAICHI-n8n-what-the-hell-is-everyone-building
- **Apify Actor**: https://apify.com/scraper_guru/n8n-marketplace-analyzer

### Community
- **Reddit**: r/n8n (126K weekly visitors)
- **Discord**: discord.gg/n8n
- **Medium**: Full deep-dive article

---

## 💡 Key Takeaways for Workflow Development

### 1. Master the Big 3 Nodes
- HTTP Request (73% usage)
- Code node (sophisticated solutions)
- AI Agent (current demand)

### 2. Start Simple
- 40% of workflows have ≤5 nodes
- Don't over-engineer
- Complexity comes later

### 3. Learn from Success
- Study high-view marketplace workflows
- Clone and adapt patterns
- Share back to community

### 4. Follow Market Trends
- AI/Chatbots are dominant
- WhatsApp/Telegram bots are hot
- Google Sheets is "good enough" for many

### 5. Choose Right Tools
- Sheets for prototypes
- Real databases for production
- n8n Data Tables for built-in solution

---

## 🎯 Integration with n8n Workflow Development Toolkit

### Pre-Flight Checklist Enhancement

When building workflows, consider marketplace insights:

**Node Selection**:
- If your use case is API-heavy → HTTP Request is proven (73% usage)
- If you need custom logic → Code node is common (3,079 uses)
- If building chatbot → Study top-viewed workflows (800K views)
- If using spreadsheets → Know when to upgrade to database

**Complexity Target**:
- Aim for ≤5 nodes initially (40% sweet spot)
- Average successful workflow: 8.2 nodes
- Add complexity only when needed

**Market Validation**:
- AI/chatbots: High demand (11K+ tags)
- WhatsApp/Telegram: Proven interest
- Free workflows dominate (86%)

---

## 📅 Trend Tracking (Future)

### Monthly Snapshots
Track over time:
- [ ] Top 10 most used nodes
- [ ] Rising/falling categories
- [ ] New integrations
- [ ] Pricing trends
- [ ] AI adoption rate

### Automated Tracking
Use the Apify actor to:
- Schedule monthly scrapes
- Generate comparison reports
- Identify emerging patterns
- Predict future trends

---

*Last Updated: 2025-12-14*
*Source: Reddit r/n8n analysis by u/automata_n8n*
*Data: 6,000+ workflows from n8n marketplace*
*View Count: 61,000+ (as of latest update)*
