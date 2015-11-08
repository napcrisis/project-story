$(function(){
	// Utility Methods
	function show_task(task_obj){
		var temp = $("#task_template").clone().removeClass("hidden").attr("id","");
		temp.find(".task_deadline").text("By "+task_obj.due_date);
		temp.find(".task_name").text(task_obj.name);
		temp.find(".task_description").text(task_obj.description);
		temp.find(".tagsinput").val(task_obj.systems_affected);
		temp.attr("data-id",task_obj.id);
		temp.addClass("task_"+task_obj.id);
		temp.appendTo($(".taskcard_holder").last());
		task_obj.div = temp;
		temp.find(".tagsinput").first().tagsinput();

	    // temp.find('input.tagsinput-typeahead').tagsinput('input').typeahead(null, {
	    //     name: 'states',
	    //     displayKey: 'word',
	    //     source: states.ttAdapter()
	    //   });

      	// setup task
		if(task_obj.completed){
			temp.find(".checkbox").first().prop('checked', true);
			temp.addClass("completed");
			temp.find(".tagsinput").first().attr("disabled","disabled");
			temp.find(".option").first().removeClass("hidden");
			collapse(temp,1);
			insertFilesEditted(temp, task_obj);
		} else {
			collapse(temp,2);
		}

		// trigger off modal 
		temp.find(".checkbox").change(function(){
			var parent = $(this).parent().parent();
			if($(this).is(':checked')){ 
				parent.addClass("completed");
				temp.find(".tagsinput").first().attr("disabled","disabled");
				popModalAndShow(parent.attr("data-id"));
				temp.find(".option").first().removeClass("hidden");
			} else {
				parent.removeClass("completed");
				temp.find(".tagsinput").first().attr("disabled","");
				temp.find(".option").first().addClass("hidden");
			}
			// find task in overall task holder and save to storage
			var task = findTask(parent.attr("data-id"));
			task.completed = $(this).is(':checked');
			saveAllTask();
		});

		// allow task to be expanded or collapsed
		temp.find(".expand").first().click(function(){
			console.log($(this).parent().attr("state"));
			if($(this).parent().attr("state")==1){
				collapse($(this).parent(),2);
			} else {
				collapse($(this).parent(),1);
			}
		});

		// allow expsansion of show or hide changed files
		temp.find(".option").click(function(event){
			var parent = $(this).parent().parent();
			if(parent.attr("state")==3){
				collapse(parent,2);	
			} else {
				collapse(parent,3);	
			}
		});
		temp.find(".projectname").first().text(task_obj.project);
	}
	function insertFilesEditted(div, task){
		if(task.filesChanged == null || task.filesChanged.length==0){
			return;
		}
		var fileholder = div.find(".changed_files").first();
		fileholder.empty();
		for(var i in task.filesChanged){
			var t = $("<tr/>").append($("<td/>"));
			t.children().first().text(task.filesChanged[i]);
			t.children().first().attr("data-img",task.imageOfFile[i]);
			fileholder.append(t);
		}
		fileholder.find("td").each(function(){
			$(this).hover(function(){ // hover in
				var img_box = $("#magical_image_box").show();
				var top = fileholder.parent().position().top;
				var widest_image = $(".right_panel").first().position().left;
				var right = $("body").first().width()-widest_image;
				img_box.css({right:right+10+"px", width:widest_image-30+"px", top:top+15+"px"});
				img_box.attr("src",$(this).attr("data-img"));
				var close_box = $("#close").show();
				close_box.css({right:right+15+"px",top:top+20+"px"});
			},function(){ // exit
				if(!fixed_code_view){
					$("#magical_image_box").hide();
					$("#close").hide();
				}
			});
		});
		fileholder.find("td").click(function(){
			fixed_code_view = true;
			$("#close").click(function(){
				fixed_code_view = false;
				$("#magical_image_box").hide();
				$("#close").hide();
			});
		});
	}
	function findTask(task_id){
		for(var i in tasks){
			if(tasks[i].id==task_id){
				return tasks[i];
			}
		}
		return 0;
	}
	function saveAllTask(){
		$.jStorage.set(storage_keyword,tasks);
	}
	function deleteAllTasks(){
		$.jStorage.set(storage_keyword,[]);
	}
	function popModalAndShow(task_id){
		var filesChanged = generateFileOptions();
		var keysOfFileChanged = filesChanged.keys();
		var checkboxes = "";
		for(var i in keysOfFileChanged){
			var randomedFileName = keysOfFileChanged[i];
			var img = filesChanged.get(randomedFileName);
			checkboxes += '<div class="radio" style="padding-left:0;"><label for="awesomeness-0"><input type="checkbox" name="awesomeness" id="awesomeness-0" value="'+randomedFileName+'" data-image-file="'+img+'" checked="checked"> "'+randomedFileName+'" </label></div>';
		}
		bootbox.dialog({
            title: "Add Github link and confirm file changes",
            message: '<div class="row filemodal" data-id="'+task_id+'">  ' +
                '<div class="col-md-12"> ' +
                '<form class="form-horizontal"> ' +
                '<div class="form-group"> ' +
                '<label class="col-md-2 control-label" for="name">Github</label> ' +
                '<div class="col-md-8"> ' +
                '<input id="name" name="name" type="text" placeholder="Github link" class="form-control input-md" value="https://github.com/napcrisis/gradinator/pull/1"></div></div> ' +
                '<div class="form-group"> ' +
                '<label class="col-md-2 control-label" for="awesomeness">Changed files</label> ' +
                '<div class="col-md-8"> ' + checkboxes + 
                '</div></div></form><p style="margin-left:20px;">Files to be included (values randomized for demo)</p></div></div>',
            buttons: {
                success: {
                    label: "Save",
                    className: "btn-success",
                    callback: function () {
                    	var parent = $(this).find(".filemodal").first();
                    	var filesChanged = [];
                    	var imageOfFile = [];
						parent.find("input[name='awesomeness']:checked").each(function(){
							filesChanged.push($(this).val());
							imageOfFile.push($(this).attr("data-image-file"));
                        });
						var task = findTask(parent.attr("data-id"));
						task.filesChanged = filesChanged;
						task.imageOfFile = imageOfFile;

						var temp = findTaskDiv(task.id);
						insertFilesEditted(temp, task);
						collapse(temp,2);

						saveAllTask();
                    }
                }
            }
        });
	}
	function findTaskDiv(task_id){
		return $(".task_"+task_id).first();
	}
	function generateFileOptions(){
		var number_of_files_changed = getRandom(filenames.size());
		var files = new Hashtable();
		for(var i=0; i<number_of_files_changed;i++){
			var filename = filenamesArray[getRandom(filenames.size())-1];
			files.put(filename,filenames.get(filename));
		}
		return files;
	}
	function getRandom(max){
		return Math.floor(Math.random() * max) + 1;
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

			if(temp.indexOf(systems_name)!=-1 && temp.indexOf(second_system_name)!=-1){
				display_tasks[i].div.show();
			} else if(temp.indexOf(systems_name)!=-1 && second_system_name == "asdjlh11213"){
				display_tasks[i].div.show();
			} else {
				display_tasks[i].div.hide();
			}
		}
	}
	function collapse(container,state){
		container.attr("state",state);
		switch(state){
			case 1:
				container.find(".system_div").first().hide();
				container.find(".task_description").first().hide();
				container.find(".completed_task").first().hide();
				container.find(".changed_files").first().hide();
				container.find(".option").first().hide();
				
				container.find(".expand").first().removeClass("fui-triangle-down-small");
				container.find(".expand").first().addClass("fui-triangle-left-large");
			break;	
			case 2:
				container.find(".system_div").first().show();
				container.find(".task_description").first().show();
				container.find(".completed_task").first().show();
				container.find(".expand").first().addClass("fui-triangle-down-small");
				container.find(".expand").first().removeClass("fui-triangle-left-large");
				container.find(".changed_files").first().hide();
				container.find(".option").first().text("show changed files");
				if(container.find(".checkbox").first().is(':checked')){
					container.find(".option").first().show();
				} else {
					container.find(".option").first().hide();
				}
			break;
			case 3:
				container.find(".system_div").first().show();
				container.find(".task_description").first().show();
				container.find(".completed_task").first().show();
				container.find(".changed_files").first().show();
				container.find(".option").first().text("hide changed files");
			break;
		}
	}

	function display(){
		$(".taskcard_holder").last().empty();
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
		database.x = 261;
		database.y = 450;
		systems.put(database.name, database);
		systems_names_allowed.push({word:database.name});

		var jenkins = new Object;
		jenkins.name = "Jenkins";
		jenkins.space_removed_id = getSpacedRemovedID(jenkins.name);
		jenkins.x = 500;
		jenkins.y = 450;
		systems.put(jenkins.name, jenkins);
		systems_names_allowed.push({word:jenkins.name});

		connector_link.put("android,backend api",["AndroidBottom","BackendAPILeft"]);
		connector_link.put("backend api,website",["WebsiteBottom","BackendAPITop"]);
		connector_link.put("backend api,mysql database",["MySQLDatabaseTop","BackendAPIBottom"]);
		connector_link.put("jenkins,mysql database",["MySQLDatabaseRight","JenkinsLeft"]);

		filenames.put("Filename1.java", "img/fakefile1.png");
		filenames.put("Filename2.java", "img/fakefile1.png");
		filenames.put("Filename3.java", "img/fakefile1.png");
		filenames.put("Filename4.java", "img/fakefile1.png");

		filenamesArray.push("Filename1.java");
		filenamesArray.push("Filename2.java");
		filenamesArray.push("Filename3.java");
		filenamesArray.push("Filename4.java");

	}
	function filter(){ 
		// project filter
		var selected_project = $("input[name='project']").val();
		display_tasks = [];
		if(selected_project=="All Systems"){
			display_tasks = tasks;
		} else {
			for(var i in tasks){
				if(tasks[i].project==selected_project){
					display_tasks.push(tasks[i]);
				}	
			}
		}
		// OTHER FILTERS go here
		var search_name_or_file = $("#navbarInput-01").val();
		if(search_name_or_file!=""){
			search_name_or_file=search_name_or_file.toLowerCase();
			var temp = [];
			for(var i in display_tasks){
				// console.log("search:"+search_name_or_file);
				// console.log("displayname:"+display_tasks[i].name+":"+display_tasks[i].name.indexOf(search_name_or_file));
				// console.log("description:"+display_tasks[i].description+":"+display_tasks[i].description.indexOf(search_name_or_file));
				if(display_tasks[i].name.toLowerCase().indexOf(search_name_or_file)!=-1 
					|| display_tasks[i].description.toLowerCase().indexOf(search_name_or_file)!=-1){
					// console.log("found");
					temp.push(display_tasks[i]);
					continue;
				}
				if(display_tasks[i].filesChanged !=null && display_tasks[i].filesChanged.join().toLowerCase().indexOf(search_name_or_file)!=-1){
					temp.push(display_tasks[i]);
					continue;	
				}
			}
			display_tasks = temp;
		}
		var date_filter = $(".search_date_range_picker").first().val();
		var parts = date_filter.split("-");
		if(date_filter!="" && parts.length==2){
			var temp = [];
			var start_date = moment(parts[0].trim(), "MM/DD/YYYY").format("YYYYMDD");
			var end_date = moment(parts[1].trim(), "MM/DD/YYYY").format("YYYYMDD");;
			for(var i in display_tasks){
				if(start_date<=display_tasks[i].filter_date && end_date >=display_tasks[i].filter_date){
					temp.push(display_tasks[i]);
				}
			}
			display_tasks = temp;
		}
		display();
		draw();
	}
	function draw(){
		instance.detachEveryConnection();
		instance.deleteEveryEndpoint();
		$("diagramContainer").empty();
		systems.each(function(key, value){
			value.div = drawContainers(value);
			value.div.click(function(){
				resetDiagramFilter();
				value.div.addClass("selected");
				iterateAndFilter(value.name,"asdjlh11213");
			});
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
					addEndpoints(value.space_removed_id, ["Top","Right"]);
				break;
				case "Jenkins":
					addEndpoints(value.space_removed_id, ["Left"]);
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
			var width = maxWidthOfLine * (value/max);
			instance.connect({
				uuids: connector_link.get(key),
				detachable:false,
    		});
		});
		instance.bind("click",function(conn){
			resetDiagramFilter();
			iterateAndFilter(conn.sourceId, conn.targetId);
		});
	}

  	function addEndpoints(toId, anchors) {
      for (var i = 0; i < anchors.length; i++) {
          var sourceUUID = toId + anchors[i];
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
	  filter();
	});

	$(".search_date_range_picker").on('cancel.daterangepicker', function(ev, picker) {
	  $(".search_date_range_picker").val('');
	});

	$("#datepickhack").click(function(){
		$(".search_date_range_picker").first().click();
	});

	// load project tasks
	var maxWidthOfLine = 8;
	var filenames = new Hashtable();
	var filenamesArray = [];
	var storage_keyword = "tasks";
	var storage_counter = "counter";
	var colorOfCircleDiagram = "#3498DB";
	var tasks = [];
	var display_tasks = [];
	var systems = new Hashtable();
	var connector_link = new Hashtable();
	var systems_names_allowed = [];
	var counter = 0;
	var fixed_code_view = false;
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

		paintStyle:{ fillStyle:"#fff", outlineColor:"#fff", radius:1 },
		hoverPaintStyle:{ fillStyle:colorOfCircleDiagram },
		connectorStyle:{ strokeStyle:colorOfCircleDiagram, lineWidth:5 },
		connectorHoverStyle:{ lineWidth:10 }
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
	display_tasks = tasks; // because at load, project == all systems
	display(); 
	draw();

	// console.log(tasks);
	/* delete storage / DEBUG */
	// console.log(tasks);
	// deleteAllTasks();
	
	// Project Change
	$("#add_new_task").hide();
	$('#navbarInput-01').on("input", function() {
		filter();
	});
	$(".update_project").click(function(){
		$("input[name='project']").val($(this).text());
		$("#selected_project").html($(this).text() + '<b class="caret"></b>');
		if($(this).text()=="All Systems"){
			$("#add_new_task").hide();
		} else {
			$("#add_new_task").show();
		}
		filter();
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
			task.filter_date = moment(task.due_date, "MM/DD/YYYY").format("YYYYMDD");

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