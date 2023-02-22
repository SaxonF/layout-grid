import "./styles.css";
import { useState, useEffect, useCallback, useRef } from "react";
import { Rnd } from "react-rnd";
import { motion } from "framer-motion";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { Reorder } from "framer-motion";

export default function Section() {
  const [columnCount, setColumnCount] = useState(12);
  const [gap, setGap] = useState(8);
  const [height, setHeight] = useState(200);
  const [rowCount, setRowCount] = useState(1);
  const [blocks, setBlocks] = useState([]);
  const blocksRef = useRef([]);
  const columnsRef = useRef([]);
  const [newBlockSpan, setNewBlockSpan] = useState(null);
  const currentBlock = useRef(null);
  const [resizing, setResizing] = useState(false);
  const [autoGrid, setAutoGrid] = useState(false);
  const [snapGrid, setSnapGrid] = useState(true);
  const [minWidth, setMinWidth] = useState(200);

  useEffect(() => {
    const saveNewBlock = (event) => {
      if (newBlockSpan !== null) {
        setBlocks((blocks) => [...blocks, newBlockSpan]);
        setNewBlockSpan(null);
      }
    };

    document.addEventListener("mouseup", saveNewBlock);
    return () => {
      document.removeEventListener("mouseup", saveNewBlock);
    };
  }, [newBlockSpan]);

  const addNewBlock = () => {
    setBlocks((blocks) => [
      ...blocks,
      { columns: [1, 2], rows: [1, 2], id: Date.now(), widthType: "fill" }
    ]);
  };

  const handleGridEnter = (index) => {
    const colPlace =
      (index + 1) % columnCount === 0 ? columnCount : (index + 1) % columnCount;
    const rowPlace = Math.ceil((index + 1) / columnCount);
    if (newBlockSpan) {
      const newBlock = { ...newBlockSpan };
      newBlock.columns[1] = colPlace + 1;
      newBlock.rows[1] = rowPlace + 1;
      setNewBlockSpan(newBlock);
    }
  };

  const handleMouseDown = (index) => {
    const col =
      (index + 1) % columnCount === 0
        ? parseInt(columnCount)
        : (index + 1) % columnCount;
    setNewBlockSpan({
      id: Date.now(),
      columns: [col, col + 1],
      widthType: "fill",
      rows: [
        Math.ceil((index + 1) / columnCount),
        Math.ceil((index + 1) / columnCount) + 1
      ]
    });
  };

  const handleResize = (e, pointInfo) => {
    e.stopPropagation();
    const colWidth = columnsRef.current[0].getBoundingClientRect().width;
    const updatedBlocks = [...blocks];
    const updatedBlock = updatedBlocks.find(
      (b) => b.id === currentBlock.current.id
    );

    //update horizontal
    updatedBlock.columns[1] =
      currentBlock.current.columns[1] +
      Math.round(pointInfo.offset.x / (colWidth + gap));
    setBlocks(updatedBlocks);

    //update veritcal
    updatedBlock.rows[1] =
      currentBlock.current.rows[1] +
      Math.round(pointInfo.offset.y / (height + gap));
  };

  const handleDrag = (e, pointInfo) => {
    if (e.target.classList.contains("resize")) return;

    const colWidth = columnsRef.current[0].getBoundingClientRect().width;
    const updatedBlocks = [...blocks];
    const updatedBlock = updatedBlocks.find(
      (b) => b.id === currentBlock.current.id
    );
    //update horizontal
    updatedBlock.columns[0] =
      currentBlock.current.columns[0] +
      Math.round(pointInfo.offset.x / (colWidth + gap));
    updatedBlock.columns[1] =
      currentBlock.current.columns[1] +
      Math.round(pointInfo.offset.x / (colWidth + gap));
    setBlocks(updatedBlocks);

    //update vertical
    updatedBlock.rows[0] =
      currentBlock.current.rows[0] +
      Math.round(pointInfo.offset.y / (height + gap));
    updatedBlock.rows[1] =
      currentBlock.current.rows[1] +
      Math.round(pointInfo.offset.y / (height + gap));
  };

  const handleAutoGrid = () => {
    setAutoGrid(!autoGrid);
  };

  const handleSnap = () => {
    setSnapGrid(!snapGrid);
  };

  const handleColumnSize = ({ block, size }) => {
    const updatedBlocks = [...blocks];
    const updatedBlock = updatedBlocks.find((b) => b.id === block.id);
    updatedBlock.widthType = size;
    setBlocks(updatedBlocks);
  };

  return (
    <div className="section">
      {newBlockSpan && (
        <div
          style={{
            gap: gap,
            gridTemplateColumns: `repeat( ${columnCount}, minmax(0, 1fr) )`,
            gridTemplateRows: `repeat( ${rowCount}, ${height}px )`
          }}
          className="shadow-grid"
        >
          <div
            className="new-item"
            style={{
              gridColumn: newBlockSpan.columns.join("/"),
              gridRow: newBlockSpan.rows.join("/")
            }}
          />
        </div>
      )}
      <div
        style={{
          pointerEvents: autoGrid || !snapGrid ? "auto" : "none",
          gap: gap,
          gridTemplateColumns: `repeat( ${
            autoGrid ? "auto-fit" : columnCount
          }, minmax(${autoGrid ? minWidth : 0}px, 1fr) )`,
          gridTemplateRows: `repeat( ${rowCount}, ${height}px )`,
          gridAutoRows: autoGrid ? height : "auto"
        }}
        className={snapGrid ? `grid` : "flex"}
      >
        {blocks.map((block, index) => (
          <motion.div
            className={`block ${
              currentBlock.current?.id === block.id
                ? "resizing"
                : "not-resizing"
            } ${block.widthType}`}
            key={index}
            style={{
              minWidth: snapGrid ? 0 : minWidth,
              gridColumn: autoGrid ? "auto" : block.columns.join("/"),
              gridRow: autoGrid ? "auto" : block.rows.join("/")
            }}
            ref={(el) => (blocksRef.current[block.id] = el)}
          >
            <motion.div className="resizer">
              <div className="tools">
                <motion.div
                  className="drag-handle"
                  onPanStart={(e) => {
                    setResizing(true);
                    currentBlock.current = {
                      id: block.id,
                      columns: [...block.columns],
                      rows: [...block.rows]
                    };
                  }}
                  onPanEnd={() => {
                    currentBlock.current = null;
                    setResizing(false);
                  }}
                  onPan={handleDrag}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8 7H10V5H8V7ZM8 13H10V11H8V13ZM8 19H10V17H8V19ZM14 5V7H16V5H14ZM14 13H16V11H14V13ZM14 19H16V17H14V19Z"
                      fill="currentColor"
                    />
                  </svg>
                </motion.div>
                {!snapGrid && (
                  <ToggleGroup.Root
                    className="ToggleGroup"
                    type="single"
                    defaultValue="fill"
                    value={block.widthType}
                    onValueChange={(size) => handleColumnSize({ block, size })}
                    aria-label="Block width"
                  >
                    <ToggleGroup.Item
                      className="ToggleGroupItem"
                      value="fill"
                      aria-label="Fill"
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M9.375 7L5 11.5M5 11.5L9.375 16M5 11.5H20M20 11.5L15.625 7M20 11.5L15.625 16"
                          stroke="currentColor"
                          stroke-width="1.5"
                        />
                      </svg>
                    </ToggleGroup.Item>
                    <ToggleGroup.Item
                      className="ToggleGroupItem"
                      value="fit"
                      aria-label="Fit"
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect
                          x="10"
                          y="3"
                          width="4"
                          height="18"
                          rx="1.5"
                          fill="currentColor"
                        />
                        <path
                          d="M20.8289 15.9762L18 11.9881L20.8289 8L21.7715 8.9762L19.635 11.9881L21.7715 15L20.8289 15.9762Z"
                          fill="currentColor"
                        />
                        <path
                          d="M2.94256 8L5.7715 11.9881L2.94256 15.9762L2 15L4.13652 11.9881L2 8.97619L2.94256 8Z"
                          fill="currentColor"
                        />
                      </svg>
                    </ToggleGroup.Item>
                  </ToggleGroup.Root>
                )}
              </div>
              <motion.div
                className="resize resize-left"
                onPanStart={(e) => {
                  setResizing(true);
                  currentBlock.current = {
                    id: block.id,
                    columns: [...block.columns],
                    rows: [...block.rows]
                  };
                }}
                onPanEnd={() => {
                  currentBlock.current = null;
                  setResizing(false);
                }}
                onPan={handleResize}
              />
            </motion.div>
          </motion.div>
        ))}
        {(autoGrid || !snapGrid) && (
          <button className="add-block" onClick={addNewBlock}>
            Add new block
          </button>
        )}
      </div>
      {!autoGrid && snapGrid && (
        <div
          style={{
            gap: gap,
            gridTemplateColumns: `repeat( ${columnCount}, minmax(0, 1fr) )`,
            gridTemplateRows: `repeat( ${rowCount}, ${height}px )`
          }}
          className="shadow-grid"
        >
          {[...Array(columnCount * rowCount)].map((col, index) => (
            <div
              className="shadow-item"
              key={index}
              onMouseDown={(e) => {
                e.preventDefault();
                handleMouseDown(index);
              }}
              ref={(el) => (columnsRef.current[index] = el)}
              onMouseEnter={() => handleGridEnter(index)}
            ></div>
          ))}
        </div>
      )}
      <button
        className="add-row"
        onClick={() => setRowCount((rows) => rows + 1)}
      >
        Add row
      </button>
      <div>
        <label>
          <input checked={snapGrid} onChange={handleSnap} type="checkbox" />
          Snap to grid
        </label>
        {snapGrid ? (
          <div>
            <label>
              <input
                checked={autoGrid}
                onChange={handleAutoGrid}
                type="checkbox"
              />
              Auto grid
            </label>

            {autoGrid ? (
              <div>
                <label>Min Width</label>
                <input
                  type="number"
                  value={minWidth}
                  onChange={(e) => setMinWidth(e.target.value)}
                />
              </div>
            ) : (
              <div>
                <label>Columns</label>
                <input
                  type="number"
                  value={columnCount}
                  onChange={(e) => setColumnCount(e.target.value)}
                />
              </div>
            )}
          </div>
        ) : (
          <div>
            <label>Min Width</label>
            <input
              type="number"
              value={minWidth}
              onChange={(e) => setMinWidth(e.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
