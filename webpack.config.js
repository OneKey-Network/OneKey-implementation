const path = require('path');

module.exports = {
    mode: "development",
    devtool: "inline-source-map",
    entry: {
        "prebid-sso-lib": "./paf-mvp-frontend/src/lib/prebid-sso-lib.ts",
    },
    output: {
        path: path.resolve(__dirname, './public/assets/'),
        filename: "[name].js",
        libraryTarget: 'var',
        library: 'Prebid'
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
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
