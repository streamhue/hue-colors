const { XYPoint } = require('./xy-point')
const { XYUtil } = require('./xy-util')

const Red = new XYPoint(0.675, 0.322)
const Lime = new XYPoint(0.4091, 0.518)
const Blue = new XYPoint(0.167, 0.04)

/**
 * Fit a number into a range from 0 to `max`.
 *
 * @param {number} number Value
 * @param {number} max Space
 * @returns {number} Converted value in space
 */
const fitIntoRange = (number, max) => {
  // Convert the hue to a valid value, 0 to 360.
  if (number >= max) {
    number = number % max
  } else if (number < 0) {
    number = number + (max * Math.floor(number / (0 - max)))
  }
  return number
}

/*
 * Color utilities. Many of the methods, as marked, were adapted from Bryan Johnson's work (http://bit.ly/2bHHjxd),
 * which itself was derived from Q42's C# Hue library (http://bit.ly/2bye7ul).
 */

class ColorUtil {
  /**
   * Check if the point can be recreated by a Hue lamp.
   *
   * @author Q42 [original C#] Bryan Johnson [original JavaScript], Todd Dukart [conversion]
   *
   * @param {XYPoint} point The point to test
   * @returns {boolean} Flag indicating if the point is within reproducible range.
   */
  static isInLampsReach (point) {
    const v1 = new XYPoint(Lime.x - Red.x, Lime.y - Red.y)
    const v2 = new XYPoint(Blue.x - Red.x, Blue.y - Red.y)
    const q = new XYPoint(point.x - Red.x, point.y - Red.y)
    const s = XYUtil.crossProduct(q, v2) / XYUtil.crossProduct(v1, v2)
    const t = XYUtil.crossProduct(v1, q) / XYUtil.crossProduct(v1, v2)

    return (s >= 0) && (t >= 0) && (s + t <= 1)
  }

  /**
   * Get the closest point that can be recreated by a Hue lamp.
   *
   * @author Bryan Johnson [original], Todd Dukart [conversion]
   *
   * @param {XYPoint} point The point to test
   * @returns {XYPoint} The closest point that can be recreated by a Hue lamp.
   */
  static getClosestReproduciblePoint (point) {
    // Color is unreproducible, find the closest point on each line in the CIE 1931 'triangle'.
    const pAB = XYUtil.getClosestPointOnLine(Red, Lime, point)
    const pAC = XYUtil.getClosestPointOnLine(Blue, Red, point)
    const pBC = XYUtil.getClosestPointOnLine(Lime, Blue, point)

    // Get the distances per point and see which point is closer to our Point.
    const dAB = XYUtil.getDistanceBetweenTwoPoints(point, pAB)
    const dAC = XYUtil.getDistanceBetweenTwoPoints(point, pAC)
    const dBC = XYUtil.getDistanceBetweenTwoPoints(point, pBC)
    let lowest = dAB
    let closestPoint = pAB

    if (dAC < lowest) {
      lowest = dAC
      closestPoint = pAC
    }

    if (dBC < lowest) {
      lowest = dBC
      closestPoint = pBC
    }

    return closestPoint
  }

  /**
   * Parses a valid hex color string and returns the Red RGB integer value.
   *
   * @author Bryan Johnson [original], Todd Dukart [conversion]
   *
   * @param {string} hex Hex color string.
   * @returns {number} Red integer value.
   */
  static hexToRed (hex) {
    return parseInt(hex.slice(0, 2), 16)
  }

  /**
   * Parses a valid hex color string and returns the Green RGB integer value.
   *
   * @author Bryan Johnson [original], Todd Dukart [conversion]
   *
   * @param {string} hex Hex color string.
   * @returns {number} Green integer value.
   */
  static hexToGreen (hex) {
    return parseInt(hex.slice(2, 4), 16)
  }

  /**
   * Parses a valid hex color string and returns the Blue RGB integer value.
   *
   * @author Bryan Johnson [original], Todd Dukart [conversion]
   *
   * @param {string} hex Hex color string.
   * @returns {number} Blue integer value.
   */
  static hexToBlue (hex) {
    return parseInt(hex.slice(4, 6), 16)
  }

  /**
   * Converts a valid hex color string to an RGB array.
   *
   * @author Bryan Johnson [original], Todd Dukart [conversion]
   *
   * @param {string} hex Hex color String (e.g. FF00FF)
   * @returns {Array} Array containing R, G, B values
   */
  static hexToRGB (hex) {
    hex = hex.replace(/[^\da-f]/g, '')
    return [
      ColorUtil.hexToRed(hex),
      ColorUtil.hexToGreen(hex),
      ColorUtil.hexToBlue(hex)
    ]
  }

  /**
   * Converts an RGB component to a hex string.
   *
   * @author Bryan Johnson [original], Todd Dukart [conversion]
   *
   * @param {number} component RGB value, integer between 0 and 255.
   * @returns {string} Hex value string (e.g. FF)
   */
  static componentToHex (component) {
    const hex = component.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  /**
   * Converts RGB color components to a valid hex color string.
   *
   * @author Bryan Johnson [original], Todd Dukart [conversion]
   *
   * @param {number} red RGB red value, integer between 0 and 255.
   * @param {number} green RGB green value, integer between 0 and 255.
   * @param {number} blue RGB blue value, integer between 0 and 255.
   * @returns {string} Hex color string (e.g. FF0000)
   */
  static rgbToHex (red, green, blue) {
    const redHex = ColorUtil.componentToHex(red)
    const greenHex = ColorUtil.componentToHex(green)
    const blueHex = ColorUtil.componentToHex(blue)
    return `${redHex}${greenHex}${blueHex}`
  }

  /**
   * Converts HSB to RGB. Borrowed from https://www.cs.rit.edu/~ncs/color/t_convert.html
   *
   * @param {number} hue        Hue, integer between 0 and 65535.
   * @param {number} saturation Saturation, integer between 0 and 254.
   * @param {number} brightness Brightness, integer between 0 and 254.
   * @returns {number[]} Array of [red, green, blue]
   */
  static hsbToRgb (hue, saturation, brightness) {
    let red
    let green
    let blue

    hue = fitIntoRange(hue, 65535)

    if (saturation === 0) {
      red = green = blue = brightness
    } else {
      const huePartial = hue / (65535 / 6) // There are six "sectors" in the hue, corresponding to the six primary colors.
      const sector = Math.floor(huePartial)
      const fractionalHue = huePartial - sector
      const p = (brightness / 254) * (254 - saturation)
      const q = (brightness / 254) * (254 - saturation * fractionalHue)
      const t = (brightness / 254) * (254 - saturation * (1 - fractionalHue))

      switch (sector) {
        case 0:
          red = brightness
          green = t
          blue = p
          break
        case 1:
          red = q
          green = brightness
          blue = p
          break
        case 2:
          red = p
          green = brightness
          blue = t
          break
        case 3:
          red = p
          green = q
          blue = brightness
          break
        case 4:
          red = t
          green = p
          blue = brightness
          break
        case 5:
          red = brightness
          green = p
          blue = q
          break
      }
    }

    return [Math.round(red), Math.round(green), Math.round(blue)]
  }

  /**
   * Converts RGB to HSB. Adapted from https://www.cs.rit.edu/~ncs/color/t_convert.html
   *
   * @param {number} red   The red value, from 0 to 255.
   * @param {number} green The green value, from 0 to 255.
   * @param {number} blue  The blue value, from 0 to 255.
   * @returns {number[]} Array of [hue, saturation, brightness]. For shades of gray, hue will be undefined.
   */
  static rgbToHsb (red, green, blue) {
    let hue
    let saturation
    let brightness

    const min = Math.min(red, green, blue)
    const max = Math.max(red, green, blue)
    brightness = max
    const delta = max - min

    if (max <= 0) {
      // It's black.
      hue = undefined // Technically, black has no hue.
      saturation = brightness = 0
    } else if (min >= 254) {
      // It's white.
      hue = undefined // Technically, white has no hue.
      saturation = 0
      brightness = 254
    } else {
      saturation = delta / max * 254
      if (saturation === 0) {
        hue = undefined // Pure gray, so there's no hue.
      } else {
        if (red === max) {
          hue = (green - blue) / delta
        } else if (green === max) {
          hue = 2 + (blue - red) / delta
        } else {
          hue = 4 + (red - green) / delta
        }

        hue = hue * (65535 / 6) // convert to Hue's 0-65535 range
        hue = fitIntoRange(hue, 65535)
        hue = Math.round(hue)
      }
    }

    saturation = Math.min(Math.round(saturation), 254)
    brightness = Math.min(Math.round(brightness), 254)

    return [hue, saturation, brightness]
  }

  /**
   * Returns a rgb array for given x, y values. Not actually an inverse of
   * getXYPointFromRGB. Implementation of the instructions found on the
   * Philips Hue iOS SDK docs: http://goo.gl/kWKXKl
   *
   * @author Q42 [original C#] Bryan Johnson [original JavaScript], Todd Dukart [conversion]
   *
   * @param {number} x X value
   * @param {number} y Y Value
   * @param {number} brightness Brightness
   * @returns {number[]} RGB Values
   */
  static getRGBFromXYAndBrightness (x, y, brightness) {
    let xyPoint = new XYPoint(x, y)

    if (brightness === undefined) {
      brightness = 254
    }

    // Check if the xy value is within the color gamut of the lamp.
    // If not continue with step 2, otherwise step 3.
    // We do this to calculate the most accurate color the given light can actually do.
    if (!ColorUtil.isInLampsReach(xyPoint)) {
      // Calculate the closest point on the color gamut triangle
      // and use that as xy value See step 6 of color to xy.
      xyPoint = ColorUtil.getClosestReproduciblePoint(xyPoint)
    }

    // Calculate XYZ values Convert using the following formulas:
    const Y = brightness / 254
    const X = (Y / xyPoint.y) * xyPoint.x
    const Z = (Y / xyPoint.y) * (1 - xyPoint.x - xyPoint.y)

    // Convert to RGB using Wide RGB D65 conversion.
    let rgb = [
      X * 1.612 - Y * 0.203 - Z * 0.302,
      -X * 0.509 + Y * 1.412 + Z * 0.066,
      X * 0.026 - Y * 0.072 + Z * 0.962
    ]

    // Apply reverse gamma correction.
    rgb = rgb.map(function (x) {
      return (x <= 0.0031308) ? (12.92 * x) : ((1 + 0.055) * x ** (1 / 2.4) - 0.055)
    })

    // Bring all negative components to zero.
    rgb = rgb.map(function (x) {
      return Math.max(0, x)
    })

    // If one component is greater than 1, weight components by that value.
    const max = Math.max(rgb[0], rgb[1], rgb[2])
    if (max > 1) {
      rgb = rgb.map(function (x) {
        return x / max
      })
    }

    rgb = rgb.map(function (x) {
      return Math.floor(x * 255)
    })

    return rgb
  }

  /**
   * Convert a mired color temperature to RGB. Adapted from http://www.tannerhelland.com/4435/convert-temperature-rgb-algorithm-code/.
   *
   * @param {number} miredColorTemperature Mired temperature
   * @param {number} brightness Brightness
   * @returns {number[]} RGB Values
   */
  static miredToRgb (miredColorTemperature, brightness) {
    const kelvin = 1000000 / miredColorTemperature
    let red
    let green
    let blue

    // Calculate each color separately. Red:
    if (kelvin < 6600) {
      red = 255
    } else {
      red = (kelvin / 100) - 60
      red = 329.698727446 * red ^ (-0.1332047592)
    }

    // Green:
    if (kelvin < 6600) {
      green = kelvin / 100
      green = 99.4708025861 * Math.log(green) - 161.1195681661
    } else {
      green = (kelvin / 100) - 60
      green = 288.1221695283 * green ^ (-0.0755148492)
    }

    // Blue:
    if (kelvin >= 6600) {
      blue = 255
    } else {
      blue = kelvin - 10
      blue = 138.5177312231 * Math.log(blue) - 305.0447927307
    }

    let result = [red, green, blue]
    result = result.map((value) => {
      value = Math.min(255, value)
      value = Math.max(0, value)
      value = value * (brightness / 254)
      return Math.round(value)
    })

    return result
  }

  /**
   * Returns an XYPoint object containing the closest available CIE 1931
   * coordinates based on the RGB input values.
   *
   * @author Q42 [original C#] Bryan Johnson [original JavaScript], Todd Dukart [conversion]
   *
   * @param {number} red RGB red value, integer between 0 and 255.
   * @param {number} green RGB green value, integer between 0 and 255.
   * @param {number} blue RGB blue value, integer between 0 and 255.
   * @returns {XYPoint} CIE 1931 XY coordinates, corrected for reproducibility.
   */
  static getXYPointFromRGB (red, green, blue) {
    const r = (red > 0.04045) ? ((red + 0.055) / (1 + 0.055)) ** 2.4 : (red / 12.92)
    const g = (green > 0.04045) ? ((green + 0.055) / (1 + 0.055)) ** 2.4 : (green / 12.92)
    const b = (blue > 0.04045) ? ((blue + 0.055) / (1 + 0.055)) ** 2.4 : (blue / 12.92)
    const X = r * 0.4360747 + g * 0.3850649 + b * 0.0930804
    const Y = r * 0.2225045 + g * 0.7168786 + b * 0.0406169
    const Z = r * 0.0139322 + g * 0.0971045 + b * 0.7141733
    let cx = X / (X + Y + Z)
    let cy = Y / (X + Y + Z)

    cx = isNaN(cx) ? 0 : cx
    cy = isNaN(cy) ? 0 : cy

    // Check if the given XY value is within the colourreach of our lamps.
    const xyPoint = new XYPoint(cx, cy)
    const inReachOfLamps = ColorUtil.isInLampsReach(xyPoint)

    if (!inReachOfLamps) {
      const closestPoint = ColorUtil.getClosestReproduciblePoint(xyPoint)
      cx = closestPoint.x
      cy = closestPoint.y
    }

    return new XYPoint(cx, cy)
  }

  /**
   * Get the approximate luminance from RGB
   *
   * @author Todd Dukart
   *
   * @param {number} red Red value
   * @param {number} green Green value
   * @param {number} blue Blue value
   * @returns {number} Brightness value
   */
  static getBrightnessFromRgb (red, green, blue) {
    let brightness = parseInt(0.2126 * red + 0.7152 * green + 0.0722 * blue)
    brightness = Math.min(254, brightness)
    brightness = Math.max(1, brightness)
    return brightness
  }
}

module.exports = { ColorUtil, Red, Lime, Blue }
