var socket = io.connect('http://52.9.87.161/'),
    body = document.body,
    head = document.querySelector('head');
    menuOpen = document.getElementsByClassName('menu-open'),
    main = document.getElementById('main'),
    moodDisplay = document.getElementById('mood'),
    tweetsPerSecond = document.getElementById('tweets-per-second'),
    aboutIcon = document.getElementById('about-icon'),
    closeIcon = document.getElementById('close-icon'),
    projectTitle = document.querySelector('#about > h2'),
    projectDescription = document.querySelector('#about > p');

function toggleMenu() {
    if (body.classList.contains('menu-open')) {
        body.classList.remove('menu-open');
        closeIcon.classList.remove('animated', 'quick', 'rotateIn');
        projectTitle.classList.remove('animated', 'quick', 'fadeInUp');
        projectDescription.classList.remove('animated', 'quick', 'fadeInUp');
    } else {
        body.classList.add('menu-open');
        closeIcon.classList.add('animated', 'quick', 'rotateIn');
        projectTitle.classList.add('animated', 'quick', 'fadeInUp');
        setTimeout(function() {
            projectDescription.classList.add('animated', 'quick', 'fadeInUp');
        }, 100);
    }
}

function changeFavicon(emotion) {
    var favicon = document.querySelector('link[rel="shortcut icon"]');

    if (!favicon) {
        favicon = document.createElement('link');
        favicon.setAttribute('rel', 'shortcut icon');
        favicon.setAttribute('type', 'image/x-icon');
        head.appendChild(favicon);
    }

    favicon.setAttribute('href', 'img/' + emotion + '.ico');
}

// client event listeners

aboutIcon.addEventListener('click', function(e) {
    e.stopPropagation();
    toggleMenu();
});
main.addEventListener('click', toggleMenu);
closeIcon.addEventListener('click', toggleMenu);
window.addEventListener('keyup', function(e){ if (e.keyCode == 27) toggleMenu(); }, false);

// socket event listeners

socket.on('moodChange', function(emotion) {
    if (!emotion) emotion = 'happy';

    main.className = "";
    main.classList.add(emotion);
    moodDisplay.className = "";
    moodDisplay.classList.add('animated', 'fadeOut');
    changeFavicon(emotion);
    setTimeout(function(){
        moodDisplay.innerText = emotion;
        moodDisplay.classList.add('animated', 'fadeInUp');
    }, 1000);
})

socket.on('tps', function(tps) {
    if (!tps) tps = 15;
    tweetsPerSecond.innerText = tps;
});
