export type QualityLevel = 'good' | 'warning' | 'unknown';

export type CameraMessageKey =
	| 'preparing'
	| 'lookAhead'
	| 'brighterLight'
	| 'centerFace'
	| 'almostReady'
	| 'readyCapture'
	| 'adjustDistance'
	| 'moveCenter'
	| 'headLevel';

export type CameraQuality = {
	face: QualityLevel;
	position: QualityLevel;
	lighting: QualityLevel;
	brightness: number;
	messageKey: CameraMessageKey;
};
