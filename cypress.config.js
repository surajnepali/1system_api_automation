const { defineConfig } = require("cypress");

module.exports = defineConfig({
  viewportHeight: 720,
  viewportWidth: 1080,
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  projectId: '7d3hys'
});
