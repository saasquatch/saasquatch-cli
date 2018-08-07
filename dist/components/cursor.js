'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ink = require('ink');

function Cursor({ cursorCharacter, isActive }) {
  const c = isActive === true ? `${cursorCharacter} ` : '\u00A0'.repeat(cursorCharacter.length + 1);
  return (0, _ink.h)(
    'span',
    null,
    c
  );
} /**
   * Based on ink-checkbox-list {@link https://github.com/MaxMEllon/ink-checkbox-list}
   */
exports.default = Cursor;