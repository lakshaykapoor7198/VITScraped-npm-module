# VITScraped-npm-module
##NPM module to fully scrape VTOP Student Login


####Works for Winter as well as Fall Semester.

##Enter vtop credentials and get these things:

```
1. Marks
2. Assignment
3. Course page
4. Time Table
5. Course Details
6. Spotlight
7. Messages
8. CGPA
9. Attendance
10. Profile
11. Proctor
```

##Install:
```
npm install vitscraped --save
```

##Examples:
```
var vit=require('vitscraped');
```

Note: FS means *"Fall Semester"* and WS means *"Winter Semester"*

```

vit.marksScrape({regno:'YourRegisterNoHere',passwd:'YourVTOPPasswordHere'},'FS',function(data){
	console.log(data);//all the marks will be returned in JSON format.
});


vit.proctorScrape({regno:'YourRegisterNoHere',passwd:'YourVTOPPasswordHere'},function(data){
	console.log(data);
});

vit.digitalAssignmentScrape({regno:'YourRegisterNoHere',passwd:'YourVTOPPasswordHere'},'FS',function(data){
	console.log(data);
});

vit.coursePageScrape({regno:'YourRegisterNoHere',passwd:'YourVTOPPasswordHere'},'WS',function(data){
	console.log(data);
});

vit.timetableScrape({regno:'YourRegisterNoHere',passwd:'YourVTOPPasswordHere'},'FS',function(data){
	console.log(data);
});

vit.courseDetailsScrape({regno:'YourRegisterNoHere',passwd:'YourVTOPPasswordHere'},'WS',function(data,credits){
	console.log(data,credits);
});

vit.facultyScrape({regno:'YourRegisterNoHere',passwd:'YourVTOPPasswordHere'},'vijayasherly',function(data){
	console.log(data);
});

vit.spotlightScrape({regno:'YourRegisterNoHere',passwd:'YourVTOPPasswordHere'},function(data){
	console.log(data);
});

vit.messageScrape({regno:'YourRegisterNoHere',passwd:'YourVTOPPasswordHere'},function(data){
	console.log(data[1]['Fall Semester 2016~17']);
});

vit.profileScrape({regno:'YourRegisterNoHere',passwd:'YourVTOPPasswordHere'},function(data){
	console.log(data);
});

vit.cgpaScrape({regno:'YourRegisterNoHere',passwd:'YourVTOPPasswordHere'},'FS',function(data){
	console.log(data);
});

vit.attendanceScrape({regno:'YourRegisterNoHere',passwd:'YourVTOPPasswordHere'},'WS',function(data){
	console.log(data);
});

```

##Credits: 
**karthikb351** for CaptchaParser
