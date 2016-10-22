/**
 * Constructor for the Vote Percentage Chart
 */
function VotePercentageChart(){

    var self = this;
    self.init();
};

/**
 * Initializes the svg elements required for this chart
 */
VotePercentageChart.prototype.init = function(){
    var self = this;
    self.margin = {top: 30, right: 20, bottom: 30, left: 50};
    var divvotesPercentage = d3.select("#votes-percentage").classed("content", true);

    //Gets access to the div element created for this chart from HTML
    self.svgBounds = divvotesPercentage.node().getBoundingClientRect();
    self.svgWidth = self.svgBounds.width - self.margin.left - self.margin.right;
    self.svgHeight = 200;

    //creates svg element within the div
    self.svg = divvotesPercentage.append("svg")
        .attr("width",self.svgWidth)
        .attr("height",self.svgHeight)
};

/**
 * Returns the class that needs to be assigned to an element.
 *
 * @param party an ID for the party that is being referred to.
 */
VotePercentageChart.prototype.chooseClass = function (party) {
    var self = this;
    if (party == "R"){
        return "republican";
    }
    else if (party == "D"){
        return "democrat";
    }
    else if (party == "I"){
        return "independent";
    }
}

/**
 * Renders the HTML content for tool tip
 *
 * @param tooltip_data information that needs to be populated in the tool tip
 * @return text HTML content for toop tip
 */
VotePercentageChart.prototype.tooltip_render = function (tooltip_data) {
    var self = this;
    var text = "<ul>";
    tooltip_data.result.forEach(function(row){
        text += "<li class = " + self.chooseClass(row.party)+ ">" + row.nominee+":\t\t"+row.votecount+"("+row.percentage+"%)" + "</li>"
    });

    return text;
}

/**
 * Creates the stacked bar chart, text content and tool tips for Vote Percentage chart
 *
 * @param electionResult election data for the year selected
 */
VotePercentageChart.prototype.update = function(electionResult,colorScale){
    var self = this;

    //for reference:https://github.com/Caged/d3-tip
    //Use this tool tip element to handle any hover over the chart
    tip = d3.tip().attr('class', 'd3-tip')
        .direction('s')
        .offset(function() {
            return [0,0];
        })
        .html(function(d) {
            // populate data in the following format
            console.log(d);
              tooltip_data = {
              "result": d
              };
              //console.log(tooltip_data)
             // pass this as an argument to the tooltip_render function then,
             // return the HTML content returned from that method.

            return self.tooltip_render(tooltip_data);
        });


    // ******* TODO: PART III *******

    //Create the stacked bar chart.
    //Use the global color scale to color code the rectangles.
    //HINT: Use .votesPercentage class to style your bars.

    //Display the total percentage of votes won by each party
    //on top of the corresponding groups of bars.
    //HINT: Use the .votesPercentageText class to style your text elements;  Use this in combination with
    // chooseClass to get a color based on the party wherever necessary

    //Display a bar with minimal width in the center of the bar chart to indicate the 50% mark
    //HINT: Use .middlePoint class to style this bar.

    //Just above this, display the text mentioning details about this mark on top of this bar
    //HINT: Use .votesPercentageNote class to style this text element

    //Call the tool tip on hover over the bars to display stateName, count of electoral votes.
    //then, vote percentage and number of votes won by each party.

    //HINT: Use the chooseClass method to style your elements based on party wherever necessary.

    var widthScale = d3.scaleLinear()
        .domain([0,100])
        .rangeRound([0,self.svgWidth]);

    var D_PopularPercentage = parseFloat(electionResult[0].D_PopularPercentage);
    var R_PopularPercentage = parseFloat(electionResult[0].R_PopularPercentage);
    var I_PopularPercentage = electionResult[0].I_PopularPercentage;
    var I_Nominee = electionResult[0].I_Nominee_prop;
    var D_Nominee = electionResult[0].D_Nominee_prop;
    var R_Nominee = electionResult[0].R_Nominee_prop;
    var I_Votes_Total = electionResult[0].I_Votes_Total;
    var D_Votes_Total = electionResult[0].D_Votes_Total;
    var R_Votes_Total = electionResult[0].R_Votes_Total;


    var data;

    if(I_PopularPercentage != "") {
        data = [{party:"I",percentage:parseFloat(I_PopularPercentage),nominee:I_Nominee,votecount:I_Votes_Total},
                {party:"D",percentage:D_PopularPercentage,nominee:D_Nominee,votecount:D_Votes_Total},
                {party:"R",percentage:R_PopularPercentage,nominee:R_Nominee,votecount:R_Votes_Total}
                ];
    }else{
        data = [{party:"D",percentage:D_PopularPercentage,nominee:D_Nominee,votecount:D_Votes_Total},
                {party:"R",percentage:R_PopularPercentage,nominee:R_Nominee,votecount:R_Votes_Total}
                ];
    }

    //self.svg.call(tip);

    var stackedgroups = self.svg.selectAll("g").data(data);

    stackedgroups.exit().remove();

    stackedgroups = stackedgroups.enter().append("g").merge(stackedgroups);

    var stackedbars = stackedgroups.selectAll("rect").data(function(d){
        return [d];
    });

    stackedbars.exit().remove();

    stackedbars = stackedbars.enter().append("rect")
        .attr("height",30)
        .attr("y",self.svgHeight/2)
        .merge(stackedbars);

    stackedbars.call(tip);
    var width_till_now = 0;
    var prev = 0;

    stackedbars.attr("width",function(d){
        return widthScale(d.percentage)-1;
    })
        .attr("x",function(d,i){
            var w = widthScale(d.percentage);

            if(width_till_now == 0) {
                width_till_now += w;
                return 0;
            }
            else{
                width_till_now += prev ;
                prev = w;
                return width_till_now;
            }
        })
        .attr("class",function(d){
            return "votesPercentage "+self.chooseClass(d.party);
        });
        // .on("mouseover",tip.show)
        // .on("mouseout",tip.hide);

    var stackedtext = stackedgroups.selectAll("text").data(function(d){
        return [{party:d.party,nominee:d.nominee,percentage:d.percentage},
                {party:d.party,nominee:d.nominee,percentage:d.percentage}];
    });

    stackedtext.exit().remove();

    stackedtext = stackedtext.enter().append("text").merge(stackedtext);

    //console.log(stackedtext);

    stackedtext.attr("class",function(d){
        return "votesPercentageText "+self.chooseClass(d.party);
    })
        .text(function(d,i){
            if(i==0)
                return d.percentage+"%";
            else
                return d.nominee;
        })
        .attr("x",function(d,i) {
            if (d.party == 'R') {
                if(data.length == 2)
                    return self.svgWidth - 20;
                return self.svgWidth-10;
            }
            else {
                if (data.length == 3) {
                    if (d.party == 'I')
                        return 0;
                    else {
                        if(i==1)
                            return widthScale(data[0].percentage) + (widthScale(data[1].percentage)/2) - 20;
                        return widthScale(data[0].percentage);
                    }
                } else {
                    return 0;
                }
            }
        })
        .attr("text-anchor",function(d,i){
            if(d.party == "D" && i == 1)
                return "middle";
        })
        .attr("y",function(d,i){
            if(i == 1)
                return (self.svgHeight/2)-40;
            return self.svgHeight/2;
        });

    self.svg.append("rect")
        .attr("width",3)
        .attr("height",40)
        .attr("x",self.svgWidth/2)
        .attr("y",self.svgHeight/2 - 5)
        .classed("middlePoint",true);

    self.svg.append("text")
        .classed("votesPercentageNote",true)
        .attr("x",self.svgWidth/2)
        .attr("y",self.svgHeight/2 - 5)
        .text("Popular Vote (50%)");
};
