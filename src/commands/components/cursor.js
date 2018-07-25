/**
 * Based on ink-checkbox-list {@link https://github.com/MaxMEllon/ink-checkbox-list}
 */
import { h } from 'ink';

function Cursor({ cursorCharacter, isActive }) {
  const c =
    isActive === true
      ? `${cursorCharacter} `
      : '\u00A0'.repeat(cursorCharacter.length + 1);
  return <span>{c}</span>;
}

export default Cursor;
