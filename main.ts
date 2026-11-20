// A working news-image-20261120 entry (Node 22, standard library only): its image is
// the poster.png beside this file, and the program copies it to /output/entry.png.
// Before copying it validates the image against the competition's gate, so a bad
// file fails loudly here instead of silently entering as an invalid entry:
//   - the file exists and is readable
//   - its first bytes are the PNG signature
//   - it is at most 1 MiB (1048576 bytes)
//   - its IHDR width and height are each at most 1024 pixels
// The gate takes a whole PNG of at most 1 MiB and 1024 by 1024 pixels, and the judge
// sees exactly the bytes copied.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const MAX_BYTES = 1048576;
const MAX_SIDE = 1024;
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function fail(message) {
  console.error(`poster.png is not a valid entry image: ${message}`);
  process.exit(1);
}

const source = fileURLToPath(new URL('./poster.png', import.meta.url));

if (!existsSync(source)) fail(`file not found at ${source}`);

const bytes = readFileSync(source);

if (bytes.length < 33) fail(`file is only ${bytes.length} bytes, too short to be a PNG`);
if (!bytes.subarray(0, 8).equals(PNG_SIGNATURE)) fail('first bytes are not the PNG signature');
if (bytes.length > MAX_BYTES) fail(`file is ${bytes.length} bytes, over the 1 MiB limit`);
if (bytes.toString('ascii', 12, 16) !== 'IHDR') fail('no IHDR chunk where a PNG header should be');
const width = bytes.readUInt32BE(16);
const height = bytes.readUInt32BE(20);
if (width > MAX_SIDE || height > MAX_SIDE) {
  fail(`image is ${width}x${height}, over the 1024x1024 limit`);
}

copyFileSync(source, join(process.env.MAKEFUN_OUTPUT_DIR ?? '/output', 'entry.png'));
