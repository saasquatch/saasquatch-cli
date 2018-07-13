const { h } = require('ink');
const { string } = require('prop-types');

/* eslint no-unused-vars: [0] */
function ListItem({ value, children }) {
	return h(
		'span',
		null,
		h(
			'div',
			null,
			children
		)
	);
}

ListItem.propTypes = {
	value: string.isRequired
};

module.exports = ListItem;