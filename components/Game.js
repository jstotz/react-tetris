import React from 'react'
import immut from 'immutable'
import keydrown from 'keydrown'
import randomColor from 'randomcolor'
import { extend, random, compact, times, defaults } from 'lodash'

import Board from './Board'

import PIECES from '../pieces'
const PIECE_COLORS = randomColor({ count: 7, luminosity: 'bright' })
const BOARD_WIDTH = 10 // blocks
const BOARD_HEIGHT = 20 // blocks
const BLOCK_SIZE = 10
const CELL_SPACING = 1

export function logBoard(board) {
  if (!board) {
    console.error('Invalid board:', board)
    return
  }
  const rowText = board.map((row) =>
    row.map((cell) => cell ? '■' : '□').join(' ')
  )
  console.log(rowText.join('\n'))
}

function emptyRow() {
  return immut.fromJS(times(BOARD_WIDTH, () => null))
}

function emptyBoard() {
  return immut.fromJS(times(BOARD_HEIGHT, emptyRow))
}

function makePiece() {
  const type = random(0, PIECES.size - 1)
  return immut.fromJS({
    x: 4,
    y: 0,
    type,
    rotationIndex: 0,
    blocks: PIECES.get(type).get(0),
    color: PIECE_COLORS[type],
  })
}

function updatePiece(prevPiece, specifiedDeltas) {
  const deltas = defaults(specifiedDeltas, {
    x: 0,
    y: 0,
    rotationIndex: 0,
  })
  const newPiece = prevPiece.withMutations((piece) => {
    let newRotationIndex = piece.get('rotationIndex') + deltas.rotationIndex
    if (newRotationIndex > 3) { newRotationIndex = 0 }
    if (newRotationIndex < 0) { newRotationIndex = 3 }
    piece.set('rotationIndex', newRotationIndex)
    piece.set('blocks', PIECES.get(piece.get('type')).get(newRotationIndex))
    piece.set('x', piece.get('x') + deltas.x)
    piece.set('y', piece.get('y') + deltas.y)
  })
  return newPiece
}

// Returns a bounding box for a pieces visible blocks in the form of:
// {x, y, width, height}
function getPieceVisibleBox(piece) {
  const outerX = piece.get('x')
  const outerY = piece.get('y')
  let [minX, maxX, minY, maxY] = [null, null, null, null]
  piece.get('blocks').forEach((row, yOffset) => {
    row.forEach((cell, xOffset) => {
      if (!cell) { return }
      const [cellX, cellY] = [outerX + xOffset, outerY + yOffset]
      minX = Math.min.apply(this, compact([cellX, minX]))
      minY = Math.min.apply(this, compact([cellY, minY]))
      maxX = Math.max.apply(this, compact([cellX, maxX]))
      maxY = Math.max.apply(this, compact([cellY, maxY]))
    })
  })
  return {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  }
}

// Returns copy of the given board with completed rows removed
function removeCompletedRows({ board }) {
  let result = board.filter((row) => !row.every((cell) => cell !== null))
  if (result.count() < BOARD_HEIGHT) {
    const newEmptyRows = times(BOARD_HEIGHT - result.size, emptyRow)
    result = immut.fromJS(newEmptyRows).concat(result)
  }
  return result.toList()
}

function isPieceInBounds({ piece }) {
  const visible = getPieceVisibleBox(piece)
  const outOfBounds = ((visible.y + visible.height) > BOARD_HEIGHT) ||
    ((visible.x + visible.width) > BOARD_WIDTH) ||
    (visible.x < 0)
  return !outOfBounds
}


// Returns a copy of the given board with the piece rendered into it
function boardWithPiece({ piece, board }) {
  const blockColor = piece.get('color')
  const pieceX = piece.get('x')
  const pieceY = piece.get('y')

  if (!isPieceInBounds({ piece, board })) { return false }

  let collision = false

  let newBoard = board

  piece.get('blocks').forEach((row, yOffset) => {
    if (collision) { return }
    row.forEach((cell, xOffset) => {
      if (collision) { return }
      const [x, y] = [xOffset + pieceX, yOffset + pieceY]
      if (x < 0 || x >= BOARD_WIDTH || y >= BOARD_HEIGHT) { return }
      const newBoardCell = cell ? ({ color: blockColor }) : null
      newBoard = newBoard.withMutations((b) => {
        const newBoardRow = b.get(y).withMutations((prevBoardRow) => {
          if (prevBoardRow.get(x)) {
            if (newBoardCell) {
              collision = true
            }
          } else {
            prevBoardRow.set(x, newBoardCell)
          }
        })
        b.set(y, newBoardRow)
      })
    })
  })

  if (collision) { return false }

  return newBoard
}

// Returns a new board with the piece rendered in the given position.
// Removes any completed rows. If new piece position is invalid, returns false.
function makeBoard({ piece, board }) {
  let newBoard = board ? board : emptyBoard()
  newBoard = removeCompletedRows({ board: newBoard })
  newBoard = boardWithPiece({ board: newBoard, piece })
  return immut.fromJS(newBoard)
}

class Game extends React.Component {
  constructor(props, context) {
    super(props, context)

    this.handleMovePiece = this.handleMovePiece.bind(this)
    this.rotatePiece = this.rotatePiece.bind(this)
    this.hardDropPiece = this.hardDropPiece.bind(this)

    const baseBoard = emptyBoard()

    this.state = {
      paused: false,
      baseBoard,
      board: baseBoard,
      gamestates: new immut.List(),
    }
  }

  componentDidMount() {
    this.addPiece()
    keydrown.run(keydrown.tick)
    this.listenForUserInput()
    this.startAutoPieceDrop()
  }

  setGamestate(data = {}) {
    const baseBoard = data.baseBoard ? data.baseBoard : this.state.baseBoard
    const newGamestate = new immut.Map(data)
    const newState = extend({}, data, {
      baseBoard,
      gamestates: this.state.gamestates.push(newGamestate),
    })
    this.setState(newState)
  }

  handleMovePiece() {
    if (keydrown.RIGHT.isDown()) { this.movePieceRight() }
    if (keydrown.LEFT.isDown()) { this.movePieceLeft() }
    if (keydrown.DOWN.isDown()) { this.movePieceDown() }
  }

  hardDropPiece() {
    times(BOARD_HEIGHT, () => {
      this.updatePiece({ y: 1 })
    })
    this.addPiece()
  }

  rotatePiece() {
    this.updatePiece({ rotationIndex: 1 })
  }

  updatePiece(deltas = {}) {
    const newPiece = updatePiece(this.state.piece, deltas)
    const newBoard = makeBoard({ piece: newPiece, board: this.state.baseBoard })
    if (newBoard) {
      this.setGamestate({ board: newBoard, piece: newPiece })
      return true
    }
    return false
  }

  startAutoPieceDrop() {
    const fn = () => {
      if (this.state.paused) { return }
      const movedDown = this.movePieceDown()
      if (!movedDown) {
        this.addPiece()
      }
    }
    setInterval(fn, 800)
  }

  listenForUserInput() {
    keydrown.UP.press(this.rotatePiece)
    keydrown.SPACE.press(this.hardDropPiece)
    keydrown.P.press(() => this.setState({ paused: !this.state.paused }))
    setInterval(this.handleMovePiece, 100)
  }

  addPiece() {
    const piece = makePiece()
    const newBoard = makeBoard({ piece, board: this.state.board })
    if (newBoard) {
      this.setState({
        baseBoard: this.state.board,
        board: newBoard,
        piece,
      })
    } else {
      this.setState({ gameOver: true })
    }
  }

  movePieceLeft() {
    return this.updatePiece({ x: -1 })
  }

  movePieceRight() {
    return this.updatePiece({ x: 1 })
  }

  movePieceDown() {
    return this.updatePiece({ y: 1 })
  }

  resetGamestate(gamestate) {
    this.setState({
      baseBoard: gamestate.get('baseBoard'),
      board: gamestate.get('board'),
      piece: gamestate.get('piece'),
    })
  }

  render() {
    const { board, paused, gameOver } = this.state
    return (
      <div>
        <div>
          {paused ? 'Paused' : 'Press P to pause'}
        </div>
        <div>
          {gameOver ? 'GAME OVER, MAN! GAME OVER!' : ''}
        </div>
        <div>
          <Board
            width={BOARD_WIDTH}
            height={BOARD_HEIGHT}
            blockSize={BLOCK_SIZE}
            cellSpacing={CELL_SPACING}
            cells={board}
          />
        </div>
      </div>
    )
  }
}

export default Game
