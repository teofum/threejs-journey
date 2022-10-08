varying vec3 vColor;

void main() {
  float value = pow(1.0 - distance(gl_PointCoord, vec2(0.5)), 10.0);
  gl_FragColor = vec4(vColor, value);
}