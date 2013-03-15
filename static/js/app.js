
// websocketz

var host = window.document.location.host.replace(/:.*/, '');
var ws = new WebSocket('ws://' + host + ':3999');

ws.onmessage = function(event) {
    var msg = JSON.parse(event.data);
    if(msg.authenticated) {
        var form = $('.password-form');
        form.html("You're in, good luck!");
        setTimeout(function() {
            form.hide();

            $('body > .greynote').hide();
            $('.slides').show();
            ws.admin = true;
        }, 1000);
    }
    else if(msg.showContent) {
        var title = msg.showContent;
        var helper = slideHelpers[title] || {};
        var el = $('.viewer');

        if(el.length) {
            var html = (helper.viewerContent ||
                        '<div class="greynote">' +
                        'Slides will be available after the talk!' +
                        '</div>');
            
            el.html(html);
            el[0].className = 'current viewer';
            el.addClass(classify(title));

            if(helper.viewer) {
                helper.viewer(el);
            }

            hljs.initHighlighting.called = false;
            hljs.initHighlighting();
        }
    }
};

function login(pass) {
    ws.send(JSON.stringify({
        'authenticate': pass,
        'currentSlide': currentSlide().children('h1').text()
    }));
}

function showContentToViewer(title) {
    ws.send(JSON.stringify({ showContent: title }));
}

// slides

function extractSlides(str) {
    var match, state;
    var lines = str.split('\n');
    var slide = {
        title: null,
        content: ''
    };
    
    var viewer = {
        content: '',
        only: false
    };

    lines.forEach(function(line) {
        if((match = line.match(/^#\s+(.*)$/))) {
            if(slide.title) {
                processSlide(slide, viewer);
            }

            slide.title = match[1];
            slide.content = '';
            viewer.content = '';
            viewer.only = false;
        }
        else if((match = line.match(/~~~VIEWER~~~\s*/))) {
            state = 'viewer';
        }
        else if((match = line.match(/~~~VIEWERONLY~~~\s*/))) {
            state = 'viewer';
            viewer.only = true;
        }
        else if((match = line.match(/~~~ENDVIEWER~~~\s*/))) {
            state = null;
        }
        else if((match = line.match(/~~~NOTES~~~\s*/))) {
            state = 'notes';
        }
        else if((match = line.match(/~~~ENDNOTES~~~\s*/))) {
            state = null;
        }
        else if(state != 'notes') {
            if(!viewer.only) {
                slide.content += line + '\n';
            }

            if(state == 'viewer') {
                viewer.content += line + '\n';
            }
        }
    });

    processSlide(slide, viewer);
    hljs.initHighlighting();

    // This is only run on master
    if(window.onSlidesReady) {
        window.onSlidesReady();
    }
}

function processSlide(slide, viewer) {
    var i = $('.slides .slide').length;
    var safeTitle = classify(slide.title);

    // If this is a viewer, this doesn't do anything. Only shows up on
    // master.
    $('.slides').append(
        '<div class="slide ' + safeTitle + '">' +
        '<h1>' + slide.title + '</h1>' +
        '<div class="content">' + markdown.toHTML(slide.content) + '</div>' +
        '</div>'
    );

    if(viewer.content) {
        slideHelpers[safeTitle] = slideHelpers[safeTitle] || {};
        slideHelpers[safeTitle].viewerContent = markdown.toHTML(viewer.content);
    }
}

function classify(name) {
    return name.replace(/[\s\.'!?*&\:\(\)]/g, '-').toLowerCase();
}

function renderBenchmarks(labels, dataPoints) {
    var allData = [];
    for(var i=0; i<dataPoints[0].length; i++) {
        dataPoints.forEach(function(data) {
            allData.push(data[i]);
        });

        // Push 1 for native and 2 0's for spacing
        allData.push(1);
        allData.push(0);
        allData.push(0);
    }

    var barHeight = 10;
    var allHeight = barHeight * allData.length;

    var d = d3.select('.current .graph').append('svg')
        .attr('width', '100%')
        .attr('height', barHeight * allData.length + 50)
        .append('g')
        .attr('transform', 'translate(100, 15)');

    var x = d3.scale.linear().domain([0, d3.max(allData)]).range(['0%', '80%']);

    d.selectAll('text').data(x.ticks(10)).enter().append('text')
        .attr('class', 'rule')
        .attr('x', x)
        .attr('y', 0)
        .attr('dy', -3)
        .attr('text-anchor', 'middle')
        .text(String);

    d.selectAll('.barlabel').data(labels).enter().append('text')
        .attr('class', 'barlabel')
        .attr('x', -100)
        .attr('y', function(d, i) { return i * barHeight * (dataPoints.length+3) + 40; })
        .text(String);

    d.selectAll('line').data(x.ticks(10)).enter().append('line')
        .attr('x1', x)
        .attr('x2', x)
        .attr('y1', 5)
        .attr('y2', allHeight + 10)
        .style('stroke', '#ccc');
    
    d.selectAll('rect').data(allData).enter().append('rect')
        .attr('y', function(d, i) {
            return i * barHeight + 15;
        })
        .attr('height', barHeight)
        .attr('width', 0)
        .transition()
        .attr('width', x);

    $('.current .label').css({ opacity: 1 });
}

function renderMicroBenchmarks() {
    var labels = ['copy', 'corrections', 'fannkuch', 'fasta', 'life', 'memops', 'primes'];
    var chromeData = [1.90, 3.67, 1.93, 13.65, 12.66, 3.30, 3.55];
    var fxData = [1.80, 1.77, 6.63, 3.20, 2.14, 3.25, 1.69];

    renderBenchmarks(labels, [fxData, chromeData]);
}

function renderLargeBenchmarks() {
    var labels = ['skinning', 'zlib', 'bullet'];
    var chromeData = [28.0, 4.42, 9.5];
    var fxData = [29.64, 11.83, 12.25];

    renderBenchmarks(labels, [fxData, chromeData]);
}

function renderAsmMicroBenchmarks() {
    var labels = ['copy', 'corrections', 'fannkuch', 'fasta', 'life', 'memops', 'primes'];
    var chromeData = [1.90, 3.67, 1.93, 13.65, 12.66, 3.30, 3.55];
    var fxData = [1.80, 1.77, 6.63, 3.20, 2.14, 3.25, 1.69];
    var asmData = [1.86, 1.26, 1.57, 2.17, 1.74, 1.64, 1.62];

    renderBenchmarks(labels, [fxData, chromeData, asmData]);
}

function renderAsmLargeBenchmarks() {
    var labels = ['skinning', 'zlib', 'bullet'];
    var chromeData = [28.0, 4.42, 9.5];
    var fxData = [29.64, 11.83, 12.25];
    var asmData = [2.86, 2.10, 2.1];

    renderBenchmarks(labels, [fxData, chromeData, asmData]);
}

var slideHelpers = {
    'benchmarks--micro-': {
        'init': renderMicroBenchmarks,
        'viewer': renderMicroBenchmarks
    },
    'benchmarks--real-world-': {
        'init': renderLargeBenchmarks,
        'viewer': renderLargeBenchmarks
    },
    'asm-js-benchmarks--micro-': {
        'init': renderAsmMicroBenchmarks,
        'viewer': renderAsmMicroBenchmarks
    },
    'asm-js-benchmarks--real-world-': {
        'init': renderAsmLargeBenchmarks,
        'viewer': renderAsmLargeBenchmarks
    }
};

$.get('slides.md', extractSlides);
