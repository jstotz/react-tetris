React = require 'react'

Board = React.createClass
  propTypes:
    width: React.PropTypes.number
    height: React.PropTypes.number
    blockSize: React.PropTypes.number
    cellSpacing: React.PropTypes.number

  render: ->
    svgWidth = @props.width * @props.blockSize + (@props.width - 1) * @props.cellSpacing
    svgHeight = @props.height * @props.blockSize + (@props.height - 1) * @props.cellSpacing

    blocks = []
    y = 0
    @props.cells.forEach (row, rowIdx) =>
      x = 0
      row.forEach (cell, colIdx) =>
        blockColor = cell?.color ? '#eee'
        blocks.push <rect x={x} y={y}
            width={@props.blockSize}
            height={@props.blockSize}
            fill={blockColor}
          />
        x += @props.blockSize + @props.cellSpacing
      y += @props.blockSize + @props.cellSpacing

    <svg preserveAspectRatio="xMinYMin meet" height="100%" viewBox="0 0 #{svgWidth} #{svgHeight}">
      {blocks}
    </svg>

module.exports = Board
