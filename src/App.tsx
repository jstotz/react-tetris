import { normalize, setupPage } from "csstips";
import React from "react";
import Modal from "react-modal";
import Game from "./components/Game";

if (process.env.NODE_ENV !== "test") {
  Modal.setAppElement("#root");
  normalize();
  setupPage("#root");
}

function App() {
  return <Game />;
}

export default App;
