const config = {
  development: {
    firebase: {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    },
    apiUrl: 'http://localhost:3000',
    environment: 'development',
    debug: true,
    logLevel: 'debug'
  },
  production: {
    firebase: {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    },
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://yourdomain.com',
    environment: 'production',
    debug: false,
    logLevel: 'error'
  },
  test: {
    firebase: {
      // Test-specific config or mocks
    },
    apiUrl: 'http://localhost:3000',
    environment: 'test',
    debug: true,
    logLevel: 'debug'
  }
};

const env = process.env.NODE_ENV || 'development';

if (!config[env]) {
  console.warn(`Environment "${env}" not found in config, falling back to development`);
}

export default config[env] || config.development;