/**
 * Based on ink-checkbox-list {@link https://github.com/MaxMEllon/ink-checkbox-list}
 */
import { h } from "ink";

function ListItem({ children }) {
  return (
    <span>
      <div>{children}</div>
    </span>
  );
}

export default ListItem;
