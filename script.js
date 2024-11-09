/*==================== toggle icon navbar ====================*/

let menuIcon = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');

menuIcon.onclick = () => {
    menuIcon.classList.toggle('bx-x');
    navbar.classList.toggle('active');
}

/*==================== scroll sections active link ====================*/

window.onscroll = () => {
    menuIcon.classList.remove('bx-x');
    navbar.classList.remove('active');
}

/*==================== scroll reveal ====================*/

ScrollReveal({
    reset: true,
    distance: '80px',
    duration: 2000,
    delay: 200
})

ScrollReveal().reveal('.home-content, .heading', { origin: 'top' });
ScrollReveal().reveal('.home-img, .services-container, .portfolio-box, .contact form', { origin: 'bottom' });
ScrollReveal().reveal('.home-content h1, .about-img', { origin: 'left' });
ScrollReveal().reveal('.home-content p, .about-content', { origin: 'right' });

/*==================== typed js ====================*/

const typed = new Typed('.multiple-text', {
    strings: ['IOS Developer', 'Android Developer', 'Software Engineer'],
    typeSpeed: 100,
    backSpeed: 100,
    backDelay: 1000,
    loop: true
})

document.querySelectorAll('.open-project').forEach(item => {
    item.addEventListener('click', event => {
        event.preventDefault();
        const projectBox = event.target.closest('.portfolio-box');
        const projectName = projectBox.getAttribute('data-project');
        window.open(`projects/${projectName}.html`, '_blank');
    });
});
