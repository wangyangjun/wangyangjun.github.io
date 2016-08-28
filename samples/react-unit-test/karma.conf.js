var commonConfig = require('./webpack.config.js');
var webpack = require('webpack');

module.exports = function(config) {
    config.set({
        browsers: ['Chrome'], //run in Firefox or Chrome
        singleRun: true, //just run once by default
        frameworks: ['mocha', 'sinon-chai'], //use the mocha test framework 'sinon-chai'
        files: ['test.js'],
        preprocessors: {
            'test.js': ['webpack', 'sourcemap'] //preprocess with webpack and our sourcemap loader
        },
        reporters: ['dots'], //report results in this format
        webpack: { //kind of a copy of your webpack config
            devtool: 'inline-source-map', //just do inline source maps instead of the default
            module: {
                loaders: commonConfig.module.loaders,
                noParse: [/sinon/]
            },
            resolve: {
                alias: {
                    sinon: 'sinon/pkg/sinon'
                }
            },
            externals: {
                'react/lib/ExecutionEnvironment': true,
                'react/lib/ReactContext': true,
                'react/addons': true
            }
        },
        plugins: [
            require('karma-webpack'),
            require('karma-mocha'),
            require('karma-sourcemap-loader'),
            require('karma-chrome-launcher'),
            require('karma-sinon-chai'),
            require('babel-plugin-transform-object-rest-spread')
        ],
        webpackServer: {
            noInfo: true //please don't spam the console when running in karma!
        }
    });
};