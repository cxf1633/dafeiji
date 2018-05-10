var CarMgr = cc.Class({
    extends: cc.Component,

    properties: {
        ground:cc.Node,
        button:cc.Button,
        button2:cc.Button,

        moveMax:1,    //移动速度最大值
        moveMin:1,      //移动速度最小值
        addMove:1,      //移动加速度
        subMove:1,      //移动减速度
        _curMove:0,

        turnMax:1,      //转弯速度最大值
        addTurn:1,      //转弯加速度
        _curTurn:0,

        resistance:0,   //阻力
        _isStart:false,
        _isTouch:false,
        _touchDir:0,    //玩家点击的方向
        
        _bgX:640,
        _bgY:640,
        _offset:100,
        _index:1,
    },
    _curDir:null,//当前方向
    _curSpeed:null,   //当前速度

    start () {
        this._curDir = cc.p(0, 1);
        this._curSpeed = cc.p(0, 0);
        this.registerInput();
        this.addClickEvent(this.button, this.node, "CarMgr", "onBtnClick");
        this.addClickEvent(this.button2, this.node, "CarMgr", "onBtnClick2");
    },
    onBtnClick(){
        if(this._index > 2){
            this._index = 1;
            this.node.rotation =  180;
        }
        this.node.rotation += this._index * 90;
        var angle = Math.PI/180*(0 - this.node.rotation + 90);
        this._curDir = cc.pForAngle(angle);
        this._index += 1;
        //cc.log(this.node.rotation);
        cc.log("this._curDir  =", this._curDir);
    },
    onBtnClick2(){
        this._isStart = !this._isStart;
        this._curMove = 0;
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
        this._isStart = true;
        this._isTouch = true;
        var touches = event.getTouches();
        var touchLoc = touches[0].getLocation();
        if (touchLoc.x > 480) {
            this._touchDir = 1;      
        }
        else{
            this._touchDir = -1;
        }

    },
    touchEnd(){
        this._isTouch = false;
        this._touchDir = 0;
        this._curTurn = 0;
    },

    rotationCar(dt){
        //加速旋转
        if (this._curTurn < this.turnMax) {
            this._curTurn += this.addTurn;
        }
        var rotation = this.node.rotation;
        rotation += this._curTurn * this._touchDir;
        //cc.log("rotation=", rotation);
        rotation = rotation % 360;
        //cc.log("rotatio2=", rotation);
        this.node.rotation = rotation;
        var angle = Math.PI/180*(0 - rotation + 90);
        this._curDir = cc.pForAngle(angle);

        var speed = cc.p(0, 0);
        speed.x = this._curSpeed.x + this._curDir.x * this.subMove * this._curTurn;
        if (speed.x > this.moveMax) {
            speed.x = this.moveMax;
        }
        if (speed.x < -this.moveMax) {
            speed.x = -this.moveMax;
        }
        speed.y = this._curSpeed.y + this._curDir.y * this.subMove * this._curTurn;
        if (speed.y > this.moveMax) {
            speed.y = this.moveMax;
        }
        if (speed.y < -this.moveMax) {
            speed.y = -this.moveMax;
        }
        this._curSpeed = speed;
        // cc.log("_curDir =", this._curDir)
        // cc.log("rotationCar curSpeed=", this._curSpeed);
        this.moveGround();
    },
    moveCar(){
        var p = this.node.getPosition();
        //cc.log("p=", p);
        var px = p.x + this._curSpeed.x;
        //cc.log("px =", px);
        var offset = this._bgX/2+this._offset/2
        if (px > offset || px < -offset) {
            px = p.x;
            //this._curSpeed = cc.p(0, 0);
        }
        var py = p.y;
        this.node.setPosition(cc.p(px, py));
    },
    moveGround(){
        //this._curSpeed.x, this._curSpeed.y
        var p = this.ground.getPosition();
        var px = p.x - this._curSpeed.x;
        var py = p.y - this._curSpeed.y;
        //左右边界，地图x不移动，车只x移动
        if (px > this._offset || px < -this._offset) {
            px = p.x;
            this.moveCar();
        }
        //Y轴继续移动，地图拼接
        if (py > this._bgY || py < -this._bgY) {
            py = 0;
        }
        this.ground.setPosition(cc.p(px, py));
    },
    move(dt){
        var speed = cc.p(0, 0);
        speed.x = this._curSpeed.x + this._curDir.x * this.addMove * dt;// - this.resistance;
        if (speed.x > this.moveMax) {
            speed.x = this.moveMax;
        }
        if (speed.x < -this.moveMax) {
            speed.x = -this.moveMax;
        }
        speed.y = this._curSpeed.y + this._curDir.y * this.addMove * dt;// - this.resistance;
        if (speed.y > this.moveMax) {
            speed.y = this.moveMax;
        }
        if (speed.y < -this.moveMax) {
            speed.y = -this.moveMax;
        }
        this._curSpeed = speed;
        //cc.log("move   this._curSpeed =", this._curSpeed);
        this.moveGround();
    },
    update (dt) {
        if (this._isStart != true) {
            return;
        }

        if (this._isTouch == true) {
            this.rotationCar(dt);
        }
        else{
            this.move(dt);
        }

    },
    clampValue(v, max, min){
        if (v > max) {
            v = max;
        }
        if(v < min){
            v = min
        }
        return v;
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
