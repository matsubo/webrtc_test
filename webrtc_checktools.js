var WebRtcCheckTool = function(canvas_id) {
	var meterCanvasId = canvas_id;
	var meterCanvas = null;
	var meterStream = null;
	var meter2DCtx = null;
	var meterAudioContext = null;
	var meterMic = null;
	var meterAnalyser = null;
	var meterTimerId = 0;

	this.init = function() {
		meterCanvas = document.getElementById(canvas_id);
		if (! meterCanvas) {
			console.error('cannot get Canvas element');
			return;
		}
		
		meter2dCtx = meterCanvas.getContext('2d');
		if (! meter2dCtx) {
			console.error('cannot get Canvas 2D Context');
			return;
		}
		
		if(typeof(webkitAudioContext)!=="undefined") {
			meterAudioContext = new webkitAudioContext();
		}
		else if(typeof(AudioContext)!=="undefined") {
			meterAudioContext = new AudioContext();
		}
		
		if (! meterAudioContext) {
			console.error('cannot get WebAudio Context');
			return;
		}
	};
	
	this.startAnalyse = function(stream) {
		meterStream = stream;
		if (! meterStream) {
			console.error('bad stream to analyze');
			return;
		}
		if (! meterAudioContext) {
			return;
		}
		
		meterMic = meterAudioContext.createMediaStreamSource(meterStream);
		if (! meterMic) {
			console.error('cannot get mic node');
			return;
		}
		
		meterAnalyser = meterAudioContext.createAnalyser();
		if (! meterAnalyser) {
			console.error('cannot get analyser node');
			return;
		}
		meterAnalyser.fftSize = 1024;
		meterAnalyser.minDecibels = -80;
		meterAnalyser.maxDecibels = -30;

        meterMic.connect(meterAnalyser);
		meterTimerId = setInterval("webrtcDrawGraph()", 100);
	};
	
	this.stopAnalyse = function() {
		if (meterTimerId > 0) {
			clearInterval(meterTimerId);
			meterTimerId = 0;
		}
		
		if (meterAnalyser) {
			meterAnalyser = null;
		}
		
		if (meterMic) {
			meterMic = null;
		}
		
		if (meterStream) {
			// meterStream.stop();  // must stop outside of this class
			meterStream = null;
		}
		
		this.clearGraph();
	};
	
	this.clearGraph = function() {
		if (! meterCanvas) {
			return;
		}
		if (! meter2dCtx) {
			return;
		}

		var width = meterCanvas.width;
		var height = meterCanvas.height;
		meter2dCtx.fillStyle = "rgba(64,64,192, 256)";
		meter2dCtx.fillRect(0, 0, width, height);
	};
	
	this.drawGraph = function() {
		if (! meterCanvas) {
			return;
		}
		if (! meter2dCtx) {
			return;
		}
		if (! meterAnalyser) {
			return;
		}

		var width = meterCanvas.width;
		var height = meterCanvas.height;
		meter2dCtx.fillStyle = "rgba(64,64,192, 256)";
		meter2dCtx.fillRect(0, 0, width, height);

		var sampleCount = 256;
		var sampleDisplayLow = 20;
		var sampleDisplayHight = 180;
		var sampleDisplayCount = sampleDisplayHight - sampleDisplayLow;
		var sampleWidth = width / sampleDisplayCount;

		var data = new Uint8Array(sampleCount);
		meterAnalyser.getByteFrequencyData(data); //Spectrum Data
		
		for(var i = sampleDisplayLow; i < sampleDisplayHight; i++) {
			meter2dCtx.fillStyle = "rgba(255,64,64, 256)";
			//meter2dCtx.fillRect(i*2, 256 - data[i], 2, data[i]);

			var offset = i - sampleDisplayLow;
			meter2dCtx.fillRect( sampleWidth*offset, (256 - data[i])*(height/256),  sampleWidth, height);
		}
	};
};

var webRtcCheckTool = null;

function webrtcStartAudioCheck(stream, canvas_id) {
	if (! webRtcCheckTool) {
		webRtcCheckTool = new WebRtcCheckTool(canvas_id);
	}
	webRtcCheckTool.init();
	webRtcCheckTool.startAnalyse(stream);
}

function webrtcStopAudioCheck() {
	if (! webRtcCheckTool) {
		return;
	}
	webRtcCheckTool.stopAnalyse();
}

function webrtcDrawGraph() {
	if (! webRtcCheckTool) {
		return;
	}
	webRtcCheckTool.drawGraph();
}




