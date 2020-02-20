const { XYPoint } = require('./xy-point')

/*
 * XY utilities. Many of the methods, as marked, were adapted from Bryan Johnson's work (http://bit.ly/2bHHjxd)
 */

class XYUtil {
  /**
   * Returns the cross product of two XYPoints.
   *
   * @author Bryan Johnson [original], Todd Dukart [conversion]
   *
   * @param {XYPoint} p1 Point 1.
   * @param {XYPoint} p2 Point 2.
   * @returns {number} Cross-product of the two XYPoints provided.
   */
  static crossProduct (p1, p2) {
    return (p1.x * p2.y - p1.y * p2.x)
  }

  /**
   * Find the closest point on a line. This point will be reproducible by a Hue lamp.
   *
   * @author Bryan Johnson [original], Todd Dukart [conversion]
   *
   * @param {XYPoint} start The point where the line starts.
   * @param {XYPoint} end The point where the line ends.
   * @param {XYPoint} point The point which is close to the line.
   * @returns {XYPoint} A point that is on the line, and closest to the XYPoint provided.
   */
  static getClosestPointOnLine (start, end, point) {
    const AP = new XYPoint(point.x - start.x, point.y - start.y)
    const AB = new XYPoint(end.x - start.x, end.y - start.y)
    const ab2 = AB.x * AB.x + AB.y * AB.y
    const apAb = AP.x * AB.x + AP.y * AB.y
    let t = apAb / ab2

    if (t < 0) {
      t = 0
    } else if (t > 1) {
      t = 1
    }

    return new XYPoint(start.x + AB.x * t, start.y + AB.y * t)
  }

  /**
   * Returns the distance between two XYPoints.
   *
   * @author Bryan Johnson [original], Todd Dukart [conversion]
   *
   * @param {XYPoint} p1 The first point.
   * @param {XYPoint} p2 The second point.
   * @returns {number} The distance between points one and two.
   */
  static getDistanceBetweenTwoPoints (p1, p2) {
    // horizontal difference
    const dx = p1.x - p2.x
    // vertical difference
    const dy = p1.y - p2.y

    return Math.sqrt(dx * dx + dy * dy)
  }
}

module.exports = { XYUtil }
