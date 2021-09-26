"use-strict";
window.addEventListener('load', start);

let studentsDisplay = [];
let currentStudents = [];
let expelledStudents = [];
let gryffindorStudents = [];
let hufflepuffStudents = [];
let slytherinStudents = [];
let ravenclawStudents = [];
let prefects = [];
let inquisitorial = [];

let popups = [];

let hacked = false;

let selectedFilter = 0;
let searchStudents = [];

const Student = {
    firstName: "",
    middleName: "",
    nickname: "",
    lastName: "",
    house: "",
    photo: "",
    blood: "",
    gender: "",
    expelled: false,
    prefect: false,
    inquisitorial: false,
    responsibilities: 0
}

function start() {
    searching();
    sorting();
    filtering();
    loadStudents();
}

/**
 * READ AND SAVE DATA
 */

async function loadStudents() {
    const response = await fetch('https://petlatkea.dk/2021/hogwarts/students.json');
    const data = await response.json();
    getStudentsData(data);
}

function getStudentsData(data) {
    currentStudents = data.map(createStudentsObjets);
    currentStudents = currentStudents.sort(compareFirstName);
    studentsDisplay = currentStudents;
    searchStudents = currentStudents;
    showStudentsTable();
}

function createStudentsObjets(data) {
    const student = Object.create(Student);
    let fullName = data.fullname.trimStart().trimEnd().split(' ');
    student.firstName = fullName[0].charAt(0).toUpperCase() + fullName[0].slice(1).toLowerCase();
    if (fullName[1] != undefined) {
        if (fullName[2] != undefined) {
            if (fullName[1].charAt(0) === '"') {
                fullName[1] = fullName[1].replace(/['"]+/g, '');
                student.nickname = fullName[1].charAt(0).toUpperCase() + fullName[1].slice(1).toLowerCase();
            }else {
                student.middleName = fullName[1].charAt(0).toUpperCase() + fullName[1].slice(1).toLowerCase();
            }
            student.lastName = fullName[2].charAt(0).toUpperCase() + fullName[2].slice(1).toLowerCase();
        }else {
            student.lastName = fullName[1].charAt(0).toUpperCase() + fullName[1].slice(1).toLowerCase();
        }
    }
    student.house = data.house.trimStart().charAt(0).toUpperCase() + data.house.trimStart().trimEnd().slice(1).toLowerCase();
    student.photo = getPhoto(student);
    student.blood = getBlood(student);
    student.gender = data.gender;
    student.expelled = false;
    student.responsabilities = 0;
    return student;
}

function getPhoto (student) {
    let photo;
    if (student.lastName != "") {
        if (student.lastName.indexOf("-") > -1) {
            const l = student.lastName.split('-');
            photo = "images/" + l[1] + "_" + student.firstName.charAt(0).toLowerCase() + ".png";
        } else if (student.lastName === "Patil") {
            photo = "images/" + student.lastName.toLowerCase() + "_" + student.firstName.toLowerCase() + ".png";
        }else {
            photo = "images/" + student.lastName.toLowerCase() + "_" + student.firstName.charAt(0).toLowerCase() + ".png";
        }
    }else {
        photo = "drawings/default.png";
    }
    return photo;
}

fetch('https://petlatkea.dk/2021/hogwarts/families.json')
.then(function (response) {
    return response.json();
})
.then(function (data) {
    bloodData = data;
})
.catch(function (err) {
    console.log(err);
});

// Create the name for the students photos
function getBlood(student) {
    let blood;
    if (bloodData.half.includes(student.lastName)) {
        blood = '' + 'half blood';
    }else if (bloodData.pure.includes(student.lastName)) {
        blood = '' + 'pure blood';
    }else {
        blood = '' + 'muggle blood';
    }
    return blood;
}

function getHouseStudents() {
    gryffindorStudents = [];
    hufflepuffStudents = [];
    slytherinStudents = [];
    ravenclawStudents = [];
    currentStudents.forEach(function(student) {
        switch(student.house) {
            case "Gryffindor":
                gryffindorStudents.push(student);
                break;
            case "Hufflepuff":
                hufflepuffStudents.push(student);
                break;
            case "Slytherin":
                slytherinStudents.push(student);
                break;
            case "Ravenclaw":
                ravenclawStudents.push(student);
                break;
            default:
                break;
        }
    });
}

/**
 * DISPLAY DATA
 */

function showGeneralInfo() {
    getHouseStudents();
    document.getElementById("gryffindor").innerHTML = "Gryffindor: " + gryffindorStudents.length;
    document.getElementById("slytherin").innerHTML = "Slytherin: " + slytherinStudents.length;
    document.getElementById("hufflepuff").innerHTML = "Hufflepuff: " + hufflepuffStudents.length;
    document.getElementById("ravenclaw").innerHTML = "Ravenclaw: " + ravenclawStudents.length;
    document.getElementById("numStudents").innerHTML = "Students: " + currentStudents.length;
    document.getElementById("expelled").innerHTML = "Expelled: " + expelledStudents.length;
    document.getElementById("display").innerHTML = "Displayed: " + studentsDisplay.length;
}

// Display the list of students
function showStudentsTable() {
    showGeneralInfo();
    studentsDisplay.forEach(function(student, i) {
        popups[i] = createModal(student, i);
    });

    const studentsTable = document.getElementById("studentsTable");
    const body = studentsTable.querySelector("tbody");
    body.innerHTML = "";
    studentsDisplay.forEach(function(student, i) {
        let tr = document.createElement('tr');
        tr.appendChild(document.createElement('td'));
        tr.appendChild(document.createElement('td'));
        tr.appendChild(document.createElement('td'));
        tr.cells[0].appendChild(createCell(student.firstName));
        tr.cells[1].appendChild(createCell(student.lastName));

        if (student.prefect === true) {
            tr.cells[2].appendChild(createPrefectIcon(student.house));
        }

        if (student.inquisitorial === true) {
            tr.cells[2].appendChild(createInquisitorialIcon());
        }
        
        tr.style.cursor = "pointer";
        tr.addEventListener('click', function() {
            closeAllPopups();
            popups[i].style.display = 'block';
        });
        body.appendChild(tr);
    });

    const bottomSpace = document.getElementById("bottomSpace");
    bottomSpace.style.height = 2400 - 55*body.rows.length + "px";
}

function createCell(column) {
    const item = document.createElement('div');
    item.innerHTML = column;
    return item;
}

function createPrefectIcon(house) {
    const item = document.createElement("img");
    item.src = 'drawings/prefect' + house + '.png';
    item.style.height = "30px";
    item.style.width = "30px";
    return item;
}

function createInquisitorialIcon() {
    const item = document.createElement("img");
    item.src = 'drawings/inquisitorialBadge.png';
    item.style.height = "30px";
    item.style.width = "30px";
    return item;
}

function closeAllPopups() {
    popups.forEach(function(p) {
        p.style.display = 'none';
    });
}

/**
 * FILTER
 */

 function filtering() {
    document.getElementById("filter0").checked = true;
    const filters = document.querySelectorAll(".checkbox");
    filters.forEach(function(filter) {
        filter.addEventListener('change', function() {
            selectedFilter = parseInt(filter.value);
            for (let i=0; i<filters.length; i++) {
                filters[i].checked = false;
            }
            filters[selectedFilter].checked = true;
            handleFilter();
        });
    });
}

function handleFilter() {
    closeAllPopups();
    resetSort();
    switch (selectedFilter) {
        case 0:
            studentsDisplay = currentStudents;
            break;
        case 1:
            studentsDisplay = expelledStudents;
            break;
        case 2:
            studentsDisplay = prefects;
            break;
        case 3:
            studentsDisplay = inquisitorial;
            break;
        case 4:
            studentsDisplay = gryffindorStudents;
            break;
        case 5:
            studentsDisplay = hufflepuffStudents;
            break;
        case 6:
            studentsDisplay = slytherinStudents;
            break;
        case 7:
            studentsDisplay = ravenclawStudents;
            break;
    }
    searchStudents = studentsDisplay;
    showStudentsTable();
}

function resetFilter() {
    selectedFilter = 0;
    document.getElementById("filter0").checked = true;
    document.getElementById("filter1").checked = false;
    document.getElementById("filter2").checked = false;
    document.getElementById("filter3").checked = false;
    document.getElementById("filter4").checked = false;
    document.getElementById("filter5").checked = false;
    document.getElementById("filter6").checked = false;
}

/**
 * SORT
 */

function sorting() {
    let sort = document.getElementById("sortOptions");
    sort.addEventListener('change', function() {
      closeAllPopups();
      document.getElementById('sortingHat').classList.add("sortingAni");
      setTimeout(function() {
        document.getElementById('sortingHat').classList.remove("sortingAni");
        handleSort();
      }, 1550);
    });
    reverse();
}

function reverse() {
    let reverse = document.getElementById("reverse");
    reverse.addEventListener('click', function() {
        studentsDisplay = studentsDisplay.reverse();
        showStudentsTable();
    });
}

function handleSort() {
    const sortOptions = document.getElementById("sortOptions");
    document.getElementById('sortingHat').classList.add("scale");
    switch (sortOptions.value) {
        case "0":
            studentsDisplay = studentsDisplay.sort(compareFirstName);
            break;
        case "1":
            studentsDisplay = studentsDisplay.sort(compareLastName);
            break;
        case "2":
            studentsDisplay = studentsDisplay.sort(compareHouse);
            break;
        case "3":
            studentsDisplay = studentsDisplay.sort(compareResponsibilities);
            break;
    }
    searchStudents = studentsDisplay;
    showStudentsTable();
}

function compareFirstName(a,b) {
    if (a.firstName < b.firstName){
      return -1;
    }
    if (a.firstName > b.firstName){
      return 1;
    }
    return 0;
}

function compareLastName(a,b) {
    if (a.lastName < b.lastName){
      return -1;
    }
    if (a.lastName > b.lastName){
      return 1;
    }
    return 0;
}

function compareHouse(a,b) {
    if (a.house < b.house){
      return -1;
    }
    if (a.house > b.house){
      return 1;
    }
    return 0;
}

function compareResponsibilities(a,b) {
    if (a.responsibilities > b.responsibilities){
      return -1;
    }
    if (a.responsibilities < b.responsibilities){
      return 1;
    }
    return 0;
  }

function resetSort() {
    document.getElementById("sortOptions").value = 0;
    handleSort();
}


/**
 * SEARCH
 */

function searching() {
    let input = document.getElementById("search");
    input.addEventListener('keyup', function() {
        closeAllPopups();
        studentsDisplay = [];
        let inputLowerCase = input.value.toLowerCase();
        let inputUpperCase;
        if (input.value.length >= 2) {
            inputUpperCase = input.value.charAt(0).toUpperCase() + input.value.slice(1).toLowerCase();
        }else {
            inputUpperCase = input.value.toUpperCase();
        }
        searchStudents.forEach(function(student) {
            if (student.firstName.indexOf(inputUpperCase) > -1 || student.firstName.indexOf(inputLowerCase) > -1) {
                studentsDisplay.push(student);
            }else {
                if (student.lastName.indexOf(inputUpperCase) > -1 || student.lastName.indexOf(inputLowerCase) > -1) {
                    studentsDisplay.push(student);
                }
            }
        });
        showStudentsTable();
        if(inputLowerCase === "hex") {
            hackTheSystem();
        }
    });
}

function resetSearch() {
    document.getElementById("search").value = '';
}


/**
 * POPUP
 */

const alert = document.getElementById("alert");
document.getElementById("alertClose").addEventListener('click', function() {
    alert.style.display = "none";
});

function createModal(student, i) {
    const popup = document.createElement("div");
    popup.classList.add("modal");
    popup.id = student.firstName;
    popup.style.backgroundRepeat = "no-repeat";
    popup.style.backgroundSize =  "100%";
    popup.style.backgroundPosition =  "center";
    popup.style.backgroundImage = "url('drawings/popup" + student.house + ".png')";
    popup.style.backgroundRepeat = "no-repeat";
    popup.style.backgroundSize =  "100%";
    popup.style.backgroundPosition =  "center";

    const popupContent = document.createElement("div");
    popupContent.classList.add("popupContent");

    const close = document.createElement("button");
    close.type = "button";
    close.classList.add("close");
    close.addEventListener('click', function() {
        popup.style.display = 'none';
    });
    popupContent.appendChild(close);
    popupContent.appendChild(document.createElement("div"));

    const photo = document.createElement("img");
    photo.src = student.photo;
    photo.classList.add("photo");
    popupContent.appendChild(photo);

    const firstName = document.createElement("div");
    firstName.textContent = "First Name: " + student.firstName;
    popupContent.appendChild(firstName);

    const middleName = document.createElement("div");
    if (student.middleName != "") {
        middleName.textContent = "Middle Name: " + student.middleName;
    }
    popupContent.appendChild(middleName);

    const nickname = document.createElement("div");
    if (student.nickname != "") {
        nickname.textContent = "Nickname: " + student.nickname;
    }
    popupContent.appendChild(nickname);

    const lastName = document.createElement("div");
    if (student.lastName != "") {
        lastName.textContent = "Last Name: " + student.lastName;
    }
    popupContent.appendChild(lastName);

    const house = document.createElement("div");
    house.textContent = "House: " + student.house;
    popupContent.appendChild(house);

    const blood = document.createElement("div");
    blood.textContent = "Blood: " + student.blood;
    popupContent.appendChild(blood);

    if (student.expelled != true) {
        const responsibilities = document.createElement("div");
        responsibilities.textContent = "Responsabilities: ";
        popupContent.appendChild(responsibilities);

        const prefect = document.createElement("input");
        prefect.type = "checkbox";
        prefect.id = "prefect" + i;
        prefect.checked = student.prefect;
        prefect.addEventListener('change', function() {
            handlePrefect(prefect, i);
        });
        popupContent.appendChild(prefect);

        const prefectText = document.createElement("label");
        prefectText.innerHTML = "Prefect";
        popupContent.appendChild(prefectText);
        popupContent.appendChild(document.createElement("div"));

        const inquisitorial = document.createElement("input");
        inquisitorial.type = "checkbox";
        inquisitorial.id = "inquisitorial" + i;
        inquisitorial.innerText = "Inquisitorial";
        inquisitorial.checked = student.inquisitorial;
        inquisitorial.addEventListener('change', function() {
            handleInquisitorial(inquisitorial, i);
        });
        popupContent.appendChild(inquisitorial);

        const inquisitorialText = document.createElement("label");
        inquisitorialText.innerHTML = "Inquisitorial";
        popupContent.appendChild(inquisitorialText);
        popupContent.appendChild(document.createElement("div"));
        
        if (student.expelled === false) {
            const expell = document.createElement("button");
            expell.type = "button";
            expell.classList.add("expellBtn");
            expell.innerHTML = "EXPELL";
            expell.addEventListener('click', function() {
                handleExpell(i);
            });
            popupContent.appendChild(expell);
        }
    }else {
        const responsibilities = document.createElement("div");
        responsibilities.textContent = "Responsabilities: none";
        popupContent.appendChild(responsibilities);

        const expellText = document.createElement("div");
        expellText.classList.add("expellTxt");
        expellText.innerHTML = "EXPELLED";
        popupContent.appendChild(expellText);
    }

    popup.appendChild(popupContent);
    popup.display = 'none';
    document.getElementById("modalSpace").appendChild(popup);
    return popup;
}

function handlePrefect(checkbox, i) {
    if (checkbox.checked === true) {
        const housePrefects = getNumPrefectsHouse().housePrefects;
        const numPrefects = getNumPrefectsHouse().numPrefects;
        if (numPrefects.g === 2 || numPrefects.h === 2 || numPrefects.s === 2 || numPrefects.r === 2) {
            document.getElementById("alertText").innerHTML = "THERE ARE ALREADY </br> 2 PREFECTS </br> IN THIS HOUSE";
            alert.style.display = "block";
            checkbox.checked = false;
        } else if (housePrefects.includes(studentsDisplay[i].house + ' ' + studentsDisplay[i].gender)) {
            document.getElementById("alertText").innerHTML = "THERE IS ALREADY </br> A " + studentsDisplay[i].gender.toUpperCase() + " PREFECT </br> IN THIS HOUSE";
            alert.style.display = "block";
            checkbox.checked = false;
        }else {
            studentsDisplay[i].responsibilities++;
            studentsDisplay[i].prefect = true;
            prefects.push(studentsDisplay[i]);
        }
    }else {
        studentsDisplay[i].responsibilities--;
        studentsDisplay[i].prefect = false;
        let prefectDelete = [studentsDisplay[i]];
        prefects = prefects.filter(function(item) {
            if (!prefectDelete.includes(item)) {
                return item;
            }
        });
    }
    showResponsibilitiesSelection(i);
}

function getNumPrefectsHouse() {
    let housePrefects = [];
    let numPrefects = [];
    let g = 0;
    let h = 0;
    let s = 0;
    let r = 0;
    prefects.forEach(function(prefect) {
        switch (prefect.house) {
            case "Gryffindor":
                g++;
                if (prefect.gender === "girl") {
                    housePrefects.push("Gryffindor girl");
                }else {
                    housePrefects.push("Gryffindor boy");
                }
                break;
            case "Hufflepuff":
                h++;
                if (prefect.gender === "girl") {
                    housePrefects.push("Hufflepuff girl");
                }else {
                    housePrefects.push("Hufflepuff boy");
                }
                break;
            case "Slytherin":
                s++;
                if (prefect.gender === "girl") {
                    housePrefects.push("Slytherin girl");
                }else {
                    housePrefects.push("Slytherin boy");
                }
                break;
            case "Ravenclaw":
                r++;
                if (prefect.gender === "girl") {
                    housePrefects.push("Ravenclaw girl");
                }else {
                    housePrefects.push("Ravenclaw boy");
                }
                break;
        }
    });
    numPrefects = {g,h,s,r};
    return {housePrefects, numPrefects};
}

function handleInquisitorial(checkbox, i) {
    if (checkbox.checked === true) {
        if (studentsDisplay[i].blood == 'pure blood' || studentsDisplay[i].house == 'Slytherin') {
            studentsDisplay[i].responsibilities++;
            studentsDisplay[i].inquisitorial = true;
            inquisitorial.push(studentsDisplay[i]);
        } else {
            document.getElementById("alertText").innerHTML = "THIS STUDENT CAN'T </br> BE A MEMBER OF THE </br> INQUISITORIAL SQUAD";
            alert.style.display = "block";
            checkbox.checked = false;
            studentsDisplay[i].inquisitorial = false;
        }
    }else {
        studentsDisplay[i].responsibilities--;
        studentsDisplay[i].inquisitorial = false;
        let inquisitorialDelete = [studentsDisplay[i]];
        inquisitorial = inquisitorial.filter(function(item) {
            if (!inquisitorialDelete.includes(item)) {
            return item;
            }
        });
    }
    showResponsibilitiesSelection(i);
}

function handleExpell(i) {
    if (studentsDisplay[i].expelled != 'permanent') {
        studentsDisplay[i].expelled = true;
        if (!expelledStudents.includes(studentsDisplay[i])) {
            expelledStudents.push(studentsDisplay[i]);
        }
        currentStudents = currentStudents.filter(eliminateObject);
        getHouseStudents();
        prefects = prefects.filter(eliminateObject);
        studentsDisplay[i].prefect = false;
        inquisitorial = inquisitorial.filter(eliminateObject);
        studentsDisplay[i].inquisitorial = false;
        closeAllPopups();

        document.getElementById("expellAlert").style.display = "block";
        document.getElementById("expellAlert").classList.add("expellAni");
        setTimeout(function() {
            document.getElementById("expellAlert").classList.remove("expellAni");
            document.getElementById("expellAlert").style.display = "none";
            handleFilter();
        }, 2000);
    }
}
 
function eliminateObject(item) {
    if (!expelledStudents.includes(item)) {
        return item;
    }
}

function showResponsibilitiesSelection(i) {
    handleFilter();
    studentsDisplay.forEach(function(student) {
        if (student.firstName === popups[i].id) {
            popups[i].style.display = 'block';
        }
    });
}

/**
 * HACKING
 */

 function hackTheSystem() {
    if (hacked === false) {
        hacked = true;

        currentStudents = currentStudents.concat(expelledStudents);
        currentStudents = currentStudents.sort(compareFirstName);
        currentStudents.forEach(function(student){student.expelled=false});
        expelledStudents = [];
        addMyself();
        mixBloodStatus();

        resetFilter();
        resetSort();
        resetSearch();

        document.getElementById("content").style.display = "none";
        document.getElementById("pixies").style.display = "block";
        setTimeout(function() {
            document.getElementById("content").style.display = "block";
            document.getElementById("pixies").style.display = "none";
            handleFilter();
            document.getElementById("s1").style.display = 'block';
            document.getElementById("s2").style.display = 'block';
            let timer = setInterval(deleteLastInquisitorialMember, 25000);
        }, 10000);
    }
    return "hacked";
}

function addMyself() {
    const myself = Object.create(Student);
    myself.firstName = "Sira";
    myself.lastName = "Gabari";
    myself.house = "Slytherin";
    myself.blood = "pure blood";
    myself.photo = "drawings/gabari_s.png";
    myself.expelled = "permanent";
    myself.responsibilities = 0;
    currentStudents.push(myself);
    currentStudents = currentStudents.sort(compareFirstName);
    getHouseStudents();
}

function mixBloodStatus() {
    currentStudents.forEach(function(student) {
        let bloodStatusArray = ["half blood", "pure blood", "muggle blood"];
        if (student.blood === "pure blood" && student.expelled != "permanent") {
            const random = Math.floor(Math.random() * bloodStatusArray.length);
            student.blood = bloodStatusArray[random];
        }else {
            student.blood = bloodStatusArray[1];
        }
    });
}

function deleteLastInquisitorialMember() {
    document.getElementById("s1").classList.add("sandClockAni");
    document.getElementById("s2").classList.add("sandClockAni");
    setTimeout(function() {
        document.getElementById("s1").classList.remove("sandClockAni");
        document.getElementById("s2").classList.remove("sandClockAni");
        if (inquisitorial.length > 0) {
            let deleteStudent = inquisitorial.pop(inquisitorial);
            studentsDisplay.forEach(function(student) {
                if (student.firstName === deleteStudent.firstName) {
                    student.inquisitorial = false;
                }
            });
        }
        handleFilter();
    }, 10050)
}




