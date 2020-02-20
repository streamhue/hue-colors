const { ColorUtil } = require('./classes/color-util')

const COLOR_RGB = 'rgb'
const COLOR_CIE = 'cie'
const COLOR_CT = 'ct'
const COLOR_HSB = 'hsb'
/**
 * HueColor
 *
 */
class HueColor {
  /**
   * Constructs a new Color. Should usually be called by one of the static from___ methods.
   */
  constructor () {
    this.red = null
    this.green = null
    this.blue = null
    this.x = null
    this.y = null
    this.brightness = null
    this.hue = null
    this.saturation = null
    this.temperature = null
    this.originalColor = null
  }

  /**
   * Constructs a new Color given red, green, and blue.
   *
   * @static
   * @memberof HueColor
   * @param {number} red   The red value, from 0 to 255.
   * @param {number} green The green value, from 0 to 255.
   * @param {number} blue  The blue value, from 0 to 255.
   * @returns {HueColor} HueColor instance
   */
  static fromRgb (red, green, blue) {
    const color = new this()
    color.red = red
    color.green = green
    color.blue = blue
    color.originalColor = COLOR_RGB
    return color
  }

  /**
   * Constructs a new Color given a CIE point and brightness.
   *
   * @static
   * @memberof HueColor
   * @param {number} x          X coordinate.
   * @param {number} y          Y coordinate.
   * @param {number} brightness Brightness, from 0 to 254.
   * @returns {HueColor} HueColor instance
   */
  static fromCIE (x, y, brightness) {
    const color = new this()
    color.x = x
    color.y = y
    color.brightness = brightness
    color.originalColor = COLOR_CIE
    return color
  }

  /**
   * Create from Color Temperature
   *
   * @static
   * @param {number} colorTemperature Color temperature
   * @param {number} brightness Brightness
   * @returns {HueColor} HueColor instance
   * @memberof HueColor
   */
  static fromCt (colorTemperature, brightness) {
    const color = new this()
    color.temperature = colorTemperature
    color.brightness = brightness
    color.originalColor = COLOR_CT
    return color
  }

  /**
   * Constructs a new Color given a CSS-style hex code.
   *
   * @static
   * @memberof HueColor
   * @param {string} hex The hex code.
   * @returns {HueColor} HueColor instance
   */
  static fromHex (hex) {
    const rgb = ColorUtil.hexToRGB(hex)
    return HueColor.fromRgb(rgb[0], rgb[1], rgb[2])
  }

  /**
   * Constructs a new Color given HSB values.
   *
   * @static
   * @memberof HueColor
   * @param {number} hue        Integer, 0 to 65535
   * @param {number} saturation Integer, 0 to 254
   * @param {number} brightness Integer, 0 to 254
   * @returns {HueColor} HueColor instance
   */
  static fromHsb (hue, saturation, brightness) {
    const color = new this()
    color.hue = hue
    color.saturation = saturation
    color.brightness = brightness
    color.originalColor = COLOR_HSB
    return color
  }

  /**
   * Converts the color to RGB. Note that the CIE-to-RGB conversion is necessarily approximate.
   *
   * @memberof HueColor
   * @returns {number[]} Red, green, and blue components.
   */
  toRgb () {
    let rgb = [null, null, null]
    if (this.red === null || this.green === null || this.blue === null) {
      switch (this.originalColor) {
        case COLOR_CIE:
          rgb = ColorUtil.getRGBFromXYAndBrightness(this.x, this.y, this.brightness)
          break
        case COLOR_HSB:
          rgb = ColorUtil.hsbToRgb(this.hue, this.saturation, this.brightness)
          break
        case COLOR_CT:
          rgb = ColorUtil.miredToRgb(this.temperature, this.brightness)
          break
        default:
          throw new Error('Unable to process color, original is ' + this.originalColor)
      }
    }

    if (rgb[0] !== null) {
      this.red = rgb[0]
      this.green = rgb[1]
      this.blue = rgb[2]
    }

    return [this.red, this.green, this.blue]
  }

  /**
   * Converts the color to a CSS-style hex string. Note that the CIE-to-RGB conversion is necessarily approximate.
   *
   * @memberof HueColor
   * @returns {string} Hex color
   */
  toHex () {
    const rgb = this.toRgb()
    return ColorUtil.rgbToHex(rgb[0], rgb[1], rgb[2])
  }

  /**
   * Converts the color to a CIE color that Hue lamps are capable of showing. Note that the RGB-to-CIE conversion is
   * necessarily approximate.
   *
   * @memberof HueColor
   * @returns {number[]} X, Y, and brightness components.
   */
  toCie () {
    let cie = { x: null, y: null }
    let rgb
    if (this.x === null || this.y === null || this.brightness === null) {
      switch (this.originalColor) {
        case COLOR_RGB:
          cie = ColorUtil.getXYPointFromRGB(this.red, this.green, this.blue)
          this.brightness = ColorUtil.getBrightnessFromRgb(this.red, this.green, this.blue)
          break
        case COLOR_HSB:
          rgb = ColorUtil.hsbToRgb(this.hue, this.saturation, this.brightness)
          cie = ColorUtil.getXYPointFromRGB(rgb[0], rgb[1], rgb[2])
          // We already know the brightness :-)
          break
        case COLOR_CT:
          rgb = ColorUtil.miredToRgb(this.temperature, this.brightness)
          cie = ColorUtil.getXYPointFromRGB(rgb[0], rgb[1], rgb[2])
          break
        default:
          throw new Error('Unable to process color, original is ' + this.originalColor)
      }
    }

    if (cie.x !== null) {
      this.x = cie.x
      this.y = cie.y
    }

    return [this.x, this.y, this.brightness]
  }

  /**
   * Converts the color to HSB.
   *
   * @memberof HueColor
   * @returns {number[]} HSB values
   */
  toHsb () {
    let hsb = [null, null, null]
    if (this.hue === null || this.saturation === null) {
      const rgb = this.toRgb()
      hsb = ColorUtil.rgbToHsb(rgb[0], rgb[1], rgb[2])
    }

    // Hue can be null-ish, so check saturation instead.
    if (hsb[1] !== null) {
      this.hue = hsb[0]
      this.saturation = hsb[1]
      this.brightness = hsb[2]
    }
    return [this.hue, this.saturation, this.brightness]
  }

  /**
   * Convert to color temperature
   *
   * @returns {number} Color temperature
   * @memberof HueColor
   */
  toCt () {
    if (COLOR_CT !== this.originalColor) {
      return undefined
    } else {
      return this.temperature
    }
  }
}

module.exports = { HueColor }
