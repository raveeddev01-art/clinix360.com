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

@inject("userStore", "messageStore")
@observer
class UserStatusModal extends Component {

    dayLocale = [
        { label: "Don't clear", value: moment().utc().endOf('year') },
        { label: "30 minutes", value: moment().utc().add(0.5, 'hour') },
        { label: "1 hour", value: moment().utc().add(1, 'hour') },
        { label: "4 hour", value: moment().utc().add(4, 'hour') },
        { label: "Today", value: moment().utc().endOf('day') },
        { label: "This Week", value: moment().utc().endOf('week') }
        // { label: "Choose date and time", value: "Choose date and time" }
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
            expiringTimeLabel: "",
            showDatetimeField: false,
            customTime: "12:00:00",
            customDate: moment().format("DD MMM YYYY")
        };
    }

    reset = () => {
        this.state = this.getInitialState();
    }

    onSave = (e) => {
        const { statusEmoji, statusText, expiringTime, showDatetimeField } = this.state;
        if(statusEmoji || statusText) {
            if(showDatetimeField) {
                this.setExpiringTime();
            }
            this.props.userStore.saveStatus(statusText, statusEmoji, expiringTime);
        }
        this.closeModal();
    }

    onStatusTextChanged = (e) => {
        console.log(e.target.value);
        this.setState({ statusText: e.target.value });
    }

    onExpiringTimeChanged = (e) => {
        this.setState({ expiringTime: e, expiringTimeLabel: e.toString() });
        if (e === "Choose date and time") {
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

    setExpiringTime() {
        const { customDate, customTime } = this.state;

        let datetime = `${customDate} ${customTime}`;
        let utc_datetime = new moment(datetime, "DD MMM YYYY k:mm:ss").utc();
        this.setState({expiringTime: utc_datetime});
    }

    getTimeOptions = () => {
        let timeOptions = [];
        for (let index = 0; index < 24; index++) {
            if (index >= 12) {
                let hr = index === 12 ? 12 : index - 12;
                timeOptions.push({ label: `${hr}:00 PM`, value: `${index}:00:00` });
                timeOptions.push({ label: `${hr}:30 PM`, value: `${index}:30:00` });
            } else {
                let hr = index === 0 ? 12 : index;
                timeOptions.push({ label: `${hr}:00 AM`, value: `${index}:00:00` });
                timeOptions.push({ label: `${hr}:30 AM`, value: `${index}:30:00` });
            }
        }

        return timeOptions;
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
                    options={this.dayLocale}
                    value={this.state.expiringTimeLabel}
                    onChange={this.onExpiringTimeChanged}
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
                        options={this.getTimeOptions()}
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
