[![Stories in Ready](https://badge.waffle.io/01alchemist/TurboScript.png?label=ready&title=Ready)](https://waffle.io/01alchemist/TurboScript)
# TurboScript [![Build Status](https://travis-ci.org/01alchemist/TurboScript.svg?branch=master)](https://travis-ci.org/01alchemist/TurboScript)
Super charged JavaScript for parallel programming and WebAssembly 
<pre>
    @             _________
     \____       /         \
     /    \     /   ____    \
     \_    \   /   /    \    \
       \    \ (    \__/  )    )          ________  _____  ___  ____
        \    \_\ \______/    /          /_  __/ / / / _ \/ _ )/ __ \
         \      \           /___         / / / /_/ / , _/ _  / /_/ /
          \______\_________/____"-_____ /_/  \____/_/|_/____/\____/
</pre>
  
TurboScript is an experimental programming language for parallel programming for web which compiles to JavaScript (asm.js) and WebAssembly (targeting post-MVP). The syntax is similar to TypeScript (Hardly trying to fill the gaps) and the compiler is open source and written in TypeScript.

This is still an experiment and isn't intended for real use yet. ~~The biggest issue is that the generated code currently doesn't delete anything~~ (basic manual memory management is added). Also the WebAssembly specification is still being developed and the current binary format may stop working when WebAssembly is officially released. WebAssembly binary format is up-to-date, please feel free to open issues if it stop working or need a new feature.

TurboScript is forked from ThinScript and changed a lot, so there will be no going back.

## Join ![Slack](https://01alchemist.com/images/slack-logo-small.png)
You need an invitation to join slack. open a ticket with your email address. I will make it happen.

# Roadmap

* ~~Parallel JavaScript~~
* ~~WebAssembly Emitter~~
* ~~Basic malloc and free~~
* ~~ASM.JS Emitter~~
* ~~Import external functions with namespace~~
* ~~Array Data Type~~
* Parallel WebAssembly (post-MVP)

# Wiki
Documentations can be found at [wiki](../../wiki) (under construction :construction:)

# Useful links
* [Future WebHPC & Parallel Programming with JavaScript](https://dump.01alchemist.com/2016/12/31/future-webhpc-parallel-programming-with-javascript-the-new-era-about-to-begin/)
* [TurboScript playground](https://01alchemist.com/projects/turboscript/playground/)


# Credit
Lexical analysis, Parsing, Checking codes are borrowed from Evan Wallace's thinscript

# Now enjoy - Wow! this snail is fast
<a href="http://www.youtube.com/watch?feature=player_embedded&v=w-SDeBoDLTg
" target="_blank"><img src="https://01alchemist.com/images/Turbo-630x354.jpg" 
alt="Wow! this snail is fast" width="630" height="354" border="10" /></a>

