// Global var for FIFA world cup data
var allWorldCupData;


/**
 * Render and update the bar chart based on the selection of the data type in the drop-down box
 *
 * @param selectedDimension a string specifying which dimension to render in the bar chart
 */
function updateBarChart(selectedDimension) {

    var svgBounds = d3.select("#barChart").node().getBoundingClientRect(),
        xAxisWidth = 60,
        yAxisHeight = 70;


    // ******* TODO: PART I *******
    // Create the x and y scales; make
    // sure to leave room for the axes

    var xscale = d3.scaleBand()
        .range([svgBounds.width-xAxisWidth,0],.1);
    xscale.domain(allWorldCupData.map(function(d){
        return d.year;
    }));


    var yscale = d3.scaleLinear()
        .domain([0, d3.max(allWorldCupData, function (d) {
            return d[selectedDimension];
        })])
        .range([0,svgBounds.height-yAxisHeight]);

    // Create colorScale
    var colorScale = d3.scaleLinear()
        .domain([d3.min(allWorldCupData, function(d){
            return d[selectedDimension];}),0, d3.max(allWorldCupData, function (d) {
            return d[selectedDimension];
        })])
        .range(["steelblue","blue","navy"]);

    // Create the axes (hint: use #xAxis and #yAxis)
    var xAxis = d3.axisBottom();
    xAxis.scale(xscale);


    d3.select("#xAxis")
        .attr("transform","translate(60,350)")
        .call(xAxis);

    d3.select("#xAxis")
        .selectAll(".tick")
        .select("text")
        .attr("transform","translate(-15,30) rotate(-90)");



    var yAxis = d3.axisLeft();

    yAxis.scale(yscale);

    d3.select("#yAxis")
        .attr("transform","translate(60,350) scale(1,-1)")
        .transition()
        .duration(2000)
        .call(yAxis);

    d3.select("#yAxis")
        .selectAll(".tick")
        .select("text")
        .attr("transform","scale(1,-1)");

    // Create the bars (hint: use #bars)
    var barsgroup = d3.select("#bars");
    barsgroup.attr("transform","translate(60,350) scale(1,-1)");

    var bars = barsgroup.selectAll("rect")
        .data(allWorldCupData);

   bars = bars.enter()
       .append("rect")
       .merge(bars);

    bars.attr("x",function(d,i){
        return 22*(allWorldCupData.length - i -1)+2;
    })
        .attr("width","20")
        .transition()
        .duration(2000)
        .attr("height",function (d) {
            return yscale(d[selectedDimension]);
        })
        .attr("fill",function(d){
            return colorScale(d[selectedDimension])
        });


    // ******* TODO: PART II *******

    // Implement how the bars respond to click events
    // Color the selected bar to indicate is has been selected.
    // Make sure only the selected bar has this new color.

    // Call the necessary update functions for when a user clicks on a bar.
    // Note: think about what you want to update when a different bar is selected.

    bars.on("click",function(d){
        d3.select(".selected").classed("selected", false);
        d3.select(this).classed("selected",true);
        updateInfo(d);
        updateMap(d);
    });


}

/**
 *  Check the drop-down box for the currently selected data type and update the bar chart accordingly.
 *
 *  There are 4 attributes that can be selected:
 *  goals, matches, attendance and teams.
 */
function chooseData() {

    // ******* TODO: PART I *******
    //Changed the selected data when a user selects a different
    // menu item from the drop down.
    var select_data = document.getElementById('dataset').value;
    updateBarChart(select_data);
}

/**
 * Update the info panel to show info about the currently selected world cup
 *
 * @param oneWorldCup the currently selected world cup
 */
function updateInfo(oneWorldCup) {

    // ******* TODO: PART III *******

    // Update the text elements in the infoBox to reflect:
    // World Cup Title, host, winner, runner_up, and all participating teams that year

    // Hint: For the list of teams, you can create an list element for each team.
    // Hint: Select the appropriate ids to update the text content.

    var view = d3.select(".view");
    var cup_title = view.select("#edition");
    var host = view.select("#host");
    var winner = view.select("#winner");
    var silver = view.select("#silver");
    var teams_node = view.select("#teams");


    cup_title.text(oneWorldCup.EDITION);
    host.text(oneWorldCup.host);
    winner.text(oneWorldCup.winner);
    silver.text(oneWorldCup.runner_up);


    var teams_list =  teams_node.selectAll("ul").data([1]);

    teams_list = teams_list
        .enter()
        .append("ul")
        .merge(teams_list);


    var teams = teams_list.selectAll("li").data(oneWorldCup.teams_names);

    teams.exit()
        .remove();

    teams = teams
        .enter()
        .append("li")
        .merge(teams);

    teams.transition()
        .duration(2000)
        .text(function(d){
        return d;
    });



}

/**
 * Renders and updated the map and the highlights on top of it
 *
 * @param the json data with the shape of all countries
 */
function drawMap(world) {

    //(note that projection is global!
    // updateMap() will need it to add the winner/runner_up markers.)

    projection = d3.geoConicConformal().scale(150).translate([400, 350]);

    // ******* TODO: PART IV *******

    // Draw the background (country outlines; hint: use #map)
    // Make sure and add gridlines to the map

    // Hint: assign an id to each country path to make it easier to select afterwards
    // we suggest you use the variable in the data element's .id field to set the id

    // Make sure and give your paths the appropriate class (see the .css selectors at
    // the top of the provided html file)


    //Learnt from example
    //http://bl.ocks.org/mbostock/3734321
    var path = d3.geoPath()
        .projection(projection);

    var graticule = d3.geoGraticule();

    var map = d3.select("#map");

    map.append("path")
        .datum(graticule)
        .attr("class", "grat")
        .attr("fill","none")
        .attr("d", path);

    var countries_data = topojson.feature(world, world.objects.countries);

    var countries = countries_data.features;

    //var new_panel = d3.select("body").select("div").classed("new_panel",true);

    for(var i = 0; i<countries.length; i++) {
        //console.log(countries[i].id);
        map.insert("path", ".grat")
            .datum(countries[i])
            .attr("class", "countries")
            .attr("id",countries[i].id)
            .attr("d", path);/*
            .on("click",function(d){
                console.log(d);
                var id = d.id;
                var cup_list = [];
                var winner_years = [];
                var runner_up_years = [];
                var name = "";
                for(var i = 0; i<allWorldCupData.length; i++) {
                    var ndx = allWorldCupData[i].teams_iso.indexOf(id);
                    var year = allWorldCupData[i].year;
                    if(ndx != -1) {
                        cup_list.push(year);
                        if (!name.length) {
                            name = allWorldCupData[i].teams_names[ndx];
                        }
                        if (allWorldCupData[i].winner == name) {
                            winner_years.push(year);
                        }
                        if (allWorldCupData[i].runner_up == name) {
                            runner_up_years.push(year);
                        }
                    }
                }
                //console.log(cup_list);
                //console.log(winner_years);
                //console.log(runner_up_years);


                if(cup_list.length != 0) {
                    new_panel.attr("id", "details")
                        .append("h2")
                        .attr("id", "edition")
                        .text(name);
                   var span = new_panel.append("h3")
                            .text("Participating Years")
                            .append("span")
                            .attr("id","teams");

                    var years_list =  span.selectAll("ul").data([1]);

                    years_list = years_list
                        .enter()
                        .append("ul")
                        .merge(years_list);


                    var years = years_list.selectAll("li").data(cup_list);

                    years.exit()
                        .remove();

                    years = years
                        .enter()
                        .append("li")
                        .merge(years);

                    years.transition()
                        .duration(2000)
                        .text(function(d){
                            return d;
                        })
                        .attr("color",function(d){
                            if(winner_years.indexOf(d)){
                                return "green";
                            }
                            else if(runner_up_years.indexOf(d)){
                                return "blue";
                            }
                            else{
                                return "black";
                            }
                        });
                }
            });*/
    }

}

/**
 * Clears the map
 */
function clearMap() {

    // ******* TODO: PART V*******
    //Clear the map of any colors/markers; You can do this with inline styling or by
    //defining a class style in styles.css

    //Hint: If you followed our suggestion of using classes to style
    //the colors and markers for hosts/teams/winners, you can use
    //d3 selection and .classed to set these classes on and off here.

    d3.select("#map")
        .select(".host")
        .classed("host",false)
        .classed("countries",true);

    d3.select("#points")
        .select(".gold")
        .classed("gold",false);

    d3.select("#points")
        .select(".silver")
        .classed("silver",false);

    d3.select("#map")
        .selectAll(".team")
        .classed("team",false)
        .classed("countries",true);

}


/**
 * Update Map with info for a specific FIFA World Cup
 * @param the data for one specific world cup
 */
function updateMap(worldcupData) {

    //Clear any previous selections;
    clearMap();

    // ******* TODO: PART V *******

    // Add a marker for the winner and runner up to the map.

    //Hint: remember we have a conveniently labeled class called .winner
    // as well as a .silver. These have styling attributes for the two
    //markers.


    //Select the host country and change it's color accordingly.

    //Iterate through all participating teams and change their color as well.

    //We strongly suggest using classes to style the selected countries.

    var host = worldcupData.host;
    var host_iso = worldcupData.host_country_code;
    var teams_iso = worldcupData.teams_iso;

    d3.select("#"+host_iso)
        .classed("countries",false)
        .classed("host",true);

    var points = d3.select("#points");

    //Learnt from example
    //http://bl.ocks.org/phil-pedruco/7745589
    var winners = points.selectAll("circle").data([worldcupData.win_pos,worldcupData.ru_pos]);


    winners = winners.enter()
            .append("circle")
            .attr("r",8)
            .merge(winners);

    winners.attr("r",8)
        .attr("cx",function(d){
            return projection(d)[0];
        })
        .attr("cy",function(d){
            return projection(d)[1];
        })
        .attr("class",function(d,i){
            var class_name = "";
            if(i == 0)
                class_name =  "gold";
            if(i == 1)
                class_name =  "silver";

            return class_name;
        });


    for(var i = 0; i<teams_iso.length; i++){
        d3.select("#"+teams_iso[i])
            .classed("countries",false)
            .classed("team",true);
    }


}


/* DATA LOADING */

// This is where execution begins; everything
// above this is just function definitions
// (nothing actually happens)

//Load in json data to make map
d3.json("data/world.json", function (error, world) {
    if (error) throw error;
    drawMap(world);
});

// Load CSV file
d3.csv("data/fifa-world-cup.csv", function (error, csv) {

    csv.forEach(function (d) {

        // Convert numeric values to 'numbers'
        d.year = +d.YEAR;
        d.teams = +d.TEAMS;
        d.matches = +d.MATCHES;
        d.goals = +d.GOALS;
        d.avg_goals = +d.AVERAGE_GOALS;
        d.attendance = +d.AVERAGE_ATTENDANCE;
        //Lat and Lons of gold and silver medals teams
        d.win_pos = [+d.WIN_LON, +d.WIN_LAT];
        d.ru_pos = [+d.RUP_LON, +d.RUP_LAT];

        //Break up lists into javascript arrays
        d.teams_iso = d3.csvParse(d.TEAM_LIST).columns;
        d.teams_names = d3.csvParse(d.TEAM_NAMES).columns;

    });

    // Store csv data in a global variable
    allWorldCupData = csv;
    // Draw the Bar chart for the first time
    updateBarChart('attendance');
});
