const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractScss = require('extract-text-webpack-plugin');

const copyWebpack = new CopyWebpackPlugin([{
    from: 'src/assets',
    to: './',
    flatten: true
}]);

const extractScss = new ExtractScss("theme.scss.liquid");

module.exports = env => {
    return {
        entry: './src/scripts/theme.js',
        output: {
            filename: 'theme.js',
            path: path.resolve(__dirname, 'assets')
        },
        devtool: process.env.production ? 'cheap-source-map' : 'source-map',
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
            extractScss,
            copyWebpack
        ]
    }
};
