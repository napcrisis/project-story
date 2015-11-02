REMOVE ANGULAR
var app = angular.module('todoApp', ["xeditable", "ui.bootstrap"]);
var colorOfCircleDiagram = "#3498DB";
app.run(function(editableOptions) {
  editableOptions.theme = 'bs3'; // bootstrap 3 / default / bs2
});

app.controller('TodoListController', function($scope) {
  var todoList = this;
  var instance = jsPlumb.getInstance({
      // default drag options
      DragOptions: { cursor: 'pointer', zIndex: 2000 },
      ConnectionOverlays: [
          [ "Label", {
              location: 0.1,
              id: "label",
              cssClass: "aLabel"
          }]
      ],
      Container: "main-container"
  });

  var _addEndpoints = function (toId, anchors) {
      var common = {
        isSource:true,
        isTarget:true,
        connector:"Flowchart",

        paintStyle:{ fillStyle:colorOfCircleDiagram, outlineColor:colorOfCircleDiagram, radius:5 },
        hoverPaintStyle:{ fillStyle:colorOfCircleDiagram },
        connectorStyle:{ strokeStyle:colorOfCircleDiagram, lineWidth:8 },
        connectorHoverStyle:{ lineWidth:13 }
      };
      for (var i = 0; i < anchors.length; i++) {
          var sourceUUID = toId + anchors[i];
          instance.addEndpoint("box_" + toId, common, {
              anchor: anchors[i], uuid: sourceUUID
          });
      }
  };
  var init = function (connection) {
    connection.getOverlay("label").setLabel(connection.sourceId.substring(15) + "-" + connection.targetId.substring(15));
  };

  $scope.doNotPropagate = function(event){
    event.stopPropagation();
  };

  // Double click
  // $scope.addContainer = function(event){
  //   var maxId = 0;
  //   if(todoList.containers.length!=0){
  //     maxId = todoList.containers[todoList.containers.length-1].id+1;
  //   }
  //   var container = {name:"", id:maxId, todos:[], x: event.pageX, y: event.pageY , addTodo:function(event){
  //     todoList.containers[this.id].todos.push({text:todoList.containers[this.id].todoText, done:false});
  //     todoList.containers[this.id].todoText = '';
  //   }};
  //   todoList.containers.push(container);
  //   setTimeout($scope.reloadJsPlumb, 500);
  // }
  $scope.reloadJsPlumb = function(){
    if(todoList.containers.length==0){
      return;
    }
    // connect each box with jsplumb if it has not been done
    for(var i=0; i<todoList.containers.length;i++){
      var container = todoList.containers[i];
      if(todoList.containerLoaded["box_"+container.id]!=null){
        continue;
      }
      todoList.containerLoaded["box_"+container.id] = 1;
      _addEndpoints(""+container.id, ["Left","Right","Top","Bottom"]);
    }

    // reload all connections from storage if it has not been drawn
    for(var i=0; i<todoList.connections.length;i++){
      var conn = todoList.connections[i];
      if(todoList.connectionLoaded[conn.uniqueId]!=null){
        continue;
      }
      var source = conn.sourceUUID;
      var target = conn.targetUUID; 
      todoList.connectionLoaded[conn.uniqueId] = 1;
      instance.connect({uuids: [source, target], editable: false});
    }

    instance.bind("connection", function (connInfo, originalEvent) {
      init(connInfo.connection);
      // var connection = todoList.connections[connInfo.source.id+"->"+connInfo.target.id];
      // if(connection == null){
      //   return;
      // }
      var conn = new Object();
      conn.uniqueId = connInfo.source.id+"->"+connInfo.target.id;
      conn.sourceUUID = connInfo.sourceEndpoint._jsPlumb.uuid;
      conn.targetUUID = connInfo.targetEndpoint._jsPlumb.uuid;
      conn.source = connInfo.sourceId;
      conn.target = connInfo.targetId;
      todoList.connections.push(conn);
      console.log(connInfo);
    });

    instance.bind("click", function (conn, originalEvent) {
        console.log(conn);
    });
    instance.bind(jsPlumb.dragEvents.drag, function (element) {
        console.log(element);
    });

    instance.draggable(jsPlumb.getSelector(".box"), { grid: [20, 20] });

    $(".box").draggable({
      stop: function(e){
          for(var i in todoList.containers){
            if(todoList.containers[i].id==$(this).attr("id").substr(4)){
              var top = $(this).offset()['top'];
              var left = $(this).offset()['left'];
              todoList.containers[i].y = top;
              todoList.containers[i].x = left;
              break;        
            }
          }
      }
    });
  };
  // setTimeout($scope.reloadJsPlumb, 500);
});

jsPlumb.ready(function() {
    jsPlumb.setContainer("main-container");
});