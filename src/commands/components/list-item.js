import {h} from 'ink';
import {string} from 'prop-types';

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

export default ListItem;