const path = require('path');

/** @type {import('next').NextConfig} */
const config = {
  output: 'export',
  distDir: '../../build/renderer/out',
  reactStrictMode: true,
  sassOptions: {
    includePaths: [path.join(__dirname, 'src', 'styles')],
  },
};

module.exports = config;
