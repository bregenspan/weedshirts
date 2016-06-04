require('tapjs');  // supplies tap event

var slugify = require('./lib/slugify'),
    impatientCssTransitionListener = require('./lib/transition-listener'),
    getOffsetPosition = require('./lib/offset');

(function () {

    var serialNumber = document.getElementById('serialNumber'),
        markName = document.getElementById('name'),
        desiredLocation,
        slug;

    if (!serialNumber) {
        return;
    }
    serialNumber = serialNumber.textContent;
    slug = markName ? slugify(markName.textContent) + '-' : '';
    desiredLocation = '/tm/' + slug + serialNumber;

    if ('speechSynthesis' in window) {
        speechSynthesis.getVoices();  // work around Chrome issue where first call returns nothing
        document.querySelector('.audio').style.display = 'block';
    }

    var text = document.querySelector('.the-mark-consists-of p').textContent,
        cursor = document.getElementById('cursor'),
        header = document.querySelector('header'),
        logoShirt = header.querySelector('.shirt');

    // Permalink
    if (window.location.href.indexOf(desiredLocation) < 0) {
        history.replaceState({
            tm: serialNumber
        }, '', desiredLocation);
    }

    function putLeafOnShirt() {
        // FIXME: ugly hardcode -- we need to know the size of the icon once the CSS transition
        // has finished, before it has ended, which is hard to do cleanly.
        var iconWidth = 20,
            iconHeight = 20;

        cursor.classList.remove('initial');
        function moveLeaf() {
            var shirtOffset = getOffsetPosition(shirt);
            cursor.style.left = shirtOffset.left + (shirtOffset.width * 0.5) - (iconWidth * 0.5);
            cursor.style.top =  shirtOffset.top + ((shirtOffset.height * 0.5) - (iconHeight * 0.5));
            cursor.setAttribute('data-initial-left', cursor.style.left);
            cursor.setAttribute('data-initial-top', cursor.style.top);
        }
        moveLeaf();
        impatientCssTransitionListener(cursor, function () {
            document.body.classList.remove('initial');
            // After the animation is finished, there might be a scrollbar on the document,
            // resulting in need to re-adjust position of the absolutely-positioned leaf.
            // TODO: fix more cleanly by using relative positioning for leaf until audio mode is activated.
            moveLeaf();
        }, 1000);
        window.addEventListener('resize', moveLeaf);
    }

    window.setTimeout(putLeafOnShirt, 100);

    // Transition in shirt image area
    window.setTimeout(function () {
        var shirt = document.querySelector('.shirt-area');
        shirt.classList.add('flipping');
        impatientCssTransitionListener(shirt, function transitionListener() {
            if (this.classList.contains('flipping')) {
                this.classList.remove('flipping');
                this.classList.add('flipped');
            }
        }, 1200);
    }, 100);

    // Handle Random button (by just going to homepage for now)
    document.getElementById('random').addEventListener('tap', function () {
        window.location.href = '/';
    });

    // Handle playing text-to-speech + "follow the bouncing ball"
    document.getElementById('play').addEventListener('tap', function () {

        function onEnd() {
            document.querySelector('.the-mark-consists-of p').innerHTML = text;
            cursor.style.top = cursor.getAttribute('data-initial-top');
            cursor.style.left = cursor.getAttribute('data-initial-left');
        }

        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
            onEnd();
            return;
        }
        var msg = new SpeechSynthesisUtterance(document.querySelector('.the-mark-consists-of p').textContent.substr(0, 1000));
        msg.voice = speechSynthesis.getVoices().filter(function (voice) {
            return voice.name == 'Bad News';
        })[0];
        if (!msg.voice || msg.voice.name !== 'Bad News') {
            msg.pitch = 0;
            msg.rate = 0.4;
        }
        speechSynthesis.speak(msg);

        msg.addEventListener('end', onEnd);

        /**
         * @param {Element} el - element to position leaf icon above
         */
        function placeLeafAbove(el) {

            if (!el) {
                return;
            }

            var OFFSET_MIN = -10,
                OFFSET_MAX = -20,
                offset = getOffsetPosition(el);

            cursor.style.top = (offset.top + OFFSET_MIN) + 'px';
            cursor.style.left = offset.left + 'px';

            // Follow the bouncing ball
            window.setTimeout(function () {
                var offset;
                if (el && el.parentNode) {  // ensure el still in DOM
                    offset = getOffsetPosition(el);
                    cursor.style.top = (offset.top + OFFSET_MAX) + 'px';
                    cursor.style.left = (offset.left + (offset.width * 0.5)) - (getOffsetPosition(cursor).width * 0.5) + 'px';
                }
            }, 200);
        }

        msg.addEventListener('boundary', function (e) {
            var match = text.substr(e.charIndex).match(/^[\w\-]+\b/),
                newText, word;
            if (match && match[0]) {
                newText = text.substr(0, e.charIndex) + '<em>' + match[0] + '</em>' + text.substr(e.charIndex + match[0].length);
                document.querySelector('.the-mark-consists-of p').innerHTML = newText;
                word = document.querySelector('.the-mark-consists-of p em');
                placeLeafAbove(word);
            }
        });
    });

}());
