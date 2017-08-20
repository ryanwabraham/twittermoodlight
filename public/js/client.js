(function() {
    //define socket connection
    //var socket = io.connect('http://localhost:9000');
    var socket = io.connect('http://52.9.87.161/');
    var body = document.body;
    var menuOpen = document.getElementsByClassName('menu-open');
    var main = document.getElementById('main');
    var moodDisplay = document.getElementById('mood');
    var tweetsPerSecond = document.getElementById('tweets-per-second');
    var aboutIcon = document.getElementById('about-icon');
    var closeIcon = document.getElementById('close-icon');
    var projectTitle = document.querySelector('#about > h2');
    var projectDescription = document.querySelector('#about > p');

    aboutIcon.addEventListener('click', function(event) {
        event.stopPropagation();
        body.classList.add('menu-open');
        closeIcon.classList.add('animated', 'quick', 'rotateIn');
        projectTitle.classList.add('animated', 'quick', 'fadeInUp');
        setTimeout(function() {
            projectDescription.classList.add('animated', 'quick', 'fadeInUp');
        }, 100);
    });

    main.addEventListener('click', menuIsOpen);
    closeIcon.addEventListener('click', menuIsOpen);
    window.addEventListener('keyup', function(e){ if (e.keyCode == 27) menuIsOpen(); }, false);

    function menuIsOpen() {
        if (body.classList.contains('menu-open')) {
            body.classList.remove('menu-open');
            closeIcon.classList.remove('animated', 'quick', 'rotateIn');
            projectTitle.classList.remove('animated', 'quick', 'fadeInUp');
            projectDescription.classList.remove('animated', 'quick', 'fadeInUp');
        }
    }

    function changeFavicon(emotion) {
        var favicon = document.querySelector('link[rel="shortcut icon"]');
        
        if (!favicon) {
            favicon = document.createElement('link');
            favicon.setAttribute('rel', 'shortcut icon');
            var head = document.querySelector('head');
            head.appendChild(favicon);
        }
        
        favicon.setAttribute('type', 'image/x-icon');
        favicon.setAttribute('href', 'img/' + emotion + '.ico');
    }

    socket.on('moodChange', function(emotion) {
        if (!emotion) {
            emotion = 'happy';
        }

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
        if (!tps) {
            emotion = 15;
        }
        //console.log(tps);
        tweetsPerSecond.innerText = tps;
    });
})();