import { describe, expect, it, vi } from "vitest";
import { STSClient } from "@aws-sdk/client-sts";

import { assumeRole } from "./assume-role";

const roleArn = "arn:aws:iam::222222222222:role/ReadOnlyAppRole";

describe("assumeRole", () => {
  it("returns temporary credentials", async () => {
    const send = vi.fn().mockResolvedValue({
      Credentials: {
        AccessKeyId: "ASIAEXAMPLE",
        SecretAccessKey: "example-secret",
        SessionToken: "example-session-token",
        Expiration: new Date("2030-01-01"),
      },
    });

    const result = await assumeRole(
      { send } as unknown as Pick<STSClient, "send">,
      {
        roleArn,
        sessionName: "test-session",
      },
    );

    expect(result.accessKeyId).toBe("ASIAEXAMPLE");
    expect(result.expiration).toBeInstanceOf(Date);
    expect(send).toHaveBeenCalledOnce();
  });

  it("rejects an invalid role ARN", async () => {
    const send = vi.fn();

    await expect(
      assumeRole({ send } as unknown as Pick<STSClient, "send">, {
        roleArn: "invalid-role",
        sessionName: "test-session",
      }),
    ).rejects.toThrow("Invalid IAM role ARN");

    expect(send).not.toHaveBeenCalled();
  });

  it("rejects incomplete credentials", async () => {
    const send = vi.fn().mockResolvedValue({
      Credentials: {
        AccessKeyId: "ASIAEXAMPLE",
      },
    });

    await expect(
      assumeRole({ send } as unknown as Pick<STSClient, "send">, {
        roleArn,
        sessionName: "test-session",
      }),
    ).rejects.toThrow("STS did not return complete temporary credentials");
  });
});
