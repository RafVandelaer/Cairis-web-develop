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
            fillGoalOptionMenu(data);
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

optionsContent.on('click',".deleteGoalSubGoal", function () {
    var goal = JSON.parse($.session.get("Goal"));
    var envName = $.session.get("GoalEnvName");
    var subGoalName =  $(this).closest("tr").find(".subGoalName").text();
    $(this).closest("tr").remove();
    $.each(goal.theEnvironmentProperties, function (index, env) {
        if(env.theEnvironmentName == envName){
            $.each(env.theSubGoalRefinements, function (ix, subgoal) {
                if(subgoal[0] == subGoalName){
                    env.theSubGoalRefinements.splice(ix,1)
                }
            });
        }
    });
    $.session.set("Goal", JSON.stringify(goal));
});
optionsContent.on('click',".deleteGoalGoal", function () {
    var goal = JSON.parse($.session.get("Goal"));
    var envName = $.session.get("GoalEnvName");
    var subGoalName =  $(this).closest("tr").find(".envGoalName").text();
    $(this).closest("tr").remove();
    $.each(goal.theEnvironmentProperties, function (index, env) {
        if(env.theEnvironmentName == envName){
            $.each(env.theGoalRefinements, function (ix, thegoal) {
                if(typeof thegoal != "undefined"){
                    if(thegoal[0] == subGoalName){
                        env.theGoalRefinements.splice(ix,1)
                    }
                }
            });
        }
    });
    $.session.set("Goal", JSON.stringify(goal));
});
optionsContent.on('click', '#addConcernAssociationstoGoal', function () {
    toggleGoalwindow("#editgoalConcernAssociations");
    $("#theSourceSelect").empty();
    $("#theTargetSelect").empty();
    getAllAssets(function (data) {
        $.each(data, function (key, asset) {
            $("#theSourceSelect").append($("<option></option>")
                .attr("value",key)
                .text(key));
            $("#theTargetSelect").append($("<option></option>")
                .attr("value",key)
                .text(key));
        })
    });
});
optionsContent.on('click', '#addSubGoaltoGoal', function () {
    $("#editgoalSubGoal").addClass("new");
    toggleGoalwindow("#editgoalSubGoal");
    fillGoalEditSubGoal();
});
//addGoaltoGoal
optionsContent.on('click', '#addGoaltoGoal', function () {
    $("#editGoalGoal").addClass("new");
    toggleGoalwindow("#editGoalGoal");
    fillGoalEditGoal();
});
optionsContent.on('click', '#updateGoalSubGoal', function () {

    var goal = JSON.parse($.session.get("Goal"));
    var envName = $.session.get("GoalEnvName");
       if($("#editgoalSubGoal").hasClass("new")){
           $("#editgoalSubGoal").removeClass("new");
           $.each(goal.theEnvironmentProperties, function (index, env) {
               if(env.theEnvironmentName == envName){
                   var array = [];
                   array[0] = $("#theSubgoalType").val();
                   array[1] = $("#theSubGoalName").val();
                   array[2] = $("#theRefinementSelect").val();
                   array[3] = $("#theAlternate").val();
                   array[4] = $("#theGoalSubGoalRationale").val();
                   env.theSubGoalRefinements.push(array);
               }
           });
       } else{
           var oldName = $.session.get("oldsubGoalName");
           $.each(goal.theEnvironmentProperties, function (index, env) {
               if(env.theEnvironmentName == envName){
                   $.each(env.theSubGoalRefinements, function (index, arr) {
                       if(arr[0] == oldName){
                           arr[0] = $("#theSubgoalType").val();
                           arr[1] = $("#theSubGoalName").val();
                           arr[2] = $("#theRefinementSelect").val();
                           arr[3] = $("#theAlternate").val();
                           arr[4] = $("#theGoalSubGoalRationale").val();
                       }
                   });
               }
           });
       }
    $.session.set("Goal", JSON.stringify(goal));
    fillGoalOptionMenu(goal);
    toggleGoalwindow("#editGoalOptionsForm");
});
optionsContent.on('dblclick', '.editGoalSubGoalRow', function () {
    toggleGoalwindow("#editgoalSubGoal");
    fillGoalEditSubGoal();

    var type = $(this).find("td").eq(2).text();
    var name = $(this).find("td").eq(1).text();
    var refinement = $(this).find("td").eq(3).text();
    var target = $(this).find("td").eq(4).text();
    var rationale = $(this).find("td").eq(5).text();
    $.session.set("oldsubGoalName", name);

    $("#theSubgoalType").val(type);
    $("#theSubGoalName").val(name);
    $("#theRefinementSelect").val(refinement);
    $("#theAlternate").val(target);
    $("#theGoalSubGoalRationale").val(rationale);

});
optionsContent.on('dblclick', '.editGoalGoalRow', function () {
    toggleGoalwindow("#editGoalGoal");
    fillGoalEditGoal();

    var type = $(this).find("td").eq(2).text();
    var name = $(this).find("td").eq(1).text();
    var refinement = $(this).find("td").eq(3).text();
    var target = $(this).find("td").eq(4).text();
    var rationale = $(this).find("td").eq(5).text();
    $.session.set("oldGoalName", name);

    $("#theGoalType").val(type);
    $("#theGoalName").val(name);
    $("#theGoalRefinementSelect").val(refinement);
    $("#theGoalAlternate").val(target);
    $("#theGoalRationale").val(rationale);

});
optionsContent.on('click',"#updateGoalGoal", function () {
    var goal = JSON.parse($.session.get("Goal"));
    var envName = $.session.get("GoalEnvName");
    if($("#editGoalGoal").hasClass("new")) {
        $("#editGoalGoal").removeClass("new");
        $.each(goal.theEnvironmentProperties, function (index, env) {
            if(env.theEnvironmentName == envName){
                var array = [];
                array[1] = $("#theGoalType").val();
                array[0] = $("#theGoalName").val();
                array[2] = $("#theGoalRefinementSelect").val();
                array[3] = $("#theGoalAlternate").val();
                array[4] = $("#theGoalGoalRationale").val();
                env.theGoalRefinements.push(array);
            }
        });
    }else{
        //TODO
    }
    $.session.set("Goal", JSON.stringify(goal));
    fillGoalOptionMenu(goal);
    toggleGoalwindow("#editGoalOptionsForm");
});

function fillGoalOptionMenu(data){
    fillOptionMenu("fastTemplates/editGoalsOptions.html","#optionsContent",null,true,true, function(){
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
}
function fillGoalEditSubGoal(){
    $("#theSubGoalName").empty();
    getAllgoals(function (data) {
        $.each(data, function (key, goal) {
            $("#theSubGoalName").append($("<option></option>")
                .attr("value", key)
                .text(key));
        });
    });
    getAllRequirements(function (data) {
        $.each(data, function (key, req) {
            $("#theSubGoalName").append($("<option></option>")
                .attr("value", req.theLabel)
                .text(req.theLabel));
        });
    });
}
function fillGoalEditGoal(){
    $("#theGoalName").empty();
    getAllgoals(function (data) {
        $.each(data, function (key, goal) {
            $("#theGoalName").append($("<option></option>")
                .attr("value", key)
                .text(key));
        });
    });
    getAllRequirements(function (data) {
        $.each(data, function (key, req) {
            $("#theGoalName").append($("<option></option>")
                .attr("value", req.theLabel)
                .text(req.theLabel));
        });
    });
}
function toggleGoalwindow(window){
    $("#editgoalConcernAssociations").hide();
    $("#editGoalOptionsForm").hide();
    $("#editgoalSubGoal").hide();
    $("#editGoalGoal").hide();
    $(window).show();
}

function emptyGoalEnvTables(){
    $("#editgoalsGoalsTable").find("tbody").empty();
    $("#editgoalsSubgoalsTable").find("tbody").empty();
    $("#editgoalsConcernTable").find("tbody").empty();
    $("#editgoalsConcernassociationsTable").find("tbody").empty();
}

function appendGoalEnvironment(text){
    $("#theGoalEnvironments").append("<tr><td><i class='fa fa-minus'></i></td><td class='goalEnvProperties'>"+ text +"</td></tr>");
}
function appendGoalEnvGoals(goal){
    //<td class="deleteAttackerEnv"><i class="fa fa-minus"></i></td>
    $("#editgoalsGoalsTable").append('<tr class="editGoalGoalRow"><td class="deleteGoalGoal"><i class="fa fa-minus"></i></td><td class="envGoalName">'+goal[0]+'</td><td>'+goal[1]+'</td><td>'+goal[2]+'</td><td>'+goal[3]+'</td><td>'+goal[4]+'</td></tr>');
}
function appendGoalSubGoal(subgoal){
    //<td class="deleteAttackerEnv"><i class="fa fa-minus"></i></td>
    $("#editgoalsSubgoalsTable").append('<tr class="editGoalSubGoalRow"><td class="deleteGoalSubGoal"><i class="fa fa-minus"></i></td><td class="subGoalName">'+subgoal[0]+'</td><td>'+subgoal[1]+'</td><td>'+subgoal[2]+'</td><td>'+subgoal[3]+'</td><td>'+subgoal[4]+'</td></tr>');
}
function appendGoalConcern(concern){
    $("#editgoalsConcernTable").append('<tr><td class="deleteGoalEnvConcern" value="'+ concern+'"><i class="fa fa-minus"></i></td><td>'+concern+'</td></tr>');
}
function appendGoalConcernAssoc(assoc){
    $("#editgoalsConcernassociationsTable").append('<tr><td class="deleteGoalEnvConcernAssoc"><i class="fa fa-minus"></i></td><td class="assocName">'+assoc[0]+'</td><td>'+assoc[1]+'</td><td>'+assoc[2]+'</td><td>'+assoc[3]+'</td><td>'+assoc[4]+'</td></tr>');
}