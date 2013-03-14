
$(document).on('keydown', function(e) {
    switch(e.keyCode) {
    case 37:
        // left
        if(ws.admin) {
            moveSlides(currentSlide(), prevSlide(), 'right');
        }
        break;
    case 39:
        // right
        if(ws.admin) {
            moveSlides(currentSlide(), nextSlide(), 'left');
        }
        break;
    case 80:
        // admin login
        var form = $('.password-form');
        form.show();

        var pass = form.children('[name=password]');
        pass.focus();

        form.children('button').click(function() {
            login(pass.val());
            pass.val('');
        });
        pass.on('keyup', function(e) {
            if(e.keyCode == 13) {
                login(pass.val());
                pass.val('');
            }
        });

        e.preventDefault();
        return false;
    case 70:
        // fullscreen
        var b = document.body;

        if(b.mozRequestFullScreen) {
            b.mozRequestFullScreen();
        }
        else if(b.webkitRequestFullScreen()) {
            b.webkitRequestFullScreen();
        }
    }
});

function currentSlide() {
    return $('.slide.current');
}

function nextSlide() {
    var slides = $('.slide');
    var i = slides.indexOf($('.slide.current')[0]);

    if(i < slides.length - 1) {
        return slides[i + 1];
    }
    return null;
}

function prevSlide() {
    var slides = $('.slide');
    var i = slides.indexOf($('.slide.current')[0]);

    if(i > 0) {
        return slides[i - 1];
    }
    return null;
}

function moveSlides(from, to, dir) {
    if(!to) {
        return;
    }

    from = $(from);
    to = $(to);

    from.removeClass('current').css({
        transform: ('translate(' +
                    (dir == 'left' ? '-100%' : '100%') +
                    ', 0)'),
        '-webkit-transform': ('translate(' +
                              (dir == 'left' ? '-100%' : '100%') +
                              ', 0)')

    });

    showSlide(to);
}

function showSlide(slide) {
    $(slide).addClass('current').css({ 
        transform: 'translate(0, 0)',
        '-webkit-transform': 'translate(0, 0)'
    });

    var slides = $('.slide');
    var i = slides.indexOf($('.slide.current')[0]);
    window.location.hash = i + 1;
}

function onTransitionEnd(e) {
    var el = $(e.target);

    if(el.is('.current')) {
        initSlide(el);
    }
}

function initSlide(el) {
    var title = classify(el.children('h1').text());
    var helper = slideHelpers[title];

    if(helper) {
        if(!helper.inited && helper.init) {
            helper.init();
            helper.inited = true;
        }
    }

    showContentToViewer(title);

    $('a', el).attr('target', '_new');
}

function onSlidesReady() {
    $('.slides > .slide')
        .on('transitionend', onTransitionEnd)
        .on('webkitTransitionEnd', onTransitionEnd);

    var hash = window.location.hash || '';
    var slideN = parseInt(window.location.hash.slice(1));

    if(slideN) {
        var slides = $('.slide');
        showSlide(slides[slideN - 1]);
    }
    else {
        showSlide($('.slide').first());
    }

    initSlide($('.slide.current'));
}
