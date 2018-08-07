'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ink = require('ink');

function CheckBox({ checkedCharacter, uncheckedCharacter, isChecked }) {
  const mark = isChecked === true ? checkedCharacter : uncheckedCharacter;
  return (0, _ink.h)(
    _ink.Color,
    { green: true },
    ` ${mark}  `
  );
} /**
   * Based on ink-checkbox-list {@link https://github.com/MaxMEllon/ink-checkbox-list}
   */
exports.default = CheckBox;