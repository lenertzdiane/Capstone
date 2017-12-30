// import $ from 'jquery';


$(document).ready(function() {
  var map;
  //
  // function init() {

  map = L.map('map').setView([41.79, -87.65], 16);
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoibGVuZXJ0emQiLCJhIjoiY2pibDFhdHdpMHY2NDJxcWtrZjZodWlidSJ9.fBjof9UOXV117fVfw2H8vA'
  }).addTo(map);
  d3.json('http://localhost:8080/points.geojson', function(error, incidents) {
    //http://plnkr.co/edit/AkvPijzxHPjztDIAqg2a?p=preview

    var geoData = incidents;
    // console.log(geoData);
    //linear scale for preserving scale
    //https://github.com/d3/d3-scale/blob/master/README.md#continuous-scales
    var cscale = d3.scale.linear().domain([1, 3]).range(["#ff0000", "#ff6a00", "#ffd800", "#b6ff00", "#00ffff", "#0094ff"]); //"#00FF00","#FFA500"

    //to make it black and white i kinda like!
    L.tileLayer("http://{s}.sm.mapstack.stamen.com/(toner-lite,$fff[difference],$fff[@23],$fff[hsl-saturation@20])/{z}/{x}/{y}.png").addTo(map);


    var svg = d3.select(map.getPanes().overlayPane).append("svg");
    var g = svg.append("g").attr("class", "leaflet-zoom-hide");
    let points2 = []
    // Use Leaflet to implement a D3 geometric transformation.
    function projectPoint(x, y) {
      //how does this function know to pass lat and long from json data?
      //latLngtoLayerPoint: Given a geographical coordinate, returns the corresponding pixel coordinate relative to the origin pixel.
      //transforms geographical data into data relative to map
      var point = map.latLngToLayerPoint(new L.LatLng(y, x));
      // point is ex: {x:621 , y:898}
      // returns output stream for the specified output stream...maybe point.x, point.y is specified output stream?
      this.stream.point(point.x, point.y);
    }

    var transform = d3.geo.transform({
      point: projectPoint
    });

    //path: given a GeoJSON geometry or feature object, it generates an SVG path data string or renders the path to a Canvas.
    var path = d3.geo.path().projection(transform);
    map.on('moveend', mapmove);



        // var path = d3.geo.path().projection(transform);
        // map.on('moveend', mapmove);

    redrawSubset(geoData.features)
    console.log(geoData.features);

    function redrawSubset(subset) {
      path.pointRadius(3); // * scale);

      var bounds = path.bounds({
        type: "FeatureCollection",
        features: subset
      });
      var topLeft = bounds[0];
      var bottomRight = bounds[1];


      svg.attr("width", bottomRight[0] - topLeft[0])
      .attr("height", bottomRight[1] - topLeft[1])
      .style("left", topLeft[0] + "px")
      .style("top", topLeft[1] + "px");


      g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

      var start = new Date();


      var points = g.selectAll(".points")
      .data(subset, function(d) {
        return d.geometry.coordinates;
      });
      points.enter().append("path");

      points.attr("d", path).attr("class", "points");

      points.style("fill-opacity", function(d) {
        if (d.group) {
          return (d.group * 0.1) + 0.2;
        }
      });
    }

    //creating the lines between the points! this has to be after redraw subset for some reason.
        var points = g.selectAll("path")
        .data(geoData.features, function(d) {
          return d.geometry.coordinates;
        });
        // simplify points data structure to array of hashes with an x and a y coordinate
        let simpleHash = []
        let i = 0
        points[0].forEach((point) => {
          var x = point.__data__.geometry.coordinates[0];
          var y = point.__data__.geometry.coordinates[1];
          var point = map.latLngToLayerPoint(new L.LatLng(y, x));
          // var hash = {x, y}
          simpleHash.push(point)
          i += 1

        });

        var lineFunction = d3.svg.line()
        .x(function(d) {return d.x; })
        .y(function(d) {return d.y; })
        .interpolate("linear");

        //The line SVG Path we draw
        var line = g.append("path")
        .attr("d", lineFunction(simpleHash))
        .attr("fill", 'none')
        .attr("stroke", "none")
        .attr("stroke-width", 100)
        .attr("class", "path")











    function mapmove(e) {
      //remove all points
      d3.selectAll(".points").remove();
      redrawSubset(geoData.features);
    }

    //    function drawPath(geojsonPath, duration) {
    // var pane = d3.select(map.getPanes().overlayPane);
    // pane.selectAll("svg.running-path").remove();
    //
    // var svg = pane.append("svg").attr("class", "running-path"),
    //     g = svg.append("g").attr("class", "leaflet-zoom-hide");
    //
    // var transform = d3.geo.transform({point: projectPoint});
    // var path = d3.geo.path().projection(transform);
    //
    // var collection = { type: "FeatureCollection", features: [geojsonPath]};
    //
    // var line = g.selectAll(".line")
    //               .data([geojsonPath])
    //               .enter()
    //               .append("path")
    //               .attr("class", "line");
    //
    // function reset() {
    //   var bounds = path.bounds(collection),
    //       topLeft = bounds[0],
    //       bottomRight = bounds[1];
    //
    //   topLeft[0] -= 2;
    //   topLeft[1] -= 2;
    //   bottomRight[0] += 2;
    //   bottomRight[1] += 2;
    //
    //   svg.attr("width", bottomRight[0] - topLeft[0] + 6)
    //       .attr("height", bottomRight[1] - topLeft[1] + 6)
    //       .style("left", topLeft[0] + "px")
    //       .style("top", topLeft[1] + "px");
    //
    //   g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
    //
    //   line.attr("d", path).call(transition);
    // }


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
