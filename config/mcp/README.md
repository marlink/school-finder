# MCP (Model Context Protocol) Services

This project supports several MCP services for enhanced functionality. Configure these in your Trae IDE with your own API keys.

## Available MCP Services

### 🔍 Qdrant Vector Database
**Purpose:** Vector search and semantic similarity for school data
**Use Cases:**
- Semantic search across school descriptions
- Finding similar schools based on features
- AI-powered school recommendations
- Content similarity analysis

**How to Use:**
- Configure in Trae IDE with your Qdrant API key
- Use for vector-based search operations
- Ideal for AI-powered school matching

### 🌐 Hyperbrowser
**Purpose:** Web automation and data extraction
**Use Cases:**
- Automated school website scraping
- Real-time school information updates
- Web-based data validation
- Dynamic content extraction

**How to Use:**
- Configure in Trae IDE with your Hyperbrowser API key
- Use for automated web interactions
- Perfect for gathering updated school information

### 🤖 Puppeteer (Built-in)
**Purpose:** Browser automation (internal to Trae)
**Use Cases:**
- Screenshot generation
- PDF creation from web pages
- Form automation
- Web testing

**How to Use:**
- Available by default in Trae IDE
- No additional configuration needed
- Use for browser-based automation tasks

## Configuration

⚠️ **Security Note:** Never commit API keys to the repository. Configure these services directly in your Trae IDE settings.

## Integration Examples

```javascript
// Example: Using MCP services in your application
// These would be configured through Trae IDE, not in code

// Qdrant for semantic search
// - Search for schools similar to user preferences
// - Find schools with matching educational programs

// Hyperbrowser for data collection
// - Scrape school websites for updated information
// - Validate school contact details

// Puppeteer for automation
// - Generate school comparison reports
// - Create visual school profiles
```

## Best Practices

1. **Security:** Keep API keys in Trae IDE configuration only
2. **Rate Limiting:** Respect API limits for external services
3. **Error Handling:** Implement fallbacks for service unavailability
4. **Monitoring:** Track usage and performance of MCP services