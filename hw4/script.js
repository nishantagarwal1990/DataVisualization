/** Global var to store all match data for the 2014 Fifa cup */
var teamData;

/** Global var for list of all elements that will populate the table.*/
var tableElements;


/** Variables to be used when sizing the svgs in the table cells.*/
var cellWidth = 70,
    cellHeight = 20,
    cellBuffer = 15,
    barHeight = 20;

/**Set variables for commonly accessed data columns*/
var goalsMadeHeader = 'Goals Made',
    goalsConcededHeader = 'Goals Conceded',
    winsHeader = 'Wins',
    lossesHeader = 'Losses',
    resultHeader = 'Result',
    totalgamesHeader = 'TotalGames',
    resultlabelHeader = 'label',
    deltagoalsHeader = 'Delta Goals';

/** Setup the scales*/
var goalScale = d3.scaleLinear()
    .range([cellBuffer, 2 * cellWidth - cellBuffer]);

/**Used for games/wins/losses*/
var gameScale = d3.scaleLinear()
    .range([0, cellWidth - cellBuffer]);

/**Color scales*/
/**For aggregate columns*/
var aggregateColorScale = d3.scaleLinear()
    .range(['#ece2f0', '#016450']);

/**For goal Column*/
var goalColorScale = d3.scaleQuantize()
    .domain([-1, 1])
    .range(['#cb181d', '#034e7b']);

/**json Object to convert between rounds/results and ranking value*/
var rank = {
    "Winner": 7,
    "Runner-Up": 6,
    'Third Place': 5,
    'Fourth Place': 4,
    'Semi Finals': 3,
    'Quarter Finals': 2,
    'Round of Sixteen': 1,
    'Group': 0
};



//For the HACKER version, comment out this call to d3.json and implement the commented out
// d3.csv call below.

d3.json('data/fifa-matches.json',function(error,data){
    teamData = data;
    createTable();
    updateTable();
})


// // ********************** HACKER VERSION ***************************
// /**
//  * Loads in fifa-matches.csv file, aggregates the data into the correct format,
//  * then calls the appropriate functions to create and populate the table.
//  *
//  */
// d3.csv("data/fifa-matches.csv", function (error, csvData) {
//
//    // ******* TODO: PART I *******
//
//
// });
// // ********************** END HACKER VERSION ***************************

/**
 * Loads in the tree information from fifa-tree.csv and calls createTree(csvData) to render the tree.
 *
 */
d3.csv("data/fifa-tree.csv", function (error, csvData) {

    //Create a unique "id" field for each game
    csvData.forEach(function (d, i) {
        d.id = d.Team + d.Opponent + i;
    });

    createTree(csvData);
});

/**
 * Creates a table skeleton including headers that when clicked allow you to sort the table by the chosen attribute.
 * Also calculates aggregate values of goals, wins, losses and total games as a function of country.
 *
 */
function createTable() {

// ******* TODO: PART II *******
    //console.log(teamData);

    goalScale.domain([0,d3.max(teamData,function(d){
        //console.log(d.value["Goals Made"]);
        return Math.max(d.value[goalsMadeHeader],d.value[goalsConcededHeader]);
    })]);

    gameScale.domain([0,d3.max(teamData,function(d){
        //console.log(d.value["Goals Made"]);
        return d.value[totalgamesHeader];
    })]);

    aggregateColorScale.domain([0,d3.max(teamData,function(d){
        //console.log(d.value["Goals Made"]);
        return d.value[totalgamesHeader];
    })]);


    var xAxis = d3.axisTop(goalScale);

    var xAxis_svg = d3.select("#goalHeader")
                    .append("svg")
                    .attr("width", 2*cellWidth)
                    .attr("height",cellHeight)
                    .append("g").attr("id","xAxis");

    xAxis_svg.attr("transform","translate(0,"+(cellHeight-1)+")")
        .call(xAxis);

    tableElements = teamData;
// ******* TODO: PART V *******

}

/**
 * Updates the table contents with a row for each element in the global variable tableElements.
 *
 */
function updateTable() {

// ******* TODO: PART III *******
    var table_body = d3.select("tbody");
    var tr = table_body.selectAll("tr").data(tableElements);

    tr.exit().remove();

    tr = tr.enter().append("tr").merge(tr);

    var th = tr.selectAll("th").data(function(d){
        return [{'type': d.value.type, 'vis': 'text', 'value': d.key}];
    });

    th.exit().remove();

    th = th.enter().append("th").merge(th);


    th.text(function(d){
        if(d.type == "game")
            return "x"+d.value;
        else
            return d.value;
    })
        .attr("class",function(d){
            return d.type;
        })
        .on("click",function(d){
            //console.log(d);
            var ndx = 0;
            for(var j = 0; j < tableElements.length; j++){
               if(tableElements[j].value.type == d.type){
                   if(tableElements[j].key == d.value){
                       ndx = j;
                       break;
                   }
               }
           }
           updateList(ndx);
        });

    var td = tr.selectAll("td").data(function(d){
        return [
            {'type':d.value.type,'vis':'goals','value':[d.value[goalsMadeHeader],d.value[goalsConcededHeader],d.value[deltagoalsHeader]]},
            {'type':d.value.type,'vis':'text','value':d.value[resultHeader][resultlabelHeader]},
            {'type':d.value.type,'vis':'bar','value':d.value[winsHeader]},
            {'type':d.value.type,'vis':'bar','value':d.value[lossesHeader]},
            {'type':d.value.type,'vis':'bar','value':d.value[totalgamesHeader]}
        ];
    });

    td.exit().remove();

    td = td.enter().append("td").merge(td);

    td.filter(function(d){
        return d.vis == 'text';
    })
        .text(function(d){
            return d.value;
        });

    var td_bar = td.filter(function(d){
        return d.vis == 'bar';
    });

    var bar_svg = td_bar.selectAll("svg").data(function(d){
        return [d];
    });

    bar_svg.exit().remove();

    bar_svg = bar_svg.enter().append("svg")
        .attr("width",cellWidth)
        .attr("height",cellHeight)
        .merge(bar_svg);

    var bar = bar_svg.selectAll("rect").data(function(d){
        return [d];
    });

    bar.exit().remove();

    bar = bar.enter()
        .append("rect")
        .attr("height",barHeight)
        .merge(bar);

     bar.attr("width",function(d){
            if(d.type == 'aggregate')
                return gameScale(d.value);
        })
        .attr("fill",function(d){
            if(d.type == 'aggregate')
                return aggregateColorScale(d.value);
        });

    var bar_text = bar_svg.selectAll("text").data(function(d){
        return [d];
    });

    bar_text.exit().remove();

    bar_text = bar_text.enter()
        .append("text")
        .classed("label",true)
        .attr("y",barHeight/2)
        .attr("dy", ".35em")
        .merge(bar_text);


    bar_text.attr("x", function(d) {
        if(d.type == 'aggregate')
            return gameScale(d.value) - 10;
    })
        .text(function(d) {
            if(d.type == 'aggregate')
                return d.value;
        });


    var td_goals_col = td.filter(function(d){
        return d.vis == 'goals';
    });


    var goals_col_svg = td_goals_col.selectAll("svg").data(function(d){
        return [d];
    });

    goals_col_svg.exit().remove();

    goals_col_svg = goals_col_svg.enter()
        .append("svg")
        .attr("width",2*cellWidth)
        .attr("height",cellHeight)
        .merge(goals_col_svg);

    var goals_col_bar = goals_col_svg.selectAll("rect").data(function(d){
        return [d];
    });

    goals_col_bar.exit().remove();

    goals_col_bar = goals_col_bar.enter()
        .append("rect")
        .attr("height",barHeight/2)
        .attr("y",(cellHeight/2)-5)
        .classed("goalBar",true)
        .merge(goals_col_bar);


    var goals_circle = goals_col_svg.selectAll("circle").data(function(d){
        return [
            {'type':d.type,'value':[d.value[0],d.value[2]]},
            {'type':d.type,'value':[d.value[1],d.value[2]]}
        ];
    });

    goals_circle.exit().remove();

    goals_circle = goals_circle.enter()
        .append("circle")
        .attr("cy",cellHeight/2)
        .classed("goalCircle",true)
        .merge(goals_circle);

    //svg does not support z-index. It renders based on the sequence of the element.
    goals_col_bar.attr("x",function(d){
            return goalScale(Math.min(d.value[0],d.value[1]));
        })
        .attr("width",function(d){
            return goalScale(Math.max(d.value[0],d.value[1])) - goalScale(Math.min(d.value[0],d.value[1]));
        })
        .attr("fill",function(d){
            return goalColorScale(d.value[2]);
        });

    goals_circle.attr("cx",function(d){
                return goalScale(d.value[0]);
        })
        .attr("fill",function(d,i){
            if (d.value[1] == 0){
                return "grey";
            }
            else{
                if(i == 0)
                    return "#034e7b";
                else
                    return "#cb181d"
            }
        });
};


/**
 * Collapses all expanded countries, leaving only rows for aggregate values per country.
 *
 */
function collapseList() {

    // ******* TODO: PART IV *******


}

/**
 * Updates the global tableElements variable, with a row for each row to be rendered in the table.
 *
 */
function updateList(i) {

    // ******* TODO: PART IV *******
    if(tableElements[i].value.type == 'aggregate'){
        if(i+1 < tableElements.length){
            if(tableElements[i+1].value.type == 'aggregate'){
                for(var j = 0; j < tableElements[i].value['games'].length; j++) {
                    tableElements.splice(i +j+ 1, 0, tableElements[i].value['games'][j]);
                }
            }
            else{
                tableElements.splice(i+1,tableElements[i].value['games'].length);
            }
        }
        else if(i == tableElements.length-1){
            for(var j = 0; j < tableElements[i].value['games'].length; j++) {
                tableElements.splice(i +j+ 1, 0, tableElements[i].value['games'][j]);
            }
        }
    }
    
    updateTable();
}

/**
 * Creates a node/edge structure and renders a tree layout based on the input data
 *
 * @param treeData an array of objects that contain parent/child information.
 */
function createTree(treeData) {

    // ******* TODO: PART VI *******


};

/**
 * Updates the highlighting in the tree based on the selected team.
 * Highlights the appropriate team nodes and labels.
 *
 * @param team a string specifying which team was selected in the table.
 */
function updateTree(row) {

    // ******* TODO: PART VII *******


}

/**
 * Removes all highlighting from the tree.
 */
function clearTree() {

    // ******* TODO: PART VII *******
    

}



