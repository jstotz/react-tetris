window._ = require 'underscore'
immut = require 'immutable'
kd = require 'keydrown'

PIECES = immut.fromJS(require './pieces.coffee')

BOARD_WIDTH = 10
BOARD_HEIGHT = 20
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

testBoard = ->
  board = for y in [1..BOARD_HEIGHT]
    for x in [1..BOARD_WIDTH]
      if y > 10
        {color: 'red'}
      else
        null
  immut.fromJS board

makePiece = (data) ->
  immut.fromJS data

updatePiece = (prevPiece, deltas) ->
  prevPiece.withMutations (piece) ->
    if deltas.rotationIndex?
      newRotationIndex = piece.get('rotationIndex') + deltas.rotationIndex
      newRotationIndex = 0 if newRotationIndex > 3
      newRotationIndex = 3 if newRotationIndex < 0
      piece.set 'rotationIndex', newRotationIndex
      piece.set 'blocks', PIECES.get(0).get(newRotationIndex)
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
      minX = Math.min.apply @, _.compact([cellX, minX])
      minY = Math.min.apply @, _.compact([cellY, minY])
      maxX = Math.max.apply @, _.compact([cellX, maxX])
      maxY = Math.max.apply @, _.compact([cellY, maxY])
  {x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1}

removeCompletedRows = ({board}) ->
  result = board.filter (row) ->
    !row.every (cell) -> cell?
  if result.count() < BOARD_HEIGHT
    newEmptyRows = for [1..BOARD_HEIGHT - result.length]
      emptyRow()
    result = immut.fromJS(newEmptyRows).concat result
  result.toVector()

boardWithPiece = ({piece, board}) ->
  blockColor = 'green'
  pieceX = piece.get('x')
  pieceY = piece.get('y')
  visible = getPieceVisibleBox piece
  console.debug "Visible:", visible

  outOfBounds = (visible.y + visible.height) > BOARD_HEIGHT or
    (visible.x + visible.width) > BOARD_WIDTH or
    visible.x < 0
  return false if outOfBounds

  collision = false

  newBoard = board

  piece.get('blocks').forEach (row, yOffset) ->
    return if collision
    row.forEach (cell, xOffset) ->
      return if collision
      [x, y] = [xOffset + pieceX, yOffset + pieceY]
      return if x >= BOARD_HEIGHT or y >= BOARD_HEIGHT
      newBoardCell = if cell then {color: blockColor} else null
      newBoard = newBoard.withMutations (b) ->
        newBoardRow = b.get(y).withMutations (prevBoardRow) ->
          if prevBoardRow.get(x)
            if newBoardCell?
              console.debug "COLLISION: Existing:", prevBoardRow.get(x), "New:", newBoardCell
              collision = true
          else
            prevBoardRow.set x, newBoardCell
        b.set y, newBoardRow

  return false if collision

  newBoard


# Returns a new board with the piece rendered in the given position.
# If new piece position is invalid, returns null.
makeBoard = ({piece, board}) ->
  board ?= emptyBoard()
  console.debug "Making new board with this as the initial board:"
  logBoard board
  board = removeCompletedRows board: board
  board = boardWithPiece board: board, piece: piece
  console.info "Made board:"
  logBoard board
  immut.fromJS board

Board = React.createClass
  render: ->
    blocks = []
    y = 0
    console.log "Rendering board"
    logBoard @props.cells
    @props.cells.forEach (row, rowIdx) ->
      x = 0
      row.forEach (cell, colIdx) ->
        blockColor = cell?.color ? '#eee'
        blocks.push <rect
            x={x}
            y={y}
            width={BLOCK_SIZE}
            height={BLOCK_SIZE}
            fill={blockColor}
          />
        x += BLOCK_SIZE + CELL_SPACING
      y += BLOCK_SIZE + CELL_SPACING
    <g>{blocks}</g>

Game = React.createClass
  getInitialState: ->
    baseBoard = testBoard()
    baseBoard: baseBoard
    board: baseBoard

  addPiece: ->
    piece = makePiece(blocks: PIECES.get(0).get(0), x: 0, y: 0, rotationIndex: 0)
    @setState
      baseBoard: @state.board
      board: makeBoard piece: piece, board: @state.board
      piece: piece

  componentDidMount: ->
    @addPiece()
    @run()

  run: ->
    kd.run -> kd.tick()
    kd.UP.press => @rotatePieceCW()
    kd.SPACE.press => @hardDropPiece()
    setInterval (=> @handleMovePiece()), 100
    setInterval (=> @movePieceDown()), 1000
    setInterval (=> @addPiece() if immut.is @state.prevBoard, @state.board), 1000
    @monitorBoardChanges()

  monitorBoardChanges: ->
    startingBoard = @state.board
    fn = =>
      if immut.is @state.board, startingBoard
        console.debug "No board change...adding piece"
        @addPiece()
      @monitorBoardChanges()
    setTimeout fn, 1000

  handleMovePiece: ->
    @movePieceRight() if kd.RIGHT.isDown()
    @movePieceLeft() if kd.LEFT.isDown()
    @movePieceDown() if kd.DOWN.isDown()

  hardDropPiece: ->
    console.warn "Not implemented"

  rotatePieceCW: ->
    @updatePiece rotationIndex: 1

  rotatePieceCCW: ->
    @updatePiece rotationIndex: -1

  rotatePiece: (offset) ->
    newBoard = @board piece: newPiece
    unless immut.is @board(), newBoard
      @setState rotationIndex: newRotationIndex, piece: newPiece

  updatePiece: (deltas={}) ->
    console.debug "Attempting to update piece:", @state.piece.toJSON(), 'with:', deltas
    newPiece = updatePiece @state.piece, deltas
    newBoard = makeBoard piece: newPiece, board: @state.baseBoard
    if newBoard
      console.debug ">> Success! New piece: ", newPiece.toJSON()
      @setState board: newBoard, piece: newPiece
    else
      console.warn ">> Invalid move"

  movePieceLeft: ->
    @updatePiece x: -1

  movePieceRight: ->
    @updatePiece x: 1

  movePieceDown: ->
    @updatePiece y: 1

  render: ->
    board = @state.board
    <svg><Board cells={board} /></svg>

module.exports = Game
