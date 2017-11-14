const path = require('path');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var ExtractScss = require('extract-text-webpack-plugin');

const copyWebpack = new CopyWebpackPlugin([
  {
    from: 'src/assets',
    to: './',
    flatten: true
}
]);

const extractScss = new ExtractScss("theme.scss.liquid");

module.exports = {
    entry: './src/scripts/theme.js',
    output: {
        filename: 'theme.js',
        path: path.resolve(__dirname, 'assets')
    },
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: ExtractScss.extract({
                    use: ["raw-loader", "sass-loader"]
                })
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel-loader"
            }
        ]
    },
    plugins: [
        copyWebpack,
        extractScss
    ]
};
