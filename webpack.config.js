var path = require('path');

module.exports = {
    target: 'node',
    entry: './src/turboscript.ts',
    resolve: {
        // Add '.ts' and '.tsx' as a resolvable extension.
        extensions: [".ts", ".js"]
    },
    module: {
        rules: [
            {
                test: /\.(tbs|txt)$/,
                loader: 'raw-loader'
            },
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            }
        ]
    },
    output: {
        filename: 'turbo.js',
        path: path.resolve(__dirname, 'lib'),
        library: "turbo",
        libraryTarget: "umd"
    }
};
