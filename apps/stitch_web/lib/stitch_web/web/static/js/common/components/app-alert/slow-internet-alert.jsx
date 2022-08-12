import React, { Component } from "react";

export default class SlowInternetAlert extends Component {
    constructor(args) {
        super(args);
        this.state = {
            unstableConnection: false
        };
    }

    componentWillMount () {
        if(navigator.connection) {
            navigator.connection.addEventListener('change', this.onDownlinkChange);
        }
    }

    onDownlinkChange = () => {
        if(navigator.connection) {
            this.setState({ unstableConnection: navigator.connection.downlink < 1 && navigator.onLine ? true : false })
        }
    }


    render() {
        const { unstableConnection } = this.state;
        
        return (
            <div className={`${unstableConnection ? "browser-notification-alert reconnection-alert" : "hidden"}`}>
                {`${unstableConnection ? "Your network connection is unstable!" : ""}`}
            </div>
        );
    }
}
