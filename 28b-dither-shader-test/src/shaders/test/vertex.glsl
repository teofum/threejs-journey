varying vec2 vUv;

void main() {
  vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
  vUv = (viewPosition.xy + 1.0) * 0.5;

  gl_Position = projectionMatrix * viewPosition;
}