/**
 * Shared AWS client config.
 *
 * Amplify Hosting's Next.js SSR compute does NOT expose usable credentials to
 * the runtime: the default provider chain resolves nothing and the SDK throws
 * CredentialsProviderError (verified against production). So the app has to
 * carry its own IAM user credentials.
 *
 * They cannot be called AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY, because
 * those names are reserved by the Lambda runtime and cannot be set as function
 * environment variables - which is why amplify.yml excludes AWS_* when it
 * writes .env.production. Hence the APP_ prefix.
 *
 * If the APP_ pair is absent the config falls back to the default chain, so
 * local development still works from a profile or SSO, and so this keeps
 * working unmodified if the platform ever does attach a real execution role.
 */
export function awsClientConfig(): {
  region: string;
  credentials?: { accessKeyId: string; secretAccessKey: string };
} {
  // APP_AWS_REGION wins so the region can be pointed at wherever the SES
  // identity and DynamoDB tables actually live, independently of where the
  // Lambda happens to run.
  const region =
    process.env.APP_AWS_REGION ?? process.env.AWS_REGION ?? "eu-west-2";

  const accessKeyId = process.env.APP_AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.APP_AWS_SECRET_ACCESS_KEY;

  if (accessKeyId && secretAccessKey) {
    return { region, credentials: { accessKeyId, secretAccessKey } };
  }
  return { region };
}

/**
 * Whether an explicit credential pair is present. Used by the data paths that
 * need to decide between talking to AWS and falling back to bundled content,
 * rather than attempting a call that is certain to fail.
 */
export function hasAwsCredentials(): boolean {
  return !!(process.env.APP_AWS_ACCESS_KEY_ID && process.env.APP_AWS_SECRET_ACCESS_KEY);
}
