
!(function (d3) {

$("#interaction").empty();

  var svg = d3.select("#interaction"),
    width = +svg.attr("width"),
    height = +svg.attr("height"),
    radius = 6;

  var color = d3.scaleOrdinal(d3.schemeCategory20);

  var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function (d) { return d.id; }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force('edge-left', edgeForce('x', 0, 1000))
    .force('edge-right', edgeForce('x', width, 1000))
    .force('edge-top', edgeForce('y', 0, 1000))
    .force('edge-bottom', edgeForce('y', height, 1000));

  d3.json("/visual/repr/interaction/" + selected, function (error, graph) {
    if (error) throw error;
    d3.select(".problem_size.interaction.non-satelited").html("Variables: " + graph.num_vars + ", Clauses: " + graph.num_clauses)

    var link = svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(graph.links)
      .enter().append("line")
      .attr("stroke-width", function (d) { return Math.sqrt(d.value); })
      .attr("class", function(d){return "neutral"});

    var node = svg.append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(graph.nodes)
      .enter().append("circle")
      .attr("r", 6)
      .attr("fill", function (d) { return color(d.group); })
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended))
      .on("mouseover", fade(.1))
      .on("mouseout", fade(1));

    node.append("title")
      .text(function (d) { return d.id; });

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
        .attr("x1", function (d) { return d.source.x; })
        .attr("y1", function (d) { return d.source.y; })
        .attr("x2", function (d) { return d.target.x; })
        .attr("y2", function (d) { return d.target.y; });

      node
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
    }

    function fade(opacity) {
      return function (d) {
        node
          .style("stroke-opacity", function (o) {
            thisOpacity = isConnected(d, o) ? 1 : opacity;
            this.setAttribute('fill-opacity', thisOpacity);
            return thisOpacity;
          });
        link
          .style("stroke-opacity", opacity)
          .style("stroke-opacity", function (o) {
            return o.source === d || o.target === d ? 1 : opacity;
          });
      };
    }

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

})(d3);