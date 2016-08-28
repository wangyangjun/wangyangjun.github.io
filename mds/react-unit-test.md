## Unit test for React.js App

### Introduction
A React App is consisted of components. A React component might contains multi sub-components. A well designed component should be reusable and stable. To achieve this, unit test is a necessity. In this article, I will introduce the method of unit test we used in our production development.

In our development, we combine [Karma](https://karma-runner.github.io/1.0/index.html), [Mocha](https://mochajs.org/), [Enzyme](http://airbnb.io/enzyme/index.html), [Sinon](http://sinonjs.org/), and [Chai](http://chaijs.com/) together to build our test framework.

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

A React App is consisted of components. A React component might contains multi sub-components. A well designed component should be reusable and stable. To achieve this, unit test is a necessity. In this article, I will introduce the method of unit test we used in our production development.

In our development, we combine [Mocha](https://mochajs.org/), [Karma](https://karma-runner.github.io/1.0/index.html), [Enzyme](http://airbnb.io/enzyme/index.html), [Sinon](http://sinonjs.org/), and [Chai](http://chaijs.com/) together to build our test framework.

### Best practices



