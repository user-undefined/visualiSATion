!(function (d3) {

$("#factor").empty();

var svgSpace = d3.select("#factor"),
    margin = { top: 20, right: 30, bottom: 30, left: 30 },
    width = +svgSpace.attr("width") - margin.left - margin.right,
    height = +svgSpace.attr("height") - margin.top,
    legend = { width: width, height: 69 - margin.bottom };

var legendDescription = { data: [   {text: "CLAUSE", class: "clause node", sign: "circle", index: 0},
                                    {text: "LITERAL", class: "literal node", sign: "circle", index: 1},
                                    {text: "Positive value of LITERAL (SAT solved)", class: "positivenode", sign: "circle", index: 10},
                                    {text: "Negative value of LITERAL (SAT solved)", class: "negativenode", sign: "circle", index: 11},
                                    {text: "Positive LITERAL in CLAUSE", class: "line positive", sign: "line", index: 20},
                                    {text: "Negative LITERAL in CLAUSE", class: "line negative", sign: "line", index: 21},],
                          columns: 3}


function drawLegend(svg, data) {
    var main = svg.append("g")
            .attr("class", "main")
            .attr("height", height - legend.height + margin.left + margin.right)
            .attr("width", width + margin.top + margin.bottom)
    var description = svg.append("g")
                .attr("class", "legend")
                .attr("height", legend.height + margin.left + margin.right)
                .attr("width", width + margin.bottom)
                .attr("transform", "translate(0, " + (height - legend.height) + ")")
    description.append("g").append("rect")
        .attr("height", legend.height )
        .attr("width", width)
        .attr("class", "legend")
        .attr("transform", "translate(" + margin.left + ",0)")
    var records = description.selectAll("g.record")
    .data(data.data).enter()
    .append("g")
    .attr("class", "record")
    .attr("transform", function(d, i) {
        console.log(height/data.columns + " " + Math.round(d.index/10));
        console.log("translate(" + (margin.left + (width/data.columns) * Math.round(d.index/10))  + "," + 100/data.data.length * (d.index % 2) + ")")
        return "translate(" + (margin.left + (width/data.columns) * Math.round(d.index/10))  + "," + (100/data.data.length * (d.index % 2)) + ")"
        })

    records.append("text")
        .attr("dy", function(d){return 16})
        .attr("dx", function(d){return 2 + 50})
        .style("fill", "black")
        .text(function(d) { return d.text; });

    svg.selectAll(".record")
        .filter(function(d){ return d.sign == "circle"? true : false})
        .append("circle")
        .attr("cy", function(d){return 10})
        .attr("cx", function(d){return 2 + 25})
        .attr("r", 6)
        .attr("class", function(d) { return d.class; })
    svg.selectAll(".record")
        .filter(function(d){
            return d.sign == "line"? true : false})
        .append("line")
        .attr("class", function(d) { return d.class; })
        .attr("x1", 17)
        .attr("x2", 35)
        .attr("y1", 10)
        .attr("y2", 10)
    return main
}

//
//var main = svgSpace.append("g")
//            .attr("class", "main")
//            .attr("height", height - legend.height + margin.left + margin.right)
//            .attr("width", width + margin.top + margin.bottom)
//
//var description = svgSpace.append("g")
//                .attr("class", "legend")
//                .attr("height", legend.height + margin.left + margin.right)
//                .attr("width", width + margin.bottom)
//                .attr("transform", "translate(0, " + (height - legend.height) + ")")

//description.append("g").append("rect")
//        .attr("height", legend.height )
//        .attr("width", width)
//        .attr("class", "legend")
//        .attr("transform", "translate(" + margin.left + ",0)")
//
//
//
//var records = description.selectAll("g.record")
//    .data(legendDescription.data).enter()
//    .append("g")
//    .attr("class", "record")
//    .attr("transform", function(d, i) {
//        console.log(height/legendDescription.columns + " " + Math.round(d.index/10));
//        console.log("translate(" + (margin.left + (width/legendDescription.columns) * Math.round(d.index/10))  + "," + 100/legendDescription.data.length * (d.index % 2) + ")")
//        return "translate(" + (margin.left + (width/legendDescription.columns) * Math.round(d.index/10))  + "," + (100/legendDescription.data.length * (d.index % 2)) + ")"
//        })
//
//records.append("text")
//    .attr("dy", function(d){return 16})
//    .attr("dx", function(d){return 2 + 50})
//    .style("fill", "black")
//    .text(function(d) { return d.text; });
//
//svgSpace.selectAll(".record")
//    .filter(function(d){ return d.sign == "circle"? true : false})
//    .append("circle")
//    .attr("cy", function(d){return 10})
//    .attr("cx", function(d){return 2 + 25})
//    .attr("r", 6)
//    .attr("class", function(d) { return d.class; })
//
//svgSpace.selectAll(".record")
//    .filter(function(d){
//        return d.sign == "line"? true : false})
//    .append("line")
//    .attr("class", function(d) { return d.class; })
//    .attr("x1", 17)
//    .attr("x2", 35)
//    .attr("y1", 10)
//    .attr("y2", 10)
//svg = main


var color = d3.scaleOrdinal(d3.schemeCategory20);

function edgeForce(axis, origin, strength) {
    var nodes;

    function force(alpha) {
        nodes.forEach(function(node) {
            Math.max(Math.abs(origin - node[axis]), node.r)

            var delta = strength / (origin - node[axis]) * alpha;
            var repulsion = node.r * strength / 10000

            node[axis] -= delta;
        })
    }

    force.initialize = function(_) {
        nodes = _;
    }

    return force;
}

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, (height - legend.height) / 2))
    .force('edge-left', edgeForce('x', 0, 1000))
    .force('edge-right', edgeForce('x', width, 1000))
    .force('edge-top', edgeForce('y', 0, 1000))
    .force('edge-bottom', edgeForce('y', height - legend.height, 1000))


function drawGraph(graph, svg) {

  var link = svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(graph.links)
      .enter().append("line")
      .attr("stroke-width", function(d) { return Math.sqrt(d.value); })
      .attr("class", function(d) { return d.direction});

  var node = svg.append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(graph.nodes)
      .enter().append("circle")
      .attr("r", 6)
      .attr("class", function(d) { return "node" + " " + d.group; })
      .attr("id", function(d) { return d.id; })
      .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended))
      .on("mouseover", fade(.1, true))
      .on("mouseout", fade(1, false));

  var label = svg.append("g")
      .attr("class", "labels")
      .selectAll("text")
      .data(graph.nodes)
      .enter().append("text")
      .attr("class", "label")
      .attr("id", function(d) { return d.id; })
      .style("visibility", "hidden")
      .text(function(d) { return d.id; })

  simulation
      .nodes(graph.nodes)
      .on("tick", ticked);

  simulation.force("link")
      .links(graph.links);

  var linkedByIndex = {};
  graph.links
      .forEach(function (d) {
        linkedByIndex[d.source.index + "," + d.target.index] = 1;
      });

  function isConnected(a, b) {
    return linkedByIndex[a.index + "," + b.index] || linkedByIndex[b.index + "," + a.index] || a.index == b.index;
  }

  function ticked() {
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });

    label
        .attr("x", function(d) { return d.x; })
        .attr("y", function (d) { return d.y; })
        .style("font-size", "12px").style("fill", "#4393c3");
  }

  function fade(opacity, active) {
      return function (d) {
        node
          .style("stroke-opacity", function (o) {
            thisOpacity = isConnected(d, o) ? 1 : opacity;
            this.setAttribute('fill-opacity', thisOpacity);
            if(active){
                if( isConnected(d, o)){
                    svg.select(".label#" + o.id).style("visibility", "visible")
                }
            } else {
                svg.select(".label#" + o.id).style("visibility", "hidden")
            }
            return thisOpacity;
          });
        link
          .style("stroke-opacity", opacity)
          .style("stroke-opacity", function (o) {
            return o.source === d || o.target === d ? 1 : opacity;
          });

      };
  }
}
data = [];
d3.json("/visual/repr/factor/" + selected, function(error, graph) {
    if (error) throw error;
    data = graph;
    d3.select(".problem_size.factor.non-satelited").html("Variables: " + graph.num_vars + ", Clauses: " + graph.num_clauses)
    svg = drawLegend(svgSpace, legendDescription)
    drawGraph(graph, svg);
});

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}

d3.select('#saveButtonFactor').on('click', function(){
    if(selected !== "None") {
        console.log("Save Factor Graph")
        var svgString = getSVGString(svgSpace.node());
        svgString2Image( svgString, 2*width, 2*height, 'png', save ); // passes Blob and filesize String to the callback

        function save( dataBlob, filesize ){
            saveAs( dataBlob, selected.split(".")[0] + '.png' ); // FileSaver.js function
        }
    } else {
        alert("NO DATA")
    }
});

// Below are the functions that handle actual exporting:
// getSVGString ( svgNode ) and svgString2Image( svgString, width, height, format, callback )
function getSVGString( svgNode ) {
	svgNode.setAttribute('xlink', 'http://www.w3.org/1999/xlink');
	var cssStyleText = getCSSStyles( svgNode );
	appendCSS( cssStyleText, svgNode );

	var serializer = new XMLSerializer();
	var svgString = serializer.serializeToString(svgNode);
	svgString = svgString.replace(/(\w+)?:?xlink=/g, 'xmlns:xlink='); // Fix root xlink without namespace
	svgString = svgString.replace(/NS\d+:href/g, 'xlink:href'); // Safari NS namespace fix

	return svgString;

	function getCSSStyles( parentElement ) {
		var selectorTextArr = [];

		// Add Parent element Id and Classes to the list
		selectorTextArr.push( '#'+parentElement.id );
		for (var c = 0; c < parentElement.classList.length; c++)
				if ( !contains('.'+parentElement.classList[c], selectorTextArr) )
					selectorTextArr.push( '.'+parentElement.classList[c] );

		// Add Children element Ids and Classes to the list
		var nodes = parentElement.getElementsByTagName("*");
		for (var i = 0; i < nodes.length; i++) {
			var id = nodes[i].id;
			if ( !contains('#'+id, selectorTextArr) )
				selectorTextArr.push( '#'+id );

			var classes = nodes[i].classList;
			for (var c = 0; c < classes.length; c++)
				if ( !contains('.'+classes[c], selectorTextArr) )
					selectorTextArr.push( '.'+classes[c] );
		}

		// Extract CSS Rules
		var extractedCSSText = "";
		for (var i = 0; i < document.styleSheets.length; i++) {
			var s = document.styleSheets[i];

			try {
			    if(!s.cssRules) continue;
			} catch( e ) {
		    		if(e.name !== 'SecurityError') throw e; // for Firefox
		    		continue;
		    	}

			var cssRules = s.cssRules;
			for (var r = 0; r < cssRules.length; r++) {
				if ( contains( cssRules[r].selectorText, selectorTextArr ) )
					extractedCSSText += cssRules[r].cssText;
			}
		}


		return extractedCSSText;

		function contains(str,arr) {
			return arr.indexOf( str ) === -1 ? false : true;
		}

	}

	function appendCSS( cssText, element ) {
		var styleElement = document.createElement("style");
		styleElement.setAttribute("type","text/css");
		styleElement.innerHTML = cssText;
		var refNode = element.hasChildNodes() ? element.children[0] : null;
		element.insertBefore( styleElement, refNode );
	}
}


function svgString2Image( svgString, width, height, format, callback ) {
	var format = format ? format : 'png';

	var imgsrc = 'data:image/svg+xml;base64,'+ btoa( unescape( encodeURIComponent( svgString ) ) ); // Convert SVG string to data URL

	var canvas = document.createElement("canvas");
	var context = canvas.getContext("2d");

	canvas.width = width;
	canvas.height = height;

	var image = new Image();
	image.onload = function() {
		context.clearRect ( 0, 0, width, height );
		context.drawImage(image, 0, 0, width, height);

		canvas.toBlob( function(blob) {
			var filesize = Math.round( blob.length/1024 ) + ' KB';
			if ( callback ) callback( blob, filesize );
		});


	};

	image.src = imgsrc;
}

})(d3);