/**
 * Based on ink-checkbox-list {@link https://github.com/MaxMEllon/ink-checkbox-list}
 */
const {h} = require('ink');
const {string} = require('prop-types');

/* eslint no-unused-vars: [0] */
function ListItem({value, children}) {
	return (
		<span>
			<div>{children}</div>
		</span>
	);
}

ListItem.propTypes = {
	value: string.isRequired
};

module.exports = ListItem;