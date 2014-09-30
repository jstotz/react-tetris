/** @jsx React.DOM */

var React = window.React = require('react'),
    Game = require("./ui/Game.cjsx"),
    mountNode = document.getElementById("app");

React.renderComponent(<Game />, mountNode);

