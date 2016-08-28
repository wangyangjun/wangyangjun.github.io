var path = require('path');

var loaders = [
    {
        test: /\.js|jsx$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
            presets: ['es2015', 'react'],
            plugins: ['transform-object-rest-spread']
        }
    }, {
        test: /\.json$/,
        loader: 'json'
    }
];

var webpack = require('webpack');

var prod = process.argv.indexOf("--x-prod") >= 0;
console.log("Production build? " + prod);

module.exports = {
    entry: [
        './entry.js'
    ],
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.js',
        pathinfo: !prod
    },
    devtool: prod ? 'source-map' : 'cheap-module-source-map',
    module: {
        loaders: loaders
    },
    plugins:[]
};
