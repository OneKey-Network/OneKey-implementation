const path = require('path');

module.exports = {
    mode: "development",
    devtool: "inline-source-map",
    entry: {
        "cmp": "./src/cmp/js/cmp.ts"
    },
    output: {
        path: path.resolve(__dirname, './public/assets/cmp/'),
        filename: "[name].js",
        libraryTarget: 'var',
        library: 'CMP'
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader"
            }
        ]
    }
};
