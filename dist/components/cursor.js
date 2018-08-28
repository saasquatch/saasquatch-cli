'use strict';

/**
 * Based on ink-checkbox-list {@link https://github.com/MaxMEllon/ink-checkbox-list}
 */
const { h } = require('ink');

function Cursor({ cursorCharacter, isActive }) {
	const c = isActive === true ? `${cursorCharacter} ` : '\u00A0'.repeat(cursorCharacter.length + 1);
	return h(
		'span',
		null,
		c
	);
}

module.exports = Cursor;