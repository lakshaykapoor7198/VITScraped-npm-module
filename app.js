var unirest=require("unirest");
var cheerio=require('cheerio');
var request=require('request');
var cache=require('memory-cache');
var parser=require('./parser');
var initialJar=unirest.jar();


// Credits : Karthik Balakrishnan for CaptchaParser

// marksScrape({regno:'YourRegisterNoHere',passwd:'YourVTOPPasswordHere'},'FS',function(data){
// 	console.log(data);
// });


// proctorScrape({regno:'YourRegisterNoHere',passwd:'YourVTOPPasswordHere'},function(data){
// 	console.log(data);
// });

// digitalAssignmentScrape({regno:'YourRegisterNoHere',passwd:'YourVTOPPasswordHere'},'FS',function(data){
// 	console.log(data);
// });

// coursePageScrape({regno:'YourRegisterNoHere',passwd:'YourVTOPPasswordHere'},'WS',function(data){
// 	console.log(data);
// });

// timetableScrape({regno:'YourRegisterNoHere',passwd:'YourVTOPPasswordHere'},'FS',function(data){
// 	console.log(data);
// });

// courseDetailsScrape({regno:'YourRegisterNoHere',passwd:'YourVTOPPasswordHere'},'WS',function(data,credits){
// 	console.log(data,credits);
// });

// facultyScrape({regno:'YourRegisterNoHere',passwd:'YourVTOPPasswordHere'},'vijayasherly',function(data){
// 	console.log(data);
// });

// spotlightScrape({regno:'YourRegisterNoHere',passwd:'YourVTOPPasswordHere'},function(data){
// 	console.log(data);
// });

// messageScrape({regno:'YourRegisterNoHere',passwd:'YourVTOPPasswordHere'},function(data){
// 	console.log(data[1]['Fall Semester 2016~17']);
// });

// profileScrape({regno:'YourRegisterNoHere',passwd:'YourVTOPPasswordHere'},function(data){
// 	console.log(data);
// });

// cgpaScrape({regno:'YourRegisterNoHere',passwd:'YourVTOPPasswordHere'},'FS',function(data){
// 	console.log(data);
// });

// attendanceScrape({regno:'YourRegisterNoHere',passwd:'YourVTOPPasswordHere'},'WS',function(data){
// 	console.log(data);
// });


function autocaptcha(callback){
	var Request=unirest.get('https://vtop.vit.ac.in/student/captcha.asp')
						.jar(initialJar)
						.end(Captcha);

	function Captcha(res){
		var pixelMap=parser.getPixelMapFromBuffer(new Buffer(res.body));
		var captcha=parser.getCaptcha(pixelMap);
		callback(captcha,initialJar);
	}
}


function login(details,callback){
	autocaptcha(function(captcha,jar){
		var Request=unirest.post('https://vtop.vit.ac.in/student/stud_login_submit.asp')
							.form({
								regno:details.regno,
								passwd:details.passwd,
								vrfcd:captcha,
								message:""
							})
							.jar(jar)
							.end(function(res){
								if(res.error){
									console.log(res.error);
								}
								else{
									var $=cheerio.load(res.body);
									var message=$("input[name=message]").val();
									var cookie=cache.get('cookie');
									cache.put('cookie',jar.getCookieString("https://vtop.vit.ac.in/student/stud_login_submit.asp"),10000);
									var cookie=cache.get('cookie');
									cookie.split(';').forEach((x) => {
									    jar.setCookie(request.cookie(x), 'https://vtop.vit.ac.in/student/');
									});
									if(message=="Invalid Register No. or Password."){
										callback(message);
									}
									else{
										callback(jar);
									}
								}
							});
	});
}





function attendanceScrape(details,sem,callback){
	var startdate=startDate(sem);
	var currentdate=currentDate();
	login({regno:details.regno,passwd:details.passwd},function(jar){
		var url="https://vtop.vit.ac.in/student/attn_report.asp?sem="+sem+"&fmdt="+startdate+"&todt="+currentdate;
		var Request=unirest.get(url)
							.jar(jar)
							.end(function(res){
								var Request=unirest.get(url)
													.jar(jar)
													.end(scrapeData);
							});
	});

	function scrapeData(res){
		var $=cheerio.load(res.body);
		var tables=$('table');
		var table=$(tables[4]);
		var arr=new Array();
		for(i=1;i<table.find('tr').length;i++){
			var obj=new Object;
			obj["courseCode"]=table.find('tr').eq(i).find('td').eq(1).text().trim();
			obj["courseTitle"]=table.find('tr').eq(i).find('td').eq(2).text().trim();
			obj["courseType"]=table.find('tr').eq(i).find('td').eq(3).text().trim();
			obj["slot"]=table.find('tr').eq(i).find('td').eq(4).text().trim();
			obj["attnClass"]=table.find('tr').eq(i).find('td').eq(6).text().trim();
			obj["totClass"]=table.find('tr').eq(i).find('td').eq(7).text().trim();
			obj["attnPercentage"]=table.find('tr').eq(i).find('td').eq(8).text().trim();
			obj["status"]=table.find('tr').eq(i).find('td').eq(9).text().trim();
			arr.push(obj);
		}
		callback(arr);
	}
}

function cgpaScrape(details,sem,callback){
	var startdate=startDate(sem);
	var currentdate=currentDate();
	login({regno:details.regno,passwd:details.passwd},function(jar){
		var url="https://vtop.vit.ac.in/student/attn_report.asp?sem="+sem+"&fmdt="+startdate+"&todt="+currentdate;
		var Request=unirest.get(url)
							.jar(jar)
							.end(function(res){
								var Request=unirest.get(url)
													.jar(jar)
													.end(scrapeData);
							});
	});
	function scrapeData(res){
		var $=cheerio.load(res.body);
		var tables=$('table');
		var table=$(tables[1]);
		callback(table.find('tr').eq(1).find('td').eq(1).text().trim());

	}
}


function profileScrape(details,callback){
	login({regno:details.regno,passwd:details.passwd},function(jar){
		var url="https://vtop.vit.ac.in/student/profile_personal_view.asp";
		var Request=unirest.get(url)
							.jar(jar)
							.end(function(res){
								var Request=unirest.get(url)
													.jar(jar)
													.end(scrapeData);
							});
	});

	function scrapeData(res){
		var $=cheerio.load(res.body);
		var tables=$('table');
		var table=$(tables[3]);
		var obj=new Object;
		obj["name"]=table.find('tr').eq(1).find('td').eq(1).text().trim();
		obj["dob"]=table.find('tr').eq(2).find('td').eq(1).text().trim();
		obj["gender"]=table.find('tr').eq(3).find('td').eq(1).text().trim();
		obj["email"]=table.find('tr').eq(7).find('td').eq(1).text().trim();
		obj["block"]=table.find('tr').eq(10).find('td').eq(1).text().trim();
		obj["room"]=table.find('tr').eq(11).find('td').eq(1).text().trim();
		obj["mobno"]=table.find('tr').eq(26).find('td').eq(1).text().trim();
		callback(obj);

	}
}


function messageScrape(details,callback){
	login({regno:details.regno,passwd:details.passwd},function(jar){
		var url="https://vtop.vit.ac.in/student/stud_home.asp";
		var Request=unirest.get(url)
							.jar(jar)
							.end(function(res){
								var Request=unirest.get(url)
													.jar(jar)
													.end(scrapeData);
							});
	});

	function scrapeData(res){
		var $=cheerio.load(res.body);
		var tables=$('table');
		var table=$(tables[4]);
		var sem=table.find('tr').eq(1).text().trim();
		var message=new Object;
		var arr=new Array();
		var messages=new Array();
		for (i=2;i<table.find('tr').length-3;i=i+5){
			var obj=new Object;
			obj['faculty']=table.find('tr').eq(i).find('td').eq(2).text().trim();
			obj['course']=table.find('tr').eq(i+1).find('td').eq(2).text().trim();
			obj['message']=table.find('tr').eq(i+2).find('td').eq(2).text().trim();
			obj['sent']=table.find('tr').eq(i+3).find('td').eq(2).text().trim();
			arr.push(obj);
		}
		message[sem]=arr;
		messages.push(message);



		var table=$(tables[5]);
		var sem=table.find('tr').eq(1).text().trim();
		var message=new Object;
		var arr=new Array();
		for (i=2;i<table.find('tr').length-3;i=i+5){
			var obj=new Object;
			obj['faculty']=table.find('tr').eq(i).find('td').eq(2).text().trim();
			obj['course']=table.find('tr').eq(i+1).find('td').eq(2).text().trim();
			obj['message']=table.find('tr').eq(i+2).find('td').eq(2).text().trim();
			obj['sent']=table.find('tr').eq(i+3).find('td').eq(2).text().trim();
			arr.push(obj);
		}
		message[sem]=arr;		
		messages.push(message);
		callback(messages);

	}
}

function spotlightScrape(details,callback){
	login({regno:details.regno,passwd:details.passwd},function(jar){
		var url="https://vtop.vit.ac.in/student/stud_home.asp";
		var Request=unirest.get(url)
							.jar(jar)
							.end(function(res){
								var Request=unirest.get(url)
													.jar(jar)
													.end(scrapeData);
							});
	});
	function scrapeData(res){
		var $=cheerio.load(res.body);
		var tables=$('table');
		var table=$(tables[2]);
		var spotlight=new Array();
		for(i=0;i<table.find('a').length;i++){
			var obj=new Object;
			var link=table.find('a').eq(i).attr('href');
			var l=link.search("asp");
			if(l!==-1){
				link='https://vtop.vit.ac.in/student/'+link;
			}
			var name=table.find('a').eq(i).find('font').text();
			obj["link"]=link;
			obj["name"]=name;
			spotlight.push(obj);
		}
		callback(spotlight);
	}
}


function facultyScrape(details,name,callback){
	login({regno:details.regno,passwd:details.passwd},function(jar){
		var url="https://vtop.vit.ac.in/student/getfacdet.asp?x=Mon,%2031%20Jan%202017%2011:15:53%20GMT&fac="+name;
		var Request=unirest.get(url)
							.jar(jar)
							.end(function(res){
								var Request=unirest.get(url)
													.jar(jar)
													.end(function(res){
														var $=cheerio.load(res.body);
														var empid="https://vtop.vit.ac.in/student/"+$("a").attr("href");
														var Request=unirest.get(empid)
																			.jar(jar)
																			.end(scrapeData);
													});
							});


	function scrapeData(res){
		var $=cheerio.load(res.body);
		var img='https://vtop.vit.ac.in/student/'+$('img').attr("src");
		    
		var tables=$('table');
		var table=$(tables[1]);
		var obj=new Object;
		obj['name']=table.find('tr').eq(1).find('td').eq(1).text().trim();
		obj['school']=table.find('tr').eq(2).find('td').eq(1).text().trim().trim().trim();
		obj['designation']=table.find('tr').eq(3).find('td').eq(1).text().trim().trim();
		obj['venue']=table.find('tr').eq(4).find('td').eq(1).text().trim();
		obj['image']=img;
		var table=$(tables[2]);
		var arr=new Array();
		for(i=1;i<table.find('tr').length;i++){
			var open=new Object;
			open['day']=table.find('tr').eq(i).find('td').eq(0).text().trim();
			open['from']=table.find('tr').eq(i).find('td').eq(1).text().trim();
			open['to']=table.find('tr').eq(i).find('td').eq(2).text().trim();
			arr.push(open);
		}
		obj["openhours"]=arr;
		callback(obj);
	}
	});
}


function courseDetailsScrape(details,sem,callback){
	login({regno:details.regno,passwd:details.passwd},function(jar){
		var url="https://vtop.vit.ac.in/student/course_regular.asp?sem="+sem;
		var Request=unirest.get(url)
							.jar(jar)
							.end(function(res){
								var Request=unirest.get(url)
													.jar(jar)
													.end(scrapeData);
							});
	
	function scrapeData(res){
		var $=cheerio.load(res.body);
		var tables=$('table');
		var table=$(tables[1]);
		var arr=new Array();
		for(i=1;i<table.find('tr').length-2;i++){
			var obj=new Object;	
			if(table.find('tr').eq(i).find('td').length==15){
				obj["classnbr"]=table.find('tr').eq(i).find('td').eq(2).text().trim();	
				obj["code"]=table.find('tr').eq(i).find('td').eq(3).text().trim();
				obj["title"]=table.find('tr').eq(i).find('td').eq(4).text().trim();
				obj["type"]=table.find('tr').eq(i).find('td').eq(5).text().trim();
				obj["credits"]=table.find('tr').eq(i).find('td').eq(6).text().trim();
				obj["slot"]=table.find('tr').eq(i).find('td').eq(9).text().trim();
				obj["venue"]=table.find('tr').eq(i).find('td').eq(10).text().trim();
				obj["faculty"]=table.find('tr').eq(i).find('td').eq(11).text().trim();
			}
			if(table.find('tr').eq(i).find('td').length==10){
				obj["classnbr"]=table.find('tr').eq(i).find('td').eq(0).text().trim();	
				obj["code"]=table.find('tr').eq(i).find('td').eq(1).text().trim();
				obj["title"]=table.find('tr').eq(i).find('td').eq(2).text().trim();
				obj["type"]=table.find('tr').eq(i).find('td').eq(3).text().trim();
				obj["credits"]=table.find('tr').eq(i).find('td').eq(4).text().trim();
				obj["slot"]=table.find('tr').eq(i).find('td').eq(7).text().trim();
				obj["venue"]=table.find('tr').eq(i).find('td').eq(8).text().trim();
				obj["faculty"]=table.find('tr').eq(i).find('td').eq(9).text().trim();
			}
			arr.push(obj);
		}
		var credits=table.find('tr').eq(table.find('tr').length-2).text().trim();
		callback(arr,jar,credits);
	}
	});
}





function timetableScrape(details,sem,callback){
	login({regno:details.regno,passwd:details.passwd},function(jar){
		var url="https://vtop.vit.ac.in/student/course_regular.asp?sem="+sem;
		var Request=unirest.get(url)
							.jar(jar)
							.end(function(res){
								var Request=unirest.get(url)
													.jar(jar)
													.end(scrapeData);
							});
	});
	function scrapeData(res){
		var $=cheerio.load(res.body);
		var tables=$('table');
		var table=$(tables[2]);
		var timetable=new Array();
		for(i=2;i<7;i++){
			var day=new Array();
			for (j=1;j<12;j++){
				var obj=new Object;
				if(table.find('tr').eq(i).find('td').eq(j).text().length>14){
					var str=table.find('tr').eq(i).find('td').eq(j).text().trim();
					var res=str.split(" - ");
					var localobj={code:res[0],type:res[1],venue:res[2],slot:res[3]};
					obj[table.find('tr').eq(1).find('td').eq(j).text().trim()]=localobj;
					day.push(obj);
				}
			}
			timetable.push(day);
		}
		callback(timetable);
	}
}



function coursePageScrape(details,sem,callback){
	var details=details;
	function dataReady(callback){
		courseDetailsScrape(details,sem,function(courses,jar){
			var arr=new Array();
			courses.forEach(function(course){
				var obj=new Object;
				if(course.type=='Embedded Theory'){
					crstp='ETH';
				}
				else if(course.type=='Embedded Lab'){
					crstp='ELA';
				}
				else if(course.type=='Theory Only'){
					crstp='TH';
				}
				else if(course.type=='Lab Only'){
					crstp='LA';
				}
				else{
					crstp='DONT';
				}
				if(crstp!='DONT'){
					obj["crstp"]=crstp;
					obj["sem"]=sem;
					obj["classnbr"]=course.classnbr;
					obj['title']=course.title;
					obj["crscd"]=course.code;
					obj["crpnvwcmd"]="View";
					arr.push(obj);
				}
				
			});
			callback(arr,jar);
		});	
	}
	dataReady(function(datas,jar){
		var final=new Array();
			datas.forEach(function(data){
				if(data.crstp!=='DONT'){
					var Request=unirest.post("https://vtop.vit.ac.in/student/coursepage_plan_display.asp")
										.jar(jar)
										.form({
											sem: data.sem,
											classnbr: data.classnbr,
											crscd: data.crscd,
											crstp: data.crstp,
											crpnvwcmd: data.crpnvwcmd
										})
										.end(function(res){
											
											var Request=unirest.post("https://vtop.vit.ac.in/student/coursepage_plan_display.asp")
																.jar(jar)
																.form({
																	sem: data.sem,
																	classnbr: data.classnbr,
																	crscd: data.crscd,
																	crstp: data.crstp,
																	crpnvwcmd: data.crpnvwcmd
																})
																.end(scrapeData);
										});
				}
				
			
		
	function scrapeData(res){
		var finalObj=new Array();
		var $=cheerio.load(res.body);
		var tables=$('table');
		var table=$(tables[1]);
		var subject=table.find('tr').eq(1).find('td').eq(1).text().trim()+' - '+data.crstp;
		var table=$(tables[3]);
		var arr=new Array();
		for (i=1;i<table.find('tr').length;i++){
			var obj=new Object;
			obj['date']=table.find('tr').eq(i).find('td').eq(1).text().trim();
			obj['Title']=table.find('tr').eq(i).find('td').eq(3).text().trim();
			var a=new Array();
			for (j=0;j<table.find('tr').eq(i).find('td').eq(4).find("a").length;j++){
				var obj1=new Object;
				obj1["link"]=table.find('tr').eq(i).find('td').eq(4).find("a").eq(j).attr('href');
				obj1['name']=table.find('tr').eq(i).find('td').eq(4).find("a").eq(j).text().trim();
				a.push(obj1);
			}
			
			obj['details']=a;
			if(obj.details[0]!==undefined){
				arr.push(obj);
			}
			
			
		}
		finalObj[subject]=arr;
		final.push(finalObj);
		if(datas.length==final.length){
			callback(final);
		}
	}
		
		
	});
		
	});
}


function digitalAssignmentScrape(details,sem,callback){
	var details=details;
	function dataReady(callback){
		courseDetailsScrape(details,sem,function(courses,jar){
			var arr=new Array();
			courses.forEach(function(course){
				var obj=new Object;
				if(course.type=='Embedded Theory'){
					crstp='ETH';
				}
				else if(course.type=='Embedded Lab'){
					crstp='ELA';
				}
				else if(course.type=='Theory Only'){
					crstp='TH';
				}
				else if(course.type=='Lab Only'){
					crstp='LA';
				}
				else{
					crstp='DONT';
				}
				if(crstp!='DONT'){
					obj["crstp"]=crstp;
					obj["sem"]=sem;
					obj["classnbr"]=course.classnbr;
					obj['title']=course.title;
					obj["crscd"]=course.code;
					obj["daprocmd"]="Process";
					arr.push(obj);
				}
				
			});
			callback(arr,jar);
		});	
	}

	dataReady(function(datas,jar){
		var final=new Array();
		datas.forEach(function(data){
				var Request=unirest.post("https://vtop.vit.ac.in/student/marks_da_process.asp")
									.jar(jar)
									.form({
										sem:sem,
										classnbr:data.classnbr,
										crscd:data.crscd,
										crstp:data.crstp,
										daprocmd:data.daprocmd,
									})
									.end(scrapeData);
			

			function scrapeData(res){
				var finalObject=new Object;
				var $=cheerio.load(res.body);
				var tables=$("table");
				var table=$(tables[2]);
				var arr=new Array();
				for(i=2;i<table.find('tr').length-1;i++){
					var obj=new Object;
					if(data.crstp=='ETH'||data.crstp=='TH'){
						obj['title']=table.find('tr').eq(i).find('td').eq(1).text().trim();
						obj['duedate']=table.find('tr').eq(i).find('td').eq(2).text().trim();
						obj['status']=table.find('tr').eq(i).find('td').eq(6).text().trim();
						obj['score']=table.find('tr').eq(i).find('td').eq(7).text().trim();
					}
					else if(data.crstp=='ELA'||data.crstp=='LA'){
						obj['title']=table.find('tr').eq(i).find('td').eq(1).text().trim();
						obj['duedate']="Semester End";
						obj['status']=table.find('tr').eq(i).find('td').eq(5).text().trim();
						obj['score']=table.find('tr').eq(i).find('td').eq(6).text().trim();
					}
					
					arr.push(obj);
				}
				finalObject[data.title+' - '+data.crstp]=arr;
				final.push(finalObject);
				if(datas.length==final.length){
					callback(final);
				}
			}
		});
	});



}


function proctorScrape(details,callback){
	login({regno:details.regno,passwd:details.passwd},function(jar){
		var url="https://vtop.vit.ac.in/student/faculty_advisor_view.asp";
		var Request=unirest.get(url)
							.jar(jar)
							.end(function(res){
								var Request=unirest.get(url)
													.jar(jar)
													.end(function(res){
														var $=cheerio.load(res.body);
														var tables=$('table');
														var table=$(tables[1]);
														var obj=new Object;
														obj['name']=table.find('tr').eq(1).find('td').eq(1).text().trim();
														obj['designation']=table.find('tr').eq(2).find('td').eq(1).text().trim();
														obj['school']=table.find('tr').eq(3).find('td').eq(1).text().trim();
														obj['phone']=table.find('tr').eq(4).find('td').eq(1).text().trim();
														obj['email']=table.find('tr').eq(5).find('td').eq(1).text().trim();
														obj['cabin']=table.find('tr').eq(6).find('td').eq(1).text().trim();
														obj["image"]='https://vtop.vit.ac.in/student/'+$('img').attr('src');
														callback(obj);
													});
							});
	});
	

}


function marksScrape(details,sem,callback){
	login({regno:details.regno,passwd:details.passwd},function(jar){
		var url="https://vtop.vit.ac.in/student/marks.asp?sem="+sem;
		var Request=unirest.get(url)
							.jar(jar)
							.end(function(res){
								var Request=unirest.get(url)
													.jar(jar)
													.end(scrapeData);
							});
	});
	function scrapeData(res){
		var $=cheerio.load(res.body);
		var tables=$('table');
		var table=$(tables[1]);
		var final=new Object;
		
		for(i=1;i<table.find(">tr").length;i=i+2){
			if(table.find(">tr").eq(i+1).text().trim()!==''){
				var name=table.find(">tr").eq(i).find('td').eq(3).text().trim();
				var arr=new Array();
				for (j=1;j<table.find(">tr").eq(i+1).find('tr').length;j++){
					var obj=new Object;
					obj['title']=table.find(">tr").eq(i+1).find('tr').eq(j).find('td').eq(1).text().trim();
					obj['max']=table.find(">tr").eq(i+1).find('tr').eq(j).find('td').eq(2).text().trim();
					obj['weightage']=table.find(">tr").eq(i+1).find('tr').eq(j).find('td').eq(3).text().trim();
					obj['status']=table.find(">tr").eq(i+1).find('tr').eq(j).find('td').eq(4).text().trim();
					obj['scored']=table.find(">tr").eq(i+1).find('tr').eq(j).find('td').eq(5).text().trim();
					obj['weightagemarks']=table.find(">tr").eq(i+1).find('tr').eq(j).find('td').eq(6).text().trim();
					arr.push(obj);
				}
				final[name]=arr;
			}

		}
		callback(final);
	}	
}





function startDate(sem){
	var d=new Date();
	var year=d.getFullYear().toString();
	if(sem=='WS'){
		startdate='01-Jan-'+year;
	}
	if(sem=='FS'){
		startdate='01-Jul-'+year;
	}
	return startdate;
}


function currentDate(){
	var d=new Date();
	var monthnum=d.getMonth();
	var month;
	var date=d.getDate().toString();
	var year=d.getFullYear().toString();
	if(date<10){
		date="0"+date;
	}
	if(monthnum==0) month="Jan";
	if(monthnum==1) month="Feb";
	if(monthnum==2) month="Mar";
	if(monthnum==3) month="Apr";
	if(monthnum==4) month="May";
	if(monthnum==5) month="Jun";
	if(monthnum==6) month="Jul";
	if(monthnum==7) month="Aug";
	if(monthnum==8) month="Sep";
	if(monthnum==9) month="Oct";
	if(monthnum==10) month="Nov";
	if(monthnum==11) month="Dec";

	var currentdate=date+"-"+month+"-"+year;
	return currentdate;
}


exports.marksScrape=marksScrape;
exports.proctorScrape=proctorScrape;
exports.digitalAssignmentScrape=digitalAssignmentScrape;
exports.coursePageScrape=coursePageScrape;
exports.timetableScrape=timetableScrape;
exports.courseDetailsScrape=courseDetailsScrape
exports.facultyScrape=facultyScrape;
exports.spotlightScrape=spotlightScrape;
exports.messageScrape=messageScrape;
exports.profileScrape=profileScrape;
exports.cgpaScrape=cgpaScrape;
exports.attendanceScrape=attendanceScrape;