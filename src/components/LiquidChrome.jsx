import { useEffect, useRef, useState } from 'react';

/**
 * LiquidChrome - Optimized WebGL-based liquid metal chrome background effect
 * Uses requestIdleCallback and reduced frame rate for better performance
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
  const frameCountRef = useRef(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Use Intersection Observer to pause animation when not visible
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(canvas);

    return () => {
      observer.disconnect();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible || isInitialized) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Defer WebGL initialization
    const initWebGL = () => {
      const gl = canvas.getContext('webgl', { 
        alpha: false,
        antialias: false,
        powerPreference: 'low-power'
      }) || canvas.getContext('experimental-webgl', {
        alpha: false,
        antialias: false
      });
      
      if (!gl) {
        console.warn('WebGL not supported, using CSS fallback');
        return;
      }

      // Simplified vertex shader
      const vertexShaderSource = `
        attribute vec2 a_position;
        void main() {
          gl_Position = vec4(a_position, 0.0, 1.0);
        }
      `;

      // Optimized fragment shader - reduced complexity
      const fragmentShaderSource = `
        precision mediump float;
        uniform vec2 u_resolution;
        uniform float u_time;
        uniform vec2 u_mouse;
        uniform float u_intensity;
        uniform float u_speed;
        uniform vec3 u_color1;
        uniform vec3 u_color2;
        uniform vec3 u_color3;

        #define PI 3.14159265359

        // Simplified noise function
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }

        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          
          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));
          
          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }

        float fbm(vec2 p) {
          float value = 0.0;
          float amplitude = 0.5;
          for (int i = 0; i < 4; i++) { // Reduced from 6 to 4 iterations
            value += amplitude * noise(p);
            p *= 2.0;
            amplitude *= 0.5;
          }
          return value;
        }

        void main() {
          vec2 uv = gl_FragCoord.xy / u_resolution.xy;
          
          float time = u_time * u_speed * 0.5; // Reduced time multiplier
          
          // Simplified distortion
          float distortion = fbm(uv * 2.0 + time * 0.1) * u_intensity;
          
          // Mouse interaction - simplified
          float mouseDist = length(u_mouse - uv);
          float mouseEffect = smoothstep(0.3, 0.0, mouseDist) * 0.2;
          
          // Simplified liquid effect
          float liquid = fbm(uv * 1.5 + distortion + time * 0.05);
          liquid += fbm(uv * 3.0 - distortion * 0.5) * 0.3;
          liquid += mouseEffect;
          
          // Simplified reflection
          float reflection = sin(liquid * PI * 2.0) * 0.5 + 0.5;
          reflection = pow(reflection, 1.5);
          
          // Color mixing
          float colorMix = smoothstep(-0.2, 0.4, liquid);
          vec3 color = mix(u_color1, u_color2, colorMix);
          color = mix(color, u_color3, reflection * 0.3);
          
          // Reduced highlight
          color += vec3(pow(reflection, 3.0) * 0.2);
          
          // Simplified vignette
          float vignette = 1.0 - length((uv - 0.5) * 1.1);
          vignette = smoothstep(0.0, 0.8, vignette);
          
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

      const program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(program));
        return;
      }

      gl.useProgram(program);

      // Set up geometry
      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1, 1, -1, -1, 1,
        -1, 1, 1, -1, 1, 1,
      ]), gl.STATIC_DRAW);

      const positionLocation = gl.getAttribLocation(program, 'a_position');
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
      const timeLocation = gl.getUniformLocation(program, 'u_time');
      const mouseLocation = gl.getUniformLocation(program, 'u_mouse');
      const intensityLocation = gl.getUniformLocation(program, 'u_intensity');
      const speedLocation = gl.getUniformLocation(program, 'u_speed');
      const color1Location = gl.getUniformLocation(program, 'u_color1');
      const color2Location = gl.getUniformLocation(program, 'u_color2');
      const color3Location = gl.getUniformLocation(program, 'u_color3');

      function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
          parseInt(result[1], 16) / 255,
          parseInt(result[2], 16) / 255,
          parseInt(result[3], 16) / 255
        ] : [0, 0, 0];
      }

      // Throttled resize handler
      let resizeTimeout;
      function resize() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          const dpr = Math.min(window.devicePixelRatio, 1.5); // Cap DPR at 1.5
          canvas.width = Math.floor(canvas.clientWidth * dpr);
          canvas.height = Math.floor(canvas.clientHeight * dpr);
          gl.viewport(0, 0, canvas.width, canvas.height);
        }, 100);
      }

      // Throttled mouse handler
      let mouseTimeout;
      function handleMouseMove(e) {
        clearTimeout(mouseTimeout);
        mouseTimeout = setTimeout(() => {
          const rect = canvas.getBoundingClientRect();
          mouseRef.current = {
            x: (e.clientX - rect.left) / rect.width,
            y: 1.0 - (e.clientY - rect.top) / rect.height
          };
        }, 50);
      }

      resize();
      window.addEventListener('resize', resize, { passive: true });
      canvas.addEventListener('mousemove', handleMouseMove, { passive: true });

      // Animation loop with frame skipping (30fps instead of 60fps)
      let startTime = performance.now();
      let lastFrameTime = 0;
      const targetFrameInterval = 1000 / 30; // 30fps

      function render(currentTime) {
        if (!isVisible) {
          animationRef.current = requestAnimationFrame(render);
          return;
        }

        // Skip frames to maintain target FPS
        if (currentTime - lastFrameTime < targetFrameInterval) {
          animationRef.current = requestAnimationFrame(render);
          return;
        }
        lastFrameTime = currentTime;

        const time = (currentTime - startTime) / 1000;

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

      animationRef.current = requestAnimationFrame(render);
      setIsInitialized(true);

      // Cleanup function
      return () => {
        cancelAnimationFrame(animationRef.current);
        clearTimeout(resizeTimeout);
        clearTimeout(mouseTimeout);
        window.removeEventListener('resize', resize);
        canvas.removeEventListener('mousemove', handleMouseMove);
        gl.deleteProgram(program);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
      };
    };

    // Defer WebGL initialization using requestIdleCallback or setTimeout
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(initWebGL, { timeout: 2000 });
    } else {
      setTimeout(initWebGL, 100);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isVisible, isInitialized, intensity, speed, color1, color2, color3]);

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
