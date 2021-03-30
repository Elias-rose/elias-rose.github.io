//============================================================================
// Eli_MapReveal.js
//============================================================================

/*:
@plugindesc v1.6 - Cover and reveal a map as player walks!
@author Hakuen Studio

@help
******************************************************************************
                            Join me on Patreon!
                    https://www.patreon.com/hakuenstudio
******************************************************************************
==============================================================================
Introduction
==============================================================================

• Inspired on the game Fatal Labyrinth for Mega Drive, I have created this 
plugin that can cover a map and let the player reveals it as he moves!

==============================================================================
Features
==============================================================================

• Cover the tiles marked by regions with a 48x48 image of your preference.
• Can choose the regions that will do the cover.
• Player can reveal these tiles as he moves!
• Set the range, in tiles, that the player is able to reveal when he moves
(through a variable value!).
• Set the revealing form to square, diamond, linear, or region!
• There is a special reveal form "OneRegion" That only reveals the 
player's region! All other ones stay covered!
• Can reveal or hide regions at once.
• Can hide and reveal tiles by coordinates too!
• Events can also reveal/hide the map!

==============================================================================
How to use
==============================================================================

• First of all, create an image with the size of 48x48 and save it in the 
system's folder. Then set it on the plugin parameter "Cover Image".

• Choose a default value for the revealing form in the parameters:
• Square - Reveal the tiles with a square range.
• Diamond - Reveal the tiles with a diamond range.
• Linear - Reveal the tiles in a straight line range.
• Region - reveal all tiles in a region at once.
• One Region - This is a special reveal form that will only reveal the 
player's region tiles. 
When the player leaves this region, it will cover that and reveal the other 
that the player has moved in.

• Choose a variable to hold the range value, in tiles.

• You can also change the visibility parameter to reveal tiles instantly
(toggle) or using a fading effect(That I made just for fun).

• Paint your map with regions in the place you want to be covered. As the 
player moves, he will reveal the tiles based on his range value. 
You can use only one region if you want, but using more will make it easy 
when you want to reveal or hide one specific place.

• Finally, set a note tag in your map if you want it to use the cover 
feature: <CoverMap> (It's not case sensitive).

NOTE¹: For now it's advised to use only with tiles 48x48 and resolutions 
divisible by 48.

NOTE²: After 80x80 covered tiles, sometimes I had experienced fps drops.
That does not mean you cannot use it on a map with more than 80X80. It 
means that maybe you will have fps drops with more than 80x80 tiles 
painted.
It will also depend on the machine running it.

NOTE³: The fade visibility mode was made just for fun. Don't know if it will
properly work at all(especially with the CoverOneRegion). Use at your own 
risk.

==============================================================================
Plugin Commands
==============================================================================

==============================================================================
Script calls
==============================================================================

• $fogSystem.coverLinear(x, y, range, reveal)
• $fogSystem.coverSquare(x, y, range, reveal)
• $fogSystem.coverDiamond(x, y, range, reveal)
• $fogSystem.coverRegion(region, reveal) > Cover/reveal a entire region.
• $fogSystem.cover(x, y, reveal) - Cover only one tile:
• $fogSystem.coverAll(reveal) - Reset all covers(or reveal all of them):

• $fogSystem.getTileStatusByCoordinates(x, y) > 
You can check if a specific tile is covered or not. 
Replace x and y by coordinates.

• $fogSystem.getValidRegions() > It will return the regions that can be 
covered.

• $fogSystem.isValidRegion(regionId) > Check if a region is valid to 
cover/reveal.
NOTE: After 75 covered tiles, sometimes I had experienced fps drops.
That does not mean you cannot use on a map with more than 75x75. It means
that maybe you will have fps drops with more than 75 tiles painted.
It will also depend on the machine running it.

==============================================================================
Terms of Use
==============================================================================

https://www.hakuenstudio.com/rpg-maker/terms-of-use

==============================================================================
Contact
==============================================================================

RM Web - https://forums.rpgmakerweb.com/index.php?members/eliaquim.123037/
Centro Rpg Maker - https://centrorpg.com/index.php?action=profile
Instagram - https://www.instagram.com/hakuenstudio
Twitter - https://twitter.com/hakuen_studio
Facebook - https://www.facebook.com/hakuenstudio

==============================================================================
Update log
==============================================================================
Version 1.6 - 12/25/2020
- Fixed an error when initializing the valid regions when it has only one 
region in the plugin parameter.
Version 1.5 - 12/15/2020
- Code refactoring to improve performance.
- Changed some script calls and removed the plugin commands(Will be added 
later).
Version 1.4 - 22/08/2020
- Code restructuring.
- Add plugin commands.
- Fixed a problem in plugin commands.
Version 1.3 - 08/15/2020
- Several code changes, including a performance boost!
- Added new reveal type by regions.
- Added a way to change the image that covers the tiles during the game.
- Added option to reveal tiles gradually (fade) or at once.
- Added option to exclude certain regions from being covered.
- Many changes in script calls. Please see the help file.
Version 1.2 - 07/28/2020
- More improvements on performance!
Version 1.1 - 07/16/2020
- Code clean up and better performance.
Version 1.0 - 06/10/2020
- Plugin release!

@param regions
@text Cover regions
@type text
@desc Choose regions that you want to be covered. Separate with a comma ",".
@default 1,2,3,4,5,6,7,8,9,10

@param image
@text Cover image
@type file
@dir img/system
@desc Choose an image to be used to cover the tiles.
@require 1

@param coverForm
@text Reveal Form
@type select
@option Square
@value coverSquare
@option Diamond
@value coverDiamond
@option Linear
@value coverLinear
@option Region
@value coverRegion
@option OneRegion
@value coverOneRegion
@desc Choose how the player will reveal tiles.
@default coverSquare

@param rangeId
@text Range value(by id)
@type variable
@desc Choose the variable Id that will hold the range value, in tiles.
@default 0

@param minRange
@text Minimum range
@type number
@desc Set a minimum value for the range, in case the variable was not setted.
@default 0
@parent rangeId

@param visibility
@text Visibility Mode
@type select
@option toggle
@option fade
@desc Choose how the visibility will change. If you choose fade, you have to config the fade speed.
@default toggle

@param fadeSpeed
@text Fade speed
@type number
@min 1
@max 255
@desc Choose how much opacity the sprite will lose per frame.
@default 1
@parent visibility
*/


"use strict"

var Imported = Imported || {};
Imported.Eli_MapReveal = true;

var Eli = Eli || {};

Eli.needBook = function() {
    if(!Eli.alert){
        window.alert(`Eli's_Book.js was not found. 
Please download the latest version for free.`);
        if(confirm) {
            window.open('https://hakuenstudio.itch.io/elis-book-rpg-maker-mv');
        }
        Eli.alert = true;
    }
};

if(!Imported.Eli_Book) {
    Eli.needBook();
}

/*==============================================================\\
                        FOG MAP                         
//==============================================================*/

{

Eli.MapReveal = {

    parameters: eli.convertParameters(PluginManager.parameters('Eli_MapReveal')) || {},
    alias: this.alias || {},
    validRegions: [],
    visibilityMethod: '',
    fadeSpeed: 0,
    coordinates: [],
    regionCoordinates: {},
    regionToRefresh: 0,
    regionHistory: [],

    initialize(){
        this.validRegions = String(this.param().regions).split(',').map((item) => +item);
        this.visibilityMethod = this.param().visibility+'Visibility';
        this.fadeSpeed = this.param().fadeSpeed;
    },

    param(){
        return this.parameters;
    },
    
    data(){
        return $gameEli.mapReveal().maps;
    },

    mapTileStatus(){
        return $gameEli.mapReveal().maps[this.mapId()];
    },

    image(){
        return $gameEli.mapReveal().image;
    },

    changeImage(value){
        $gameEli.mapReveal().image = value;
    },

    mapId(){
        return $gameMap.mapId();
    },

    needMapSetup(){
        return !this.data().hasOwnProperty(this.mapId());
    },

    setup(){
        this.startCoordinates();
        this.startRegionHistory();
        this.setupCoordinates();
        this.setupMap();
    },

    startCoordinates(){
        this.coordinates = [];
        for(const id of this.getValidRegions()){
            this.regionCoordinates[id] = [];
        }
    },

    startRegionHistory(){
        this.regionHistory = [0, 0];
    },

    setupCoordinates(){

        for(let x = 0, w = $dataMap.width; x < w; x++){
    
            for(let y = 0, h = $dataMap.height; y < h; y++){
                const regionId = $gameMap.regionId(x, y);
    
                if(this.isValidRegion(regionId)){
                    const strCoordinate = `${x},${y}`;
                    const intCoordinate = [x, y];
                    
                    this.coordinates.push(strCoordinate);
                    this.regionCoordinates[regionId].push(intCoordinate);
                }
            }
        }
    },

    setupMap(){
        if(this.needMapSetup()){
            const length = this.getCoordinates().length;
            this.data()[this.mapId()] = new Array(length).fill(true);
        }
    },

    getTileStatusById(id){
        return this.mapTileStatus()[id];
    },

    getTileStatusByCoordinates(x, y){
        const coordinate = `${Math.abs(x)},${Math.abs(y)}`;
        const tile = this.getCoordinates().indexOf(coordinate);
        const tileStatus = this.mapTileStatus()[tile];
        
        return tileStatus
    },

    changeTileStatus(tileId, value){
        this.mapTileStatus()[tileId] = value;
    },

    findTileId(x, y){
        const coordinate = `${Math.abs(x)},${Math.abs(y)}`;
        const tileId = this.getCoordinates().indexOf(coordinate);

        return tileId;
    },

    cover(x, y, cover){
        const tileId = this.findTileId(x, y);
        this.changeTileStatus(tileId, cover);
    },

    coverSquare(x, y, dist, cover){
        for(let cx = x - dist, maxCx = x + dist; cx <= maxCx; cx++){

            for(let cy = y - dist, maxCy = y + dist; cy <= maxCy; cy++){
                this.cover(cx, cy, cover);
            }
        }
    },

    coverLinear(x, y, dist, cover){
        for(let i = -dist; i <= dist; i++){
            this.cover(x+i, y, cover);
            this.cover(x-i, y, cover);
            this.cover(x, y-i, cover);
            this.cover(x, y+i, cover);
        }
    },
    
    coverDiamond(x, y, dist, cover){
        for (let cx = x - dist, maxCx = x + dist; cx <= maxCx; cx++) {

            for (let cy = y - dist, maxCy = y + dist; cy <= maxCy; cy++) {

                if (Math.abs(cx - x) + Math.abs(cy - y) <= dist){
                    this.cover(cx, cy, cover);
                }
            }
        }
    },

    coverRegion(regionId, cover){
        const regionCoord = this.getRegionCoordinates()[regionId] || [];

        for(const coordinate of regionCoord){
            const [x, y] = coordinate;
            this.cover(x, y, cover);
        }

    },

    coverOneRegion(){
        const oldRegion = this.regionHistory[0];
        this.regionHistory[1] = $gamePlayer.regionId();

        if(oldRegion !== this.regionHistory[1]){
            this.coverRegion(this.regionHistory[1], false);
            
            if(this.isValidRegion(oldRegion)){
                this.coverRegion(oldRegion, true);
            }

            this.updateRegionHistory();
        }
    },

    updateRegionHistory(){
        this.regionHistory.shift();
        this.regionHistory.push($gamePlayer.regionId());
    },
    
    coverAll(cover){
        this.mapTileStatus().fill(cover);
    },
    
    getCoordinates(){
        return this.coordinates;
    },

    getRegionCoordinates(){
        return this.regionCoordinates;
    },

    getVisibilityMethod(){
        return this.visibilityMethod;
    },
    
    refresh(value){
        this._needRefresh = value;
    },

    needRefresh(){
        return this._needRefresh;
    },

    getFadeSpeed(){
        return this.fadeSpeed;
    },
    
    setFadeSpeed(value){
        this.fadeSpeed = value.clamp(1, 255)
    },
    
    getValidRegions(){
        return this.validRegions;
    },

    isValidRegion(regionId){
        return this.validRegions.includes(regionId);
    },

/* ----------------------------- PLUGIN COMMANDS ---------------------------- */

    cmd_Cover(args){
        const status = eli.toBoolean(args.status);
        const range = +args.range;

        if(+args.event > 0){
            const event = $gameMap.event(+args.event);
            const {x, y} = event;
            this[args.coverForm](x, y, range, status)
        }else{
            let [x, y] = args.coordinates.split(",");
            x = eli.processEscapeVarOrFormula(x);
            y = eli.processEscapeVarOrFormula(y);
            this[args.coverForm](+x, +y, range, status);
        }
        this.refresh(status);
    },

    cmd_CoverRegion(args){
        this.coverRegion(+args.regionId, eli.toBoolean(args.status));
    },

    cmd_CoverAll(args){
        this.coverAll(eli.toBoolean(args.status));
        this.refresh(eli.toBoolean(args.status));
    },

    cmd_EventReveal(args){
        const event = $gameMap.event(+args.eventId);

        if(event){
            event.changeCoverForm(args.coverForm);
            event.setRevealRange(+args.revealRange);
            event.setCoverStatus(eli.toBoolean(args.coverStatus));
            event.enableReveal(true);
        }
    },

    cmd_disableEventReveal(args){
        const event = $gameMap.event(+args.eventId);
        if(event){
            event.enableReveal(false);
        }
    }

};

const Plugin = Eli.MapReveal;
const Alias = Eli.MapReveal.alias;
window.$fogSystem = Eli.MapReveal;

Plugin.initialize();

/* -------------------------------- SAVE DATA ------------------------------- */

Alias.Game_Eli_initialize = Game_Eli.prototype.initialize;
Game_Eli.prototype.initialize = function(){
    Alias.Game_Eli_initialize.call(this);
    this.contents.mapReveal = {};
    this.contents.mapReveal = { maps: {}, image: Plugin.param().image };
};

Game_Eli.prototype.mapReveal = function(){
    return this.contents.mapReveal;
};
    
/* ========================================================================== */
/*                                   OBJECTS                                  */
/* ========================================================================== */

/* ----------------------------- GAME VARIABLES ----------------------------- */

Game_Variables.prototype.revealValue = function() {
    const varValue = this.value(Plugin.param().rangeId)
    const minValue = Plugin.param().minRange;

    return Math.max(minValue, varValue);
};

/* -------------------------------- GAME MAP -------------------------------- */

{

Alias.Game_Map_initialize = Game_Map.prototype.initialize;
Game_Map.prototype.initialize = function() {
    Alias.Game_Map_initialize.call(this);
    this._isFogMap = false;
};

Alias.Game_Map_setup = Game_Map.prototype.setup;
Game_Map.prototype.setup = function(mapId) {
    Alias.Game_Map_setup.call(this, mapId);
    this._isFogMap = $dataMap.note && $dataMap.note.toLowerCase().includes('covermap') || false;
    this.setupFog();
};

Game_Map.prototype.setupFog = function(){
    if(this.isFogMap()) {
        Plugin.setup();     
    }
};

Game_Map.prototype.isFogMap = function(){
    return this._isFogMap;
};

}

/* ------------------------------- GAME PLAYER ------------------------------ */

{

Alias.Game_Player_increaseSteps = Game_Player.prototype.increaseSteps;
Game_Player.prototype.increaseSteps = function() {
    Alias.Game_Player_increaseSteps.call(this);
    this.revealMap($gameMap.isFogMap(), this.x, this.y);
};

Game_Player.prototype.revealMap = function(flag, x, y){
    const isCoverMap = {true: 'reveal', false: 'notReveal'};
    const method = isCoverMap[flag];
    const distance = $gameVariables.revealValue();
    const coverForm = this.coverForm();

    return this[method](coverForm, x, y, distance);
};

Game_Player.prototype.reveal = function(coverForm, x, y, distance){
    if(coverForm.includes('Region')){
        Plugin[coverForm](this.regionId(), false);
    }else{
        Plugin[coverForm](x, y, distance, false);
    }
};

Game_Player.prototype.notReveal = function(){};

Game_Player.prototype.coverForm = function(){
    return Plugin.param().coverForm;
};

}

/* ------------------------------- GAME EVENT ------------------------------- */

{

Alias.Game_Event_initialize = Game_Event.prototype.initialize;
Game_Event.prototype.initialize = function(mapId, eventId) {
    Alias.Game_Event_initialize.call(this, mapId, eventId);
    this._canReveal = false;
    this._revealRange = 1;
    this._coverForm = 'coverSquare';
    this._coverStatus = true;
};

Alias.Game_Event_increaseSteps = Game_Event.prototype.increaseSteps;
Game_Event.prototype.increaseSteps = function() {
    Alias.Game_Event_increaseSteps.call(this);
    if(this.canReveal()){
        this.reveal();
    }
};

Game_Event.prototype.reveal = function(){
    Plugin[this._coverForm](this._x, this._y, this._revealRange, this._coverStatus);
};

Game_Event.prototype.canReveal = function(){
    return this._canReveal;
};

Game_Event.prototype.enableReveal = function(value){
    this._canReveal = value;
};

Game_Event.prototype.changeCoverForm = function(value){
    this._coverForm = value;
};

Game_Event.prototype.setCoverStatus = function(value){
    this._coverStatus = value;
};

Game_Event.prototype.setRevealRange = function(value){
    this._revealRange = value;
};

}

/* ========================================================================== */
/*                                   SCENES                                   */
/* ========================================================================== */

/* -------------------------------- SCENE MAP ------------------------------- */

Alias.Scene_Map_beforeStart = Scene_Map.prototype.beforeStart;
Scene_Map.prototype.beforeStart = function(){
    Alias.Scene_Map_beforeStart.call(this);
    this.initialReveal();
};

Scene_Map.prototype.initialReveal = function(){
    const player = $gamePlayer;
    player.revealMap($gameMap.isFogMap(), player.x, player.y);
};

/* ========================================================================== */
/*                                   SPRITES                                  */
/* ========================================================================== */

Alias.Spriteset_Map_createLowerLayer = Spriteset_Map.prototype.createLowerLayer;
Spriteset_Map.prototype.createLowerLayer = function() {
    Alias.Spriteset_Map_createLowerLayer.call(this);
    this.createCoverContainer();
};

Spriteset_Map.prototype.createCoverContainer = function() {
    if($gameMap.isFogMap()) {
        this._fogContainer = new Eli.MapReveal.Sprite_Container();
        this.addChild(this._fogContainer);
    }
};

/* ------------------------------ FOG CONTAINER ----------------------------- */

Eli.MapReveal.Sprite_Container = class extends Sprite {

    constructor(){
        super();
    };

    initialize(){
        super.initialize();
        this.initializePlus();
    }

    initializePlus(){
        this.coordinates = Plugin.getCoordinates().map(item => item.split(","));

        this.move(0, 0);
        this.setVisibilityUpdateMethod();
        this.createCovers()
    }

    setVisibilityUpdateMethod(){
        this.visibilityMethod = Plugin.getVisibilityMethod();

        if($gamePlayer.coverForm() === 'coverOneRegion'){
            this.visibilityMethod += "WithCoverOneRegion"
        }
    }

    createCovers(){
        const coordinates = this.coordinates;
        const image = ImageManager.loadSystem(Plugin.image());

        for(let i = 0, l = coordinates.length; i < l; i++){
            const [x, y] = coordinates[i];
            
            if(Plugin.getTileStatusById(i)){
                const cover = new Eli.MapReveal.Sprite_CoverTile(+x, +y, image, i, this.visibilityMethod);
                this.addChild(cover);
            }
        }
    }

    refreshAllCovers(){
        if(Plugin.needRefresh()){
            this.createCovers();
            Plugin.refresh(false);
        }
    }

    canDestroyChildrens(){
        const player = $gamePlayer;
        return player.checkStop(0) && !player.checkStop(10);
    }

    update(){
        this.refreshAllCovers();

        for (const child of this.children) {
            child.update();

            if(this.canDestroyChildrens() && !child.visible){
                child.destroy();
            }
        }

    }
};

/* -------------------------------- FOG TILE -------------------------------- */

Eli.MapReveal.Sprite_CoverTile = class extends Sprite {

    constructor(x, y, image, id, visibilityMethod){
        super(...arguments);
    }

    initialize(x, y, image, id, visibilityMethod){
        super.initialize();
        this.initializePlus(...arguments)
    }

    initializePlus(x, y, image, id, visibilityMethod){
        this.mapX = x;
        this.mapY = y;
        this.tileId = id;
        this.region = $gameMap.regionId(x, y);
        this.visibilityMethod = visibilityMethod;
        this.createBitmap(image);
    }

    createBitmap(image){
        this.bitmap = image;
    }

    toggleVisibility(){
        this.visible = Plugin.getTileStatusById(this.tileId);
    }

    toggleVisibilityWithCoverOneRegion(){
        if($gamePlayer.regionId() === this.region){
            this.opacity = 0;
        }else{
            this.opacity = 255;
        }
    }

    fadeVisibility(){
        if(!Plugin.getTileStatusById(this.tileId) && this.visible){
            this.fadeOut();
            this.visible = this.opacity > 0;
        }
    }

    fadeVisibilityWithCoverOneRegion(){
        if($gamePlayer.regionId() === this.region && this.opacity > 0){
            this.fadeOut();
        }else if($gamePlayer.regionId() !== this.region && this.opacity < 255){
            this.fadeIn();
        }
    }

    fadeOut(){
        const remove = this.opacity - Plugin.getFadeSpeed();
        this.opacity = Math.max(remove, 0);
    }

    fadeIn(){
        const add = this.opacity + Plugin.getFadeSpeed();
        this.opacity = Math.min(add, 255);
    }

    updatePosition(){
        this.x = $gameMap.adjustX(this.mapX) * 48;
        this.y = $gameMap.adjustY(this.mapY) * 48;
    }

    updateVisibility(){
        this[this.visibilityMethod]();
    }

    update(){
        this.updateVisibility();
        this.updatePosition();
    }
};

}