/**
 * Downloads and decompresses keyforge.db from R2.
 *
 * Required env vars:
 *   R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ACCOUNT_ID, R2_BUCKET
 * Optional:
 *   R2_KEY  (defaults to "keyforge.db.zst")
 */
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import zlib from "zlib";
import { fileURLToPath } from "url";
import { Readable } from "stream";
import { pipeline } from "stream/promises";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.join(__dirname, "../keyforge.db");

function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
  return val;
}

async function fetchSourceDb() {
  const accountId = requireEnv("R2_ACCOUNT_ID");
  const bucket = requireEnv("R2_BUCKET");
  const key = process.env.R2_KEY ?? "keyforge.db.zst";

  const client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
    },
  });

  console.log(`Downloading s3://${bucket}/${key} → keyforge.db`);

  const response = await client.send(
    new GetObjectCommand({ Bucket: bucket, Key: key }),
  );

  if (!response.Body) {
    console.error("Empty response body from R2");
    process.exit(1);
  }

  await pipeline(
    response.Body as Readable,
    ...(key.endsWith(".zst") ? [zlib.createZstdDecompress()] : []),
    fs.createWriteStream(OUTPUT_PATH),
  );

  const { size } = fs.statSync(OUTPUT_PATH);
  console.log(`✅ Written keyforge.db (${(size / 1024 / 1024).toFixed(1)} MB)`);
}

fetchSourceDb();
