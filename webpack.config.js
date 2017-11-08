const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
var CopyWebpackPlugin = require('copy-webpack-plugin');

const extractSass = new ExtractTextPlugin({
  filename: "theme.scss.liquid",
  disable: process.env.NODE_ENV === "development"
});

const copyWebpack = new CopyWebpackPlugin([
	 {
	    from: 'src',
	    to: '../',
		ignore: 'assets/**'
	},
	{
		from: 'src/assets/images',
		to: './',
		flatten: true
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
      use: extractSass.extract(["css-loader","sass-loader"])
    }]
  },
  plugins: [
    extractSass,
    copyWebpack
  ]
};
