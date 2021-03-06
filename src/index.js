// Inspired by https://github.com/zeit/next.js/blob/canary/packages/next/lib/load-env-config.ts
/* eslint no-continue: 0,  no-restricted-syntax: 0 */
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');

let combinedEnv;

const loadEnvConfig = (environment, dir = process.cwd()) => {
  // don't reload env if we already have since this breaks escaped
  // environment values e.g. \$ENV_FILE_KEY
  if (combinedEnv) return combinedEnv;

  const dotenvFiles = [
    `.env.${environment}.local`,
    `.env.${environment}`,
  ];

  combinedEnv = {
    ...process.env,
  };

  for (const envFile of dotenvFiles) {
    // only load .env if the user provided has an env config file
    const dotEnvPath = path.join(dir, envFile);

    try {
      const stats = fs.statSync(dotEnvPath);

      // make sure to only attempt to read files
      if (!stats.isFile()) {
        continue;
      }

      const contents = fs.readFileSync(dotEnvPath, 'utf8');
      let result = {};
      result.parsed = dotenv.parse(contents);

      result = dotenvExpand(result);

      if (result.parsed) {
        console.info(`Loaded env from ${envFile}`);
      }

      Object.assign(combinedEnv, result.parsed);
    } catch (err) {
      if (err.code !== 'ENOENT') {
        console.error(`Failed to load env from ${envFile}`, err);
      }
    }
  }

  // load global env values to process.env
  for (const key of Object.keys(combinedEnv)) {
    if (typeof process.env[key] === 'undefined') {
      process.env[key] = combinedEnv[key];
    }
  }

  return combinedEnv;
};

module.exports = loadEnvConfig;
