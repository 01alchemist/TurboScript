# TurboScript
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

#Roadmap

* ~~Parallel JavaScript~~
* ~~WebAssembly Emitter~~
* ~~Basic malloc and free~~
* ~~ASM.JS Emitter~~
* ~~Import external functions with namespace~~
* Array Data Type
* Parallel WebAssembly (post-MVP)

#Useful links
* [Future WebHPC & Parallel Programming with JavaScript] (https://dump.01alchemist.com/2016/12/31/future-webhpc-parallel-programming-with-javascript-the-new-era-about-to-begin/)
* [TurboScript playground] (https://01alchemist.com/projects/turboscript/playground/)


#Credit
Lexical analysis, Parsing, Checking codes are borrowed from Evan Wallace's thinscript
