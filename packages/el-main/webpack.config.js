const path = require('path');

const Aliases = require('ts-alias').default;
const SwcMinifyWebpackPlugin = require('swc-minify-webpack-plugin').SwcMinifyWebpackPlugin;
const webpack = require('webpack');

const aliases = new Aliases({ rootDir: __dirname });
const webpackAliases = aliases.forWebpack({
  modulesPath: path.resolve(__dirname, '../../node_modules'),
}).aliases;

/** @type {webpack.Configuration} */
const config = {
  mode: 'production',
  target: 'electron-main',
  entry: ['./src/index.ts'],
  output: {
    path: path.resolve(__dirname, '../../build/main'),
    filename: 'main.js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: webpackAliases,
  },
  externals: [
    {
      'class-transformer': 'commonjs2 class-transformer',
      'class-validator': 'commonjs2 class-validator',
      '@nestjs/websockets/socket-module': 'commonjs2 @nestjs/websockets/socket-module',
      '@nestjs/microservices': 'commonjs2 @nestjs/microservices',
      '@nestjs/microservices/microservices-module':
        'commonjs2 @nestjs/microservices/microservices-module',
    },
  ],
  optimization: {
    minimize: true,
    minimizer: [new SwcMinifyWebpackPlugin()],
  },
};

module.exports = config;
