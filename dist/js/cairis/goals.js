/**
 * Created by Raf on 29/05/2015.
 */
$("#EditGoals").click(function(){

    $.ajax({
        type: "GET",
        dataType: "json",
        accept: "application/json",
        data: {
            session_id: String($.session.get('sessionID'))
        },
        crfossDomain: true,
        url: serverIP + "/api/goals",
        success: function (data) {
            window.activeTable = "EditGoals";
            setTableHeader();
            createEditGoalsTable(data);
            activeElement("reqTable");
            sortTableByRow(0);
        },
        error: function (xhr, textStatus, errorThrown) {
            debugLogger(String(this.url));
            debugLogger("error: " + xhr.responseText +  ", textstatus: " + textStatus + ", thrown: " + errorThrown);
        }
    })

});

$(document).on('click', "button.editGoalsButton",function() {
    var name = $(this).attr("value");
    $.ajax({
        type: "GET",
        dataType: "json",
        accept: "application/json",
        data: {
            session_id: String($.session.get('sessionID'))
        },
        crossDomain: true,
        url: serverIP + "/api/goals/name/" + name.replace(" ", "%20"),
        success: function (data) {
            fillOptionMenu("../../CAIRIS/fastTemplates/editGoalsOptions.html","#optionsContent",null,true,true, function(){
                    $.session.set("Goal", JSON.stringify(data));
                    $('#editGoalOptionsForm').loadJSON(data,null);

                    $.each(data.theTags, function (index, tag) {
                        $("#theTags").append(tag + ", ");
                    });
                    $.each(data.theEnvironmentProperties, function (index, prop) {
                       appendGoalEnvironment(prop.theEnvironmentName);
                    });
                    forceOpenOptions();
                    $("#theGoalEnvironments").find(".goalEnvProperties:first").trigger('click');

                }
            );
        },
        error: function (xhr, textStatus, errorThrown) {
            debugLogger(String(this.url));
            debugLogger("error: " + xhr.responseText +  ", textstatus: " + textStatus + ", thrown: " + errorThrown);
        }
    });

});
/*
 on environment in Goals edit
 */
var optionsContent = $("#optionsContent");
optionsContent.on('click', ".goalEnvProperties", function () {
    var goal = JSON.parse($.session.get("Goal"));

    var name = $(this).text();
    $.session.set("GoalEnvName", name);

    emptyGoalEnvTables();

    $.each(goal.theEnvironmentProperties, function (index, env) {
        if(env.theEnvironmentName == name){
            $('#goalsProperties').loadJSON(env,null);
            $("#theIssue").val = env.theIssue;
            $.each(env.theGoalRefinements, function (index, goal) {
                appendGoalEnvGoals(goal);
            });
            $.each(env.theSubGoalRefinements, function (index, subgoal) {
                appendGoalSubGoal(subgoal);
            });
            $.each(env.theConcerns, function (index, concern) {
                appendGoalConcern(concern);
            });
            $.each(env.theConcernAssociations, function (index, assoc) {
                appendGoalConcernAssoc(assoc);
            });
        }

    });
});

optionsContent.on('click', '.deleteGoalEnvConcernAssoc', function () {
    var goal = JSON.parse($.session.get("Goal"));
    var envName = $.session.get("GoalEnvName");
    var theAssoc =  $(this).closest("tr").find(".assocName").text();
    $(this).closest("tr").remove();
    $.each(goal.theEnvironmentProperties, function (index, env) {
        if(env.theEnvironmentName == envName){
            $.each(env.theConcernAssociations, function (ix, assoc) {
                if(assoc[0] == theAssoc){
                    env.theConcernAssociations.splice(ix,1)
                }
            });
        }
    });
    $.session.set("Goal", JSON.stringify(goal));
});

optionsContent.on('click',".deleteGoalEnvConcern", function () {

});


function emptyGoalEnvTables(){
    $("#editgoalsGoalsTable").find("tbody").empty();
    $("#editgoalsSubgoalsTable").find("tbody").empty();
    $("#editgoalsConcernTable").find("tbody").empty();
    $("#editgoalsConcernassociationsTable").find("tbody").empty();
}

function appendGoalEnvironment(text){
    $("#theGoalEnvironments").append("<tr class='clickable-environments'><td><i class='fa fa-minus'></i></td><td class='goalEnvProperties'>"+ text +"</td></tr>");
}
function appendGoalEnvGoals(goal){
    //<td class="deleteAttackerEnv"><i class="fa fa-minus"></i></td>
    $("#editgoalsGoalsTable").append('<tr><td class="deleteGoalGoal"><i class="fa fa-minus"></i></td><td>'+goal[0]+'</td><td>'+goal[1]+'</td><td>'+goal[2]+'</td><td>'+goal[3]+'</td><td>'+goal[4]+'</td></tr>');
}
function appendGoalSubGoal(subgoal){
    //<td class="deleteAttackerEnv"><i class="fa fa-minus"></i></td>
    $("#editgoalsSubgoalsTable").append('<tr><td class="deleteGoalEnvConcern"><i class="fa fa-minus"></i></td><td>'+subgoal[0]+'</td><td>'+subgoal[1]+'</td><td>'+subgoal[2]+'</td><td>'+subgoal[3]+'</td><td>'+subgoal[4]+'</td></tr>');
}
function appendGoalConcern(concern){
    $("#editgoalsConcernTable").append('<tr><td class="deleteGoalEnvConcern" value="'+ concern+'"><i class="fa fa-minus"></i></td><td>'+concern+'</td></tr>');
}
function appendGoalConcernAssoc(assoc){
    $("#editgoalsConcernassociationsTable").append('<tr><td class="deleteGoalEnvConcernAssoc"><i class="fa fa-minus"></i></td><td class="assocName">'+assoc[0]+'</td><td>'+assoc[1]+'</td><td>'+assoc[2]+'</td><td>'+assoc[3]+'</td><td>'+assoc[4]+'</td></tr>');
}