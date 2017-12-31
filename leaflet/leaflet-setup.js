//SATURDAY:
// code to scale animation for zooming // i think i just have to be able to reset lengths array and projectedArray before rendering just can't figure out where to do it
// wrap render logic in functions
// attach clickable markers to the map surrounding that have popups come up
// go through and annotate this code
// marker that also moves?

//Phase 2:
// ======================================================= Get the line to animate between points on scroll scrollTop
// ======================================================= need to be able to stay in one place for a paragraph --- fix the jump after the stay!
// ======================================================= attach points to certain text and render dynamically as that text is rendered??
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
    //this is where I'd take the street names off?
    L.tileLayer("http://{s}.sm.mapstack.stamen.com/(toner-lite,$fff[difference],$fff[@23],$fff[hsl-saturation@20])/{z}/{x}/{y}.png").addTo(map);


    var svg = d3.select(map.getPanes().overlayPane).append("svg");
    var g = svg.append("g").attr("class", "leaflet-zoom-hide");
    // Use Leaflet to implement a D3 geometric transformation.


    var transform = d3.geo.transform({
      point: projectPoint,
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


        let distance = 0
        let lengthsArray =[]


        var getDistance = function getDistance(point1, point2) {
          var xs = 0;
          var ys = 0;

          xs = point2[0] - point1[0];
          xs = xs * xs;

          ys = point2[1] - point1[1];
          ys = ys * ys;

          return Math.sqrt( xs + ys );
        }
        // console.log(projectedArray.length);
        // console.log(projectedArray);

        for (i = 0; i < projectedArray.length-1; i++) {
          distance = getDistance(projectedArray[i], projectedArray[i+1]);
          lengthsArray.push(distance);
        }

        ///////////// ANIMATIONS
        let length = linePath.node().getTotalLength()

        function makeTestPosition(scrollTop, number) {
          if(number === 0) {
            return 0
          }
          else {
            console.log('in here');
            return $('#'+number).position().top + scrollTop - ($(window).innerHeight())
          }
        }

        function makeLastTestPosition(scrollTop, number) {
          if(number === 0){
            return 0
          } else {
          return $('.last' + number).position().top + scrollTop - ($(window).innerHeight())
        }
      }

        function makeSegLength(lengthsArray, number) {
          let total = 0
          if(number === 0) {
            return 0
          }
          else {
            for (let i = 0; i < number; i ++){
              total = total + lengthsArray[i]
            }
            return total
          }
        }


        function makeLinePathScale(scrollTop, number){
          var linePathScale = d3.scale.linear()
          .domain([makeLastTestPosition(scrollTop, number-1), makeTestPosition(scrollTop, number)])
          .range([makeSegLength(lengthsArray, number-1), makeSegLength(lengthsArray, number)])
          .clamp(true);
          return linePathScale(scrollTop)
        }

        container = d3.select('#container')

        container.on ("scroll", function() {
          newScrollTop = container.node().scrollTop;
        });


        var render = function() {
          if (scrollTop !== newScrollTop) {
            console.log(scrollTop);
            scrollTop = newScrollTop
            if($('.last1').position().top > $(window).innerHeight()) {
              console.log('in one');
              linePath
              .style('stroke-dashoffset', function(d) {
                return length - makeLinePathScale(scrollTop, 1) + 'px';
              })
              .style('stroke-dasharray', length)
            }

            else if($('.last2').position().top > $(window).innerHeight()) {
              console.log('in two');
              linePath
              .style('stroke-dashoffset', function(d) {
                return length - makeLinePathScale(scrollTop, 2) + 'px';
              })
            }

            else if($('.last3').position().top > $(window).innerHeight()){
              console.log('in threeeeee');
              linePath
              .style('stroke-dashoffset', function(d) {
                return length - makeLinePathScale(scrollTop, 3) + 'px';
              })
            }

            else if($('.last4').position().top > $(window).innerHeight()){
              console.log('in four');
              linePath
              .style('stroke-dashoffset', function(d) {
                return length - makeLinePathScale(scrollTop, 4) + 'px';
              })
            }

            else if($('.last5').position().top > $(window).innerHeight()){
              console.log('in five');
              linePath
              .style('stroke-dashoffset', function(d) {
                return length - makeLinePathScale(scrollTop, 5) + 'px';
              })
            }

            else if($('.last6').position().top > $(window).innerHeight()){
              console.log('in six');
              linePath
              .style('stroke-dashoffset', function(d) {
                return length - makeLinePathScale(scrollTop, 6) + 'px';
              })
            }

          }
          window.requestAnimationFrame(render)
        }

        window.requestAnimationFrame(render)

      } // end reset


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
