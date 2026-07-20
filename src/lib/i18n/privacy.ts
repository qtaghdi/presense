export const privacyMessages = {
	en: {
		meta: {
			title: 'Privacy notice — Presence',
			description:
				'How the Presence hackathon prototype handles camera frames, photos, analysis results, and technical data.'
		},
		navigation: {
			skip: 'Skip to privacy notice',
			home: 'Presence home',
			back: 'Back to Presence',
			language: 'View this page in Korean'
		},
		hero: {
			eyebrow: 'HACKATHON PROTOTYPE PRIVACY NOTICE',
			title: 'Your photo should never be a mystery.',
			description:
				'This notice explains what Presence processes, when a photo leaves your device, which services help deliver the experience, and how you can remove locally saved data.',
			effective: 'Effective July 20, 2026',
			updated: 'Last updated July 20, 2026'
		},
		prototype: {
			title: 'About this prototype',
			body: 'Presence is a hackathon prototype, not a generally available production service. Before a public launch, this notice must be updated with the legal operator’s identity, private contact channel, confirmed vendor retention periods, and complete international-transfer details.'
		},
		highlights: [
			{
				label: 'NO ACCOUNT',
				title: 'No sign-up or profile',
				body: 'Presence does not ask for your name, email address, or an account.'
			},
			{
				label: 'ON YOUR DEVICE',
				title: 'Live checks stay local',
				body: 'The continuous camera stream and live framing checks are not sent to our server.'
			},
			{
				label: 'YOU DECIDE',
				title: 'One deliberate upload',
				body: 'A prepared photo is sent only after you select “Build my report.”'
			}
		],
		contentsLabel: 'ON THIS PAGE',
		sections: [
			{
				id: 'scope',
				number: '01',
				title: 'Who this notice covers',
				paragraphs: [
					'This notice applies to the Presence web prototype maintained by the Presence hackathon team in the qtaghdi/youcam-api-hackathon repository.',
					'Presence helps people prepare a camera setup for interviews, meetings, presentations, and profile photos. It does not identify you, authenticate your identity, or make decisions that have legal or similarly significant effects.'
				],
				items: []
			},
			{
				id: 'data',
				number: '02',
				title: 'Data we process',
				paragraphs: [
					'The data involved depends on the feature you choose. Presence does not collect an account profile or use its own analytics tracker.'
				],
				items: [
					{
						title: 'Live camera frames',
						body: 'Used in browser memory to check face visibility, position, brightness, and background variation. The continuous stream is not uploaded to our server.'
					},
					{
						title: 'Captured or uploaded photo',
						body: 'Prepared and compressed in your browser, then sent to our analysis endpoint only when you request a report. A photo can reveal facial and appearance-related information.'
					},
					{
						title: 'Analysis inputs and results',
						body: 'Brightness, selected language and scenario, readiness scores, color information, and practical guidance are used to create and display your report. Presence does not use face recognition to determine identity.'
					},
					{
						title: 'Browser preferences and comparison data',
						body: 'Language and scenario preferences are stored in localStorage. If you choose to recapture and compare, the first photo and report are also stored in localStorage on that browser.'
					},
					{
						title: 'Hosting and request logs',
						body: 'Our hosting provider may process IP address, request time, browser or device information, and diagnostic logs needed to deliver and secure the site.'
					}
				]
			},
			{
				id: 'purpose',
				number: '03',
				title: 'Why and when we process it',
				paragraphs: [
					'We process data to provide the camera check you start, prepare the image, generate the report you request, remember your language and scenario, enable before-and-after comparison, and keep the service reliable and secure.',
					'Camera access requires your browser permission. Uploading or capturing a photo does not start remote analysis by itself; selecting “Build my report” starts the request. You can cancel before that step.',
					'When API credentials are not configured, Presence returns a demo report and does not send the photo to YouCam. The prototype does not intentionally write uploaded photos to its own database or permanent file storage, and the Presence team does not use submitted photos or reports to train its own model.'
				],
				items: []
			},
			{
				id: 'providers',
				number: '04',
				title: 'Services that help us process data',
				paragraphs: [
					'Presence currently relies on the services below. Their infrastructure may process data outside your country. Their own terms and privacy notices govern processing on their systems.'
				],
				items: [
					{
						title: 'Perfect Corp. / YouCam API',
						body: 'In live-analysis mode, the prepared photo is uploaded for skin and tone analysis and the result is returned to Presence. Perfect Corp.’s current documents govern its storage, retention, deletion, and international processing.'
					},
					{
						title: 'Vercel',
						body: 'Hosts the web app and server endpoint. Vercel may process request, IP, device, usage, security, and diagnostic information as part of hosting.'
					},
					{
						title: 'jsDelivr and Google-hosted MediaPipe assets',
						body: 'Your browser downloads the MediaPipe runtime and face-landmark model from these providers. They may receive normal network request information such as an IP address. Presence does not send your camera frames to those asset hosts.'
					}
				]
			},
			{
				id: 'retention',
				number: '05',
				title: 'Retention and deletion',
				paragraphs: [
					'Live camera frames and the current working photo remain in browser memory for the active experience and are discarded when the page state is cleared or the tab is closed. Our server handles an analysis upload for the request and does not intentionally persist it in a Presence database.',
					'Language and scenario preferences remain in localStorage until you change or clear browser site data. A comparison photo and report remain only after you choose to recapture; selecting “Start over” removes that comparison record. Clearing site data in your browser removes all Presence localStorage.',
					'Hosting logs and data processed by external providers follow each provider’s retention rules. We cannot delete data held independently under a provider’s policy through the prototype interface.'
				],
				items: []
			},
			{
				id: 'choices',
				number: '06',
				title: 'Your choices and rights',
				paragraphs: [
					'You can deny camera permission and choose a file instead, leave before requesting a report, select “Start over” to clear comparison data, or clear this site’s storage in your browser.',
					'You may ask about access, correction, deletion, or restriction through the project contact below. Because GitHub Issues are public, do not attach a photo, analysis result, or other sensitive information to an issue.'
				],
				items: []
			},
			{
				id: 'security',
				number: '07',
				title: 'Security, cookies, and children',
				paragraphs: [
					'The production deployment is intended to use HTTPS, the YouCam API key remains server-side, and images are reduced in size in the browser before upload. No safeguard eliminates every risk, so do not upload a photo you are not comfortable having processed by the providers listed above.',
					'Presence does not currently set its own cookies or include an analytics or advertising SDK. It uses localStorage for the limited preferences and comparison data described above.',
					'This prototype is not directed to children under 14. A child under 14 should not upload a photo without consent and supervision from a parent or legal guardian.'
				],
				items: []
			},
			{
				id: 'contact',
				number: '08',
				title: 'Contact and changes',
				paragraphs: [
					'Questions about this prototype can be submitted to the qtaghdi/youcam-api-hackathon GitHub repository. Use a non-sensitive description only; the prototype does not yet provide a private privacy-support channel.',
					'If the data flow, providers, or storage behavior changes, we will revise this notice and update the date shown above. Material changes should be presented before the new processing starts.'
				],
				items: []
			}
		],
		providerLinks: {
			label: 'Provider documents',
			perfectTerms: 'YouCam API Terms',
			perfectPrivacy: 'Perfect Corp. privacy policy',
			vercel: 'Vercel Privacy Notice',
			google: 'Google Privacy Policy'
		},
		contact: {
			label: 'PROJECT CONTACT',
			title: 'Presence hackathon team',
			body: 'Open a GitHub Issue with a non-sensitive description. Do not post your photo or report in a public issue.',
			action: 'Open project issues'
		},
		footer: {
			tagline: 'Clear choices for every photo you share.',
			home: 'Return to Presence',
			source: 'Prototype-specific notice · July 20, 2026',
			status: 'Privacy-first hackathon prototype',
			navigation: 'Footer links',
			issues: 'Project issues',
			issuesExternal: 'Open project issues in a new tab'
		}
	},
	ko: {
		meta: {
			title: '개인정보처리방침 — Presence',
			description:
				'Presence 해커톤 프로토타입이 카메라 화면, 사진, 분석 결과, 기술 정보를 처리하는 방법을 안내합니다.'
		},
		navigation: {
			skip: '개인정보처리방침으로 바로가기',
			home: 'Presence 홈',
			back: 'Presence로 돌아가기',
			language: '영문으로 보기'
		},
		hero: {
			eyebrow: '해커톤 프로토타입 개인정보처리방침',
			title: '내 사진이 어떻게 쓰이는지 분명해야 합니다.',
			description:
				'Presence가 어떤 정보를 처리하는지, 사진이 언제 기기를 벗어나는지, 어떤 외부 서비스를 이용하는지, 브라우저에 남은 정보를 어떻게 지울 수 있는지 안내합니다.',
			effective: '시행일 2026년 7월 20일',
			updated: '최종 업데이트 2026년 7월 20일'
		},
		prototype: {
			title: '프로토타입 안내',
			body: 'Presence는 해커톤 프로토타입이며 아직 일반에 정식 제공되는 서비스가 아닙니다. 정식 공개 전 법적 운영 주체 정보, 비공개 문의 채널, 외부 처리업체의 확정 보유기간, 국외 이전 세부사항을 보완해 이 방침을 개정해야 합니다.'
		},
		highlights: [
			{
				label: '가입 없음',
				title: '계정과 프로필을 만들지 않아요',
				body: '이름이나 이메일 주소를 받지 않으며 회원가입을 요구하지 않습니다.'
			},
			{
				label: '기기에서 처리',
				title: '실시간 체크는 기기 안에서',
				body: '연속된 카메라 영상과 실시간 구도 체크 결과는 서버로 전송하지 않습니다.'
			},
			{
				label: '직접 선택',
				title: '한 번의 명시적인 전송',
				body: '“리포트 만들기”를 선택한 뒤에만 준비된 사진을 전송합니다.'
			}
		],
		contentsLabel: '목차',
		sections: [
			{
				id: 'scope',
				number: '01',
				title: '적용 범위와 운영 주체',
				paragraphs: [
					'이 방침은 qtaghdi/youcam-api-hackathon 저장소의 Presence 해커톤 팀이 운영하는 Presence 웹 프로토타입에 적용됩니다.',
					'Presence는 면접·미팅·발표·프로필 사진을 위한 카메라 환경 준비를 돕습니다. 이용자를 식별하거나 본인 인증을 하지 않으며, 법적 효과 또는 이와 유사하게 중대한 영향을 주는 결정을 내리지 않습니다.'
				],
				items: []
			},
			{
				id: 'data',
				number: '02',
				title: '처리하는 정보',
				paragraphs: [
					'선택한 기능에 따라 아래 정보가 처리됩니다. Presence는 회원 프로필을 수집하지 않으며 자체 분석 추적 도구를 사용하지 않습니다.'
				],
				items: [
					{
						title: '실시간 카메라 화면',
						body: '얼굴이 보이는지, 위치·밝기·배경 변화가 적절한지 확인하기 위해 브라우저 메모리에서 처리합니다. 연속된 카메라 영상은 서버로 전송하지 않습니다.'
					},
					{
						title: '촬영하거나 업로드한 사진',
						body: '브라우저에서 크기를 줄이고 준비한 뒤, 이용자가 리포트를 요청할 때만 분석 API로 전송합니다. 얼굴 사진에는 얼굴과 외관에 관한 정보가 포함될 수 있습니다.'
					},
					{
						title: '분석 입력값과 결과',
						body: '밝기, 선택한 언어와 상황, 준비도 점수, 컬러 정보, 실천 가이드를 리포트 생성과 표시에 사용합니다. 신원을 알아내기 위한 얼굴 인식은 사용하지 않습니다.'
					},
					{
						title: '브라우저 설정과 비교 정보',
						body: '언어와 상황 설정을 localStorage에 저장합니다. 개선 후 다시 촬영해 비교하기를 선택하면 첫 사진과 리포트도 해당 브라우저의 localStorage에 저장합니다.'
					},
					{
						title: '호스팅 및 요청 로그',
						body: '사이트 제공과 보안을 위해 호스팅 업체가 IP 주소, 요청 시각, 브라우저·기기 정보, 진단 로그를 처리할 수 있습니다.'
					}
				]
			},
			{
				id: 'purpose',
				number: '03',
				title: '처리 목적과 시점',
				paragraphs: [
					'이용자가 시작한 카메라 체크 제공, 이미지 준비, 요청한 리포트 생성, 언어·상황 설정 기억, 전후 비교, 서비스 안정성과 보안을 위해 정보를 처리합니다.',
					'카메라는 브라우저 권한을 받은 뒤 사용합니다. 사진을 촬영하거나 업로드하는 것만으로 원격 분석이 시작되지는 않으며, “리포트 만들기”를 선택할 때 요청이 시작됩니다. 그 전에는 취소할 수 있습니다.',
					'API 키가 설정되지 않은 경우 Presence는 데모 리포트를 만들며 사진을 YouCam으로 보내지 않습니다. 프로토타입은 업로드한 사진을 자체 데이터베이스나 영구 파일 저장소에 의도적으로 기록하지 않으며, Presence 팀은 제출된 사진이나 리포트를 자체 모델 학습에 사용하지 않습니다.'
				],
				items: []
			},
			{
				id: 'providers',
				number: '04',
				title: '처리에 이용하는 외부 서비스',
				paragraphs: [
					'Presence는 아래 서비스를 이용합니다. 해당 업체의 인프라가 이용자의 국가 밖에서 정보를 처리할 수 있으며, 각 업체 시스템에서의 처리는 해당 약관과 개인정보 보호 문서가 적용됩니다.'
				],
				items: [
					{
						title: 'Perfect Corp. / YouCam API',
						body: '실제 분석 모드에서는 준비된 사진을 피부·톤 분석 목적으로 업로드하고 결과를 돌려받습니다. Perfect Corp. 시스템의 저장·보유·삭제·국외 처리는 해당 업체의 최신 문서가 적용됩니다.'
					},
					{
						title: 'Vercel',
						body: '웹 앱과 서버 API를 호스팅합니다. 호스팅 과정에서 요청, IP 주소, 기기·이용·보안·진단 정보를 처리할 수 있습니다.'
					},
					{
						title: 'jsDelivr 및 Google 호스팅 MediaPipe 파일',
						body: '브라우저가 MediaPipe 실행 파일과 얼굴 랜드마크 모델을 내려받습니다. 이 과정에서 업체가 IP 주소 등 일반적인 네트워크 요청 정보를 받을 수 있습니다. Presence는 카메라 화면을 해당 파일 호스팅 업체로 보내지 않습니다.'
					}
				]
			},
			{
				id: 'retention',
				number: '05',
				title: '보유기간과 삭제',
				paragraphs: [
					'실시간 카메라 화면과 현재 작업 중인 사진은 이용 과정의 브라우저 메모리에 머물며 페이지 상태가 초기화되거나 탭을 닫으면 사라집니다. 서버는 요청 동안 분석 이미지를 처리하고 Presence 데이터베이스에 의도적으로 보관하지 않습니다.',
					'언어와 상황 설정은 변경하거나 브라우저의 사이트 데이터를 지울 때까지 localStorage에 남습니다. 비교용 사진과 리포트는 개선 후 다시 촬영하기를 선택한 경우에만 저장되며, “처음부터”를 선택하면 삭제됩니다. 브라우저에서 이 사이트의 데이터를 지우면 모든 Presence localStorage가 삭제됩니다.',
					'호스팅 로그와 외부 업체가 처리하는 정보에는 각 업체의 보유 정책이 적용됩니다. 프로토타입 화면에서는 업체가 해당 정책에 따라 독립적으로 보유한 정보를 직접 삭제할 수 없습니다.'
				],
				items: []
			},
			{
				id: 'choices',
				number: '06',
				title: '이용자의 선택과 권리',
				paragraphs: [
					'카메라 권한을 거부하고 파일을 선택하거나, 리포트를 요청하기 전에 나가거나, “처음부터”를 선택해 비교 정보를 지우거나, 브라우저에서 이 사이트의 저장 공간을 지울 수 있습니다.',
					'아래 프로젝트 문의처를 통해 열람·정정·삭제·처리 제한과 관련한 질문을 남길 수 있습니다. GitHub Issues는 공개되므로 사진, 분석 결과 또는 다른 민감한 정보를 첨부하지 마세요.'
				],
				items: []
			},
			{
				id: 'security',
				number: '07',
				title: '안전조치, 쿠키, 아동',
				paragraphs: [
					'운영 배포에는 HTTPS를 사용하고, YouCam API 키는 서버에만 두며, 전송 전 브라우저에서 이미지 크기를 줄입니다. 모든 위험을 없애는 방법은 없으므로 위 외부 업체가 처리하는 데 동의하기 어려운 사진은 업로드하지 마세요.',
					'현재 Presence는 자체 쿠키를 설정하지 않으며 분석·광고 SDK를 포함하지 않습니다. 위에서 설명한 제한된 설정과 비교 정보를 저장할 때만 localStorage를 사용합니다.',
					'이 프로토타입은 만 14세 미만 아동을 대상으로 하지 않습니다. 만 14세 미만 아동은 부모 또는 법정대리인의 동의와 감독 없이 사진을 업로드하지 않아야 합니다.'
				],
				items: []
			},
			{
				id: 'contact',
				number: '08',
				title: '문의와 방침 변경',
				paragraphs: [
					'프로토타입 관련 질문은 qtaghdi/youcam-api-hackathon GitHub 저장소에 남길 수 있습니다. 민감하지 않은 설명만 사용하세요. 현재 프로토타입에는 비공개 개인정보 문의 채널이 마련되어 있지 않습니다.',
					'정보 흐름, 외부 업체 또는 저장 방식이 바뀌면 이 방침과 상단의 변경일을 수정합니다. 중요한 변경은 새로운 처리를 시작하기 전에 안내해야 합니다.'
				],
				items: []
			}
		],
		providerLinks: {
			label: '외부 업체 문서',
			perfectTerms: 'YouCam API 이용약관',
			perfectPrivacy: 'Perfect Corp. 개인정보 보호정책',
			vercel: 'Vercel 개인정보 보호 안내',
			google: 'Google 개인정보처리방침'
		},
		contact: {
			label: '프로젝트 문의',
			title: 'Presence 해커톤 팀',
			body: '민감하지 않은 내용만 GitHub Issue로 남겨 주세요. 공개 Issue에 사진이나 리포트를 올리지 마세요.',
			action: '프로젝트 Issues 열기'
		},
		footer: {
			tagline: '사진을 공유하는 모든 순간에 분명한 선택권을 제공합니다.',
			home: 'Presence로 돌아가기',
			source: '프로토타입 전용 방침 · 2026년 7월 20일',
			status: '개인정보 보호 중심 해커톤 프로토타입',
			navigation: '푸터 링크',
			issues: '프로젝트 Issues',
			issuesExternal: '새 탭에서 프로젝트 Issues 열기'
		}
	}
} as const;
