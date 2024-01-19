var hidden1 = true;
var hidden2 = true;
document.onscroll = () => {
    var b = document.getElementById("chart-container").offsetTop;
    var cardRow = document.getElementById("cardRow").offsetTop;
    var y = window.scrollY + window.innerHeight;
    if ((y > b) && hidden1) {
        hidden1 = false;
        makeGraph();
    }
    if ((y > cardRow) && hidden2) {
        hidden2 = false;
        var i = 0;
        const j = setInterval(() => {
            console.log(i / 100);
            i += 1;
            document.getElementById("cardRow").style.scale = i / 100;
            document.getElementById("cardRow").style.opacity = i / 100;
            if (i > 100) {
                clearInterval(j);
            }
        }, 20);

    }
}
function makeGraph() {
    fetch("./getData").then(res => res.json())
        .then(data => {
            var ctx1 = document.getElementById('barChart').getContext('2d');
            var ctx2 = document.getElementById('pieChart1').getContext('2d');
            var ctx3 = document.getElementById('pieChart2').getContext('2d');
            const highestCTC_data = data.highestCTC_data;
            const averageCTC_data = data.averageCTC_data;
            const myChart = new Chart(ctx1, {
                type: 'bar',
                data: {
                    labels: ['CSE', "ECE", "EE", "MECH", "CHE", "CIVIL", "META"],
                    datasets: [{
                        label: 'Highest CTC',
                        data: highestCTC_data,
                        backgroundColor: [
                            '#7446f8'
                        ],
                        borderColor: [
                            '#7446f8'
                        ],
                        borderWidth: 1
                    }, {
                        label: 'Average CTC',
                        data: averageCTC_data,
                        backgroundColor: [
                            '#f86246',
                        ],
                        borderColor: [
                            '#f86246',
                        ],
                        borderWidth: 1,

                    }]
                },
                options: {
                    animation: { duration: 5000, delay: 1000 },
                    scales: {
                        x: {

                            grid: {
                                display: false,
                                borderWidth: 2,
                                borderColor: 'black',
                            }
                        },
                        y: {
                            grid: {
                                display: false,
                                borderWidth: 2,
                                borderColor: 'black',
                            }
                        }
                    }
                }
            });
            //pieChart 1
            var myPieChart1 = new Chart(ctx2, {
                type: 'doughnut',
                data: {
                    datasets: [{
                        data: highestCTC_data,
                        backgroundColor: ["#dd0909", "#fe2101", "#ff4b01", "#fe7424", "#fe9801", "#ffab48", "#f79a47"],
                        borderWidth: 0
                    }],
                    labels: ['CSE', "ECE", "EE", "MECH", "CHE", "CIVIL", "META"]
                },
                options: {
                    // responsive: true,
                    // maintainAspectRatio: false,
                    legend: {
                        position: 'bottom',
                        labels: {
                            fontColor: 'rgb(154, 154, 154)',
                            fontSize: 20,
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    pieceLabel: {
                        render: 'percentage',
                        fontColor: 'white',
                        fontSize: 14,
                    },
                    tooltips: false,
                    layout: {
                        padding: {
                            left: 20,
                            right: 20,
                            top: 20,
                            bottom: 20
                        }
                    },
                    animation: { duration: 5000, delay: 3000 }
                }
            })

            //pieChart 2
            var myPieChart2 = new Chart(ctx3, {
                type: 'doughnut',
                data: {
                    datasets: [{
                        data: averageCTC_data,
                        backgroundColor: ["#300f68", "#4a2599", "#5f16bd", "#7a2adf", "#8338fc", "#9e6edf", "#d9bef7"],
                        borderWidth: 0
                    }],
                    labels: ['CSE', "ECE", "EE", "MECH", "CHE", "CIVIL", "META"]
                },
                options: {
                    // responsive: true,
                    // maintainAspectRatio: false,
                    legend: {
                        position: 'bottom',
                        labels: {
                            fontColor: 'rgb(154, 154, 154)',
                            fontSize: 15,
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    pieceLabel: {
                        render: 'percentage',
                        fontColor: 'white',
                        fontSize: 14,
                    },
                    tooltips: false,
                    layout: {
                        padding: {
                            left: 20,
                            right: 20,
                            top: 20,
                            bottom: 20
                        }
                    },
                    animation: { duration: 5000, delay: 5000 }
                }
            })

        });
}
//hamburger
// const hamburger = document.querySelector(".hamburger");
// const navMenu = document.querySelector(".navMenu");

// hamburger.addEventListener("click", () => {
//     hamburger.classList.toggle("active");
//     navMenu.classList.toggle("active");
// })

document.querySelectorAll(".navLink").forEach(n => n.addEventListener("click", () => {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
}));
(function () {
    'use strict'
    const forms = document.querySelectorAll('.requires-validation')
    Array.from(forms)
        .forEach(function (form) {
            form.addEventListener('submit', function (event) {
                if (!form.checkValidity()) {
                    event.preventDefault()
                    event.stopPropagation()
                }

                form.classList.add('was-validated')
            }, false)
        })
})()
