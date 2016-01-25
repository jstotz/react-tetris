import React from 'react'

const Board = ({ cells, width, height, blockSize, cellSpacing }) => {
  const svgWidth = width * blockSize + (width - 1) * cellSpacing
  const svgHeight = height * blockSize + (height - 1) * cellSpacing

  const blocks = []
  let y = 0
  cells.forEach((row) => {
    let x = 0
    row.forEach((cell) => {
      const color = cell ? cell.color : '#eee'
      blocks.push(
        <rect
          key={`${x},${y}`}
          x={x}
          y={y}
          width={blockSize}
          height={blockSize}
          fill={color}
        />
      )
      x += blockSize + cellSpacing
    })
    y += blockSize + cellSpacing
  })

  return (
    <svg preserveAspectRatio="xMinYMin meet" height="95%" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
      {blocks}
    </svg>
  )
}

Board.propTypes = {
  cells: React.PropTypes.object,
  width: React.PropTypes.number,
  height: React.PropTypes.number,
  blockSize: React.PropTypes.number,
  cellSpacing: React.PropTypes.number,
}

export default Board
