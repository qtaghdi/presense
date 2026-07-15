export const messages = {
	en: {
		meta: {
			title: 'Presence — Your best first impression',
			description:
				'A personal presence check that helps you prepare your best first impression before interviews, meetings, and presentations.'
		},
		header: {
			home: 'Presence home',
			privacy: 'Private by design · No account required',
			progress: 'Report progress',
			language: 'Choose language'
		},
		landing: {
			eyebrow: 'YOUR BEST FIRST IMPRESSION',
			title: 'Prepare your best self.',
			titleAccent: 'Before it matters.',
			descriptionFirst: 'Every important conversation starts with a first impression.',
			descriptionSecond:
				'Presence gives you clear, practical guidance to look confident and ready for interviews, meetings, and presentations.',
			startCamera: 'Start with camera',
			upload: 'Upload a photo',
			microcopy: 'No account required · About 30 seconds',
			previewAria: 'Presence report preview',
			cameraCheck: 'Camera Check',
			readyCapture: 'Ready to capture',
			portraitAlt: 'Person ready for an online conversation',
			framingGood: 'Framing looks good',
			presence: 'PRESENCE',
			previewTitle: 'Ready for your next conversation.',
			previewBody: 'Framing, light, and distance look balanced.',
			journeyEyebrow: 'ONE CONTINUOUS JOURNEY',
			journey: [
				{ title: 'Camera Check', description: 'Live guidance for framing and light' },
				{ title: 'Presence Review', description: 'A clear view of what is working' },
				{ title: 'Presence Upgrade', description: 'Act, recapture, and see the difference' }
			]
		},
		camera: {
			eyebrow: 'STEP 01 · CAMERA CHECK',
			title: 'Let’s get you camera-ready.',
			retakeTitle: 'Let’s capture your stronger presence.',
			intro: 'Live guidance will help with framing, distance, and light.',
			previewAria: 'Live camera preview',
			waiting: 'Waiting for your camera…',
			estimatedReadiness: 'ESTIMATED READINESS',
			ready: 'You’re ready to capture.',
			adjust: 'A few small adjustments will improve the frame.',
			liveGuidance: 'LIVE CAMERA GUIDANCE',
			face: 'Face detected',
			faceHelp: 'Keep your full face clearly visible',
			framing: 'Distance & framing',
			framingHelp: 'Fill roughly 60–80% of the guide',
			lighting: 'Lighting quality',
			lightingHelp: 'Use soft, even light across your face',
			quickWin: 'Quick win',
			quickWinBody: 'Place a window just behind your camera for softer, more even light.',
			capture: 'Capture my photo',
			upload: 'Upload instead',
			deviceNote: 'Face guidance runs on your device.',
			labels: { good: 'Ready', warning: 'Adjust', unknown: 'Checking' },
			errors: {
				permission:
					'Camera access is off. Allow it in your browser settings, or upload a photo instead.',
				unavailable: 'We couldn’t start your camera. You can continue with a photo upload.',
				file: 'Choose a JPG or PNG image smaller than 10 MB.'
			},
			qualityMessages: {
				preparing: 'Preparing your camera…',
				lookAhead: 'Look straight ahead and stay within the guide',
				brighterLight: 'Move toward a softer, brighter light source',
				centerFace: 'Center your face in the frame',
				almostReady: 'A few small adjustments and you’ll be ready',
				readyCapture: 'You’re ready to capture',
				adjustDistance: 'Adjust your distance to fit the oval',
				moveCenter: 'Move slightly toward the center',
				headLevel: 'Look straight ahead and keep your head level'
			}
		},
		review: {
			eyebrow: 'STEP 01 · REVIEW',
			title: 'Ready to build your Presence Report?',
			intro: 'Make sure your face is clear, centered, and looking straight ahead.',
			imageAlt: 'Your capture before review',
			complete: 'Capture complete',
			privacy: 'Your image is only sent when you start the report.',
			checks: [
				'One clearly visible face',
				'Eyes, forehead, and jaw in frame',
				'No strong backlight or deep shadows'
			],
			retake: 'Retake',
			build: 'Build my report',
			errors: {
				generic: 'We couldn’t complete the review.',
				interrupted: 'Something interrupted the review.'
			}
		},
		analyzing: {
			eyebrow: 'STEP 02 · PRESENCE REVIEW',
			title: 'Building your Presence Report.',
			body: 'Reviewing visible skin condition, color tone, framing, and light.',
			timing: 'This usually takes a few seconds.',
			prepared: 'Image prepared',
			appearance: 'Appearance review',
			actions: 'Personalized actions'
		},
		report: {
			eyebrow: 'YOUR PRESENCE REPORT',
			title: 'You already make a positive first impression.',
			titleAccent: 'Now let’s make it stronger.',
			summaryPositive: 'You already make a clear, confident first impression.',
			summaryFocused: 'A few focused adjustments could make you appear even more confident.',
			summarySample:
				'You’re almost ready. A few small changes to light and framing could make your presence feel noticeably stronger.',
			source: 'YouCam visual assessment',
			sample: 'SAMPLE REPORT',
			overall: 'OVERALL PRESENCE',
			current: 'Current',
			estimatedAfter: 'Estimated after',
			estimateNote: 'Estimated from your three highest-impact recommendations.',
			breakdown: 'READINESS BREAKDOWN',
			colorTone: 'DETECTED COLOR TONE',
			undertone: 'undertone',
			appearanceLabel: 'APPEARANCE REVIEW',
			appearanceTitle: 'What stands out',
			observations: 'Personalized observations',
			actionsLabel: 'YOUR TOP 3 ACTIONS',
			actionsTitle: 'Small changes. Visible impact.',
			prioritized: 'Prioritized for you',
			expected: 'EXPECTED',
			difficulty: { easy: 'EASY', moderate: 'MODERATE' },
			startOver: 'Start over',
			recapture: 'Apply actions & recapture',
			metricLabels: {
				radiance: 'Radiance',
				texture: 'Skin texture',
				redness: 'Tone balance',
				dark_circle: 'Under-eye clarity',
				pore: 'Camera clarity'
			},
			skinTone: { label: 'Natural medium', undertone: 'Neutral-warm' },
			appearance: {
				condition: {
					label: 'Skin Condition',
					good: 'Clear and camera-ready',
					attention: 'Soft light will improve clarity',
					insight: 'Visible texture is clear, with enough definition to read naturally on camera.'
				},
				tone: {
					label: 'Skin Tone',
					insight: 'Your detected tone is most consistent under a single neutral light source.'
				},
				balance: {
					label: 'Facial Balance',
					good: 'Balanced and centered',
					attention: 'A higher angle will feel more composed',
					insight:
						'Framing, eye-area clarity, and forward-facing alignment shape perceived confidence.'
				},
				lighting: {
					label: 'Lighting Quality',
					good: 'Soft and even',
					attention: 'More frontal light recommended',
					insight: 'Even exposure helps expressions feel open, alert, and easier to read.'
				}
			},
			guidance: {
				radiance: {
					title: 'Face a soft, natural light source',
					description:
						'Place a window or diffused light just behind your camera. Even light adds clarity and makes your expression feel more open.'
				},
				texture: {
					title: 'Raise your camera slightly above eye level',
					description:
						'Keep the lens about an arm’s length away. A higher, more natural angle reduces distortion and creates a composed frame.'
				},
				redness: {
					title: 'Use one neutral light temperature',
					description:
						'Avoid mixing warm room light with cool screen light. One neutral source keeps your complexion balanced on camera.'
				},
				dark_circle: {
					title: 'Soften shadows below your eyes',
					description:
						'Bounce light upward with a pale desk surface or a second soft lamp. This helps your eyes appear more alert and engaged.'
				},
				pore: {
					title: 'Diffuse direct light',
					description:
						'Use a sheer curtain or bounce the light off a wall. Softer contrast keeps facial detail natural without looking filtered.'
				}
			}
		},
		comparison: {
			eyebrow: 'YOUR PRESENCE UPGRADE',
			title: 'Small changes.',
			titleAccent: 'A stronger first impression.',
			intro: 'Drag the slider to see how your adjustments changed the way you show up on camera.',
			afterAlt: 'Your improved capture',
			beforeAlt: 'Your original capture',
			compareAria: 'Compare before and after',
			before: 'BEFORE',
			after: 'AFTER',
			change: 'PRESENCE CHANGE',
			points: 'points',
			readyLabel: 'READY FOR WHAT’S NEXT',
			improved: 'Your presence reads clearer and more confident.',
			ready: 'Your new setup is ready for a real conversation.',
			body: 'Keep this camera height and lighting setup for your next interview, meeting, or presentation.',
			newReport: 'New report',
			captureAgain: 'Capture once more'
		},
		footer: {
			disclaimer:
				'Visual readiness guidance for important online moments. Not a medical assessment.',
			source: 'Visual assessment by YouCam'
		}
	},
	ko: {
		meta: {
			title: 'Presence — 더 좋은 첫인상을 준비하세요',
			description:
				'면접, 미팅, 발표 전 더 좋은 첫인상을 준비할 수 있도록 돕는 퍼스널 프레즌스 체크입니다.'
		},
		header: {
			home: 'Presence 홈',
			privacy: '개인정보 보호 설계 · 가입 없이 이용',
			progress: '리포트 진행 단계',
			language: '언어 선택'
		},
		landing: {
			eyebrow: '더 좋은 첫인상을 위해',
			title: '가장 좋은 모습을 준비하세요.',
			titleAccent: '중요한 순간이 오기 전에.',
			descriptionFirst: '중요한 대화는 언제나 첫인상에서 시작됩니다.',
			descriptionSecond:
				'Presence가 면접, 미팅, 발표에서 더 자신감 있고 준비된 모습으로 보일 수 있도록 명확하고 실용적인 가이드를 제공합니다.',
			startCamera: '카메라로 시작하기',
			upload: '사진 업로드',
			microcopy: '가입 없이 이용 · 약 30초 소요',
			previewAria: 'Presence 리포트 미리보기',
			cameraCheck: '카메라 체크',
			readyCapture: '촬영 준비 완료',
			portraitAlt: '온라인 대화를 준비하는 사람',
			framingGood: '구도가 좋습니다',
			presence: 'PRESENCE',
			previewTitle: '다음 대화를 위한 준비가 끝났어요.',
			previewBody: '구도와 조명, 거리가 모두 안정적입니다.',
			journeyEyebrow: '하나로 이어지는 준비 과정',
			journey: [
				{ title: '카메라 체크', description: '구도와 조명을 실시간으로 안내' },
				{ title: '프레즌스 리뷰', description: '현재 잘되고 있는 부분을 한눈에 확인' },
				{ title: '프레즌스 개선', description: '조정하고 다시 촬영해 변화를 비교' }
			]
		},
		camera: {
			eyebrow: '1단계 · 카메라 체크',
			title: '카메라에 가장 잘 보이는 모습을 준비해볼까요?',
			retakeTitle: '더 좋아진 모습을 다시 담아볼까요?',
			intro: '구도와 거리, 조명을 실시간으로 확인해 드립니다.',
			previewAria: '실시간 카메라 미리보기',
			waiting: '카메라를 준비하고 있어요…',
			estimatedReadiness: '현재 준비도',
			ready: '지금 촬영해도 좋아요.',
			adjust: '몇 가지만 조정하면 구도가 더 좋아집니다.',
			liveGuidance: '실시간 카메라 가이드',
			face: '얼굴 인식',
			faceHelp: '얼굴 전체가 선명하게 보이도록 해주세요',
			framing: '거리와 구도',
			framingHelp: '가이드의 60–80% 정도를 채워주세요',
			lighting: '조명 상태',
			lightingHelp: '얼굴 전체에 부드럽고 고른 빛을 비춰주세요',
			quickWin: '빠른 개선 팁',
			quickWinBody: '카메라 바로 뒤쪽에 창문이 오도록 하면 조명이 더 부드럽고 고르게 보입니다.',
			capture: '사진 촬영하기',
			upload: '사진 업로드',
			deviceNote: '얼굴 위치 확인은 기기에서 처리됩니다.',
			labels: { good: '준비 완료', warning: '조정 필요', unknown: '확인 중' },
			errors: {
				permission:
					'카메라 접근이 꺼져 있습니다. 브라우저 설정에서 허용하거나 사진을 업로드해 주세요.',
				unavailable: '카메라를 시작할 수 없습니다. 사진을 업로드해 계속할 수 있습니다.',
				file: '10MB 이하의 JPG 또는 PNG 이미지를 선택해 주세요.'
			},
			qualityMessages: {
				preparing: '카메라를 준비하고 있어요…',
				lookAhead: '정면을 바라보고 가이드 안에 위치해 주세요',
				brighterLight: '조금 더 밝고 부드러운 조명 쪽으로 이동해 주세요',
				centerFace: '얼굴을 화면 중앙에 맞춰주세요',
				almostReady: '조금만 조정하면 촬영할 수 있어요',
				readyCapture: '촬영 준비가 완료됐어요',
				adjustDistance: '얼굴이 타원 안에 맞도록 거리를 조정해 주세요',
				moveCenter: '화면 중앙 쪽으로 조금 이동해 주세요',
				headLevel: '정면을 바라보고 고개를 수평으로 유지해 주세요'
			}
		},
		review: {
			eyebrow: '1단계 · 촬영본 확인',
			title: 'Presence 리포트를 만들어볼까요?',
			intro: '얼굴이 선명하고 중앙에 있으며 정면을 바라보고 있는지 확인해 주세요.',
			imageAlt: '리뷰 전 촬영 이미지',
			complete: '촬영 완료',
			privacy: '리포트를 시작할 때만 이미지가 전송됩니다.',
			checks: [
				'얼굴 한 개가 선명하게 보임',
				'눈과 이마, 턱이 프레임 안에 있음',
				'강한 역광이나 짙은 그림자가 없음'
			],
			retake: '다시 촬영',
			build: '리포트 만들기',
			errors: {
				generic: '리뷰를 완료하지 못했습니다.',
				interrupted: '리뷰 도중 문제가 발생했습니다.'
			}
		},
		analyzing: {
			eyebrow: '2단계 · 프레즌스 리뷰',
			title: 'Presence 리포트를 만들고 있어요.',
			body: '피부 상태와 컬러 톤, 구도, 조명을 확인하고 있습니다.',
			timing: '보통 몇 초 정도 걸립니다.',
			prepared: '이미지 준비 완료',
			appearance: '외모 리뷰',
			actions: '맞춤 개선 방법'
		},
		report: {
			eyebrow: '나의 PRESENCE 리포트',
			title: '이미 좋은 첫인상을 주고 있어요.',
			titleAccent: '이제 조금 더 좋아질 차례입니다.',
			summaryPositive: '현재도 선명하고 자신감 있는 첫인상을 주고 있습니다.',
			summaryFocused: '몇 가지를 집중적으로 조정하면 더욱 자신감 있는 인상을 만들 수 있습니다.',
			summarySample:
				'거의 준비됐어요. 조명과 구도를 조금만 바꾸면 훨씬 더 안정적인 인상을 만들 수 있습니다.',
			source: 'YouCam 비주얼 평가',
			sample: '샘플 리포트',
			overall: '종합 프레즌스',
			current: '현재',
			estimatedAfter: '개선 예상',
			estimateNote: '효과가 가장 큰 세 가지 추천 사항을 기준으로 계산한 예상치입니다.',
			breakdown: '준비도 상세',
			colorTone: '감지된 컬러 톤',
			undertone: '언더톤',
			appearanceLabel: '외모 리뷰',
			appearanceTitle: '눈에 띄는 부분',
			observations: '맞춤 관찰 결과',
			actionsLabel: '가장 중요한 개선 3가지',
			actionsTitle: '작은 변화로 더 좋은 인상을.',
			prioritized: '효과 순으로 정리했어요',
			expected: '예상 개선',
			difficulty: { easy: '쉬움', moderate: '보통' },
			startOver: '처음부터',
			recapture: '개선 후 다시 촬영',
			metricLabels: {
				radiance: '생기',
				texture: '피부 결',
				redness: '톤 균형',
				dark_circle: '눈가 선명도',
				pore: '카메라 선명도'
			},
			skinTone: { label: '자연스러운 미디엄 톤', undertone: '뉴트럴 웜' },
			appearance: {
				condition: {
					label: '피부 상태',
					good: '선명하고 촬영하기 좋은 상태',
					attention: '부드러운 조명으로 선명도를 높여보세요',
					insight: '피부 결이 자연스럽게 보일 만큼 충분히 선명하게 표현되고 있습니다.'
				},
				tone: {
					label: '피부 톤',
					insight: '한 가지 뉴트럴 조명을 사용할 때 감지된 톤이 가장 일관되게 표현됩니다.'
				},
				balance: {
					label: '얼굴 균형',
					good: '균형 있고 중앙에 잘 맞음',
					attention: '카메라를 조금 높이면 더 안정적으로 보입니다',
					insight: '구도와 눈가의 선명도, 정면 정렬이 자신감 있는 인상을 만드는 데 영향을 줍니다.'
				},
				lighting: {
					label: '조명 품질',
					good: '부드럽고 고른 조명',
					attention: '정면에서 비추는 조명을 권장합니다',
					insight: '고른 노출은 표정을 더 밝고 또렷하며 편안하게 보이도록 합니다.'
				}
			},
			guidance: {
				radiance: {
					title: '부드러운 자연광을 정면으로 받으세요',
					description:
						'카메라 바로 뒤에 창문이나 확산 조명을 두세요. 고른 빛이 얼굴을 또렷하고 표정을 더 밝게 보이게 합니다.'
				},
				texture: {
					title: '카메라를 눈높이보다 조금 높이세요',
					description:
						'렌즈와 팔 한 뼘 정도 거리를 유지하세요. 자연스럽게 높은 각도가 왜곡을 줄이고 안정적인 구도를 만듭니다.'
				},
				redness: {
					title: '한 가지 뉴트럴 색온도를 사용하세요',
					description:
						'따뜻한 실내 조명과 차가운 화면 빛을 섞지 마세요. 한 가지 뉴트럴 조명이 피부 톤을 균형 있게 보여줍니다.'
				},
				dark_circle: {
					title: '눈 아래 그림자를 부드럽게 만드세요',
					description:
						'밝은 책상 면이나 두 번째 부드러운 조명으로 빛을 위쪽으로 반사하세요. 눈이 더 또렷하고 집중력 있게 보입니다.'
				},
				pore: {
					title: '직접광을 확산하세요',
					description:
						'얇은 커튼을 사용하거나 벽에 빛을 반사하세요. 부드러운 대비가 필터 없이도 얼굴을 자연스럽게 표현합니다.'
				}
			}
		},
		comparison: {
			eyebrow: '나의 프레즌스 개선',
			title: '작은 변화로',
			titleAccent: '더 좋은 첫인상을 만들었어요.',
			intro: '슬라이더를 움직여 조정 전후의 카메라 모습을 비교해 보세요.',
			afterAlt: '개선 후 촬영 이미지',
			beforeAlt: '최초 촬영 이미지',
			compareAria: '개선 전후 비교',
			before: '개선 전',
			after: '개선 후',
			change: '프레즌스 변화',
			points: '점',
			readyLabel: '다음 순간을 위한 준비 완료',
			improved: '더 선명하고 자신감 있는 인상으로 보입니다.',
			ready: '새로운 촬영 환경으로 실제 대화를 시작할 준비가 됐어요.',
			body: '다음 면접이나 미팅, 발표에서도 지금의 카메라 높이와 조명 설정을 유지해 보세요.',
			newReport: '새 리포트',
			captureAgain: '한 번 더 촬영'
		},
		footer: {
			disclaimer:
				'중요한 온라인 순간을 위한 비주얼 준비 가이드입니다. 의료 목적의 평가가 아닙니다.',
			source: 'YouCam 비주얼 평가 사용'
		}
	}
} as const;

export type Locale = keyof typeof messages;

export function isLocale(value: string | null): value is Locale {
	return value === 'en' || value === 'ko';
}
