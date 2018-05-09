var CarMgr = cc.Class({
    extends: cc.Component,

    properties: {
        ground:cc.Node,
        button:cc.Button,
        button2:cc.Button,

        moveSpeedMax:1,
        turnSpeed:1,
        clickTimeMax:1,
        moveSpeedMin:20,
        stopNum:10,

        acceleration:5,//加速度

        _bgX:640,
        _bgY:640,
        _offset:100,
        _index:1,
    },
    direction:null,
    isStart:false,
    isTouch:false,

    touchPos:0,
    clickTime:0,
    
    curSpeed:0,
    
    start () {
        this.direction = cc.p(0, 0);
        this.clickTime = 0;
        this.curSpeed = 0;//this.moveSpeedMax;
        this.registerInput();

        this.addClickEvent(this.button, this.node, "CarMgr", "onBtnClick");
        this.addClickEvent(this.button2, this.node, "CarMgr", "onBtnClick2");
    },
    onBtnClick(){
        cc.log("onBtnClick");
        if(this._index > 2){
            this._index = 1;
        }

        this.node.rotation = this._index * 180;
        var angle = Math.PI/180*(0 - this.node.rotation + 90);
        this.direction = cc.pForAngle(angle);
        this._index += 1;
        cc.log(this.node.rotation);
    },
    onBtnClick2(){
        cc.log("onBtnClick2");
        this.isStart = !this.isStart;
        this.curSpeed = 0;
    },
    //-- 初始化
    registerInput () {
        //触屏
        this.node.parent.on(cc.Node.EventType.TOUCH_START, 
            function(event) {
                this.touchStart(event);
            }.bind(this),
            this.node.parent);
        this.node.parent.on(cc.Node.EventType.TOUCH_END, 
            function(event) {
                this.touchEnd(event);
            }.bind(this),
            this.node.parent);
    },

    touchStart(event){
        this.isStart = true;
        this.isTouch = true;
        var touches = event.getTouches();
        var touchLoc = touches[0].getLocation();
        if (touchLoc.x > 480) {
            this.touchPos = 1;      
        }
        else{
            this.touchPos = -1;
        }

    },
    touchEnd(){
        this.isTouch = false;
        this.touchPos = 0;
        this.clickTime = 0;
        //this.curSpeed = this.moveSpeedMax;
    },

    rotationCar(dt){
        this.clickTime += dt;
        if (this.clickTime > this.clickTimeMax) {
            this.clickTime = this.clickTimeMax;
        }
        //this.curSpeed -= this.stopNum *this.clickTime;
         this.curSpeed -= dt*this.stopNum;
        if (this.curSpeed < this.moveSpeedMin) {
            this.curSpeed = this.moveSpeedMin;
        }
        var rotation = this.node.rotation;
        rotation += this.turnSpeed*this.touchPos*this.clickTime;
        //cc.log("rotation=", rotation);
        rotation = rotation % 360;
        this.node.rotation = rotation;
        var angle = Math.PI/180*(0 - rotation + 90);
        this.direction = cc.pForAngle(angle);
        //cc.log("direction =", this.direction)
    },
    moveCar(dt){
        var p = this.node.getPosition();
        var px = p.x + this.direction.x * this.curSpeed * dt;
        if (px > this._bgX/2+this._offset/2 || px < -this._bgX/2-this._offset/2) {
            px = p.x;
        }
        var py = p.y;//p.y + this.direction.y * this.curSpeed * dt;
        this.node.setPosition(cc.p(px, py));
    },
    moveGround(dt){
        if (this.curSpeed < this.moveSpeedMax) {
            this.curSpeed += this.acceleration;
        }
        cc.log("this.curSpeed", this.curSpeed);
        var p = this.ground.getPosition();
        var px = p.x - this.direction.x * this.curSpeed * dt;
        var py = p.y - this.direction.y * this.curSpeed * dt;
        if (px > this._offset || px < -this._offset) {
            px = p.x;
            this.moveCar(dt);
        }
        if (py > this._bgY || py < -this._bgY) {
            py = 0;
        }
        this.ground.setPosition(cc.p(px, py));
    },
    update (dt) {
        if (this.isStart != true) {
            return;
        }
        //this.moveCar(dt);
        this.moveGround(dt);
        if (this.isTouch != true) {
            return;
        }
        this.rotationCar(dt);
    },

    addClickEvent: function(node,target,component,handler){
        cc.log(component + ":" + handler);
        var eventHandler = new cc.Component.EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;

        var clickEvents = node.getComponent(cc.Button).clickEvents;
        clickEvents.push(eventHandler);
    },

});
