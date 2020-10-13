      // Fragment shader program
      precision mediump float;
    
      // uniform sampler2D u_sampler;
      uniform vec4 u_Color;
      uniform vec3 u_light_Direction;
      uniform vec3 u_light_Color;
      uniform vec3 u_ambient_Color;
      uniform float u_ambient_Percentage;
      uniform float u_shininess;

      // Threshold value
      uniform float u_Threshold;

      // Data (to be interpolated) that is passed on to the fragment shader
      varying vec3 v_Vertex;
      varying vec3 v_Normal;
      varying vec2 fragTexCoord;
      
      void main()
      {
        vec3 vertex_normal;
        float z_component;
        vec3 color;

        // The vertex's normal vector is being interpolated across the primitive
        // which can make it un-normalized. So normalize the vertex's normal vector.
        vertex_normal = normalize( v_Normal );

        z_component = float(vertex_normal.z);
        z_component = (1.0 - abs(z_component));
        z_component = pow(z_component, 2.26);
      
        color = u_Color.xyz * z_component;

        gl_FragColor = vec4(color,  u_Color.a);
      }