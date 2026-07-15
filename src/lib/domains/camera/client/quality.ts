import type { FaceLandmarker, NormalizedLandmark } from '@mediapipe/tasks-vision';
import type { CameraQuality, QualityLevel } from '../shared/contracts';

const MEDIAPIPE_VERSION = '0.10.35';
const WASM_PATH = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`;
const MODEL_PATH =
	'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

let landmarkerPromise: Promise<FaceLandmarker | null> | null = null;

async function createLandmarker() {
	try {
		const { FaceLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');
		const vision = await FilesetResolver.forVisionTasks(WASM_PATH);
		return await FaceLandmarker.createFromOptions(vision, {
			baseOptions: { modelAssetPath: MODEL_PATH, delegate: 'GPU' },
			runningMode: 'VIDEO',
			numFaces: 1,
			minFaceDetectionConfidence: 0.55,
			minFacePresenceConfidence: 0.55,
			minTrackingConfidence: 0.5
		});
	} catch {
		return null;
	}
}

function getLandmarker() {
	landmarkerPromise ??= createLandmarker();
	return landmarkerPromise;
}

function averageBrightness(context: CanvasRenderingContext2D, width: number, height: number) {
	const { data } = context.getImageData(0, 0, width, height);
	let total = 0;
	for (let index = 0; index < data.length; index += 16) {
		total += 0.2126 * data[index] + 0.7152 * data[index + 1] + 0.0722 * data[index + 2];
	}
	return total / (data.length / 16) / 255;
}

function lightingLevel(brightness: number): QualityLevel {
	return brightness >= 0.38 && brightness <= 0.82 ? 'good' : 'warning';
}

function faceGeometry(landmarks: NormalizedLandmark[], video: HTMLVideoElement) {
	const xs = landmarks.map((point) => point.x);
	const ys = landmarks.map((point) => point.y);
	const minX = Math.min(...xs);
	const maxX = Math.max(...xs);
	const minY = Math.min(...ys);
	const maxY = Math.max(...ys);
	const centerX = (minX + maxX) / 2;
	const centerY = (minY + maxY) / 2;

	// The saved image is a centered 4:5 crop, so measure face size against that crop.
	const cropWidthRatio = Math.min(1, (video.videoHeight * 0.8) / video.videoWidth);
	const faceRatioInCrop = (maxX - minX) / cropWidthRatio;
	const centered =
		Math.abs(centerX - 0.5) < cropWidthRatio * 0.16 && Math.abs(centerY - 0.48) < 0.18;
	const sized = faceRatioInCrop >= 0.5 && faceRatioInCrop <= 0.82;

	const nose = landmarks[1];
	const leftCheek = landmarks[234];
	const rightCheek = landmarks[454];
	const leftEye = landmarks[33];
	const rightEye = landmarks[263];
	const leftSpan = Math.abs(nose.x - leftCheek.x);
	const rightSpan = Math.abs(rightCheek.x - nose.x);
	const symmetry = Math.min(leftSpan, rightSpan) / Math.max(leftSpan, rightSpan);
	const levelEyes = Math.abs(leftEye.y - rightEye.y) < 0.045;
	const frontal = symmetry > 0.72 && levelEyes;

	return { centered, sized, frontal };
}

export async function inspectFrame(video: HTMLVideoElement): Promise<CameraQuality> {
	const canvas = document.createElement('canvas');
	canvas.width = 160;
	canvas.height = 120;
	const context = canvas.getContext('2d', { willReadFrequently: true });
	if (!context || !video.videoWidth) {
		return {
			face: 'unknown',
			position: 'unknown',
			lighting: 'unknown',
			brightness: 0,
			messageKey: 'preparing'
		};
	}

	context.drawImage(video, 0, 0, canvas.width, canvas.height);
	const brightness = averageBrightness(context, canvas.width, canvas.height);
	const lighting = lightingLevel(brightness);
	const landmarker = await getLandmarker();

	if (!landmarker) {
		return {
			face: 'unknown',
			position: 'unknown',
			lighting,
			brightness,
			messageKey: lighting === 'good' ? 'lookAhead' : 'brighterLight'
		};
	}

	try {
		const [landmarks] = landmarker.detectForVideo(video, performance.now()).faceLandmarks;
		if (!landmarks) {
			return {
				face: 'warning',
				position: 'warning',
				lighting,
				brightness,
				messageKey: 'centerFace'
			};
		}

		const geometry = faceGeometry(landmarks, video);
		const position: QualityLevel =
			geometry.centered && geometry.sized && geometry.frontal ? 'good' : 'warning';
		const ready = position === 'good' && lighting === 'good';
		let messageKey: CameraQuality['messageKey'] = 'almostReady';
		if (ready) messageKey = 'readyCapture';
		else if (!geometry.sized) messageKey = 'adjustDistance';
		else if (!geometry.centered) messageKey = 'moveCenter';
		else if (!geometry.frontal) messageKey = 'headLevel';
		else if (lighting !== 'good') messageKey = 'brighterLight';

		return { face: 'good', position, lighting, brightness, messageKey };
	} catch {
		return {
			face: 'unknown',
			position: 'unknown',
			lighting,
			brightness,
			messageKey: 'lookAhead'
		};
	}
}
