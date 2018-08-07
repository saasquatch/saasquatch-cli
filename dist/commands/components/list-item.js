'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ink = require('ink');

function ListItem({ children }) {
  return (0, _ink.h)(
    'span',
    null,
    (0, _ink.h)(
      'div',
      null,
      children
    )
  );
} /**
   * Based on ink-checkbox-list {@link https://github.com/MaxMEllon/ink-checkbox-list}
   */
exports.default = ListItem;