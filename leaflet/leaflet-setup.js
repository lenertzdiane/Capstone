//SATURDAY:
// ======================================================= code to scale animation for zooming // i think i just have to be able to reset lengths array and projectedArray before rendering just can't figure out where to do it
// ======================================================= currently it resets itself to 0 have to figure out a way reset it at a transformation of the previous one
// ======================================================= wrap render logic in functions
// ======================================================= attach clickable markers to the map surrounding that have popups come up

// NEED TO REORGANIZE THIS CODE
// go through and annotate this code
// ======================================================= marker that also moves?


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

//POPUPS
  function addDataToMap(data, map) {
      var dataLayer = L.geoJson(data);
      dataLayer.addTo(map);
  }

  $.getJSON("http://localhost:8080/popups.geojson", function(data) {
    addDataToMap(data, map)
      var dataLayer = L.geoJson(data, {
        onEachFeature: function(feature, layer) {
          var popupText = "<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.  Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.Lorem ipsum dolor sit  Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.Lorem ipsum dolor sit  Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.Lorem ipsum dolor sit</p>  "
         + feature.geometry.coordinates;
          layer.bindPopup(popupText);
        }
      });
      dataLayer.addTo(map)
  });

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
    .x(function(d) {return applyLatLngToLayer(d).x})
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
    .attr("r", 0)


    var marker = g.append("circle")
    .attr("r", 10)
    .attr("id", "marker")
    .attr("class", "travelMarker");



    reset();
    map.on("viewreset", reset);
    map.on("moveend", reset);

    marker.attr("transform",
    function() {
      var y = geoData[0].geometry.coordinates[1]
      var x = geoData[0].geometry.coordinates[0]
      return "translate(" +
      map.latLngToLayerPoint(new L.LatLng(y, x)).x + "," +
      map.latLngToLayerPoint(new L.LatLng(y, x)).y + ")";
    });

    var scrollTop = 0
    var newScrollTop = 0

    scrollTop = scrollTop + 1

    function reset() {

      container = d3.select('#container')

      container.on ("scroll", function() {
        newScrollTop = container.node().scrollTop;
      });

      var bounds = path.bounds(incidents),
      topLeft = bounds[0],
      bottomRight = bounds[1]

      map.on("viewreset", change);
      map.on("moveend", change);

      function change() {
        linePath
        .style('stroke-dashoffset', function(d) {
          return length - 0 + 'px';
        })
        .style('stroke-dasharray', length)
        //THIS IS A DIRTY HACK!
        scrollTop = scrollTop +1
      }

      ptFeatures.attr("transform",
      function(d) {
        return "translate(" +
        applyLatLngToLayer(d).x + "," +
        applyLatLngToLayer(d).y + ")";
      });
      // again, not best practice, but I'm harding coding
      // the starting point


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

      // This is also kind of a dirty hack I should be able to reset projected array somewhere but.
      projectedArray = projectedArray.slice((projectedArray.length - geoData.length), (projectedArray.length))

      var getDistance = function getDistance(point1, point2) {
        var xs = 0;
        var ys = 0;

        xs = point2[0] - point1[0];
        xs = xs * xs;

        ys = point2[1] - point1[1];
        ys = ys * ys;

        return Math.sqrt( xs + ys );
      }

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
          return $('#'+number).position().top + scrollTop - ($(window).innerHeight())
        }
      }

      function makeLastTestPosition(scrollTop, number) {
        if(number === 0){
          return 0
        } else {

          return $('#' + number + '.last').position().top + scrollTop - ($(window).innerHeight())
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

      var render = function() {
        if (scrollTop !== newScrollTop) {
          scrollTop = newScrollTop

          // select all spans with class last

          let elements = $("span[class='last']");

          // let elements =[$('.last1'), $('.last2'), $('.last3'), $('.last4'), $('.last5')]

          for(i = 0; i < elements.length; i ++) {
            if($(elements[i]).position().top > $(window).innerHeight()){
              actingElement = $(elements[i])
              break
            }
          }



          linePath
          .style('stroke-dashoffset', function(d) {
            num = parseInt(actingElement[0].id)

            return length - makeLinePathScale(scrollTop, actingElement[0].id) + 'px';
          })
          .style('stroke-dasharray', length)
          .style('stroke-width', function() {
            if(map.getZoom() > 16) {
              return 9
            } else if(14 < map.getZoom < 16) {
              return 5
            } else {
              return 2
            }
          })
          .style('stroke-dasharray', length)

          console.log(linePath.style('stroke-dashoffset'));
          // console.log($('path')[0].attributes.style);

          var p = linePath.node().getPointAtLength(length - parseInt(linePath.style('stroke-dashoffset')));
          console.log(p);
          marker.attr("transform", "translate(" + p.x + "," + p.y + ")");

        }
        window.requestAnimationFrame(reset)
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
