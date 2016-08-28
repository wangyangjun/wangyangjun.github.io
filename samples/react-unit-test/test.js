"use strict";

import * as React from "react";
import chai from "chai";
import {mount} from "enzyme";
import sinon from "sinon";
import {Main} from "./entry";
let expect = chai.expect;

describe("Sample test suit", () => {

    it('test1', function() {
        console.log("------------------------------------");
        console.log("Sample test suit: test1");

        var spy = sinon.spy();
        spy.should.have.not.been.called;
        let mount_wrapper = mount(<Main btnClicked={spy}/>);
        expect(mount_wrapper.find(".btn")).to.have.length(1);

        mount_wrapper.find('.btn').simulate('click');
        spy.should.have.been.calledOnce;
        mount_wrapper.unmount();
    });
});
