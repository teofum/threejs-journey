#define CLIST_SIZE 64
#define PALETTE_SIZE 16

precision mediump float;

uniform sampler2D uTexture;
uniform sampler2D uThresholdMap;
uniform vec2 uMapSize;
uniform vec2 uResolution;
uniform sampler2D uPalette;
uniform sampler2D uLookup;
uniform float uErrorCoeff;

varying vec2 vUv;

vec3 palette(int i) {
  return texture2D(
    uPalette,
    vec2((float(i) + 0.5) / float(PALETTE_SIZE), 0.5)
  ).rgb;
}

//*
void main() {
  vec2 thresholdCoords = fract(vUv * uResolution / uMapSize);
  vec2 texCoords = floor(vUv * uResolution) / uResolution;
  vec3 color = texture2D(uTexture, texCoords).rgb;
  float threshold = texture2D(uThresholdMap, thresholdCoords).r;

  // vec3 clist[CLIST_SIZE];
  int weights[PALETTE_SIZE];
  vec3 paletteCache[PALETTE_SIZE];
  for (int i = 0; i < PALETTE_SIZE; i++) {
    weights[i] = 0;
    paletteCache[i] = palette(i);
  }
  
  vec3 error = vec3(0.0);
  vec3 target = vec3(0.0);
  vec3 test = vec3(0.0);
  vec3 candidate = vec3(0.0);
  int iCandidate = 0;
  for (int i = 0; i < CLIST_SIZE; i++) {
    target = color + (error * uErrorCoeff);

    // Find the closest color from palette
    float dMin = 999999999.0; // Absurdly large number
    for (int j = 0; j < PALETTE_SIZE; j++) {
      test = paletteCache[j];
      // test = gamma(test);
      float d = distance(target, test);
      if (d < dMin) {
        dMin = d;
        candidate = test;
        iCandidate = j;
      }
    }

    // And add it to the candidate list
    // clist[i] = candidate;
    weights[iCandidate]++;

    // By adding the candidate's error to the next iteration,
    // the next candidate will compensate for that error thus
    // getting closer to the original color.
    error += color - candidate;
  }

  int thr = int(threshold * float(CLIST_SIZE));
  for (int i = 0; i < PALETTE_SIZE; i++) {
    while (weights[i] > 0) {
      if (thr == 0) {
        color = palette(i);
        thr--;
        break;
      } else {
        weights[i]--;
        thr--;
      }
    }
    if (thr == -1) break;
  }

  gl_FragColor = vec4(color, 1.0);
}
//*/
/*
void main() {
  vec2 texCoords = floor(vUv * uResolution) / uResolution;
  vec3 color = texture2D(uTexture, texCoords).rgb * 255.0;

  float index = color.r * 65536.0 + color.g * 256.0 + color.b;
  vec2 lookupUv = vec2(
    mod(index, 4096.0),
    floor(index / 4096.0)
  ) / 4096.0;

  color = palette(int(texture2D(uLookup, lookupUv).r * float(PALETTE_SIZE)));

  gl_FragColor = vec4(color, 1.0);
}
//*/