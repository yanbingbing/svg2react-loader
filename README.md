# SVG to React Loader [![](http://img.shields.io/npm/v/svg2react-loader.svg)](https://npmjs.org/package/svg2react-loader)

> A Webpack Loader to turn SVGs into React Components

Fork from: <https://github.com/jhamlet/svg-react-loader>, and make it simple.

## Installation

```sh
npm install svg2react-loader
```

##Usage

```js
var React = require('react');
var Icon = require('babel!svg2react!./my-icon.svg?name=Icon');

module.exports = React.createClass({
    render () {
        return <Icon className='normal' />;
    }
});
```