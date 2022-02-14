const path = require('path');

module.exports = {
    mode: "development",
    devtool: "inline-source-map",
    entry: {
        "paf-lib": "./node_modules/paf-mvp-frontend/dist/paf-lib.js",
    },
    output: {
        path: path.resolve(__dirname, './public/assets/'),
        filename: "[name].js",
        library: 'PAF'
    },
};
