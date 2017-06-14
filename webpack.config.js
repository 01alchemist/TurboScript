// Prepack Disabled due to Invariant Violation error
// const PrepackWebpackPlugin = require("prepack-webpack-plugin").default;
const path = require("path");

module.exports = {
    target: "node",
    entry: "./src/turboscript.ts",
    devtool: "inline-source-map",
    resolve: {
        // Add ".ts" and ".tsx" as a resolvable extension.
        extensions: [".ts", ".js"]
    },
    plugins: [
        // new PrepackWebpackPlugin({})
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
        filename: "turboscript.js",
        path: path.resolve(__dirname, "lib"),
        library: "turboscript",
        libraryTarget: "umd"
    }
};
