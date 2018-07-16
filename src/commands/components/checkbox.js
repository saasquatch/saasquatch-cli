const { h, Color } = require('ink');

function CheckBox({ checkedCharacter, uncheckedCharacter, isChecked }) {
	const mark = isChecked === true ? checkedCharacter : uncheckedCharacter;
	return <Color green={true}> {mark}  </Color>
}

module.exports = CheckBox;