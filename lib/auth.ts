"use client";

const TOKEN_KEY = "zoa_auth";

export interface AuthSession {
  idToken: string;
  accessToken: string;
  refreshToken?: string;
  email: string;
  name?: string;
  expiresAt: number;
}

function isBrowser() {
  return typeof window !== "undefined";
}

export function getSession(): AuthSession | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as AuthSession;
    if (session.expiresAt && session.expiresAt < Date.now()) {
      // keep session if refresh token exists; API still uses idToken until re-login
      if (!session.refreshToken) {
        localStorage.removeItem(TOKEN_KEY);
        return null;
      }
    }
    return session;
  } catch {
    return null;
  }
}

export function saveSession(session: AuthSession) {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
}

const poolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID ?? "";
const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID ?? "";
const region =
  process.env.NEXT_PUBLIC_AWS_REGION ?? poolId.split("_")[0] ?? "eu-west-1";

export function isCognitoConfigured() {
  return Boolean(poolId && clientId);
}

async function cognitoRequest(
  target: string,
  body: Record<string, unknown>,
) {
  const res = await fetch(`https://cognito-idp.${region}.amazonaws.com/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": `AWSCognitoIdentityProviderService.${target}`,
    },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    const msg =
      typeof data.message === "string"
        ? data.message
        : typeof data.__type === "string"
          ? data.__type
          : "Cognito request failed";
    throw new Error(msg);
  }
  return data;
}

function parseIdToken(idToken: string) {
  const payload = JSON.parse(atob(idToken.split(".")[1] ?? "")) as {
    email?: string;
    name?: string;
    given_name?: string;
    exp?: number;
  };
  return payload;
}

export async function signUp(input: {
  email: string;
  password: string;
  givenName: string;
  familyName: string;
}) {
  if (!isCognitoConfigured()) {
    // Local mock for UI development without Cognito
    saveSession({
      idToken: "dev-token",
      accessToken: "dev-token",
      email: input.email,
      name: `${input.givenName} ${input.familyName}`.trim(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });
    return { needsConfirmation: false };
  }

  await cognitoRequest("SignUp", {
    ClientId: clientId,
    Username: input.email,
    Password: input.password,
    UserAttributes: [
      { Name: "email", Value: input.email },
      { Name: "given_name", Value: input.givenName },
      { Name: "family_name", Value: input.familyName },
    ],
  });

  return { needsConfirmation: true };
}

export async function confirmSignUp(email: string, code: string) {
  if (!isCognitoConfigured()) return;
  await cognitoRequest("ConfirmSignUp", {
    ClientId: clientId,
    Username: email,
    ConfirmationCode: code,
  });
}

export async function signIn(email: string, password: string) {
  if (!isCognitoConfigured()) {
    saveSession({
      idToken: "dev-token",
      accessToken: "dev-token",
      email,
      name: email.split("@")[0],
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });
    return getSession()!;
  }

  const data = await cognitoRequest("InitiateAuth", {
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: clientId,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
    },
  });

  const result = data.AuthenticationResult as
    | {
        IdToken: string;
        AccessToken: string;
        RefreshToken?: string;
        ExpiresIn: number;
      }
    | undefined;

  if (!result) {
    throw new Error("Authentication did not return tokens");
  }

  const claims = parseIdToken(result.IdToken);
  const session: AuthSession = {
    idToken: result.IdToken,
    accessToken: result.AccessToken,
    refreshToken: result.RefreshToken,
    email: claims.email ?? email,
    name: claims.name ?? claims.given_name,
    expiresAt: Date.now() + result.ExpiresIn * 1000,
  };
  saveSession(session);
  return session;
}

export function signOut() {
  clearSession();
}
