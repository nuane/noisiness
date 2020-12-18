exports.generatePerlinNoise = generatePerlinNoise;
exports.generateWhiteNoise = generateWhiteNoise;
exports.alea = alea;

function generatePerlinNoise(width, height, options) {
  options = options || {};
  var octaveCount = options.octaveCount || 4;
  var amplitude = options.amplitude || 0.1;
  var persistence = options.persistence || 0.2;
  var seed = options.seed || Math.random();
  var whiteNoise = generateWhiteNoise(width, height, seed);
  var smoothNoiseList = new Array(octaveCount);
  for (i = 0; i < octaveCount; ++i) {
    smoothNoiseList[i] = generateSmoothNoise(i);
  }
  var perlinNoise = new Array(width * height);
  var totalAmplitude = 0;
  // blend noise together
  for (i = octaveCount - 1; i >= 0; --i) {
    amplitude *= persistence;
    totalAmplitude += amplitude;

    for (var j = 0; j < perlinNoise.length; ++j) {
      perlinNoise[j] = perlinNoise[j] || 0;
      perlinNoise[j] += smoothNoiseList[i][j] * amplitude;
    }
  }
  // normalization
  for (i = 0; i < perlinNoise.length; ++i) {
      perlinNoise[i] /= totalAmplitude;
  }

  return perlinNoise;

  function generateSmoothNoise(octave) {
    var noise = new Array(width * height);
    var samplePeriod = Math.pow(2, octave);
    var sampleFrequency = 1 / samplePeriod;
    var noiseIndex = 0;
    for (var y = 0; y < height; ++y) {
      var sampleY0 = Math.floor(y / samplePeriod) * samplePeriod;
      var sampleY1 = (sampleY0 + samplePeriod) % height;
      var vertBlend = (y - sampleY0) * sampleFrequency;
      for (var x = 0; x < width; ++x) {
        var sampleX0 = Math.floor(x / samplePeriod) * samplePeriod;
        var sampleX1 = (sampleX0 + samplePeriod) % width;
        var horizBlend = (x - sampleX0) * sampleFrequency;

        // blend top two corners
        var top = interpolate(whiteNoise[sampleY0 * width + sampleX0], whiteNoise[sampleY1 * width + sampleX0], vertBlend);
        // blend bottom two corners
        var bottom = interpolate(whiteNoise[sampleY0 * width + sampleX1], whiteNoise[sampleY1 * width + sampleX1], vertBlend);
        // final blend
        noise[noiseIndex] = interpolate(top, bottom, horizBlend);
        noiseIndex += 1;
      }
    }
    return noise;
  }
}
function generateWhiteNoise(width, height, seed) {
  var noise = new Array(width * height);
  var prng = alea(seed);
  var nextSeed = prng();
  for (var i = 0; i < noise.length; ++i) {
    noise[i] = prng(nextSeed);
  }
  return noise;
}
function interpolate(x0, x1, alpha) {
  return x0 * (1 - alpha) + alpha * x1;
}

function alea(seed){
  if(seed === undefined) {seed = +new Date() + Math.random();}
  function Mash() {
    var n = 4022871197;
    return function(r) {
      for(var t, s, u = 0, e = 0.02519603282416938; u < r.length; u++)
      s = r.charCodeAt(u), f = (e * (n += s) - (n*e|0)),
      n = 4294967296 * ((t = f * (e*n|0)) - (t|0)) + (t|0);
      return (n|0) * 2.3283064365386963e-10;
    }
  }
  return function() {
    var m = Mash(), a = m(" "), b = m(" "), c = m(" "), x = 1, y;
    seed = seed.toString(), a -= m(seed), b -= m(seed), c -= m(seed);
    a < 0 && a++, b < 0 && b++, c < 0 && c++;
    return function() {
      var y = x * 2.3283064365386963e-10 + a * 2091639; a = b, b = c;
      return c = y - (x = y|0);
    };
  }();
}
