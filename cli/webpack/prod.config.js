const path = require('path');
const merge = require('webpack-merge').merge;
const common = require('./base.config.js');

module.exports = merge(common, {
  mode: 'production',
  output: {
    filename: 'prod.js',
    path: path.resolve(__dirname, '../dist'),
  },
});