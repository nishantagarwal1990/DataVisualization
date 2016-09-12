/*globals alert, document, d3, console*/
// These keep JSHint quiet if you're using it (highly recommended!)

function staircase() {
    // ****** TODO: PART II ******
    var firstbar = document.getElementById("abar");
    var all_rect = firstbar.getElementsByTagName("rect");
    var heights = [];
    //console.log(all_rect)
    for(var i =0; i<all_rect.length;i++){
        heights.push(parseFloat(all_rect[i].getAttribute("height")));
    }
    heights.sort(function(a,b){ return a-b; });
    //console.log(heights);
    //firstbar.setAttribute("transform","translate(0,300) scale(1,-1)");
    //var z = 0;
    for(var i=0;i<all_rect.length;i++){
        //all_rect[i].setAttribute("width",String(20));
        //all_rect[i].removeAttribute("y");
        //all_rect[i].setAttribute("x",z.toString());
        all_rect[i].setAttribute("height",heights[i].toString());
        //z += 20;
    }
}

function update(error, data) {
    if (error !== null) {
        alert("Couldn't load the dataset!");
    } else {
        // D3 loads all CSV data as strings;
        // while Javascript is pretty smart
        // about interpreting strings as
        // numbers when you do things like
        // multiplication, it will still
        // treat them as strings where it makes
        // sense (e.g. adding strings will
        // concatenate them, not add the values
        // together, or comparing strings
        // will do string comparison, not
        // numeric comparison).

        // We need to explicitly convert values
        // to numbers so that comparisons work
        // when we call d3.max()
        data.forEach(function (d) {
            d.a = parseInt(d.a);
            d.b = parseFloat(d.b);
        });
    }

    // Set up the scales
    var aScale = d3.scaleLinear()
        .domain([0, d3.max(data, function (d) {
            return d.a;
        })])
        .range([0, 300]);
    var bScale = d3.scaleLinear()
        .domain([0, d3.max(data, function (d) {
            return d.b;
        })])
        .range([0, 300]);
    var iScale = d3.scaleLinear()
        .domain([0, data.length])
        .range([0, 300]);

    // ****** TODO: PART III (you will also edit in PART V) ******

    // TODO: Select and update the 'a' bar chart bars
    var abar = d3.select("#abar");
    var arects = abar.selectAll("rect")
        .data(data);

    //From class tutorial
    arects.exit()
        .style("opacity",1)
        .transition()
        .duration(2000)
        .style("opacity",0)
        .remove();

    arects = arects.enter().append("rect")
        .attr("width",20)
        .merge(arects);



    arects.attr("x",function(d,i){ return 20 * i;})
        .transition()
        .duration(2000)
        .attr("height",function(d){ return (d.a*20).toFixed(1);})
        .style("opacity",1);


    // TODO: Select and update the 'b' bar chart bars
    var bbar = d3.select("#bbar");
    var brects = bbar.selectAll("rect")
        .data(data);

    brects.exit()
        .style("opacity",1)
        .transition()
        .duration(2000)
        .style("opacity",0)
        .remove();

    brects = brects.enter().append("rect")
        .attr("width",20)
        .merge(brects);


    brects.attr("x",function(d,i){ return 20 * i;})
        .transition()
        .duration(2000)
        .attr("height",function(d){ return (d.b*20).toFixed(1);})
        .style("opacity",1);


    // TODO: Select and update the 'a' line chart path using this line generator
    var aLineGenerator = d3.line()
        .x(function (d, i) {
            return iScale(i);
        })
        .y(function (d) {
            return aScale(d.a);
        });


    var aline = d3.select("#aline");

    aline.select("path")
        .transition()
        .duration(2000)
        .attr("d", aLineGenerator(data));



    // TODO: Select and update the 'b' line chart path (create your own generator)
    var bLineGenerator = d3.line()
        .x(function (d, i) {
            return iScale(i);
        })
        .y(function (d) {
            return bScale(d.b);
        });


    var bline = d3.select("#bline");

    bline.select("path")
        .transition()
        .duration(2000)
        .attr("d", bLineGenerator(data));

    // TODO: Select and update the 'a' area chart path using this line generator
    var aAreaGenerator = d3.area()
        .x(function (d, i) {
            return iScale(i);
        })
        .y0(0)
        .y1(function (d) {
            return aScale(d.a);
        });

    //d3.select("#aarea").selectAll("*").remove()
    var aarea = d3.select("#aarea");
    aarea.select("path")
        .transition()
        .duration(2000)
        .attr("d", aAreaGenerator(data));

    // TODO: Select and update the 'b' area chart path (create your own generator)
    var bAreaGenerator = d3.area()
        .x(function (d, i) {
            return iScale(i);
        })
        .y0(0)
        .y1(function (d) {
            return bScale(d.b);
        });

    //d3.select("#barea").selectAll("*").remove()
    var barea = d3.select("#barea");
    barea.select("path")
        .transition()
        .duration(2000)
        .attr("d", bAreaGenerator(data));

    // TODO: Select and update the scatterplot points

    /*Used the below link to understand how tool tip could be created on d3 graph
     http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html*/
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    var scatterplot = d3.select("#scatterplot");
    var circles = scatterplot.selectAll("circle")
        .data(data);

    circles.exit()
        .style("opacity",1)
        .transition()
        .duration(3000)
        .style("opacity",0)
        .remove();

    circles = circles
        .enter().append("circle")
        .attr("r",5)
        .merge(circles);



    /*Used the below link to understand how tool tip could be created on d3 graph
     http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html*/
    circles.on("click",function(d){
            console.log("x:"+(d.a*20).toFixed(1) + ", y:"+ (d.b*20).toFixed(1));
        })
        .on("mouseover", function(d) {
            tooltip.style("opacity",1);
            tooltip.html("x:"+(d.a*20).toFixed(1)+" y:"+ (d.b*20).toFixed(1))
                .style("left", (d3.event.pageX) - 30 + "px")
                .style("top", (d3.event.pageY)- 50 + "px");
        })
        .on("mouseout", function(d) {
            tooltip.style("opacity", 0);
        })
        .transition()
        .duration(3000)
        .attr("cx",function(d){ return (d.a*20).toFixed(1);})
        .attr("cy",function(d){ return (d.b*20).toFixed(1);})
        .style("opacity",1);




    // ****** TODO: PART IV ******
    //Learnt from W3schools.com
    var rects = document.getElementsByTagName("rect");
    for(var ndx = 0; ndx < rects.length; ndx++){
        rects[ndx].addEventListener("mouseover",mouseOver,false);
        rects[ndx].addEventListener("mouseout",mouseOut,false);
    }

    function mouseOver() {
        this.style.fill = "orange"
    }

    function mouseOut() {
        this.style.fill = "steelblue"
    }
}


function changeData() {
    // // Load the file indicated by the select menu
    var dataFile = document.getElementById('dataset').value;
    if (document.getElementById('random').checked) {
        randomSubset();
    }
    else{
        d3.csv('data/' + dataFile + '.csv', update);
    }
}

function randomSubset() {
    // Load the file indicated by the select menu,
    // and then slice out a random chunk before
    // passing the data to update()
    var dataFile = document.getElementById('dataset').value;
    if (document.getElementById('random').checked) {
        d3.csv('data/' + dataFile + '.csv', function (error, data) {
            var subset = [];
            data.forEach(function (d) {
                if (Math.random() > 0.5) {
                    subset.push(d);
                }
            });
            update(error, subset);
        });
    }
    else{
        changeData();

    }
}