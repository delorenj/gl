<!DOCTYPE html>
<html>
	<head>
		<script src="//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min.js"></script>
		<script type="text/javascript" src="js/webgl-debug.js"></script>		
		<script type="text/javascript" src="js/webgl-utils.js"></script>		
		<script type="text/javascript" src="js/J3DI.js"></script>		
		<script type="text/javascript" src="js/J3DIMath.js"></script>
		<script id="vshader" type="x-shader/x-vertex">
		    uniform mat4 u_modelViewProjMatrix;
		    uniform mat4 u_normalMatrix;
		    uniform vec3 lightDir;

		    attribute vec3 vNormal;
		    attribute vec4 vTexCoord;
		    attribute vec4 vPosition;

		    varying float v_Dot;
		    varying vec2 v_texCoord;

		    void main()
		    {
		        gl_Position = u_modelViewProjMatrix * vPosition;
		        v_texCoord = vTexCoord.st;
		        vec4 transNormal = u_normalMatrix * vec4(vNormal, 1);
		        v_Dot = max(dot(transNormal.xyz, lightDir), 0.0);
		    }
		</script>

		<script id="fshader" type="x-shader/x-fragment">
		    precision mediump float;

		    uniform sampler2D sampler2d;

		    varying float v_Dot;
		    varying vec2 v_texCoord;

		    void main()
		    {
		        vec2 texCoord = vec2(v_texCoord.s, 1.0 - v_texCoord.t);
		        vec4 color = texture2D(sampler2d, texCoord);
		        color += vec4(0.1, 0.1, 0.1, 1);
		        gl_FragColor = vec4(color.xyz * v_Dot, color.a);
		    }
		</script>

		<script type="text/javascript" src="js/main.js?2"></script>
	</head>
	<body>
		<canvas id="cube" width="500" height="500"></canvas>
		<h1>boats</h1>
	</body>
</html>
