// const hamb = document.querySelector("#header-menu-hamb");
// const popup = document.querySelector("#popup");
// const menu = document.querySelector("#menu").cloneNode(1);
// const body = document.body;

// hamb.addEventListener("click", hambHandler);

// function hambHandler(e) {
//   e.preventDefault();
//   popup.classList.toggle("open");
//   hamb.classList.toggle("active");
//   body.classList.toggle("noscroll");
//   renderPopup();
// }

// function renderPopup() {
//   popup.appendChild(menu);
// }

const hamb = document.querySelector("#header-menu-hamb");
const popup = document.querySelector("#popup");
const body = document.body;

function updatePopupMenu() {
  const originalMenu = document.querySelector("#menu");
  const menu = originalMenu.cloneNode(true);
  
  const user = JSON.parse(localStorage.getItem('currentUser'));
  const adminLink = menu.querySelector("#adminPanelLink");
  
  if (user && user.role === 'admin' && adminLink) {
    adminLink.style.display = 'block';
  } else if (adminLink) {
    adminLink.style.display = 'none';
  }
  
  popup.innerHTML = '';
  popup.appendChild(menu);
}

hamb.addEventListener("click", hambHandler);

function hambHandler(e) {
  e.preventDefault();
  popup.classList.toggle("open");
  hamb.classList.toggle("active");
  body.classList.toggle("noscroll");

  if (popup.classList.contains("open")) {
    updatePopupMenu();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  const adminLink = document.getElementById('adminPanelLink');
  
  if (user && user.role === 'admin' && adminLink) {
    adminLink.style.display = 'block';
  } else if (adminLink) {
    adminLink.style.display = 'none';
  }

  updatePopupMenu();
});