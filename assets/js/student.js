var optionboxes = document.querySelectorAll(".option");
optionboxes.forEach((box) => {
    box.addEventListener('click', () => {
        if (!box.classList.contains('clicked_th')) {
            optionboxes.forEach((box) => {
                box.classList.remove('clicked_th');
            });
            box.classList.add('clicked_th')
        }
    })
})

// const statusButton = document.getElementById("readStatus");
// if (statusButton) {
//     statusButton.addEventListener("click", () => {
//         if (document.getElementById(statusButton).innerHTML === "Mark as Read") {
//             document.getElementById(statusButton).innerHTML = "Mark as Unread";
//         }
//         else {
//             document.getElementById(statusButton).innerHTML = "Mark as Read";
//         }
//     })
// }