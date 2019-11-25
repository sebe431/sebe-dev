(() => {
    let effects = [effectTriangles];

    var effectNumber = new URL(window.location.href).searchParams.get("effect");

    if(!effectNumber) {
        effects[Math.floor(Math.random()*effects.length)]();
    }
    else {
        effects[Number.parseInt(effectNumber)]();
    }
})();

// TODO: Implement something much more efficient
function effectTriangles() {
    // This is just conways game of life but it's a bit broken
    const canvas = document.getElementById('effect-container');
    const context = canvas.getContext('2d');

    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;

    function dist(v1,v2) {
        var a = v1.x - v2.x;
        var b = v1.y - v2.y;
        var c = Math.sqrt( a*a + b*b );
        return c;
    }

    function doCross({x:a,y:b}, {x:c,y:d}, {x:p,y:q}, {x:r,y:s}) {
        var det, gamma, lambda;
        det = (c - a) * (s - q) - (r - p) * (d - b);
        if (det === 0) {
            return false;
        } else {
            lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
            gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
            return (0.0 < lambda && lambda < 1.0) && (0.0 < gamma && gamma < 1.0);
        }
    }

    // line intercept math by Paul Bourke http://paulbourke.net/geometry/pointlineplane/
    // Determine the intersection point of two line segments
    // Return FALSE if the lines don't intersect
    function intersect({x:x1, y:y1}, {x:x2, y:y2}, {x:x3, y:y3}, {x:x4, y:y4}) {

        // Check if none of the lines are of length 0
        if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
            return false
        }
    
        denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))
    
        // Lines are parallel
        if (denominator === 0) {
            return false
        }
    
        let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator
        let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator
    
        // is the intersection along the segments
        if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
            return false
        }
    
        // Return a object with the x and y coordinates of the intersection
        let x = x1 + ua * (x2 - x1)
        let y = y1 + ua * (y2 - y1)
    
        return {x, y}
    }

    function rotate({x:cx, y:cy}, {x:x, y:y}, angle) {
        var radians = (Math.PI / 180) * angle,
            cos = Math.cos(radians),
            sin = Math.sin(radians),
            nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
            ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
        return {x:nx, y:ny};
    }

    function magnitude(x,y) {
        return Math.sqrt(x * x + y * y);
    }

    function normalized({x:x, y:y}) {
        let mag = magnitude(x,y);
        return {
            x:x / mag,
            y:y / mag
        }
    }

    function findAngle(A,B,C) {
        var AB = Math.sqrt(Math.pow(B.x-A.x,2)+ Math.pow(B.y-A.y,2));
        var BC = Math.sqrt(Math.pow(B.x-C.x,2)+ Math.pow(B.y-C.y,2));
        var AC = Math.sqrt(Math.pow(C.x-A.x,2)+ Math.pow(C.y-A.y,2));
        return Math.acos((BC*BC+AB*AB-AC*AC)/(2*BC*AB));
    }

    function angle180(cx, cy, ex, ey) {
        var dy = ey - cy;
        var dx = ex - cx;
        var theta = Math.atan2(dy, dx); // range (-PI, PI]
        theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
        return theta;
    }

    function angle360({x:cx, y:cy}, {x:ex, y:ey}) {
        var theta = angle180(cx, cy, ex, ey); // range (-180, 180]
        if (theta < 0) theta = 360 + theta; // range [0, 360)
        return theta;
    }

    class Effect {
        constructor() {
            this.backgroundColor = 'rgba(0, 0, 0, 1)';
            this.refreshVisuals();
        }

        refreshVisuals() {
            canvas.width = document.body.clientWidth;
            canvas.height = document.body.clientHeight;

            // Init things here
            this.drawn = false;
            this.gridSize = 7;
            this.width = canvas.width;
            this.height = canvas.height;
            let startingSize = Math.min(this.width, this.height) / this.gridSize;
            this.size = {
                x: this.width / Math.floor(this.width / startingSize),
                y: this.height / Math.floor(this.height / startingSize)
            };

            this.points = [];
            let pointSkips = 0;
            let totalPoints = (Math.round(this.width/this.size.x) * Math.round(this.height/this.size.y));
            let maxSkips = totalPoints / 2
            let skipChance = maxSkips / totalPoints;

            let connections = {};
            let connectionsKeys = [];
            
            let facesMap = {}; // Keep record of faces already added
            let pointConnections = {};
            let squareFacesMap = {};
            
            for(let i=1, imax=Math.round(this.width/this.size.x)-1; i<imax; i++) {
                for(let j=1, jmax=Math.round(this.height/this.size.y)-1; j<jmax; j++) {
                    if(Math.random() < skipChance && pointSkips<maxSkips) {
                        pointSkips++;
                        continue;
                    }

                    this.points.push({
                        x:Math.round(this.size.x*i/* *Math.random() */ + this.size.x*0.1 + Math.random()*this.size.x*0.8), 
                        y:Math.round(this.size.y*j/* *Math.random() */ + this.size.y*0.1 + Math.random()*this.size.y*0.8), 
                        wt:this.size.x*0.1 + (Math.random()*this.size.x*0.1) // weight, may be used later
                    });
                }
            }

            // make every possible connection (within a 3 size distance), only connections that go upwards
            for(let i=0; i<this.points.length; i++) {
                for(let j=i+1; j<this.points.length; j++) {
                    if(j!=i && !connections[Math.min(i,j) + ',' + Math.max(i,j)] && dist(this.points[i], this.points[j]) < this.size.x * 66556) { // except ourselves, or connections already existing, or too far
                        connections[Math.min(i,j) + ',' + Math.max(i,j)] = {
                            a: Math.min(i,j),
                            b: Math.max(i,j),
                            dist: dist(this.points[i], this.points[j])
                        };
                    }
                }
            }

            // remove lines and connections that overlap, starting with the smallest, and only check if we overlap smaller ones
            connectionsKeys = Object.keys(connections);
            connectionsKeys.sort((a,b) => {
                return connections[b].dist - connections[a].dist;
            });
            for(let i=connectionsKeys.length-1; i>=0; i--) {
                let overlaps = false;
                let conni = connections[connectionsKeys[i]];
                for(let j=i; j<connectionsKeys.length; j++) {
                    let connj = connections[connectionsKeys[j]];
                    if(i!=j) {
                        if(doCross(this.points[conni.a], this.points[conni.b], this.points[connj.a], this.points[connj.b])) {
                            overlaps = true;
                        }
                    }
                }

                if(overlaps) {
                    delete connections[connectionsKeys[i]];
                    connectionsKeys.splice(i,1);
                }
            }

            // Populate pointConnections
            Object.keys(connections).forEach(connKey => {
                let conn = connections[connKey];

                if(!pointConnections[conn.a]) {
                    pointConnections[conn.a] = {};
                }
                if(!pointConnections[conn.b]) {
                    pointConnections[conn.b] = {};
                }

                pointConnections[conn.a][conn.b] = 1;
                pointConnections[conn.b][conn.a] = 1;
            });

            // Go over every connection & fix non delaunay triangles
            connectionsKeys = Object.keys(connections);
            let foundNonDelaunay = true;
            while(foundNonDelaunay) {
                foundNonDelaunay = false;
                squareFacesMap = {}; // no point keeping a record of this, until the final version
                connectionsKeys = Object.keys(connections);
                for(let x=0; x<connectionsKeys.length; x++) {
                    let connKey = connectionsKeys[x];
                    let conn = connections[connKey];
                    let a = conn.a; 
                    let b = conn.b;
                    let c = null;
                    let d = null;

                    // Find c & d if possible
                    let connectionsFromA = Object.keys(pointConnections[a]);
                    let potentialCandD = [];
                    let shortestCandD = {c:null, d:null, dist:999999};
                    for(let i=0; i<connectionsFromA.length; i++) {
                        let newb = Number.parseInt(connectionsFromA[i]);

                        if(pointConnections[newb] && pointConnections[newb][b] && !potentialCandD.includes(newb)) {
                            potentialCandD.push(newb);
                        }
                    }

                    // We need to find the shortest c->d line, that also crosses our a->b line
                    if(potentialCandD.length>1) {
                        for(let i=0; i<potentialCandD.length; i++) {
                            for(let j=0; j<potentialCandD.length; j++) {
                                if(potentialCandD[i] != potentialCandD[j]) {
                                    if(dist(this.points[potentialCandD[i]],this.points[potentialCandD[j]]) < shortestCandD.dist &&
                                        doCross(this.points[potentialCandD[i]],this.points[potentialCandD[j]], this.points[a], this.points[b])) {
                                        shortestCandD.c = potentialCandD[i];
                                        shortestCandD.d = potentialCandD[j];
                                        shortestCandD.dist = dist(this.points[potentialCandD[i]],this.points[potentialCandD[j]]);
                                    }
                                }
                            }
                        }
                    }

                    if(shortestCandD.c !== null && shortestCandD.d !==null) {
                        c = shortestCandD.c;
                        d = shortestCandD.d;
                    }

                    // if we have 2 triangles sharing the same connection
                    if(a !== null && b !== null && c !== null && d !== null) {
                        let sortedPoints = [a,b,c,d];
                        sortedPoints.sort((a,b) => {return a-b;});

                        if(!squareFacesMap[sortedPoints.join(',')]) {
                            squareFacesMap[sortedPoints.join(',')] = 1; // 1 means good, 2 means bad
                        }

                        // See if this is a non delaunay triangle thing, if so, flip the connection
                        if(findAngle(this.points[a], this.points[c], this.points[b]) + findAngle(this.points[a], this.points[d], this.points[b]) >= Math.PI) {
                            squareFacesMap[sortedPoints.join(',')] = 2;
                            foundNonDelaunay = true;

                            console.log('fixed: ',sortedPoints.join(','), a, b);

                            // remove old connection
                            delete connections[connKey];
                            delete pointConnections[a][b];
                            delete pointConnections[b][a];

                            // Add the new flipped connection
                            connections[Math.min(c,d) + ',' + Math.max(c,d)] = {
                                a: Math.min(c,d),
                                b: Math.max(c,d),
                                dist: dist(this.points[c], this.points[d])
                            };

                            if(!pointConnections[c]) {
                                pointConnections[c] = {};
                            }
                            if(!pointConnections[d]) {
                                pointConnections[d] = {};
                            }

                            pointConnections[c][d] = 1;
                            pointConnections[d][c] = 1;

                            break;
                        }
                    }
                }
            }

            // Go over every connection & find triangles
            connectionsKeys = Object.keys(connections);
            for(let x=0; x<connectionsKeys.length; x++) {
                let connKey = connectionsKeys[x];
                let conn = connections[connKey];
                let a = conn.a;
                let b = conn.b;

                let connectionsFromA = Object.keys(pointConnections[a]);
                for(let i=0; i<connectionsFromA.length; i++) {
                    let newb = Number.parseInt(connectionsFromA[i]);

                    if(newb != b && pointConnections[newb] && pointConnections[newb][b]) {
                        let sortedPoints = [a,b,newb];
                        sortedPoints.sort((a,b) => {return a-b;});
                        facesMap[sortedPoints.join(',')] = 1;
                    }
                }
            }

            // Go over every connection again and find triangles that aren't part of any face
            for(let x=0; x<connectionsKeys.length; x++) {
                let connKey = connectionsKeys[x];
                let conn = connections[connKey];
                let foundTriangle = false;

                Object.keys(facesMap).forEach(face => {
                    let facePoints = face.split(',');
                    facePoints[0] = Number.parseInt(facePoints[0]);
                    facePoints[1] = Number.parseInt(facePoints[1]);
                    facePoints[2] = Number.parseInt(facePoints[2]);

                    if(facePoints.includes(conn.a) && facePoints.includes(conn.b)) {
                        foundTriangle=true;
                    }
                });

                if(!foundTriangle) {
                    console.log('killed a line!',connKey);
                    delete connections[connectionsKeys[x]];
                    connectionsKeys.splice(x,1);
                    x--;
                }
            }

            // visuals only
            this.lines = [];
            this.faces = [];
            this.voronoiFaces = [];

            Object.keys(pointConnections).forEach(startingPointKey => {
                let pointOrigin = this.points[startingPointKey];
                let pointArray = [];
                let allBorders = [];
                let allPotentialPoints = [];

                // Build all the borders
                Object.keys(pointConnections[startingPointKey]).forEach(connPointKey => {
                    let pointMid = {
                        x: pointOrigin.x + (this.points[connPointKey].x - pointOrigin.x)/2,
                        y: pointOrigin.y + (this.points[connPointKey].y - pointOrigin.y)/2
                    };

                    let pointMidToEndVector = {
                        x: this.points[connPointKey].x - pointMid.x,
                        y: this.points[connPointKey].y - pointMid.y
                    };

                    let pointNewEnd = normalized(pointMidToEndVector);
                    pointNewEnd.x *= this.size.x*12;
                    pointNewEnd.y *= this.size.x*12;
                    let pointNewEnd1 = rotate({x:0, y:0}, pointNewEnd, 90);
                    let pointNewEnd2 = rotate({x:0, y:0}, pointNewEnd, -90);

                    allBorders.push( {
                        start:{x:pointMid.x + pointNewEnd1.x, y:pointMid.y + pointNewEnd1.y},
                        end:{x:pointMid.x + pointNewEnd2.x, y:pointMid.y + pointNewEnd2.y},
                    });
                    
                    /* this.lines.push( {
                        start:{x:pointMid.x + pointNewEnd1.x, y:pointMid.y + pointNewEnd1.y},
                        end:{x:pointMid.x + pointNewEnd2.x, y:pointMid.y + pointNewEnd2.y},
                    }); */
                    /* this.voronoiFaces.push({
                        p:'-',
                        c:'rgba(255,0,0,0.5)',
                        arr:[
                            {x:pointMid.x + pointNewEnd1.x, y:pointMid.y + pointNewEnd1.y},
                            {x:pointMid.x + pointNewEnd2.x, y:pointMid.y + pointNewEnd2.y}
                        ]
                    }); */
                });

                // Find all intersections between borders, and all endpoints
                for(let i=0; i<allBorders.length; i++) {
                    let border = allBorders[i];
                    allPotentialPoints.push(border.start);
                    allPotentialPoints.push(border.end);

                    for(let j=i; j<allBorders.length; j++) {
                        if(i!=j) {
                            let inter = intersect(allBorders[i].start, allBorders[i].end, allBorders[j].start, allBorders[j].end);

                            if(inter) {
                                allPotentialPoints.push(inter);
                            }
                        }
                    }
                }

                // Go over every point, stretch a line from the pointOrigin, if nothing in the middle intersects, add this to pointArray
                allPotentialPoints.forEach(potPoint => {
                    let intersectsWithBorders = false;

                    let deboggedPotPoint = {
                        x:potPoint.x + (pointOrigin.x - potPoint.x)/100,
                        y:potPoint.y + (pointOrigin.y - potPoint.y)/100
                    };

                    /* this.voronoiFaces.push({
                        p:'-',
                        c:'rgba(0,255,0,0.5)',
                        arr:[
                            boggedOrigin,
                            potPoint
                        ]
                    }); */

                    for(let j=0; j<allBorders.length; j++) {
                        let inter = intersect(pointOrigin, deboggedPotPoint, allBorders[j].start, allBorders[j].end);

                        if(inter) {
                            intersectsWithBorders = true;

                            /* this.voronoiFaces.push({
                                p:'-',
                                c:'rgba(255,255,255,0.5)',
                                arr:[potPoint, {x:potPoint.x + 15, y:potPoint.y}]
                            });
                            this.voronoiFaces.push({
                                p:'-',
                                c:'rgba(255,255,255,0.3)',
                                arr:[allBorders[j].start, allBorders[j].end]
                            }); */
                        }
                    }

                    if(!intersectsWithBorders) {
                        pointArray.push(potPoint);
                    }
                });


                // TODO: Order the point arrays, starting with any one of them, and then to the nearest one
                /* if(pointArray.length>0) {
                    pointArraySorted.push(pointArray[0]);
                }
                while(pointArraySorted.length < pointArray.length) {
                    let distns = 999999;
                    let selected = null;
                    for(let i=0; i<pointArray.length; i++) {
                        if(!pointArraySorted.includes(pointArray[i])) {
                            let newDist = dist(pointArraySorted[pointArraySorted.length-1], pointArray[i]);

                            if(newDist < distns) {
                                distns = newDist;
                                selected = i;
                            }
                        }
                    }

                    pointArraySorted.push(pointArray[selected]);
                } */

                pointArray.sort((a,b) => {
                    /* console.log(a,findAngle({x:pointOrigin.x, y:pointOrigin.y-100}, pointOrigin, a));
                    console.log(b,findAngle({x:pointOrigin.x, y:pointOrigin.y-100}, pointOrigin, b)); */
                    //return findAngle({x:pointOrigin.x, y:pointOrigin.y-100}, pointOrigin, b) - findAngle({x:pointOrigin.x, y:pointOrigin.y-100}, pointOrigin, a)
                    return angle360(pointOrigin, a) - angle360(pointOrigin, b)
                })

                this.voronoiFaces.push({
                    p:startingPointKey,
                    c:'rgba(' + Math.floor(8 + Math.random()*56) + ',' + Math.floor(8 + Math.random()*8) + ',' + Math.floor(128 + Math.random()*128) + ',0.5)',
                    arr:pointArray
                });
            });

            
            Object.keys(connections).forEach(connKey => {
                let conn = connections[connKey];
                this.lines.push( {
                    start:{x:this.points[conn.a].x, y:this.points[conn.a].y},
                    end:{x:this.points[conn.b].x, y:this.points[conn.b].y},
                });
            });

            Object.keys(facesMap).forEach(facesKey => {
                let facePoints = facesKey.split(',');
                this.faces.push({
                    a:this.points[Number.parseInt(facePoints[0])],
                    b:this.points[Number.parseInt(facePoints[1])],
                    c:this.points[Number.parseInt(facePoints[2])],
                    /* cr1: facePoints[0] + ','+facePoints[1]+','+facePoints[2],
                    ang1: findAngle(this.points[Number.parseInt(facePoints[0])], this.points[Number.parseInt(facePoints[1])], this.points[Number.parseInt(facePoints[2])]),
                    cr2: facePoints[1] + ','+facePoints[0]+','+facePoints[2],
                    ang2: findAngle(this.points[Number.parseInt(facePoints[1])], this.points[Number.parseInt(facePoints[0])], this.points[Number.parseInt(facePoints[2])]),
                    cr3: facePoints[0] + ','+facePoints[2]+','+facePoints[1],
                    ang3: findAngle(this.points[Number.parseInt(facePoints[0])], this.points[Number.parseInt(facePoints[2])], this.points[Number.parseInt(facePoints[1])]), */
                });
            });

            console.log(connections, Object.keys(connections).length);
            console.log(pointConnections, Object.keys(pointConnections).length);
            console.log(facesMap, Object.keys(facesMap).length);
            console.log(squareFacesMap, Object.keys(squareFacesMap).length);
            console.log(this.faces);
            console.log(this.points);
            console.log(this.voronoiFaces);
        }

        draw(context) {
            if(this.drawn) {
                return;
            }

            context.fillStyle = this.backgroundColor;
            context.fillRect(0, 0, this.width, this.height);

            // Draw things here
            /* this.lines.forEach(line => {
                context.beginPath();
                context.moveTo(line.start.x, line.start.y);
                context.lineTo(line.end.x, line.end.y);
                context.strokeStyle = "cyan";
                context.lineWidth = 1;
                context.stroke(); 
            }); */
            
            /* let i=0;
            this.points.forEach(point => {
                context.beginPath();
                context.arc(point.x, point.y, point.wt/3, 0, 2*Math.PI);
                context.fillStyle = "cyan";
                context.fill(); 
                context.fillStyle = "white";
                context.font = "16px Ariel";
                context.fillText('' + i, point.x, point.y-20); i++; 
            }); */

            /* this.faces.forEach(face => {
                context.beginPath();
                context.moveTo(face.a.x, face.a.y);
                context.lineTo(face.b.x, face.b.y);
                context.lineTo(face.c.x, face.c.y);
                context.fillStyle = "rgba(255, 255, 255, 0.1)";
                context.fill(); 
            }); */

            this.voronoiFaces.forEach(vor => {
                if(vor.arr.length>0) {
                    context.beginPath();
                    let moved=false;
                    
                    vor.arr.forEach(pot=> {
                        if(!moved) {
                            context.moveTo(pot.x, pot.y);
                            moved=true;
                        }
                        else {
                            context.lineTo(pot.x, pot.y);
                        }
                    });
    
                    context.lineTo(vor.arr[0].x, vor.arr[0].y);
    
                    context.strokeStyle = vor.c || "red";
                    context.fillStyle = vor.c || "red";
                    context.lineWidth = 2.5;
                    context.stroke(); 
                    context.fill(); 
                }
            });

            this.drawn = true;
        }
    }

    let theEffect = new Effect();

    function looper() {
        theEffect.draw(context);
        requestAnimationFrame(looper);
    }
    looper();

    setTimeout(() => {
        document.getElementById('effect-container').classList.add('fade-in');
        document.getElementById('menu-container').classList.add('fade-in');
    }, 100);

    window.addEventListener('resize', () => {
        if (theEffect) {
            theEffect.refreshVisuals();
        }
    }, false);
}
