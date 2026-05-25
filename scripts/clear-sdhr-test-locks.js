#!/usr/bin/env node

const {execFileSync} = require('child_process');
const fs = require('fs');
const path = require('path');

const DEFAULT_REGION = 'ap-southeast-2';
const TEST_NHI_PATTERN = /\bZ[A-Z]{2}\d{4}\b/g;

function parseArgs(argv) {
  const args = {
    env: process.env.ENV,
    region: process.env.AWS_REGION || DEFAULT_REGION,
    execute: true,
    patients: undefined,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--env') {
      args.env = argv[i + 1];
      i += 1;
    } else if (arg === '--region') {
      args.region = argv[i + 1];
      i += 1;
    } else if (arg === '--patients') {
      args.patients = argv[i + 1]
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean);
      i += 1;
    } else if (arg === '--dry-run') {
      args.execute = false;
    } else if (arg === '--execute') {
      args.execute = true;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!args.env) {
    throw new Error('Missing env. Use --env <env> or set ENV.');
  }

  return args;
}

function printHelp() {
  console.log(`Usage: yarn clear:sdhr-locks --env <env> [options]

Deletes in-progress SDHR onboarding lock rows for NHIs used by the SDHR cucumber tests.

Options:
  --env <env>          Environment name used in hnz-nia-sdhr-fw-<env>-onboarding
  --region <region>    AWS region. Defaults to ${DEFAULT_REGION}
  --patients <list>    Comma-separated NHI list. Defaults to NHIs found in features/SDHR
  --dry-run            Print matching locks without deleting them
  --execute            Delete matching locks. This is the default
`);
}

function discoverTestPatients() {
  const sdhrDir = path.join(process.cwd(), 'features', 'SDHR');
  const patients = new Set();

  for (const fileName of fs.readdirSync(sdhrDir)) {
    if (!fileName.endsWith('.feature')) {
      continue;
    }

    const content = fs.readFileSync(path.join(sdhrDir, fileName), 'utf8');
    for (const match of content.matchAll(TEST_NHI_PATTERN)) {
      patients.add(match[0]);
    }
  }

  return Array.from(patients).sort();
}

function toPatientReference(value) {
  if (value.startsWith('https://')) {
    return value;
  }
  return `https://api.hip.digital.health.nz/fhir/nhi/v1/Patient/${value}`;
}

function runAws(args, input) {
  const output = execFileSync('aws', args, {
    encoding: 'utf8',
    input,
    stdio: input === undefined ? ['ignore', 'pipe', 'pipe'] : ['pipe', 'pipe', 'pipe'],
  });
  return output ? JSON.parse(output) : undefined;
}

function scanLocks(tableName, region) {
  const matches = [];
  let exclusiveStartKey;

  do {
    const args = [
      'dynamodb',
      'scan',
      '--region',
      region,
      '--table-name',
      tableName,
      '--projection-expression',
      'id, #status, createdAt, correlationId, messageType',
      '--expression-attribute-names',
      '{"#status":"status"}',
      '--filter-expression',
      'contains(id, :separator) AND #status = :status',
      '--expression-attribute-values',
      '{":separator":{"S":"|"},":status":{"S":"in-progress"}}',
      '--output',
      'json',
    ];

    if (exclusiveStartKey) {
      args.push('--exclusive-start-key', JSON.stringify(exclusiveStartKey));
    }

    const response = runAws(args);
    matches.push(...(response.Items || []));
    exclusiveStartKey = response.LastEvaluatedKey;
  } while (exclusiveStartKey);

  return matches;
}

function fromDynamoItem(item) {
  const result = {};
  for (const [key, value] of Object.entries(item)) {
    if ('S' in value) {
      result[key] = value.S;
    } else {
      result[key] = value;
    }
  }
  return result;
}

function deleteLock(tableName, region, id) {
  runAws([
    'dynamodb',
    'delete-item',
    '--region',
    region,
    '--table-name',
    tableName,
    '--key',
    JSON.stringify({id: {S: id}}),
    '--output',
    'json',
  ]);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const tableName = `hnz-nia-sdhr-fw-${args.env}-onboarding`;
  const patientRefs = new Set((args.patients || discoverTestPatients()).map(toPatientReference));

  const locks = scanLocks(tableName, args.region)
      .map(fromDynamoItem)
      .filter((item) => {
        return Array.from(patientRefs).some((patientRef) => item.id.startsWith(`${patientRef}|`));
      })
      .sort((a, b) => a.id.localeCompare(b.id));

  console.log(JSON.stringify({
    tableName,
    region: args.region,
    mode: args.execute ? 'execute' : 'dry-run',
    patientCount: patientRefs.size,
    lockCount: locks.length,
    locks,
  }, null, 2));

  if (!args.execute || locks.length === 0) {
    return;
  }

  for (const lock of locks) {
    deleteLock(tableName, args.region, lock.id);
  }

  console.log(`Deleted ${locks.length} in-progress SDHR test lock rows from ${tableName}`);
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
