React = require 'react'
immut = require 'immutable'
kd = require 'keydrown'
randomColor = require 'randomcolor'
extend = require 'lodash/object/extend'
random = require 'lodash/number/random'
compact = require 'lodash/array/compact'

Board = require './Board.cjsx'

PIECES = immut.fromJS require('../pieces.coffee')
PIECE_COLORS = randomColor count: 7, luminosity: 'bright'
BOARD_WIDTH = 10 # blocks
BOARD_HEIGHT = 20 # blocks
BLOCK_SIZE = 10
CELL_SPACING = 1

logBoard = (board) ->
  unless board
    console.error "Invalid board:", board
    return
  rowText = board.map (row) ->
    cellText = row.map (cell) ->
      if cell? then '■' else '□'
    cellText.join(" ")
  console.log rowText.join("\n")

emptyRow = ->
  for x in [1..BOARD_WIDTH]
    null

emptyBoard = ->
  board = for y in [1..BOARD_HEIGHT]
    emptyRow()
  immut.fromJS board

makePiece = (data={}) ->
  data.rotationIndex ?= 0
  data.type ?= random 0, PIECES.size-1
  data.blocks ?= PIECES.get(data.type).get(data.rotationIndex)
  data.color ?= PIECE_COLORS[data.type] ? 'black'
  immut.fromJS data

updatePiece = (prevPiece, deltas) ->
  prevPiece.withMutations (piece) ->
    if deltas.rotationIndex?
      newRotationIndex = piece.get('rotationIndex') + deltas.rotationIndex
      newRotationIndex = 0 if newRotationIndex > 3
      newRotationIndex = 3 if newRotationIndex < 0
      piece.set 'rotationIndex', newRotationIndex
      piece.set 'blocks', PIECES.get(piece.get('type')).get(newRotationIndex)
    piece.set 'x', piece.get('x') + (deltas.x ? 0)
    piece.set 'y', piece.get('y') + (deltas.y ? 0)

# Returns a bounding box for a pieces visible blocks in the form of:
# {x, y, width, height}
getPieceVisibleBox = (piece) ->
  outerX = piece.get('x')
  outerY = piece.get('y')
  [minX, maxX, minY, maxY] = [null, null, null, null]
  piece.get('blocks').forEach (row, yOffset) ->
    row.forEach (cell, xOffset) ->
      return unless cell
      [cellX, cellY] = [outerX + xOffset, outerY + yOffset]
      minX = Math.min.apply @, compact([cellX, minX])
      minY = Math.min.apply @, compact([cellY, minY])
      maxX = Math.max.apply @, compact([cellX, maxX])
      maxY = Math.max.apply @, compact([cellY, maxY])
  {x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1}

# Returns copy of the given board with completed rows removed
removeCompletedRows = ({board}) ->
  result = board.filter (row) ->
    !row.every (cell) -> cell?
  if result.count() < BOARD_HEIGHT
    newEmptyRows = for [1..BOARD_HEIGHT - result.size]
      emptyRow()
    result = immut.fromJS(newEmptyRows).concat result
  result.toList()

isPieceInBounds = ({piece, board}) ->
  visible = getPieceVisibleBox piece
  outOfBounds = (visible.y + visible.height) > BOARD_HEIGHT or
    (visible.x + visible.width) > BOARD_WIDTH or
    visible.x < 0
  !outOfBounds


# Returns a copy of the given board with the piece rendered into it
boardWithPiece = ({piece, board}) ->
  blockColor = piece.get('color')
  pieceX = piece.get('x')
  pieceY = piece.get('y')

  return false unless isPieceInBounds({piece, board})

  collision = false

  newBoard = board

  piece.get('blocks').forEach (row, yOffset) ->
    return if collision
    row.forEach (cell, xOffset) ->
      return if collision
      [x, y] = [xOffset + pieceX, yOffset + pieceY]
      return if x < 0 or x >= BOARD_WIDTH or y >= BOARD_HEIGHT
      newBoardCell = if cell then {color: blockColor} else null
      newBoard = newBoard.withMutations (b) ->
        newBoardRow = b.get(y).withMutations (prevBoardRow) ->
          if prevBoardRow.get(x)
            if newBoardCell?
              collision = true
          else
            prevBoardRow.set x, newBoardCell
        b.set y, newBoardRow

  return false if collision

  newBoard

# Returns a new board with the piece rendered in the given position.
# Removes any completed rows. If new piece position is invalid, returns false.
makeBoard = ({piece, board}) ->
  board ?= emptyBoard()
  board = removeCompletedRows board: board
  board = boardWithPiece board: board, piece: piece
  immut.fromJS board

Game = React.createClass
  getInitialState: ->
    baseBoard = emptyBoard()
    paused: false
    baseBoard: baseBoard
    board: baseBoard
    gamestates: immut.List()

  addPiece: ->
    piece = makePiece x: 4, y: 0
    newBoard = makeBoard piece: piece, board: @state.board
    if newBoard
      @setState
        baseBoard: @state.board
        board: newBoard
        piece: piece
    else
      @setState
        gameOver: true

  componentDidMount: ->
    @addPiece()
    @run()

  run: ->
    kd.run -> kd.tick()
    @listenForUserInput()
    @startAutoPieceDrop()

  listenForUserInput: ->
    kd.UP.press => @rotatePieceCW()
    kd.SPACE.press => @hardDropPiece()
    kd.P.press => @setState paused: !@state.paused
    setInterval (=> @handleMovePiece()), 100

  startAutoPieceDrop: ->
    fn = =>
      return if @state.paused
      movedDown = @movePieceDown()
      unless movedDown
        @addPiece()
    setInterval fn, 800

  handleMovePiece: ->
    @movePieceRight() if kd.RIGHT.isDown()
    @movePieceLeft() if kd.LEFT.isDown()
    @movePieceDown() if kd.DOWN.isDown()

  hardDropPiece: ->
    for [1..BOARD_HEIGHT]
      @updatePiece y: 1
    @addPiece()

  rotatePieceCW: ->
    @updatePiece rotationIndex: 1

  rotatePieceCCW: ->
    @updatePiece rotationIndex: -1

  rotatePiece: (offset) ->
    newBoard = @board piece: newPiece
    unless immut.is @board(), newBoard
      @setState rotationIndex: newRotationIndex, piece: newPiece

  updatePiece: (deltas={}) ->
    newPiece = updatePiece @state.piece, deltas
    newBoard = makeBoard piece: newPiece, board: @state.baseBoard
    if newBoard
      @setGamestate board: newBoard, piece: newPiece
      true
    else
      false

  setGamestate: (data={}) ->
    data.baseBoard ?= @state.baseBoard
    newGamestate = immut.Map data
    newState = extend data, gamestates: @state.gamestates.push newGamestate
    @setState newState

  movePieceLeft: ->
    @updatePiece x: -1

  movePieceRight: ->
    @updatePiece x: 1

  movePieceDown: ->
    @updatePiece y: 1

  resetGamestate: (gamestate) ->
    @setState
      baseBoard: gamestate.get('baseBoard')
      board: gamestate.get('board')
      piece: gamestate.get('piece')

  render: ->
    board = @state.board

    <div>
      <div>
        {if @state.paused then 'Paused' else 'Press P to pause'}
      </div>
      <div>
        {if @state.gameOver then 'GAME OVER, MAN! GAME OVER!'}
      </div>
      <div>
        <Board
          width={BOARD_WIDTH}
          height={BOARD_HEIGHT}
          blockSize={BLOCK_SIZE}
          cellSpacing={CELL_SPACING}
          cells={@state.board}
        />
      </div>
    </div>

module.exports = Game
