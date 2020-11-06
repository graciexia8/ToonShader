let edgeDetect = function(modelJSON) {
    let edges = {};
    console.log(modelJSON);
    // get faces of model
    const faces = modelJSON.meshes[0].faces;
    const vertices = modelJSON.meshes[0].vertices;


    // iterate through each face
    for ( let i = 0; i < faces.length; i++ ) {
        let faceIndex = faces[i];
        // get indiivdual indices
        const v1 = faceIndex[0];
        const v2 = faceIndex[1];
        const v3 = faceIndex[2];

        let faceVertices = {};

        // iterate through each index of the face (should be 3)
        for ( let j = 0; j < faceIndex.length; j++ ){
            // get x,y,z coordinte of the vertices corresponding to each index of the face
            const index = faceIndex[j];
            const startIndex = index * 3;
            const x = vertices[startIndex];
            const y = vertices[startIndex + 1];
            const z = vertices[startIndex + 2];
            // e.g v1 : [x,y,z]
            faceVertices[index] = [x,y,z];
        }

        // Caculate face normal
        // U vector
        // V vector
        const U_x = faceVertices[v3][0]-faceVertices[v1][0];
        const U_y = faceVertices[v3][1]-faceVertices[v1][1];
        const U_z = faceVertices[v3][2]-faceVertices[v1][2];

        const V_x = faceVertices[v2][0]-faceVertices[v1][0];
        const V_y = faceVertices[v2][1]-faceVertices[v1][1];
        const V_z = faceVertices[v2][2]-faceVertices[v1][2];

        // View vector
        const View_x = -faceVertices[v1][0];
        const View_y = -faceVertices[v1][1];
        const View_z = -faceVertices[v1][2];

        // Normal vector of current face
        const N_x = (U_y * V_z) - (U_z * V_y);
        const N_y = (U_x * V_z) - (U_z * V_x);
        const N_z = (U_x * V_y) - (U_y * V_x);

        // create edge 1
        const e1 = [ Math.min(v1, v2), Math.max(v1, v2)];
        // create edge 2
        const e2 = [ Math.min(v2, v3), Math.max(v2, v3)];
        // create edge 3
        const e3 = [ Math.min(v3, v1), Math.max(v3, v1)];

        // check if the face that edge belongs to is a front or back face
        // dot product of view vector and normal vector
        const dotprod = (N_x * View_x) + (N_y * View_y) + (N_z * View_z);
        let isFrontFace;

        // calculate if face that the edge belongs to is front or back
        if (dotprod >= 0) {
            isFrontFace = true;
        }
        else {
            isFrontFace = false;
        }

        // console.log(isFrontFace);
        // add edge 1 to hashmap
        if (e1 in edges) { edges[e1].push(isFrontFace) }
        else { edges[e1] = [isFrontFace]; }

        // add edge 2 to hashmap
        if (e2 in edges) { edges[e2].push(isFrontFace) }
        else { edges[e2] = [isFrontFace]; }

        // add edge 3 to hashmap
        if (e3 in edges) { edges[e3].push(isFrontFace) }
        else { edges[e3] = [isFrontFace]; }

    }

    const silhouetteEdges = silhouetteEdgesFinder(edges);
    console.log(silhouetteEdges);

    return silhouetteEdges;
    
}

let silhouetteEdgesFinder = function(edges) {
    silhouetteEdges = [];

    for (edgepair in edges) {
        if (edges[edgepair].length == 2) {
            const val1 = edges[edgepair][0];
            const val2 = edges[edgepair][1];
            // if edge belongs to both front and back then it's a silhouette edge
            if ((val1 == true && val2 == false) || (val1 == false && val2 == true)) {
                var array = JSON.parse("[" + edgepair + "]");
                silhouetteEdges.push(array[0]);
                silhouetteEdges.push(array[1]);
            }
        }
    }

    return silhouetteEdges;
}