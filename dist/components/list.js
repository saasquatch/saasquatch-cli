'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ink = require('ink');

var _figures = require('figures');

var _figures2 = _interopRequireDefault(_figures);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _checkbox = require('./checkbox');

var _checkbox2 = _interopRequireDefault(_checkbox);

var _cursor = require('./cursor');

var _cursor2 = _interopRequireDefault(_cursor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const stdin = process.stdin; /**
                              * Based on ink-checkbox-list {@link https://github.com/MaxMEllon/ink-checkbox-list}
                              */


class List extends _ink.Component {
  constructor(props) {
    super(props);
    this.state = {
      cursor: 0,
      checked: []
    };
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  get cursor() {
    return this.state.cursor;
  }

  get childValues() {
    const { children } = this.props;
    const filteredChildren = children.filter((_, i) => this.state.checked.includes(i));
    return filteredChildren.map(child => child.props.value);
  }

  componentDidMount() {
    stdin.on('keypress', this.handleKeyPress);
  }

  componentWillUnMount() {
    stdin.removeListener('keypress', this.handleKeyPress);
  }

  moveUp() {
    const { cursor } = this.state;
    const { length } = this.props.children;
    if (cursor - 1 < 0) {
      this.setState({ cursor: length - 1 });
      return;
    }
    this.setState({ cursor: cursor - 1 });
  }

  moveDown() {
    const { cursor } = this.state;
    const { length } = this.props.children;
    if (cursor + 1 >= length) {
      this.setState({ cursor: 0 });
      return;
    }
    this.setState({ cursor: cursor + 1 });
  }

  toggleCurrentCursor() {
    const { checked, cursor } = this.state;
    if (checked.includes(cursor)) {
      const i = checked.indexOf(cursor);
      checked.splice(i, 1);
      this.setState({ checked });
    } else {
      checked.push(this.state.cursor);
      this.setState({ checked });
    }
  }

  submit() {
    this.setState({ cursor: -1 });
    stdin.removeListener('keypress', this.handleKeyPress);
    if (this.props.onSubmit) {
      this.props.onSubmit(this.childValues);
    }
  }

  handleKeyPress(ch, key) {
    const pressedKey = key.name;
    switch (pressedKey) {
      case 'up':
        {
          this.moveUp();
          break;
        }
      case 'down':
        {
          this.moveDown();
          break;
        }
      case 'space':
        {
          this.toggleCurrentCursor();
          if (this.props.onChange) {
            this.props.onChange(this.childValues);
          }
          break;
        }
      case 'return':
        {
          this.submit();
          break;
        }
      default:
        {
          // Do nothing
          break;
        }
    }
  }

  render(props) {
    const { cursor } = this.state;
    const { cursorCharacter, checkedCharacter, uncheckedCharacter } = props;
    return (0, _ink.h)(
      'span',
      null,
      props.children.map((co, i) => (0, _ink.h)(
        'span',
        null,
        (0, _ink.h)(_cursor2.default, { isActive: cursor === i, cursorCharacter: cursorCharacter }),
        (0, _ink.h)(_checkbox2.default, {
          isChecked: this.state.checked.includes(i),
          checkedCharacter: checkedCharacter,
          uncheckedCharacter: uncheckedCharacter
        }),
        co
      ))
    );
  }
}

List.defaultProps = {
  cursorCharacter: _figures2.default.pointer,
  checkedCharacter: _figures2.default.checkboxOn,
  uncheckedCharacter: _figures2.default.checkboxOff
};

List.propTypes = {
  cursorCharacter: _propTypes2.default.string,
  checkedCharacter: _propTypes2.default.string,
  uncheckedCharacter: _propTypes2.default.string,
  onChange: _propTypes2.default.func,
  onSubmit: _propTypes2.default.func
};

exports.default = List;