// SOLENNE entry: copy the committed entry.png into the output directory.
//
// Guards, all checked before anything is written:
//   - entry.png must be a PNG or JPEG (magic bytes)
//   - entry.png must be at most 1 MiB
//   - entry.png must be at most 1024x1024 (parsed from the PNG IHDR chunk
//     or the JPEG SOF0/SOF1/SOF2 frame header)
// Any failure prints a clear error to stderr and exits 1.

import { copyFileSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const MAX_BYTES = 1_048_576;
const MAX_DIM = 1024;

function fail(message: string): never {
  console.error(`error: ${message}`);
  process.exit(1);
}

function parsePngDimensions(buf: Buffer): { width: number; height: number } {
  // PNG: 8-byte signature, then IHDR chunk; width/height are big-endian
  // uint32 at offsets 16 and 20.
  if (buf.length < 24) fail("entry.png is too small to be a PNG");
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  return { width, height };
}

function parseJpegDimensions(buf: Buffer): { width: number; height: number } {
  // Walk the JPEG segments until the SOF0/SOF1/SOF2 frame header.
  let i = 2;
  while (i + 1 < buf.length) {
    if (buf[i] !== 0xff) fail("entry.png is not a valid JPEG");
    let marker = buf[i + 1];
    // Skip padding 0xFF bytes.
    while (marker === 0xff) {
      i += 1;
      marker = buf[i + 1];
    }
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      i += 2;
      continue;
    }
    if (marker === 0xd9 || marker === 0xda) {
      fail("entry.png has no SOF frame header");
    }
    if (i + 4 > buf.length) fail("entry.png is truncated");
    const length = buf.readUInt16BE(i + 2);
    if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
      // SOF: precision (1 byte), height (2), width (2).
      const height = buf.readUInt16BE(i + 5);
      const width = buf.readUInt16BE(i + 7);
      return { width, height };
    }
    i += 2 + length;
  }
  fail("entry.png has no SOF frame header");
}

function main(): void {
  const here = resolve(import.meta.dirname);
  const src = join(here, "entry.png");
  let buf: Buffer;
  try {
    buf = readFileSync(src);
  } catch {
    fail("entry.png is missing");
  }

  let kind: "PNG" | "JPEG";
  let dims: { width: number; height: number };
  if (buf.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]))) {
    kind = "PNG";
    dims = parsePngDimensions(buf);
  } else if (buf.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) {
    kind = "JPEG";
    dims = parseJpegDimensions(buf);
  } else {
    fail("entry.png is neither PNG nor JPEG, refusing to copy");
  }

  if (buf.length > MAX_BYTES) {
    fail(`entry.png is ${buf.length} bytes, over the 1 MiB cap, refusing to copy`);
  }
  if (dims.width > MAX_DIM || dims.height > MAX_DIM) {
    fail(
      `entry.png is ${dims.width}x${dims.height}, over the 1024x1024 cap, refusing to copy`,
    );
  }

  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const dst = join(outDir, "entry.png");
  copyFileSync(src, dst);
  console.log(`wrote ${dst} (${buf.length} bytes, ${dims.width}x${dims.height} ${kind})`);
}

main();
