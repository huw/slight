# Slight
Slight is a theme for your subreddit. Originally designed for the community at /r/Monstercat, this retina-ready stylesheet is honest, simple and easy. It’s what you use when other stylesheets can’t provide for the needs of your users—or your need for better design.

You can find more info at [/r/slight](https://www.reddit.com/r/slight).

## 4-step install
1. `npm install`
2. Put images in `/images`
3. Make changes to `slight.styl`
4. `node compile`

## How to Use
1. Make sure you’ve installed [node.js](https://nodejs.org/download/)
2. Run `npm install` in this folder
3. Change out the images in `/images` with your own alternatives, where necessary. You can use `useful stuff/template.sketch` to help out if you have [Sketch](http://bohemiancoding.com/sketch/) installed.
4. _(Optional)_ Put all the images you want as flair in `/flairs`. Slight will automatically resize them for you, so add them in the highest resolutions you have.
5. Edit `slight.styl` to go through what you may want to change. All of the available settings should be well-documented within the file. __If you’re using flairs, make sure `image_flairs` is set to `true`.__
6. Add custom overrides or other styles to the end of `slight.styl` as necessary.
7. Run compile.js using `node compile`.

## Compile.js
Compile.js is a script I wrote for Slight to use. It will take a fully-edited `slight` directory, and preform all of the necessary image manipulation and CSS preprocessing required to get Slight up and running. It does the following:

1. Resize all images in `/flairs` to pre-determined dimensions
2. Compile all of the resized images into two spritesheets: `images/flairsheet` and `images/flairsheet2x`
3. Preprocess `slight.styl`, calculating the dimensions for any of the images

Compile.js can be run with flags to perform only certain steps:
`node compile resize`: Just resize the flairs
`node compile make-sheet`: Just create stylesheets
`node compile compile`: Just preprocess the styles

Running Compile.js without any flags will run all three. If it does not detect `/flairs`, it will automatically skip to preprocessing.

I have also set up a Sublime Text Build System (will probably only work on UNIX) that automatically performs `node compile compile`, provided Compile.js is in the current directory. It would be a good idea to edit this to use Sublime Text’s project system.