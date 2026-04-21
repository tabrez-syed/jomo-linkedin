import { defineConfig } from 'wxt';

const chromeUserDataDir = process.env.JOMO_CHROME_USER_DATA_DIR ?? './.wxt/chrome-data';

export default defineConfig({
  manifest: {
    name: 'Jomo for LinkedIn',
    description: 'Session timer + end-of-feed pause-gate. One small moment of friction.',
    version: '0.1.0',
    permissions: ['storage'],
    host_permissions: ['*://*.linkedin.com/*']
  },
  webExt: {
    chromiumArgs: [`--user-data-dir=${chromeUserDataDir}`]
  }
});
