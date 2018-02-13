
class LaserCutter {
	var States = Object.freeze({"emergency":0, "off":1, "unhomed":2, "homed":3})
	var state = States.emergency;

	function get(msg) {
		$.get( "laser/" + msg, function( data ) {
			if(data != "get " + msg) alert("Error Communicating");
		}, async:false);
	}

	function set(msg) {
		$.post( "laser/" + msg, function( data ) {
			if(data != "set " + msg) alert("Error Communicating");
		}, async:false);
	}
	
	function getState() {
		if(get( "joint_homed 1" ) && get( "joint_homed 0" )) {
			state = States.homed;
			return state;
		}
		if(get( "machine" )) {
			state = States.unhomed;
			return state;
		}
		if(!get( "estop" )) {
			state = States.off;
			return state;
		}
		state = States.emergency;
		return state;
	}
	
	function checkState(minState) {
		getState();
		if(state >= minState) {
			return true;
		}
		
		if(state == States.unhomed) {
			console.out("Please home the laser first!");
			return false;
		}
		
		if(state == States.off) {
			console.out("Please turn on the laser first!");
			return false;
		}
		
		if(state == States.emergency) {
			console.out("Please release the emergency stop!");
			return false;
		}
	}

	function keepAlive() {
		$.post( "keepalive/" + msg, function( data ) {
			if(data != "okay") alert("Error Communicating");
		});
	}
	
	function laserInit() {
		set( "enable EMCTOO" );
		set( "mode manual" );
		set( "estop off" );
	}
	
	function laserOn() {
		set( "mode manual" );
		set( "estop off" );
		set( "machine on" );
	}
	
	//async
	function laserHome() {
		if (!checkState(States.unhomed)) return;
		set( "mode manual" );
		set( "home 1" );
		setTimeout(function() {
			set( "home 0" );
		}, 3000);
	}
	
	function laserOn(filename) {
		if (!checkState(States.homed)) return;
		set( "mode auto" );
		set( "open " + file );
	}
	
	constructor() {
		setInterval(keepAlive, 1000);
		initLaser();
		if(getState() < States.off) console.out( "Could not turn on laser cutter" );
	}
};

class LaserUi {
	constructor(laser) {
		this.laser = laser;
	}
	
	function getEstopButtonOn() {
		return laser.state == laser.States.emergency;
	}
	
	function getStartButtonGreyedOut() {
		return laser.state == laser.States.emergency;
	}
	
	function getStartButtonOn() {
		return laser.state > laser.States.off;
	}
	
	function getHomeButtonGreyedOut() {
		return laser.state < laser.States.unhomed;
	}
	
	function getHomeButtonOn() {
		return laser.state == laser.States.homed;
	}
};

$( document ).ready(function() {
	console.log( "JS Started" );
	lc = LaserCutter();
});
