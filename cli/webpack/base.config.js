const path = require('path');

module.exports = {
  target: 'node',
  entry: path.resolve(__dirname, "../src/cli.js"),
  externals: { 
    canvas: '{}' 
  },
  optimization: {
    minimize: false
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        type: 'javascript/esm',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.js'],
    modules: [
      path.resolve(__dirname, "../src"), 
      path.resolve(__dirname, "../node_modules")
    ]
  }
};
