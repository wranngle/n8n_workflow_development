#!/usr/bin/env node
/**
 * workflow-file-guard.js
 * 
 * Hook: PreToolUse (Write)
 * Purpose: Ensure workflow JSON files go to correct directories
 * 
 * If a workflow JSON is being written outside of workflows/{dev,staging,production},
 * this hook will warn but not block.
 */

let input = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', chunk => {
  input += chunk;
});

process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const filePath = (data.tool_input?.file_path || '').toLowerCase();
    const content = data.tool_input?.content || '';
    
    // Check if this looks like a workflow file
    const isWorkflowFile = filePath.endsWith('.json') && 
                          (content.includes('"nodes"') || content.includes('"connections"'));
    
    if (isWorkflowFile) {
      // Check if it's in the correct directory
      const validPaths = ['workflows/dev', 'workflows/staging', 'workflows/production'];
      const isInValidPath = validPaths.some(p => filePath.includes(p.replace(/\//g, '\\\\')));
      
      if (!isInValidPath && !filePath.includes('workflows\\\\')) {
        const output = {
          continue: true,
          systemMessage: `📁 WORKFLOW FILE LOCATION: Writing workflow to ${filePath}
Recommended structure:
- workflows/dev/ for development
- workflows/staging/ for pre-production
- workflows/production/ for deployed workflows`
        };
        console.log(JSON.stringify(output));
      }
    }
    
    process.exit(0);
  } catch (e) {
    process.exit(0);
  }
});
