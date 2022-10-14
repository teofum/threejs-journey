uniform sampler2D tDiffuse;

varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  uv.y += sin(uv.x * 10.0) * 0.05;
  vec4 color = texture2D(tDiffuse, uv);
  gl_FragColor = color;
}