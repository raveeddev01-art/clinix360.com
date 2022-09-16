import React, { Component } from "react";
import ReactDOM from "react-dom";
import { observer, inject } from "mobx-react";
import Modal from "react-bootstrap/lib/Modal";
import Textarea from "react-textarea-autosize";
import { Picker, Emoji } from "emoji-mart";
import Select from "react-select";
import DateTime from "react-datetime";
import Col from "react-bootstrap/lib/Col";
import FormGroup from "react-bootstrap/lib/FormGroup";
import Button from "react-bootstrap/lib/Button";
import moment from "moment";
import UserStatus from "../../common/components/user-status";
import { getCustomTimeOptions } from "../../lib/utils";
import { DEFAULT_STATUS_EMOJI, STATUS_CLEAR_AFTER_OPTS } from "../../lib/constants";

@inject("userStore")
@observer
class UserStatusModal extends Component {
    constructor(...args) {
        super(...args);
        this.state = this.getInitialState();
    }

    getInitialState = () => {
        return {
            showEmojiPicker: false,
            statusEmoji: "",
            statusText: "",
            clearAfter: "",
            showDatetimeField: false,
            customTime: "12:00:00",
            customDate: moment().format("DD MMM YYYY"),
        };
    }

    componentWillMount() {
        const { status } = this.props.user;
        if (status.active) {
            this.maybeSetActiveStatus(status);
        }
    }

    componentWillReceiveProps(nextProps) {
        const { status } = nextProps.user;
        if (status.active) {
            this.maybeSetActiveStatus(status);
        }
    }

    maybeSetActiveStatus = (status) => {
        this.setState({
            statusEmoji: status.emoji,
            statusText: status.text,
            clearAfter: status.clear_after,
            showDatetimeField: status.clear_after === 6 ? true : false
        });
    }

    reset = () => {
        this.setState(this.getInitialState());
    }

    onSave = (e) => {
        const { statusEmoji, statusText, clearAfter } = this.state;
        if((statusEmoji && statusText)) {
            let customTime = this.getExpiringTime();
            let clearOption = clearAfter ? clearAfter : 0;
            this.props.userStore.saveStatus(statusText, statusEmoji, clearOption, customTime);
        }
        this.closeModal();
    }

    onStatusTextChanged = (e) => {
        this.setState({ statusText: e.target.value });
        if(!this.state.statusEmoji) {
            this.setState({ statusEmoji: DEFAULT_STATUS_EMOJI });
        }
    }

    onClearAfterChanged = (e) => {
        this.setState({ clearAfter: e });
        if (e === 6) {
            this.setState({ showDatetimeField: !this.state.showDatetimeField })
        }
    }

    onTimeChanged = (e) => {
        this.setState({ customTime: e });
    }

    onDateChanged = (e) => {
        this.setState({ customDate: e.format('DD MMM YYYY') });
    }

    toggleEmojiPicker = (e) => {
        this.setState({ showEmojiPicker: !this.state.showEmojiPicker });
    };

    closeModal = () => {
        this.props.userStore.showUserStatusModal = null;
        this.reset();
    };

    onHistoryStatusSelected = (e, status) => {
        this.maybeSetActiveStatus(status);
    }

    onSelectStatusEmoji = (e) => {
        this.setState({ showEmojiPicker: !this.state.showEmojiPicker, statusEmoji: e });
    }

    getExpiringTime() {
        const { customDate, customTime, showDatetimeField } = this.state;
        const datetime = `${customDate} ${customTime}`;
        return showDatetimeField ? new moment(datetime, "DD MMM YYYY k:mm:ss").utc() : "";
    }

    renderEmojiPicker() {
        return (
            <Picker
                set="apple"
                autoFocus
                onClick={this.onSelectStatusEmoji}
            />
        );
    }

    renderClearAfterField() {
        return (
            <FormGroup bsSize="large">
                <Select
                    placeholder="Clear status after"
                    className="multi-select-large"
                    options={STATUS_CLEAR_AFTER_OPTS}
                    value={this.state.clearAfter}
                    onChange={this.onClearAfterChanged}
                    clearable={false}
                    searchable={false}
                    simpleValue
                    required
                />
            </FormGroup>
        );
    }

    renderDateTimeField() {
        return (
            <FormGroup bsSize="large">
                <Col sm={8} style={{ paddingLeft: 0 }}>
                    <DateTime
                        closeOnSelect
                        input={true}
                        value={this.state.customDate}
                        dateFormat={"DD MMM YYYY"}
                        timeFormat={false}
                        onChange={this.onDateChanged}
                        viewDate={new Date()}
                        inputProps={{ placeholder: "Today" }}
                    />
                </Col>
                <Col sm={4} style={{ paddingRight: 0 }}>
                    <Select
                        placeholder="12:00 AM"
                        className="multi-select-large"
                        value={this.state.customTime}
                        options={getCustomTimeOptions()}
                        onChange={this.onTimeChanged}
                        clearable={false}
                        searchable={false}
                        simpleValue
                    />
                </Col>
            </FormGroup>
        );
    }

    renderStatusTextInput() {
        const { statusEmoji, statusText } = this.state;

        return (
            <FormGroup bsSize="large">
                <Textarea
                    className="form-control status-text"
                    placeholder="What's your status?"
                    maxRows={1}
                    maxLength="4000"
                    value={statusText}
                    onChange={this.onStatusTextChanged}
                    style={{ paddingLeft: "35px" }}
                    ref={input => {
                        if (input) {
                            this.textInput = ReactDOM.findDOMNode(input);
                        }
                    }}
                />
                <div className="status-form-actions" style={{ position: "absolute" }}>
                    <a
                        role="link"
                        className="status-form-action-item"
                        onClick={this.toggleEmojiPicker}
                        style={{ position: "relative", bottom: "36px", left: "11px", fontSize: "20px" }}
                    >
                        {statusEmoji ? (
                            <Emoji emoji={statusEmoji} size={20} />
                        ) : <i className="fa fa-smile-o" />}
                    </a>
                </div>
                {this.state.showEmojiPicker && this.renderEmojiPicker()}
            </FormGroup>
        );
    }

    renderHistory() {
        return(
            <UserStatus
                key={`user-status-history`}
                type={"history"}
                onCloseModal={this.closeModal}
                onItemSelected={this.onHistoryStatusSelected}
            />
        );
    }

    renderHeader() {
        return (
            <Modal.Header>
                <Modal.Title>Set a status</Modal.Title>
                <a role="link" onClick={this.closeModal}>
                    <i className="fa fa-close" />
                </a>
            </Modal.Header>
        );
    }

    renderBody() {
        return (
            <Modal.Body>
                <div>
                    {this.renderStatusTextInput()}
                    {this.renderClearAfterField()}
                    {this.state.showDatetimeField && this.renderDateTimeField()}
                    {!(this.state.clearAfter === 6) && this.renderHistory()}
                </div>
            </Modal.Body>
        );
    }

    renderFooter() {
        return (
            <Modal.Footer>
                <Button
                    bsSize="large"
                    bsStyle="primary"
                    onClick={this.onSave}
                >
                    Save
                </Button>
            </Modal.Footer>
        );
    }

    render() {
        const show = !!this.props.userStore.showUserStatusModal;

        if (!show) {
            return null;
        }

        return (
            <Modal className="user-status-modal" show onHide={this.closeModal}>
                {this.renderHeader()}
                {this.renderBody()}
                {this.renderFooter()}
            </Modal>
        );
    }
}
export default UserStatusModal;
