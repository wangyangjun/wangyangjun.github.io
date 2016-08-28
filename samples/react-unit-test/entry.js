"use strict";

import React from "react";
import {render} from "react-dom";
import _ from "lodash";

import "file?name=[name].[ext]!./index.html";

export class Main extends React.Component {
    render() {
        return (
            <div>
                <h1 className="title">Title</h1>
                <button className="btn" onClick={() => this.props.btnClicked()}>Btn</button>
            </div>
        );
    }
}

Main.propTypes = {
    btnClicked: React.PropTypes.func
};

var btnClicked = function btnClicked (argument) {
    alert("button is clicked");
}

function displayMainPage() {
    render(<Main btnClicked={btnClicked}/>, document.getElementById("content"));
}


if (_.includes(["loaded", "interactive", "complete"], document.readyState)) {
    displayMainPage();
}