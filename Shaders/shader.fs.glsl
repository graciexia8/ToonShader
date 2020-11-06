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
      uniform float u_rim_Threshold;

      // Data (to be interpolated) that is passed on to the fragment shader
      varying vec3 v_Vertex;
      varying vec3 v_Normal;
      varying vec2 fragTexCoord;
      
      void main()
      {
        vec3 to_light;
        vec3 vertex_normal;
        vec3 reflection;
        vec3 to_camera;
        float cos_angle;
        float z_component;
        float halo_percent;
        float edge;

        vec3 diffuse_color;
        vec3 rim_color;
        vec3 color;

        // vec4 texel = texture2D(u_sampler, fragTexCoord);

        // Calculate a vector from the fragment location to the light source
        to_light = normalize(u_light_Direction) - v_Vertex;
        to_light = normalize( to_light );
      
        // The vertex's normal vector is being interpolated across the primitive
        // which can make it un-normalized. So normalize the vertex's normal vector.
        vertex_normal = normalize( v_Normal );


        // Calculate the cosine of the angle between the vertex's normal vector
        // and the vector going to the light.
        cos_angle = dot(vertex_normal, to_light);
        cos_angle = clamp(cos_angle, 0.0, 1.0);

        z_component = vertex_normal.z;
        halo_percent = 1.0 - abs(z_component);
        diffuse_color = u_Color.xyz * cos_angle;
        
        // The rim color is from the light source, not the object
        if (halo_percent > 0.0) {
          rim_color = u_light_Color * halo_percent;
          diffuse_color = diffuse_color * (1.0 - halo_percent);
        } else {
          rim_color = vec3(0.0, 0.0, 0.0);
        }

        color = diffuse_color + rim_color;

        if (cos_angle > u_Threshold || halo_percent > u_rim_Threshold ){
          color =  vec3(1.0, 1.0, 1.0);
        }
        else {
          color =  vec3(0.0, 0.0, 0.0);
        }


        gl_FragColor = vec4(color, 1.0);
      }