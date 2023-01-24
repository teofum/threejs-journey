attribute float aPhaseOffset;
attribute float aScale;

uniform float uPixelRatio;
uniform float uTime;

varying float vBrightness;

// From three.js <common>
bool isPerspectiveMatrix(mat4 m) {
	return m[2][3] == -1.0;
}

void main() {
  vec3 newPosition = vec3(position);

  newPosition.y += sin(uTime + aPhaseOffset) * 0.15 * aScale;

  vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;

  gl_Position = projectionMatrix * viewPosition;
  gl_PointSize = 120.0 * aScale * uPixelRatio;

  bool isPerspective = isPerspectiveMatrix(projectionMatrix);
  if (isPerspective) gl_PointSize *= (1.0 / -viewPosition.z);

  vBrightness = sin(uTime * 3.6 + aPhaseOffset * 2.7) * 0.3 + 0.7;
}