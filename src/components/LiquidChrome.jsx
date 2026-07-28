import { useEffect, useRef } from 'react';

/**
 * LiquidChrome - WebGL-based liquid metal chrome background effect
 * Creates a flowing, reflective metallic surface with animated distortion
 */
export default function LiquidChrome({ 
  className = '',
  intensity = 0.5,
  speed = 0.3,
  color1 = '#7C3AED', // violet
  color2 = '#06B6D4', // cyan
  color3 = '#D946EF', // fuchsia
}) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      console.warn('WebGL not supported, falling back to CSS gradient');
      return;
    }

    // Vertex shader
    const vertexShaderSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // Fragment shader - Liquid Chrome effect
    const fragmentShaderSource = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec2 u_mouse;
      uniform float u_intensity;
      uniform float u_speed;
      uniform vec3 u_color1;
      uniform vec3 u_color2;
      uniform vec3 u_color3;

      #define PI 3.14159265359

      // Simplex noise functions
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                           -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
          + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
          dot(x12.zw,x12.zw)), 0.0);
        m = m*m;
        m = m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        for (int i = 0; i < 6; i++) {
          value += amplitude * snoise(p * frequency);
          amplitude *= 0.5;
          frequency *= 2.0;
        }
        return value;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        vec2 uv2 = uv * 2.0 - 1.0;
        uv2.x *= u_resolution.x / u_resolution.y;

        float time = u_time * u_speed;
        
        // Create liquid distortion
        vec2 distortion = vec2(
          fbm(uv * 3.0 + time * 0.1),
          fbm(uv * 3.0 + vec2(100.0) + time * 0.1)
        );
        
        // Mouse interaction
        vec2 mouseInfluence = (u_mouse - uv) * 0.5;
        float mouseDist = length(mouseInfluence);
        float mouseEffect = smoothstep(0.5, 0.0, mouseDist) * 0.3;
        
        // Liquid chrome effect
        float liquid = fbm(uv * 2.0 + distortion * u_intensity + time * 0.05);
        liquid += fbm(uv * 4.0 - distortion * 0.5 - time * 0.03) * 0.5;
        liquid += mouseEffect;
        
        // Metallic reflection simulation
        float reflection = sin(liquid * PI * 2.0 + time) * 0.5 + 0.5;
        reflection = pow(reflection, 2.0);
        
        // Color mixing
        float colorMix = smoothstep(-0.3, 0.3, liquid);
        float colorMix2 = smoothstep(0.0, 0.6, reflection);
        
        vec3 color = mix(u_color1, u_color2, colorMix);
        color = mix(color, u_color3, colorMix2 * 0.5);
        
        // Add metallic highlights
        float highlight = pow(reflection, 4.0) * 0.4;
        color += vec3(highlight);
        
        // Vignette
        float vignette = 1.0 - length((uv - 0.5) * 1.2);
        vignette = smoothstep(0.0, 0.7, vignette);
        
        // Output with slight transparency for layering
        gl_FragColor = vec4(color * vignette, 1.0);
      }
    `;

    // Compile shaders
    function compileShader(source, type) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);

    if (!vertexShader || !fragmentShader) return;

    // Create program
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Set up geometry (full screen quad)
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Get uniform locations
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const mouseLocation = gl.getUniformLocation(program, 'u_mouse');
    const intensityLocation = gl.getUniformLocation(program, 'u_intensity');
    const speedLocation = gl.getUniformLocation(program, 'u_speed');
    const color1Location = gl.getUniformLocation(program, 'u_color1');
    const color2Location = gl.getUniformLocation(program, 'u_color2');
    const color3Location = gl.getUniformLocation(program, 'u_color3');

    // Helper to convert hex to rgb
    function hexToRgb(hex) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? [
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255
      ] : [0, 0, 0];
    }

    // Resize handler
    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    // Mouse handler
    function handleMouseMove(e) {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: 1.0 - (e.clientY - rect.top) / rect.height
      };
    }

    resize();
    window.addEventListener('resize', resize);
    canvas.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    let startTime = performance.now();
    function render() {
      const time = (performance.now() - startTime) / 1000;

      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(timeLocation, time);
      gl.uniform2f(mouseLocation, mouseRef.current.x, mouseRef.current.y);
      gl.uniform1f(intensityLocation, intensity);
      gl.uniform1f(speedLocation, speed);
      gl.uniform3fv(color1Location, hexToRgb(color1));
      gl.uniform3fv(color2Location, hexToRgb(color2));
      gl.uniform3fv(color3Location, hexToRgb(color3));

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationRef.current = requestAnimationFrame(render);
    }

    render();

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, [intensity, speed, color1, color2, color3]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ 
        background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #312E81 100%)'
      }}
    />
  );
}
