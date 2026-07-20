export const messages = {
	en: {
		meta: {
			title: 'Presence — Your best first impression',
			description:
				'A personal presence check that helps you prepare your best first impression before interviews, meetings, and presentations.'
		},
		header: {
			home: 'Presence home',
			privacy: 'Privacy · No account required',
			progress: 'Report progress',
			language: 'View this page in Korean',
			skip: 'Skip to main content',
			stepLabels: ['Camera check', 'Presence review', 'Results'],
			currentStep: 'current step',
			completedStep: 'completed'
		},
		landing: {
			eyebrow: 'FIRST IMPRESSION CHECK',
			title: 'Show up ready.',
			titleAccent: 'Before the moment begins.',
			descriptionFirst: 'A strong first impression starts before you enter the room.',
			descriptionSecond:
				'Presence checks framing, light, face position, background, and color harmony—then turns them into practical next steps.',
			scenarioLabel: 'WHAT ARE YOU PREPARING FOR?',
			boundary:
				'Practical visual guidance—not personality, competence, appearance, or medical scoring.',
			startCamera: 'Start with camera',
			upload: 'Upload a photo',
			preparingImage: 'Preparing your photo on this device…',
			microcopy: 'No account required · About 30 seconds',
			previewAria: 'Presence report preview',
			cameraCheck: 'Camera Check',
			readyCapture: 'Ready to capture',
			portraitAlt: 'Person ready for an online conversation',
			framingGood: 'Framing looks good',
			presence: 'PRESENCE',
			previewTitle: 'Ready for your next conversation.',
			previewBody: 'Framing, light, background, and color feel intentional.',
			journeyEyebrow: 'ONE CONTINUOUS JOURNEY',
			journey: [
				{ title: 'Camera Check', description: 'Live guidance for framing, light, and background' },
				{ title: 'Presence Review', description: 'See the visual factors shaping the moment' },
				{ title: 'Presence Upgrade', description: 'Adjust, recapture, and compare the difference' }
			]
		},
		scenarios: {
			interview: {
				label: 'Interview',
				description: 'Show up composed before the first question.',
				cta: 'Prepare for my interview',
				previewTitle: 'Ready for the first question.',
				cameraTitle: 'Let’s prepare your interview frame.',
				quickWin: 'Keep the camera just above eye level and leave a little space above your head.',
				reportTitle: 'You look ready for the conversation.',
				reportAccent: 'A few details can make it feel more intentional.',
				summaryReady:
					'Your framing, clarity, and color balance support a composed interview presence.',
				summaryImprove:
					'A few focused adjustments can make your interview presence feel clearer and more prepared.',
				checklist: [
					'Camera at or slightly above eye level',
					'Soft frontal light with a calm background',
					'Keep your face centered before joining'
				]
			},
			meeting: {
				label: 'Meeting',
				description: 'Look clear and engaged in everyday calls.',
				cta: 'Prepare for my meeting',
				previewTitle: 'Clear, present, and ready to join.',
				cameraTitle: 'Let’s set up your meeting frame.',
				quickWin: 'Frame from mid-chest up so your expression and natural gestures stay visible.',
				reportTitle: 'Your meeting presence feels clear.',
				reportAccent: 'Now make it easy to stay engaged.',
				summaryReady:
					'Your setup supports a clear, approachable presence for everyday video conversations.',
				summaryImprove:
					'Small changes to the frame and light can help you feel more present in the conversation.',
				checklist: [
					'Frame from mid-chest to just above your head',
					'Keep your eyes close to the camera line',
					'Remove bright or distracting objects behind you'
				]
			},
			presentation: {
				label: 'Presentation',
				description: 'Hold attention before the first slide.',
				cta: 'Prepare for my presentation',
				previewTitle: 'Ready to hold the room.',
				cameraTitle: 'Let’s build your presentation frame.',
				quickWin:
					'Leave enough space in the frame for natural gestures without losing eye contact.',
				reportTitle: 'Your frame supports the message.',
				reportAccent: 'A stronger setup can hold attention longer.',
				summaryReady:
					'Your framing and clarity create a focused visual foundation for your presentation.',
				summaryImprove:
					'A more deliberate camera height and background can help your message lead the frame.',
				checklist: [
					'Leave room for natural hand gestures',
					'Use an uncluttered background with clear contrast',
					'Keep the lens near eye level while speaking'
				]
			},
			profile: {
				label: 'Profile photo',
				description: 'Create a polished image that still feels like you.',
				cta: 'Prepare my profile photo',
				previewTitle: 'Polished, natural, and recognizably you.',
				cameraTitle: 'Let’s compose your profile photo.',
				quickWin: 'Turn slightly toward soft light and keep the background simple and separated.',
				reportTitle: 'Your profile image feels approachable.',
				reportAccent: 'A cleaner composition can make it more memorable.',
				summaryReady:
					'Your light, color harmony, and composition support a polished but natural profile image.',
				summaryImprove:
					'Small changes to light direction and background separation can strengthen your profile image.',
				checklist: [
					'Use soft light from slightly beside the camera',
					'Choose a simple background with clear separation',
					'Keep your expression relaxed and recognizable'
				]
			}
		},
		camera: {
			eyebrow: 'STEP 01 · CAMERA CHECK',
			title: 'Let’s get you camera-ready.',
			retakeTitle: 'Let’s capture your stronger presence.',
			intro: 'Framing, face position, light, and background are checked on your device.',
			previewAria: 'Live camera preview',
			waiting: 'Waiting for your camera…',
			estimatedReadiness: 'ESTIMATED READINESS',
			ready: 'You’re ready to capture.',
			adjust: 'A few small adjustments will improve the frame.',
			liveGuidance: 'LIVE CAMERA GUIDANCE',
			face: 'Face visibility',
			faceHelp: 'Keep your full face clearly visible',
			framing: 'Framing & posture',
			framingHelp: 'Fill roughly 60–80% of the guide',
			lighting: 'Lighting quality',
			lightingHelp: 'Use soft, even light across your face',
			background: 'Background readiness',
			backgroundHelp: 'Keep the area behind you calm and uncluttered',
			quickWin: 'Quick win',
			quickWinBody: 'Place a window just behind your camera for softer, more even light.',
			capture: 'Capture my photo',
			upload: 'Upload instead',
			preparingImage: 'Preparing photo…',
			deviceNote: 'Live readiness guidance runs on your device.',
			labels: { good: 'Ready', warning: 'Adjust', unknown: 'Checking' },
			errors: {
				permission:
					'Camera access is off. Allow it in your browser settings, or upload a photo instead.',
				unavailable: 'We couldn’t start your camera. You can continue with a photo upload.',
				file: 'Choose a JPG or PNG image smaller than 10 MB.',
				preparation: 'We couldn’t prepare that image. Try a different JPG or PNG photo.'
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
				headLevel: 'Look straight ahead and keep your head level',
				simplifyBackground: 'Try a calmer, less distracting background'
			}
		},
		review: {
			eyebrow: 'STEP 01 · REVIEW',
			title: 'Ready to build your Presence Report?',
			intro: 'Make sure your face is clear, centered, and separated from a calm background.',
			imageAlt: 'Your capture before review',
			complete: 'Capture complete',
			privacy: 'Your image is only sent when you start the report.',
			prepared: (size: string) => `Prepared securely on this device · ${size}`,
			optimized: (original: string, ready: string) =>
				`Optimized securely on this device · ${original} → ${ready}`,
			checks: [
				'One clearly visible face',
				'Eyes, forehead, and jaw in frame',
				'No strong backlight or deep shadows',
				'Background feels calm and intentional'
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
			body: 'Reviewing image clarity, color harmony, framing, and light.',
			timing: 'This usually takes 15–60 seconds.',
			prepared: 'Image prepared',
			appearance: 'First-impression factors',
			actions: 'Personalized actions',
			cancel: 'Cancel & review photo'
		},
		report: {
			eyebrow: 'YOUR PRESENCE REPORT',
			title: 'You already make a positive first impression.',
			titleAccent: 'Now let’s make it stronger.',
			summaryPositive: 'You already make a clear, confident first impression.',
			summaryFocused: 'A few focused adjustments could make you appear even more confident.',
			summarySample:
				'You’re almost ready. A few small changes to light and framing could make your presence feel noticeably stronger.',
			source: 'YouCam analysis',
			scenario: 'SELECTED MOMENT',
			sample: 'SAMPLE REPORT',
			overall: 'OVERALL PRESENCE',
			current: 'Current',
			estimatedAfter: 'Estimated after',
			estimateNote: 'Estimated from your three highest-impact recommendations.',
			breakdown: 'READINESS BREAKDOWN',
			colorTone: 'COLOR HARMONY',
			undertone: 'camera palette',
			paletteNote: 'Try navy, cream, soft blue, or muted teal near your face.',
			momentLabel: 'YOUR MOMENT CHECKLIST',
			momentTitle: 'Keep these three things consistent.',
			appearanceLabel: 'FIRST-IMPRESSION FACTORS',
			appearanceTitle: 'What shapes the frame',
			observations: 'Personalized observations',
			actionsLabel: 'YOUR TOP 3 ACTIONS',
			actionsTitle: 'Small changes. Visible impact.',
			prioritized: 'Prioritized for you',
			expected: 'EXPECTED',
			difficulty: { easy: 'EASY', moderate: 'MODERATE' },
			startOver: 'Start over',
			recapture: 'Apply actions & recapture',
			metricLabels: {
				radiance: 'On-camera clarity',
				texture: 'Detail balance',
				redness: 'Color balance',
				dark_circle: 'Eye-area clarity',
				pore: 'Image definition'
			},
			skinTone: { label: 'Warm-neutral palette', undertone: 'Neutral-warm' },
			appearance: {
				condition: {
					label: 'Camera clarity',
					good: 'Clear and naturally defined',
					attention: 'Softer light will improve clarity',
					insight:
						'The image keeps enough natural detail for expressions to read clearly on camera.'
				},
				tone: {
					label: 'Color harmony',
					insight:
						'A single neutral light source keeps your on-camera colors consistent and intentional.'
				},
				balance: {
					label: 'Face positioning',
					good: 'Centered and easy to read',
					attention: 'A slightly higher camera will feel more composed',
					insight:
						'Framing, eye-area clarity, and forward-facing alignment shape how focused the frame feels.'
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
			tagline: 'Camera-ready guidance for important moments.',
			disclaimer:
				'Practical visual readiness guidance. Not personality, competence, appearance, or medical scoring.',
			source: 'Analysis by YouCam',
			status: 'Hackathon prototype',
			navigation: 'Footer links',
			privacy: 'Privacy notice',
			github: 'GitHub',
			githubExternal: 'Open the Presence GitHub repository in a new tab'
		},
		common: {
			startOverConfirm: 'Start over and clear this report?'
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
			privacy: '개인정보처리방침 · 가입 없이 이용',
			progress: '리포트 진행 단계',
			language: '영문으로 보기',
			skip: '본문으로 바로가기',
			stepLabels: ['카메라 체크', '프레즌스 리뷰', '결과'],
			currentStep: '현재 단계',
			completedStep: '완료'
		},
		landing: {
			eyebrow: '첫인상 준비 체크',
			title: '화면에 들어가기 전,',
			titleAccent: '첫인상을 준비하세요.',
			descriptionFirst: '좋은 첫인상은 중요한 순간에 들어가기 전부터 시작됩니다.',
			descriptionSecond:
				'Presence가 구도, 조명, 얼굴 위치, 배경, 컬러 조화를 확인하고 바로 실행할 수 있는 개선 방법을 제안합니다.',
			scenarioLabel: '어떤 순간을 준비하고 있나요?',
			boundary: '성격·역량·외모·의료 평가가 아닌, 직접 조절할 수 있는 화면 요소만 안내합니다.',
			startCamera: '카메라로 시작하기',
			upload: '사진 업로드',
			preparingImage: '기기에서 사진을 준비하고 있어요…',
			microcopy: '가입 없이 이용 · 약 30초 소요',
			previewAria: 'Presence 리포트 미리보기',
			cameraCheck: '카메라 체크',
			readyCapture: '촬영 준비 완료',
			portraitAlt: '온라인 대화를 준비하는 사람',
			framingGood: '구도가 좋습니다',
			presence: 'PRESENCE',
			previewTitle: '다음 대화를 위한 준비가 끝났어요.',
			previewBody: '구도와 조명, 배경, 컬러가 의도적으로 정돈되어 있습니다.',
			journeyEyebrow: '하나로 이어지는 준비 과정',
			journey: [
				{ title: '카메라 체크', description: '구도·조명·배경을 실시간으로 안내' },
				{ title: '프레즌스 리뷰', description: '순간의 인상을 만드는 화면 요소 확인' },
				{ title: '프레즌스 개선', description: '조정하고 다시 촬영해 전후를 비교' }
			]
		},
		scenarios: {
			interview: {
				label: '면접',
				description: '첫 질문 전부터 차분하고 준비된 인상을 만드세요.',
				cta: '면접 준비 시작하기',
				previewTitle: '첫 질문을 받을 준비가 됐어요.',
				cameraTitle: '면접에 맞는 화면을 준비해볼까요?',
				quickWin: '카메라를 눈높이보다 살짝 높이고 머리 위에 여백을 조금 남겨보세요.',
				reportTitle: '대화를 시작할 준비가 되어 보여요.',
				reportAccent: '몇 가지 디테일로 의도를 더 선명하게 만들 수 있어요.',
				summaryReady: '구도와 선명도, 컬러 균형이 차분하고 준비된 면접 인상을 뒷받침합니다.',
				summaryImprove:
					'몇 가지 요소를 집중적으로 조정하면 더 또렷하고 준비된 면접 인상을 만들 수 있습니다.',
				checklist: [
					'카메라는 눈높이 또는 눈높이보다 살짝 위에',
					'정면의 부드러운 조명과 차분한 배경',
					'입장 전 얼굴을 화면 중앙에 맞추기'
				]
			},
			meeting: {
				label: '온라인 미팅',
				description: '일상적인 화상 대화에서도 또렷하고 참여감 있게.',
				cta: '미팅 준비 시작하기',
				previewTitle: '또렷하고 편안하게, 입장할 준비 완료.',
				cameraTitle: '미팅에 편안한 화면을 맞춰볼까요?',
				quickWin: '가슴 중간부터 머리 위까지 담아 표정과 자연스러운 제스처를 함께 보여주세요.',
				reportTitle: '미팅 화면이 또렷하고 편안해 보여요.',
				reportAccent: '이제 대화에 자연스럽게 참여할 차례예요.',
				summaryReady: '현재 설정이 일상적인 화상 대화에 또렷하고 친근한 인상을 만들어 줍니다.',
				summaryImprove:
					'구도와 조명을 조금만 바꾸면 대화에 더 잘 참여하고 있는 인상을 줄 수 있습니다.',
				checklist: [
					'가슴 중간부터 머리 위까지 화면에 담기',
					'시선을 카메라 렌즈 가까이에 유지하기',
					'뒤쪽의 밝거나 시선을 끄는 물건 정리하기'
				]
			},
			presentation: {
				label: '발표',
				description: '첫 슬라이드 전부터 시선을 모으는 화면을 만드세요.',
				cta: '발표 준비 시작하기',
				previewTitle: '화면의 시선을 이끌 준비가 됐어요.',
				cameraTitle: '발표에 집중되는 화면을 만들어볼까요?',
				quickWin: '시선을 유지하면서 자연스러운 손동작이 보일 만큼 화면에 여유를 남겨보세요.',
				reportTitle: '화면이 전달하려는 메시지를 잘 받쳐줘요.',
				reportAccent: '더 탄탄한 설정은 시선을 오래 붙잡아 줍니다.',
				summaryReady: '현재 구도와 선명도가 발표에 집중할 수 있는 안정적인 화면을 만듭니다.',
				summaryImprove:
					'카메라 높이와 배경을 더 의도적으로 정리하면 메시지가 화면의 중심이 됩니다.',
				checklist: [
					'자연스러운 손동작이 보일 만큼 여백 남기기',
					'대비가 분명하고 정돈된 배경 사용하기',
					'말할 때 렌즈를 눈높이 가까이에 유지하기'
				]
			},
			profile: {
				label: '프로필 사진',
				description: '나답지만 정돈된 프로필 이미지를 만드세요.',
				cta: '프로필 사진 준비하기',
				previewTitle: '정돈되어 있지만 자연스럽게, 나다운 모습.',
				cameraTitle: '프로필 사진 구도를 잡아볼까요?',
				quickWin: '부드러운 빛 쪽으로 살짝 몸을 돌리고 단순한 배경과 거리를 두어보세요.',
				reportTitle: '친근하고 자연스러운 프로필 이미지예요.',
				reportAccent: '더 깔끔한 구도가 기억에 남는 인상을 만듭니다.',
				summaryReady: '조명과 컬러 조화, 구도가 정돈되면서도 자연스러운 프로필 이미지를 만듭니다.',
				summaryImprove:
					'빛의 방향과 배경 분리를 조금 조정하면 프로필 이미지를 더 또렷하게 만들 수 있습니다.',
				checklist: [
					'카메라 옆에서 들어오는 부드러운 빛 사용하기',
					'분리가 잘 되는 단순한 배경 선택하기',
					'편안하고 알아보기 쉬운 표정 유지하기'
				]
			}
		},
		camera: {
			eyebrow: '1단계 · 카메라 체크',
			title: '카메라에 가장 잘 보이는 모습을 준비해볼까요?',
			retakeTitle: '더 좋아진 모습을 다시 담아볼까요?',
			intro: '구도와 얼굴 위치, 조명, 배경을 이 기기에서 실시간으로 확인합니다.',
			previewAria: '실시간 카메라 미리보기',
			waiting: '카메라를 준비하고 있어요…',
			estimatedReadiness: '현재 준비도',
			ready: '지금 촬영해도 좋아요.',
			adjust: '몇 가지만 조정하면 구도가 더 좋아집니다.',
			liveGuidance: '실시간 카메라 가이드',
			face: '얼굴 선명도',
			faceHelp: '얼굴 전체가 선명하게 보이도록 해주세요',
			framing: '구도와 자세',
			framingHelp: '가이드의 60–80% 정도를 채워주세요',
			lighting: '조명 상태',
			lightingHelp: '얼굴 전체에 부드럽고 고른 빛을 비춰주세요',
			background: '배경 준비도',
			backgroundHelp: '뒤쪽 공간은 차분하고 단순하게 정리해 주세요',
			quickWin: '빠른 개선 팁',
			quickWinBody: '카메라 바로 뒤쪽에 창문이 오도록 하면 조명이 더 부드럽고 고르게 보입니다.',
			capture: '사진 촬영하기',
			upload: '사진 업로드',
			preparingImage: '사진 준비 중…',
			deviceNote: '실시간 준비도 확인은 이 기기에서 처리됩니다.',
			labels: { good: '준비 완료', warning: '조정 필요', unknown: '확인 중' },
			errors: {
				permission:
					'카메라 접근이 꺼져 있습니다. 브라우저 설정에서 허용하거나 사진을 업로드해 주세요.',
				unavailable: '카메라를 시작할 수 없습니다. 사진을 업로드해 계속할 수 있습니다.',
				file: '10MB 이하의 JPG 또는 PNG 이미지를 선택해 주세요.',
				preparation: '이미지를 준비하지 못했습니다. 다른 JPG 또는 PNG 사진을 선택해 주세요.'
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
				headLevel: '정면을 바라보고 고개를 수평으로 유지해 주세요',
				simplifyBackground: '시선을 끄는 요소가 적은 차분한 배경을 사용해 보세요'
			}
		},
		review: {
			eyebrow: '1단계 · 촬영본 확인',
			title: 'Presence 리포트를 만들어볼까요?',
			intro: '얼굴이 선명하고 중앙에 있으며 차분한 배경과 잘 분리되는지 확인해 주세요.',
			imageAlt: '리뷰 전 촬영 이미지',
			complete: '촬영 완료',
			privacy: '리포트를 시작할 때만 이미지가 전송됩니다.',
			prepared: (size: string) => `이 기기에서 안전하게 준비됨 · ${size}`,
			optimized: (original: string, ready: string) =>
				`이 기기에서 안전하게 최적화됨 · ${original} → ${ready}`,
			checks: [
				'얼굴 한 개가 선명하게 보임',
				'눈과 이마, 턱이 프레임 안에 있음',
				'강한 역광이나 짙은 그림자가 없음',
				'배경이 차분하고 의도적으로 정돈되어 있음'
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
			body: '이미지 선명도와 컬러 조화, 구도, 조명을 확인하고 있습니다.',
			timing: '보통 15–60초 정도 걸립니다.',
			prepared: '이미지 준비 완료',
			appearance: '첫인상 요소',
			actions: '맞춤 개선 방법',
			cancel: '취소하고 사진 확인'
		},
		report: {
			eyebrow: '나의 PRESENCE 리포트',
			title: '이미 좋은 첫인상을 주고 있어요.',
			titleAccent: '이제 조금 더 좋아질 차례입니다.',
			summaryPositive: '현재도 선명하고 자신감 있는 첫인상을 주고 있습니다.',
			summaryFocused: '몇 가지를 집중적으로 조정하면 더욱 자신감 있는 인상을 만들 수 있습니다.',
			summarySample:
				'거의 준비됐어요. 조명과 구도를 조금만 바꾸면 훨씬 더 안정적인 인상을 만들 수 있습니다.',
			source: 'YouCam 분석',
			scenario: '선택한 상황',
			sample: '샘플 리포트',
			overall: '종합 프레즌스',
			current: '현재',
			estimatedAfter: '개선 예상',
			estimateNote: '효과가 가장 큰 세 가지 추천 사항을 기준으로 계산한 예상치입니다.',
			breakdown: '준비도 상세',
			colorTone: '컬러 조화',
			undertone: '카메라 팔레트',
			paletteNote: '얼굴 가까이에 네이비, 크림, 소프트 블루, 뮤트 틸을 활용해 보세요.',
			momentLabel: '상황별 체크리스트',
			momentTitle: '이 세 가지를 일관되게 유지하세요.',
			appearanceLabel: '첫인상 요소',
			appearanceTitle: '화면 인상을 만드는 요소',
			observations: '맞춤 관찰 결과',
			actionsLabel: '가장 중요한 개선 3가지',
			actionsTitle: '작은 변화로 더 좋은 인상을.',
			prioritized: '효과 순으로 정리했어요',
			expected: '예상 개선',
			difficulty: { easy: '쉬움', moderate: '보통' },
			startOver: '처음부터',
			recapture: '개선 후 다시 촬영',
			metricLabels: {
				radiance: '화면 선명도',
				texture: '디테일 균형',
				redness: '색상 균형',
				dark_circle: '눈가 선명도',
				pore: '이미지 또렷함'
			},
			skinTone: { label: '웜 뉴트럴 팔레트', undertone: '뉴트럴 웜' },
			appearance: {
				condition: {
					label: '카메라 선명도',
					good: '자연스럽고 또렷하게 보임',
					attention: '부드러운 조명으로 선명도를 높여보세요',
					insight: '표정이 화면에서 분명하게 읽힐 만큼 자연스러운 디테일이 유지됩니다.'
				},
				tone: {
					label: '컬러 조화',
					insight: '한 가지 뉴트럴 조명을 사용하면 화면 속 컬러가 일관되고 의도적으로 표현됩니다.'
				},
				balance: {
					label: '얼굴 위치',
					good: '중앙에 있고 알아보기 쉬움',
					attention: '카메라를 조금 높이면 더 안정적으로 보입니다',
					insight:
						'구도와 눈가 선명도, 정면 정렬이 화면이 얼마나 집중되어 보이는지에 영향을 줍니다.'
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
			tagline: '중요한 순간 전, 화면 속 첫인상을 준비합니다.',
			disclaimer:
				'직접 조절할 수 있는 화면 요소를 위한 가이드이며 성격·역량·외모·의료 평가가 아닙니다.',
			source: 'YouCam 분석 사용',
			status: '해커톤 프로토타입',
			navigation: '푸터 링크',
			privacy: '개인정보처리방침',
			github: 'GitHub',
			githubExternal: '새 탭에서 Presence GitHub 저장소 열기'
		},
		common: {
			startOverConfirm: '처음부터 다시 시작하고 현재 리포트를 지울까요?'
		}
	}
} as const;

export type Locale = keyof typeof messages;

export function isLocale(value: string | null): value is Locale {
	return value === 'en' || value === 'ko';
}
