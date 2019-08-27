let app = new Vue({
    el: '#home',
    data: {
        // Temp things
        errorGlobal: null,
        registrationSuccess: false
    }
});

$(document).on('click', 'a[href^="#"]', function (event) {
    if (!event.ctrlKey && !event.metaKey) {
        event.preventDefault();

        // push state $.attr(this, 'href')
        //history.pushState(null, null, $.attr(this, 'href'));

        $('html, body').animate({
            scrollTop: $($.attr(this, 'href')).offset().top
        }, {
                duration: 750,
                easing: 'custom'
            });
    }
});

$.easing.custom = (x, t, b, c, d) => {
    if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
    return c / 2 * ((t -= 2) * t * t + 2) + b;
};