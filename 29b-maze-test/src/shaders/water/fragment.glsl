uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float fogNear;
uniform float fogFar;
uniform vec3 fogColor;

varying float vElevation;

void main() {
  vec3 wavesColor = mix(uDepthColor, uSurfaceColor, vElevation);

  // Fog
  #ifdef USE_LOGDEPTHBUF_EXT
    float depth = gl_FragDepthEXT / gl_FragCoord.w;
  #else
    float depth = gl_FragCoord.z / gl_FragCoord.w;
  #endif
  float fogFactor = smoothstep(fogNear, fogFar, depth);

  gl_FragColor = vec4(mix(wavesColor, fogColor, fogFactor), 1.0);
}