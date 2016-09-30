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
    resultrankingHeader = 'ranking',
    deltagoalsHeader = 'Delta Goals',
    gamesHeader = 'games';

/** Setup the scales*/
var goalScale = d3.scaleLinear()
    .range([cellBuffer, 2 * cellWidth - cellBuffer/2]);

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



// //For the HACKER version, comment out this call to d3.json and implement the commented out
// // d3.csv call below.
//
// d3.json('data/fifa-matches.json',function(error,data){
//     teamData = data;
//     createTable();
//     updateTable();
// })


// ********************** HACKER VERSION ***************************
/**
 * Loads in fifa-matches.csv file, aggregates the data into the correct format,
 * then calls the appropriate functions to create and populate the table.
 *
 */
d3.csv("data/fifa-matches.csv", function (error, csvData) {

   // ******* TODO: PART I *******

    teamData = d3.nest()
        .key(function (d) {
            return d.Team;
        })
        .rollup(function (leaves) {
            //console.log(leaves);
            var wins = d3.sum(leaves,function(l){return l.Wins});
            var losses = d3.sum(leaves,function (l) { return l.Losses;});
            var goalsmade = d3.sum(leaves,function(l){ return l[goalsMadeHeader];});
            var goalsconceded = d3.sum(leaves,function(l){ return l[goalsConcededHeader];});
            var deltagoals = d3.sum(leaves,function(l){ return l[deltagoalsHeader];});
            var ranking = d3.max(leaves,function(l){
                    return rank[l[resultHeader]];
            });

            var label;
            for(var key in rank) {
                if (rank[key] == ranking) {
                    label = key;
                    break;
                }
            }

            var games = d3.nest()
                .key(function(d){
                    return d.Opponent;
                })
                .rollup(function(leaf){
                    //console.log(leaf);
                    return {
                        'Wins': [],
                        'Losses': [],
                        'Goals Made': leaf[0][goalsMadeHeader],
                        'Goals Conceded': leaf[0][goalsConcededHeader],
                        'Delta Goals': [],
                        'Result': {'label':leaf[0][resultHeader],'ranking':rank[leaf[0][resultHeader]]},
                        'type': "game",
                        'Opponent': leaf[0].Team
                    };
                })
                .entries(leaves);

            games.sort(function(a,b){
                return d3.descending(a.value[resultHeader][resultrankingHeader],b.value[resultHeader][resultrankingHeader]);
            });

            return {
                'Wins': wins,
                'Losses': losses,
                'Goals Made': goalsmade,
                'Goals Conceded': goalsconceded,
                'Delta Goals': deltagoals,
                'Result': {'label':label,'ranking':ranking},
                'type': "aggregate",
                'TotalGames' : leaves.length,
                'games': games
            };
        })
        .entries(csvData);


    createTable();
    updateTable();
});
// ********************** END HACKER VERSION ***************************

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

function descending(row_name){

    switch(row_name) {

        case "Team":
            tableElements.sort(function (a, b) {
                return d3.descending(a.key, b.key);
            });

            for(var i = 0; i < tableElements.length; i++ ){
                tableElements[i].value[gamesHeader].sort(function(a,b){
                    return d3.descending(a.key, b.key);
                });
            }

            break;

        case "Goals":
            tableElements.sort(function (a, b) {
                return d3.descending(a.value[deltagoalsHeader], b.value[deltagoalsHeader]);
            });

            for(var i = 0; i < tableElements.length; i++ ){
                tableElements[i].value[gamesHeader].sort(function(a,b){
                    return d3.descending(a.value[goalsMadeHeader] - a.value[goalsConcededHeader], b.value[goalsMadeHeader] - b.value[goalsConcededHeader]);
                });
            }

            break;

        case "Round/Result":
            tableElements.sort(function (a, b) {
                return d3.descending(a.value[resultHeader][resultrankingHeader], b.value[resultHeader][resultrankingHeader]);
            });

            for(var i = 0; i < tableElements.length; i++ ){
                tableElements[i].value[gamesHeader].sort(function(a,b){
                    return d3.descending(a.value[resultHeader][resultrankingHeader], b.value[resultHeader][resultrankingHeader]);
                });
            }

            break;

        case "Wins":
            tableElements.sort(function (a, b) {
                return d3.descending(a.value[winsHeader], b.value[winsHeader]);
            });
            break;

        case "Losses":
            tableElements.sort(function (a, b) {
                return d3.descending(a.value[lossesHeader], b.value[lossesHeader]);
            });
            break;
        case "Total Games":
            tableElements.sort(function (a, b) {
                return d3.descending(a.value[totalgamesHeader], b.value[totalgamesHeader]);
            });
            break;

        default : console.log("Something Went Wrong In Descending!!!!!")
    }

}

function ascending(row_name){

    switch(row_name) {

        case "Team":
            tableElements.sort(function (a, b) {
                return d3.ascending(a.key, b.key);
            });

            for(var i = 0; i < tableElements.length; i++ ){
                tableElements[i].value[gamesHeader].sort(function(a,b){
                    return d3.ascending(a.key, b.key);
                });
            }

            break;

        case "Goals":
            tableElements.sort(function (a, b) {
                return d3.ascending(a.value[deltagoalsHeader], b.value[deltagoalsHeader]);
            });

            for(var i = 0; i < tableElements.length; i++ ){
                tableElements[i].value[gamesHeader].sort(function(a,b){
                    return d3.ascending(a.value[goalsMadeHeader] - a.value[goalsConcededHeader], b.value[goalsMadeHeader] - b.value[goalsConcededHeader]);
                });
            }

            break;

        case "Round/Result":
            tableElements.sort(function (a, b) {
                return d3.ascending(a.value[resultHeader][resultrankingHeader], b.value[resultHeader][resultrankingHeader]);
            });

            for(var i = 0; i < tableElements.length; i++ ){
                tableElements[i].value[gamesHeader].sort(function(a,b){
                    return d3.ascending(a.value[resultHeader][resultrankingHeader], b.value[resultHeader][resultrankingHeader]);
                });
            }

            break;

        case "Wins":
            tableElements.sort(function (a, b) {
                return d3.ascending(a.value[winsHeader], b.value[winsHeader]);
            });
            break;

        case "Losses":
            tableElements.sort(function (a, b) {
                return d3.ascending(a.value[lossesHeader], b.value[lossesHeader]);
            });
            break;
        case "Total Games":
            tableElements.sort(function (a, b) {
                return d3.ascending(a.value[totalgamesHeader], b.value[totalgamesHeader]);
            });
            break;

        default : console.log("Something Went Wrong In Ascending!!!!!")
    }
}

var row;
var order;

function sort_table(row_name){


    collapseList();


    if(row == row_name){
        if(order == "ascending"){
            descending(row_name);
            order = "descending";
        }
        else{
            ascending(row_name);
            order = "ascending";
        }
    }
    else{
        row = row_name;
        order = "descending";

        if(row_name == "Team"){
            ascending(row_name);
        }
        else {
            descending(row_name);
        }
    }

    updateTable();
}

/**
 * Creates a table skeleton including headers that when clicked allow you to sort the table by the chosen attribute.
 * Also calculates aggregate values of goals, wins, losses and total games as a function of country.
 *
 */
function createTable() {

// ******* TODO: PART II *******

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

    var header = d3.select("thead").select("tr");

    header.select("th")
        .on("click",function(){
            sort_table(this.innerText.trim());
        });
    header.selectAll("td")
        .on("click",function(){
            sort_table(this.innerText.trim());
        });

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

    tr.on("mouseover",function(d){

        updateTree(d);
    })
        .on("mouseout",function(d){
            clearTree();
        });

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
        .classed("goalBar",true)
        .merge(goals_col_bar);


    var goals_circle = goals_col_svg.selectAll("circle").data(function(d){
        if(d.type == "aggregate") {
            return [
                {'type': d.type, 'value': [d.value[0], d.value[2]]},
                {'type': d.type, 'value': [d.value[1], d.value[2]]}
            ];
        }
        else{
            var delta = d.value[0] - d.value[1];
            return [
                {'type': d.type, 'value': [d.value[0], delta]},
                {'type': d.type, 'value': [d.value[1], delta]}
            ];
        }
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
            if(d.type == "aggregate")
                return goalColorScale(d.value[2]);
            else
                return goalColorScale(d.value[0]-d.value[1]);
        })
        .attr("height",function(d){
            if(d.type == "aggregate")
                return barHeight/2;
            else
                return barHeight/4;
        })
        .attr("y",function(d){
            if(d.type == "aggregate")
                return (cellHeight/2)-5;
            else
                return (cellHeight/2)-2;
        });

    goals_circle.attr("cx",function(d){
                return goalScale(d.value[0]);
        })
        .attr("stroke",function(d,i){
            if (d.value[1] == 0){
                return "grey";
            }
            else{
                if(i == 0)
                    return goalColorScale(d.value[0]);
                else
                    return goalColorScale(-d.value[0]);
            }
        })
        .attr("fill",function(d,i){
            if (d.type == "aggregate") {
                if (d.value[1] == 0) {
                    return "grey";
                }
                else {
                    if (i == 0)
                        return goalColorScale(d.value[0]);
                    else
                        return goalColorScale(-d.value[0]);
                }
            }
            else{
                return "white";
            }
        });
};


/**
 * Collapses all expanded countries, leaving only rows for aggregate values per country.
 *
 */
function collapseList() {

    // ******* TODO: PART IV *******
    var i = 0;
    while(i < tableElements.length -1){
        if(tableElements[i].value.type == "aggregate" && tableElements[i+1].value.type == "game"){
            tableElements.splice(i+1,tableElements[i].value[gamesHeader].length);
        }
        i++;
    }

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
                for(var j = 0; j < tableElements[i].value[gamesHeader].length; j++) {
                    tableElements.splice(i +j+ 1, 0, tableElements[i].value[gamesHeader][j]);
                }
            }
            else{
                tableElements.splice(i+1,tableElements[i].value[gamesHeader].length);
            }
        }
        else if(i == tableElements.length-1){
            for(var j = 0; j < tableElements[i].value[gamesHeader].length; j++) {
                tableElements.splice(i +j+ 1, 0, tableElements[i].value[gamesHeader][j]);
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

    var root = d3.stratify()
        .id(function(d) { return d.id; })
        .parentId(function(d) {
            if(d.ParentGame) {
                return treeData[d.ParentGame].id;
            }
        })
        (treeData);

    var tree_layout = d3.select("#tree");
    var tree_layout_svg = d3.select(tree_layout.node().parentNode);

    var tree_layout_height = tree_layout_svg.attr("height");
    var tree_layout_width = tree_layout_svg.attr("width");

    //This makes sure that the tree is well formed and not clipped off from any angle.
    tree_layout.attr("transform","translate(40,0)")

    //This is needed since we want space to add the text within svg.
    //So tree is padded.
    var padding = 150;

    //This is needed as no matter what we do the root will always be at 0. So we have to move it so that
    //the root comes slightly below and is well adjusted.
    var root_padding = 30;

    var tree = d3.tree()
        .size([tree_layout_height - padding, tree_layout_width - padding]);

    var nodes = tree(root);


    //Learnt from Example in https://bl.ocks.org/d3noob/5537fe63086c4f100114f87f124850dd
    // adds the links between the nodes
    //var link = tree_layout.append("g").classed("link",true);


    var paths = tree_layout.selectAll("path").data( nodes.descendants().slice(1))
        .enter().append("path")
        .classed("link",true);

    paths.attr("d", function(d) {

            if(d.parent.parent == null) {
                return "M" + d.y  + "," + d.x
                    + "C" + (d.y + d.parent.y) / 2 + "," + d.x
                    + " " + (d.y + d.parent.y) / 2 + "," + d.parent.x
                    + " " + (d.parent.y + root_padding) + "," + d.parent.x;
            }
            return "M" + d.y + "," + d.x
                + "C" + (d.y + d.parent.y) / 2 + "," + d.x
                + " " + (d.y + d.parent.y) / 2 + "," + d.parent.x
                + " " + d.parent.y + "," + d.parent.x;
        });


    var node = tree_layout.selectAll("g").data(nodes.descendants())
        .enter()
        .append("g")
        .attr("class",function(d){
            return "node";
        });

    //although I assign class winner to the winner node. The color will not be filled as chrome does not support
    //css styling of svg circle. So I am explicitly filling the color
    node.append("circle")
        .attr("r",5)
        .attr("cx",function(d){
            if(d.parent == null)
                return d.y+root_padding;
            return d.y;
        })
        .attr("cy",function(d){
            return d.x;
        })
        .style("fill",function(d){
            if(d.data.Wins == "1")
                return "#364e74";
        })
        .attr("class",function(d){
            if(d.data.Wins == "1")
                return "winner";
        });

    node.append("text")
        .attr("y", function(d) {
            return d.x;
        })
        .attr("dy","0.20em")
        .attr("x", function(d) {
            if(d.parent == null)
                return d.y+30;
            return d.y;
        })
        .attr("dx",function(d){
            return d.children ? "-0.35em":"0.35em";
        })
        .style("text-anchor", function(d) {
            return d.children ? "end" : "start";
        })
        .text(function(d) {
            return d.data.Team;
        });

};

/**
 * Updates the highlighting in the tree based on the selected team.
 * Highlights the appropriate team nodes and labels.
 *
 * @param team a string specifying which team was selected in the table.
 */
function updateTree(row) {

    // ******* TODO: PART VII *******

    var highlight = d3.selectAll(".link").filter(function(d){
        if(row.value.type == 'aggregate')
            return row.key == d.data.Team  && d.data.Wins == "1";
        else
            return (row.key == d.data.Team && row.value.Opponent == d.data.Opponent) || (row.key == d.data.Opponent && row.value.Opponent == d.data.Team);
    });

    highlight.classed("selected",true);

    var label = d3.select("#tree").selectAll("text").filter(function(d){
        if(row.value.type == 'aggregate')
            return row.key == d.data.Team;
        else
            return (row.key == d.data.Team && row.value.Opponent == d.data.Opponent) || (row.key == d.data.Opponent && row.value.Opponent == d.data.Team);
    });

    label.classed("selectedLabel",true);

}

/**
 * Removes all highlighting from the tree.
 */
function clearTree() {

    // ******* TODO: PART VII *******
    d3.selectAll(".selected").classed("selected",false);

    d3.selectAll(".selectedLabel").classed("selectedLabel",false);

}



