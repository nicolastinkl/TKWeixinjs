/**
 * Created by wzm on 14-10-8.
 */
//cc.SPRITE_DEBUG_DRAW = 1;
var canChangePage = true;
var curScene = null;
var musicScene = null;
var repeatMusicScene = null;
var MainScene = cc.Scene.extend({
    listener: null,
    accelListener: null,
    currentIndex: 0,
    sceneList: [],
    movey:0,
    ctor: function () {
        this._super();
        cc.spriteFrameCache.addSpriteFrames(res.firstPage_plist);
    },
    onEnter: function () {
        this._super();
        this.initUI();
        this.addTouch();
        this.initHideEvent();
        curScene = this;
        initMusic();
        playMusic(true); //play 音乐
//        this.addAccel();
    },
    initUI: function () {
        var bg = new cc.Sprite(res.background_png);
        bg.anchorX = 0;
        bg.anchorY = 0;
        bg.scaleX = cc.winSize.width / bg.width;
        bg.scaleY = cc.winSize.height / bg.height;
        this.addChild(bg, 0);

        this.arrow = new cc.Sprite("#arrow.png");
        this.arrow.setPosition(cc.pAdd(cc.visibleRect.bottom, cc.p(0, 50)));
        var posY = this.arrow.y;
        var arrowAction = cc.repeatForever(cc.sequence(cc.spawn(cc.moveTo(0.8, cc.p(this.arrow.x, posY + 30)).easing(cc.easeIn(0.5)), cc.fadeOut(1)), cc.delayTime(0.8), cc.callFunc(function () {
            this.arrow.y = this.arrow.y - 30;
            this.arrow.opacity = 255;
        }, this)));
        this.arrow.runAction(arrowAction);
        this.addChild(this.arrow, 1);


        this.menuItemToggle = new cc.MenuItemToggle(new cc.MenuItemImage(res.music), new cc.MenuItemImage(res.music), this.toggleMusicCallback, this);
        this.menuItemToggle.setPosition(cc.pAdd(cc.visibleRect.right, cc.p(-this.menuItemToggle.width / 2 - 30, 0)));
        var togglemenu = new cc.Menu(this.menuItemToggle);
        togglemenu.anchorX = 0;
        togglemenu.anchorY = 0;
        togglemenu.x = 0;
        togglemenu.y = 0;
//        this.addChild(togglemenu, 1);
        musicScene =  togglemenu;

        //添加新的音乐播放滚动按钮
        var repeatMusic = new cc.Sprite(res.music);
        var repeat = cc.rotateBy(1, 360).repeatForever();
        repeatMusic.runAction(repeat);
        repeatMusic.setPosition(cc.pAdd(cc.visibleRect.right, cc.p(-this.menuItemToggle.width / 2 - 30, 370)));
        this.addChild(repeatMusic, 1);
        repeatMusicScene = repeatMusic;

        //下面是场景动画
        this.animLayer = new cc.Layer();
        this.addChild(this.animLayer);
        this.sceneList.push(new Layer1());
        this.sceneList.push(new Layer2());
        this.sceneList.push(new Layer22());
        this.sceneList.push(new Layer3());
//        this.sceneList.push(new Layer4());
//        this.sceneList.push(new Layer5());
        for (var i = 0; i < this.sceneList.length; i++) {
            var scene = this.sceneList[i];
            scene.anchorX = 0;
            scene.anchorY = 0;
            scene.x = 0;
            scene.y = 0;
            if (this.currentIndex != i) {
                scene.setVisible(false);
            }
            this.animLayer.addChild(scene, this.sceneList.length - i);
        }
    },
    initHideEvent: function () {
        cc.eventManager.addCustomListener(cc.game.EVENT_SHOW, function () {
            playMusic(true);
        });
        cc.eventManager.addCustomListener(cc.game.EVENT_HIDE, function () {
            playMusic(false);
        });

    },
    toggleMusicCallback: function (sender) {
        if (sender.getSelectedIndex() == 0) {
            playMusic(true);
        } else {
            playMusic(false);
        }
    },
    togleArrow: function (status) {
        if (status) {
            this.arrow.visible = true;
        }
        else {
            this.arrow.visible = false;
        }
    },
    addTouch: function () {
        var self = this;

        self.listener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            startPosY: 0,
            onTouchBegan: function (touch, event) {
                this.startPosY = touch.getLocation().y;

//                var currentX = self.currentIndex;
//                var LayerNext = self.sceneList[++currentX];
//                LayerNext.visible = true;
//                LayerNext.appear();


                return true;
            },
            onTouchMoved: function (touch, event) {
                //获得手势移动范围
                var deltas = touch.getLocation().y - this.startPosY;
                cc.log(deltas);

                if (self.currentIndex < self.sceneList.length - 1) {
                    //往上拖拽
//                    var scene = self.currentIndex ? this.sceneList[self.currentIndex - 1] : this.sceneList[self.currentIndex + 1];


                    /*
                     this.touchy += LayerNext.y * delta;
                     var winSize = cc.director.getWinSize();
                     if (this.movey > winSize.height ) {
                     this.movey = winSize.height;
                     LayerNext.y  = this.movey;
                     } else if (this.movey < winSize.height) {
                     this.movey +=delta
                     LayerNext.y = winSize.height - this.movey;
                     }
                     */

                }else {
                    //往下拖拽
                    // var LayerCurrent = this.sceneList[self.currentIndex];
                    var currentX = self.currentIndex;

                    if (currentX >= 0) {
                        var LayerNext = self.sceneList[--currentX];
                    }
                }


             },
            onTouchEnded: function (touch, event) {
                if (musicPlayStatus) {
                    playMusic(true);
                }
                if (canChangePage) {
                    var delta = touch.getLocation().y - this.startPosY;
                    if (delta > 15 && self.currentIndex < self.sceneList.length - 1) {
                        self.changePage(++self.currentIndex, true);
                    } else if (delta < -15 && self.currentIndex > 0) {
                        self.changePage(--self.currentIndex, false);
                    }
                }
            },
            onTouchCancelled: function (touch, event) {

            }
        });
        cc.eventManager.addListener(self.listener, self);
    },
    addAccel: function () {
        var self = this;
        cc.inputManager.setAccelerometerInterval(1 / 30);
        cc.inputManager.setAccelerometerEnabled(true);
        this.accelListener = {
            event: cc.EventListener.ACCELERATION,
            callback: function (acc, event) {
                for (var i = 0; i < self.sceneList.length; ++i) {
                    self.sceneList[i].accelEvent(acc, event);
                }
            }
        }
        cc.eventManager.addListener(this.accelListener, self);
    },
    changePage: function (index, next) {
        canChangePage = false;
        var scene = next ? this.sceneList[index - 1] : this.sceneList[index + 1];
        if (index == 4) {
            this.togleArrow(false);
        } else {
            this.togleArrow(true);
        }
        var nextPage = function () {
            scene.visible = false;
            this.sceneList[index].visible = true;
            this.sceneList[index].appear();
        };
        if (scene) {
            scene.disappear(nextPage, this);
        }
    }
});
var Layer1 = cc.Layer.extend({
    ctor: function () {
        this._super();
        this.initUI();
    },
    onEnter: function () {
        this._super();
        this.appear();
    },
    initUI: function () {
        canChangePage = false;
        this.accLayer = new cc.Layer();
        this.accLayer.anchorX = 0;
        this.accLayer.anchorY = 0;
        this.accLayer.x = 0;
        this.accLayer.y = 0;
        this.addChild(this.accLayer);

        /*
         var bg = new cc.Sprite(res.background_png);
         bg.anchorX = 0;
         bg.anchorY = 0;
         bg.scaleX = cc.winSize.width / bg.width;
         bg.scaleY = cc.winSize.height / bg.height;
         this.addChild(bg, 0);
        * */

        this.logo = new cc.Sprite(res.layer1);
        this.logo.scale = 0;
        this.logo.setPosition(cc.pAdd(cc.visibleRect.center, cc.p(-50, this.logo.height / 3 * 2-110)));
        this.addChild(this.logo);

        this.logo2 = new cc.Sprite(res.layer1_logo1);
        this.logo2.scale = 0;
        this.logo2.setPosition(cc.pAdd(cc.visibleRect.center, cc.p(140, this.logo2.height+20)));
        this.addChild(this.logo2);

        this.layer1_line = new cc.Sprite(res.layer1_line);
        this.layer1_line.scale = 0;
        this.layer1_line.setPosition(cc.pAdd(cc.visibleRect.center, cc.p(0,-205)));//-this.leftFont.width / 2-70, -this.leftFont.height / 2-80
        this.addChild(this.layer1_line);

        this.leftFont = new cc.Sprite(res.layer1_left_down);
        this.leftFont.scale = 0.9;
        this.leftFont.setPosition(cc.pAdd(cc.visibleRect.left, cc.p(-this.leftFont.width / 2-60, -this.leftFont.height*2+130)));//-this.leftFont.width / 2-70, -this.leftFont.height / 2-80
        this.addChild(this.leftFont);

        this.rightFont = new cc.Sprite(res.layer1_right_up);
        this.rightFont.scale = 0.9;
        this.rightFont.setPosition(cc.pAdd(cc.visibleRect.right, cc.p(this.rightFont.width / 2+30, this.rightFont.height-80)));
        this.addChild(this.rightFont);

        this.leftUpPic = new cc.Sprite(res.layer1_line1);
        this.leftUpPic.anchorX = 0,
        this.leftUpPic.anchorY = 1;
        this.leftUpPic.setPosition(cc.pAdd(cc.visibleRect.topLeft, cc.p(-this.leftUpPic.width, this.leftUpPic.height)));
        this.accLayer.addChild(this.leftUpPic);


        this.leftDownPic = new cc.Sprite("#block_left down.png");
        this.leftDownPic.anchorX = 0, this.leftDownPic.anchorY = 0;
        this.leftDownPic.setPosition(cc.pAdd(cc.visibleRect.bottomLeft, cc.p(-this.leftDownPic.width + 20, -this.leftDownPic.height)));
//        this.accLayer.addChild(this.leftDownPic);

        this.rightUpPic = new cc.Sprite("#block_right up.png");
        this.rightUpPic.anchorX = 1, this.rightUpPic.anchorY = 1;
        this.rightUpPic.setPosition(cc.pAdd(cc.visibleRect.topRight, cc.p(this.rightUpPic.width, this.rightUpPic.height)));
//        this.accLayer.addChild(this.rightUpPic);

        this.rightDownPic = new cc.Sprite(res.layer1_line2);
        this.rightDownPic.anchorX = 1, this.rightDownPic.anchorY = 0;
        this.rightDownPic.setPosition(cc.pAdd(cc.visibleRect.bottomRight, cc.p(this.rightDownPic.width, -this.rightDownPic.height)));
        this.accLayer.addChild(this.rightDownPic);
    },
    accelEvent: function (acc, event) {
        if (this.visible) {
            movArea(acc, this.accLayer);
        }
    },
    appear: function () {

        var logoAction2 = cc.sequence(cc.scaleTo(0.5, 1), cc.callFunc(function () {
        } , this), cc.delayTime(1.3), cc.callFunc(function () {

        }, this));
        this.logo2.runAction(logoAction2);



        var lineAction =   cc.sequence(cc.scaleTo(0.5, 0.9), cc.callFunc(function () {
        } , this), cc.delayTime(1.4), cc.callFunc(function () {

        }, this));
        this.layer1_line.runAction(lineAction);


        var logoAction = cc.sequence(cc.scaleTo(0.5, 1), cc.callFunc(function () {
            this.leftUpPic.leftUpAction = cc.moveTo(0.5, cc.p(this.leftUpPic.x + this.leftUpPic.width, this.leftUpPic.y - this.leftUpPic.height + 80));
            this.leftUpPic.runAction(this.leftUpPic.leftUpAction);

            this.leftDownPic.leftDownAction = cc.moveTo(0.5, cc.p(this.leftDownPic.x + this.leftDownPic.width, this.leftDownPic.y + this.leftDownPic.height));
            this.leftDownPic.runAction(this.leftDownPic.leftDownAction);

            this.rightUpPic.rightUpAction = cc.moveTo(0.5, cc.p(this.rightUpPic.x - this.rightUpPic.width - 30, this.rightUpPic.y - this.rightUpPic.height - 30));
            this.rightUpPic.runAction(this.rightUpPic.rightUpAction);

            this.rightDownPic.rightDownAction = cc.moveTo(0.5, cc.p(this.rightDownPic.x - this.rightDownPic.width, this.rightDownPic.y + this.rightDownPic.height));
            this.rightDownPic.runAction(this.rightDownPic.rightDownAction);

            this.leftFont.fontLeftAction = cc.sequence(cc.delayTime(0.3), cc.moveTo(0.5, cc.p(this.leftFont.x + this.leftFont.width, this.leftFont.y+this.leftFont.height)));
            this.leftFont.runAction(this.leftFont.fontLeftAction);

            this.rightFont.fontRightAction = cc.sequence(cc.delayTime(0.4), cc.moveTo(0.4, cc.p(this.rightFont.x - this.rightFont.width, this.rightFont.y-this.rightFont.height)));
            this.rightFont.runAction(this.rightFont.fontRightAction);


        }, this), cc.delayTime(1.3), cc.callFunc(function () {
            canChangePage = true;
        }, this));
        this.logo.runAction(logoAction);



    },
    disappear: function (callback, target) {


        var action = cc.sequence(cc.scaleTo(0.5, 0), cc.callFunc(function () {

        }, this), cc.delayTime(0.9), cc.callFunc(function () {

        }, this));

        this.logo2.runAction(action);



        var lineAction =   cc.sequence(cc.scaleTo(0.5, 0), cc.callFunc(function () {
        } , this), cc.delayTime(1.4), cc.callFunc(function () {

        }, this));
        this.layer1_line.runAction(lineAction);


        var action = cc.sequence(cc.scaleTo(0.5, 0), cc.callFunc(function () {
            this.leftUpPic.runAction(this.leftUpPic.leftUpAction.reverse());
            this.leftDownPic.runAction(this.leftDownPic.leftDownAction.reverse());
            this.rightUpPic.runAction(this.rightUpPic.rightUpAction.reverse());
            this.rightDownPic.runAction(this.rightDownPic.rightDownAction.reverse());
            this.leftFont.runAction(this.leftFont.fontLeftAction.reverse());
            this.rightFont.runAction(this.rightFont.fontRightAction.reverse());

        }, this), cc.delayTime(0.9), cc.callFunc(function () {

            if (target && callback) {
                callback.call(target);
            }
        }, this));
        this.logo.runAction(action);

    }
});
var Layer2 = cc.Layer.extend({
    ctor: function () {
        this._super();
    },
    onEnter: function () {
        this._super();
        cc.spriteFrameCache.addSpriteFrames(res.secondPage_plist);
        this.initUI();
//        this.appear();
    },
    initUI: function () {

        var bg = new cc.Sprite(res.layer2_bg);
        bg.anchorX = 0;
        bg.anchorY = 0;
        bg.scaleX = cc.winSize.width / bg.width;
        bg.scaleY = cc.winSize.height / bg.height;
        this.addChild(bg, 0);

        this.accLayer = new cc.Layer();
        this.accLayer.anchorX = 0;
        this.accLayer.anchorY = 0;
        this.accLayer.x = 0;
        this.accLayer.y = 0;
        this.addChild(this.accLayer);


        this.lineLeftUp = new cc.Sprite("#line_left up.png");
        this.lineLeftUp.setPosition(cc.pAdd(cc.visibleRect.topLeft, cc.p(-this.lineLeftUp.width / 2, -this.lineLeftUp.height)));
//        this.addChild(this.lineLeftUp);
        this.blockLeftUp = new cc.Sprite(res.layer1_line2);
        this.blockLeftUp.setPosition(cc.pAdd(cc.visibleRect.topLeft, cc.p(-this.blockLeftUp.width / 2, -this.blockLeftUp.height)));
        this.accLayer.addChild(this.blockLeftUp);


        this.lineRightDown = new cc.Sprite(res.layer1_line1);
        this.lineRightDown.setPosition(cc.pAdd(cc.visibleRect.bottomRight, cc.p(this.lineRightDown.width / 2, this.lineRightDown.height / 2 * 3)));
        this.addChild(this.lineRightDown);
        this.blockRightDown = new cc.Sprite("#block_right_down.png");
        this.blockRightDown.setPosition(cc.pAdd(cc.visibleRect.bottomRight, cc.p(this.blockRightDown.width / 2, this.blockRightDown.height / 2 * 3)));
//        this.accLayer.addChild(this.blockRightDown);

        this.lineLeftDown = new cc.Sprite("#line_left down.png");
        this.lineLeftDown.setPosition(cc.pAdd(cc.visibleRect.bottomLeft, cc.p(-this.lineLeftDown.width / 2, -this.lineLeftDown.height / 2)));
//        this.addChild(this.lineLeftDown);
        this.blockLeftDown = new cc.Sprite("#block_left_down.png");
        this.blockLeftDown.setPosition(cc.pAdd(cc.visibleRect.bottomLeft, cc.p(-this.blockLeftDown.width / 2, -this.blockLeftDown.height / 2)));
//        this.accLayer.addChild(this.blockLeftDown);

        this.lineRightUp = new cc.Sprite("#line_right up.png");
        this.lineRightUp.setPosition(cc.pAdd(cc.visibleRect.topRight, cc.p(this.lineRightUp.width / 2, this.lineRightUp.height / 2)));
//        this.addChild(this.lineRightUp);
        this.blockRightUp = new cc.Sprite("#block_right_up.png");
        this.blockRightUp.setPosition(cc.pAdd(cc.visibleRect.topRight, cc.p(this.blockRightUp.width / 2, this.blockRightUp.height / 2)));
//        this.accLayer.addChild(this.blockRightUp);


        this.fontLogo = new cc.Sprite(res.layer2_icon);
        this.fontLogo.setPosition(cc.pAdd(cc.visibleRect.center, cc.p(0, 0)));
        this.fontLogo.setScale(0);
        this.addChild(this.fontLogo);

    },
    accelEvent: function (acc, event) {
        if (this.visible) {
            movArea(acc, this.accLayer);
        }
    },
    appear: function () {

        var logoAction = cc.sequence(cc.scaleTo(0.5, 0.8), cc.callFunc(function () {
            this.blockLeftUp.leftUpAction = cc.moveTo(0.3, cc.p(this.blockLeftUp.x + this.blockLeftUp.width + 20, this.blockLeftUp.y + this.blockLeftUp.height / 2 - 20));
            this.blockLeftUp.runAction(this.blockLeftUp.leftUpAction);
            this.lineLeftUp.leftUpAction = cc.moveTo(0.3, cc.p(this.lineLeftUp.x + this.lineLeftUp.width, this.lineLeftUp.y + this.lineLeftUp.height / 2));
            this.lineLeftUp.runAction(this.lineLeftUp.leftUpAction);

            this.blockRightDown.rightDownAction = cc.moveTo(0.3, cc.p(this.blockRightDown.x - this.blockRightDown.width - 20, this.blockRightDown.y - this.blockRightDown.height - 20));
            this.blockRightDown.runAction(this.blockRightDown.rightDownAction);
            this.lineRightDown.rightDownAction = cc.moveTo(0.3, cc.p(this.lineRightDown.x - this.lineRightDown.width, this.lineRightDown.y - this.lineRightDown.height));
            this.lineRightDown.runAction(this.lineRightDown.rightDownAction);

            this.lineLeftDown.leftDownAction = cc.sequence(cc.delayTime(0.3), cc.moveTo(0.3, cc.p(this.lineLeftDown.x + this.lineLeftDown.width + 20, this.lineLeftDown.y + this.lineLeftDown.height + 20)));
            this.lineLeftDown.runAction(this.lineLeftDown.leftDownAction);
            this.blockLeftDown.leftDownAction = cc.sequence(cc.delayTime(0.3), cc.moveTo(0.3, cc.p(this.blockLeftDown.x + this.blockLeftDown.width, this.blockLeftDown.y + this.blockLeftDown.height)));
            this.blockLeftDown.runAction(this.blockLeftDown.leftDownAction);

            this.blockRightUp.rightUpAction = cc.sequence(cc.delayTime(0.3), cc.moveTo(0.3, cc.p(this.blockRightUp.x - this.blockRightUp.width - 20, this.blockRightUp.y - this.blockRightUp.height - 20)));
            this.blockRightUp.runAction(this.blockRightUp.rightUpAction);
            this.lineRightUp.rightUpAction = cc.sequence(cc.delayTime(0.3), cc.moveTo(0.3, cc.p(this.lineRightUp.x - this.lineRightUp.width, this.lineRightUp.y - this.lineRightUp.height)));
            this.lineRightUp.runAction(this.lineRightUp.rightUpAction);

        }, this), cc.delayTime(0.8), cc.callFunc(function () {

            canChangePage = true;
        }, this));
        this.fontLogo.runAction(logoAction);
    },
    disappear: function (callback, target) {

        var logoAction = cc.sequence(cc.scaleTo(0.5, 0), cc.callFunc(function () {
            this.blockLeftUp.runAction(this.blockLeftUp.leftUpAction.reverse());
            this.lineLeftUp.runAction(this.lineLeftUp.leftUpAction.reverse());

            this.blockRightDown.runAction(this.blockRightDown.rightDownAction.reverse());
            this.lineRightDown.runAction(this.lineRightDown.rightDownAction.reverse());

            this.lineLeftDown.runAction(this.lineLeftDown.leftDownAction.reverse());
            this.blockLeftDown.runAction(this.blockLeftDown.leftDownAction.reverse());

            this.blockRightUp.runAction(this.blockRightUp.rightUpAction.reverse());
            this.lineRightUp.runAction(this.lineRightUp.rightUpAction.reverse());
        }, this), cc.delayTime(0.8), cc.callFunc(function () {

            if (target && callback) {
                callback.call(target);
            }
        }, this));
        this.fontLogo.runAction(logoAction);
    }
});
var Layer22 = cc.Layer.extend({
    ctor: function () {
        this._super();
    },
    onEnter: function () {
        this._super();
        cc.spriteFrameCache.addSpriteFrames(res.secondPage_plist);
        this.initUI();
//        this.appear();
    },
    initUI: function () {

        var bg = new cc.Sprite(res.layer3_bg);
        bg.anchorX = 0;
        bg.anchorY = 0;
        bg.scaleX = cc.winSize.width / bg.width;
        bg.scaleY = cc.winSize.height / bg.height;
        this.addChild(bg, 0);

        this.accLayer = new cc.Layer();
        this.accLayer.anchorX = 0;
        this.accLayer.anchorY = 0;
        this.accLayer.x = 0;
        this.accLayer.y = 0;
        this.addChild(this.accLayer);


        this.lineLeftUp = new cc.Sprite("#line_left up.png");
        this.lineLeftUp.setPosition(cc.pAdd(cc.visibleRect.topLeft, cc.p(-this.lineLeftUp.width / 2, -this.lineLeftUp.height)));
//        this.addChild(this.lineLeftUp);
        this.blockLeftUp = new cc.Sprite(res.layer1_line2);
        this.blockLeftUp.setPosition(cc.pAdd(cc.visibleRect.topLeft, cc.p(-this.blockLeftUp.width / 2, -this.blockLeftUp.height)));
        this.accLayer.addChild(this.blockLeftUp);


        this.lineRightDown = new cc.Sprite(res.layer1_line1);
        this.lineRightDown.setPosition(cc.pAdd(cc.visibleRect.bottomRight, cc.p(this.lineRightDown.width / 2, this.lineRightDown.height / 2 * 3)));
        this.addChild(this.lineRightDown);
        this.blockRightDown = new cc.Sprite("#block_right_down.png");
        this.blockRightDown.setPosition(cc.pAdd(cc.visibleRect.bottomRight, cc.p(this.blockRightDown.width / 2, this.blockRightDown.height / 2 * 3)));
//        this.accLayer.addChild(this.blockRightDown);

        this.lineLeftDown = new cc.Sprite("#line_left down.png");
        this.lineLeftDown.setPosition(cc.pAdd(cc.visibleRect.bottomLeft, cc.p(-this.lineLeftDown.width / 2, -this.lineLeftDown.height / 2)));
//        this.addChild(this.lineLeftDown);
        this.blockLeftDown = new cc.Sprite("#block_left_down.png");
        this.blockLeftDown.setPosition(cc.pAdd(cc.visibleRect.bottomLeft, cc.p(-this.blockLeftDown.width / 2, -this.blockLeftDown.height / 2)));
//        this.accLayer.addChild(this.blockLeftDown);

        this.lineRightUp = new cc.Sprite("#line_right up.png");
        this.lineRightUp.setPosition(cc.pAdd(cc.visibleRect.topRight, cc.p(this.lineRightUp.width / 2, this.lineRightUp.height / 2)));
//        this.addChild(this.lineRightUp);
        this.blockRightUp = new cc.Sprite("#block_right_up.png");
        this.blockRightUp.setPosition(cc.pAdd(cc.visibleRect.topRight, cc.p(this.blockRightUp.width / 2, this.blockRightUp.height / 2)));
//        this.accLayer.addChild(this.blockRightUp);


        this.fontLogo = new cc.Sprite(res.layer3_icon);
        this.fontLogo.setPosition(cc.pAdd(cc.visibleRect.center, cc.p(0, 0)));
        this.fontLogo.setScale(0);
        this.addChild(this.fontLogo);

    },
    accelEvent: function (acc, event) {
        if (this.visible) {
            movArea(acc, this.accLayer);
        }
    },
    appear: function () {

        var logoAction = cc.sequence(cc.scaleTo(0.5, 0.8), cc.callFunc(function () {
            this.blockLeftUp.leftUpAction = cc.moveTo(0.3, cc.p(this.blockLeftUp.x + this.blockLeftUp.width + 20, this.blockLeftUp.y + this.blockLeftUp.height / 2 - 20));
            this.blockLeftUp.runAction(this.blockLeftUp.leftUpAction);
            this.lineLeftUp.leftUpAction = cc.moveTo(0.3, cc.p(this.lineLeftUp.x + this.lineLeftUp.width, this.lineLeftUp.y + this.lineLeftUp.height / 2));
            this.lineLeftUp.runAction(this.lineLeftUp.leftUpAction);

            this.blockRightDown.rightDownAction = cc.moveTo(0.3, cc.p(this.blockRightDown.x - this.blockRightDown.width - 20, this.blockRightDown.y - this.blockRightDown.height - 20));
            this.blockRightDown.runAction(this.blockRightDown.rightDownAction);
            this.lineRightDown.rightDownAction = cc.moveTo(0.3, cc.p(this.lineRightDown.x - this.lineRightDown.width, this.lineRightDown.y - this.lineRightDown.height));
            this.lineRightDown.runAction(this.lineRightDown.rightDownAction);

            this.lineLeftDown.leftDownAction = cc.sequence(cc.delayTime(0.3), cc.moveTo(0.3, cc.p(this.lineLeftDown.x + this.lineLeftDown.width + 20, this.lineLeftDown.y + this.lineLeftDown.height + 20)));
            this.lineLeftDown.runAction(this.lineLeftDown.leftDownAction);
            this.blockLeftDown.leftDownAction = cc.sequence(cc.delayTime(0.3), cc.moveTo(0.3, cc.p(this.blockLeftDown.x + this.blockLeftDown.width, this.blockLeftDown.y + this.blockLeftDown.height)));
            this.blockLeftDown.runAction(this.blockLeftDown.leftDownAction);

            this.blockRightUp.rightUpAction = cc.sequence(cc.delayTime(0.3), cc.moveTo(0.3, cc.p(this.blockRightUp.x - this.blockRightUp.width - 20, this.blockRightUp.y - this.blockRightUp.height - 20)));
            this.blockRightUp.runAction(this.blockRightUp.rightUpAction);
            this.lineRightUp.rightUpAction = cc.sequence(cc.delayTime(0.3), cc.moveTo(0.3, cc.p(this.lineRightUp.x - this.lineRightUp.width, this.lineRightUp.y - this.lineRightUp.height)));
            this.lineRightUp.runAction(this.lineRightUp.rightUpAction);

        }, this), cc.delayTime(0.8), cc.callFunc(function () {

            canChangePage = true;
        }, this));
        this.fontLogo.runAction(logoAction);
    },
    disappear: function (callback, target) {

        var logoAction = cc.sequence(cc.scaleTo(0.5, 0), cc.callFunc(function () {
            this.blockLeftUp.runAction(this.blockLeftUp.leftUpAction.reverse());
            this.lineLeftUp.runAction(this.lineLeftUp.leftUpAction.reverse());

            this.blockRightDown.runAction(this.blockRightDown.rightDownAction.reverse());
            this.lineRightDown.runAction(this.lineRightDown.rightDownAction.reverse());

            this.lineLeftDown.runAction(this.lineLeftDown.leftDownAction.reverse());
            this.blockLeftDown.runAction(this.blockLeftDown.leftDownAction.reverse());

            this.blockRightUp.runAction(this.blockRightUp.rightUpAction.reverse());
            this.lineRightUp.runAction(this.lineRightUp.rightUpAction.reverse());
        }, this), cc.delayTime(0.8), cc.callFunc(function () {

            if (target && callback) {
                callback.call(target);
            }
        }, this));
        this.fontLogo.runAction(logoAction);
    }
});
var Layer3 = cc.Layer.extend({
    speed: 200,
    ctor: function () {
        this._super();
    },
    onEnter: function () {
        this._super();
        cc.spriteFrameCache.addSpriteFrames(res.thirdPage_plist);
        this.initUI();
//        this.appear();
    },
    initUI: function () {

        var bg = new cc.Sprite(res.layer4_bg);
        bg.anchorX = 0;
        bg.anchorY = 0;
        bg.scaleX = cc.winSize.width / bg.width;
        bg.scaleY = cc.winSize.height / bg.height;
        this.addChild(bg, 0);

        this.accLayer = new cc.Layer();
        this.accLayer.anchorX = 0;
        this.accLayer.anchorY = 0;
        this.accLayer.x = 0;
        this.accLayer.y = 0;
        this.addChild(this.accLayer);

        this.leftUpPic = new cc.Sprite(res.layer1_line1);
        this.leftUpPic.setPosition(cc.pAdd(cc.visibleRect.topLeft, cc.p(-this.leftUpPic.width / 2-30, this.leftUpPic.height / 2+50)));
        this.accLayer.addChild(this.leftUpPic);


        this.leftDownPic = new cc.Sprite("#block_left_down2.png");
        this.leftDownPic.setPosition(cc.pAdd(cc.visibleRect.bottomLeft, cc.p(-this.leftDownPic.width / 2, -this.leftDownPic.height / 2)));
//        this.accLayer.addChild(this.leftDownPic);

        this.rightUpPic = new cc.Sprite("#block_right_up2.png");
        this.rightUpPic.setPosition(cc.pAdd(cc.visibleRect.topRight, cc.p(this.rightUpPic.width / 2, -this.rightUpPic.height / 2)));
//        this.accLayer.addChild(this.rightUpPic);

        this.rightDownPic = new cc.Sprite(res.layer1_line2);
        this.rightDownPic.setPosition(cc.pAdd(cc.visibleRect.bottomRight, cc.p(this.rightDownPic.width / 2+30, -this.rightDownPic.height / 2-70)));
        this.accLayer.addChild(this.rightDownPic);

        this.line = new cc.ProgressTimer(new cc.Sprite(res.layer4_line));
        this.line.type = cc.ProgressTimer.TYPE_BAR;
        this.line.midPoint = cc.p(0, 1);
        this.line.barChangeRate = cc.p(0, 1);
        this.line.percentage = 0;
        this.line.scale = 0.75;
        this.line.setPosition(cc.p(cc.winSize.width / 2 - 30, cc.winSize.height - this.line.height / 2));
        this.addChild(this.line);

        //---------------------- 1 --------------------
        this.firstPoint = new cc.Sprite(res.layer4_color1);
        this.firstPoint.setPosition(cc.p(185, this.line.height));
        this.firstPoint.scale = 0;
        this.line.addChild(this.firstPoint);

        this.firstText = new cc.Sprite(res.layer4_label1);
        this.firstText.setPosition(cc.p(this.firstPoint.x + this.firstPoint.width / 2 + 20 + this.firstText.width, this.firstPoint.y ));
        this.firstText.opacity = 0;
        this.line.addChild(this.firstText);


        //---------------------- 2 --------------------
        this.secondPoint = new cc.Sprite(res.layer4_color2);
        this.secondPoint.setPosition(cc.p(115,   this.line.height - 140));
        this.secondPoint.scale = 0;
        this.line.addChild(this.secondPoint);

        this.secondText = new cc.Sprite(res.layer4_label2);
        this.secondText.setPosition(cc.p(this.secondPoint.x +  this.secondPoint.width, this.secondPoint.y ));
        this.secondText.opacity = 0;
        this.line.addChild(this.secondText);

        //---------------------- 3 --------------------
        this.thirdPoint = new cc.Sprite(res.layer4_color3);
        this.thirdPoint.setPosition(cc.p(cc.winSize.width + 28,cc.winSize.height-240));
        this.thirdPoint.scale = 0;
        this.line.addChild(this.thirdPoint);

        this.thirdText = new cc.Sprite(res.layer4_label3);
        this.thirdText.setPosition(cc.p(500, this.thirdPoint.y-80));
        this.thirdText.opacity = 0;
        this.line.addChild(this.thirdText);


        //---------------------- 4 --------------------
        this.fourPoint = new cc.Sprite(res.layer4_color4);
        this.fourPoint.setPosition(cc.p(cc.winSize.width + 55,cc.winSize.height-500));
        this.fourPoint.scale = 0;
        this.line.addChild(this.fourPoint);

        this.foureText = new cc.Sprite(res.layer4_label4);
        this.foureText.setPosition(cc.p(500, this.fourPoint.y ));
        this.foureText.opacity = 0;
        this.line.addChild(this.foureText);

        //---------------------- 5 --------------------
        this.fivePoint = new cc.Sprite(res.layer4_color5);
        this.fivePoint.setPosition(cc.p(145,   this.line.height - 640));
        this.fivePoint.scale = 0;
        this.line.addChild(this.fivePoint);

        this.fiveText = new cc.Sprite(res.layer4_label5);
        this.fiveText.setPosition(cc.p(this.fivePoint.x + 180, this.fivePoint.y - 10));
        this.fiveText.opacity = 0;
        this.line.addChild(this.fiveText);

        //---------------------- end --------------------
        this.forthPoint = new cc.Sprite(res.layer4_forth);
        this.forthPoint.setPosition(cc.p(450, -this.forthPoint.height / 2 + 100));
        this.line.addChild(this.forthPoint);
        this.forthPoint.scale = 0;

    },
    accelEvent: function (acc, event) {
        if (this.visible) {
            movArea(acc, this.accLayer);
        }
    },
    appear: function () {//20,20,40,10,10
        this.leftUpPic.inAciton = cc.moveTo(0.2, cc.p(this.leftUpPic.x + this.leftUpPic.width + 20, this.leftUpPic.y - this.leftUpPic.height + 20));
        this.leftUpPic.runAction(this.leftUpPic.inAciton);

        this.leftDownPic.inAciton = cc.moveTo(0.2, cc.p(this.leftDownPic.x + this.leftDownPic.width + 20, this.leftDownPic.y + this.leftDownPic.height + 20));
        this.leftDownPic.runAction(this.leftDownPic.inAciton);

        this.rightUpPic.inAciton = cc.moveTo(0.2, cc.p(this.rightUpPic.x - this.rightUpPic.width - 30, this.rightUpPic.y - this.rightUpPic.height - 30));
        this.rightUpPic.runAction(this.rightUpPic.inAciton);

        this.rightDownPic.inAciton = cc.moveTo(0.2, cc.p(this.rightDownPic.x - this.rightDownPic.width - 20, this.rightDownPic.y + this.rightDownPic.height + 80));
        this.rightDownPic.runAction(this.rightDownPic.inAciton);

        this.firstPoint.inAction = cc.scaleTo(0.2, 1);
        this.firstPoint.runAction(this.firstPoint.inAction);
        this.firstText.inAction = cc.sequence(cc.delayTime(0.2), cc.spawn(cc.moveTo(0.2, cc.p(this.firstText.x - this.firstText.width / 2, this.firstText.y)), cc.fadeIn(0.5)));
        this.firstText.runAction(this.firstText.inAction);

        var action = cc.sequence(cc.delayTime(0.2), cc.progressTo(0.3, 16), cc.callFunc(function () {
            this.secondPoint.inAction = cc.scaleTo(0.2, 1);
            this.secondPoint.runAction(this.secondPoint.inAction);
            this.secondText.inAction = cc.sequence(cc.delayTime(0.2), cc.spawn(cc.moveTo(0.2, cc.p(this.secondText.x + this.secondText.width / 2, this.secondText.y)), cc.fadeIn(0.5)));
            this.secondText.runAction(this.secondText.inAction);
        }, this), cc.delayTime(0.7), cc.progressTo(0.4, 36), cc.callFunc(function () {
            this.thirdPoint.inAction = cc.scaleTo(0.2, 1);
            this.thirdPoint.runAction(this.thirdPoint.inAction);
            this.thirdText.inAction = cc.sequence(cc.delayTime(0.2), cc.spawn(cc.moveTo(0.2, cc.p(this.thirdText.x - this.thirdText.width / 2, this.thirdText.y)), cc.fadeIn(0.5)));
            this.thirdText.runAction(this.thirdText.inAction);
        }, this), cc.delayTime(0.7), cc.progressTo(0.3, 60), cc.callFunc(function () {
            this.fourPoint.inAction = cc.scaleTo(0.2, 1);
            this.fourPoint.runAction(this.fourPoint.inAction);
            this.foureText.inAction = cc.sequence(cc.delayTime(0.2), cc.spawn(cc.moveTo(0.2, cc.p(this.foureText.x - this.foureText.width / 2, this.foureText.y)), cc.fadeIn(0.5)));
            this.foureText.runAction(this.foureText.inAction);

        }, this), cc.delayTime(0.7), cc.progressTo(0.3, 80), cc.callFunc(function () {
            this.fivePoint.inAction = cc.scaleTo(0.2, 1);
            this.fivePoint.runAction(this.fivePoint.inAction);
            this.fiveText.inAction = cc.sequence(cc.delayTime(0.2), cc.spawn(cc.moveTo(0.2, cc.p(this.fiveText.x - this.fiveText.width / 2, this.fiveText.y)), cc.fadeIn(0.5)));
            this.fiveText.runAction(this.fiveText.inAction);
        }, this), cc.delayTime(0.7), cc.progressTo(0.3, 90), cc.callFunc(function () {
            this.forthPoint.inAction = cc.scaleTo(0.2, 1);
            this.forthPoint.runAction(this.forthPoint.inAction);
        }, this), cc.delayTime(0.7), cc.progressTo(0.3, 100), cc.callFunc(function () {

            canChangePage = true;
//            this.disappear();
        }, this));
        this.line.runAction(action);
    },
    disappear: function (callback, target) {

        this.leftUpPic.runAction(this.leftUpPic.inAciton.reverse());
        this.leftDownPic.runAction(this.leftDownPic.inAciton.reverse());
        this.rightUpPic.runAction(this.rightUpPic.inAciton.reverse());
        this.rightDownPic.runAction(this.rightDownPic.inAciton.reverse());

        this.forthPoint.inAction = cc.sequence(cc.delayTime(0.2), cc.scaleTo(0.2, 0));
        this.forthPoint.runAction(this.forthPoint.inAction);

        var action = cc.sequence(cc.progressFromTo(0.5, 100, 0), cc.delayTime(0.5), cc.callFunc(function () {

            if (target && callback) {
                callback.call(target);
            }
        }, this));
        this.line.runAction(action);
        this.thirdPoint.inAction = cc.sequence(cc.delayTime(0.2), cc.scaleTo(0.2, 0));
        this.thirdPoint.runAction(this.thirdPoint.inAction);
        this.thirdText.inAction = cc.spawn(cc.moveTo(0.3, cc.p(this.thirdText.x + this.thirdText.width / 2, this.thirdText.y)), cc.fadeOut(0.3));
        this.thirdText.runAction(this.thirdText.inAction);

        this.secondPoint.inAction = cc.sequence(cc.delayTime(0.2), cc.scaleTo(0.2, 0));
        this.secondPoint.runAction(this.secondPoint.inAction);
        this.secondText.inAction = cc.spawn(cc.moveTo(0.5, cc.p(this.secondText.x - this.secondText.width / 2, this.secondText.y)), cc.fadeOut(0.3));
        this.secondText.runAction(this.secondText.inAction);

        this.firstPoint.inAction = cc.sequence(cc.delayTime(0.2), cc.scaleTo(0.2, 0));
        this.firstPoint.runAction(this.firstPoint.inAction);
        this.firstText.inAction = cc.spawn(cc.moveTo(0.3, cc.p(this.firstText.x + this.firstText.width / 2, this.firstText.y)), cc.fadeOut(0.3));
        this.firstText.runAction(this.firstText.inAction);

        this.fourPoint.inAction = cc.sequence(cc.delayTime(0.2), cc.scaleTo(0.2, 0));
        this.fourPoint.runAction(this.fourPoint.inAction);
        this.foureText.inAction = cc.spawn(cc.moveTo(0.3, cc.p(this.foureText.x + this.foureText.width / 2, this.foureText.y)), cc.fadeOut(0.3));
        this.foureText.runAction(this.foureText.inAction);

        this.fivePoint.inAction = cc.sequence(cc.delayTime(0.2), cc.scaleTo(0.2, 0));
        this.fivePoint.runAction(this.fivePoint.inAction);
        this.fiveText.inAction = cc.spawn(cc.moveTo(0.3, cc.p(this.fiveText.x + this.fiveText.width / 2, this.fiveText.y)), cc.fadeOut(0.3));
        this.fiveText.runAction(this.fiveText.inAction);


    }
});



var Layer4 = cc.Layer.extend({
    ctor: function () {
        this._super();
    },
    onEnter: function () {
        this._super();
        cc.spriteFrameCache.addSpriteFrames(res.forthPage_plist);
        this.initUI();
//        this.appear();

    },
    initUI: function () {
        this.accLayer = new cc.Layer();
        this.accLayer.anchorX = 0;
        this.accLayer.anchorY = 0;
        this.accLayer.x = 0;
        this.accLayer.y = 0;
        this.addChild(this.accLayer);

        this.map = new cc.Sprite(res.map_png);
        this.accLayer.addChild(this.map);
        this.map.setPosition(cc.pAdd(cc.visibleRect.top, cc.p(0, this.map.height / 2)));

        this.greenDot = new cc.Sprite("#destination_1.png");
        this.map.addChild(this.greenDot);
        this.greenDot.setPosition(cc.p(145, 305));
        var anim = cc.repeatForever(cc.sequence(cc.animate(new cc.Animation([cc.spriteFrameCache.getSpriteFrame("destination_1.png"), cc.spriteFrameCache.getSpriteFrame("destination_2.png")], 0.3)), cc.delayTime(0.5)));
        this.greenDot.runAction(anim);

        this.timeAngle = new cc.Sprite("#light_2.png");
        this.time = new cc.Sprite("#time.png");
        this.time.setPosition(cc.p(this.time.width - 18, this.time.height / 2 - 23));
        this.timeAngle.addChild(this.time);
        this.timeAngle.setPosition(cc.p(this.greenDot.x + this.greenDot.width / 2 + this.timeAngle.width / 2 + 4, this.greenDot.y + 11));
        this.map.addChild(this.timeAngle);
        this.timeAngle.scale = 0;

        this.registerBtn = new cc.MenuItemImage("#button_normal.png", "#button_hover.png", this.registerClick, this);
        this.registerBtn.setPosition(cc.pAdd(cc.visibleRect.bottom, cc.p(0, -this.registerBtn.height / 2)));
        var menu = new cc.Menu(this.registerBtn);
        menu.x = 0;
        menu.y = 0;
        this.addChild(menu);
    },
    registerClick: function () {
        var item = getById("regPage");
        removeClass(item, "hide");
        removeClass(item, "animOut");
        addClass(item, "anim");
        var game = getById("Cocos2dGameContainer");
        addClass(game,"hide");
        setTimeout(function () {
            removeClass(item, "anim");
        }, 800);
    },
    accelEvent: function (acc, event) {
        if (this.visible) {
            movArea(acc, this.accLayer);
        }
    },
    appear: function () {
        this.map.mapAction = cc.moveTo(0.5, cc.p(this.map.x, this.map.y - this.map.height)).easing(cc.easeIn(0.5));
        this.map.runAction(this.map.mapAction);

        this.registerBtn.inAction = cc.moveTo(0.5, cc.p(this.registerBtn.x, this.registerBtn.y + this.registerBtn.height / 2 + 160)).easing(cc.easeIn(0.5));
        this.registerBtn.runAction(this.registerBtn.inAction);

        this.timeAngle.inAction = cc.sequence(cc.delayTime(0.5), cc.scaleTo(0.3, 1), cc.delayTime(0.3), cc.callFunc(function () {
            canChangePage = true;
        }, this));
        this.timeAngle.runAction(this.timeAngle.inAction);

    },
    disappear: function (callback, target) {
        var timeAngleAction = cc.scaleTo(0.3, 0);
        this.timeAngle.runAction(timeAngleAction);
        var registerAction = cc.sequence(cc.delayTime(0.3), cc.moveTo(0.5, cc.p(this.registerBtn.x, this.registerBtn.y - this.registerBtn.height / 2 - 160)).easing(cc.easeIn(0.5)));
        this.registerBtn.runAction(registerAction);
        var mapAction = cc.sequence(cc.delayTime(0.3), cc.moveTo(0.5, cc.p(this.map.x, this.map.y + this.map.height)).easing(cc.easeIn(0.5)), cc.delayTime(0.6), cc.callFunc(function () {
            if (target && callback) {
                callback.call(target);
            }
        }, this));
        this.map.runAction(mapAction);
    }
});
var Layer5 = cc.Layer.extend({
    ctor: function () {
        this._super();
    },
    onEnter: function () {
        this._super();
        cc.spriteFrameCache.addSpriteFrames(res.fifPage_plist);
        this.initUI();
//        this.appear();
    },
    initUI: function () {
        this.accLayer = new cc.Layer();
        this.accLayer.anchorX = 0;
        this.accLayer.anchorY = 0;
        this.accLayer.x = 0;
        this.accLayer.y = 0;
        this.addChild(this.accLayer);

        this.leftUp = new cc.Sprite("#left_up.png");
        this.leftUp.setPosition(cc.pAdd(cc.visibleRect.topLeft, cc.p(-this.leftUp.width / 2, -this.leftUp.height * 3 / 2)));
        this.accLayer.addChild(this.leftUp);
        this.leftDown = new cc.Sprite("#left_down.png");
        this.leftDown.setPosition(cc.pAdd(cc.visibleRect.bottomLeft, cc.p(-this.leftDown.width / 2, -this.leftDown.height / 2)));
        this.accLayer.addChild(this.leftDown);
        this.rightUp = new cc.Sprite("#right_up.png");
        this.rightUp.setPosition(cc.pAdd(cc.visibleRect.topRight, cc.p(this.rightUp.width / 2, this.rightUp.height / 2)));
        this.accLayer.addChild(this.rightUp);
        this.rightDown = new cc.Sprite("#right_down.png");
        this.rightDown.setPosition(cc.pAdd(cc.visibleRect.bottomRight, cc.p(this.rightDown.width / 2, this.rightDown.height * 3 / 2)));
        this.accLayer.addChild(this.rightDown);

        this.code = new cc.Sprite("#code.png");
        this.code.setPosition(cc.pAdd(cc.visibleRect.top, cc.p(0, this.code.height / 2)));
        this.addChild(this.code);

        this.text = new cc.Sprite("#focus.png");
        this.text.setPosition(cc.pAdd(cc.visibleRect.left, cc.p(-this.text.width / 2, -20)));
        this.addChild(this.text);

        this.shareText = new cc.Sprite("#share.png");
        this.shareText.setPosition(cc.pAdd(cc.visibleRect.bottomLeft, cc.p(this.shareText.width / 2 + 30, -this.shareText.height / 2)));
        this.addChild(this.shareText);

    },
    appear: function () {
        this.leftUp.moveAction = cc.moveTo(0.2, cc.p(this.leftUp.x + this.leftUp.width, this.leftUp.y + this.leftUp.height / 2));
        this.leftUp.runAction(this.leftUp.moveAction);
        this.rightDown.moveAction = cc.moveTo(0.2, cc.p(this.rightDown.x - this.rightDown.width, this.rightDown.y - this.rightDown.height));
        this.rightDown.runAction(this.rightDown.moveAction);

        this.leftDown.moveAction = cc.sequence(cc.delayTime(0.2), cc.moveTo(0.2, cc.p(this.leftDown.x + this.leftDown.width, this.leftDown.y + this.leftDown.height + 30)));
        this.leftDown.runAction(this.leftDown.moveAction);
        this.rightUp.moveAction = cc.sequence(cc.delayTime(0.2), cc.moveTo(0.2, cc.p(this.rightUp.x - this.rightUp.width, this.rightUp.y - this.rightUp.height)));
        this.rightUp.runAction(this.rightUp.moveAction);

        this.code.moveAction = cc.sequence(cc.delayTime(0.5), cc.moveTo(0.2, cc.p(this.code.x, this.code.y - this.code.height - 80)));
        this.code.runAction(this.code.moveAction);

        this.shareText.moveAction = cc.sequence(cc.delayTime(0.5), cc.moveTo(0.2, cc.p(this.shareText.x + 40, this.shareText.y + this.shareText.height + 20)));
        this.shareText.runAction(this.shareText.moveAction);

        this.text.moveAction = cc.sequence(cc.delayTime(0.7), cc.moveTo(0.2, cc.p(cc.visibleRect.center.x + 20, this.text.y)).easing(cc.easeIn(0.8)), cc.moveTo(0.05, cc.p(cc.visibleRect.center.x, this.text.y)).easing(cc.easeIn(0.8)), cc.delayTime(0.25), cc.callFunc(function () {
            canChangePage = true;
        }, this));
        this.text.runAction(this.text.moveAction);

    },
    disappear: function (callback, target) {
        var action = cc.sequence(cc.moveTo(0.2, cc.p(cc.visibleRect.left.x - this.text.width / 2, this.text.y)).easing(cc.easeOut(0.8)), cc.delayTime(0.3), cc.callFunc(function () {
            this.leftUp.runAction(this.leftUp.moveAction.reverse());
            this.rightDown.runAction(this.rightDown.moveAction.reverse());
            this.leftDown.runAction(this.leftDown.moveAction.reverse());
            this.rightUp.runAction(this.rightUp.moveAction.reverse());
            this.code.runAction(this.code.moveAction.reverse());
            this.shareText.runAction(this.shareText.moveAction.reverse());
        }, this), cc.delayTime(0.3), cc.callFunc(function () {
            if (target && callback) {
                callback.call(target);
            }
        }, this));
        this.text.runAction(action);
    }
});

var movArea = function (acc, node) {
    var curx = node.x + 20 * acc.x;
    var cury = node.y + 20 * acc.y;
    node.x = Math.abs(curx) < 7 ? curx : node.x;
    node.y = Math.abs(cury) < 7 ? cury : node.y;

}
/************************************************************************************************************************************/
var reclick = true;
var isSuccess = false;
var musicPlayStatus = true;
var getById = function (id) {
    return document.getElementById(id);
}
var moveIn = function () {
    var obj = getById();
}
function hasClass(ele, cls) {
    var result = ele && ele.className && (ele.className.search(new RegExp('(\\s|^)' + cls + '(\\s|$)')) != -1);
    return !!result;
}

function addClass(ele, cls) {
    if (!hasClass(ele, cls) && ele)
        ele.className += " " + cls;
}

function removeClass(ele, cls) {
    if (hasClass(ele, cls)) {
        var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
        ele.className = ele.className.replace(reg, ' ');
    }
}

window["onCloseClick"] = function () {
    removeClass(getById("regPage"), "anim");
    addClass(getById("regPage"), "animOut");
    var game = getById("Cocos2dGameContainer");
    removeClass(game,"hide");
    setTimeout(function () {
        addClass(getById("regPage"), "hide");
    }, 300);
}

window["onSubmitClick"] = function () {
    AV.initialize("3g2sxoj3vp4do31dt2p6onbelpk0b3j0i9zw4smr16ut5oly", "x8x9o61va6f5aciipo1jhkiaghhhd97r83s0uv8oc3wgqpae");
// 初始化 param1：应用 id、param2：应用 key

    if (!reclick) {
        window["showAlert"]("申请发送中，请勿重复发送~");
        return false;
    }
    if (checkForm()) {
        reclick = false;

        var realname =  getById("realname").value.trim();
        var telephone =  getById("telephone").value.trim();

        //房产抵押
        var GameScore = AV.Object.extend("weixinshare");
        var gameScore = new GameScore();
        gameScore.set("realname", realname);
        gameScore.set("telephone", telephone);

        gameScore.save(null, {
            success: function(gameScore) {
//                alert_show("提示","您的资料提交成功，请耐心等待利巨人业务团队联系您.",false);
                // Execute any logic that should take place after the object is saved.
//            alert('New object created with objectId: ' + gameScore.id);
                isSuccess = true;
                message = "您的报名信息已经成功提交";
                window["showAlert"](message);

            },
            error: function(gameScore, error) {
//                alert_show("提示","您的资料提交失败，请重新提交.",false);
//                Execute any logic that should take place if the save fails.
                // error is a AV.Error with an error code and description.
//            alert('Failed to create new object, with error code: ' + error.description);

                window["showAlert"]("提交失败，请重新提交");

            }
        });


       /* post({
            "realname": getById("realname").value.trim(),
            "telephone": getById("telephone").value.trim(),
            "email": getById("email").value.trim(),
            "company": getById("company").value.trim(),
            "position": getById("position").value.trim(),
            "extra": getById("extra").value.trim(),
            "from": "mobile"
        }, function (result) {
            var message = "";
            if (result["status"] == 1) {
                isSuccess = true;
                message = "您的报名信息已经成功提交";
                window["showAlert"](message);
            } else {
                if (result["error"]) {
                    if (result["error"]["email_unique"]) {
                        message = result["error"]["email_unique"];
                    } else if (result["error"]["telephone_unique"]) {
                        message = result["error"]["telephone_unique"];
                    } else if (result["error"]["from"]) {
                        message = result["error"]["from"];
                    } else if (result["error"]["realname"]) {
                        message = result["error"]["realname"];
                    } else if (result["error"]["position"]) {
                        message = result["error"]["position"];
                    } else if (result["error"]["email"]) {
                        message = result["error"]["email"];
                    } else if (result["error"]["telephone"]) {
                        message = result["error"]["telephone"];
                    } else if (result["error"]["company"]) {
                        message = result["error"]["company"];
                    } else if (result["error"] && typeof result["error"] == "string") {
                        message = result["error"];
                    } else {
                        message = "未知错误";
                    }
                }
                window["showAlert"](message);
            }
        });*/
    }
}
window["onOkClick"] = function () {
    var alertItem = getById("alertItem");
    removeClass(alertItem, "alertAnimIn");
    addClass(alertItem, "alertAnimOut");
    setTimeout(function () {
        addClass(alertItem, "hide");
        if (isSuccess) {
            isSuccess = false;
            window["onCloseClick"]();
            if (curScene) {
                curScene.changePage(++curScene.currentIndex, true);
            }
        }
    }, 280);
}
window["showAlert"] = function (msg) {
    if (!msg) msg = "";
    var alertText = getById("alertText");
    var alertItem = getById("alertItem");
    alertText.innerHTML = msg;
    removeClass(alertItem, "alertAnimOut");
    addClass(alertItem, "alertAnimIn");
    removeClass(alertItem, "hide");
    setTimeout(function () {
        removeClass(alertItem, "alertAnimIn");
    }, 300);
}
var checkForm = function () {
    var checkStatus = true;
//    var list = ["realname", "telephone", "email", "company", "position"];
    var list = ["realname", "telephone"];
    var data = [];
    for (var i = 0; i < list.length; i++) {
        data[i] = getById(list[i]).value.trim();
    }
    for (var i = 0; i < list.length; i++) {
        var item = getById(list[i]);
        if (data[i] == "") {
            removeClass(item, "inputItem_normal");
            addClass(item, "inputItem_error");
            item.placeholder = "此项不能为空";
            checkStatus = false;
        } else {
            removeClass(item, "inputItem_error");
            addClass(item, "inputItem_normal");
        }
    }
    var phoneReg = /^[0-9]*[1-9][0-9]*$/;
    if (data[1].length != 11 || !phoneReg.test(data[1])) {
        var item = getById(list[1]);
        data[1] = "";
        item.value = "";
        item.placeholder = "请输入正确的手机号码";
        removeClass(item, "inputItem_normal");
        addClass(item, "inputItem_error");
        checkStatus = false;
    } else {
        addClass(getById(list[2]), "inputItem_normal");
    }
    /*var emailReg = /^([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{1,4}$/gi;
    if (!emailReg.test(data[2])) {
        var item = getById(list[2]);
        data[2] = "";
        item.value = "";
        item.placeholder = "请输入正确的邮箱";
        removeClass(item, "inputItem_normal");
        addClass(item, "inputItem_error");
        checkStatus = false;
    } else {
        addClass(getById(list[2]), "inputItem_normal");
    }*/
    return checkStatus;
}
var post = function (data, callfunc) {
    var self = this;
    var xhr = cc.loader.getXMLHttpRequest();
    var oUrl = window.location.host;
    oUrl = encodeURIComponent(oUrl);
    xhr.open("POST", "YOUR URL", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;");
    xhr.timeout = 10000;
    xhr.ontimeout = function () {
        reclick = true;
    }
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            reclick = true;
        }
        if (xhr.readyState == 4 && xhr.status == 200) {
            var result = JSON.parse(xhr.responseText);
            callfunc(result);
        }
    };
    var param = "";
    for (var key in data) {
        param = param + key + "=" + data[key] + "&";
    }
    param = encodeURI(param);
    xhr.send(param);
};
var initMusic = function () {
    var audio = getById("myAudio");
//    audio.src = "res/bg.mp3";
//    audio.src = "http://bcs.duapp.com/duoduo-ring/%2Fa4%2F2971325.aac?sign=MBO:CA2b99d05e588832a4a0b59baee3ddb4:iaSfJoC8doMiSRhzE%2FjgiOfrKEQ%3D";
    audio.src = "http://bcs.duapp.com/duoduo-ring/%2Fa4%2F72870.aac?sign=MBO:CA2b99d05e588832a4a0b59baee3ddb4:ZwSHs2QhNDiVvkamJXBLEMtOQXo%3D";
}
var playMusic = function (status) {
    var audio = getById("myAudio");
    if (status) {
        if (audio.paused) {
            //旋转开始
            var repeat = cc.rotateBy(1, 360).repeatForever();
            repeatMusicScene.runAction(repeat);
            audio.play();
            musicPlayStatus = true;
        }
    } else {
        if (!audio.paused) {
            //旋转暂停
            repeatMusicScene.rotate = 0;
            repeatMusicScene.stopAction();
            audio.pause();
            musicPlayStatus = false;
        }
    }

    ////这里处理旋转事件

//    var actionTo = cc.rotateTo(2, 45);
//    var actionTo2 = cc.rotateTo(2, -45);
//    var actionTo0 = cc.rotateTo(2, 0);
//    musicScene.runAction(cc.sequence(actionTo, cc.delayTime(0.25), actionTo0));

//    var actionBy = cc.rotateBy(2, 360);
//    var actionByBack =null;// actionBy.reverse();
//    musicScene.runAction(cc.sequence(actionBy, cc.delayTime(0.25), actionByBack));



}