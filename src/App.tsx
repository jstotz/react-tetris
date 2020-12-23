import React from "react";
import Modal from "react-modal";
import "./App.css";
import Game from "./components/Game";

if (process.env.NODE_ENV !== "test") {
  Modal.setAppElement("#root");
}

function App() {
  return <Game />;
}

export default App;
