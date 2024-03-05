// @ts-check

/** @typedef {"air" | "water" | "fire" | "earth"} Hexagon */
/** @typedef {Hexagon[][]} HexagonMap */
/** @typedef {{row: number; col: number;}} GridCoords */

/**
 * @param {number} number
 * @returns {boolean}
 */
const isEven = (number) => number % 2 === 0;

/** @type {Record<Hexagon, Hexagon>} */
const TYPESAFE_SET_OF_HEXAGON_TYPES = {
  air: "air",
  earth: "earth",
  fire: "fire",
  water: "water",
};
const HEXAGON_TYPES = Object.values(TYPESAFE_SET_OF_HEXAGON_TYPES);

/**
 * @template T
 * @param {T[]} a
 * @returns {T}
 */
const getRandomFromArray = (a) => a[Math.floor(Math.random() * a.length)];

/**
 * Returns an array which represents the hexagons of the map.
 * Each row represents a row of the map, but due to how each hexagon fits into each other, the even rows (counting from zero) start to the very left of the drawing,
 * and the odd rows start a little to the right.
 * As an example, given the rows
 * [
 *      [A,B],
 *      [C,D],
 *      [E,F]
 * ];
 * the visual representation should look like this:
 *   __    __
 *  / A\__/ B\__
 *  \__/ C\__/ D\
 *  / E\__/ F\__/
 *  \__/  \__/
 *
 *  @type {(rows: number, cols: number) => HexagonMap} */
function createHexagonMap(rows, cols) {
  /** @type {HexagonMap} */
  const hexes = [];
  for (let i = 0; i < rows; i++) {
    hexes[i] = [];
    for (let j = 0; j < cols; j++) {
      hexes[i][j] = getRandomFromArray(HEXAGON_TYPES);
    }
  }
  return hexes;
}

/**
 * @template V
 * @param {V  | null} a
 * @returns {a is V}
 */
const isNotNull = (a) => a !== null;

/**
 * Pass this function a map of hexagons, and then to the result pass the coords of the hexagon you want to know the tangent hexagons of.
 * Tangent hexagons means that on the honeycomb-like visualization, they visually touch the hexagon that you specified.
 *
 * @param {HexagonMap} map
 * @returns {(hexagonCoords: GridCoords) => GridCoords[] }
 */
const getTangentIndicesForHexagonWithCoords = (map) => (hexagonCoords) => {
  /* Now. This is the complex part of this small computere programme.
   * Let's make some more hexagons to think a little more comfortably.
   * Given the following rows:
   *  [
   *      [A,B,C,D], // 0
   *      [E,F,G,H], // 1
   *      [I,J,K,L], // 2
   *      [M,N,O,P], // 3
   *      [Q,R,S,T], // 4
   *      [U,V,W,X]  // 5
   * ];
   * the visual representation should look like this:
   *   __    __    __    __
   *  / A\__/ B\__/ C\__/ D\__
   *  \__/ E\__/ F\__/ G\__/ H\
   *  / I\__/ J\__/ K\__/ L\__/
   *  \__/ M\__/ N\__/ O\__/ P\
   *  / Q\__/ R\__/ S\__/ T\__/
   *  \__/ U\__/ V\__/ W\__/ X\
   *     \__/  \__/  \__/  \__/
   *
   * Great! Now we have
   *  - a few hexes (J,K,L) on an EVEN row that have tangent hexes on all six sides and
   *  - a few hexes (M,N,O) on an ODD row that have tangent hexes on all six sides.
   * Let's observe how their tangency behaves (they behave differently depending on the evenness of their row).
   *
   * Starting with EVEN rows, let's take J as an example.
   * J's coordinates are
   * [2, 1], and its tangents are
   *
   * [0, 1] (B)
   * [1, 0] (E)
   * [1, 1] (F)
   * [3, 0] (M)
   * [3, 1] (N)
   * [4, 1] (R)
   *
   * So what do we know after observing its tangents?
   * We've observed that from the two immediate rows of same evenness as J (which are, given that J's row is 2, rows 2-2 and 2+2, which is to say rows 0 and 4) we got two tangents, only one per row: B and R.
   *    Those are the hexes that are directly above and below J. Their column value stayed the same as J's. Both have the column 1.
   * We've also observed that from the two immediate rows of different evenness from J, this is, 1 and 3, we got two tangents per row. These tangents were those of same column as J (1), or one less (0).
   *
   * In short, we have two same-evenness tangents, and then we have two one-row-above tangents and two one-row-below tangents.
   *
   * With this, we have enough to understand the following code.
   *
   * Ah, we'll also have to sort out the edge cases, namely out-of-bounds errors for those hexes that don't have all six sides touching other hexes.
   * We could check whether every single col and row exists or we can just access the map itself, see if there's anything there and if there is we're good.
   *
   */

  if (isEven(hexagonCoords.row)) {
    return [
      // Same-evenness
      map[hexagonCoords.row - 2]?.[hexagonCoords.col] ? { row: hexagonCoords.row - 2, col: hexagonCoords.col } : null,
      map[hexagonCoords.row + 2]?.[hexagonCoords.col] ? { row: hexagonCoords.row + 2, col: hexagonCoords.col } : null,
      // One-row-above
      map[hexagonCoords.row - 1]?.[hexagonCoords.col] ? { row: hexagonCoords.row - 1, col: hexagonCoords.col } : null,
      map[hexagonCoords.row - 1]?.[hexagonCoords.col - 1] ? { row: hexagonCoords.row - 1, col: hexagonCoords.col - 1 } : null,
      // One-row-below
      map[hexagonCoords.row + 1]?.[hexagonCoords.col] ? { row: hexagonCoords.row + 1, col: hexagonCoords.col } : null,
      map[hexagonCoords.row + 1]?.[hexagonCoords.col - 1] ? { row: hexagonCoords.row + 1, col: hexagonCoords.col - 1 } : null,
    ].filter(isNotNull);
  } else {
    /*
     * Let's bring back the vizualisation for convenience.
     * Rows:
     *  [
     *      [A,B,C,D], // 0
     *      [E,F,G,H], // 1
     *      [I,J,K,L], // 2
     *      [M,N,O,P], // 3
     *      [Q,R,S,T], // 4
     *      [U,V,W,X]  // 5
     * ];
     * Graph:
     *   __    __    __    __
     *  / A\__/ B\__/ C\__/ D\__
     *  \__/ E\__/ F\__/ G\__/ H\
     *  / I\__/ J\__/ K\__/ L\__/
     *  \__/ M\__/ N\__/ O\__/ P\
     *  / Q\__/ R\__/ S\__/ T\__/
     *  \__/ U\__/ V\__/ W\__/ X\
     *     \__/  \__/  \__/  \__/
     *
     * So what's the deal with ODD rows?
     *
     * let's take M as an example.
     * M's coordinates are
     * [3, 0], and its tangents are
     *
     * [1, 0] (E)
     * [2, 0] (I)
     * [2, 1] (J)
     * [4, 0] (Q)
     * [4, 1] (R)
     * [5, 0] (U)
     *
     * Predictably, there are two same-evenness hexes (E and U) that are just the same coordinate with the row being the same plus or minus two.
     * The different-evenness hexes are the same row plus or minus one, and the same column or the same column plus one.
     */
    return [
      // Same-evenness
      map[hexagonCoords.row - 2]?.[hexagonCoords.col] ? { row: hexagonCoords.row - 2, col: hexagonCoords.col } : null, // This could be DRY, but at what cost!
      map[hexagonCoords.row + 2]?.[hexagonCoords.col] ? { row: hexagonCoords.row + 2, col: hexagonCoords.col } : null,
      // One-row-above
      map[hexagonCoords.row - 1]?.[hexagonCoords.col] ? { row: hexagonCoords.row - 1, col: hexagonCoords.col } : null,
      map[hexagonCoords.row - 1]?.[hexagonCoords.col + 1] ? { row: hexagonCoords.row - 1, col: hexagonCoords.col + 1 } : null,
      // One-row-below
      map[hexagonCoords.row + 1]?.[hexagonCoords.col] ? { row: hexagonCoords.row + 1, col: hexagonCoords.col } : null,
      map[hexagonCoords.row + 1]?.[hexagonCoords.col + 1] ? { row: hexagonCoords.row + 1, col: hexagonCoords.col + 1 } : null,
    ].filter(isNotNull);
  }
};

// Drawing-specific code

const CANVAS_ID = "canvas";
const hexagons = createHexagonMap(8, 4);
const HEX_RADIUS = 60;
const HEX_DIAMETER = HEX_RADIUS * 2;

function setup() {
  const clientHeight = document.getElementById(CANVAS_ID)?.clientHeight ?? 0;
  const clientWidth = document.getElementById(CANVAS_ID)?.clientWidth ?? 0;
  const canvas = createCanvas(clientWidth, clientHeight);
  canvas.parent(CANVAS_ID);
}

// from https://p5js.org/examples/form-regular-polygon.html
function polygon(x, y, radius, npoints) {
  let angle = TWO_PI / npoints;
  beginShape();
  for (let a = 0; a < TWO_PI; a += angle) {
    let sx = x + cos(a) * radius;
    let sy = y + sin(a) * radius;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}

/**
 *
 * @param {number} x
 * @param {number} y
 * @param {number} radius
 * @returns
 */
function hexagon(x, y, radius) {
  return polygon(x, y, radius, 6);
}

/* To make a grid of hexagons, each row should be a half-hexagon down from the previous one.
 *
 * Let's find out what the half-height of a hexagon is. To start, the height of the hexagon is determined by its radius.
 * Look at a side:
 *  /
 *  \
 * Those angles from the center of the hex to the vertex are 60° each, forming small triangles
 *  (there are six of them in a 360° turn, 360° / 6 = 60°).
 *   ____
 *  /\  /\
 * /__\/__\
 * \  /\  /
 *  \/__\/
 *
 * Look at the top-left triangle. If you cut it in half from the top to the center of the bottom side, you get two right-angled triangles.
 *    ʌ
 *   /|\ <- the length of this side is still just the radius
 *  / | \
 * /__|__\ <- this angle is 60°
 *
 * We need to get the half-height of a hex which equals the vertical side of any of these triangles (i.e. the length of the side opposed to the 60° angle).
 *
 * The sine of an angle equals the ratio between the opposed side of a right-angled triangle and its hypotenuse,
 *  in this context this means that the sine of 60° equals the half-height of a hex divided by the radius of the hex.
 * Solving,
 *      sin(60°) = sqrt(3)/2 = halfHeight / radius
 *      halfHeight = radius * sqrt(3) / 2
 */
const hexHalfHeight = (HEX_RADIUS * Math.sqrt(3)) / 2;

/*
 * Hexagons should leave horizontal space for the hexagons of the following row to fit.
 * Let's look at triangles again.
 *
 *  Pay special attention to this top side here.
 *     |
 *     v
 *   ____
 *  /\  /\
 * /__\/__\
 * \  /\  /
 *  \/__\/
 *   __    __
 *  / A\__/ B\__
 *  \__/ C\__/ D\
 *  / E\__/ F\__/
 *  \__/  \__/
 *
 * See how the distance between A and B equals the top-side of C? That's the space that should be left between columns.
 *
 * So, each hexagon should be offset from its predecessor:
 *  - By its own diameter (this is, its own width)
 *  - Add to that the radius to leave space for the next row
 *
 * We're done!
 */
const offsetByCol = HEX_DIAMETER + HEX_RADIUS;

/** @typedef {{x: number; y: number;}} PixelCoords */

/**
 * @param {number} row
 * @returns {(col: number) => PixelCoords}
 */
const getHexCenterByRowAndCol = (row) => {
  // Offset by the row number
  const rowHeight = (row + 1) * hexHalfHeight;
  return (col) => {
    if (isEven(row)) {
      return {
        // The hex radius is added to the offset because hexagons should be drawn not at X=0 but a half-hex to the right to fit into the screen
        x: col * offsetByCol + HEX_RADIUS,
        y: rowHeight,
      };
    } else {
      return {
        /* The distance between the center of A and the center of C is of 1.5 radii.
         * This offset is added to the drawing of odd-rowed hexes.
         *   __
         *  / A\__
         *  \__/ C\
         *     \__/
         */
        x: col * offsetByCol + HEX_RADIUS + HEX_RADIUS * 1.5,
        y: rowHeight,
      };
    }
  };
};

/**
 *
 * @param {number} row
 * @returns {(col: number) => void}
 */
const drawHexagonAtRowAndCol = (row) => {
  const getHexCenterByCol = getHexCenterByRowAndCol(row);
  return (col) => {
    const hexCenter = getHexCenterByCol(col);
    hexagon(hexCenter.x, hexCenter.y, HEX_RADIUS);
  };
};

/** @typedef {PixelCoords} Vertex */

/**
 *
 * @param {PixelCoords} hexCenter
 * @param {number} bottomSideY
 * @param {number} topSideY
 * @returns {{ topRight: Vertex; topLeft: Vertex; bottomRight: Vertex; bottomLeft: Vertex; left: Vertex; right: Vertex; }}
 */
const getHexVertices = (hexCenter, bottomSideY, topSideY) => {
  /** See this vertex? Its X is a half-triangle away from the center.
   *    The top-right triangle is equilateral. Its top vertex is at the center of its bottom side.
   *   This means that we can just add a half-radius to the hex center and we'll have the vertex's X
   *       |
   *   ____v
   *  /\  /\
   * /__\/__\
   * \  /\  /
   *  \/__\/
   */
  const centerRightVertexX = hexCenter.x + 0.5 * HEX_RADIUS;
  // Also known as "the liberal vertex X"
  const centerLeftVertexX = hexCenter.x - 0.5 * HEX_RADIUS;
  /** @type Vertex */
  const topRightVertex = {
    x: centerRightVertexX,
    y: topSideY,
  };
  /** @type Vertex */
  const topLeftVertex = {
    x: centerLeftVertexX,
    y: topSideY,
  };
  /** @type Vertex */
  const leftVertex = {
    x: hexCenter.x - HEX_RADIUS,
    y: hexCenter.y,
  };
  /** @type Vertex */
  const rightVertex = {
    x: hexCenter.x + HEX_RADIUS,
    y: hexCenter.y,
  };
  /** @type Vertex */
  const bottomRightVertex = {
    x: centerRightVertexX,
    y: bottomSideY,
  };
  /** @type Vertex */
  const bottomLeftVertex = {
    x: centerLeftVertexX,
    y: bottomSideY,
  };

  return {
    topRight: topRightVertex,
    topLeft: topLeftVertex,
    bottomRight: bottomRightVertex,
    bottomLeft: bottomLeftVertex,
    left: leftVertex,
    right: rightVertex,
  };
};

/**
 * @param {number} cursorX
 * @param {number} cursorY
 * @returns {(row: number) => (col: number) => boolean}
 */
const isUserHoveringHexAtCoordByCursorPosition = (cursorX, cursorY) => (row) => {
  const getHexCenterByCol = getHexCenterByRowAndCol(row);
  return (col) => {
    const hexCenter = getHexCenterByCol(col);

    /* If the cursor is to the top of the top of the hex, it is not in the hex.
     * If the cursor is to the bottom of the bottom of the hex, it is not in the hex.
     * If the cursor is northeast of the top-right side, it is not in the hex.
     * So on, so forth.
     * It is in the hex if, and only if, it is within all of its boundaries.
     */

    // Y grows downwards but I'm gonna pretend that top means bottom and vice versa so I don't go insane
    const topSideY = hexCenter.y + hexHalfHeight;
    const bottomSideY = hexCenter.y - hexHalfHeight;

    const isUnderTopSide = cursorY < topSideY;
    const isOverBottomSide = cursorY > bottomSideY;

    // To figure out the diagonals we need the hex's vertices
    const vertices = getHexVertices(hexCenter, bottomSideY, topSideY);

    // Now we do a little linear function analysis

    // So you want to know how to tell if an ordered pair (p, q) is to the left, or right, or top, or bottom, of a line.
    // And you want to know how to represent that line as a function by only having two coordinates of that line
    // Well, so do I.

    /* Say you have the top-right side with its two vertices: (x1, y1) and (x2, y2)
     * One way to figure out whether (p, q) is to the southwest of this top side is to represent the side as a mathematical function
     * For that, we're gonna need its slope `a` and the Y value when its x=0.
     * once we get that, the way to know if (p, q) is to the southwest of the line is to just say
     * "the line is `y = a * x + b`. `q` should be _less_ than `a * p + b`" i.e. `q < a * p + b`
     * The geometrical interpretation is that being to the bottom-left of the top-right side is equivalent to being to the bottom of the side.
     * See:
     *         \
     *           \
     *             \
     *     o         \
     *                 \
     *  This dot is to the left of the line, but if you were to draw a line upwards you'd eventually cross the line. So, it's also to the bottom of the line.
     *
     * Let's start with the top right side then. How do I figure out its slope?
     * Well, its slope is just the relationship, the ratio, between the change in Y and the change in X.
     * So if we have the vertices (x1, y1) and (x2, y2), one way to figure out the slope `a` is to just do
     * a = (y2 - y1) / (x2 - x1)
     */
    const topRightSideSlope = (vertices.topRight.y - vertices.right.y) / (vertices.topRight.x - vertices.right.x);
    // Let me do a little cheating now and get these out of the way
    const bottomLeftSideSlope = topRightSideSlope;
    const topLeftSideSlope = -topRightSideSlope;
    const bottomRightSideSlope = -topRightSideSlope;

    /* Ok now how do I tell what `b` is, i.e, the value of y for which x is zero?
     * Well, we take the slope, replace any of the two dots of the line that we have into the incomplete function and see what comes out!
     * y1 = a * x1 + b
     * b = y1 - a * x1
     */
    const topRightSideB = vertices.right.y - topRightSideSlope * vertices.right.x;
    const topLeftSideB = vertices.left.y - topLeftSideSlope * vertices.left.x;
    const bottomLeftSideB = vertices.bottomLeft.y - bottomLeftSideSlope * vertices.bottomLeft.x;
    const bottomRightSideB = vertices.right.y - bottomRightSideSlope * vertices.right.x;

    // We have everything we need to figure out whether the boundary condition is met!
    // Following the geometrical analysis we did earlier,
    const isSouthWestOfTopRightSide = cursorY < topRightSideSlope * cursorX + topRightSideB;
    const isSouthEastOfTopLeftSide = cursorY < topLeftSideSlope * cursorX + topLeftSideB;
    const isNorthWestOfBottomRightSide = cursorY > bottomRightSideSlope * cursorX + bottomRightSideB;
    const isNorthEastOfBottomLeftSide = cursorY > bottomLeftSideSlope * cursorX + bottomLeftSideB;

    return (
      isUnderTopSide &&
      isOverBottomSide &&
      isSouthWestOfTopRightSide &&
      isSouthEastOfTopLeftSide &&
      isNorthWestOfBottomRightSide &&
      isNorthEastOfBottomLeftSide
    );
  };
};

/** @type {Record<Hexagon, string>} */
const colorByHexType = {
  air: "#aaaaff",
  earth: "#332200",
  fire: "#ff1100",
  water: "#000099",
};

function draw() {
  background(0);
  const isUserHoveringHexAtCoord = isUserHoveringHexAtCoordByCursorPosition(mouseX, mouseY);
  for (let row = 0; row < hexagons.length; row++) {
    const isUserHoveringHexAtCol = isUserHoveringHexAtCoord(row);
    const drawHexagonAtCol = drawHexagonAtRowAndCol(row);
    for (let col = 0; col < hexagons[row].length; col++) {
      const userIsHoveringHex = isUserHoveringHexAtCol(col);
      if (userIsHoveringHex) {
        fill(colorByHexType[hexagons[row][col]]);
      } else {
        fill("white");
      }
      drawHexagonAtCol(col);
    }
  }
}
