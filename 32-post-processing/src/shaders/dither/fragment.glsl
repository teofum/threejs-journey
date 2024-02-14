precision mediump float;

uniform sampler2D tDiffuse;
uniform sampler2D uThresholdMap;
uniform vec2 uMapSize;
uniform vec2 uResolution;
uniform sampler2D uLookup;

varying vec2 vUv;

void main() {
  vec2 thresholdCoords = fract(vUv * uResolution / uMapSize);
  vec2 texCoords = floor(vUv * uResolution) / uResolution;
  vec3 color = floor(texture2D(tDiffuse, texCoords).rgb * 63.99);

  float colorIndex = color.r + color.g * 64.0 + color.b * 4096.0;
  float colorU = fract(colorIndex / 512.0);
  float colorV = floor(colorIndex / 512.0) / 512.0;

  vec2 lookupUv = vec2(
    colorU,
    colorV
  );

  lookupUv += thresholdCoords / 512.0;
  lookupUv = vec2(lookupUv.x, 1.0 - lookupUv.y);

  gl_FragColor = texture2D(uLookup, lookupUv);
  // gl_FragColor = vec4(colorU, colorV, 0.0, 1.0);
}