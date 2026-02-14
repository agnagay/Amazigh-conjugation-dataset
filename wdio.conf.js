export const config = {
  runner: "local",

  specs: ["test/specs/test10.spec.js"],

  exclude: [],

  maxInstances: 1,

  capabilities: [
    {
      browserName: "chrome",
      "goog:chromeOptions": {
        args: [
          "--no-sandbox",
          "--disable-dev-shm-usage",
          "--disable-web-security",
          "--allow-running-insecure-content",
          "--disable-blink-features=AutomationControlled",
          "--disable-extensions",
          "--disable-gpu",
          "--disable-software-rasterizer",
          "--window-size=1920,1080",
        ],
        prefs: {
          "profile.default_content_setting_values.notifications": 2,
          "profile.default_content_settings.popups": 0,
        },
      },
      acceptInsecureCerts: true,
    },
  ],

  logLevel: "info",
  bail: 0,
  baseUrl: "https://tal2.ircam.ma",

  waitforTimeout: 60000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  framework: "mocha",

  reporters: ["spec"],

  // Hooks
  onPrepare: function (config, capabilities) {
    console.log("🚀 Starting WebDriverIO test suite...");
  },

  before: async function (capabilities, specs) {
    console.log("⚙️  Setting up browser session...");
    await browser.setTimeout({
      implicit: 30000,
      pageLoad: 90000,
      script: 60000,
    });
    console.log("✅ Browser session ready");
  },

  after: function (result, capabilities, specs) {
    console.log("✅ Test execution completed");
  },

  onComplete: function (exitCode, config, capabilities, results) {
    console.log("🎉 All tests completed!");
  },

  mochaOpts: {
    ui: "bdd",
    timeout: 86400000, // 24 hours
    retries: 0,
  },

  // Path to ChromeDriver binary
  // WebDriverIO v9 will automatically find chromedriver in node_modules
  automationProtocol: "webdriver",
};
