// Prepack Disabled due to Invariant Violation error also prepack not yet compatible with node 8
// const PrepackWebpackPlugin = require("prepack-webpack-plugin").default;
const path = require("path");
const webpack = require("webpack");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const entry = process.env.NODE_ENV === "dev" ? {"turboscript": "./src/index.ts"} : {
    "turboscript": "./src/index.ts",
    "turboscript.min": "./src/index.ts"
};

module.exports = {
    target: "node",
    entry: entry,
    devtool: "source-map",
    resolve: {
        // Add ".ts" and ".tsx" as a resolvable extension.
        extensions: [".ts", ".js"]
    },
    plugins: [
        // new PrepackWebpackPlugin({})
        new webpack.DefinePlugin({
            VERSION: JSON.stringify(require("./package.json").version)
        }),
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
                test: /\.(wasm)$/,
                loader: "bin-loader"
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
        libraryTarget: "var"
    }
};
