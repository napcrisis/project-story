$(function(){
	// Utility Methods
	function show_task(task_obj){
		var temp = $("#task_template").clone().removeClass("hidden").attr("id","");
		temp.find(".task_deadline").text("By "+task_obj.due_date);
		temp.find(".task_name").text(task_obj.name);
		temp.find(".task_description").text(task_obj.description);
		temp.find(".tagsinput").val(task_obj.systems_affected);
		temp.attr("data-id",task_obj.id);
		temp.appendTo($(".taskcard_holder").last());
		task_obj.div = temp;
		temp.find(".tagsinput").first().tagsinput();

	    // temp.find('input.tagsinput-typeahead').tagsinput('input').typeahead(null, {
	    //     name: 'states',
	    //     displayKey: 'word',
	    //     source: states.ttAdapter()
	    //   });

      
		if(task_obj.completed){
			temp.find(".checkbox").first().prop('checked', true);
			temp.addClass("completed");
			temp.find(".tagsinput").first().attr("disabled","disabled");
		}

		temp.find(".checkbox").change(function(){
			var parent = $(this).parent().parent();
			if($(this).is(':checked')){ 
				parent.addClass("completed");
				temp.find(".tagsinput").first().attr("disabled","disabled");
			} else {
				parent.removeClass("completed");
				temp.find(".tagsinput").first().attr("disabled","");
			}
			for(var i in tasks){
				if(tasks[i].id==parent.attr("data-id")){
					tasks[i].completed = $(this).is(':checked');
					$.jStorage.set(storage_keyword,tasks);
					break;
				}
			}
		});
	}
	function resetDiagramFilter(){
		for(var i in display_tasks){
			display_tasks[i].div.show();
		}
		systems.each(function(key, value){
			value.div.removeClass("selected");
		});
	}
	function iterateAndFilter(systems_name, second_system_name){
		systems_name = getSpacedRemovedID(systems_name.toLowerCase());
		second_system_name = getSpacedRemovedID(second_system_name.toLowerCase());
		$("#reset").show();
		for(var i in display_tasks){
			var temp = getSpacedRemovedID(display_tasks[i].systems_affected);
			console.log(temp);
			console.log(systems_name);
			if(temp.indexOf(systems_name)!=-1 && temp.indexOf(second_system_name)!=-1){
				display_tasks[i].div.show();
			} else if(temp.indexOf(systems_name)!=-1 && second_system_name == "asdjlh11213"){
				display_tasks[i].div.show();
			} else {
				console.log("nohere");
				display_tasks[i].div.hide();
			}
		}
	}
	function collapse(container,state){

	}

	function display(){
		display_tasks = tasks;
	    for(var t in display_tasks){
			show_task(display_tasks[t]);
	    }
	}

	function drawContainers(system){
		var box = $("#box_template").clone().removeClass("hidden").attr("id",system.space_removed_id);
		box.text(system.name).css({left:system.x, top:system.y});
		box.appendTo($("#diagramContainer"));
		return box;
	}
	function getSpacedRemovedID(name){
		return name.replace(/\s/g, '');
	}
	function loadSystems(){
		var android = new Object;
		android.name = "Android";
		android.space_removed_id = getSpacedRemovedID(android.name);
		android.x = 100;
		android.y = 50;
		systems.put(android.name, android);
		systems_names_allowed.push({word:android.name});

		var backend = new Object;
		backend.name = "Backend API";
		backend.space_removed_id = getSpacedRemovedID(backend.name);
		backend.x = 280;
		backend.y = 250;
		systems.put(backend.name, backend);
		systems_names_allowed.push({word:backend.name});

		var website = new Object;
		website.name = "Website";
		website.space_removed_id = getSpacedRemovedID(website.name);
		website.x = 300;
		website.y = 50;
		systems.put(website.name, website);
		systems_names_allowed.push({word:website.name});

		var database = new Object;
		database.name = "MySQL Database";
		database.space_removed_id = getSpacedRemovedID(database.name);
		database.x = 260;
		database.y = 450;
		systems.put(database.name, database);
		systems_names_allowed.push({word:database.name});

		connector_link.put("android,backend api",["AndroidBottom","BackendAPILeft"]);
		connector_link.put("backend api,website",["WebsiteBottom","BackendAPITop"]);
		connector_link.put("backend api,mysql database",["MySQLDatabaseTop","BackendAPIBottom"]);
	}

	function draw(){
		$("diagramContainer").empty();
		systems.each(function(key, value){
			value.div = drawContainers(value);
			value.div.click(function(){
				resetDiagramFilter();
				value.div.addClass("selected");
				iterateAndFilter(value.name,"asdjlh11213");
			});
			// console.log(value.space_removed_id);
			switch(value.name){
				case "Android":
					addEndpoints(value.space_removed_id, ["Bottom"]);
				break;
				case "Backend API":
					addEndpoints(value.space_removed_id, ["Left","Top","Bottom"]);
				break;
				case "Website":
					addEndpoints(value.space_removed_id, ["Bottom"]);
				break;
				case "MySQL Database":
					addEndpoints(value.space_removed_id, ["Top"]);
				break;
			}
			
		});

		// look through all displaytask
		var links_count = new Hashtable();
		var max = 1;
		// count the size of connection
		for(var i in display_tasks){
			if(!display_tasks[i].completed){
				continue;
			}			
			if(links_count.containsKey(display_tasks[i].systems_affected)){
				links_count.put(display_tasks[i].systems_affected,links_count.get(display_tasks[i].systems_affected)+1);
				if(max <links_count.get(display_tasks[i].systems_affected)){
					max = links_count.get(display_tasks[i].systems_affected);
				}
			} else {
				links_count.put(display_tasks[i].systems_affected,1);
			}
		}
		links_count.each(function(key, value){
			console.log(key+""+value);
			var width = maxWidthOfLine * (value/max);
			console.log(width);
			instance.connect({
				uuids: connector_link.get(key),
				detachable:false,
    		});
		});
		instance.bind("click",function(conn){
			// console.log(conn);
			resetDiagramFilter();
			iterateAndFilter(conn.sourceId, conn.targetId);
		});
	}

  	function addEndpoints(toId, anchors) {
      for (var i = 0; i < anchors.length; i++) {
          var sourceUUID = toId + anchors[i];
          console.log(sourceUUID);
          instance.addEndpoint(toId, common, {
              anchor: anchors[i], uuid: sourceUUID
          });
		}
	};

	// on page load

	// fix height and width of certain containers
	$(".below_header_container").first().height($("body").height() - $(".navbar").first().height());
	$("#diagramContainer").height($("body").height() - $(".navbar").first().height());
	$("#diagramContainer").width($("body").width() - $(".right_panel").first().width() - 29);

	jsPlumb.ready(function() {
	    jsPlumb.setContainer("diagramContainer");
	});
	
	$(".search_date_range_picker").daterangepicker({ autoUpdateInput: false, "opens": "left"});

	$(".search_date_range_picker").on('apply.daterangepicker', function(ev, picker) {
	  $(".search_date_range_picker").val(picker.startDate.format('MM/DD/YYYY') + ' - ' + picker.endDate.format('MM/DD/YYYY'));
	});

	$(".search_date_range_picker").on('cancel.daterangepicker', function(ev, picker) {
	  $(".search_date_range_picker").val('');
	});

	$("#datepickhack").click(function(){
		$(".search_date_range_picker").first().click();
	});

	// load project tasks
	var maxWidthOfLine = 8;
	var storage_keyword = "tasks";
	var storage_counter = "counter";
	var colorOfCircleDiagram = "#3498DB";
	var tasks = [];
	var display_tasks = [];
	var systems = new Hashtable();
	var connector_link = new Hashtable();
	var systems_names_allowed = [];
	var counter = 0;
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
		Container: "diagramContainer"
	});
	var common = {
		isSource:true,
		isTarget:true,
		connector:"Flowchart",

		paintStyle:{ fillStyle:colorOfCircleDiagram, outlineColor:colorOfCircleDiagram, radius:5 },
		hoverPaintStyle:{ fillStyle:colorOfCircleDiagram },
		connectorStyle:{ strokeStyle:colorOfCircleDiagram, lineWidth:maxWidthOfLine },
		connectorHoverStyle:{ lineWidth:13 }
	};

	loadSystems();

	var states = new Bloodhound({
		datumTokenizer: function(d) { return Bloodhound.tokenizers.whitespace(d.word); },
		queryTokenizer: Bloodhound.tokenizers.whitespace,
		limit: 4,
		local: systems_names_allowed
	});

    states.initialize();

	// var systemsAffected_possibilites = new Bloodhound({
	//   datumTokenizer: function(d) { return Bloodhound.tokenizers.whitespace(d.word); },
	//   queryTokenizer: Bloodhound.tokenizers.whitespace,
	//   limit: 4,
	//   local: systems_names_allowed
	// });
	// systemsAffected_possibilites.initialize();

	// retrieve stuff from storage if any
	if($.jStorage.get(storage_keyword)){
	    // if not - load the data from the server
	    tasks = $.jStorage.get(storage_keyword);
	}
	if($.jStorage.get(storage_counter)){
		counter = $.jStorage.get(storage_counter);
	}
	display(); 
	draw();
	/* delete storage / DEBUG */
	// console.log(tasks);
	// $.jStorage.set(storage_keyword,[]);
	// Project Change
	$(".update_project").click(function(){
		$("input[name='project']").val($(this).text());
		$("#selected_project").html($(this).text() + '<b class="caret"></b>');
	});
	$("#reset").click(function(){
		resetDiagramFilter();
		$(this).hide();
	});
	// New Task
	$("#add_new_task").click(function(){
		var temp = $("#create_task").clone().removeClass("hidden").attr("id","");
		temp.prependTo($(".taskcard_holder").first());
		$(".delete_task").click(function(){
			$(this).parent().remove();
		});
		// setup date picker
		$('.singleDatePick').daterangepicker({
		 	singleDatePicker: true,
        	showDropdowns: true
		});
		$(".clickdatehack").click(function(){
			$(this).parent().find(".singleDatePick").first().click();
		});

		temp.find(".tagsinput").first().tagsinput();
	    // temp.find('input.tagsinput-typeahead').tagsinput('input').typeahead(null, {
	    //     name: 'states',
	    //     displayKey: 'word',
	    //     source: states.ttAdapter()
	    //   });
		// save task
		temp.find(".save_task").first().click(function(){
			var task = new Object();
			counter++;
			var task_container = $(this).parent();
			task.name = task_container.find("input[name='task_name']").val();
			task.description = task_container.find("textarea[name='task_description']").val();
			task.systems_affected = task_container.find("input.tagsinput").val().toLowerCase();
			// massage systems to be sorted and to lower case. also ensure lower case
			var systems_parts = task.systems_affected.split(",");
			if(systems_parts.length>2){
				alert("Only two systems allowed");
				return;
			} else if(systems_parts.length==2){
				systems_parts.sort();
				task.systems_affected = systems_parts.join();
			}

			task.due_date = task_container.find("input[name='due_date']").val();
			task.completed = false;
			task.project = $("input[name='project']").val();
			task.id = counter;
			tasks.push(task);
			$.jStorage.set(storage_counter,counter);
			$.jStorage.set(storage_keyword,tasks);
			show_task(task);
			$(this).parent().remove();
		});
	});
});