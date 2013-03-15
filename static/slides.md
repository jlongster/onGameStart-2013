
# title-screen

## Compiling Web Apps (needs new title)
### James Long, Mozilla

# broadcast-url

## http:// <a href="http://talk.jlongster.com">talk.jlongster.com</a>
### for additional content as I talk

# Who am I?

* **webdev** for Mozilla
* creator of [3d teapots](http://jlongster.com/s/dom3d/example3.html) on the web with 2d transforms
* hacks on a multiplayer [WebGL FPS game](http://octoshot.jlongster.com/) using binary sockets
* loves game programming since high school

~~~VIEWERONLY~~~
<iframe style="width: 600px; height: 450px; margin: 0 auto; display: block;" src="http://jsfiddle.net/24fK3/46/embedded/result,js,html,css" allowfullscreen="allowfullscreen" frameborder="0"></iframe>
~~~ENDVIEWER~~~                                                

~~~NOTES~~~
* I Love JavaScript!
* Flexible and **huge** reach
* Crazy JIT compilers have made it fast
~~~ENDNOTES~~~

# First, a Confession

<div class="bam">I'm not talking about **HTML5** game performance.</div>

~~~VIEWERONLY~~~
<div class="greynote">thx for letting me hack your browser!</div>
~~~ENDVIEWER~~~

# second-truth

<div class="bam">

I'm talking about how to get the best performance out of
javascript *by compiling to it*.

# JavaScript

<div class="bam">
If you want to run on the web, you *have* to write javascript... 
or **compile** to it!
</div>

# Many Successful Examples

New languages (incentive: different semantics)

* [ClojureScript](https://github.com/clojure/clojurescript), [CoffeeScript](http://coffeescript.org/), [Roy](http://roy.brianmckenna.org/)
* [Many more](https://github.com/jashkenas/coffee-script/wiki/List-of-languages-that-compile-to-JS)

~~~NOTES~~~
As we've seen with these languages, you can be very succesful compiling to javascript; you get the reach of the web and various improvements on semantics that you want.

The only catch is debugging, but that's being solved with source maps.
~~~ENDNOTES~~~

# Many Successful Examples

Established languages (incentive: platform)

* [Google Web Toolkit](https://developers.google.com/web-toolkit/overview) (Java -> js) - Used in many of Google's enterprise web apps (even in 2006!)
* [emscripten](https://github.com/kripken/emscripten) (C/C++ -> LLVM -> js) - Used for lots of games and libraries
* [Script#](http://scriptsharp.com/) (C# -> js) - Used in [Microsoft Office Web Apps](http://office.microsoft.com/en-us/web-apps)

# A Third Incentive

<div class="bam">
Performance
</div>

# Performance

* For certain kinds of apps, it's possible to compile to *faster* javascript than hand-written
* How is that possible? It's still javascript!

<div class="bam">
It's possible!
</div>

# JavaScript as a Platform

* Certainly javascript as a compilation target has been proven to be successful

<div class="bam">
**Could it be that javascript is an "assembly language" for the web?**
</div>

# JavaScript as a Language

* I love javascript!
* Modern engines with JIT compilers with make javascript really fast
* However, some needs are **too extreme** for javascript as hand-written

<div class="bam">
  static typing, immutable data structures, porting large toolchains,
  extremely complex 3d games
</div>

# possibilities

<div class="bam">
Supporting javascript as a compilation target opens the web up to all
sorts of amazing possibilities
</div>

~~~VIEWER~~~
<img src="/img/allthethings.png" />
~~~ENDVIEWER~~~

# Performance Gap

<div class="bam line">
**The fact is there may always be a performance gap between native code and javascript,
but we can shrink it**
</div>

~~~VIEWER~~~
<div class="bam">
Web <img src="/img/gap.jpg" align="middle" /> Native
</div>
~~~ENDVIEWER~~~

# Emscripten

* Compiles LLVM to javascript ([link](https://github.com/kripken/emscripten))
* C/C++ -> LLVM -> js
* Compiled javascript is still normal javascript, how can it be better?

~~~NOTES~~~
It can be better by only picking the parts of javascript that are high
performant, just like you pick the good parts of js
~~~ENDNOTES~~~

# LLVM Optimizations

* LLVM's [optimizations](http://llvm.org/docs/Passes.html) are only possible with compiled code

<div class="bam">
dead code, inline, instcombine, constprop, constmerge, etc.
</div>

* Decades of research gone into these optimizations for C/C++ compilers
* Most of them only possible with compiled code!

# Optimization: Consistent Types

* Modern js engines use **type inference** to optimize code generation
* You need *type consistency* in your js code or inference will fail.
  Compiling a statically typed language to js means it's 100% consistent!

# Enforcing Integers

C/C++ at the lowest level just operate on number types, like int and double.

~~~VIEWER~~~
    var x = foo()|0;   // x is a 32-bit integer
    var y = bar()|0;   // so is y
    return (x + y)|0;  // no type or overflow checks,
                       //   pure 32-bit addition
~~~ENDVIEWER~~~

# Optimization: Typed Arrays

Typed arrays are heavily optimized in modern js engines.

~~~VIEWER~~~
    var MEM8  = new Uint8Array (1024*1024);
    var MEM32 = new Uint32Array (MEM8.buffer); // alias MEM8's data

    function compiledMemoryAccess (x) {
      MEM8 [x] = MEM8 [x+10]; // read from x+10, write to x
      MEM32 [(x+16)>>2] = 100;
    }
~~~ENDVIEWER~~~              

<div class="reference">
Code example from Alon Zakai. Lots of this talk was inspired by his,
seriously <a href="http://www.ustream.tv/recorded/29324270">go watch it!</a>
</div>

# Typed Arrays = Memory

* There is **no** garbage collection with compiled C/C++ to javascript code
* Memory is represented as a large typed array

# Benchmarks (micro)

~~~VIEWER~~~
<div class="key">
     <span>Native</span>
     <span>Chrome</span>
     <span>Firefox</span>
</div>
<div class="graph"></div>

<div class="label">
     Execution times normalized to native [gcc -O2] (lower is better)
</div>
~~~ENDVIEWER~~~

# Benchmarks (real-world)

~~~VIEWER~~~
<div class="key">
     <span>Native</span>
     <span>Chrome</span>
     <span>Firefox</span>
</div>
<div class="graph"></div>

<div class="label">
     Execution times normalized to native [gcc -O2] (lower is better)
</div>
~~~ENDVIEWER~~~

# Is that it?

* The dynamic nature of javascript inherently costs some performance
* Performance is difficult to predict (especially with GC)
* But we want this:

# crysis

~~~VIEWER~~~
![](/img/crysis.jpg)
~~~ENDVIEWER~~~

# crysis2

~~~VIEWER~~~
![](/img/crysis2.jpg)
~~~ENDVIEWER~~~

# asm.js

* A new project from Mozilla that formalizes the subset of javascript
that current C/C++ compilers are targeting
* This is not *adding* anything to javascript, just telling compilers
explicitly where it can optimize
* The result is near-native performance!

# asm.js

* A [draft specification](http://asmjs.org/spec/latest/) is already
online, Firefox has an
[initial implementation](http://hg.mozilla.org/users/lwagner_mozilla.com/odinmonkey/),
and emscripten is already compiling to it.

* And that's just in a couple of months!

# asm.js code

~~~VIEWER~~~
    function square(x) {
        x = +x;
        return +(x*x);
    }

    function test(x) { // sum the square of x 10 times
        x = +x;
        var i = 0;
        var res = 0.0;

        while((i|0) < (10|0)) {
            res = res + square(x);
            i = (i + 1)|0;
        }

        return res;
    }
~~~ENDVIEWER~~~

# Static Typing

asm.js code is fast because all types can be inferred at compile-time,
allowing ahead of time (AOT) compiling. Right now only ints and
doubles exist.

# C/C++ Types

It's easy to take the types from a C/C++ compiler and input them to
the javascript engine.

# Global Analysis

Within an asm.js module, the js engine can analyze the global program
structure (with types) and optimize away.

# It's Just JavaScript

<div class="bam">
**Remember, with or without asm.js the code runs exactly the same. This
simply provides engines an easy way to optimize a path.**
</div>

# So how fast is it?

# asm.js benchmarks (micro)

~~~VIEWER~~~
<div class="key">
     <span>Native</span>
     <span>Firefox+asm.js</span>
     <span>Chrome</span>
     <span>Firefox</span>
</div>
<div class="graph"></div>

<div class="label">
     Execution times normalized to native [gcc -O2] (lower is better)
</div>
~~~ENDVIEWER~~~

# asm.js benchmarks (real-world)

~~~VIEWER~~~
<div class="key">
     <span>Native</span>
     <span>Firefox.asm.js</span>
     <span>Chrome</span>
     <span>Firefox</span>
</div>
<div class="graph"></div>

<div class="label">
     Execution times normalized to native [gcc -O2] (lower is better)
</div>
~~~ENDVIEWER~~~


# Example Assembly Output

I [dumped the output](https://gist.github.com/jlongster/5136299) of an
asm.js module with Firefox's OdinMonkey engine, and compared it to
native code compiled with `gcc -O2`. The amount of instructions is
comparible, though it's a very small test.

<div class="bam">
It's nice to see so few instructions per asm.js line, though!
</div>

# Other Possibilities

If C/C++ runs fast, is it possible to compile full VMs to javascript,
such as Python?

# Other Possibilities

Write a new language that compiles straight to asm.js, and possibly
mix it with javascript? (see [LLJS](http://lljs.org/))
