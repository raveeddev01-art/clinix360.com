import React, { Component, PropTypes } from "react";
import { emojiIndex } from "emoji-mart";

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
    const users = this.getUsers();

    switch (evt.keyCode) {
      case 38: // arrow up
        this.setState({
          activeIndex: activeIndex - 1 >= 0 ? activeIndex - 1 : users.length - 1
        });
        break;
      case 40: // arrow down
        this.setState({
          activeIndex: activeIndex + 1 >= users.length ? 0 : activeIndex + 1
        });
        break;
      case 13: // return
        if (users.length) {
          const selectedUser = users[activeIndex];
          this.onSelectMention(selectedUser.username)();
        }
        break;
      default:
    }
  };

  searchEmoji = () => {
    const { filter } = this.props;
    return emojiIndex.search(filter);
  };

  render() {
    const emojis = this.searchEmoji();

    return (
      <div className="dropup emoji-search-menu open">
        <ul className="dropdown-menu" />
      </div>
    );
  }
}

EmojiSearch.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  filter: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired
};

EmojiSearch.defaultProps = {
  isOpen: false,
  filter: "",
  onSelect: () => {}
};

export default EmojiSearch;
