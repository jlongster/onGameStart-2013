
// websocketz

var host = window.document.location.host.replace(/:.*/, '');
var ws = new WebSocket('ws://' + host + ':3999');

ws.onmessage = function(event) {
    console.log(event.data);
};

// slides

function extractSlides(str) {
    var match;
    var lines = str.split('\n');
    var slide = {
        title: null,
        content: ''
    };

    lines.forEach(function(line) {
        if((match = line.match(/^#\s+(.*)$/))) {
            if(slide.title) {
                processSlide(slide);
            }

            slide.title = match[1];
            slide.content = '';
        }
        else {
            slide.content += line;
        }
    });

    processSlide(slide);

    showSlide($('.slide').first());
}

function processSlide(slide) {
    $('body').append(
        '<div class="slide">' +
        '<h1>' + slide.title + '</h1>' +
        '<div class="content">' + slide.content + '</div>' +
        '</div>'
    );
}

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

function moveSlides(from, to, dir, forreal) {
    if(!to || from === to) {
        return;
    }

    if(!forreal) {
        $(from).add(to).css({
            '-webkit-animation-name': '',
            zIndex: 0
        });

        setTimeout(function() {
            moveSlides(from, to, dir, true);
        }, 0);

        return;
    }

    if(from) {
        var out = CSSAnimations.create();
        out.setKeyframes({
            '0%': {
                'transform': 'translate(0, 0)',

                // damnit webkit
                '-webkit-transform': 'translate(0, 0)'
            },
            '100%': {
                'transform': ('translate(' +
                              (dir == 'left' ? '-100%' : '100%') + 
                              ', 0)'),
                '-webkit-transform': ('translate(' +
                                      (dir == 'left' ? '-100%' : '100%') + 
                                      ', 0)')
            }
        });

        $('.current').removeClass('current')
            .css({
                animationName: out.name,
                '-webkit-animation-name': out.name,
                zIndex: 100
            })
            .on('animationend', function() {
                CSSAnimations.remove(out.name);
                $(this).css({ zIndex: 0 }).off('animationend');
            })
            .on('webkitAnimationEnd', function() {
                CSSAnimations.remove(out.name);
                $(this).css({
                    '-webkit-animation-name': '',
                    zIndex: 0,
                }).off('webkitAnimationEnd');
            });
    }

    var show = CSSAnimations.create();
    show.setKeyframes({
        '0%': {
            'transform': ('translate(' +
                          (dir == 'left' ? '100%' : '-100%') +
                          ', 0)'),
            '-webkit-transform': ('translate(' +
                                  (dir == 'left' ? '100%' : '-100%') +
                                  ', 0)')
        },
        '100%': {
            'transform': 'translate(0, 0)',
            '-webkit-transform': 'translate(0, 0)'
        }
    });

    $(to).removeClass('background').addClass('current')
        .css({
            animationName: show.name,
            '-webkit-animation-name': show.name,
            zIndex: 100
        })
        .on('animationend', function() {
            CSSAnimations.remove(show.name);
            $(this).off('animationend');
        })
        .on('webkitAnimationEnd', function() {
            CSSAnimations.remove(show.name);
            $(this).css({
                '-webkit-animation-name': ''
            }).off('webkitAnimationEnd');
        });
}

function showSlide(slide) {
    $('.current').removeClass('current').css({
        zIndex: 0
    });

    $(slide).addClass('current').css({ 
        zIndex: 100
    });
}

$.get('slides.md', extractSlides);

document.addEventListener('keydown', function(e) {
    switch(e.keyCode) {
    case 37:
        // left
        moveSlides(currentSlide(), prevSlide(), 'right');
        break;
    case 39:
        // right
        moveSlides(currentSlide(), nextSlide(), 'left');
        break;
    }
});

