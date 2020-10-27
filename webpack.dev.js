const {merge} = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: "development",
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist',
    port: 43210
  },
  watchOptions: {
    aggregateTimeout: 100,
    poll: 250
  }
});
