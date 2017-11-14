const path = require('path');
var CopyWebpackPlugin = require('copy-webpack-plugin');

const copyWebpack = new CopyWebpackPlugin([{
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
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].scss.liquid'
                        }
                    },
                    "extract-loader",
                    "raw-loader",
                    "sass-loader"
                ]
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel-loader"
            }
        ]
    },
    plugins: [
        copyWebpack
    ]
};
