
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
        }, 1000);
    }
    else if(msg.showContent) {
        var title = msg.showContent;
        var helper = slideHelpers[title] || {};
        var el = $('.viewer');

        if(el.length) {
            var html = (helper.viewerContent ||
                        '<div class="afternote">' +
                        'Slides will be available after the talk!' +
                        '</div>');

            el.html(html);
            el[0].className = 'current viewer';
            el.addClass(classify(title));

            if(helper.viewer) {
                helper.viewer(el);
            }
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
    var match, accViewer;
    var lines = str.split('\n');
    var slide = {
        title: null,
        content: ''
    };
    
    var viewer = {
        content: ''
    };

    lines.forEach(function(line) {
        if((match = line.match(/^#\s+(.*)$/))) {
            if(slide.title) {
                processSlide(slide, viewer);
            }

            slide.title = match[1];
            slide.content = '';
            viewer.content = '';
        }
        else if((match = line.match(/~~~VIEWER~~~\s*/))) {
            accViewer = true;
        }
        else if((match = line.match(/~~~ENDVIEWER~~~\s*/))) {
            accViewer = false;
        }
        else {
            slide.content += line;

            if(accViewer) {
                viewer.content += line;
            }
        }
    });

    processSlide(slide, viewer);

    // This is only run on master
    if(window.onSlidesReady) {
        window.onSlidesReady();
    }
}

function processSlide(slide, viewer) {
    var i = $('.slides .slide').length;

    // If this is a viewer, this doesn't do anything. Only shows up on
    // master.
    $('.slides').append(
        '<div class="slide ' + classify(slide.title) + '">' +
        '<h1>' + slide.title + '</h1>' +
        '<div class="content">' + slide.content + '</div>' +
        '</div>'
    );

    if(viewer.content) {
        slideHelpers[slide.title] = slideHelpers[slide.title] || {};
        slideHelpers[slide.title].viewerContent = viewer.content;
    }
}

function classify(name) {
    return name.replace(/[\s!?*&]/, '-');
}

function renderMicroBenchmarks() {
    var chromeData = [1.90, 3.67, 1.93, 13.65, 12.66, 3.30, 3.55];
    var fxData = [1.80, 1.77, 6.63, 3.20, 2.14, 3.25, 1.69];
    var asmData = [1.86, 1.26, 1.57, 2.17, 1.74, 1.64, 1.62];
    var nativeData = [1, 1, 1, 1, 1, 1, 1];

    var allData = [];
    for(var i=0; i<chromeData.length; i++) {
        allData.push(chromeData[i]);
        allData.push(fxData[i]);
        //allData.push(asmData[i]);
        allData.push(nativeData[i]);
        allData.push(0);
    }

    var barHeight = 15;
    var allHeight = barHeight * allData.length;

    var d = d3.select('.current .graph').append('svg')
        .attr('width', '100%')
        .attr('height', barHeight * allData.length + 50)
        .append('g')
        .attr('transform', 'translate(100, 15)');

    var x = d3.scale.linear().domain([0, d3.max(allData)]).range(['0%', '80%']);

    var labels = ['copy', 'corrections', 'fannkuch', 'fasta', 'life', 'memops', 'primes'];

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
        .attr('y', function(d, i) { return i * barHeight * 4 + 40; })
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

    // d.selectAll('.bar').data(fxData).enter().append('div')
    //     .style('width', x)
    //     .attr('class', 'bar');

    // d.selectAll('.bar').data(asmData).enter().append('div')
    //     .style('width', x)
    //     .attr('class', 'bar');

    $('.current .label').css({ opacity: 1 });
}

var slideHelpers = {
    'Benchmarks': {
        'init': renderMicroBenchmarks,
        'viewer': renderMicroBenchmarks
    }
};

$.get('slides.md', extractSlides);
