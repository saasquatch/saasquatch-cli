import { h } from "ink";

function ListItem({ children }) {
  return (
    <span>
      <div>{children}</div>
    </span>
  );
}

export default ListItem;
