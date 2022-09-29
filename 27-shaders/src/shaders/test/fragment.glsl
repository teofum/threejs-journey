precision mediump float;

uniform sampler2D uTexture;

varying vec2 vTexCoords;
varying float vElevation;

void main() {
  vec4 color = texture2D(uTexture, vTexCoords);
  gl_FragColor = vec4(color.rgb * (0.7 + vElevation), color.a);
}