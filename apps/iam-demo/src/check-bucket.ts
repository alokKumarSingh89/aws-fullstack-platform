import { HeadBucketCommand, S3Client } from "@aws-sdk/client-s3";

const region = process.env.AWS_REGION ?? "ap-south-1";
const bucketName = process.env.AWS_BUCKET_NAME;

async function main(): Promise<void> {
  if (!bucketName) {
    throw new Error("AWS_BUCKET_NAME is required");
  }
  const client = new S3Client({
    region,
  });
  try {
    await client.send(
      new HeadBucketCommand({
        Bucket: bucketName,
      }),
    );

    console.log("Bucket is accessible");
  } catch (error) {
    client.destroy();
  }
}
main().catch((error: unknown) => {
  console.error(
    "S3 check failed:",
    error instanceof Error ? error.message : error,
  );
  process.exitCode = 1;
});
