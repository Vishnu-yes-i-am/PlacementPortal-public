var studentBtn = document.getElementById("studentBtn");
var corrdinatorBtn = document.getElementById("corrdinatorBtn");
var recruiterBtn = document.getElementById("recruiterBtn");

var studentForm = document.querySelector("#student-form");
var coordinatorForm = document.querySelector("#coordinator-form");
var recruiterForm = document.querySelector("#recruiter-form");
var forgotButton = document.getElementById("forgotButton");

studentBtn.addEventListener("click", function () {
    forgotButton.onclick = "location.href='/auth/new_recruiter?role=student"
    studentBtn.classList.add('active');
    recruiterBtn.classList.remove('active');
    corrdinatorBtn.classList.remove('active');
    studentForm.style.display = "block";
    coordinatorForm.style.display = "none";
    recruiterForm.style.display = "none";
});

corrdinatorBtn.addEventListener("click", function () {
    forgotButton.onclick = "location.href='/auth/new_recruiter?role=coordintor"
    corrdinatorBtn.classList.add('active');
    recruiterBtn.classList.remove('active');
    studentBtn.classList.remove('active');
    studentForm.style.display = "none";
    coordinatorForm.style.display = "block";
    recruiterForm.style.display = "none";
});

recruiterBtn.addEventListener("click", function () {
    forgotButton.onclick = "location.href='/auth/new_recruiter?role=recruiter"
    recruiterBtn.classList.add('active');
    corrdinatorBtn.classList.remove('active');
    studentBtn.classList.remove('active');
    studentForm.style.display = "none";
    coordinatorForm.style.display = "none";
    recruiterForm.style.display = "block";
});



const pane = document.getElementById("leftPane");
pane.addEventListener('click', () => {
    location.href = "/";
});
pane.style.cursor = "pointer"
