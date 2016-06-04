(function () {

    if ('speechSynthesis' in window) {
        speechSynthesis.getVoices();  // work around Chrome issue where first call returns nothing
        document.querySelector('.audio').style.display = 'block';
    }

    var text = document.querySelector('.the-mark-consists-of p').textContent,
        cursor = document.getElementById('cursor'),
        header = document.querySelector('header'),
        logoShirt = header.querySelector('.shirt');

    function putLeafOnShirt() {
        cursor.classList.remove('initial');
        cursor.style.left = header.offsetLeft + logoShirt.offsetLeft + (logoShirt.offsetWidth * 0.5) - (cursor.offsetWidth * 0.5);
        cursor.style.top = logoShirt.offsetTop + ((logoShirt.offsetHeight * 0.5) - (cursor.offsetHeight * 0.5));
        cursor.setAttribute('data-initial-left', cursor.style.left);
        cursor.setAttribute('data-initial-top', cursor.style.top);
    }

    window.setTimeout(putLeafOnShirt, 100);
    window.addEventListener('resize', putLeafOnShirt);

    document.getElementById('play').addEventListener('click', function () {

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
        speechSynthesis.speak(msg);

        msg.addEventListener('end', onEnd);

        /**
         * @param {Element} el - element to get position data for
         * @returns {Object} object containing left/right position data relative to document
         */
        function getOffsetPosition(el) {
            var bounds = el.getBoundingClientRect();
            return {
                top: (typeof window.scrollY !== 'undefined' ? window.scrollY : window.pageYOffset) + bounds.top,
                left: (typeof window.scrollX !== 'undefined' ? window.scrollX : window.pageXOffset) + bounds.left
            };
        }

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
                    cursor.style.left = (offset.left + (el.offsetWidth * 0.5)) - (cursor.offsetWidth * 0.5) + 'px';
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

    window.setTimeout(function () {
        var shirt = document.querySelector('.shirt-area');
        shirt.classList.add('flipping');

        function transitionListener() {
            if (shirt.classList.contains('flipping')) {
                shirt.classList.remove('flipping');
                shirt.classList.add('flipped');
            }
        }
        shirt.addEventListener('transitionend', transitionListener, true);
        shirt.addEventListener('webkitTransitionend', transitionListener, true);

        // At least in Chrome, transitionend sometimes fires well after transition is complete --
        // catch this case with a timeout.
        window.setTimeout(function () {
            if (!shirt.classList.contains('flipped')) {
                shirt.removeEventListener('transitionend');
                shirt.removeEventListener('webkitTransitionend');
                transitionListener();
            }
        }, 1200);

    }, 100);

}());
