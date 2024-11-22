function main() {
	'use strict'
	const logo = document.getElementById('logo')

	const homePage = document.getElementById('page-1')
	const homePageBtn = document.getElementById('home-page-btn')

	const changeLanguageButton = document.getElementById('translator')

	const tickingState = {}
	const clickState = {}
	const scrollState = {}

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

		const isVisible = rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight - startingHeight || document.documentElement.clientHeight - startingHeight) && rect.right <= (window.innerWidth || document.documentElement.clientWidth)

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

				let transitionPoint = 40
				const interval = setInterval(() => {
					transitionPoint++
					root.style.setProperty('--gradient-transition-point', `${transitionPoint}%`)

					if (transitionPoint >= 100) {
						clearInterval(interval)

						root.classList.remove(...classes)
						root.classList.add(className)

						let returnPoint = 105
						const returnInterval = setInterval(() => {
							returnPoint--
							root.style.setProperty('--gradient-transition-point', `${returnPoint}%`)

							if (returnPoint <= 40) {
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
				en: ['a junior-frontend developer', 'I want to learn a lot. . .', 'HTML is easy!', 'Javascript is my choice!', 'I love CSS animations!', 'HTML, CSS and JS.', 'Coming soon... React!', 'I like cats (=^.^=)', '. . .'],
				ru: ['junior-frontend разработчик', 'Я хочу многому научиться. . .', 'HTML — это просто!', 'JavaScript — мой выбор!', 'Обожаю CSS-анимации!', 'HTML, CSS и JS', 'Скоро. . . React!', 'Я люблю кошек (=^.^=)', '. . .'],
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
			const startHeight = 200

			const handleTextWrite = writeAndResetText(title, 'Progress of my skills . . .', 'Прогресс моих навыков . . .', 50, 'cards-title', null)

			createAnimation(ids, elementKeys, startHeight, handleTextWrite.write, handleTextWrite.reset)
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

			const ids = []
			const elementKeys = []
			const startHeight = 0

			const fluctuateStatus = {}
			const timeouts = []
			const intervals = []
			const animationFrames = []
			const circles = []
			const progressSeenElements = []

			let currentStepIndex = 0
			let handleAnimation = null
			const animationEnd = {}

			let textIndex = 0
			const textSeenElements = []
			const textAnimation = {}
			const textIds = []

			queryElements.container.forEach((_, index) => {
				const id = document.getElementById(`cards-content-${index}`)
				const textId = document.getElementById(`cards-content-inner-text-${index}`)
				const circle = document.getElementById(`cards-content-circle-${index}`)

				elementKeys.push(`cards-content-${index}`, `cards-content-inner-text-${index}`)
				progressSeenElements.push(`cards-content-${index}`)
				textSeenElements.push(`cards-content-inner-text-${index}`)
				circles.push(circle)
				textIds.push(textId)
				ids.push(textId, id)
			})

			function getPrecentCards(circleId, numberId, elementKey, targetPercent, duration, precentChangeTime) {
				const progressCircle = document.getElementById(circleId)
				const percentValue = document.getElementById(numberId)
				const radius = progressCircle.r.baseVal.value
				const circumference = 2 * Math.PI * radius
				const initialOffset = circumference * 0.99

				let intervalFluctuateProgress = null
				fluctuateStatus[elementKey] = { isStart: false }

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

			function animateProgress(stepIndex = currentStepIndex) {
				if (stepIndex >= configProgress.length) return

				const elementsSeen = progressSeenElements[stepIndex]
				if (!seenElements.has(elementsSeen)) return

				if (!animationEnd[stepIndex]) {
					animationEnd[stepIndex] = { nextIndex: false, isEnded: false }
				}

				const { id, className, precent, progressDuration, precentChangeTime } = configProgress[stepIndex]

				const svgBox = queryElements.svgBox[stepIndex]
				const progressText = queryElements.text[stepIndex]
				const container = queryElements.container[stepIndex]

				svgBox.classList.add('cards-content__svg-box--animate')
				progressText.classList.add('cards-content__progress-text--animate')
				container.classList.add(`cards-content__container--${className}-animate`)

				handleAnimation = event => {
					if (event.target === queryElements.svgBox[stepIndex] && event.animationName === 'cards-content-svg-box' && !animationEnd[stepIndex].isEnded) {
						animationEnd[stepIndex].isEnded = true

						getPrecentCards(`cards-content-circle-${id}`, `cards-content-value-${id}`, `cards-content-content-${id}`, precent, progressDuration, precentChangeTime)

						const timeout = setTimeout(() => {
							circles[stepIndex].classList.add(`cards-content__circle--${className}`)
						}, 200)

						timeouts.push(timeout)
					}
				}

				document.removeEventListener('animationend', handleAnimation)
				document.addEventListener('animationend', handleAnimation)

				if (!animationEnd[stepIndex].nextIndex) {
					animationEnd[stepIndex].nextIndex = true

					const timeout = setTimeout(() => {
						currentStepIndex = stepIndex + 1
						animateProgress(currentStepIndex)
					}, 200)

					timeouts.push(timeout)
				}
			}

			function animateTexts(stepIndex = textIndex) {
				if (stepIndex >= queryElements.textBox.length) return

				if (!textAnimation[stepIndex]) {
					textAnimation[stepIndex] = { nextIndex: false, isAnimation: false }
				}

				const { className } = configProgress[stepIndex]

				const elementSeen = textSeenElements[stepIndex]
				if (!seenElements.has(elementSeen)) return

				const textElements = [...textIds[stepIndex].childNodes].filter(node => node.nodeType === 1 && node.classList.contains('cards-content__text'))

				function shuffle(list) {
					for (let i = list.length - 1; i > 0; i--) {
						const j = Math.floor(Math.random() * (i + 1))
						;[list[i], list[j]] = [list[j], list[i]]
					}
				}

				if (!textAnimation[stepIndex].isAnimation) {
					textAnimation[stepIndex].isAnimation = true

					textElements.forEach((element, index) => {
						if (index % 2 === 0) {
							element.classList.add(`cards-content__text--${className}`)
						}
					})

					const shuffleList = textElements
					shuffle(shuffleList)

					shuffleList.forEach((element, index) => {
						const timeout = setTimeout(() => {
							element.classList.add('cards-content__text--animate')
						}, 150 * index)

						timeouts.push(timeout)
					})
				}

				if (!textAnimation[stepIndex].nextIndex) {
					textAnimation[stepIndex].nextIndex = false

					const timeout = setTimeout(() => {
						textIndex = stepIndex + 1
						animateTexts(textIndex)
					}, 200)

					timeouts.push(timeout)
				}
			}

			function resetProgress() {
				currentStepIndex = 0

				queryElements.container.forEach((element, index) => {
					const { className } = configProgress[index]

					animationEnd[index] = { nextIndex: false, isEnded: false }
					fluctuateStatus[index] = { isStart: false }

					element.classList.remove(`cards-content__container--${className}-animate`)
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

			function resetTexts() {
				textIndex = 0

				queryElements.container.forEach((_, index) => {
					textAnimation[index] = { nextIndex: false, isAnimation: false }
				})

				queryElements.textsElements.forEach((element, index) => {
					element.classList.remove('cards-content__text--animate')

					clearTimeout(timeouts[index])
				})

				timeouts.length = 0
			}

			function animate() {
				animateProgress()
				animateTexts()
			}

			function reset() {
				resetProgress()
				resetTexts()
			}

			createAnimation(ids, elementKeys, startHeight, animate, reset)
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
			const startHeight = 130

			let timeout
			let interval

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

				document.addEventListener('animationend', handleAnimationEnd)
			}

			createAnimation(ids, elementKeys, startHeight, animate, reset)
		}

		animateCloud()

		function writeExperienceTitle() {
			const title = document.getElementById('exp-title')

			const ids = [title]
			const elementKeys = ['exp-title']
			const startHeight = 150

			const handleTextWrite = writeAndResetText(title, 'My way. . .', 'Мой путь. . .', 50, 'exp-title', null)

			createAnimation(ids, elementKeys, startHeight, handleTextWrite.write, handleTextWrite.reset)
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
					title.classList.remove('uses-getting__title--animate')
					text.classList.remove('uses-getting__text--animate')
				}

				createAnimation(ids, elementKeys, startHeight, animate, reset)
			}

			titleAnimate()

			function scrollAnimate() {
				const container = document.getElementById('uses-getting-scroll')
				const line = document.getElementById('uses-gettingt-scroll-line')
				const letters = document.querySelectorAll('.uses-getting__scroll-letters')

				let timeouts = []

				const ids = [container]
				const elementKeys = ['uses-getting-scroll']
				const startHeight = 0

				function lettersAnimate() {
					letters.forEach((element, index) => {
						const timeout = setTimeout(
							() => {
								element.classList.add('uses-getting__scroll-letters--animate')
							},
							200 * (index + 1)
						)

						timeouts.push(timeout)
					})
				}

				function letterRemove() {
					timeouts.forEach(timeout => clearTimeout(timeout))
					timeouts = []

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

					line.classList.remove('uses-getting__scroll-line--animate')
				}

				createAnimation(ids, elementKeys, startHeight, animate, reset)
			}

			scrollAnimate()
		}

		gettingAnimate()

		function equipment() {
			function titleWrite() {
				const title = document.getElementById('equipment-title')

				const ids = [title]
				const elementKeys = ['equipment-title']
				const startHeight = 0

				const handleTextWrite = writeAndResetText(title, 'Equipment', 'Оборудование', 80, 'equipment-title', null)

				createAnimation(ids, elementKeys, startHeight, handleTextWrite.write, handleTextWrite.reset)
			}

			titleWrite()

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
				const closeHeight = 0

				const elementsSeen = []
				const timeouts = []

				let timeout = null

				elements.item.forEach((_, index) => {
					const elementId = document.getElementById(`equipment-id-${index}`)
					if (elementId) ids.push(elementId)

					elementKeys.push(`equipment-${index}-item`)
					elementsSeen.push(`equipment-${index}-item`)
				})

				let currentStepIndex = 0

				const animatiosStart = {}
				const clickState = {}

				function handleAnimation(stepIndex = currentStepIndex) {
					if (stepIndex >= elements.item.length) return

					if (!animatiosStart[stepIndex]) {
						animatiosStart[stepIndex] = { isStarted: false }
					}

					if (seenElements.has(elementsSeen[stepIndex]) && !animatiosStart[stepIndex].isStarted) {
						animatiosStart[currentStepIndex].isStarted = true

						elements.button[stepIndex].classList.add('equipment-content__button--animate')
						elements.item[stepIndex].classList.add('equipment-content__item--animate')
						elements.text[stepIndex].classList.add('equipment-content__text--animate')
						elements.img[stepIndex].classList.add('equipment-content__img--animate')

						const timeout = setTimeout(() => {
							currentStepIndex = stepIndex + 1
							handleAnimation(currentStepIndex)
						}, 150)

						timeouts.push(timeout)
					}
				}

				function openHiddenMenu(event) {
					const index = Array.from(elements.button).indexOf(event.target)

					if (!clickState[index]) {
						clickState[index] = { isClicked: false }
					}

					if (index !== -1 && elements.hiddenBox[index]) {
						if (!clickState[index].isClicked) {
							timeout = setTimeout(() => {
								clickState[index].isClicked = true
							}, 700)

							elements.hiddenBox[index].classList.add('equipment-content__hidden-box--open')
							elements.hiddenBox[index].classList.remove('equipment-content__hidden-box--close')

							elements.img[index].classList.add('equipment-content__img--open')

							elements.hiddenImg[index].classList.add('equipment-content__hidden-img--animate')
							elements.hiddenText[index].classList.add('equipment-content__hidden-text--animate')
						} else {
							timeout = setTimeout(() => {
								clickState[index].isClicked = false
							}, 700)

							elements.hiddenBox[index].classList.remove('equipment-content__hidden-box--open')
							elements.hiddenBox[index].classList.add('equipment-content__hidden-box--close')

							elements.img[index].classList.remove('equipment-content__img--open')

							elements.hiddenImg[index].classList.remove('equipment-content__hidden-img--animate')
							elements.hiddenText[index].classList.remove('equipment-content__hidden-text--animate')
						}
					}
				}

				function closeHiddenMenuOnScroll() {
					ids.forEach((element, index) => {
						if (elements.hiddenBox[index].classList.contains('equipment-content__hidden-box--open') && !handleVisibilityChange(element, closeHeight, elementKeys)) {
							elements.hiddenBox[index].classList.add('equipment-content__hidden-box--close')
							elements.hiddenBox[index].classList.remove('equipment-content__hidden-box--open')
							elements.hiddenText[index].classList.remove('equipment-content__hidden-text--animate')
							elements.hiddenImg[index].classList.remove('equipment-content__hidden-img--animate')
							elements.img[index].classList.remove('equipment-content__img--open')

							clearTimeout(timeout)

							if (clickState[index]) {
								clickState[index].isClicked = false
							}
						}
					})
				}

				function animate() {
					document.addEventListener('scroll', closeHiddenMenuOnScroll)

					elements.button.forEach(element => {
						element.addEventListener('click', openHiddenMenu)
					})

					handleAnimation()
				}

				function reset() {
					clearTimeout(timeout)

					elements.item.forEach((_, index) => {
						elements.item[index].classList.remove('equipment-content__item--animate')
						elements.text[index].classList.remove('equipment-content__text--animate')
						elements.img[index].classList.remove('equipment-content__img--animate', 'equipment-content__img--open')
						elements.button[index].classList.remove('equipment-content__button--animate')
						elements.hiddenBox[index].classList.remove('equipment-content__hidden-box--open')
						elements.hiddenText[index].classList.remove('equipment-content__hidden-text--animate')
						elements.hiddenImg[index].classList.remove('equipment-content__hidden-img--animate')

						if (animatiosStart[index]) {
							animatiosStart[index].isStarted = false
						}

						if (clickState[index]) {
							clickState[index].isClicked = false
						}

						clearTimeout(timeouts[index])
					})

					elements.button.forEach(element => {
						element.removeEventListener('click', openHiddenMenu)
					})

					document.removeEventListener('scroll', closeHiddenMenuOnScroll)

					currentStepIndex = 0
					timeouts.length = 0
				}

				createAnimation(ids, elementKeys, startHeight, animate, reset)
			}

			equipmentAnimate()
		}

		equipment()

		function software() {
			function softwareTitleWrite() {
				const title = document.getElementById('software-title')

				const ids = [title]
				const elementKeys = ['software-title']
				const startHeight = 50

				const handleTextWrite = writeAndResetText(title, 'Software', 'Софт', 80, 'software-title', null)

				createAnimation(ids, elementKeys, startHeight, handleTextWrite.write, handleTextWrite.reset)
			}

			softwareTitleWrite()

			function softwareAnimate() {
				const queryElements = {
					item: document.querySelectorAll('.software-content__item'),
					text: document.querySelectorAll('.software-content__text'),
					img: document.querySelectorAll('.software-content__img'),
				}

				const textElements = []
				const texts = ['VSCode', 'Figma', 'PerfectPixel', 'Photoshop', 'Bootstrap']
				const textsElementKeys = []
				const elementSeen = []
				const handleTexts = []
				const timeouts = []
				const timeout = {}
				const textWriten = {}

				const ids = []
				const elementKeys = []
				const startingHeight = 0

				queryElements.item.forEach((_, index) => {
					const elementTextId = document.getElementById(`software-text-${index}`)
					const elementId = document.getElementById(`software-item-${index}`)

					textElements.push(elementTextId)
					textsElementKeys.push(`software-text-${index}`)
					ids.push(elementId)
					elementSeen.push(`software-item-${index}`)
					elementKeys.push(`software-item-${index}`)
				})

				let currentStepIndex = 0

				function contentAnimate(stepIndex = currentStepIndex) {
					if (stepIndex >= queryElements.text.length) return

					if (!textWriten[stepIndex]) {
						textWriten[stepIndex] = { isWriten: false }
					}

					if (seenElements.has(elementSeen[stepIndex]) && !textWriten[stepIndex].isWriten) {
						textWriten[stepIndex].isWriten = true

						const handleTextWrite = writeAndResetText(textElements[stepIndex], texts[stepIndex], null, 80, textsElementKeys[stepIndex], null)

						handleTexts.push(handleTextWrite)
						handleTextWrite.write()

						queryElements.img[stepIndex].classList.add('software-content__img--animate')
						queryElements.text[stepIndex].classList.add('software-content__text--animate')
						timeout[stepIndex] = setTimeout(() => {
							currentStepIndex = stepIndex + 1
							contentAnimate(currentStepIndex)
						}, 400)

						timeouts.push(timeout[stepIndex])
					}
				}

				function animate() {
					contentAnimate()
				}

				function reset() {
					queryElements.item.forEach((_, index) => {
						queryElements.img[index].classList.remove('software-content__img--animate')
						queryElements.text[index].classList.remove('software-content__text--animate')

						clearTimeout(timeout[index])

						if (textWriten[index]) {
							textWriten[index] = { isWriten: false }
						}
					})

					handleTexts.forEach(handleTextWirte => {
						handleTextWirte.reset()
					})

					timeouts.length = 0
					currentStepIndex = 0
				}

				createAnimation(ids, elementKeys, startingHeight, animate, reset)
			}

			softwareAnimate()
		}

		software()

		function linters() {
			function titleAnimate() {
				const title = document.getElementById('linters-title')
				const subBox = document.getElementById('linters-subtitle-box')

				const subtitles = document.querySelectorAll('.linters__subtitle')

				const ids = [title, subBox]
				const elementKeys = ['linters-title', 'linters-subtitle-box']
				const startHeight = 30

				const timeouts = []

				function shuffle(list) {
					for (let i = list.length - 1; i > 0; i--) {
						const j = Math.floor(Math.random() * (i + 1))
						;[list[i], list[j]] = [list[j], list[i]]
					}
				}

				function subtitlesAnimate() {
					const shuffleList = [...subtitles]
					shuffle(shuffleList)

					shuffleList.forEach((element, index) => {
						const timeout = setTimeout(() => {
							element.classList.add('linters__subtitle--animate')
						}, 150 * index)

						timeouts.push(timeout)
					})
				}

				function animate() {
					title.classList.add('linters__title--animate')

					subtitlesAnimate()
				}

				function reset() {
					title.classList.remove('linters__title--animate')

					subtitles.forEach((element, index) => {
						element.classList.remove('linters__subtitle--animate')

						clearTimeout(timeouts[index])
					})

					timeouts.length = 0
					handleTextWirte.reset()
				}

				createAnimation(ids, elementKeys, startHeight, animate, reset)
			}

			titleAnimate()

			function contentAnimate() {
				const subtitle = document.getElementById('settings-linters-subtitle')
				const titleH4 = document.getElementById('settings-linters-h4-title')

				const queryElements = {
					item: document.querySelectorAll('.settings-linters__item'),
					text: document.querySelectorAll('.settings-linters__text'),
					btn: document.querySelectorAll('.settings-linters__btn'),
					img: document.querySelectorAll('.settings-linters__img'),
					hiddenBox: document.querySelectorAll('.settings-linters__hidden-box'),
					textSpan: document.querySelectorAll('.settings-linters__text-span'),
				}

				const ids = [subtitle]
				const elementKey = ['settings-linters-subtitle']
				const startHeight = 100

				const elementSeen = []
				const timeouts = []
				const spanTimeouts = []
				const scrollIds = []
				const animationEnd = {}
				const clickState = {}

				queryElements.item.forEach((_, index) => {
					const id = document.getElementById(`settings-linters-item-${index}`)

					ids.push(id)
					scrollIds.push(id)
					elementKey.push(`settings-linters-item-${index}`)
					elementSeen.push(`settings-linters-item-${index}`)
				})

				queryElements.hiddenBox.forEach((element, index) => {
					element.classList.add(`settings-linters__hidden-box-${index}`)
				})

				let currentStepIndex = 0

				function handleAnimation(stepIndex = currentStepIndex) {
					if (stepIndex >= queryElements.item.length) return

					if (!animationEnd[stepIndex]) {
						animationEnd[stepIndex] = { isEnded: false }
					}

					if (!seenElements.has(elementSeen[stepIndex])) return

					if (!animationEnd[stepIndex].isEnded) {
						animationEnd[stepIndex].isEnded = true

						queryElements.item[stepIndex].classList.add('settings-linters__item--animate')
						queryElements.text[stepIndex].classList.add('settings-linters__text--animate')
						queryElements.img[stepIndex].classList.add('settings-linters__img--animate')

						const timeout = setTimeout(() => {
							currentStepIndex = stepIndex + 1
							handleAnimation(currentStepIndex)
						}, 200)

						timeouts.push(timeout)
					}
				}

				function handleAnimationEnd(event) {
					const index = [...queryElements.hiddenBox].indexOf(event.target)

					if (index === -1) return

					const textSpans = queryElements.hiddenBox[index]?.querySelectorAll('.settings-linters__text-span')

					if (event.animationName === `settings-linters-hidden-box-open-${index}`) {
						textSpans.forEach((element, spanIndex) => {
							const timeout = setTimeout(() => {
								element.classList.add('settings-linters__text-span--animate')
							}, 30 * spanIndex)

							spanTimeouts.push(timeout)
						})
					}

					if (event.animationName === `settings-linters-hidden-box-close-${index}`) {
						textSpans.forEach((element, index) => {
							element.classList.remove('settings-linters__text-span--animate')
							clearTimeout(spanTimeouts[index])
						})
					}
				}

				function handleHiddenBoxOpen(event) {
					const index = [...queryElements.btn].indexOf(event.target)
					let timeout = null

					if (!clickState[index]) {
						clickState[index] = { isClicked: false }
					}

					if (index !== -1 && queryElements.hiddenBox[index]) {
						if (!clickState[index].isClicked) {
							clearTimeout(timeout)
							timeout = setTimeout(() => {
								clickState[index].isClicked = true
							}, 1500)

							queryElements.hiddenBox[index].classList.add('settings-linters__hidden-box--animate')

							queryElements.img[index].classList.remove('settings-linters__img--close')
							queryElements.hiddenBox[index].classList.remove(`settings-linters__hidden-box--close-${index}`)

							queryElements.hiddenBox[index].classList.add(`settings-linters__hidden-box--open-${index}`)
							queryElements.img[index].classList.add('settings-linters__img--open')
						} else {
							clearTimeout(timeout)
							timeout = setTimeout(() => {
								clickState[index].isClicked = false
							}, 1500)

							queryElements.hiddenBox[index].classList.remove(`settings-linters__hidden-box--open-${index}`)
							queryElements.img[index].classList.remove('settings-linters__img--open')

							queryElements.hiddenBox[index].classList.add(`settings-linters__hidden-box--close-${index}`)
							queryElements.img[index].classList.add('settings-linters__img--close')

							queryElements.hiddenBox[index].classList.remove('settings-linters__hidden-box--animate')
						}
					}
				}

				function animate() {
					document.addEventListener('click', handleHiddenBoxOpen)
					document.addEventListener('animationend', handleAnimationEnd)
					handleAnimation()

					subtitle.classList.add('settings-linters__subtitle--animate')
					titleH4.classList.add('settings-linters__h4-title--animate')
				}

				function reset() {
					currentStepIndex = 0

					queryElements.item.forEach((_, index) => {
						queryElements.item[index].classList.remove('settings-linters__item--animate')
						queryElements.text[index].classList.remove('settings-linters__text--animate')
						queryElements.img[index].classList.remove('settings-linters__img--animate', 'settings-linters__img--close', 'settings-linters__img--open')
						queryElements.hiddenBox[index].classList.remove(`settings-linters__hidden-box--close-${index}`, `settings-linters__hidden-box--open-${index}`, 'settings-linters__hidden-box--animate')

						animationEnd[index] = { isEnded: false }
						clickState[index] = { isClicked: false }

						clearTimeout(timeouts[index])
					})

					queryElements.textSpan.forEach(element => {
						element.classList.remove('settings-linters__text-span--animate')
					})

					timeouts.length = 0

					document.removeEventListener('click', handleHiddenBoxOpen)

					subtitle.classList.remove('settings-linters__subtitle--animate')
					titleH4.classList.remove('settings-linters__h4-title--animate')
				}

				createAnimation(ids, elementKey, startHeight, animate, reset)
			}

			contentAnimate()
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
			const startingHeight = -50

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
