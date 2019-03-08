let webpack = require('webpack');
let path = require('path');

module.exports = {
    entry: path.resolve(__dirname) + "/public/javascripts/renderer.js",
    output: {
        path: __dirname + "/public/",
        filename: "bundle.js"
    }
};
