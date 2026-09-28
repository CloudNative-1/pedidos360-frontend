import {
  LogLevel,
  type Configuration,
} from '@azure/msal-browser';

const clientId =
  import.meta.env.VITE_AZURE_CLIENT_ID;

const tenantId =
  import.meta.env.VITE_AZURE_TENANT_ID;

const redirectUri =
  import.meta.env.VITE_AZURE_REDIRECT_URI;

export const msalConfig: Configuration = {
  auth: {
    clientId,

    authority:
      `https://login.microsoftonline.com/${tenantId}`,

    redirectUri,
  },

  cache: {
    cacheLocation: 'localStorage',
  },

  system: {
    loggerOptions: {
      loggerCallback: (
        level,
        message,
        containsPii,
      ) => {
        if (containsPii) {
          return;
        }

        if (
          level === LogLevel.Error &&
          import.meta.env.DEV
        ) {
          console.error(message);
        }
      },

      logLevel: LogLevel.Error,
    },
  },
};

export const loginRequest = {
  scopes: [
    'openid',
    'profile',
  ],
};

const apiBaseUrl =
  (
    import.meta.env
      .VITE_API_BASE_URL as
      | string
      | undefined
  )
    ?.replace(/\/$/, '') ?? '';

const apiScopes =
  (
    import.meta.env
      .VITE_API_SCOPE as
      | string
      | undefined
  ) ?? '';

export const apiConfig = {
  baseUrl: apiBaseUrl,

  scopes: apiScopes
    .split(/\s+/)
    .map((scope) =>
      scope.trim(),
    )
    .filter(Boolean),
};

export const apiRequest = {
  scopes: apiConfig.scopes,
};