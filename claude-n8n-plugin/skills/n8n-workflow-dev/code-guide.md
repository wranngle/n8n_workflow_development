# n8n Code Node Guide

Comprehensive reference for writing Code nodes in n8n.

---

## JMESPath in n8n

n8n uses JMESPath for data querying with special handling for field names.

### Backtick Syntax (Required for Special Characters)
```javascript
// Standard JMESPath (won't work with dashes/dots in keys)
$jmespath(items, '[*].json.fieldName')

// n8n backtick syntax (required for special characters)
$jmespath(items, '[*].json.`field-with-dashes`')
$jmespath(items, '[*].json.`field.with.dots`')
```

### Common Patterns
```javascript
// Get all values of a field
const names = $jmespath($input.all(), '[*].json.name');

// Filter items
const active = $jmespath($input.all(), '[?json.status==`active`]');

// Nested access with special keys
const value = $jmespath(items, '[*].json.data.`nested-key`.value');

// Flatten arrays
const flat = $jmespath(items, '[*].json.items[]');
```

---

## Date/Time with Luxon

Luxon is built into n8n for date/time operations.

### Basic Usage
```javascript
const { DateTime } = require('luxon');

// Current time
const now = DateTime.now();
const utcNow = DateTime.utc();

// Parse dates
const parsed = DateTime.fromISO('2024-01-15T10:30:00');
const fromFormat = DateTime.fromFormat('15/01/2024', 'dd/MM/yyyy');

// Format output
const iso = now.toISO();
const formatted = now.toFormat('yyyy-MM-dd HH:mm:ss');
const relative = now.toRelative(); // "2 hours ago"
```

### Time Zones
```javascript
// Convert timezone
const nyTime = now.setZone('America/New_York');
const tokyoTime = now.setZone('Asia/Tokyo');

// Get timezone offset
const offset = now.offset; // minutes from UTC
```

### Date Math
```javascript
// Add/subtract
const tomorrow = now.plus({ days: 1 });
const lastWeek = now.minus({ weeks: 1 });
const nextMonth = now.plus({ months: 1, days: 5 });

// Start/end of period
const startOfDay = now.startOf('day');
const endOfMonth = now.endOf('month');

// Difference between dates
const diff = end.diff(start, ['days', 'hours']);
const days = diff.days;
```

### Comparison
```javascript
// Compare dates
const isAfter = date1 > date2;
const isSame = date1.hasSame(date2, 'day');
const isWithin = date1 >= startDate && date1 <= endDate;
```

---

## Crypto Module

**Note**: The editor may show warnings, but crypto IS available at runtime.

### Hashing
```javascript
const crypto = require('crypto');

// SHA-256 hash
const hash = crypto.createHash('sha256')
  .update(data)
  .digest('hex');

// MD5 (for compatibility)
const md5 = crypto.createHash('md5')
  .update(data)
  .digest('hex');

// HMAC
const hmac = crypto.createHmac('sha256', secretKey)
  .update(message)
  .digest('hex');
```

### Encryption/Decryption
```javascript
const algorithm = 'aes-256-gcm';
const key = crypto.scryptSync(password, salt, 32);
const iv = crypto.randomBytes(16);

// Encrypt
const cipher = crypto.createCipheriv(algorithm, key, iv);
let encrypted = cipher.update(plaintext, 'utf8', 'hex');
encrypted += cipher.final('hex');
const authTag = cipher.getAuthTag();

// Decrypt
const decipher = crypto.createDecipheriv(algorithm, key, iv);
decipher.setAuthTag(authTag);
let decrypted = decipher.update(encrypted, 'hex', 'utf8');
decrypted += decipher.final('utf8');
```

### Random Values
```javascript
// Random bytes
const randomBytes = crypto.randomBytes(32).toString('hex');

// UUID-like
const uuid = crypto.randomUUID();
```

---

## Item Access Patterns

### Input Data
```javascript
// All items (array)
const allItems = $input.all();

// First item
const first = $input.first();

// Current item (in loop)
const current = $input.item;

// Specific item by index
const third = $input.all()[2];
```

### Accessing JSON Data
```javascript
// From current item
const value = $json.fieldName;
const nested = $json.parent.child.value;

// From specific item
const fromFirst = $input.first().json.fieldName;

// With optional chaining (if may not exist)
const maybe = $json.data?.nested?.field;
```

### Previous Node Data
```javascript
// From named node
const nodeData = $('NodeName').all();
const firstFromNode = $('NodeName').first();

// Item from specific node
const value = $('HTTP Request').first().json.response;
```

---

## Output Patterns

### Return Items
```javascript
// Return array of items
return items.map(item => ({
  json: {
    ...item.json,
    processed: true,
    timestamp: new Date().toISOString()
  }
}));

// Filter items
return items.filter(item => item.json.status === 'active');

// Transform to new structure
return [{
  json: {
    summary: items.length,
    data: items.map(i => i.json.value)
  }
}];
```

### Multiple Outputs
```javascript
// Output to different branches
const passed = [];
const failed = [];

for (const item of items) {
  if (item.json.valid) {
    passed.push(item);
  } else {
    failed.push(item);
  }
}

// Return array of arrays for multiple outputs
return [passed, failed];
```

---

## Error Handling in Code

```javascript
try {
  // Risky operation
  const result = JSON.parse($json.rawData);
  return [{ json: result }];
} catch (error) {
  // Option 1: Throw to trigger node error
  throw new Error(`Parse failed: ${error.message}`);

  // Option 2: Return error info
  return [{
    json: {
      error: true,
      message: error.message,
      originalData: $json.rawData
    }
  }];
}
```

---

## Environment & Context

```javascript
// Environment variables
const apiKey = $env.API_KEY;

// Workflow info
const workflowId = $workflow.id;
const workflowName = $workflow.name;

// Execution info
const executionId = $execution.id;
const mode = $execution.mode; // 'manual' or 'trigger'

// Current node
const nodeName = $node.name;
const nodeType = $node.type;
```

---

## Best Practices

1. **Use descriptive variable names**
2. **Handle empty inputs gracefully**
```javascript
if (!items.length) {
  return [{ json: { empty: true } }];
}
```

3. **Validate data before processing**
```javascript
const required = ['id', 'email', 'status'];
for (const field of required) {
  if (!$json[field]) {
    throw new Error(`Missing required field: ${field}`);
  }
}
```

4. **Log for debugging (removed in production)**
```javascript
console.log('Processing:', JSON.stringify($json, null, 2));
```

---

*Source: n8n-mcp tools_documentation with topic="code_node_guide"*
