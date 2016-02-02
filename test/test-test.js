/*globals describe, it*/
var react  = require('react');
var ReactDOMServer = require('react-dom/server');
var loader = require('../index');
var babel  = require('babel-core');
var fs     = require('fs');
var path   = require('path');

var defaultMock = {
    callback: function (error, result) {
        if (error) {
            throw error;
        }
        console.log(result);
    },
    cacheable: function () {},
    addDependency: function () {},
    resourcePath: 'foo.svg'
};

require('should');

function invoke(xml, mock) {
    var context = Object.assign({}, defaultMock, mock || {});
    context.async = function () { return this.callback; }.bind(context);
    loader.call(context, xml);
}

function read(filepath) {
    return fs.readFileSync(path.join(__dirname, filepath), 'utf8');
}

describe('something', function () {
    it('should return a function', function () {
        loader.should.be.a.function;
    });

    it('should do something', function (done) {
        var filename = './svg/mashup.svg';
        invoke(read(filename), {
            callback: function (error, result) {
                if (error) {
                    throw error;
                }

                console.log(babel.transform(result, {
                    presets: ['es2015', 'react']
                }).code);
                done();
            },
            resourcePath: filename,
            resourceQuery: '?attrs={foo: \'bar\'}'
        });
    });

    it('should handle styles', function (done) {
        var filename = './svg/styles.svg';

        invoke(read(filename), {
            callback: function (error, result) {
                if (error) {
                    throw error;
                }

                var src = babel.transform(result, {
                    presets: ['es2015', 'react']
                }).code;
                console.log(src);
                fs.writeFileSync(__dirname + '/temp', src);
                var el = react.createElement(require(__dirname + '/temp'));
                var html = ReactDOMServer.renderToStaticMarkup(el);

                console.log(html);
                fs.unlink(__dirname + '/temp');
                done();
            },
            resourcePath: filename
        });
    });

    it('should handle text elements', function (done) {
        var filename = './svg/text.svg';

        invoke(read(filename), {
            callback: function (error, result) {
                if (error) {
                    throw error;
                }

                var src = babel.transform(result, {
                    presets: ['es2015', 'react']
                }).code;
                console.log(src);
                fs.writeFileSync(__dirname + '/temp', src);
                var el = react.createElement(require(__dirname + '/temp'));
                var html = ReactDOMServer.renderToStaticMarkup(el);

                console.log(html);
                fs.unlink(__dirname + '/temp');
                done();
            },
            resourcePath: filename
        });
    });
});