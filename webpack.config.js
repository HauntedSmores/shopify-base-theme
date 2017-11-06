const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
var CopyWebpackPlugin = require('copy-webpack-plugin');

const extractSass = new ExtractTextPlugin({
  filename: "theme.scss.liquid",
  disable: process.env.NODE_ENV === "development"
});

const copyWebpack = new CopyWebpackPlugin([
  {
    from: 'src/templates', 
    to: '../../dist/templates' 
  },
  {
    from: 'src/snippets', 
    to: '../../dist/snippets' 
  },
  {
    from: 'src/sections', 
    to: '../../dist/sections' 
  },
  {
    from: 'src/layouts', 
    to: '../../dist/layouts' 
  },
  {
    from: 'src/locales', 
    to: '../../dist/locales' 
  },
  {
    from: 'src/config.yml', 
    to: '../../dist/config.yml' 
  }
]);

module.exports = {
  entry: './src/assets/scripts/theme.js',
  output: {
    filename: 'theme.js',
    path: path.resolve(__dirname, 'dist/assets')
  },
  module: {
    rules: [{
      test: /\.scss$/,
      // include: '/src/assets/styles/',
      use: extractSass.extract({
          use: [{
            loader: "css-loader"
          }, {
            loader: "sass-loader"
          }],
          // use style-loader in development
          fallback: "style-loader"
      })
    }]
  },
  plugins: [
    extractSass,
    copyWebpack
  ]
};