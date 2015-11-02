$(function(){
	// on page load
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
	var storage_keyword = "tasks";
	var storage_counter = "counter";
	var tasks = [];
	var counter = 0;

	$(".below_header_container").first().height($("body").height() - $(".navbar").first().height());
	$("#main-container").height($("body").height() - $(".navbar").first().height());
	
	// delete storage
	// $.jStorage.set(storage_keyword,[]);


	if($.jStorage.get(storage_keyword)){
	    // if not - load the data from the server
	    tasks = $.jStorage.get(storage_keyword);
	    for(var t in tasks){
			show_task(tasks[t]);
	    }
	}
	if($.jStorage.get(storage_counter)){
		counter = $.jStorage.get(storage_counter);
	}
	console.log(tasks);

	// Project Change
	$(".update_project").click(function(){
		$("input[name='project']").val($(this).text());
		$("#selected_project").html($(this).text() + '<b class="caret"></b>');
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

		// save task
		temp.find(".save_task").first().click(function(){
			var task = new Object();
			counter++;
			var task_container = $(this).parent();
			task.name = task_container.find("input[name='task_name']").val();
			task.description = task_container.find("textarea[name='task_description']").val();
			task.systems_affected = task_container.find("input[name='systems_affected']").val();
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

	// Utility Methods
	function show_task(task_obj){
		var temp = $("#task_template").clone().removeClass("hidden").attr("id","");
		temp.find(".task_deadline").text("By "+task_obj.due_date);
		temp.find(".task_name").text(task_obj.name);
		temp.find(".task_description").text(task_obj.description);
		temp.find(".systems_affected").val(task_obj.systems_affected);
		temp.attr("data-id",task_obj.id);
		temp.appendTo($(".taskcard_holder").last());
		temp.find(".systems_affected").first().tagsinput();
		if(task_obj.completed){
			temp.find(".checkbox").first().prop('checked', true);
			temp.addClass("completed");
			temp.find(".systems_affected").first().attr("disabled","disabled");
		}

		temp.find(".checkbox").change(function(){
			var parent = $(this).parent().parent();
			if($(this).is(':checked')){ 
				parent.addClass("completed");
				temp.find(".systems_affected").first().attr("disabled","disabled");
			} else {
				parent.removeClass("completed");
				temp.find(".systems_affected").first().attr("disabled","");
			}
			for(var i in tasks){
				if(tasks[i].id==parent.attr("data-id")){
					tasks[i].completed = $(this).is(':checked');
					$.jStorage.set(storage_keyword,tasks);
					console.log(tasks[i]);
					console.log("save");
					break;
				}
			}
		});
	}
	function collapse(container,state){

	}
});