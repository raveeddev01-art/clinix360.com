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
import { getCustomTimeOptions } from "../../lib/utils";

@inject("userStore")
@observer
class UserStatusModal extends Component {

    // dayLocale = [
    //     { label: "Don't clear", value: "never" },
    //     { label: "30 minutes", value: moment().utc().add(0.5, 'hour') },
    //     { label: "1 hour", value: moment().utc().add(1, 'hour') },
    //     { label: "4 hour", value: moment().utc().add(4, 'hour') },
    //     { label: "Today", value: moment().utc().endOf('day') },
    //     { label: "This Week", value: moment().utc().endOf('week') },
    //     { label: "Choose date and time", value: "Choose date and time" }
    // ]
    clearAfterOpts = [
        { label: "Don't clear", value: 0 },
        { label: "30 minutes", value: 1 },
        { label: "1 hour", value: 2 },
        { label: "4 hour", value: 3 },
        { label: "Today", value: 4 },
        { label: "This Week", value: 5 },
        { label: "Choose date and time", value: 6 }
    ]

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

    reset = () => {
        this.setState(this.getInitialState());
    }

    onSave = (e) => {
        const { statusEmoji, statusText, clearAfter } = this.state;
        if(statusEmoji || statusText) {
            let customTime = this.getExpiringTime();
            this.props.userStore.saveStatus(statusText, statusEmoji, clearAfter, customTime);
        }
        this.closeModal();
    }

    onStatusTextChanged = (e) => {
        this.setState({ statusText: e.target.value });
    }

    onClearAfterChanged = (e) => {
        this.setState({ clearAfter: e });
        if (e === 6) {
            this.setState({ showDatetimeField: !this.state.showDatetimeField })
        }
        console.log(e);
    }

    onTimeChanged = (e) => {
        console.log("time", e);
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

    onSelectStatusEmoji = (e) => {
        this.setState({ showEmojiPicker: !this.state.showEmojiPicker, statusEmoji: e });
        console.log(e);
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
                    options={this.clearAfterOpts}
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
