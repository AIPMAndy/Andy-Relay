#!/usr/bin/env node
/**
 * Build a compact, provider-ready CodexPM worker packet from JSON.
 * TypeScript/Node.js version for Claude Code environments.
 */

interface TaskSpec {
  title?: string;
  objective: string;
  deliverable: string;
  context?: string | string[];
  constraints?: string | string[];
  acceptance: string | string[];
  evidence?: string | string[];
}

interface NormalizedTaskSpec {
  title: string;
  objective: string;
  deliverable: string;
  context: string[];
  constraints: string[];
  acceptance: string[];
  evidence: string[];
}

const LIST_FIELDS = ['context', 'constraints', 'acceptance', 'evidence'] as const;

function asItems(value: unknown, field: string): string[] {
  if (value === null || value === undefined) {
    return [];
  }

  let arr: unknown[];
  if (typeof value === 'string') {
    arr = [value];
  } else if (Array.isArray(value)) {
    arr = value;
  } else {
    throw new Error(`${field} must be a string or a list of strings`);
  }

  if (!arr.every(item => typeof item === 'string')) {
    throw new Error(`${field} must be a string or a list of strings`);
  }

  return (arr as string[])
    .map(item => item.trim())
    .filter(item => item.length > 0);
}

export function validate(spec: TaskSpec): NormalizedTaskSpec {
  if (typeof spec !== 'object' || spec === null || Array.isArray(spec)) {
    throw new Error('input must be a JSON object');
  }

  const normalized: Partial<NormalizedTaskSpec> = { ...spec };

  // Validate required string fields
  for (const field of ['objective', 'deliverable'] as const) {
    const value = spec[field];
    if (typeof value !== 'string' || !value.trim()) {
      throw new Error(`missing required non-empty string: ${field}`);
    }
    normalized[field] = value.trim();
  }

  // Normalize list fields
  for (const field of LIST_FIELDS) {
    normalized[field] = asItems(spec[field], field);
  }

  // Validate acceptance has at least one check
  if (!normalized.acceptance || normalized.acceptance.length === 0) {
    throw new Error('acceptance must contain at least one check');
  }

  // Handle title
  const title = spec.title || 'Delegated task';
  if (typeof title !== 'string' || !title.trim()) {
    throw new Error('title must be a non-empty string when provided');
  }
  normalized.title = title.trim();

  return normalized as NormalizedTaskSpec;
}

function section(name: string, items: string[]): string[] {
  if (items.length === 0) {
    return [];
  }
  return [
    `## ${name}`,
    ...items.map(item => `- ${item}`),
    ''
  ];
}

export function buildPacket(spec: TaskSpec, provider: string): string {
  const data = validate(spec);

  const lines = [
    `# ${data.title}`,
    '',
    `You are the ${provider} specialist worker. The AI PM is the accountable project manager.`,
    'Complete only the bounded assignment below; do not expand its scope or perform external actions.',
    '',
    '## Objective',
    data.objective,
    '',
    '## Deliverable',
    data.deliverable,
    '',
  ];

  lines.push(...section('Context', data.context));
  lines.push(...section('Constraints', data.constraints));
  lines.push(...section('Acceptance checks', data.acceptance));
  lines.push(...section('Evidence requirements', data.evidence));

  lines.push(
    '## Response contract',
    'Return exactly these four sections:',
    '1. RESULT - the requested deliverable, ready for the AI PM to inspect.',
    '2. EVIDENCE - sources, quotations, calculations, or artifacts supporting material claims.',
    '3. GAPS - uncertainty, missing access, unsupported claims, and anything not completed.',
    '4. NEXT - the single most useful verification or follow-up action for the AI PM.',
    '',
    'Do not claim to have opened a source, used a tool, or completed an action unless you actually did.',
  );

  return lines.join('\n');
}

export function selfTest(): void {
  const packet = buildPacket(
    {
      title: 'Market scan',
      objective: 'Find current official pricing.',
      deliverable: 'A comparison table with source links.',
      context: ['Use public product pages only.'],
      constraints: 'Do not infer missing prices.',
      acceptance: ['Every price has an opened official source.'],
      evidence: ['Include page title and URL.'],
    },
    'Gemini'
  );

  const expectations = [
    '# Market scan',
    'Gemini specialist worker',
    '## Response contract',
    '4. NEXT',
  ];

  for (const expected of expectations) {
    if (!packet.includes(expected)) {
      throw new Error(`Self-test failed: missing "${expected}"`);
    }
  }

  console.log('task_packet self-test passed');
}

// CLI support
if (require.main === module) {
  const args = process.argv.slice(2);

  const getArg = (flag: string, defaultValue?: string): string | undefined => {
    const index = args.indexOf(flag);
    if (index === -1) return defaultValue;
    return args[index + 1] || defaultValue;
  };

  const hasFlag = (flag: string): boolean => args.includes(flag);

  try {
    if (hasFlag('--help') || hasFlag('-h')) {
      console.log(`
Usage: node task_packet.js [options]

Build a compact CodexPM task packet from a JSON object.

Options:
  --provider <name>    Worker provider name (default: "web AI")
  --input <file>       JSON file; omit to read JSON from stdin
  --self-test          Run built-in checks
  -h, --help           Show this help message

JSON Schema:
{
  "title": "string (optional, default: 'Delegated task')",
  "objective": "string (required)",
  "deliverable": "string (required)",
  "context": "string | string[] (optional)",
  "constraints": "string | string[] (optional)",
  "acceptance": "string | string[] (required, at least one)",
  "evidence": "string | string[] (optional)"
}

Example:
  echo '{"objective":"Find pricing","deliverable":"Table","acceptance":"Complete"}' | node task_packet.js --provider Gemini
      `);
      process.exit(0);
    }

    if (hasFlag('--self-test')) {
      selfTest();
      process.exit(0);
    }

    const provider = getArg('--provider', 'web AI')?.trim() || 'web AI';
    const inputFile = getArg('--input');

    let spec: TaskSpec;
    if (inputFile) {
      const fs = require('fs');
      const content = fs.readFileSync(inputFile, 'utf-8');
      spec = JSON.parse(content);
    } else {
      // Read from stdin
      const fs = require('fs');
      const content = fs.readFileSync(0, 'utf-8');
      spec = JSON.parse(content);
    }

    const packet = buildPacket(spec, provider);
    console.log(packet);
    process.exit(0);
  } catch (error) {
    console.error(`error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(2);
  }
}
