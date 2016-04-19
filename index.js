var path     = require('path');
var fs       = require('fs');
var lutils   = require('loader-utils');
var xml2js   = require('xml2js');
var template = require('lodash/string/template');
var camelCase = require('lodash/string/camelCase');
var assign = require('lodash/object/assign');
var keys = require('lodash/object/keys');
var sanitize = require('./util/sanitize');
var Tmpl;

function readTemplate (callback, filepath) {
    fs.readFile(filepath, 'utf8', function (error, contents) {
        if (error) {
            throw error;
        }
        Tmpl = template(contents);
        callback();
    });
}


function getName(filepath) {
    var ext = path.extname(filepath);
    var basename = path.basename(filepath, ext);
    return basename[0].toUpperCase() + camelCase(basename.slice(1));
}

function renderJsx(displayName, xml, callback) {
    var tagName = keys(xml)[0];
    var root = xml[tagName];

    var props = assign(sanitize(root).$ || {});

    delete props.id;

    var xmlBuilder = new xml2js.Builder({headless: true});
    var xmlSrc = xmlBuilder.buildObject(xml);
    var component = Tmpl({
        displayName: displayName,
        defaultProps: props,
        innerXml: xmlSrc.split(/\n/).slice(1, -1).join('\n')
    });

    callback(null, component);
}

/**
 * @param {String} source
 */
module.exports = function (source) {
    // read our template
    var tmplPath = path.join(__dirname, '/util/svg.tpl');

    // let webpack know about us, and get our callback
    var callback = this.async();
    this.addDependency(tmplPath);
    this.cacheable();

    // parameters to the loader
    var query = lutils.parseQuery(this.query);
    var rsrcPath = this.resourcePath;
    var rsrcQuery = lutils.parseQuery(this.resourceQuery);

    var displayName = rsrcQuery.name || query.name || getName(rsrcPath);

    var render = function () {
        var xmlParser = new xml2js.Parser();
        xmlParser.parseString(source, function (error, xml) {
            if (error) {
                return callback(error);
            }
            renderJsx(displayName, xml, callback);
        });
    };

    if (Tmpl) {
        render();
    } else {
        readTemplate(render, tmplPath);
    }
};