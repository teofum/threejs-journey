varying float vBrightness;

void main() {
  float distanceToCenter = distance(gl_PointCoord, vec2(0.5));

  float alpha = 0.1 / distanceToCenter - 0.2;
  vec3 color = vec3(1.0, 0.9, 0.7) * alpha * vBrightness;

  gl_FragColor = vec4(color, 1.0);
}