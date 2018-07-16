import {h, Color} from 'ink';

function CheckBox({checkedCharacter, uncheckedCharacter, isChecked}) {
	const mark = isChecked === true ? checkedCharacter : uncheckedCharacter;
	return (
		<Color green>{` ${mark}  `}</Color>
	);
}

export default CheckBox;