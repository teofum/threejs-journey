uniform float uTime;
uniform float uBigWavesAmplitude;
uniform float uBigWavesSpeed;
uniform vec2 uBigWavesFrequency;
uniform float uSmallWavesAmplitude;
uniform float uSmallWavesSpeed;
uniform vec2 uSmallWavesFrequency;
uniform float uColorOffset;
uniform float uColorMultiplier;

varying float vElevation;

void main() {
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);

  vElevation = (modelPosition.y + uColorOffset) * uColorMultiplier;

  gl_Position = projectionMatrix * viewMatrix * modelPosition;
}