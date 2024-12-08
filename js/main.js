function main() {
	'use strict'
	const logo = document.getElementById('logo')

	const homePage = document.getElementById('page-1')
	const homePageBtn = document.getElementById('home-page-btn')

	const changeLanguageButton = document.getElementById('translator')

	const tickingState = {}
	const clickState = {}
	const scrollState = {}
	const heightValue = {}

	let isAnimationStopped = false
	let isLanguageRussian = false
	let isSwitchAnimation = true

	const seenElements = new Set()

	function handlePageChangeOnClick(event, element, elementKey, startingHeight, startCallback, resetCallback) {
		const target = event.target
		const currentTarget = event.currentTarget

		if (!clickState[elementKey]) clickState[elementKey] = { newPage: 'home', previousPage: 'home', isClicked: false }

		scrollState[elementKey] = { scrolState: false }

		const allowedButtons = ['logo', 'home-page-btn', 'uses-page-btn', 'resume-page-btn', 'about-me-page-btn']

		const pageMapping = {
			'home-page-btn': 'home',
			'uses-page-btn': 'uses',
			'resume-page-btn': 'resume',
			'about-me-page-btn': 'about-me',
			[logo.id]: 'home',
		}

		clickState[elementKey].newPage = pageMapping[target.id] || pageMapping[currentTarget.id] || null

		if (clickState[elementKey].newPage === clickState[elementKey].previousPage) return
		if (!allowedButtons.includes(target.id)) return

		clickState[elementKey].previousPage = clickState[elementKey].newPage

		if (clickState[elementKey].previousPage) {
			if (!isAnimationStopped) {
				resetCallback(clickState[elementKey].previousPage)
				seenElements.clear()

				clickState[elementKey].isClicked = false
			}
		}

		if (isSwitchAnimation) {
			clickState[elementKey].isClicked = true

			window.requestAnimationFrame(() => {
				if (handleVisibilityChange(element, startingHeight, elementKey)) {
					startCallback(clickState[elementKey].newPage)

					scrollState[elementKey].scrolState = true
				}
			})
		} else {
			clickState[elementKey].isClicked = true

			const onAnimationEnd = event => {
				if (event.animationName === 'switch-animation-left-side-close' || event.animationName === 'switch-animation-right-side-close') {
					if (handleVisibilityChange(element, startingHeight, elementKey)) {
						startCallback(clickState[elementKey].newPage)
						scrollState[elementKey].scrolState = true
					}

					document.removeEventListener('animationend', onAnimationEnd)
				}
			}

			document.addEventListener('animationend', onAnimationEnd)
		}
	}

	function handlePageChangeOnScroll(element, elementKey, startingHeight, startCallback) {
		if (!scrollState[elementKey]) scrollState[elementKey] = { scrolState: false }

		if (scrollState[elementKey].scrolState) return

		if (handleVisibilityChange(element, startingHeight, elementKey)) {
			if (!scrollState[elementKey].scrolState) {
				scrollState[elementKey].scrolState = true

				startCallback()
			}
		}
	}

	function visibleOnLoad(element, elementKey, startingHeight, startCallback) {
		if (!tickingState[elementKey]) {
			tickingState[elementKey] = { ticking: false }
		}

		if (handleVisibilityChange(element, startingHeight, elementKey)) {
			if (!tickingState[elementKey].ticking) {
				window.requestAnimationFrame(() => {
					startCallback()

					scrollState[elementKey] = { scrolState: true }
					tickingState[elementKey].ticking = false
				})
				tickingState[elementKey].ticking = true
			}
		}
	}

	function handleVisibilityChange(element, startingHeight, elementKey) {
		const rect = element.getBoundingClientRect()

		if (!heightValue[elementKey]) {
			heightValue[elementKey] = { value: startingHeight }
		}

		const isVisible =
			rect.top >= 0 &&
			rect.left >= 0 &&
			rect.bottom <= (window.innerHeight - heightValue[elementKey].value || document.documentElement.clientHeight - heightValue[elementKey].value) &&
			rect.right <= (window.innerWidth || document.documentElement.clientWidth)

		if (isVisible && element !== undefined && elementKey !== undefined) seenElements.add(elementKey)

		return isVisible
	}

	function createAnimation(elements, elementKeys, startingHeight, startCallback, resetCallback) {
		elements.forEach((element, index) => {
			const elementKey = elementKeys[index]

			if (!element) {
				console.error(`${element} not found`)
				return
			}

			visibleOnLoad(element, elementKey, startingHeight, startCallback)

			document.addEventListener('scroll', () => {
				handlePageChangeOnScroll(element, elementKey, startingHeight, startCallback)
			})

			document.addEventListener('click', event => {
				handlePageChangeOnClick(event, element, elementKey, startingHeight, startCallback, resetCallback)
			})

			logo.addEventListener('click', event => {
				handlePageChangeOnClick(event, element, elementKey, startingHeight, startCallback, resetCallback)
			})
		})
	}

	function handleAnimationOnScroll(elements, classList, elementKeys, startCallback, removeCallback) {
		elements.forEach((element, index) => {
			document.addEventListener('scroll', () => {
				if (element.classList.contains(classList)) {
					if (handleVisibilityChange(element, 0, elementKeys)) {
						removeCallback(element, index)
					} else {
						startCallback(element, index)
					}
				}
			})
		})
	}

	function checkLanguageState(russianTexts, englishTexts, elements, toggleClasses) {
		changeLanguageButton.addEventListener('click', () => {
			elements.forEach((element, index) => {
				if (!element) {
					console.error(`${element} not found`)
					return
				}

				element.innerHTML = !isLanguageRussian ? englishTexts[index] : russianTexts[index]

				if (toggleClasses) {
					element.classList.toggle(toggleClasses, isLanguageRussian)
				}
			})
		})
	}

	function writeAndResetText(element, englishText, russianText, typeSpeed, elementKey, onComplete) {
		const config = {
			letterIndex: 0,
			targetString: englishText,
			timeout: null,
		}

		function handleLaguageChangeOnClick() {
			if (isLanguageRussian) {
				russianLanguage()
			} else if (!isLanguageRussian) {
				englishLanguage()
			}
		}

		function russianLanguage() {
			if (russianText) {
				config.targetString = russianText

				if (seenElements.has(elementKey)) {
					reset()
					write()
				}
			}
		}

		function englishLanguage() {
			config.targetString = englishText

			if (seenElements.has(elementKey)) {
				reset()
				write()
			}
		}

		changeLanguageButton.addEventListener('click', handleLaguageChangeOnClick)

		function write() {
			element.textContent = config.targetString.substring(0, config.letterIndex)

			if (config.letterIndex < config.targetString.length) {
				config.timeout = setTimeout(() => {
					config.letterIndex++
					write()
				}, typeSpeed)
			} else {
				if (typeof onComplete === 'function') {
					onComplete()
				}
			}
		}

		function reset() {
			config.letterIndex = 0
			clearTimeout(config.timeout)
			element.textContent = ''
		}

		return {
			write,
			reset,
		}
	}

	function pageUpdate() {
		window.scrollTo(0, 0)
	}

	function switchPages() {
		const pages = document.querySelectorAll('.page')
		const buttons = document.querySelectorAll('.nav__btn')

		const buttonLines = [
			{ element: 'nav__hover-top-line', position: 'top' },
			{ element: 'nav__hover-center-line', position: 'center' },
			{ element: 'nav__hover-bottom-line', position: 'bottom' },
		]

		function handleBtnClick(event) {
			const target = event.target.closest('.nav__btn')

			if (target) {
				const pageId = `page-${target.dataset.page}`
				const activePage = document.getElementById(pageId)

				pages.forEach(page => {
					page.classList.remove('page--active')
				})

				if (activePage) {
					activePage.classList.add('page--active')
				}

				window.scrollTo(0, 0)

				buttons.forEach(button => {
					button.classList.remove('nav__btn--clicked')
					buttonLines.forEach(({ element, position }) => {
						const lineElement = button.querySelector(`.${element}`)
						if (lineElement) {
							lineElement.classList.remove(`nav__hover-${position}-line--clicked`)
						}
					})
				})

				target.classList.add('nav__btn--clicked')
				buttonLines.forEach(({ element, position }) => {
					const currentLineElement = target.querySelector(`.${element}`)
					if (currentLineElement) {
						currentLineElement.classList.add(`nav__hover-${position}-line--clicked`)
					}
				})
			}
		}

		document.addEventListener('click', handleBtnClick)

		function handleLogoClick() {
			pages.forEach(page => {
				page.classList.remove('page--active')
			})

			buttons.forEach(button => {
				button.classList.remove('nav__btn--clicked')
				buttonLines.forEach(({ element, position }) => {
					const lineElement = button.querySelector(`.${element}`)
					if (lineElement) {
						lineElement.classList.remove(`nav__hover-${position}-line--clicked`)
					}
				})
			})

			buttonLines.forEach(({ element, position }) => {
				const currentLineElement = document.querySelector(`.${element}`)

				if (currentLineElement) {
					currentLineElement.classList.add(`nav__hover-${position}-line--clicked`)
				}
			})

			homePageBtn.classList.add('nav__btn--clicked')
			homePage.classList.add('page--active')

			window.scrollTo(0, 0)
		}

		logo.addEventListener('click', handleLogoClick)
	}

	function switchAnimate() {
		const elements = {
			switch: document.getElementById('switch-animation'),
			left: document.getElementById('switch-animation-left'),
			right: document.getElementById('switch-animation-right'),
			circleLeft: document.getElementById('switch-animation-circle-left'),
			circleRight: document.getElementById('switch-animation-circle-right'),
			page: document.getElementById('page'),
		}

		let isAnimationEnd = false
		let isSwitchAnimationOpen = false
		let isSwitchAnimationClose = false
		let isImgAnimationOpen = false
		let isImgAnimationClose = false

		const images = document.querySelectorAll('.switch-animation__img')

		const randomIndex = Math.floor(Math.random() * images.length)
		let selectedImage = images[randomIndex]

		elements.switch.classList.add('switch-animation--animate')
		elements.page.classList.add('page--switch-animation')
		elements.left.classList.add('switch-animation__left-side--animate')
		elements.right.classList.add('switch-animation__right-side--animate')

		function handleOpenAnimation(event) {
			if (isAnimationEnd) return
			isAnimationEnd = true

			const { animationName } = event

			if (animationName === 'switch-animation-rigth-side' || (animationName === 'switch-animation-left-side' && !isSwitchAnimationOpen)) {
				isSwitchAnimationOpen = true

				elements.circleLeft.classList.add('switch-animation__circle--left-side')
				elements.circleRight.classList.add('switch-animation__circle--right-side')

				selectedImage?.classList.add('switch-animation__img--animate')
			}

			if (animationName === 'switch-animation-img' && !isImgAnimationOpen) {
				isImgAnimationOpen = true

				setTimeout(() => {
					selectedImage?.classList.replace('switch-animation__img--animate', 'switch-animation__img--animate-close')
					elements.circleLeft.classList.replace('switch-animation__circle--left-side', 'switch-animation__circle--left-side-close')
					elements.circleRight.classList.replace('switch-animation__circle--right-side', 'switch-animation__circle--right-side-close')
				}, 1000)
			}

			if (animationName === 'switch-animation-img-close' && !isImgAnimationClose) {
				isImgAnimationClose = true

				elements.circleLeft.classList.remove('switch-animation__circle--left-side-close')
				elements.circleRight.classList.remove('switch-animation__circle--right-side-close')
				selectedImage?.classList.remove('switch-animation__img--animate-close')

				elements.left.classList.replace('switch-animation__left-side--animate', 'switch-animation__left-side--animate-close')
				elements.right.classList.replace('switch-animation__right-side--animate', 'switch-animation__right-side--animate-close')
			}

			if (animationName === 'switch-animation-rigth-side-close' || (animationName === 'switch-animation-left-side-close' && !isSwitchAnimationClose)) {
				isSwitchAnimationClose = true

				elements.left.classList.remove('switch-animation__left-side--animate-close')
				elements.right.classList.remove('switch-animation__right-side--animate-close')
				elements.switch.classList.remove('switch-animation--animate')
				elements.page.classList.remove('page--switch-animation')

				selectedImage = null
			}

			isAnimationEnd = false
		}

		document.removeEventListener('animationend', handleOpenAnimation)
		document.addEventListener('animationend', handleOpenAnimation)
	}

	function handlePageChangeClickAnimation() {
		const targetElements = ['uses-page-btn', 'resume-page-btn', 'about-me-page-btn']
		let lastClickedElement = null
		let canAnimate = false

		const logoAndHomePageHasClicked = () => {
			if (canAnimate && !isSwitchAnimation) {
				switchAnimate()
				canAnimate = false
				lastClickedElement = null
			}
		}

		const btnHasClicked = event => {
			if (lastClickedElement === event.currentTarget) return
			lastClickedElement = event.currentTarget

			if (!isSwitchAnimation) {
				switchAnimate()
				canAnimate = true
			}
		}

		targetElements.forEach(id => {
			const element = document.getElementById(id)
			element.addEventListener('click', btnHasClicked)
		})

		logo.addEventListener('click', logoAndHomePageHasClicked)
		homePageBtn.addEventListener('click', logoAndHomePageHasClicked)
	}

	function climbUp() {
		const button = document.getElementById('climb-up')
		const img = document.getElementById('climb-img')
		const circle = document.getElementById('climb-circle')

		let animationFrameTop = null
		let animationFrameScroll = null
		let isScrolling = false

		const config = {
			scrollSpeed: 20,
			btnVisible: 400,
		}

		function toggleClasses(element, addClasses, removeClasses) {
			element.classList.add(...addClasses)
			element.classList.remove(...removeClasses)
		}

		function scrollToTop() {
			const scrollStep = window.scrollY / config.scrollSpeed

			if (window.scrollY > 0) {
				window.scrollBy(0, -scrollStep)
				animationFrameTop = requestAnimationFrame(scrollToTop)
			} else {
				cancelAnimationFrame(animationFrameTop)
			}
		}

		function handleScroll() {
			const scrollY = window.scrollY

			const set = new Set()
			const animations = ['climb-up-img-hide', 'climb-up-circle-hide']

			function handleAnimationEnd(event) {
				if (animations.includes(event.animationName)) {
					set.add(event.animationName)

					if (set.size === animations.length) {
						button.classList.add('climb-up--hidden')

						set.clear()
					}
				}
			}

			if (scrollY >= config.btnVisible) {
				toggleClasses(button, ['climb-up--show'], ['climb-up--hidden'])
				toggleClasses(img, ['climb-up__img--animate-show'], ['climb-up__img--animate-hide'])
				toggleClasses(circle, ['climb-up__circle--show'], ['climb-up__circle--hide'])

				if (!button.hasEventListener) {
					button.addEventListener('click', scrollToTop)
					button.hasEventListener = true
				}

				document.removeEventListener('animationend', handleAnimationEnd)
			} else {
				toggleClasses(img, ['climb-up__img--animate-hide'], ['climb-up__img--animate-show'])
				toggleClasses(circle, ['climb-up__circle--hide'], ['climb-up__circle--show'])
				button.classList.remove('climb-up--show')

				if (button.hasEventListener) {
					button.removeEventListener('click', scrollToTop)
					button.hasEventListener = false
				}

				document.addEventListener('animationend', handleAnimationEnd)
			}

			if (scrollY < config.btnVisible && !animationFrameScroll) {
				animationFrameScroll = requestAnimationFrame(handleScroll)
			} else {
				cancelAnimationFrame(animationFrameScroll)
			}

			isScrolling = false
		}

		window.addEventListener('scroll', () => {
			if (!isScrolling) {
				isScrolling = true
				requestAnimationFrame(handleScroll)
			}
		})
	}

	function asideMenu() {
		const menuElement = document.getElementById('aside-menu')
		const openBtn = document.getElementById('aside-menu-btn')
		const closeBtn = document.getElementById('aside-menu-close')
		const activeBtn = document.getElementById('aside-menu-acitve')

		const animationStateBtn = document.getElementById('animation-stop')

		const animationStateText = document.getElementById('animation-stop-text')

		function changeLanguage() {
			function updateAnimationText() {
				const languageText = isLanguageRussian ? 'Анимаций' : 'Animations'
				const onOffText = isLanguageRussian ? (isAnimationStopped ? 'ВЫКЛ' : 'ВКЛ') : isAnimationStopped ? 'OFF' : 'ON'

				animationStateText.textContent = isAnimationStopped ? `Re:${languageText}: ${onOffText}` : `Re:${languageText}: ${onOffText}`
				animationStateText.classList.toggle('new-font', isLanguageRussian)
			}

			function toggleAnimationState() {
				isAnimationStopped = !isAnimationStopped
				updateAnimationText()
			}

			function toggleLanguageState() {
				isLanguageRussian = !isLanguageRussian
				updateAnimationText()
			}

			changeLanguageButton.addEventListener('click', toggleLanguageState)
			animationStateBtn.addEventListener('click', toggleAnimationState)
		}

		changeLanguage()

		function translateText() {
			function translateHeaderText() {
				const elementIds = ['home-page-btn-text', 'uses-page-btn-text', 'resume-page-btn-text', 'about-me-page-btn-text']
				const elements = elementIds.map(id => document.getElementById(id))
				const russianLanguage = ['Главная', 'Мой набор', 'Резюме', 'О себе']
				const englishLanguage = ['Home', 'Uses', 'Resume', 'About me']

				checkLanguageState(russianLanguage, englishLanguage, elements, null)
			}

			translateHeaderText()

			function translateAsideMenuText() {
				const elementIds = ['change-theme', 'translaite-text', 'aside-menu-close-text']
				const elements = elementIds.map(id => document.getElementById(id))
				const russianLanguage = ['Изменить фон', 'Изменить язык: EU', 'Закрыть меню']
				const englishLanguage = ['Change background', 'Change language: RU', 'Close menu']

				checkLanguageState(russianLanguage, englishLanguage, elements, 'russian-lang-text')
			}

			translateAsideMenuText()

			function translateHomePageText() {
				const elementIds = ['my-name-title', 'projects-text-one', 'projects-text-two', 'exp-start', 'exp-text-0', 'exp-text-1']
				const elements = elementIds.map(id => document.getElementById(id))
				const russianLanguage = ['Привет,<br>я <span>Sunnat</span>', 'У меня нет проектов которыми<br>я бы мог поделиться', 'Но скоро они появятся', 'Начало', 'В скором времени. . .', 'Продолжение следует?']
				const englishLanguage = [`Hello,<br>I'm <span>Sunnat</span>`, `I don't have any<br>projects to share yet`, 'But they will appear soon', 'Start', 'Coming soon. . .', 'To be continued?']

				checkLanguageState(russianLanguage, englishLanguage, elements, 'russian-lang-text')
			}

			translateHomePageText()

			function traslateUsesPageText() {
				const elements = document.querySelectorAll('.equipment-content__text')
				const russianLanguage = ['Монитор', 'ПК кейс', 'Кресло', 'Рабочий стол', 'Клавиатура', 'Мышь', 'Веб-камера', 'Микрофон']
				const englishLanguage = ['Monitor', 'PC case', 'Chair', 'Desk', 'Keyboard', 'Mouse', 'Webcam', 'Microphone']

				checkLanguageState(russianLanguage, englishLanguage, elements, 'russian-lang-text')
			}

			traslateUsesPageText()
		}

		translateText()

		function backgroundColorChange() {
			const root = document.querySelector('.page')
			const buttons = document.querySelectorAll('.aside-colors__colors')
			const classes = ['bg-color--1', 'bg-color--2', 'bg-color--3', 'bg-color--4']

			let isTransitioning
			let currentClass = ''

			function changeGradient(className) {
				if (isTransitioning) return
				if (currentClass === className) return

				isTransitioning = true
				currentClass = className

				let transitionPoint = 30
				const interval = setInterval(() => {
					transitionPoint++
					root.style.setProperty('--gradient-transition-point', `${transitionPoint}%`)

					if (transitionPoint >= 100) {
						clearInterval(interval)

						root.classList.remove(...classes)
						root.classList.add(className)

						let returnPoint = 100
						const returnInterval = setInterval(() => {
							returnPoint--
							root.style.setProperty('--gradient-transition-point', `${returnPoint}%`)

							if (returnPoint <= 30) {
								clearInterval(returnInterval)
								isTransitioning = false
							}
						}, 15)
					}
				}, 15)
			}

			buttons.forEach((button, index) => {
				button.addEventListener('click', event => {
					const target = event.target

					if (target.classList.contains('aside-colors__colors') && !isTransitioning) {
						buttons.forEach(element => element.classList.remove('aside-colors__colors--active'))
						target.classList.add('aside-colors__colors--active')
					}

					const className = classes[index]
					changeGradient(className)
				})
			})
		}

		backgroundColorChange()

		function manageMenuAnimations() {
			const menuState = {
				isOpen: false,
				isClosed: true,
			}

			function openMenu() {
				if (!menuState.isOpen) {
					menuState.isOpen = true
					menuState.isClosed = false
					menuElement.classList.remove('aside-menu__wrapper--close')
					menuElement.classList.add('aside-menu__wrapper--open')
					activeBtn.classList.add('aside-content__acite--open')
					document.querySelectorAll('.aside-content__item').forEach(item => item.classList.remove('aside-content__item--close'))

					openBtn.classList.add('aside-menu__btn--close')
				}
			}

			function closeMenu() {
				if (!menuState.isClosed) {
					menuState.isClosed = true
					menuState.isOpen = false
					menuElement.classList.remove('aside-menu__wrapper--open')
					menuElement.classList.add('aside-menu__wrapper--close')
					document.querySelectorAll('.aside-content__item').forEach(item => item.classList.add('aside-content__item--close'))

					activeBtn.classList.remove('aside-content__acite--open')
					openBtn.classList.remove('aside-menu__btn--close')
				}
			}

			openBtn.addEventListener('click', openMenu)
			closeBtn.addEventListener('click', closeMenu)
		}

		function initializeMenu() {
			openBtn.classList.add('aside-menu__btn--start')
		}

		initializeMenu()
		manageMenuAnimations()
	}

	function headerEvents() {
		function animateHeaderMain() {
			const container = document.getElementById('header-main')

			container.classList.add('header-main__wrapper--animate')
		}

		animateHeaderMain()

		function burgerMenu() {
			const elements = {
				menuContainer: document.getElementById('burger-menu'),
				navContainer: document.getElementById('header-nav-container'),
				navElement: document.getElementById('header-main-nav'),
				logoElement: document.getElementById('logo'),
				headerContainer: document.getElementById('header-main'),
				socialMediaContainer: document.getElementById('social-media'),
				socialMediaList: document.getElementById('social-media-list'),
				page: document.getElementById('page'),
			}

			const queryElements = {
				navItemElements: document.querySelectorAll('.nav__item'),
				socialMediaElements: document.querySelectorAll('.social-media__item'),
			}

			const burgerLines = [
				{ element: document.getElementById('burger-line-top'), position: 'top' },
				{ element: document.getElementById('burger-line-center'), position: 'center' },
				{ element: document.getElementById('burger-line-bottom'), position: 'bottom' },
			]

			let isOpen = false
			let isAnimating = false
			let timeouts = []

			function toggleLineClasses(action) {
				burgerLines.forEach(({ element, position }) => {
					element.classList[action](`burger-menu__line--${position}-animate`)
				})
			}

			function toggleNavItemClasses(action) {
				queryElements.navItemElements.forEach((element, index) => {
					const left = 'nav__item--left-animate'
					const right = 'nav__item--right-animate'
					const addClasses = index % 2 === 0 ? left : right

					if (action === 'add') element.classList.add(addClasses)
					if (action === 'remove') element.classList.remove(left, right)
				})
			}

			function togglesocialMediaClasses(action) {
				if (action === 'add') {
					queryElements.socialMediaElements.forEach((item, index) => {
						const timeout = setTimeout(() => {
							item.classList.add('social-media__item--burger-open')
						}, 100 * index)

						timeouts.push(timeout)
					})
				}

				if (action === 'remove') {
					queryElements.socialMediaElements.forEach(item => item.classList.remove('social-media__item--burger-open'))

					timeouts.forEach(clearTimeout)
					timeouts = []
				}
			}

			function toggleElements() {
				elements.menuContainer.classList.toggle('burger-menu--animate-open', isOpen)
				elements.menuContainer.classList.toggle('burger-menu--animate-close', !isOpen)
				elements.navContainer.classList.toggle('header-main__nav-container--burger-open-animate', isOpen)
				elements.navContainer.classList.toggle('header-main__nav-container--burger-close-animate', !isOpen)
				elements.logoElement.classList.toggle('logo--burger-open', isOpen)
				elements.headerContainer.classList.toggle('header-main__wrapper--burger-open', isOpen)
				elements.socialMediaContainer.classList.toggle('social-media--burger-open')
				elements.socialMediaList.classList.remove('social-media__list--burger-open')
				elements.page.classList.add('page--burger-open')
			}

			function removeElements() {
				elements.menuContainer.classList.remove('burger-menu--animate-open', 'burger-menu--animate-close', 'burger-menu--open')
				elements.navContainer.classList.remove('header-main__nav-container--burger-open', 'header-main__nav-container--burger-open-animate', 'header-main__nav-container--burger-close-animate')
				elements.navElement.classList.remove('header-main__nav--burger-open')
				elements.logoElement.classList.remove('logo--burger-open')
				elements.headerContainer.classList.remove('header-main__wrapper--burger-open')
				elements.socialMediaContainer.classList.remove('social-media--burger-open')
				elements.page.classList.remove('page--burger-open')
			}

			function handleAnimationEnd(event) {
				const { animationName } = event

				if (animationName === 'burger-menu-close') {
					toggleLineClasses('remove')

					elements.menuContainer.classList.remove('burger-menu--animate-close', 'burger-menu--open')
				}

				if (animationName === 'burger-menu-open') {
					elements.menuContainer.classList.remove('burger-menu--animate-open')
					elements.menuContainer.classList.add('burger-menu--open')
				}

				if (animationName === 'nav-container-burger-open') {
					elements.navContainer.classList.remove('header-main__nav-container--burger-open-animate')
					elements.navContainer.classList.add('header-main__nav-container--burger-open')
					elements.navElement.classList.add('header-main__nav--burger-open')
					elements.socialMediaContainer.classList.add('social-media--burger-open')
					elements.socialMediaList.classList.add('social-media__list--burger-open')

					toggleNavItemClasses('add')
					togglesocialMediaClasses('add')
				}

				if (animationName === 'nav-container-burger-close') {
					elements.page.classList.remove('page--burger-open')
					elements.navContainer.classList.remove('header-main__nav-container--burger-open', 'header-main__nav-container--burger-close-animate')
					elements.navElement.classList.remove('header-main__nav--burger-open')
					elements.socialMediaContainer.classList.remove('social-media--burger-open')
					elements.socialMediaList.classList.remove('social-media__list--burger-open')

					toggleNavItemClasses('remove')
				}

				if (['nav-container-burger-open', 'nav-container-burger-close'].includes(animationName)) {
					setTimeout(() => {
						isAnimating = false
					}, 1000)
				}
			}

			function toggleMenu() {
				if (isAnimating) return

				isOpen = !isOpen
				isAnimating = true

				toggleLineClasses('add')
				togglesocialMediaClasses('remove')
				toggleElements()

				document.addEventListener('animationend', handleAnimationEnd)
			}

			elements.menuContainer.addEventListener('click', toggleMenu)

			function resetMenuClasses() {
				toggleLineClasses('remove')
				toggleNavItemClasses('remove')
				removeElements()

				isOpen = false
				isAnimating = false
			}

			function handleResetOnResize() {
				if (window.innerWidth > 1000) {
					resetMenuClasses()
				}
			}

			window.addEventListener('resize', handleResetOnResize)
		}

		burgerMenu()
	}

	function homePageEvents() {
		function animateNameTitle() {
			const container = document.getElementById('my-name-hidden-title')
			const title = document.getElementById('my-name-title')

			const ids = [container]
			const elementKeys = ['my-name-hidden-title']
			const startHeight = 0

			function animate() {
				title.classList.add('my-name__title--animate')
			}

			function reset() {
				title.classList.remove('my-name__title--animate')
			}

			createAnimation(ids, elementKeys, startHeight, animate, reset)
		}

		animateNameTitle()

		function writeNameText() {
			const text = document.getElementById('my-name-write-text')
			const blink = document.getElementById('my-name-blink')
			const container = document.getElementById('my-name-text')

			const ids = [container]
			const elementKeys = ['my-name-text']
			const startHeight = 0

			const texts = {
				en: ['frontend developer', 'I want to learn a lot. . .', 'HTML is easy!', 'Javascript is my choice!', 'I love CSS animations!', 'HTML, CSS and JS.', 'Coming soon... React!', '. . .'],
				ru: ['frontend разработчик', 'Я хочу многому научиться. . .', 'HTML — это просто!', 'JavaScript — мой выбор!', 'Обожаю CSS-анимации!', 'HTML, CSS и JS', 'Скоро. . . React!', '. . .'],
			}

			let textIndex = 0
			let letterIndex = 0
			let isDeleted = false
			let blinkHasAnimated = false
			let textTyping = false
			let timeout

			const cfg = {
				typeSpeed: 70,
				deleteSpeed: 50,
				startWrite: 800,
				nextString: 2200,
				delayWriteNextString: 1700,
			}

			let tempLanguageState

			function startTyping() {
				let currentText = tempLanguageState ? texts.ru[textIndex] : texts.en[textIndex]
				text.textContent = currentText.substring(0, letterIndex)

				clearTimeout(timeout)

				if (!isDeleted && letterIndex < currentText.length) {
					if (!textTyping) {
						tempLanguageState = isLanguageRussian
					}
					textTyping = true
					letterIndex++
					timeout = setTimeout(startTyping, cfg.typeSpeed)
				} else if (isDeleted && letterIndex > 0) {
					letterIndex--
					timeout = setTimeout(startTyping, cfg.deleteSpeed)
				} else if (!isDeleted && letterIndex === currentText.length) {
					textTyping = false
					isDeleted = true
					timeout = setTimeout(startTyping, cfg.nextString)
				} else if (isDeleted && letterIndex === 0) {
					isDeleted = false
					textIndex = (textIndex + 1) % (isLanguageRussian ? texts.ru.length : texts.en.length)
					timeout = setTimeout(startTyping, cfg.delayWriteNextString)
				}
			}

			function animate() {
				blink.classList.add('my-name__blink--animation')

				document.addEventListener('animationend', handleBlinkAnimation)
			}

			function reset() {
				document.removeEventListener('animationend', handleBlinkAnimation)

				blink.classList.remove('my-name__blink--animation')

				isDeleted = false
				blinkHasAnimated = false
				clearTimeout(timeout)
				text.textContent = ''
				textIndex = (textIndex + 1) % (isLanguageRussian ? texts.ru.length : texts.en.length)
				letterIndex = 0
			}

			function handleBlinkAnimation(event) {
				if (event.animationName === 'my-name-blink-start' && !blinkHasAnimated) {
					blinkHasAnimated = true
					timeout = setTimeout(startTyping, cfg.startWrite)
				}
			}

			createAnimation(ids, elementKeys, startHeight, animate, reset)
		}

		writeNameText()

		function animateLogo3d() {
			const elements = {
				logo3d: document.getElementById('logo-3d'),
				logo3dLineLeft: document.getElementById('logo-3d-line-left'),
				logo3dLineRight: document.getElementById('logo-3d-line-right'),
				logo3dLineTop: document.getElementById('logo-3d-line-top'),
				logo3dLineBottom: document.getElementById('logo-3d-line-bottom'),
				logo3dFront: document.getElementById('logo-3d-front'),
				logo3dShadow: document.getElementById('logo-3d-shadow'),
				logo3dImg: document.getElementById('logo-3d-img'),
				logo3dPreserve: document.getElementById('logo-3d-preverve'),
			}

			const ids = [elements.logo3d]
			const elementKeys = ['logo3d']
			const startHeight = 0

			const lineAnimations = ['logo-3d-line-left', 'logo-3d-line-right', 'logo-3d-line-top', 'logo-3d-line-bottom']
			const mainAnimations = ['logo-3d-front-start', 'logo-3d-shadow-start', 'logo-3d-img-start']

			let completedLineAnimations = new Set()
			let completedMainAnimations = new Set()

			function handleLineAnimations(event) {
				if (lineAnimations.includes(event.animationName)) {
					completedLineAnimations.add(event.animationName)

					if (completedLineAnimations.size === lineAnimations.length) {
						elements.logo3dFront.classList.add('logo-3d__front--animate')
						elements.logo3dShadow.classList.add('logo-3d__shadow--animate')
						elements.logo3dImg.classList.add('logo-3d__img--animate')

						completedLineAnimations.clear()
					}
				}
			}

			function handleMainAnimations(event) {
				if (mainAnimations.includes(event.animationName)) {
					completedMainAnimations.add(event.animationName)

					if (completedMainAnimations.size === mainAnimations.length) {
						elements.logo3dPreserve.classList.add('logo-3d__preserve-3d--animate')

						completedMainAnimations.clear()
					}
				}
			}

			function removeAnimationClasses() {
				elements.logo3dLineLeft.classList.remove('logo-3d__line-left--animate')
				elements.logo3dLineRight.classList.remove('logo-3d__line-right--animate')
				elements.logo3dLineTop.classList.remove('logo-3d__linte-top--animate')
				elements.logo3dLineBottom.classList.remove('logo-3d__line-bottom--animate')
				elements.logo3dFront.classList.remove('logo-3d__front--animate')
				elements.logo3dShadow.classList.remove('logo-3d__shadow--animate')
				elements.logo3dImg.classList.remove('logo-3d__img--animate')
				elements.logo3dPreserve.classList.remove('logo-3d__preserve-3d--animate')
			}

			function clearEventListeners() {
				document.removeEventListener('animationend', handleLineAnimations)
				document.removeEventListener('animationend', handleMainAnimations)
			}

			function animate() {
				elements.logo3dLineLeft.classList.add('logo-3d__line-left--animate')
				elements.logo3dLineRight.classList.add('logo-3d__line-right--animate')
				elements.logo3dLineTop.classList.add('logo-3d__linte-top--animate')
				elements.logo3dLineBottom.classList.add('logo-3d__line-bottom--animate')

				document.addEventListener('animationend', handleLineAnimations)
				document.addEventListener('animationend', handleMainAnimations)
			}

			function reset() {
				removeAnimationClasses()
				clearEventListeners()
			}

			createAnimation(ids, elementKeys, startHeight, animate, reset)
		}

		animateLogo3d()

		function animateScrollHmp() {
			const container = document.getElementById('scroll-hmp')
			const line = document.getElementById('scroll-hmp-line')
			const text = document.getElementById('scroll-hmp-text')

			const ids = [container]
			const elementKeys = ['scroll-hmp']
			const startHeight = 0

			function animate() {
				line.classList.add('scroll-hmp__line--animate')
				text.classList.add('scroll-hmp__hide-text--animate')
			}

			function reset() {
				line.classList.remove('scroll-hmp__line--animate')
				text.classList.remove('scroll-hmp__hide-text--animate')
			}

			createAnimation(ids, elementKeys, startHeight, animate, reset)
		}

		animateScrollHmp()

		function writeCardsTitle() {
			const title = document.getElementById('cards-title')

			const ids = [title]
			const elementKeys = ['cards-title']
			let startHeight = document.documentElement.clientWidth > 600 ? 0 : 100

			const handleTextWrite = writeAndResetText(title, 'Progress of my skills', 'Прогресс моих навыков', 60, 'cards-title', null)

			function handleChangeOnResize() {
				startHeight = document.documentElement.clientWidth > 600 ? 0 : 100
			}

			function animate() {
				window.addEventListener('resize', handleChangeOnResize)

				handleTextWrite.write()
			}

			function reset() {
				window.removeEventListener('resize', handleChangeOnResize)

				handleTextWrite.reset()
			}

			createAnimation(ids, elementKeys, startHeight, animate, reset)
		}

		writeCardsTitle()

		function animateCards() {
			const configProgress = [
				{ id: 0, className: 'html', precent: 70, progressDuration: 10000, precentChangeTime: 2000 },
				{ id: 1, className: 'css', precent: 80, progressDuration: 10000, precentChangeTime: 2200 },
				{ id: 2, className: 'js', precent: 40, progressDuration: 7000, precentChangeTime: 2400 },
				{ id: 3, className: 'react', precent: 10, progressDuration: 5000, precentChangeTime: 2600 },
			]

			const queryElements = {
				container: document.querySelectorAll('.cards-content__container'),
				svgBox: document.querySelectorAll('.cards-content__svg-box'),
				text: document.querySelectorAll('.cards-content__progress-text'),
				value: document.querySelectorAll('.cards-content__value'),
				textBox: document.querySelectorAll('.cards-content__inner-text'),
				textsElements: document.querySelectorAll('.cards-content__text'),
			}

			function animateProgress() {
				const ids = []
				const elementKeys = []
				const startHeight = 30

				const circles = []
				const intervals = []
				const animationFrames = []
				const timeouts = []
				const visibleIndexes = []
				const animationEnd = {}
				const fluctuateStatus = {}
				let handleAnimation = null

				queryElements.container.forEach((_, index) => {
					const id = document.getElementById(`cards-inner-progress-${index}`)
					const circle = document.getElementById(`cards-content-circle-${index}`)

					elementKeys.push(`cards-inner-progress-${index}`)
					ids.push(id)
					circles.push(circle)
				})

				function getPrecentCards(circleId, numberId, elementKey, targetPercent, duration, precentChangeTime) {
					const progressCircle = document.getElementById(circleId)
					const percentValue = document.getElementById(numberId)
					const radius = progressCircle.r.baseVal.value
					const circumference = 2 * Math.PI * radius
					const initialOffset = circumference * 0.99

					let intervalFluctuateProgress = null

					if (!fluctuateStatus[elementKeys]) {
						fluctuateStatus[elementKey] = { isStart: false }
					}

					progressCircle.style.strokeDasharray = `${circumference}`
					progressCircle.style.strokeDashoffset = `${initialOffset}`

					function setProgress(percent) {
						const offset = circumference - (percent / 100) * circumference
						progressCircle.style.strokeDashoffset = offset
						percentValue.textContent = `${percent}`
					}

					function animateProgress() {
						let start = null
						let initialPercent = 0

						function step(timestamp) {
							if (!start) start = timestamp
							const progress = timestamp - start
							const percent = Math.min(initialPercent + (progress / duration) * targetPercent, targetPercent)
							setProgress(Math.floor(percent))

							if (progress < duration) {
								const animationFrame = requestAnimationFrame(step)
								animationFrames.push(animationFrame)
							} else if (!fluctuateStatus[elementKey].isStart) {
								fluctuateStatus[elementKey].isStart = true

								fluctuateProgress()
							}
						}

						const animationFrame = requestAnimationFrame(step)
						animationFrames.push(animationFrame)
					}

					setProgress(0)
					animateProgress()

					function fluctuateProgress() {
						if (intervalFluctuateProgress) return

						intervalFluctuateProgress = setInterval(() => {
							const currentPercent = parseInt(percentValue.textContent, 10)
							const fluctuation = Math.floor(Math.random() * 3) - 1
							let newPercent = currentPercent + fluctuation

							if (newPercent <= 0) {
								newPercent = 0
							} else if (newPercent >= 100) {
								newPercent = 100
							}

							if (newPercent > targetPercent + 5 && targetPercent >= 0) {
								newPercent = targetPercent + 5
							} else if (newPercent < targetPercent - 5 && targetPercent >= 0) {
								newPercent = targetPercent - 5
							}

							if (precentChangeTime != 0) {
								setProgress(newPercent)
							}
						}, precentChangeTime)

						intervals.push(intervalFluctuateProgress)
					}
				}

				function animate() {
					queryElements.svgBox.forEach((_, index) => {
						if (!animationEnd[index]) {
							animationEnd[index] = { isEnded: false, isStarted: false }
						}

						if (seenElements.has(elementKeys[index])) {
							if (!animationEnd[index].isStarted) {
								animationEnd[index].isStarted = true

								const { id, className, precent, progressDuration, precentChangeTime } = configProgress[index]

								const svgBox = queryElements.svgBox[index]
								const progressText = queryElements.text[index]
								const container = queryElements.container[index]

								visibleIndexes.push(index)

								setTimeout(() => {
									visibleIndexes.length = 0
								}, 200)

								const delay = visibleIndexes.indexOf(index) * 200

								const timeout = setTimeout(() => {
									svgBox.classList.add('cards-content__svg-box--animate')
									progressText.classList.add('cards-content__progress-text--animate')
									container.classList.add(`cards-content__container--${className}-animate`)
								}, delay)

								timeouts.push(timeout)

								handleAnimation = event => {
									if (event.target === queryElements.svgBox[index] && event.animationName === 'cards-content-svg-box' && !animationEnd[index].isEnded) {
										animationEnd[index].isEnded = true

										getPrecentCards(`cards-content-circle-${id}`, `cards-content-value-${id}`, `cards-content-content-${id}`, precent, progressDuration, precentChangeTime)

										const timeout = setTimeout(() => {
											circles[index].classList.add(`cards-content__circle--${className}`)
										}, 200)

										timeouts.push(timeout)
									}
								}

								document.addEventListener('animationend', handleAnimation)
							}
						}
					})
				}

				function reset() {
					queryElements.svgBox.forEach((element, index) => {
						const { className } = configProgress[index]

						animationEnd[index] = { isEnded: false, isStarted: false }
						fluctuateStatus[index] = { isStart: false }

						queryElements.container[index].classList.remove(`cards-content__container--${className}-animate`)
						queryElements.svgBox[index].classList.remove('cards-content__svg-box--animate')
						queryElements.text[index].classList.remove('cards-content__progress-text--animate')
						circles[index].classList.remove(`cards-content__circle--${className}`)

						queryElements.value[index].textContent = 0
						clearInterval(intervals[index])
					})

					animationFrames.forEach(frame => cancelAnimationFrame(frame))

					animationFrames.length = 0
					intervals.length = 0
				}

				createAnimation(ids, elementKeys, startHeight, animate, reset)
			}

			animateProgress()

			function animateTexts() {
				const ids = []
				const elementKeys = []
				let startHeight = document.documentElement.clientWidth < 1030 ? 50 : 215

				queryElements.textsElements.forEach((element, index) => {
					const id = `cards-content-text-${index}`
					element.setAttribute('id', id)

					elementKeys.push(`cards-content-text-${index}`)
					ids.push(element)
				})

				queryElements.container.forEach((_, index) => {
					const { className } = configProgress[index]
					const textElements = [...queryElements.textBox[index].childNodes].filter(node => node.nodeType === 1 && node.classList.contains('cards-content__text'))

					textElements.forEach((element, index) => {
						if (index % 2 === 0) {
							element.classList.add(`cards-content__text--${className}`)
						}
					})
				})

				const timeouts = []
				const visibleIndexes = []
				const animationEnd = {}

				function updateStartingHeight() {
					startHeight = document.documentElement.clientWidth < 1030 ? 50 : 215
				}

				function animate() {
					window.addEventListener('resize', updateStartingHeight)

					queryElements.textsElements.forEach((element, index) => {
						if (!animationEnd[index]) {
							animationEnd[index] = { isStarted: false }
						}

						if (seenElements.has(elementKeys[index])) {
							if (!animationEnd[index].isStarted) {
								animationEnd[index].isStarted = true

								visibleIndexes.push(index)

								setTimeout(() => {
									visibleIndexes.length = 0
								}, 80)

								const delay = visibleIndexes.indexOf(index) * 80

								const timeout = setTimeout(() => {
									element.classList.add('cards-content__text--animate')
								}, delay)

								timeouts.push(timeout)
							}
						}
					})
				}

				function reset() {
					window.removeEventListener('resize', updateStartingHeight)

					queryElements.textsElements.forEach((element, index) => {
						element.classList.remove('cards-content__text--animate')

						clearTimeout(timeouts[index])

						animationEnd[index] = { isStarted: false }
					})

					timeouts.length = 0
				}

				createAnimation(ids, elementKeys, startHeight, animate, reset)
			}

			animateTexts()
		}

		animateCards()

		function writeProjectsTitle() {
			const title = document.getElementById('projects-title')

			const ids = [title]
			const elementKeys = ['projects-title']
			const startHeight = 150

			const handleTextWrite = writeAndResetText(title, 'My projects', 'Мои проекты', 80, 'projects-title', null)

			createAnimation(ids, elementKeys, startHeight, handleTextWrite.write, handleTextWrite.reset)
		}

		writeProjectsTitle()

		function animateProjectsText() {
			const text_1 = document.getElementById('projects-text-one')
			const text_2 = document.getElementById('projects-text-two')
			const innerText = document.getElementById('projects-inner-text')

			const ids = [innerText]
			const elementKeys = ['projects-inner-text']
			const startHeight = 50

			function animate() {
				text_1.classList.add('projects__text-one--animate')
				text_2.classList.add('projects__text-two--animate')
			}

			function reset() {
				text_1.classList.remove('projects__text-one--animate')
				text_2.classList.remove('projects__text-two--animate')
			}

			createAnimation(ids, elementKeys, startHeight, animate, reset)
		}

		animateProjectsText()

		function animateCloud() {
			const cloud = document.getElementById('cloud-particle-center')
			const cloudContainer = document.getElementById('cloud-container')
			const cloudTop = document.getElementById('cloud-partilce-top')
			const cloudBottom = document.getElementById('cloud-bottom')

			const ids = [cloudContainer]
			const elementKeys = ['cloud-container']
			let startHeight = document.documentElement.clientWidth > 1100 ? 130 : 200

			let timeout
			let interval

			function handleChangeOnResize() {
				startHeight = document.documentElement.clientWidth > 1100 ? 130 : 200
			}

			function handleAnimationEnd(event) {
				const { animationName } = event

				if (animationName === 'cloud-partilce-center-start') {
					cloudContainer.classList.add('cloud--animate')
				}

				if (animationName === 'cloud-container-visible') {
					cloudTop.classList.add('cloud__particle-top--animate')
					cloudBottom.classList.add('cloud__bottom--animate')

					interval = setInterval(() => {
						rain()
					}, 100)
				}
			}

			function rain() {
				const elements = document.createElement('div')
				const position = Math.floor(Math.random() * (cloud.offsetWidth - 50) + 25)
				const width = Math.random() * 5
				const height = Math.random() * 50
				const duration = Math.random() * 0.5

				elements.classList.add('cloud__drop')
				cloud.appendChild(elements)
				elements.style.left = `${position}px`
				elements.style.width = `${0.5 * width}px`
				elements.style.height = `${0.5 * height}px`
				elements.style.animationDuration = `${1.5 + duration}s`

				timeout = setTimeout(() => {
					if (cloud.contains(elements)) {
						cloud.removeChild(elements)
					}
				}, 2000)
			}

			function animate() {
				cloud.classList.add('cloud__particle-center--animate')

				document.addEventListener('animationend', handleAnimationEnd)
				window.addEventListener('resize', handleChangeOnResize)
			}

			function reset() {
				clearInterval(interval)
				clearTimeout(timeout)

				const drops = cloud.querySelectorAll('.cloud__drop')
				drops.forEach(drop => {
					if (cloud.contains(drop)) {
						cloud.removeChild(drop)
					}
				})

				cloud.classList.remove('cloud__particle-center--animate')
				cloudContainer.classList.remove('cloud--animate')
				cloudTop.classList.remove('cloud__particle-top--animate')
				cloudBottom.classList.remove('cloud__bottom--animate')

				window.removeEventListener('resize', handleChangeOnResize)
				document.removeEventListener('animationend', handleAnimationEnd)
			}

			createAnimation(ids, elementKeys, startHeight, animate, reset)
		}

		animateCloud()

		function writeExperienceTitle() {
			const title = document.getElementById('exp-title')

			const ids = [title]
			const elementKeys = ['exp-title']
			let startHeight = document.documentElement.clientWidth >= 1000 ? 150 : 30

			const handleTextWrite = writeAndResetText(title, 'My way', 'Мой путь', 70, 'exp-title', null)

			function handleChanageOnResize() {
				startHeight = document.documentElement.clientWidth >= 1000 ? 150 : 30
			}

			function animate() {
				window.addEventListener('resize', handleChanageOnResize)

				handleTextWrite.write()
			}

			function reset() {
				handleTextWrite.reset()

				window.removeEventListener('resize', handleChanageOnResize)
			}

			createAnimation(ids, elementKeys, startHeight, animate, reset)
		}

		writeExperienceTitle()

		function animateExperience() {
			const elements = {
				container: document.getElementById('exp-inner-content'),
				firstElement: document.getElementById('exp-element-0'),
				top: document.getElementById('exp-top'),
				start: document.getElementById('exp-start'),
				bottomLine: document.getElementById('exp-bottom-line'),
			}

			const queryElements = {
				boxElements: document.querySelectorAll('.exp__box'),
				centerLine: document.querySelectorAll('.exp__center-line'),
				horizontalLine: document.querySelectorAll('.exp__horizont-line'),
				circle: document.querySelectorAll('.exp__circle'),
				hiddenText: document.querySelectorAll('.exp__hidden-text'),
				text: document.querySelectorAll('.exp__text'),
			}

			const ids = []
			const elementKeys = []
			const startHeight = 0

			const elementSeen = []
			let currentStepIndex = 0

			queryElements.boxElements.forEach((_, index) => {
				const elementId = document.getElementById(`exp-element-${index}`)
				if (elementId) ids.push(elementId)

				elementSeen.push(`exp-element-${index}`)
				elementKeys.push(`exp-element-${index}`)
			})

			const isAnimation = {}
			let isStartAnimation = false

			let handleAnimationEnd = null

			function addClasses(elements, classes) {
				elements.forEach((element, index) => {
					element.classList.add(index % 2 === 0 ? `${classes}--left` : `${classes}--right`)
				})
			}

			addClasses(queryElements.horizontalLine, 'exp__horizont-line')
			addClasses(queryElements.hiddenText, 'exp__hidden-text')
			addClasses(queryElements.text, 'exp__text')

			function handleStartAnimation(event) {
				if (event.animationName === 'exp-top' && !isStartAnimation) {
					isStartAnimation = true
					handleAnimation()
				}
			}

			function handleAnimation(stepIndex = currentStepIndex) {
				if (currentStepIndex >= queryElements.boxElements.length) return

				if (!isAnimation[currentStepIndex]) {
					isAnimation[currentStepIndex] = { isStarted: false, isEnded: false }
				}

				if (seenElements.has(elementSeen[currentStepIndex]) && !isAnimation[currentStepIndex]?.isStarted) {
					isAnimation[currentStepIndex].isStarted = true

					queryElements.centerLine[currentStepIndex].classList.add('exp__center-line--animate')
					queryElements.horizontalLine[currentStepIndex].classList.add(currentStepIndex % 2 === 0 ? 'exp__horizont-line--left-animate' : 'exp__horizont-line--right-animate')

					handleAnimationEnd = async event => {
						const { animationName } = event

						if (animationName === 'exp-center-line' && !isAnimation[currentStepIndex].isEnded && seenElements.has(elementSeen[currentStepIndex])) {
							isAnimation[currentStepIndex].isEnded = true
							queryElements.circle[currentStepIndex].classList.add(currentStepIndex % 2 === 0 ? 'exp__circle--left' : 'exp__circle--right')
							queryElements.text[currentStepIndex].classList.add(currentStepIndex % 2 === 0 ? 'exp__text--left-animate' : 'exp__text--right-animate')

							await new Promise(resolve => {
								queryElements.centerLine[currentStepIndex].removeEventListener('animationend', handleAnimationEnd)
								setTimeout(resolve, 10)
							})

							currentStepIndex = stepIndex + 1
							handleAnimation(currentStepIndex)

							if (currentStepIndex >= queryElements.boxElements.length) {
								elements.bottomLine.classList.add('exp__bottom-line--animate')
							}
						}
					}

					queryElements.centerLine[currentStepIndex].addEventListener('animationend', handleAnimationEnd)
				}
			}

			function animate() {
				handleAnimation()

				if (seenElements.has('exp-element-0')) {
					elements.top.classList.add('exp__top--animate')
					elements.start.classList.add('exp__start--animate')
				}

				document.addEventListener('animationend', handleStartAnimation)
			}

			function reset() {
				queryElements.boxElements.forEach((_, index) => {
					queryElements.centerLine[index].classList.remove('exp__center-line--animate')
					queryElements.horizontalLine[index].classList.remove('exp__horizont-line--left-animate', 'exp__horizont-line--right-animate')
					queryElements.circle[index].classList.remove('exp__circle--left', 'exp__circle--right')
					queryElements.text[index].classList.remove('exp__text--left-animate', 'exp__text--right-animate')
					queryElements.circle[index].classList.remove('exp__circle--left', 'exp__circle--right')
					queryElements.text[index].classList.remove('exp__text--left-animate', 'exp__text--right-animate')

					isAnimation[index] = { isStarted: false, isEnded: false }
				})

				queryElements.centerLine.forEach(element => {
					element.removeEventListener('animationend', handleAnimationEnd)
				})

				currentStepIndex = 0

				elements.top.classList.remove('exp__top--animate')
				elements.start.classList.remove('exp__start--animate')
				elements.bottomLine.classList.remove('exp__bottom-line--animate')

				isStartAnimation = false

				document.removeEventListener('animationend', handleStartAnimation)
			}

			createAnimation(ids, elementKeys, startHeight, animate, reset)
		}

		animateExperience()
	}

	function usesPageEvents() {
		function gettingAnimate() {
			function titleAnimate() {
				const title = document.getElementById('uses-getting-title')
				const text = document.getElementById('uses-getting-text')

				const ids = [title, text]
				const elementKeys = ['usesGettingTitle', 'usesGettingText']
				const startHeight = 0

				function animate() {
					title.classList.add('uses-getting__title--animate')
					text.classList.add('uses-getting__text--animate')
				}

				function reset() {
					title.classList.remove('uses-getting__title--animate', 'uses-getting__title--scroll-animate')
					text.classList.remove('uses-getting__text--animate', 'uses-getting__text--scroll-animate')
				}

				function scrollAnimate() {
					title.classList.add('uses-getting__title--scroll-animate')
					text.classList.add('uses-getting__text--scroll-animate')
				}

				function scrollReset() {
					title.classList.remove('uses-getting__title--scroll-animate')
					text.classList.remove('uses-getting__text--scroll-animate')
				}

				handleAnimationOnScroll(ids, 'uses-getting__title--animate', elementKeys, scrollAnimate, scrollReset)
				createAnimation(ids, elementKeys, startHeight, animate, reset)
			}

			titleAnimate()

			function scrollAnimate() {
				const container = document.getElementById('uses-getting-scroll')
				const line = document.getElementById('uses-gettingt-scroll-line')
				const text = document.getElementById('uses-getting-scroll-text')
				const letters = document.querySelectorAll('.uses-getting__scroll-letters')

				const timeouts = []

				const ids = [container]
				const elementKeys = ['uses-getting-scroll']
				const startHeight = -100

				const scrollElements = [text, line]
				const scrollKeys = ['uses-gettingt-scroll-line', 'uses-getting-scroll-text']

				function lettersAnimate() {
					letters.forEach((element, index) => {
						const timeout = setTimeout(() => {
							element.classList.add('uses-getting__scroll-letters--animate')
						}, 180 * index)

						timeouts.push(timeout)
					})
				}

				function letterRemove() {
					timeouts.forEach(timeout => clearTimeout(timeout))
					timeouts.length = 0

					letters.forEach(element => {
						element.classList.remove('uses-getting__scroll-letters--animate')
					})
				}

				function animate() {
					lettersAnimate()

					line.classList.add('uses-getting__scroll-line--animate')
				}

				function reset() {
					letterRemove()

					text.classList.remove('uses-getting__scroll-text--scroll-animate')
					line.classList.remove('uses-getting__scroll-line--animate', 'uses-getting__scroll-line--scroll-animate')
				}

				function scrollAnimate() {
					text.classList.add('uses-getting__scroll-text--scroll-animate')
					line.classList.add('uses-getting__scroll-line--scroll-animate')
				}

				function scrollReset() {
					text.classList.remove('uses-getting__scroll-text--scroll-animate')
					line.classList.remove('uses-getting__scroll-line--scroll-animate')
				}

				handleAnimationOnScroll(scrollElements, 'uses-getting__scroll-line--animate', scrollKeys, scrollAnimate, scrollReset)
				createAnimation(ids, elementKeys, startHeight, animate, reset)
			}

			scrollAnimate()
		}

		gettingAnimate()

		function equipment() {
			function title() {
				const title = document.getElementById('equipment-title')

				const ids = [title]
				const elementKeys = ['equipment-title']
				const startHeight = 30

				function animate() {
					title.classList.add('equipment__title--animate')
				}

				function reset() {
					title.classList.remove('equipment__title--animate', 'equipment__title--scroll-animate')
				}

				function scrollAnimate() {
					title.classList.add('equipment__title--scroll-animate')
				}

				function scrollReset() {
					title.classList.remove('equipment__title--scroll-animate')
				}

				handleAnimationOnScroll(ids, 'equipment__title--animate', elementKeys, scrollAnimate, scrollReset)
				createAnimation(ids, elementKeys, startHeight, animate, reset)
			}

			title()

			function equipmentAnimate() {
				const elements = {
					item: document.querySelectorAll('.equipment-content__item'),
					text: document.querySelectorAll('.equipment-content__text'),
					button: document.querySelectorAll('.equipment-content__button'),
					img: document.querySelectorAll('.equipment-content__img'),
					hiddenBox: document.querySelectorAll('.equipment-content__hidden-box'),
					hiddenImg: document.querySelectorAll('.equipment-content__hidden-img'),
					hiddenText: document.querySelectorAll('.equipment-content__hidden-text'),
				}

				const ids = []
				const elementKeys = []
				const startHeight = 50

				elements.item.forEach((_, index) => {
					const elementId = document.getElementById(`equipment-id-${index}`)
					if (elementId) ids.push(elementId)

					elementKeys.push(`equipment-${index}-item`)
				})

				const animationStart = {}
				const clickState = {}

				const visibleIndexes = []

				function handleAnimation() {
					elements.item.forEach((_, index) => {
						if (!animationStart[index]) {
							animationStart[index] = { isEnded: false, timeout: null }
						}

						if (seenElements.has(elementKeys[index])) {
							if (!animationStart[index].isEnded) {
								animationStart[index].isEnded = true

								visibleIndexes.push(index)

								setTimeout(() => {
									visibleIndexes.length = 0
								}, 120)

								const delay = visibleIndexes.indexOf(index) * 120

								const timeout = setTimeout(() => {
									elements.item[index].classList.add('equipment-content__item--animate')
									elements.text[index].classList.add('equipment-content__text--animate')
									elements.img[index].classList.add('equipment-content__img--animate')
								}, delay)

								animationStart[index].timeout = timeout
							}
						}
					})
				}

				function closeElement(index) {
					if (elements.item[index].classList.contains('equipment-content__item--animate')) {
						elements.text[index].classList.remove('equipment-content__text--open')

						elements.hiddenBox[index].classList.remove('equipment-content__hidden-box--open')
						elements.hiddenBox[index].classList.add('equipment-content__hidden-box--close')

						elements.button[index].classList.remove('equipment-content__button--open')

						elements.img[index].classList.remove('equipment-content__img--open')
						elements.img[index].classList.add('equipment-content__img--close')

						elements.hiddenImg[index].classList.remove('equipment-content__hidden-img--animate')
						elements.hiddenText[index].classList.remove('equipment-content__hidden-text--animate')

						setTimeout(() => {
							if (clickState[index]) {
								clickState[index].isClicked = false
							}

							elements.img[index].classList.remove('equipment-content__img--close')
						}, 700)
					}
				}

				function openHiddenMenu(event) {
					const index = [...elements.button].indexOf(event.target)

					if (index === -1) return

					elements.button.forEach((_, i) => {
						if (!clickState[i]) {
							clickState[i] = { isClicked: false }
						}
					})

					let timeout = null

					if (!clickState[index].isClicked) {
						timeout = setTimeout(() => {
							clickState[index].isClicked = true
						}, 700)

						elements.hiddenBox.forEach((_, i) => {
							if (i !== index) {
								closeElement(i)
							}
						})

						elements.text[index].classList.add('equipment-content__text--open')

						elements.hiddenBox[index].classList.add('equipment-content__hidden-box--open')
						elements.hiddenBox[index].classList.remove('equipment-content__hidden-box--close')

						elements.button[index].classList.add('equipment-content__button--open')

						elements.img[index].classList.add('equipment-content__img--open')
						elements.img[index].classList.remove('equipment-content__img--close')

						elements.hiddenImg[index].classList.add('equipment-content__hidden-img--animate')
						elements.hiddenText[index].classList.add('equipment-content__hidden-text--animate')

						setTimeout(() => {
							elements.button[index].scrollIntoView({ behavior: 'smooth', block: 'center' })
						}, 400)
					} else {
						closeElement(index)

						setTimeout(() => {
							elements.button[index].scrollIntoView({ behavior: 'smooth' })
						}, 400)
					}
				}

				function animate() {
					document.addEventListener('click', openHiddenMenu)

					handleAnimation()
				}

				function reset() {
					elements.item.forEach((_, index) => {
						elements.item[index].classList.remove('equipment-content__item--animate', 'equipment-content__item--scroll-animate')
						elements.text[index].classList.remove('equipment-content__text--animate', 'equipment-content__text--scroll-animate', 'equipment-content__text--open')
						elements.img[index].classList.remove('equipment-content__img--animate', 'equipment-content__img--open', 'equipment-content__img--scroll-animate')
						elements.button[index].classList.remove('equipment-content__button--animate', 'equipment-content__img--scroll-animate', 'equipment-content__button--open')
						elements.hiddenBox[index].classList.remove('equipment-content__hidden-box--open')
						elements.hiddenText[index].classList.remove('equipment-content__hidden-text--animate')
						elements.hiddenImg[index].classList.remove('equipment-content__hidden-img--animate')

						if (animationStart[index]) {
							animationStart[index] = { isEnded: false, timeouts: null }
						}

						if (animationStart[index]?.timeout) {
							clearTimeout(animationStart[index].timeout)
							animationStart[index] = { timeout: null }
						}

						if (clickState[index]) {
							clickState[index].isClicked = false
						}
					})

					document.removeEventListener('click', removeEventListener)
				}

				function scrollAnimate(_, index) {
					elements.item[index].classList.add('equipment-content__item--scroll-animate')
					elements.text[index].classList.add('equipment-content__text--scroll-animate')
					elements.img[index].classList.add('equipment-content__img--scroll-animate')
				}

				function scrollReset(_, index) {
					elements.item[index].classList.remove('equipment-content__item--scroll-animate')
					elements.text[index].classList.remove('equipment-content__text--scroll-animate')
					elements.img[index].classList.remove('equipment-content__img--scroll-animate')
				}

				handleAnimationOnScroll(elements.item, 'equipment-content__item--animate', elementKeys, scrollAnimate, scrollReset)
				createAnimation(ids, elementKeys, startHeight, animate, reset)
			}

			equipmentAnimate()
		}

		equipment()

		function software() {
			function title() {
				const title = document.getElementById('software-title')

				const ids = [title]
				const elementKeys = ['software-title']
				const startHeight = 50

				function animate() {
					title.classList.add('software__title--animate')
				}

				function reset() {
					title.classList.remove('software__title--animate', 'software__title--scroll-animate')
				}

				function scrollAnimate() {
					title.classList.add('software__title--scroll-animate')
				}

				function scrollReset() {
					title.classList.remove('software__title--scroll-animate')
				}

				handleAnimationOnScroll(ids, 'software__title--animate', elementKeys, scrollAnimate, scrollReset)
				createAnimation(ids, elementKeys, startHeight, animate, reset)
			}

			title()

			function softwareAnimate() {
				const queryElements = {
					item: document.querySelectorAll('.software-content__item'),
					text: document.querySelectorAll('.software-content__text'),
					img: document.querySelectorAll('.software-content__img'),
				}

				const ids = []
				const elementKeys = []
				const startingHeight = 0

				const textKeys = []
				const imgKeys = []

				queryElements.item.forEach((_, index) => {
					const elementId = document.getElementById(`software-item-${index}`)

					ids.push(elementId)

					imgKeys.push(`software-content-img-${index}`)
					textKeys.push(`software-content-text-${index}`)
					elementKeys.push(`software-item-${index}`)
				})

				const animationStart = {}
				const visibleIndexes = []

				function animate() {
					queryElements.item.forEach((_, index) => {
						if (!animationStart[index]) {
							animationStart[index] = { isEnded: false, timeout: null }
						}

						if (seenElements.has(elementKeys[index])) {
							if (!animationStart[index].isEnded) {
								animationStart[index].isEnded = true

								visibleIndexes.push(index)

								setTimeout(() => {
									visibleIndexes.length = 0
								}, 400)

								const delay = visibleIndexes.indexOf(index) * 200

								animationStart[index].timeout = setTimeout(() => {
									queryElements.img[index].classList.add('software-content__img--animate')
									queryElements.text[index].classList.add('software-content__text--animate')
								}, delay)
							}
						}
					})
				}

				function reset() {
					queryElements.item.forEach((_, index) => {
						queryElements.img[index].classList.remove('software-content__img--animate', 'software-content__img--scroll-animate')
						queryElements.text[index].classList.remove('software-content__text--animate', 'software-content__text--scroll-animate')

						animationStart[index] = { isEnded: false, timeout: null }

						if (animationStart[index]?.timeout) {
							clearTimeout(animationStart[index].timeout)
							animationStart[index] = { timeout: null }
						}
					})

					visibleIndexes.length = 0
				}

				function scrollTextAnimate(_, index) {
					queryElements.text[index].classList.add('software-content__text--scroll-animate')
				}

				function scrollTextReset(_, index) {
					queryElements.text[index].classList.remove('software-content__text--scroll-animate')
				}

				function scrollImgAnimate(_, index) {
					queryElements.img[index].classList.add('software-content__img--scroll-animate')
				}

				function scrollImgReset(_, index) {
					queryElements.img[index].classList.remove('software-content__img--scroll-animate')
				}

				handleAnimationOnScroll(queryElements.img, 'software-content__img--animate', imgKeys, scrollImgAnimate, scrollImgReset)
				handleAnimationOnScroll(queryElements.text, 'software-content__text--animate', textKeys, scrollTextAnimate, scrollTextReset)
				createAnimation(ids, elementKeys, startingHeight, animate, reset)
			}

			softwareAnimate()
		}

		software()

		function linters() {
			function lineAnimate() {
				const lines = document.querySelectorAll('.uses-line')

				const ids = []
				const elementKeys = []
				const startHeight = 30

				lines.forEach((_, index) => {
					const id = document.getElementById(`uses-line-${index}`)

					ids.push(id)
					elementKeys.push(`uses-line-${index}`)
				})

				function animate() {
					lines.forEach((element, index) => {
						if (seenElements.has(elementKeys[index])) {
							element.classList.add('uses-line--animate')
						}
					})
				}

				function reset() {
					lines.forEach(element => {
						element.classList.remove('uses-line--animate', 'uses-line--scroll-animate')
					})
				}

				function scrollAnimate(element) {
					element.classList.add('uses-line--scroll-animate')
				}

				function scrollReset(element) {
					element.classList.remove('uses-line--scroll-animate')
				}

				handleAnimationOnScroll(lines, 'uses-line--animate', elementKeys, scrollAnimate, scrollReset)
				createAnimation(ids, elementKeys, startHeight, animate, reset)
			}

			lineAnimate()

			function title() {
				const title = document.getElementById('linters-title')

				const ids = [title]
				const elementKeys = ['linters-title']
				const startHeight = 30

				function animate() {
					title.classList.add('linters__title--animate')
				}

				function reset() {
					title.classList.remove('linters__title--animate', 'linters__title--scroll-animate')
				}

				function scrollAnimate() {
					title.classList.add('linters__title--scroll-animate')
				}

				function scrollReset() {
					title.classList.remove('linters__title--scroll-animate')
				}

				handleAnimationOnScroll(ids, 'linters__title--animate', elementKeys, scrollAnimate, scrollReset)
				createAnimation(ids, elementKeys, startHeight, animate, reset)
			}

			title()

			function subtitles() {
				const subtitles = document.querySelectorAll('.linters__subtitle')

				const ids = []
				const elementKeys = []
				const startHeight = 0

				subtitles.forEach((_, index) => {
					const id = document.getElementById(`linters-subtitle-${index}`)

					elementKeys.push(`linters__subtitle-${index}`)

					ids.push(id)
				})

				const timeouts = []
				const animation = {}
				const visibleIndexes = []

				function animate() {
					subtitles.forEach((_, index) => {
						if (seenElements.has(elementKeys[index])) {
							if (!animation[index]) {
								animation[index] = { isAnimated: false }
							}

							if (!animation[index].isAnimated) {
								animation[index].isAnimated = true

								visibleIndexes.push(index)

								setTimeout(() => {
									visibleIndexes.length = 0
								}, 200)

								const delay = visibleIndexes.indexOf(index) * 100

								const timeout = setTimeout(() => {
									subtitles[index].classList.add('linters__subtitle--animate')
								}, delay)

								timeouts.push(timeout)
							}
						}
					})
				}

				function reset() {
					subtitles.forEach((element, index) => {
						element.classList.remove('linters__subtitle--animate', 'linters__subtitle--scroll-animate')

						animation[index] = { isAnimated: false }

						clearTimeout(timeouts[index])
					})

					timeouts.length = 0
				}

				function scrollAnimate(element) {
					element.classList.add('linters__subtitle--scroll-animate')
				}

				function scrollReset(element) {
					element.classList.remove('linters__subtitle--scroll-animate')
				}

				handleAnimationOnScroll(ids, 'linters__subtitle--animate', elementKeys, scrollAnimate, scrollReset)
				createAnimation(ids, elementKeys, startHeight, animate, reset)
			}

			subtitles()

			function settingsTitleAnimate() {
				const subtitle = document.getElementById('settings-linters-subtitle')
				const titleH4 = document.getElementById('settings-linters-h4-title')

				const ids = [subtitle, titleH4]
				const elementKey = ['settings-linters-subtitle', 'settings-linters-h4-title']
				const startHeight = 80

				function animate() {
					subtitle.classList.add('settings-linters__subtitle--animate')
					titleH4.classList.add('settings-linters__h4-title--animate')
				}

				function reset() {
					subtitle.classList.remove('settings-linters__subtitle--animate', 'settings-linters__subtitle--scroll-animate')
					titleH4.classList.remove('settings-linters__h4-title--animate', 'settings-linters__h4-title-scroll--animate')
				}

				function scrollAnimate(element, index) {
					ids[0].classList.add('settings-linters__subtitle--scroll-animate')
					ids[1].classList.add('settings-linters__h4-title-scroll--animate')
				}

				function scrollReset(element, index) {
					ids[0].classList.remove('settings-linters__subtitle--scroll-animate')
					ids[1].classList.remove('settings-linters__h4-title-scroll--animate')
				}

				handleAnimationOnScroll(ids, 'settings-linters__subtitle--animate', elementKey, scrollAnimate, scrollReset)
				createAnimation(ids, elementKey, startHeight, animate, reset)
			}

			settingsTitleAnimate()

			function settingsAnimate() {
				const queryElements = {
					item: document.querySelectorAll('.settings-linters__item'),
					text: document.querySelectorAll('.settings-linters__text'),
					btn: document.querySelectorAll('.settings-linters__btn'),
					img: document.querySelectorAll('.settings-linters__img'),
					hiddenBox: document.querySelectorAll('.settings-linters__hidden-box'),
					hiddenText: document.querySelectorAll('.settings-linters__hidden-text'),
					hiddenBtn: document.querySelectorAll('.settings-linters__hidden-btn'),
					hiddenScrollBtn: document.querySelectorAll('.settings-linters__up-btn'),
				}

				const ids = []
				const elementKeys = []
				const startHeight = 20

				queryElements.item.forEach((_, index) => {
					const id = document.getElementById(`settings-linters-item-${index}`)

					ids.push(id)
					elementKeys.push(`settings-linters-item-${index}`)
				})

				queryElements.hiddenBox.forEach((element, index) => {
					element.classList.add(`settings-linters__hidden-box-${index}`)
				})

				const clickState = {}
				const visibleIndexes = []
				const animationStart = {}

				function handleAnimation() {
					queryElements.item.forEach((_, index) => {
						if (!animationStart[index]) {
							animationStart[index] = { isEnded: false, timeout: null }
						}

						if (seenElements.has(elementKeys[index])) {
							if (!animationStart[index].isEnded) {
								animationStart[index].isEnded = true

								visibleIndexes.push(index)

								setTimeout(() => {
									visibleIndexes.length = 0
								}, 240)

								const delay = visibleIndexes.indexOf(index) * 120

								const timeout = setTimeout(() => {
									queryElements.item[index].classList.add('settings-linters__item--animate')
									queryElements.text[index].classList.add('settings-linters__text--animate')
									queryElements.img[index].classList.add('settings-linters__img--animate')
								}, delay)

								animationStart[index].timeout = timeout
							}
						}
					})
				}

				function handleHiddenBoxOpen(event) {
					const index = [...queryElements.btn].indexOf(event.target)

					if (index === -1) return

					if (!clickState[index]) {
						clickState[index] = { isClicked: false, timeout: null }
					}

					if (index !== -1 && queryElements.btn[index] === event.target) {
						if (!clickState[index].isClicked) {
							clickState[index].timeout = setTimeout(() => {
								clickState[index].isClicked = true
							}, 1000)

							setTimeout(() => {
								queryElements.btn[index].scrollIntoView({ behavior: 'smooth' })
							}, 520)

							queryElements.hiddenBox[index].style.height = `${queryElements.hiddenBox[index].scrollHeight}px`

							queryElements.text[index].classList.add('settings-linters__text--open')
							queryElements.item[index].classList.add('settings-linters__item--open')

							queryElements.hiddenBox[index].classList.add('settings-linters__hidden-box--animate')
							queryElements.btn[index].classList.add('settings-linters__btn--animate')

							queryElements.img[index].classList.remove('settings-linters__img--close')

							queryElements.img[index].classList.add('settings-linters__img--open')
						} else {
							clickState[index].timeout = setTimeout(() => {
								clickState[index].isClicked = false
							}, 1000)

							setTimeout(() => {
								queryElements.btn[index].scrollIntoView({ behavior: 'smooth', block: 'center' })
							}, 500)

							const currentHeight = queryElements.hiddenBox[index].scrollHeight
							queryElements.hiddenBox[index].style.height = `${currentHeight}px`

							queryElements.hiddenBox[index].style.height = '0px'

							queryElements.text[index].classList.remove('settings-linters__text--open')
							queryElements.item[index].classList.remove('settings-linters__item--open')

							queryElements.img[index].classList.remove('settings-linters__img--open')

							queryElements.img[index].classList.add('settings-linters__img--close')

							setTimeout(() => {
								queryElements.img[index].classList.remove('settings-linters__img--close')
							}, 900)

							queryElements.btn[index].classList.remove('settings-linters__btn--animate')
							queryElements.hiddenBox[index].classList.remove('settings-linters__hidden-box--animate')
						}
					}
				}

				function handleCloseBoxOnResize() {
					queryElements.item.forEach((_, index) => {
						queryElements.text[index].classList.remove('settings-linters__text--open')
						queryElements.item[index].classList.remove('settings-linters__item--open')
						queryElements.img[index].classList.remove('settings-linters__img--open')
						queryElements.img[index].classList.add('settings-linters__img--close')
						queryElements.btn[index].classList.remove('settings-linters__btn--animate')
						queryElements.hiddenBox[index].classList.remove('settings-linters__hidden-box--animate')

						setTimeout(() => {
							queryElements.img[index].classList.remove('settings-linters__img--close')
						}, 900)

						queryElements.hiddenBox[index].removeAttribute('style')

						if (clickState[index]?.timeout) {
							clearTimeout(clickState[index].timeout)
						}

						if (clickState[index]) {
							clickState[index] = { isOpen: false, timeout: null }
						}
					})
				}

				function handleScrollUpOnClick(event) {
					const index = [...queryElements.hiddenScrollBtn].indexOf(event.target)

					if (index !== -1 && queryElements.hiddenScrollBtn[index] === event.target) {
						queryElements.btn[index + 1].scrollIntoView({ behavior: 'smooth' })
					}
				}

				function copyText() {
					const btns = [...queryElements.hiddenBtn]
					const texts = [...queryElements.hiddenText]

					let isClicked = false

					function showModalWindow(message) {
						const modalWindow = document.createElement('div')
						modalWindow.className = 'linters__modal-window'
						modalWindow.textContent = message
						document.body.appendChild(modalWindow)

						setTimeout(() => {
							modalWindow.remove()
						}, 2000)
					}

					function cleanText(text) {
						let cleanedText = text.replace(/<\/?[^>]+(>|$)/g, '')
						cleanedText = cleanedText.replace(/\s+/g, ' ').trim()
						return cleanedText
					}

					btns.forEach((element, index) => {
						const newBtn = element.cloneNode(true)

						element.replaceWith(newBtn)

						newBtn.addEventListener('click', () => {
							if (isClicked) return
							isClicked = true

							let textToCopy = texts[index].textContent

							textToCopy = cleanText(textToCopy)

							try {
								const jsonObject = JSON.parse(textToCopy)
								textToCopy = JSON.stringify(jsonObject, null, '\t')
							} catch (error) {
								console.warn('Текст не является валидным JSON:', textToCopy)
							}

							navigator.clipboard
								.writeText(textToCopy)
								.then(() => {
									showModalWindow(!isLanguageRussian ? 'Text Copied' : 'Текст скопирован')
								})
								.catch(err => {
									showModalWindow(!isLanguageRussian ? 'Copy Error' : 'Ошибка копирования')
								})
								.finally(() => {
									setTimeout(() => {
										isClicked = false
									}, 2000)
								})
						})
					})
				}

				function animate() {
					document.addEventListener('click', handleHiddenBoxOpen)
					document.addEventListener('click', handleScrollUpOnClick)
					window.addEventListener('resize', handleCloseBoxOnResize)

					handleAnimation()
					copyText()
				}

				function reset() {
					queryElements.item.forEach((_, index) => {
						queryElements.item[index].classList.remove('settings-linters__item--animate', 'settings-linters__item--scroll-animate')
						queryElements.text[index].classList.remove('settings-linters__text--animate', 'settings-linters__text--open', 'settings-linters__text--scroll-animate')
						queryElements.img[index].classList.remove('settings-linters__img--animate', 'settings-linters__img--close', 'settings-linters__img--open', 'settings-linters__img--scroll-animate')
						queryElements.btn[index].classList.remove('settings-linters__btn--animate')
						queryElements.hiddenBox[index].classList.remove('settings-linters__hidden-box--animate')

						if (animationStart[index]?.timeout) {
							clearTimeout(animationStart[index].timeout)
							animationStart[index].timeout = null
						}

						animationStart[index] = { isEnded: false, timeout: null }

						if (clickState[index]?.timeout) {
							clearTimeout(clickState[index].timeout)
							clickState[index].timeout = 0
						}

						clickState[index] = { isClicked: false, timeout: null }
					})

					visibleIndexes.length = 0

					document.removeEventListener('click', handleHiddenBoxOpen)
					document.removeEventListener('click', handleScrollUpOnClick)
					window.removeEventListener('resize', handleCloseBoxOnResize)
				}

				function scrollAnimate(element, index) {
					element.classList.add('settings-linters__text--scroll-animate')
					queryElements.img[index].classList.add('settings-linters__img--scroll-animate')
					queryElements.item[index].classList.add('settings-linters__item--scroll-animate')
				}

				function scrollReset(element, index) {
					element.classList.remove('settings-linters__text--scroll-animate')
					queryElements.img[index].classList.remove('settings-linters__img--scroll-animate')
					queryElements.item[index].classList.remove('settings-linters__item--scroll-animate')
				}

				handleAnimationOnScroll(queryElements.text, 'settings-linters__text--animate', elementKeys, scrollAnimate, scrollReset)
				createAnimation(ids, elementKeys, startHeight, animate, reset)
			}

			settingsAnimate()

			function pluginsTitleAnimate() {
				const title = document.getElementById('plugins-linters-subtitle')
				const subtitle = document.getElementById('plugins-linters-h4-title')

				const ids = [title, subtitle]
				const elementKeys = ['plugins-linters-subtitle', 'plugins-linters-h4-title']
				const startHeight = 30

				function animate() {
					title.classList.add('plugins-linters__subtitle--animate')
					subtitle.classList.add('plugins-linters__h4-title--animate')
				}

				function reset() {
					title.classList.remove('plugins-linters__subtitle--animate', 'plugins-linters__subtitle--scroll-animate')
					subtitle.classList.remove('plugins-linters__h4-title--animate', 'plugins-linters__h4-title--scroll-animate')
				}

				function scrollAnimate() {
					title.classList.add('plugins-linters__subtitle--scroll-animate')
					subtitle.classList.add('plugins-linters__h4-title--scroll-animate')
				}

				function scrollReset() {
					title.classList.remove('plugins-linters__subtitle--scroll-animate')
					subtitle.classList.remove('plugins-linters__h4-title--scroll-animate')
				}

				handleAnimationOnScroll(ids, 'plugins-linters__subtitle--animate', elementKeys, scrollAnimate, scrollReset)
				createAnimation(ids, elementKeys, startHeight, animate, reset)
			}

			pluginsTitleAnimate()

			function pluginsAnimate() {
				const queryElements = {
					item: document.querySelectorAll('.plugins-linters__item'),
					text: document.querySelectorAll('.plugins-linters__text'),
					btn: document.querySelectorAll('.plugins-linters__btn'),
					img: document.querySelectorAll('.plugins-linters__img'),
					hiddenBox: document.querySelectorAll('.plugins-linters__hidden-box'),
					hiddenText: document.querySelectorAll('.plugins-linters__hidden-text'),
				}

				const ids = []
				const elementKeys = []
				const startHeight = 30

				queryElements.item.forEach((_, index) => {
					const id = document.getElementById(`plugins-linters-item-${index}`)

					ids.push(id)
					elementKeys.push(`plugins-linters-item-${index}`)
				})

				const animationStart = {}
				const visibleIndexes = []

				function handleAnimation() {
					queryElements.item.forEach((_, index) => {
						if (seenElements.has(elementKeys[index])) {
							if (!animationStart[index]) {
								animationStart[index] = { isEnded: false, timeout: null }
							}

							if (!animationStart[index].isEnded) {
								animationStart[index].isEnded = true

								visibleIndexes.push(index)

								setTimeout(() => {
									visibleIndexes.length = 0
								}, 120)

								const delay = visibleIndexes.indexOf(index) * 120

								animationStart[index].timeout = setTimeout(() => {
									queryElements.item[index].classList.add('plugins-linters__item--animate')
									queryElements.text[index].classList.add('plugins-linters__text--animate')
									queryElements.img[index].classList.add('plugins-linters__img--animate')
								}, delay)
							}
						}
					})
				}

				const clickState = {}

				function handleOpenAnimation(event) {
					const index = [...queryElements.btn].indexOf(event.target)

					if (index !== -1 && queryElements.btn[index] === event.target) {
						if (!clickState[index]) {
							clickState[index] = { isOpen: false, timeout: null }
						}

						if (!clickState[index].isOpen) {
							clickState[index].timeout = setTimeout(() => {
								clickState[index].isOpen = true
							}, 1000)

							setTimeout(() => {
								queryElements.hiddenBox[index].scrollIntoView({ behavior: 'smooth', block: 'center' })
							}, 500)

							queryElements.btn[index].classList.add('plugins-linters__btn--open')
							queryElements.text[index].classList.add('plugins-linters__text--open')
							queryElements.img[index].classList.add('plugins-linters__img--open')
							queryElements.item[index].classList.add('plugins-linters__item--open')

							const currentHeight = queryElements.hiddenBox[index].scrollHeight
							queryElements.hiddenBox[index].style.cssText = `
								height: ${currentHeight + 40}px;
								padding: 20px 20px;
							`
						} else {
							clickState[index].timeout = setTimeout(() => {
								clickState[index].isOpen = false
							}, 1000)

							queryElements.item[index].classList.remove('plugins-linters__item--open')
							queryElements.btn[index].classList.remove('plugins-linters__btn--open')
							queryElements.text[index].classList.remove('plugins-linters__text--open')
							queryElements.img[index].classList.remove('plugins-linters__img--open')

							setTimeout(() => {
								queryElements.btn[index].scrollIntoView({ behavior: 'smooth', block: 'center' })
							}, 600)

							queryElements.hiddenBox[index].style.cssText = `
								height: 0px;
								padding: 0 20px;
							`
						}
					}
				}

				function handleCloseBoxOnResize() {
					queryElements.item.forEach((_, index) => {
						queryElements.item[index].classList.remove('plugins-linters__item--open')
						queryElements.btn[index].classList.remove('plugins-linters__btn--open')
						queryElements.text[index].classList.remove('plugins-linters__text--open')
						queryElements.img[index].classList.remove('plugins-linters__img--open')

						queryElements.hiddenBox[index].removeAttribute('style')

						if (clickState[index]?.timeout) {
							clearTimeout(clickState[index].timeout)
						}

						if (clickState[index]) {
							clickState[index] = { isOpen: false, timeout: null }
						}
					})
				}

				function animate() {
					document.addEventListener('click', handleOpenAnimation)
					window.addEventListener('resize', handleCloseBoxOnResize)

					handleAnimation()
				}

				function reset() {
					queryElements.item.forEach((_, index) => {
						queryElements.item[index].classList.remove('plugins-linters__item--animate', 'plugins-linters__item--scroll-animate', 'plugins-linters__item--open')
						queryElements.text[index].classList.remove('plugins-linters__text--animate', 'plugins-linters__text--open', 'plugins-linters__text--scroll-animate')
						queryElements.img[index].classList.remove('plugins-linters__img--animate', 'plugins-linters__img--open', 'plugins-linters__img--scroll-animate')
						queryElements.btn[index].classList.remove('plugins-linters__btn--open')

						queryElements.hiddenBox[index].removeAttribute('style')

						if (animationStart[index]?.timeout) {
							clearTimeout(animationStart[index].timeout)
						}

						if (animationStart[index]) {
							animationStart[index] = { isEnded: false, timeout: null }
						}

						if (clickState[index]?.timeout) {
							clearTimeout(clickState[index].timeout)
						}

						if (clickState[index]) {
							clickState[index] = { isOpen: false, timeout: null }
						}
					})

					visibleIndexes.length = 0

					document.removeEventListener('click', handleOpenAnimation)
					window.removeEventListener('resize', handleCloseBoxOnResize)
				}

				function scrollAnimate(_, index) {
					queryElements.item[index].classList.add('plugins-linters__item--scroll-animate')
					queryElements.text[index].classList.add('plugins-linters__text--scroll-animate')
					queryElements.img[index].classList.add('plugins-linters__img--scroll-animate')
				}

				function scrollReset(_, index) {
					queryElements.item[index].classList.remove('plugins-linters__item--scroll-animate')
					queryElements.text[index].classList.remove('plugins-linters__text--scroll-animate')
					queryElements.img[index].classList.remove('plugins-linters__img--scroll-animate')
				}

				handleAnimationOnScroll(ids, 'plugins-linters__item--animate', elementKeys, scrollAnimate, scrollReset)
				createAnimation(ids, elementKeys, startHeight, animate, reset)
			}

			pluginsAnimate()
		}

		linters()
	}

	function footerEvents() {
		const elements = {
			date: document.getElementById('footer-current-date'),
			name: document.getElementById('footer-my-name'),
			version: document.getElementById('footer-version-text'),
			wrapper: document.getElementById('footer-wrapper'),
			footer: document.getElementById('footer'),
			symbol: document.getElementById('footer-symbol'),
		}

		function setCurrentDate() {
			const date = new Date()
			const options = { year: 'numeric', month: 'long' }
			elements.date.textContent = date.toLocaleString('en-US', options)
		}

		setCurrentDate()

		const handleNameWrite = writeAndResetText(elements.name, 'Bakidjanov Sunnat', null, 50, 'footer-my-name', () => {
			elements.date.classList.add('copyright__date--animate')
		})

		const handleVersionWrite = writeAndResetText(elements.version, 'Version 1.0.0', null, 70, null, null)

		function animateFooter() {
			const ids = [elements.footer]
			const elementKeys = ['footer']
			const startingHeight = 0

			function handleAnimationEnd(event) {
				if (event.animationName === 'footer-wrapper') {
					elements.symbol.classList.add('copyright__symbol--start')

					handleNameWrite.write()

					setTimeout(handleVersionWrite.write, 1100)
				}
			}

			function animate() {
				elements.wrapper.classList.add('footer__wrapper--animate')
				elements.wrapper.addEventListener('animationend', handleAnimationEnd)
			}

			function reset() {
				handleNameWrite.reset()
				handleVersionWrite.reset()
				elements.symbol.classList.remove('copyright__symbol--start')
				elements.wrapper.classList.remove('footer__wrapper--animate')
				elements.date.classList.remove('copyright__date--animate')
			}

			createAnimation(ids, elementKeys, startingHeight, animate, reset)
		}

		animateFooter()
	}

	window.addEventListener('load', () => {
		switchPages()
		handlePageChangeClickAnimation()
		climbUp()
		asideMenu()
		footerEvents()
		homePageEvents()
		usesPageEvents()
		headerEvents()
	})

	window.addEventListener('beforeunload', () => {
		// pageUpdate()
	})
}

main()
