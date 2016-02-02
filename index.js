var path     = require('path');
var fs       = require('fs');
var lutils   = require('loader-utils');
var xml2js   = require('xml2js');
var template = require('lodash/string/template');
var camelCase = require('lodash/string/camelCase');
var sanitize = require('./util/sanitize');

function readTemplate (callback, filepath) {
    fs.readFile(filepath, 'utf8', function (error, contents) {
        if (error) {
            throw error;
        }
        callback(template(contents));
    });
}


function getName(filepath) {
    var ext = path.extname(filepath);
    var basename = path.basename(filepath, ext);
    return basename[0].toUpperCase() + camelCase(basename.slice(1));
}

function renderJsx(opts, xml, callback) {
    var tagName = Object.keys(xml)[0];
    var root = xml[tagName];

    var props = Object.assign(sanitize(root).$ || {}, opts.attrs);

    delete props.id;

    var xmlBuilder = new xml2js.Builder({headless: true});
    var xmlSrc = xmlBuilder.buildObject(xml);
    var component = opts.tmpl({
        displayName: opts.displayName,
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

    // resource parameters override loader parameters
    var params = Object.assign({}, query, rsrcQuery);

    var displayName = params.name || getName(rsrcPath);
    var attrs = {};

    if (params.attrs) {
        // easier than having to write json in the query
        // if anyone wants to exploit it, it's their build process
        try {
            Object.assign(attrs, (new Function('return ' + params.attrs))());
        } catch (e) {}
    }

    var opts = {
        attrs: attrs,
        displayName: displayName
    };

    readTemplate(function (tmpl) {
        opts.tmpl = tmpl;
        var xmlParser = new xml2js.Parser();
        xmlParser.parseString(source, function (error, xml) {
            if (error) {
                return callback(error);
            }
            renderJsx(opts, xml, callback);
        });
    }, tmplPath);
};