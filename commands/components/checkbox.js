const { h, Color } = require('ink');

function CheckBox({ checkedCharacter, uncheckedCharacter, isChecked }) {
	const mark = isChecked === true ? checkedCharacter : uncheckedCharacter;
	return h(
		Color,
		{ green: true },
		` ${mark}  `
	);
}

module.exports = CheckBox;