// Prepack Disabled due to Invariant Violation error also prepack not yet compatible with node 8
// const PrepackWebpackPlugin = require("prepack-webpack-plugin").default;
const path = require("path");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    target: "node",
    entry: {
        "turboscript": "./src/index.ts",
        // "turboscript.min": "./src/index.ts"
    },
    devtool: "source-map",
    resolve: {
        // Add ".ts" and ".tsx" as a resolvable extension.
        extensions: [".ts", ".js"]
    },
    plugins: [
        // new PrepackWebpackPlugin({})
        new UglifyJsPlugin({
            mangle: false, compress: true,
            minimize: true,
            include: /\.min\.js$/,
        })
    ],
    module: {
        rules: [
            {
                test: /\.(tbs|txt)$/,
                loader: "raw-loader"
            },
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                exclude: /node_modules/,
            }
        ]
    },
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "lib"),
        library: "turboscript",
        libraryTarget: "umd"
    }
};
