(function () {

    // enable/disable
    const applicationToggle = document.querySelector('#application-toogle');
    applicationToggle.addEventListener('change', change => {
        document.querySelector('.page-content > section').classList.toggle('application-disabled');

        if (change.target.checked) {
            await chrome.tabs.executeScript({
                file: 'index.js'
            });
            window.Spotlight.enable();
        }
        else {
            window.Spotlight.disable();
        }
    });

    // bind spot value
    const spotSize = document.querySelector('#spot-size');
    const s1 = document.querySelector('#s1');
    s1.addEventListener('input', function (event) {
        spotSize.innerHTML = s1.value;
    }, false);
    s1.addEventListener('change', function (event) {
        localStorage.setItem('spot-size', s1.value);
    }, false);

    // spot type
    const effectItems = Array.from(document.querySelectorAll('section > div.effect-item'));
    effectItems.forEach(item => {
        item.addEventListener('click', click => {
            // order is important here!
            document.querySelector('.effect--selected').classList.remove('effect--selected');
            item.classList.add('effect--selected');

            // show the associated config section
            const type = item.getAttribute('data-type');
            Array.from(document.querySelectorAll('[data-config]')).map(section => {
                section.style.cssText = 'display:none';
            });

            if (type === 'spot') {
                const typeSpot = document.querySelector('[data-config="spot"]');
                typeSpot.style.cssText = 'display:flex';
            }
        });
    });
})();