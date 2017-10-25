import React, { Component } from "react";
import PropTypes from "prop-types";
import { emojiIndex, Emoji } from "emoji-mart";
import cx from "classnames";

class EmojiSearch extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      activeIndex: 0
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.isOpen && nextProps.isOpen) {
      document.addEventListener("keydown", this.onKeyDown);
      this.setState({ activeIndex: 0 });
    } else if (this.props.isOpen && !nextProps.isOpen) {
      document.removeEventListener("keydown", this.onKeyDown);
    }
  }

  onItemHover = index => () => {
    this.setState({ activeIndex: index });
  };

  onSelectEmoji = emoji => () => {
    this.props.onSelect(emoji);
  };

  onKeyDown = evt => {
    const { activeIndex } = this.state;
    const emojis = this.searchEmoji();

    switch (evt.keyCode) {
      case 37: // arrow left
        this.setState({
          activeIndex:
            activeIndex - 1 >= 0 ? activeIndex - 1 : emojis.length - 1
        });
        break;
      case 39: // arrow right
        this.setState({
          activeIndex: activeIndex + 1 >= emojis.length ? 0 : activeIndex + 1
        });
        break;
      case 38: // arrow up
        {
          const currentPos = this.emojiPos[this.state.activeIndex];
          const prevLine = this.emojiPos.filter(
            pos => pos.top < currentPos.top && currentPos.top - pos.top < 30
          );
          const distances = prevLine.map(pos =>
            Math.abs(pos.left - currentPos.left)
          );
          const lineIndex = distances.indexOf(Math.min(...distances));
          let prevEmojiIndex = 0;

          if (prevLine.length) {
            prevEmojiIndex = prevLine[lineIndex].index;
          }
          this.setState({ activeIndex: prevEmojiIndex });
        }
        break;
      case 40: // arrow down
        {
          const currentPos = this.emojiPos[this.state.activeIndex];
          const nextLine = this.emojiPos.filter(
            pos => pos.top > currentPos.top && pos.top - currentPos.top < 30
          );
          const distances = nextLine.map(pos =>
            Math.abs(pos.left - currentPos.left)
          );
          const lineIndex = distances.indexOf(Math.min(...distances));
          let nextEmojiIndex = emojis.length - 1;

          if (nextLine.length) {
            nextEmojiIndex = nextLine[lineIndex].index;
          }
          this.setState({ activeIndex: nextEmojiIndex });
        }
        break;
      case 13: // return
        if (emojis.length) {
          const emoji = emojis[activeIndex];
          this.onSelectEmoji(emoji.colons)();
        } else {
          this.onSelectEmoji("")(); // workaround to send message
        }
        break;
      default:
    }
  };

  emojiPos = [];
  currentFilter = "";
  searchResult = [];

  searchEmoji = () => {
    const { filter, minCharacters, isOpen } = this.props;
    if (filter.length < minCharacters || !isOpen) {
      return [];
    }

    // simply caching result
    if (filter === this.currentFilter) {
      return this.searchResult;
    }

    // filtering weird response when `_` is included
    const result = emojiIndex.search(filter);
    if (result[0] && result[0].length) {
      return [];
    }

    this.currentFilter = filter;
    this.searchResult = result;

    return result;
  };

  renderEmojis = emojis => {
    const { activeIndex } = this.state;
    this.emojiPos = Array(emojis.length).fill({});
    return emojis.map((emoji, index) => {
      const itemClassName = cx("emoji-list-item", {
        active: activeIndex % emojis.length === index
      });

      return (
        <li
          key={`emoji_search_${index}`}
          className={itemClassName}
          onMouseEnter={this.onItemHover(index)}
          onClick={this.onSelectEmoji(emoji.colons)}
          ref={el => {
            if (el) {
              this.emojiPos[index] = {
                index,
                top: el.offsetTop,
                left: el.offsetLeft
              };
            }
          }}
        >
          <Emoji emoji={emoji} size={16} />
          <span className="emojiColon">{emoji.colons}</span>
        </li>
      );
    });
  };

  render() {
    const { isOpen } = this.props;
    const emojis = this.searchEmoji();
    if (!isOpen || !emojis.length) {
      return null;
    }

    return (
      <div className="dropup emoji-search-menu open">
        <ul className="dropdown-menu">{this.renderEmojis(emojis)}</ul>
      </div>
    );
  }
}

EmojiSearch.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  minCharacters: PropTypes.number.isRequired,
  filter: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired
};

EmojiSearch.defaultProps = {
  isOpen: false,
  filter: "",
  minCharacters: 2,
  onSelect: () => {}
};

export default EmojiSearch;
