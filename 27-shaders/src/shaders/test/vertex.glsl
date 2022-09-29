uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

uniform vec2 uFrequency;
uniform float uTime;

attribute vec3 position;
attribute vec2 uv;

varying vec2 vTexCoords;
varying float vElevation;

void main() {
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  modelPosition.z =
    sin(modelPosition.x * uFrequency.x + uTime) * 0.05
    + sin(modelPosition.y * uFrequency.y + uTime) * 0.05;

  vElevation = modelPosition.z;
  vTexCoords = uv;
  gl_Position = projectionMatrix * viewMatrix * modelPosition;
}