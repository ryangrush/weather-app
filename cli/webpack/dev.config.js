const path = require('path');
const merge = require('webpack-merge').merge;
const common = require('./base.config.js');

module.exports = merge(common, {
  mode: 'development',
  output: {
    filename: 'dev.js',
    path: path.resolve(__dirname, '../dist'),
  },
  devServer: {
    hot: true
  }
});