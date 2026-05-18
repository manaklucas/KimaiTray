import i18n from "../shared/i18n";
import {
  createKimaiClient,
  isInsecureUrl,
  KimaiApiError,
  type KimaiClient,
} from "./kimaiClient";
import type { KimaiUser, KimaiVersion } from "./kimaiTypes";

export interface ConnectionResult {
  success: boolean;
  user?: KimaiUser;
  version?: KimaiVersion;
  insecure?: boolean;
  error?: string;
  errorCode?: string;
}

export async function getCurrentUser(
  client: KimaiClient,
): Promise<KimaiUser> {
  return client.get<KimaiUser>("/api/users/me");
}

export async function getVersion(
  client: KimaiClient,
): Promise<KimaiVersion> {
  return client.get<KimaiVersion>("/api/version");
}

export async function testConnection(
  baseUrl: string,
  token: string,
): Promise<ConnectionResult> {
  if (!baseUrl) {
    return { success: false, error: i18n.t("connection.urlRequired") };
  }
  if (!token) {
    return { success: false, error: i18n.t("connection.tokenRequired") };
  }

  const insecure = isInsecureUrl(baseUrl);
  const client = createKimaiClient(baseUrl, token);

  try {
    const [user, version] = await Promise.all([
      getCurrentUser(client),
      getVersion(client),
    ]);
    return { success: true, user, version, insecure };
  } catch (err) {
    if (err instanceof KimaiApiError) {
      return {
        success: false,
        error: err.message,
        errorCode: err.code,
        insecure,
      };
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
      insecure,
    };
  }
}
