attribute float aScale;
attribute vec3 aRandom;

uniform float uSize;
uniform float uPixelRatio;
uniform float uTime;

varying vec3 vColor;

// From three.js <common>
bool isPerspectiveMatrix(mat4 m) {
	return m[2][3] == -1.0;
}

void main() {
  float distance = distance(position.xz, vec2(0.0));
  float angle = atan(position.x, position.z);
  float angleOffset = (1.0 / distance) * uTime * 0.2;
  angle += angleOffset;

  vec3 newPosition = vec3(
    sin(angle) * distance,
    position.y,
    cos(angle) * distance
  ) + aRandom;

  vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);

  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = uSize * aScale * uPixelRatio;

  bool isPerspective = isPerspectiveMatrix(projectionMatrix);
  if (isPerspective) gl_PointSize *= (1.0 / -mvPosition.z);

  vColor = color;
}