## Unit test for React.js App

### Introduction
A React App is consisted of components. A React component might contains multi sub-components. A well designed component should be reusable and stable. To achieve this, unit test is a necessity. In this article, I will introduce the method of unit test we used in our production development.

In our React application development, we use [Webpack](https://webpack.github.io/) to generate static assets and combine [Karma](https://karma-runner.github.io/1.0/index.html), [Mocha](https://mochajs.org/), [Enzyme](http://airbnb.io/enzyme/index.html), [Sinon](http://sinonjs.org/), and [Chai](http://chaijs.com/) together to build our unit tests. 

#### Karma  

Karma is a test runner that allows us to execute our test JavaScript code in multiple real browsers during development. Karma is not a testing framework, nor an assertion library. Karma just launches a HTTP server, generates the test runner HTML files, and open them in browsers. So for testing purposes, we still need plugins for testing framework, assertion library.  

Karma needs to know about the project in order to test it and this is done via a configuration file. The easiest way to generate an initial configuration file is by using the ```karma init``` command. This [page](https://karma-runner.github.io/latest/config/configuration-file.html) lists all of the available configuration options.  
```
// karma.conf.js
module.exports = function(config) {
  config.set({
    basePath: '../..',
    browsers: ['Firefox'], //run in Firefox or Chrome
    singleRun: true, //just run once by default
    frameworks: ['mocha', 'sinon-chai'], //use the mocha test framework
    files: [],
    preprocessors: {
        'tests.webpack.js': ['webpack', 'sourcemap'] //preprocess with webpack and our sourcemap loader
    },
    plugins: []
    //...
  });
};
```

#### Mocha and Chai
Mocha is a feature-rich JavaScript test framework running on Node.js and in the browser, making asynchronous testing simple and fun. Mocha tests run serially, allowing for flexible and accurate reporting, while mapping uncaught exceptions to the correct test cases.

Mocha allows us to use any assertion library. Here we use chai, a BDD / TDD assertion library for node and the browser that can be delightfully paired with any javascript testing framework.

#### Enzyme and Sinon
Enzyme is a JavaScript Testing utility for React that makes it easier to assert, manipulate, and traverse your React Components' output. It supports three different ways of rendering: ```shallow```, ```mount``` and ```render```.

Sinon is a standalone test spies, stubs and mocks for JavaScript. No dependencies, works with any unit testing framework. The following code shows a sample of enzyme works with sinon.

```
it('simulates click events', () => {
    const onButtonClick = sinon.spy();
    const wrapper = shallow(&lt;Foo onButtonClick={onButtonClick} /&gt;);
    wrapper.find('button').simulate('click');
    expect(onButtonClick).to.have.property('callCount', 1);
});
```


### Sample unit test

There is a complete [sample](https://github.com/wangyangjun/wangyangjun.github.io/tree/master/samples/react-unit-test) of unit test of react application. 

webpack.config.js
```
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
```

karma.conf.js
```
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
```

Sample unit test
```
describe("Sample test suit", () => {

    it('test1', function() {
        console.log("------------------------------------");
        console.log("Sample test suit: test1");

        var spy = sinon.spy();
        spy.should.have.not.been.called;
        let mount_wrapper = mount(<Main btnClicked={spy}/>);
        expect(mount_wrapper.find(".btn")).to.have.length(1);

        mount_wrapper.find('.btn').simulate('click');
        spy.should.have.been.calledOnce;
        mount_wrapper.unmount();
    });
});
```

### Best practices

#### Hooks
With its default “BDD”-style interface, Mocha provides the [hooks](https://mochajs.org/#hooks) ```before()```, ```after()```, ```beforeEach()```, and ```afterEach()```. These should be used to set up preconditions and clean up after your tests. For example, in application used localStorage, we might want clear localStorage before each unit test starts:
```
beforeEach(function() {
    localStorage.clear();
});
```

#### Asynchronous code 
Testing asynchronous code with Mocha could not be simpler! Simply invoke the callback when your test is complete. By adding a callback (usually named done) to it(), Mocha will know that it should wait for this function to be called to complete the test.

By default, each test case has 2s timeout, it could be reset by calling 'this.timeout(ms)'. If timeout is set manually, then done must be called in the unit test;
```
it('test case', function(done) {
    this.timeout(3000);
        func(paras, callback() {
        done();
    });
});
```
#### Unmount React component

In unit test, when the test is done, it is possible that mounted component has requests which are still waiting response from server. Request callback might be called after the next unit test starts.
It is highly recommended to unmount component and abort callback in componentWillUnmount function.
The operations in componentWillUnmount function would includes abort ajax requests, unsubscribe web socket topics and disconnect web socket, clearTimeout and clearInterval.

