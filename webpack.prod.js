const {merge} = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = merge(common, {
    entry: './src/application.ts',
    mode: 'production',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'app.js'
    },
    devtool: 'source-map',
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin()],
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: "src/index.html", to: "." }
            ]
        })
    ]
});
