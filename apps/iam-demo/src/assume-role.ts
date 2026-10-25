import {
  AssumeRoleCommand,
  type Credentials,
  STSClient,
} from "@aws-sdk/client-sts";

export interface AssumeRoleInput {
  roleArn: string;
  sessionName: string;
  durationSeconds?: number;
}

export interface TemporaryCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
  expiration?: Date;
}

type STSSender = Pick<STSClient, "send">;

function validateCredentials(
  credentials: Credentials | undefined,
): TemporaryCredentials {
  if (
    !credentials?.AccessKeyId ||
    !credentials.SecretAccessKey ||
    !credentials.SessionToken
  ) {
    throw new Error("STS did not return complete temporary credentials");
  }

  return {
    accessKeyId: credentials.AccessKeyId,
    secretAccessKey: credentials.SecretAccessKey,
    sessionToken: credentials.SessionToken,
    expiration: credentials.Expiration,
  };
}

export async function assumeRole(
  client: STSSender,
  input: AssumeRoleInput,
): Promise<TemporaryCredentials> {
  if (!/^arn:aws[a-zA-Z-]*:iam::\d{12}:role\/.+$/.test(input.roleArn)) {
    throw new Error("Invalid IAM role ARN");
  }

  if (!/^[\w+=,.@-]{2,64}$/.test(input.sessionName)) {
    throw new Error("Invalid role session name");
  }

  const response = await client.send(
    new AssumeRoleCommand({
      RoleArn: input.roleArn,
      RoleSessionName: input.sessionName,
      DurationSeconds: input.durationSeconds ?? 3600,
    }),
  );

  return validateCredentials(response.Credentials);
}
