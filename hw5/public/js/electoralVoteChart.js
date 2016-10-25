
/**
 * Constructor for the ElectoralVoteChart
 *
 * @param shiftChart an instance of the ShiftChart class
 */
function ElectoralVoteChart(shiftChart){

    var self = this;
    self.shiftChart = shiftChart;
    self.init();
};

/**
 * Initializes the svg elements required for this chart
 */
ElectoralVoteChart.prototype.init = function(){
    var self = this;
    self.margin = {top: 30, right: 20, bottom: 30, left: 50};

    //Gets access to the div element created for this chart from HTML
    var divelectoralVotes = d3.select("#electoral-vote").classed("content", true);
    self.svgBounds = divelectoralVotes.node().getBoundingClientRect();
    self.svgWidth = self.svgBounds.width - self.margin.left - self.margin.right;
    self.svgHeight = 150;

    //creates svg element within the div
    self.svg = divelectoralVotes.append("svg")
        .attr("width",self.svgWidth)
        .attr("height",self.svgHeight)
};

/**
 * Returns the class that needs to be assigned to an element.
 *
 * @param party an ID for the party that is being referred to.
 */
ElectoralVoteChart.prototype.chooseClass = function (party) {
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
 * Creates the stacked bar chart, text content and tool tips for electoral vote chart
 *
 * @param electionResult election data for the year selected
 * @param colorScale global quantile scale based on the winning margin between republicans and democrats
 */

ElectoralVoteChart.prototype.update = function(electionResult, colorScale){
    var self = this;

    // ******* TODO: PART II *******
    //Group the states based on the winning party for the state;
    //then sort them based on the margin of victory

    //Create the stacked bar chart.
    //Use the global color scale to color code the rectangles.
    //HINT: Use .electoralVotes class to style your bars.

    //Display total count of electoral votes won by the Democrat and Republican party
    //on top of the corresponding groups of bars.
    //HINT: Use the .electoralVoteText class to style your text elements;  Use this in combination with
    // chooseClass to get a color based on the party wherever necessary

    //Display a bar with minimal width in the center of the bar chart to indicate the 50% mark
    //HINT: Use .middlePoint class to style this bar.

    //Just above this, display the text mentioning the total number of electoral votes required
    // to win the elections throughout the country
    //HINT: Use .electoralVotesNote class to style this text element

    //HINT: Use the chooseClass method to style your elements based on party wherever necessary.

    var D_EV_Total = +electionResult[0].D_EV_Total;
    var R_EV_Total = +electionResult[0].R_EV_Total;
    var I_EV_Total = electionResult[0].I_EV_Total;

    var totalEVUSA =  D_EV_Total + R_EV_Total;

    if(I_EV_Total != "")
        totalEVUSA += +I_EV_Total;

    //console.log(totalEVUSA);
    var widthScale = d3.scaleLinear()
        .domain([0,totalEVUSA])
        .rangeRound([0,self.svgWidth]);

    var priority_order = ['I', 'D', 'R'];

    electionResult.sort(function(a,b){
        if(a.State_Winner != b.State_Winner)
            return priority_order.indexOf(a.State_Winner) - priority_order.indexOf(b.State_Winner);
        else{
            if(a.State_Winner == "I"){
                return d3.descending(parseFloat(a.Total_EV),parseFloat(b.Total_EV));
            }
            else if(a.State_Winner == "D"){
                return d3.descending(Math.abs(parseFloat(a.RD_Difference)),Math.abs(parseFloat(b.RD_Difference)));
            }else{
                return d3.ascending(parseFloat(a.RD_Difference),parseFloat(b.RD_Difference));
            }
        }

    });

    //console.log(electionResult);


    var group = self.svg.selectAll(".electoralVotes").data([1]);

    group = group.enter().append("g").classed("electoralVotes",true).merge(group);

    var stackedbar = group.selectAll("rect").data(electionResult);

    stackedbar.exit().remove();

    stackedbar = stackedbar.enter().append("rect")
        .attr("height",30)
        .attr("y",self.svgHeight/2)
        .merge(stackedbar);


    var width_till_now = 0;
    var prev = 0;

    stackedbar.attr("x",function(d,i){
        // if(i == 0){
        //     width_till_now = 0;
        //     prev = 0;
        // }
        var w = widthScale(parseInt(d.Total_EV));

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
        .attr("width", function(d){
            return widthScale(parseInt(d.Total_EV))-1;
        })
        .style("fill",function(d){
            if(d.State_Winner == 'I'){
                return "#45AD6A";
            }
            return colorScale(d.RD_Difference);
        });


    var data = [{key:"D",Total_EV:electionResult[0].D_EV_Total},
                {key:"R",Total_EV:electionResult[0].R_EV_Total}];

    if(electionResult[0].I_EV_Total != ""){
        var I_data = {key:"I",Total_EV:electionResult[0].I_EV_Total};
        data.splice(0,0,I_data);
    }


    var stackedtext = self.svg.selectAll("text").data(data);

    stackedtext.exit().remove();

    stackedtext = stackedtext.enter().append("text").merge(stackedtext);


    var pos = 0;

    for(var i = 0; i < electionResult.length;i++){
        if(electionResult[i].State_Winner == 'D')
            break;
        pos += widthScale(parseInt(electionResult[i].Total_EV));

    }

    stackedtext.attr("class",function(d){
        return "electoralVoteText "+self.chooseClass(d.key);
    })
        .text(function(d){
            return parseInt(d.Total_EV);

        })
        .attr("x",function(d,i) {
            if (d.key == 'R') {
                return self.svgWidth;
            }
            else{
                if(data.length == 3){
                    if(d.key == 'I')
                        return 0;
                    else{
                        return pos;
                    }
                }else{
                    return 0;
                }
            }
        })
        .attr("y",self.svgHeight/2);

    self.svg.append("rect")
        .attr("width",3)
        .attr("height",40)
        .attr("x",self.svgWidth/2)
        .attr("y",self.svgHeight/2 - 5)
        .classed("middlePoint",true);

    self.svg.append("text")
        .classed("electoralVotesNote",true)
        .attr("x",self.svgWidth/2)
        .attr("y",self.svgHeight/2 - 5)
        .text("Electoral Vote (270 needed to win)");
    //******* TODO: PART V *******
    //Implement brush on the bar chart created above.
    //Implement a call back method to handle the brush end event.
    //Call the update method of shiftChart and pass the data corresponding to brush selection.
    //HINT: Use the .brush class to style the brush.


    //http://bl.ocks.org/mbostock/34f08d5e11952a80609169b7917d4172
    function brushed(){
        //on work if there is an event or a selection
        if(!d3.event.sourceEvent) return;
        if(!d3.event.selection) return;
        var s = d3.event.selection;

        var value = 0;
        var prev = 0;
        var selected_states = [];
        for(var j = 0; j<electionResult.length; j++){
            var d = electionResult[j];
            prev = value;
            value += widthScale(d.Total_EV);
            if(s[0] <= prev && value <= s[1])
                selected_states.push(d);
        }
        self.shiftChart.update(selected_states);
    }

    var width = self.svgWidth;
    var height = self.svgHeight;

    var brush = d3.brushX().extent([[0,height/2-10],[width,height/2+40]]).on("end", brushed);

    self.svg.select(".brush").call(brush.move, null);

    self.svg.selectAll(".brush").data([1]).enter().append("g").attr("class", "brush").call(brush);

};
