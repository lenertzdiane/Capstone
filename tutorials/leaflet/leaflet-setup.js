// TODO XMAS:

//MAP STUFF:
// attach clickable markers to the map surrounding that have popups come up

//Phase 2:
// ======================================================= Get the line to animate between points on scroll scrollTop
// need code to scale for zooming
// attach points to certain text and render dynamically as that text is rendered??
// think structure on this.

//Phase 3:
//Do some angular tutorials?
//Do some Node.js tutorials?
//Read about Mongo

//I'm thinking that a whole vignette will be one path (or should it be the whole narrative?) and then
//each point is a story point. if f ????????????????


$(document).ready(function() {

  // MAP SETUP //////////////////////////////////////////////////// MAPSETUP  //////////////////////////////////////

  var map;

  map = L.map('map').setView([41.79, -87.65], 16);
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoibGVuZXJ0emQiLCJhIjoiY2pibDFhdHdpMHY2NDJxcWtrZjZodWlidSJ9.fBjof9UOXV117fVfw2H8vA'
  }).addTo(map);

  //position gives us the relative position of an element to the top of its parent div in pixels (#test is a span in our ps)
  //the - window.innerheight bit is so that we get the pixels for the first moment it shows on screen when scrolling, not the last
  //scrollTop() gives us the position of the scrollbar


  // D3.JSON //////////////////////////////////////////////////// D3.JSON START //////////////////////////////////////

  d3.json('http://localhost:8080/points.geojson', function(error, incidents) {
    //http://plnkr.co/edit/AkvPijzxHPjztDIAqg2a?p=preview
    var geoData = incidents.features;

    //linear scale for preserving scale
    //https://github.com/d3/d3-scale/blob/master/README.md#continuous-scales
    var cscale = d3.scale.linear().domain([1, 3]).range(["#ff0000", "#ff6a00", "#ffd800", "#b6ff00", "#00ffff", "#0094ff"]); //"#00FF00","#FFA500"

    //to make it black and white i kinda like!
    L.tileLayer("http://{s}.sm.mapstack.stamen.com/(toner-lite,$fff[difference],$fff[@23],$fff[hsl-saturation@20])/{z}/{x}/{y}.png").addTo(map);


    var svg = d3.select(map.getPanes().overlayPane).append("svg");
    var g = svg.append("g").attr("class", "leaflet-zoom-hide");
    // Use Leaflet to implement a D3 geometric transformation.


    var transform = d3.geo.transform({
      point: projectPoint
    });

    //path: given a GeoJSON geometry or feature object, it generates an SVG path data string or renders the path to a Canvas.
    var path = d3.geo.path().projection(transform);

    var projectedArray = []

    var makeLine = d3.svg.line()
    .x(function(d) {
      return applyLatLngToLayer(d).x})
      .y(function(d) {return applyLatLngToLayer(d).y})
      .interpolate("linear");

      var linePath = g.selectAll(".lines")
      .data([geoData])
      .enter()
      .append("path")
      .attr("class", "lines")


      var ptFeatures = g.selectAll("circle")
      .data(geoData)
      .enter()
      .append("circle")
      .attr("r", 3)


      // .attr("class", function(d) {
      //   return "waypoints " + "c" + d.properties.time
      // });


      // var marker = g.append("circle")
      // .attr("r", 10)
      // .attr("id", "marker")
      // .attr("class", "travelMarker");

      reset();
      map.on("viewreset", reset);
      map.on("moveend", reset);

      var scrollTop = 0
      var newScrollTop = 0

      var testPosition = $('#test').position().top - ($(window).innerHeight() * .95)

      function reset() {
        // console.log('in reset');
        var bounds = path.bounds(incidents),
        topLeft = bounds[0],
        bottomRight = bounds[1];
        // console.log(topLeft);
        // console.log(bottomRight);

        ptFeatures.attr("transform",
        function(d) {
          return "translate(" +
          applyLatLngToLayer(d).x + "," +
          applyLatLngToLayer(d).y + ")";
        });
        // again, not best practice, but I'm harding coding
        // the starting point


        // marker.attr("transform",
        // function() {
        //   var y = geoData[0].geometry.coordinates[1]
        //   var x = geoData[0].geometry.coordinates[0]
        //   return "translate(" +
        //   map.latLngToLayerPoint(new L.LatLng(y, x)).x + "," +
        //   map.latLngToLayerPoint(new L.LatLng(y, x)).y + ")";
        // });
        // Setting the size and location of the overall SVG container
        svg.attr("width", bottomRight[0] - topLeft[0] + 120)
        .attr("height", bottomRight[1] - topLeft[1] + 120)
        .style("left", topLeft[0] - 50 + "px")
        .style("top", topLeft[1] - 50 + "px");
        // linePath.attr("d", d3path);
        linePath.attr("d", makeLine)
        // ptPath.attr("d", d3path);
        g.attr("transform", "translate(" + (-topLeft[0] + 50) + "," + (-topLeft[1] + 50) + ")");
      } // end reset


      var getDistance = function getDistance(point1, point2) {
        var xs = 0;
        var ys = 0;

        xs = point2[0] - point1[0];
        xs = xs * xs;

        ys = point2[1] - point1[1];
        ys = ys * ys;

        return Math.sqrt( xs + ys );
      }

      var lengthsArray = []
      let distance = 0

      for (i = 0; i < projectedArray.length-1; i++) {
        distance = getDistance(projectedArray[i], projectedArray[i+1]);
        lengthsArray.push(distance);
      }

      var segLength = getDistance(projectedArray[0], projectedArray[1])
      console.log(projectedArray[1]);
      var length = linePath.node().getTotalLength()
      //maybe i will have to make a method to populate this like with all the different test positions
      //and all the lengths where the nodes are

//maybe until range is the length, keep chaning domain and range, range will be each of the lengths added one after the other
      var linePathScale = d3.scale.linear()
      .domain([0, testPosition])
      .range([0, segLength])
      .clamp(true);

      container = d3.select('#container')


      container.on ("scroll", function() {
        newScrollTop = container.node().scrollTop;
        // var length2 = ptFeatures[0][1].attributes[1].nodeValue);
      });

      // var setDimensions = function() {
      //   ...
      // }
      //
      var render = function() {
        if (scrollTop !== newScrollTop) {
          scrollTop = newScrollTop


          linePath
          .style('stroke-dashoffset', function(d) {
            console.log(length - linePathScale(scrollTop) + 'px');
            console.log(length);
            return length - linePathScale(scrollTop) + 'px';
          })
          .style('stroke-dasharray', length)
        }
          window.requestAnimationFrame(render)
      }

      window.requestAnimationFrame(render)

      // window.onresize = setDimensions

      // CHANGING LATLONG TO LEAFLET LATLONG //////////////////////////////////////////////////// //////////////////////////////////////

      function projectPoint(x, y) {

        //how does this function know to pass lat and long from json data?
        //latLngtoLayerPoint: Given a geographical coordinate, returns the corresponding pixel coordinate relative to the origin pixel.
        //transforms geographical data into data relative to map
        var point = map.latLngToLayerPoint(new L.LatLng(y, x));
        // point is ex: {x:621 , y:898}
        // returns output stream for the specified output stream...maybe point.x, point.y is specified output stream?

        projectedArray.push([point.x, point.y])
        this.stream.point(point.x, point.y);
      }

      function applyLatLngToLayer(d) {
        var y = d.geometry.coordinates[1]
        var x = d.geometry.coordinates[0]
        return map.latLngToLayerPoint(new L.LatLng(y, x))
      }


    });

  });




  //
  // // import $ from 'jquery';
  //
  //
  // $(document).ready(function() {
  //   var map;
  //   //
  //   // function init() {
  //
  //   map = L.map('map').setView([41.79, -87.65], 16);
  //   L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
  //     attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
  //     maxZoom: 18,
  //     id: 'mapbox.streets',
  //     accessToken: 'pk.eyJ1IjoibGVuZXJ0emQiLCJhIjoiY2pibDFhdHdpMHY2NDJxcWtrZjZodWlidSJ9.fBjof9UOXV117fVfw2H8vA'
  //   }).addTo(map);
  //   d3.json('http://localhost:8080/points.geojson', function(error, incidents) {
  //     //http://plnkr.co/edit/AkvPijzxHPjztDIAqg2a?p=preview
  //
  //     var geoData = incidents;
  //     // console.log(geoData);
  //     //linear scale for preserving scale
  //     //https://github.com/d3/d3-scale/blob/master/README.md#continuous-scales
  //     var cscale = d3.scale.linear().domain([1, 3]).range(["#ff0000", "#ff6a00", "#ffd800", "#b6ff00", "#00ffff", "#0094ff"]); //"#00FF00","#FFA500"
  //
  //     //to make it black and white i kinda like!
  //     L.tileLayer("http://{s}.sm.mapstack.stamen.com/(toner-lite,$fff[difference],$fff[@23],$fff[hsl-saturation@20])/{z}/{x}/{y}.png").addTo(map);
  //
  //
  //     var svg = d3.select(map.getPanes().overlayPane).append("svg");
  //     var g = svg.append("g").attr("class", "leaflet-zoom-hide");
  //     let points2 = []
  //     // Use Leaflet to implement a D3 geometric transformation.
  //     function projectPoint(x, y) {
  //       //how does this function know to pass lat and long from json data?
  //       //latLngtoLayerPoint: Given a geographical coordinate, returns the corresponding pixel coordinate relative to the origin pixel.
  //       //transforms geographical data into data relative to map
  //       var point = map.latLngToLayerPoint(new L.LatLng(y, x));
  //       // point is ex: {x:621 , y:898}
  //       // returns output stream for the specified output stream...maybe point.x, point.y is specified output stream?
  //       this.stream.point(point.x, point.y);
  //     }
  //
  //     var transform = d3.geo.transform({
  //       point: projectPoint
  //     });
  //
  //     //path: given a GeoJSON geometry or feature object, it generates an SVG path data string or renders the path to a Canvas.
  //
  //
  //   // creating the lines between the points!
  //     var points = g.selectAll("path")
  //     .data(geoData.features, function(d) {
  //       return d.geometry.coordinates;
  //     });
  //     // simplify points data structure to array of hashes with an x and a y coordinate
  //     let simpleHash = []
  //     let i = 0
  //     points[0].forEach((point) => {
  //       var x = point.__data__.geometry.coordinates[0];
  //       var y = point.__data__.geometry.coordinates[1];
  //       var point = map.latLngToLayerPoint(new L.LatLng(y, x));
  //       // var hash = {x, y}
  //       simpleHash.push(point)
  //       i += 1
  //
  //     });
  //
  //     var lineFunction = d3.svg.line()
  //     .x(function(d) { console.log(d.x);return d.x; })
  //     .y(function(d) { console.log(d.y);return d.y; })
  //     .interpolate("linear");
  //
  //     //The line SVG Path we draw
  //     var line = g.append("path")
  //     .attr("d", lineFunction(simpleHash))
  //     .attr("fill", 'none')
  //     .attr("stroke", "none")
  //     .attr("stroke-width", 100)
  //     .attry("class", "path")
  //
  //     var path = d3.geo.path().projection(transform);
  //     map.on('moveend', mapmove);
  //
  // //this stuff is for zoom and scaling
  //     redrawSubset(geoData.features)
  //
  //     function redrawSubset(subset) {
  //       path.pointRadius(3); // * scale);
  //
  //       var bounds = path.bounds({
  //         type: "FeatureCollection",
  //         features: subset
  //       });
  //       var topLeft = bounds[0];
  //       var bottomRight = bounds[1];
  //
  //
  //       svg.attr("width", bottomRight[0] - topLeft[0])
  //       .attr("height", bottomRight[1] - topLeft[1])
  //       .style("left", topLeft[0] + "px")
  //       .style("top", topLeft[1] + "px");
  //
  //
  //       g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
  //
  //       var start = new Date();
  //
  //       var points = g.selectAll("path")
  //       .data(subset, function(d) {
  //         return d.geometry.coordinates;
  //       });
  //       points.enter().append("path");
  //
  //       points.attr("d", path).attr("class", "points");
  //
  //       points.style("fill-opacity", function(d) {
  //         if (d.group) {
  //           return (d.group * 0.1) + 0.2;
  //         }
  //       });
  //     }
  //
  //     function mapmove(e) {
  //       //remove all points
  //       d3.selectAll(".points").remove();
  //       redrawSubset(geoData.features);
  //     }
  //
  //     // function mapmove(e) {
  //     //   //remove all points
  //     //   d3.selectAll(".path").remove();
  //     //   redrawSubset(geoData.features);
  //     // }
  //
  //     //    function drawPath(geojsonPath, duration) {
  //     // var pane = d3.select(map.getPanes().overlayPane);
  //     // pane.selectAll("svg.running-path").remove();
  //     //
  //     // var svg = pane.append("svg").attr("class", "running-path"),
  //     //     g = svg.append("g").attr("class", "leaflet-zoom-hide");
  //     //
  //     // var transform = d3.geo.transform({point: projectPoint});
  //     // var path = d3.geo.path().projection(transform);
  //     //
  //     // var collection = { type: "FeatureCollection", features: [geojsonPath]};
  //     //
  //     // var line = g.selectAll(".line")
  //     //               .data([geojsonPath])
  //     //               .enter()
  //     //               .append("path")
  //     //               .attr("class", "line");
  //     //
  //     // function reset() {
  //     //   var bounds = path.bounds(collection),
  //     //       topLeft = bounds[0],
  //     //       bottomRight = bounds[1];
  //     //
  //     //   topLeft[0] -= 2;
  //     //   topLeft[1] -= 2;
  //     //   bottomRight[0] += 2;
  //     //   bottomRight[1] += 2;
  //     //
  //     //   svg.attr("width", bottomRight[0] - topLeft[0] + 6)
  //     //       .attr("height", bottomRight[1] - topLeft[1] + 6)
  //     //       .style("left", topLeft[0] + "px")
  //     //       .style("top", topLeft[1] + "px");
  //     //
  //     //   g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
  //     //
  //     //   line.attr("d", path).call(transition);
  //     // }
  //
  //
  //   });
  //
  // });
