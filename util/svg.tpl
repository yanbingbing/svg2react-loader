var React = require('react');

module.exports = React.createClass({

    displayName: <%= JSON.stringify(displayName) %>,

    getDefaultProps () {
        return <%= JSON.stringify(defaultProps) %>;
    },

    render () {
        var props = this.props;

        return <svg {...props}>
            <%= innerXml %>
        </svg>;
    }
});