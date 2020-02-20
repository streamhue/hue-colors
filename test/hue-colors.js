const test = require('ava')
const { HueColor } = require('../src')

/* Color creation */
test('can create a color from an RGB spec', t => {
  var color = HueColor.fromRgb(128, 128, 128)
  var rgb = color.toRgb()
  var cie = color.toCie()

  t.is(color.red, 128)
})

test('can create a color from a CIE spec', t => {
  var color = HueColor.fromCIE(0.2, 0.3, 0.4)
  var rgb = color.toRgb()
  var cie = color.toCie()

  t.is(color.x, 0.2)
})

test('can create a color from a hex code', t => {
  var color = HueColor.fromHex('#dedbef')
  var rgb = color.toRgb()
  var cie = color.toCie()

  t.is(color.red, 222)
})

/* Color conversion */

test('properly converts RGB to Hex', t => {
  var color = HueColor.fromRgb(16, 64, 255)
  var hex = color.toHex()

  t.is(hex, '1040ff')
})

test('properly converts HSB to Hex', t => {
  var orange = HueColor.fromHsb(4000, 254, 254)
  var hex = orange.toHex()

  t.is(hex, 'fe5d00')
})

test('properly converts Hex to RGB', t => {
  var color = HueColor.fromHex('ff00ff')
  var rgb = color.toRgb()

  t.deepEqual(rgb, [255, 0, 255])
})

test('properly converts RGB to HSB', t => {
  var orange = HueColor.fromRgb(254, 93, 0)
  var orangeHsb = orange.toHsb()
  t.assert(orangeHsb[0] >= 3995)
  t.assert(orangeHsb[0] <= 4005)
  t.is(orangeHsb[1], 254)
  t.is(orangeHsb[2], 254)

  var blue = HueColor.fromRgb(0, 0, 255)
  var blueHsb = blue.toHsb()
  t.assert(blueHsb[0] >= 43685)
  t.assert(blueHsb[0] <= 43695)
  t.is(blueHsb[1], 254)
  t.is(blueHsb[2], 254)

  var black = HueColor.fromRgb(0, 0, 0)
  var blackHsb = black.toHsb()
  t.deepEqual(blackHsb, [undefined, 0, 0])

  var gray = HueColor.fromRgb(160, 160, 160)
  var grayHsb = gray.toHsb()
  t.deepEqual(grayHsb, [undefined, 0, 160])
})

test('properly converts HSB to RGB', t => {
  var orange = HueColor.fromHsb(4000, 254, 254)
  var orangeRgb = orange.toRgb()
  t.deepEqual(orangeRgb, [254, 93, 0])

  var blue = HueColor.fromHsb(43690, 254, 254)
  var blueRgb = blue.toRgb()
  t.deepEqual(blueRgb, [0, 0, 254])

  var green = HueColor.fromHsb(21845, 254, 254)
  var greenRgb = green.toRgb()
  t.deepEqual(greenRgb, [0, 254, 0])
})

test('properly converts color temperature to RGB', t => {
  var cool = HueColor.fromCt(153, 254)
  var coolRgb = cool.toRgb()
  t.deepEqual(coolRgb, [255, 255, 255])

  var warm = HueColor.fromCt(500, 254)
  var warmRgb = warm.toRgb()
  t.deepEqual(warmRgb, [255, 137, 255])
})

test('refuses to convert RGB to color temperature', t => {
  var rgbLight = HueColor.fromRgb(0, 255, 255)
  var rgbCt = rgbLight.toCt()
  t.is(rgbCt, undefined)
})

test('allows lights defined with color temperature to return their color temperature', t => {
  var ctLight = HueColor.fromCt(200, 254)
  var ctLightCt = ctLight.toCt()
  t.is(ctLightCt, 200)
})
