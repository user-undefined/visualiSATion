!(function (d3) {

$("#factor_satelited").empty();
console.log(selected)


var svg = d3.select("#factor_satelited"),
    width = +svg.attr("width"),
    height = +svg.attr("height");
console.log(svg)
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
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force('edge-left', edgeForce('x', 0, 1000))
    .force('edge-right', edgeForce('x', width, 1000))
    .force('edge-top', edgeForce('y', 0, 1000))
    .force('edge-bottom', edgeForce('y', height, 1000))


function drawGraph(graph) {
  console.log(graph)
  console.log(graph.links)

  var link = svg.append("g")
      .attr("class", "links")
    .selectAll("line")
    .data(graph.links)
    .enter().append("line")
      .attr("stroke-width", function(d) { return Math.sqrt(d.value); })
      .attr("class", function(d) { return d.direction});

  console.log(link)

  var node = svg.append("g")
      .attr("class", "nodes")
    .selectAll("circle")
    .data(graph.nodes)
    .enter().append("circle")
      .attr("r", 6)
      .attr("fill", function(d) { return color(d.group); })
      .attr("class", "node")
      .attr("id", function(d) { return d.id; })
      .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended))
      .on("mouseover", fade(.1))
      .on("mouseout", fade(.6));

  console.log(graph.nodes)
  console.log(node)

  var label = svg.append("g")
  .attr("class", "labels")
  .selectAll("text")
  .data(graph.nodes)
  .enter().append("text")
    .attr("class", "label")
    .text(function(d) { return d.id; });


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

  function fade(opacity) {
      return function (d) {
        node
          .style("stroke-opacity", function (o) {
            thisOpacity = isConnected(d, o) ? 0.6 : opacity;
            this.setAttribute('fill-opacity', thisOpacity);
            return thisOpacity;
          });
        link
          .style("stroke-opacity", opacity)
          .style("stroke-opacity", function (o) {
            return o.source === d || o.target === d ? 0.6 : opacity;
          });
      };
  }
}
data = [];
d3.json("/visual/repr/factor/satelited/" + selected, function(error, graph) {
    if (error) throw error;
    data = graph;
    drawGraph(graph);

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

})(d3);