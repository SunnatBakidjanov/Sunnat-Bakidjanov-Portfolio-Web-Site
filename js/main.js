function main() {
	'use strict'
	const logo = document.getElementById('logo')

	const changeLanguageButton = document.getElementById('translator')

	const START_PAGE_POSITION = 1
	const START_PAGE_NAME = 'uses'

	const pageIds = {
		'home-page-btn': 'home',
		'uses-page-btn': 'uses',
		'resume-page-btn': 'resume',
		'about-me-page-btn': 'about-me',
		[logo.id]: 'home',
	}

	const clickState = {}
	const scrollState = {}
	const heightValue = {}

	let isAnimationStopped = false
	let isLanguageRussian = false

	const seenElements = new Set()

	function resetAnimations(resetCallback, pageName = START_PAGE_NAME) {
		let currentPage = pageName

		function handleClick(event) {
			const target = event.target
			const targetPage = pageIds[target.id]

			if (!targetPage) return

			if (currentPage === pageName) resetCallback()

			currentPage = targetPage
		}

		document.addEventListener('click', handleClick)
	}

	function removeAnimateClasses(elementsArray, hideElementsArray, pageName = START_PAGE_NAME) {
		let currentPage = pageName

		function handleClick(event) {
			const target = event.target
			const targetPage = pageIds[target.id]

			if (!targetPage) return

			if (pageName === currentPage) {
				if (elementsArray) {
					elementsArray.forEach(element => {
						const classNames = element.classList

						classNames.forEach(className => (className.includes('--animate') ? classNames.remove(className) : null))
					})
				}

				if (hideElementsArray) {
					hideElementsArray.forEach(element => {
						element.childNodes.forEach(node => {
							if (node.nodeType === 1) {
								;[...node.classList].forEach(className => {
									if (className.includes('--animate')) node.classList.remove(className)
								})
							}
						})
					})
				}
			}
		}

		document.addEventListener('click', handleClick)
	}

	function addAnimateClasses(element) {
		const classNames = element.classList
		if (!classNames.contains(`${classNames[0]}--animate`)) classNames.add(`${classNames[0]}--animate`)
	}

	function addAnimateClassesInHideElements(element) {
		const nodes = [...element.childNodes].filter(node => node.nodeType === 1 && node.classList?.contains(`${node.classList[0]}--hide`))

		nodes.forEach(node => {
			if (!node.classList.contains(`${node.classList[0]}--animate`)) node.classList.add(`${node.classList[0]}--animate`)
		})
	}

	function animateVisibleElements(elements, callbackAnimate) {
		const pages = ['page-1', 'page-2', 'page-3', 'page-4']

		function isAnyPageActive() {
			return pages.some(pageId => {
				const pageElement = document.getElementById(pageId)
				return pageElement?.classList.contains('page--active')
			})
		}

		const observer = new IntersectionObserver(
			entries => {
				if (!isAnyPageActive()) return

				entries.forEach(entry => {
					if (entry.isIntersecting) callbackAnimate(entry.target)
				})
			},
			{
				root: null,
				rootMargin: '0px',
				threshold: 1,
			}
		)

		elements.forEach(element => observer.observe(element))
	}

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

		if (document.documentElement.clientWidth > 1150) {
			clickState[elementKey].isClicked = true

			window.requestAnimationFrame(() => {
				if (handleVisibilityChange(element, startingHeight, elementKey)) {
					startCallback(clickState[elementKey].newPage)

					scrollState[elementKey].scrolState = true
				}
			})
		} else {
			const onBurgerAnimationEnd = event => {
				if (event.animationName === 'burger-close') {
					clickState[elementKey].isClicked = true

					if (handleVisibilityChange(element, startingHeight, elementKey)) {
						startCallback(clickState[elementKey].newPage)

						scrollState[elementKey].scrolState = true
					}

					document.removeEventListener('animationend', onBurgerAnimationEnd)
				}
			}

			document.addEventListener('animationend', onBurgerAnimationEnd)

			if (target.id === 'logo') {
				window.requestAnimationFrame(() => {
					if (handleVisibilityChange(element, startingHeight, elementKey)) {
						startCallback(clickState[elementKey].newPage)

						scrollState[elementKey].scrolState = true
					}
				})
			}
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

	function writeAndResetText(elements, englishTexts, russianTexts, typeSpeed, elementKeys, className, delay) {
		const configs = elements.map((element, index) => ({
			element,
			targetString: englishTexts[index],
			letterIndex: 0,
			timeout: null,
			elementKey: elementKeys[index],
		}))

		const writeText = {}

		function handleLanguageChange() {
			configs.forEach((config, index) => {
				if (isLanguageRussian) setRussianText(config, russianTexts[index], className)
				if (!isLanguageRussian) setEnglishText(config, englishTexts[index], className)
			})
		}

		function setRussianText(config, russianText, className) {
			if (!russianText) return
			config.targetString = russianText

			config.element.classList.add('russian-font')
			if (className) config.element.classList.add(className)

			if (seenElements.has(config.elementKey)) {
				reset(config)
				write(config)
			}
		}

		function setEnglishText(config, englishText, className) {
			if (!englishText) return
			config.targetString = englishText

			config.element.classList.remove('russian-font')
			if (className) config.element.classList.remove(className)

			if (seenElements.has(config.elementKey)) {
				reset(config)
				write(config)
			}
		}

		function write(config) {
			config.element.textContent = config.targetString.substring(0, config.letterIndex)

			if (config.letterIndex < config.targetString.length) {
				config.timeout = setTimeout(() => {
					config.letterIndex++
					write(config)
				}, typeSpeed)
			}
		}

		function reset(config) {
			config.letterIndex = 0
			clearTimeout(config.timeout)
			config.element.textContent = ''
		}

		updateLanguageContent(handleLanguageChange)

		return {
			writeAll() {
				configs.forEach((config, index) => {
					if (seenElements.has(config.elementKey)) {
						if (!writeText[index]) {
							writeText[index] = { isWrited: false }
						}

						if (!writeText[index].isWrited) {
							writeText[index].isWrited = true

							reset(config)

							if (delay) {
								config.timeout = setTimeout(() => {
									write(config)
								}, index * delay)
							} else {
								write(config)
							}
						}
					}
				})
			},
			resetAll() {
				configs.forEach((config, index) => {
					if (writeText[index]?.isWrited) {
						writeText[index].isWrited = false
					}

					if (config[index]?.timeout) {
						clearTimeout(config[index].timeout)
					}

					reset(config)
				})
			},
		}
	}

	function sameElementsAnimation(queryElemetns, setIds, classes, startHeight, delay) {
		if (!queryElemetns) {
			console.error(`${queryElemetns} not found`)
			return
		}

		const elements = document.querySelectorAll(queryElemetns)

		const ids = []
		const elementKeys = []
		const startingHeight = startHeight

		const isAnimation = {}
		const visibleIndexes = []

		elements.forEach((element, index) => {
			const setId = `${setIds}-${index}`
			element.setAttribute('id', setId)

			const id = document.getElementById(`${setIds}-${index}`)
			ids.push(id)

			elementKeys.push(`${setIds}-${index}`)
		})

		function animate() {
			elements.forEach((element, index) => {
				if (seenElements.has(elementKeys[index])) {
					if (!isAnimation[index]) {
						isAnimation[index] = { animated: false, timeout: null }
					}

					if (!isAnimation[index].animated) {
						isAnimation[index].animated = true

						if (delay) {
							visibleIndexes.push(index)

							const indexDelay = visibleIndexes.indexOf(index) * delay

							isAnimation[index].timeout = setTimeout(() => {
								element.classList.add(...classes)
							}, indexDelay)
						} else {
							element.classList.add(...classes)
						}
					}
				}
			})
		}

		function reset() {
			elements.forEach((element, index) => {
				if (isAnimation[index]?.animated) {
					isAnimation[index].animated = false
				}

				element.classList.remove(...classes)
			})
		}

		createAnimation(ids, elementKeys, startingHeight, animate, reset)
	}

	function singleElementsAnimation(id, startingHeight, classNames, containerId) {
		if (!id) {
			console.error(`${id} not found`)
			return
		}

		const container = document.getElementById(containerId)
		const element = document.getElementById(id)

		const ids = [element]
		const elementKey = [id, containerId]
		const startHeight = startingHeight

		if (containerId) ids.push(container)

		function animate() {
			element.classList.add(...classNames)
		}

		function reset() {
			element.classList.remove(...classNames)
		}

		createAnimation(ids, elementKey, startHeight, animate, reset)
	}

	function addId(elements, id, startHeight) {
		const ids = []
		const elementKeys = []
		const startingHeight = startHeight

		elements.forEach((element, index) => {
			const setId = `${id}-${index}`
			element.setAttribute('id', setId)

			const addId = document.getElementById(setId)
			elementKeys.push(`${id}-${index}`)

			ids.push(addId)
		})

		return {
			ids,
			elementKeys,
			startingHeight,
		}
	}

	function manageClasses(elements, classNames, singleElementSelector) {
		if (elements && elements.length) {
			elements.forEach(element => {
				element.classList[isLanguageRussian ? 'add' : 'remove'](...classNames)
			})
		}

		if (singleElementSelector) {
			const el = document.querySelector(singleElementSelector)

			if (el) el.classList[isLanguageRussian ? 'add' : 'remove'](...classNames)
		}
	}

	function updateLanguageContent(callback) {
		changeLanguageButton.addEventListener('click', callback)
	}

	function translateText(language, ruClassName) {
		const elements = document.querySelectorAll('[data-ru][data-en]')

		elements.forEach(element => {
			const text = element.dataset[language]
			if (text) element.textContent = text

			element.classList.toggle(ruClassName, language === 'ru')
		})
	}

	function pageUpdate() {
		window.scrollTo(0, 0)
	}

	function climbUp() {
		const button = document.getElementById('climb-up')
		const img = document.getElementById('climb-img')
		const circle = document.getElementById('climb-circle')

		let animationFrameTop = null
		let animationFrameScroll = null
		let isScrolling = false
		let isUserScrolling = false

		const config = {
			scrollSpeed: 20,
			btnVisible: 400,
		}

		function toggleClasses(element, addClasses, removeClasses) {
			element.classList.add(...addClasses)
			element.classList.remove(...removeClasses)
		}

		function handleUserScrollEndAnimation() {
			isUserScrolling = false
			cancelAnimationFrame(animationFrameTop)
			animationFrameTop = null
		}

		function scrollToTop() {
			if (!isUserScrolling) return

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
					button.addEventListener('click', () => {
						isUserScrolling = true
						scrollToTop()
					})
					button.hasEventListener = true
				}

				document.removeEventListener('animationend', handleAnimationEnd)
			} else {
				toggleClasses(img, ['climb-up__img--animate-hide'], ['climb-up__img--animate-show'])
				toggleClasses(circle, ['climb-up__circle--hide'], ['climb-up__circle--show'])
				button.classList.remove('climb-up--show')

				document.addEventListener('animationend', handleAnimationEnd)
			}

			if (scrollY < config.btnVisible && !animationFrameScroll) {
				animationFrameScroll = requestAnimationFrame(handleScroll)
			} else {
				cancelAnimationFrame(animationFrameScroll)
			}

			isScrolling = false
		}

		window.addEventListener('wheel', handleUserScrollEndAnimation)
		window.addEventListener('touchstart', handleUserScrollEndAnimation)

		window.addEventListener('scroll', () => {
			if (!isScrolling) {
				isScrolling = true
				requestAnimationFrame(handleScroll)
			}
		})
	}

	function updateAnimationText() {
		const element = document.getElementById('aside-menu-animation-state')
		const state = isLanguageRussian ? (isAnimationStopped ? 'ВЫКЛ' : 'ВКЛ') : isAnimationStopped ? 'OFF' : 'ON'
		element.textContent = state
	}

	function backgroundColorChange() {
		const root = document.querySelector('.main-page')
		const buttons = document.querySelectorAll('.aside-menu__colors')
		const classes = ['bg-color--1', 'bg-color--2', 'bg-color--3', 'bg-color--4']
		const colors = ['#6dac2f', '#d1b200', '#d35400', '#5dade2']

		const headerLogo = document.getElementById('logo')
		const headerBtns = document.querySelectorAll('.header__btn')
		const hmpMyName = document.getElementById('hmp-getting-name')
		const asideMenuElements = ['.aside-menu__inner', '.aside-menu__inner-btn', '.aside-menu__active']

		const elements = [headerLogo, hmpMyName, headerBtns, asideMenuElements]

		buttons.forEach((element, index) => {
			element.classList.add(`aside-menu__colors--${index}`)
		})

		let isTransitioning = false
		let currentClass = 'bg-color--4'

		function changeGradient(className, color) {
			if (isTransitioning || currentClass === className) return

			isTransitioning = true
			currentClass = className

			let transitionPoint = 30

			function updateTransitionPoint() {
				transitionPoint++
				root.style.setProperty('--gradient-transition-point', `${transitionPoint}%`)

				if (transitionPoint < 100) {
					requestAnimationFrame(updateTransitionPoint)
				} else {
					root.classList.remove(...classes)
					root.classList.add(className)

					elements.forEach(item => {
						if (NodeList.prototype.isPrototypeOf(item)) {
							item.forEach(el => {
								el.style.setProperty('--change-color', color)
							})
						}

						if (Array.isArray(item)) {
							item.forEach(selector => {
								const el = document.querySelector(selector)
								if (!el) return

								el.style.setProperty('--change-color', color)
							})
						}

						if (item instanceof Element) {
							item.style.setProperty('--change-color', color)
						} else {
							return
						}
					})

					let returnPoint = 100

					function returnTransitionPoint() {
						returnPoint--
						root.style.setProperty('--gradient-transition-point', `${returnPoint}%`)

						if (returnPoint > 30) {
							requestAnimationFrame(returnTransitionPoint)
						} else {
							isTransitioning = false
						}
					}

					requestAnimationFrame(returnTransitionPoint)
				}
			}

			requestAnimationFrame(updateTransitionPoint)
		}

		buttons.forEach((button, index) => {
			button.addEventListener('click', event => {
				const target = event.target

				if (!isTransitioning) {
					buttons.forEach(element => element.classList.remove('aside-menu__colors--active'))
					target.classList.add('aside-menu__colors--active')
				}

				const className = classes[index]
				const color = colors[index]
				changeGradient(className, color)
			})
		})
	}

	function asideMenu() {
		const menuElement = document.getElementById('aside-menu')
		const openBtn = document.getElementById('aside-menu-btn')
		const closeBtn = document.getElementById('aside-menu-close')
		const animationBtn = document.getElementById('aside-menu-animation-btn')
		const items = document.querySelectorAll('.aside-menu__item')
		const btns = document.querySelectorAll('.aside-menu__inner-btn')

		items.forEach((element, index) => {
			element.classList.add(`aside-menu__item--${index}`)
			btns[index].classList.add(`aside-menu__inner-btn--${index}`)
		})

		animationBtn.addEventListener('click', () => {
			isAnimationStopped = !isAnimationStopped

			updateAnimationText()
		})

		function manageMenuAnimations() {
			const menuState = { isOpen: false, timeout: null }

			function openMenu() {
				if (menuState.isOpen) return

				clearTimeout(menuState.timeout)
				menuState.timeout = null

				setTimeout(() => {
					menuState.isOpen = !menuState.isOpen
				}, 500)

				menuElement.classList.remove('aside-menu__wrapper--close')
				menuElement.classList.add('aside-menu__wrapper--open')
				openBtn.classList.add('aside-menu__btn--close')

				document.querySelectorAll('.aside-content__item').forEach(element => {
					element.removeAttribute('style')
				})
			}

			function closeMenu() {
				if (!menuState.isOpen) return

				clearTimeout(menuState.timeout)
				menuState.timeout = null

				setTimeout(() => {
					menuState.isOpen = !menuState.isOpen
				}, 500)

				menuElement.classList.remove('aside-menu__wrapper--open')
				menuElement.classList.add('aside-menu__wrapper--close')

				items.forEach((element, index) => {
					element.style.cssText = `
							pointer-events: none;
							width: 0;
							transition: all 0.2s ease;
						`

					btns.forEach(element => (element.style.pointerEvents = 'none'))

					setTimeout(() => {
						element.removeAttribute('style')
						btns[index].removeAttribute('style')
					}, 500)
				})

				openBtn.classList.remove('aside-menu__btn--close')
			}

			items[items.length - 1].addEventListener('touchstart', closeMenu, { passive: true })
			openBtn.addEventListener('click', openMenu)
			closeBtn.addEventListener('click', closeMenu)
		}

		manageMenuAnimations()

		function initializeMenu() {
			openBtn.classList.add('aside-menu__btn--start')
		}

		initializeMenu()
	}

	function headerEvents() {
		function animateHeaderContainer() {
			const container = document.getElementById('header')

			container.classList.add('header__wrapper--animate')
		}

		function burgerMenu() {
			const burgerMenu = document.getElementById('burger-menu')
			const container = document.getElementById('header-nav-container')
			const page = document.getElementById('main-page')

			const lines = document.querySelectorAll('.header__burger-line')
			const items = document.querySelectorAll('.header__item')
			const socialItems = document.querySelectorAll('.header__social-item')

			const elements = [container, burgerMenu, page, ...lines, ...items, ...socialItems]

			const timeouts = []

			const TRANSITION_DURATION = 1000
			const INNER_WIDTH = 1024

			let isOpen = false
			let isWindowResized = false

			function openCloseBurgerMenu() {
				if (!isOpen) {
					timeouts.forEach(element => clearTimeout(element))

					burgerMenu.disabled = true

					const openTimeout = setTimeout(() => {
						isOpen = true
						burgerMenu.disabled = false
					}, TRANSITION_DURATION)

					timeouts.push(openTimeout)

					window.scrollTo(0, 0)

					elements.forEach(element => {
						const classNames = element.classList

						element.classList.add(`${classNames[0]}--open`)

						classNames.forEach(className => {
							if (className.includes('--close')) element.classList.remove(className)
						})
					})
				} else {
					timeouts.forEach(element => clearTimeout(element))

					burgerMenu.disabled = true

					const closeTimeout = setTimeout(() => {
						isOpen = false
						burgerMenu.disabled = false
					}, TRANSITION_DURATION)

					timeouts.push(closeTimeout)

					elements.forEach(element => {
						const classNames = element.classList

						element.classList.add(`${classNames[0]}--close`)

						classNames.forEach(className => (className.includes('--open') ? element.classList.remove(className) : null))

						if (classNames.contains(`${classNames[0]}--close`)) {
							const closeTimeout = setTimeout(() => {
								element.classList.remove(`${classNames[0]}--close`)
							}, TRANSITION_DURATION)

							timeouts.push(closeTimeout)
						}
					})
				}
			}

			function handleChangeOnResize() {
				if (window.innerWidth <= INNER_WIDTH && !isWindowResized) {
					isWindowResized = true

					burgerMenu.addEventListener('click', openCloseBurgerMenu)
				}

				if (window.innerWidth > INNER_WIDTH && isWindowResized) {
					isWindowResized = false

					elements.forEach(element => {
						const classNames = element.classList

						burgerMenu.disabled = false
						isOpen = false

						timeouts.forEach(element => clearTimeout(element))

						classNames.forEach(className => {
							if (className.includes('--open')) element.classList.remove(className)
						})
					})

					burgerMenu.removeEventListener('click', openCloseBurgerMenu)
				}
			}

			if (window.innerWidth <= INNER_WIDTH) burgerMenu.addEventListener('click', openCloseBurgerMenu)

			window.addEventListener('resize', handleChangeOnResize)
		}

		function switchPagesAnimation() {
			const buttons = document.querySelectorAll('.header__btn')
			const lines = document.querySelectorAll('.header__line')
			const pages = document.querySelectorAll('.page')

			function getLines(button) {
				return Array.from(button.childNodes).filter(node => node.nodeType === 1 && node.classList.contains('header__line'))
			}

			function resetButtons(activeIndex) {
				buttons.forEach((button, index) => {
					button.disabled = index === activeIndex
					button.classList.toggle('header__btn--active', index === activeIndex)
				})

				pages.forEach((page, index) => page.classList.toggle('page--active', index === activeIndex))

				lines.forEach(line => line.classList.remove('header__line--active'))
				getLines(buttons[activeIndex]).forEach(line => line.classList.add('header__line--active'))

				logo.disabled = activeIndex === 0
			}

			function startPosition() {
				const VALIDATED_POSITION = Math.max(0, Math.min(buttons.length - 1, START_PAGE_POSITION))

				resetButtons(VALIDATED_POSITION)
			}

			function handleLogoClick(event) {
				if (event.target !== logo) return
				resetButtons(0)
			}

			function handleBtnClick(event) {
				const index = [...buttons].indexOf(event.target)
				if (index === -1) return
				resetButtons(index)
			}

			startPosition()
			document.addEventListener('click', handleBtnClick)
			logo.addEventListener('click', handleLogoClick)
		}

		animateHeaderContainer()
		burgerMenu()
		switchPagesAnimation()
	}

	function homePageEvents() {
		function animateHomePageElements() {
			const titles = document.querySelectorAll('.hmp-titles')
			const lines = document.querySelectorAll('.hmp-line')

			const gettingTitle = document.getElementById('hmp-getting-hidden-title')
			const gittingBlink = document.getElementById('hmp-getting-group-text')
			const gettingTextGroup = document.getElementById('hmp-getting-group-text')
			const logo3dFront = document.getElementById('hmp-getting-front')
			const scrollLine = document.getElementById('hmp-scroll-line')
			const scrollText = document.getElementById('hmp-scroll-text')
			const progreessBoxes = document.querySelectorAll('.hmp-cards__inner-progress')
			const cardsContainer = document.querySelectorAll('.hmp-cards__container')
			const projectsText = document.getElementById('hmp-projects-hidden-text')
			const cloud = document.getElementById('hmp-cloud-particle-center')
			const myWayContainer = document.getElementById('hmp-way-inner-content')
			const hmpWaybtn = document.getElementById('hmp-way-btn')

			const elements = [...titles, ...cardsContainer, scrollLine, myWayContainer, hmpWaybtn, ...lines]
			const hideElements = [gittingBlink, gettingTitle, logo3dFront, gettingTextGroup, projectsText, cloud, scrollText, ...progreessBoxes]

			animateVisibleElements(elements, addAnimateClasses)
			animateVisibleElements(hideElements, addAnimateClassesInHideElements)
			removeAnimateClasses(elements, hideElements, 'home')
		}

		function writeAndResetSkilsText() {
			const text = document.getElementById('hmp-getting-text')
			const blink = document.getElementById('hmp-getting-blink')

			const texts = {
				en: [
					`I'm frontend developer`,
					'I want to learn a lot. . .',
					'HTML is easy!',
					'Javascript is my choice!',
					'I love CSS animations!',
					'Making magic in the browser!',
					'Programming reality in JS',
					'Frontend is my superpower!',
					'Code and get inspired!',
					'Coming soon... React!',
				],
				ru: [
					'Я фронтенд разработчик',
					'Я хочу многому научиться. . .',
					'HTML — это просто!',
					'JavaScript — мой выбор!',
					'Обожаю CSS-анимации!',
					'Создаю магию в браузере!',
					'Программирую реальность на JS',
					'Фронтенд — это моя суперсила!',
					'Кодить и вдохновляться!',
					'Скоро. . . React!',
				],
			}

			let textIndex = Math.floor(Math.random() * (!isLanguageRussian ? texts.en.length : texts.ru.length))
			let letterIndex = 0
			let timeout = null
			let observer = null

			let blinkHasAnimated = false
			let isLogged = false
			let isHidden = false

			let state = 'writing'

			const cfg = {
				typeSpeed: 70,
				deleteSpeed: 60,
				startWrite: 1400,
				delayDeleteString: 2200,
				delayWriteNextString: 1500,
			}

			function stopAnimationIsOutVisability() {
				if (observer) return

				observer = new IntersectionObserver(
					entries => {
						const entry = entries[0]

						if (entry.isIntersecting) {
							if (isHidden && state === 'nextString') {
								isHidden = false
								startTyping()
							}
						} else {
							isHidden = true
						}
					},
					{
						root: null,
						rootMargin: '0px',
						threshold: 1,
					}
				)

				observer.observe(blink)
			}

			function startTyping() {
				if (isHidden && state === 'nextString') return

				let currentText = isLanguageRussian ? texts.ru[textIndex] : texts.en[textIndex]
				text.textContent = currentText.substring(0, letterIndex)

				clearTimeout(timeout)

				switch (state) {
					case 'writing':
						if (letterIndex >= currentText.length) state = 'waiting'

						letterIndex++
						timeout = setTimeout(() => {
							startTyping()
						}, cfg.typeSpeed)
						break

					case 'waiting':
						let currentLetterIndex = (letterIndex = currentText.length)
						text.textContent = currentText.substring(0, currentLetterIndex)

						timeout = setTimeout(() => {
							state = 'deleting'
							startTyping()
						}, cfg.delayDeleteString)
						break

					case 'deleting':
						if (letterIndex <= 0) state = 'nextString'

						letterIndex--
						timeout = setTimeout(() => {
							startTyping()
						}, cfg.deleteSpeed)
						break

					case 'nextString':
						timeout = setTimeout(() => {
							textIndex = (textIndex + 1) % (isLanguageRussian ? texts.ru.length : texts.en.length)
							state = 'writing'
							startTyping()
						}, cfg.delayWriteNextString)
						break

					default:
						if (!isLogged) console.error(`Неизвестное состояние: ${state}.`)
						isLogged = true

						state = 'writing'
						startTyping()
						break
				}
			}

			updateLanguageContent(startTyping)

			function handleBlinkAnimation(event) {
				if (event.animationName === 'hmp-getting-blink-start') timeout = setTimeout(startTyping, cfg.startWrite)

				stopAnimationIsOutVisability()
			}

			function animate() {
				if (blinkHasAnimated) return

				document.addEventListener('animationend', handleBlinkAnimation)

				blinkHasAnimated = true
			}

			function reset() {
				state = 'writing'
				blinkHasAnimated = false
				clearTimeout(timeout)
				text.textContent = ''
				letterIndex = 0
				textIndex = (textIndex + 1) % (isLanguageRussian ? texts.ru.length : texts.en.length)

				if (observer) {
					observer.unobserve(blink)
					observer = null
				}

				document.removeEventListener('animationend', handleBlinkAnimation)
			}

			animateVisibleElements([blink], animate)
			resetAnimations(reset, 'home')
		}

		function logoAnimate() {
			const line = document.querySelector('.hmp-getting__line-left')
			const shadow = document.getElementById('hmp-getting-shadow')
			const front = document.getElementById('hmp-getting-front')
			const container = document.getElementById('hmp-getting-preverve')
			const img = document.getElementById('hmp-getting-img')

			const elements = [line, shadow, front, container, img]

			function handleTransitionEnd(event) {
				if (event.propertyName === 'height') {
					shadow.classList.add(`${shadow.classList[0]}--animate`)
					img.classList.add(`${img.classList[0]}--animate`)
					container.classList.add(`${container.classList[0]}--animate`)
					front.classList.add(`${front.classList[0]}--animate`)
				}
			}

			function animate() {
				line.addEventListener('transitionend', handleTransitionEnd)
			}

			function reset() {
				line.removeEventListener('transitionend', handleTransitionEnd)

				elements.forEach(element => {
					const classNames = element.classList

					classNames.forEach(className => {
						if (className.includes('--animate')) classNames.remove(className)
					})
				})
			}

			resetAnimations(reset, 'home')
			animateVisibleElements([front], animate)
		}

		function animateCards() {
			const configProgress = [
				{ id: 0, className: 'html', precent: 70, progressDuration: 6000, precentChangeTime: 2000 },
				{ id: 1, className: 'css', precent: 80, progressDuration: 7500, precentChangeTime: 2200 },
				{ id: 2, className: 'js', precent: 40, progressDuration: 4000, precentChangeTime: 2400 },
				{ id: 3, className: 'react', precent: 10, progressDuration: 2000, precentChangeTime: 2600 },
			]

			const DISH_OFFSET_VALUE = 439.823

			const conteiners = document.querySelectorAll('.hmp-cards__container')
			const svgBoxes = document.querySelectorAll('.hmp-cards__svg-box')
			const values = document.querySelectorAll('.hmp-cards__value')
			const textBoxes = document.querySelectorAll('.hmp-cards__inner-text')
			const progressBoxes = document.querySelectorAll('.hmp-cards__inner-progress')

			const isAnimated = {}

			function animateProgress() {
				const circles = []
				const intervals = []
				const animationFrames = []

				conteiners.forEach((_, index) => {
					progressBoxes[index].setAttribute('id', `hmp-cards-inner-progress-${index}`)
					values[index].setAttribute('id', `hmp-cards-value-${index}`)

					const circle = document.getElementById(`hmp-cards-circle-${index}`)

					circles.push(circle)
				})

				const processElements = new Set()

				function getPrecentCards(circleId, numberId, targetPercent, duration, precentChangeTime) {
					if (processElements.has(circleId)) return
					processElements.add(circleId)

					const progressCircle = document.getElementById(circleId)
					const percentValue = document.getElementById(numberId)
					const radius = progressCircle.r.baseVal.value
					const circumference = 2 * Math.PI * radius
					const initialOffset = circumference * 0.99

					let intervalFluctuateProgress = null

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
							} else {
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

				function animate(index) {
					if (!isAnimated[index]) isAnimated[index] = { animate: false }
					if (isAnimated[index].animate) return

					conteiners[index].classList.add(`${conteiners[index].classList[0]}-${configProgress[index].className}--animate`)

					const onAnimationEnd = () => {
						circles[index].classList.add(`${circles[index].classList[0]}--${configProgress[index].className}`)
						getPrecentCards(`hmp-cards-circle-${index}`, `hmp-cards-value-${index}`, configProgress[index].precent, configProgress[index].progressDuration, configProgress[index].precentChangeTime)

						svgBoxes[index].removeEventListener('animationend', onAnimationEnd)
					}

					svgBoxes[index].addEventListener('animationend', onAnimationEnd)

					isAnimated[index].animate = true
				}

				function reset() {
					svgBoxes.forEach((_, index) => (values[index].textContent = 0))

					intervals.forEach(interval => clearInterval(interval))
					animationFrames.forEach(frame => cancelAnimationFrame(frame))
					svgBoxes.forEach((_, index) => {
						if (!isAnimated[index]) isAnimated[index] = {}
						isAnimated[index].animate = false
					})
					circles.forEach(circle => (circle.style.strokeDashoffset = DISH_OFFSET_VALUE))

					processElements.clear()

					animationFrames.length = 0
					intervals.length = 0
				}

				svgBoxes.forEach((box, index) => {
					animateVisibleElements([box], () => animate(index))
				})
				resetAnimations(reset, 'home')
			}

			animateProgress()

			function animateTexts() {
				textBoxes.forEach((box, boxIndex) => {
					const texts = [...box.childNodes].filter(node => node.nodeType === 1 && node.classList.contains('hmp-cards__text'))

					texts.forEach((text, index) => {
						if (index % 2 !== 0) text.classList.add(`${text.classList[0]}--${configProgress[boxIndex].className}`)

						animateVisibleElements([text], addAnimateClasses)
						removeAnimateClasses([text], null, 'home')
					})
				})
			}

			animateTexts()
		}

		function animateCloud() {
			const container = document.getElementById('hmp-cloud-container')
			const cloud = document.getElementById('hmp-cloud-particle-center')
			const cloudTop = document.getElementById('hmp-cloud-partilce-top')
			const cloudBottom = document.getElementById('hmp-cloud-bottom')

			let interval = null
			let observer = null

			const DROP_INTERVAL_TIMER = 50

			function rain() {
				const element = document.createElement('div')
				const position = Math.floor(Math.random() * (cloud.offsetWidth - 60) + 35)
				const width = Math.random() * 5
				const height = Math.random() * 50

				element.classList.add('hmp-projects__drop')
				element.style.left = `${position}px`
				element.style.width = `${0.5 * width}px`
				element.style.height = `${0.5 * height}px`

				cloud.appendChild(element)

				element.addEventListener('animationend', event => {
					if (event.animationName === 'cloud-drop') handleDropAnimationEnd(event, element)
				})
			}

			function setupIntersectionObserver() {
				if (observer) return

				observer = new IntersectionObserver(
					([entry]) => {
						if (entry.isIntersecting && cloudBottom.classList.contains('hmp-projects__bottom--animate')) {
							if (!interval) {
								interval = setInterval(rain, DROP_INTERVAL_TIMER)
							}
						} else {
							clearInterval(interval)
							interval = null
						}
					},
					{
						root: null,
						rootMargin: '0px 0px 200px 0px',
						threshold: 1,
					}
				)

				observer.observe(container)
			}

			const handleAnimationEnd = event => {
				const { animationName } = event

				if (animationName === 'cloud-partilce-center-start') {
					cloudTop.classList.add('hmp-projects__particle-top--animate')
					container.classList.add('hmp-projects__inner-cloud--animate')
					cloudBottom.classList.add('hmp-projects__bottom--animate')
				}

				if (animationName === 'cloud-particle-top-start') setupIntersectionObserver()
			}

			const handleDropAnimationEnd = (event, element) => {
				if (event.animationName === 'cloud-drop') {
					element.remove()
					element.removeEventListener('animationend', handleDropAnimationEnd)
				}
			}

			function animate() {
				document.addEventListener('animationend', handleAnimationEnd)
			}

			function reset() {
				cloudTop.classList.remove('hmp-projects__particle-top--animate')
				container.classList.remove('hmp-projects__inner-cloud--animate')
				cloudBottom.classList.remove('hmp-projects__bottom--animate')

				if (interval) {
					clearInterval(interval)
					interval = null
				}

				if (observer) {
					observer.unobserve(container)
					observer.disconnect()
					observer = null
				}

				const drops = [...cloud.childNodes].filter(node => node.nodeType === 1 && node.classList.contains('hmp-projects__drop'))
				drops.forEach(element => {
					element.remove()
				})
			}

			animateVisibleElements([cloud], animate)
			resetAnimations(reset, 'home')
		}

		function myWayAnimate() {
			const container = document.getElementById('hmp-way-inner-content')
			const blink = document.getElementById('hmp-way-blink')
			const btn = document.getElementById('hmp-way-btn')
			const btnShow = document.getElementById('hmp-way-btn-show')
			const btnAgain = document.getElementById('hmp-way-btn-again')

			const ru = [
				'[ 22.06.2023 ]',
				'Узнал о веб-разработке. Загорелся этой темой и решил изучать её!',
				'[ 30.09.2023 ]',
				'Изучил основы HTML и CSS. Создал свои первые статические страницы.',
				'[ 02.04.2024 ]',
				'Начал изучать JavaScript. Понял, как добавить интерактивность на сайты.',
				'[ 20.12.2024 ]',
				'Осваиваю JavaScript глубже и готовлюсь изучать React. Впереди - создание сложных веб-приложений!',
				'[ 13.01.2025 ]',
				'Приступил к изучению React. Открываю для себя мир компонентов и состояний!',
			]

			const en = [
				'[ 22.06.2023 ]',
				'Learned about web development. I got excited about this topic and decided to study it!',
				'[ 30.09.2023 ]',
				'Learned the basics of HTML and CSS. Created my first static pages.',
				'[ 02.04.2024 ]',
				'Started learning JavaScript. I understood how to add interactivity to websites.',
				'[ 20.12.2024 ]',
				`I'm learning JavaScript more deeply and getting ready to learn React. Ahead - creating complex web applications!`,
				'[ 13.01.2025 ]',
				'Started learning React. Discovering the world of components and states!',
			]

			let letterIndex = 0
			let currentIndex = 0

			let timeout = null
			let observer = null

			let isLogged = false
			let isHidden = false
			let isTextShowed = false

			const textBoxes = []
			const textElements = []

			let state = 'writing'

			const cfg = {
				startDelay: 500,
				getNextStringDelay: () => Math.round(Math.random() * 1000) + 500,
				getWriteSpeed: () => Math.round(Math.random() * 50) + 30,
			}

			function createBox() {
				const box = document.createElement('div')
				box.classList.add('hmp-way__text-box')
				container.appendChild(box)

				const textElement = document.createElement('span')
				textElement.classList.add('hmp-way__text')
				box.appendChild(textElement)
				box.appendChild(blink)
				textBoxes.push(box)
				textElements.push(textElement)
			}

			function nextString() {
				createBox()
				blink.classList.remove('hmp-way__blink--write')
				currentIndex++
				letterIndex = 0
			}

			function resetContent() {
				container.innerHTML = ''
				letterIndex = 0
				currentIndex = 0
				container.appendChild(blink)
				textElements.length = 0
			}

			function startTyping() {
				const currentText = !isLanguageRussian ? en[currentIndex] : ru[currentIndex]
				textElements[currentIndex].textContent = currentText.substring(0, letterIndex)

				if (isTextShowed) return
				if (isHidden && currentText.length <= letterIndex) {
					state = 'waiting'
					return
				}

				clearTimeout(timeout)

				if (currentText.includes('[')) textElements[currentIndex].classList.add(`${textElements[currentIndex].classList[0]}--date`)

				switch (state) {
					case 'writing':
						timeout = setTimeout(() => {
							if (letterIndex >= currentText.length) state = 'nextString'
							if (letterIndex >= 1) blink.classList.add('hmp-way__blink--write')

							letterIndex++
							startTyping()
						}, cfg.getWriteSpeed())
						break

					case 'waiting':
						timeout = setTimeout(() => {
							state = 'writing'
							startTyping()
						}, cfg.startDelay)
						break

					case 'nextString':
						if (currentIndex >= (!isLanguageRussian ? en.length - 1 : ru.length - 1)) {
							isTextShowed = !isTextShowed
							btnAgain.classList.toggle('hmp-way__btn-again--show-agian')
							btnShow.classList.toggle('hmp-way__btn-show--hide-show')
							return
						}

						nextString()

						timeout = setTimeout(() => {
							state = 'writing'
							startTyping()
						}, cfg.getNextStringDelay())
						break

					default:
						if (!isLogged) console.error(`Неизвестное состояние: ${state}.`)
						isLogged = true

						timeout = setTimeout(() => {
							if (letterIndex >= currentText.length) state = 'waiting'
							if (letterIndex >= 1) blink.classList.add('hmp-way__blink--write')

							letterIndex++
							startTyping()
						}, cfg.getWriteSpeed())
						break
				}
			}

			function handleLanguageChange() {
				let currentLanguage = isLanguageRussian ? ru : en

				textElements.forEach((textElement, index) => {
					const currentText = textElement.textContent.trim()
					const targetText = currentLanguage[index]

					if (currentText === (!isLanguageRussian ? ru[index] : en[index])) textElement.textContent = targetText
				})
			}

			function stopAnimationIsOutVisability() {
				if (observer) return

				observer = new IntersectionObserver(entries => {
					const entry = entries[0]

					if (entry.isIntersecting && !isTextShowed) {
						if (isHidden && state === 'waiting') {
							nextString()
							startTyping()
						}
						isHidden = false
					} else {
						isHidden = true
					}
				})

				observer.observe(container)
			}

			function handleAnimationEnd(event) {
				if (event.animationName === 'my-way-container') {
					timeout = setTimeout(() => {
						createBox()
						startTyping()
						stopAnimationIsOutVisability()
					}, cfg.startDelay)
				}
			}

			function handleShowTextOnClick() {
				const currentText = isLanguageRussian ? ru : en

				btn.disabled = true
				setTimeout(() => (btn.disabled = false), 500)
				isTextShowed = !isTextShowed

				btnAgain.classList.toggle('hmp-way__btn-again--show-agian', isTextShowed)
				btnShow.classList.toggle('hmp-way__btn-show--hide-show', isTextShowed)
				blink.classList.toggle('hmp-way__blink--write', isTextShowed)

				if (isTextShowed) {
					clearTimeout(timeout)
					state = 'waiting'

					const missingElements = currentText.length - textElements.length

					for (let i = 0; i < missingElements; i++) {
						createBox()
					}

					setTimeout(() => {
						btn.scrollIntoView({ behavior: 'smooth', block: 'end' })
					}, 200)

					currentText.forEach((text, index) => {
						if (currentText.length >= textElements.length) {
							if (text.includes('[')) textElements[index].classList.add(`${textElements[index].classList[0]}--date`)
							textElements[index].textContent = text
						}
					})

					return
				}

				resetContent()
				createBox()
				state = 'writing'
				setTimeout(() => {
					startTyping()
				}, cfg.startDelay)
			}

			function animate() {
				document.addEventListener('animationend', handleAnimationEnd)
			}

			function reset() {
				document.removeEventListener('animationend', handleAnimationEnd)

				state = 'writing'
				isTextShowed = false
				btnAgain.classList.remove('hmp-way__btn-again--show-agian')
				btnShow.classList.remove('hmp-way__btn-show--hide-show')
				blink.classList.remove('hmp-way__blink--write')
				resetContent()

				if (timeout) {
					clearTimeout(timeout)
					timeout = null
				}

				if (observer) {
					observer.unobserve(container)
					observer = null
				}
			}

			btn.addEventListener('click', handleShowTextOnClick)
			updateLanguageContent(handleLanguageChange)
			resetAnimations(reset, 'home')
			animateVisibleElements([container], animate)
		}

		animateCloud()
		animateCards()
		logoAnimate()
		writeAndResetSkilsText()
		animateHomePageElements()
		myWayAnimate()
	}

	function usesPageEvents() {
		function animateUsesPageElements() {
			const mainTitle = document.getElementById('uses-getting-title')
			const mainSubtitle = document.getElementById('uses-getting-subtitle')
			const gear = document.getElementById('uses-gear')
			const scrollLine = document.getElementById('uses-scroll-line')
			const scrollText = document.getElementById('uses-scroll-text')

			const elements = [mainTitle, scrollLine]
			const hideElements = [mainSubtitle, scrollText, gear]

			animateVisibleElements(elements, addAnimateClasses)
			animateVisibleElements(hideElements, addAnimateClassesInHideElements)
			removeAnimateClasses(elements, hideElements, 'home')
		}

		animateUsesPageElements()

		const texts = document.querySelectorAll('.uses-text')
		const img = document.querySelectorAll('.uses-img')

		const copyBtn = document.querySelectorAll('.uses-linters__copy-btn')
		const code = document.querySelectorAll('.uses-linters__code')

		let isModalVisible = false

		singleElementsAnimation('uses-linters-settings-title', 70, ['uses-linters__settings-title--animate'], null)
		singleElementsAnimation('uses-linters-settings-subtitle', 40, ['uses-linters__settings-subtitle--animate'], null)

		sameElementsAnimation('.uses-title', 'uses-title', ['uses-title--animate'], 50, null)
		sameElementsAnimation('.uses-btn', 'uses-btn', ['uses-btn--animate'], 50, null)
		sameElementsAnimation('.uses-img', 'uses-img', ['uses-img--animate'], 60, null)
		sameElementsAnimation('.uses-hide-group', 'uses-hide-group', ['uses-hide-group--animate'], 50, null)
		sameElementsAnimation('.uses-software__img', 'uses-software-img', ['uses-software__img--animate'], 110, 50)
		sameElementsAnimation('.uses-software__text', 'uses-software-text', ['uses-software__text--animate'], 40, 50)
		sameElementsAnimation('.uses-linters__task', 'uses-linters-task', ['uses-linters__task--animate'], 50, 100)

		function scrollText() {
			const container = document.getElementById('uses-scroll-text')
			const letters = document.querySelectorAll('.uses-scroll__letter')

			const ids = [container]
			const elementKeys = ['uses-scroll-text']
			const startHeight = 0

			const timeouts = []

			function animate() {
				letters.forEach((element, index) => {
					const timeout = setTimeout(() => {
						element.classList.add('uses-scroll__letter--animate')
					}, 60 * index)

					timeouts.push(timeout)
				})
			}

			function reset() {
				letters.forEach((element, index) => {
					element.classList.remove('uses-scroll__letter--animate')

					clearTimeout(timeouts[index])
				})

				timeouts.length = 0
			}

			createAnimation(ids, elementKeys, startHeight, animate, reset)
		}

		scrollText()

		function btnsAnimate() {
			const hideEquipmentElement = document.querySelectorAll('.uses-equipment__hidden-group')
			const equipmentBtn = document.querySelectorAll('.uses-equipment__button')
			const equipmantImg = document.querySelectorAll('.uses-equipment__img')

			const hideLinterElement = document.querySelectorAll('.uses-linters__hide-group')
			const linterBtn = document.querySelectorAll('.uses-linters__btn')
			const linterImg = document.querySelectorAll('.uses-linters__img')
			const linterCode = document.querySelectorAll('.uses-linters__code')

			const climbUpBtn = document.querySelectorAll('.uses-linters__up-btn')

			const isLinterOpen = Array.from({ length: hideLinterElement.length }, () => ({
				isOpen: false,
				timeout: null,
				codeTimeout: null,
			}))

			const setId = addId(texts, 'uses-text', 60)

			const en = ['Monitor', 'PC Case', 'Chair', 'Desk', 'Keyboard', 'Mouse', 'Webcam', 'Microphone', 'Prettier', 'ESLint', 'Stylelint', 'Settings.json']
			const ru = ['Монитор', 'ПК Кейс', 'Кресло', 'Стол', 'Клавиатура', 'Мышь', 'Веб-камера', 'Микрофон', 'Prettier', 'ESLint', 'Stylelint', 'Settings.json']

			const handleTextWrite = writeAndResetText(setId.ids, en, ru, 80, setId.elementKeys, ['uses-text--rus-lang'], null)

			function openHiddenEquipmentOnClick(event) {
				const index = [...equipmentBtn].indexOf(event.target)

				if (index === -1) return

				const element = hideEquipmentElement[index]
				const images = equipmantImg[index]
				const isOpen = element.classList.contains('uses-equipment__hidden-group--open')

				equipmantImg.forEach(imgElement => imgElement.classList.remove('uses-img--open'))
				hideEquipmentElement.forEach(el => el.classList.remove('uses-equipment__hidden-group--open'))

				if (!isOpen) {
					element.classList.add('uses-equipment__hidden-group--open')
					images.classList.add('uses-img--open')
				}
			}

			function openHiddenLinterOnClick(event) {
				const index = [...linterBtn].indexOf(event.target)

				if (index === -1) return

				const element = hideLinterElement[index]
				const images = linterImg[index]
				const state = isLinterOpen[index]

				const transitionDuration = Math.max(0.5, Math.min(element.scrollHeight / 1500, 1.5))
				element.style.transition = `height ${transitionDuration}s ease-out`

				state.isOpen = !state.isOpen
				images.classList.toggle('uses-img--open')

				if (!state.isOpen) {
					clearTimeout(state.timeout)
					clearTimeout(state.codeTimeout)

					linterCode[index].removeAttribute('style')
					element.style.height = 0
				} else {
					element.style.height = `${element.scrollHeight}px`

					state.timeout = setTimeout(() => {
						linterBtn[index].scrollIntoView({ behavior: 'smooth', block: 'start' })
					}, 600)

					state.codeTimeout = setTimeout(() => {
						linterCode[index].style.overflow = 'auto hidden'
					}, 10)
				}
			}

			function closeBtnsOnResize() {
				hideLinterElement.forEach((element, index) => {
					element.style.height = 0
					isLinterOpen[index].isOpen = false
					linterCode[index].removeAttribute('style')
				})
				hideEquipmentElement.forEach(element => element.classList.remove('uses-equipment__hidden-group--open'))
				img.forEach(element => element.classList.remove('uses-img--open'))
			}

			function climbUpLinterBtn(event) {
				const index = [...climbUpBtn].indexOf(event.target)

				if (index === -1) return

				linterBtn[index + 1].scrollIntoView({ behavior: 'smooth', block: 'start' })
			}

			function animate() {
				handleTextWrite.writeAll()

				document.addEventListener('click', openHiddenEquipmentOnClick)
				document.addEventListener('click', openHiddenLinterOnClick)
				document.addEventListener('click', climbUpLinterBtn)
				window.addEventListener('resize', closeBtnsOnResize)
			}

			function reset() {
				handleTextWrite.resetAll()

				img.forEach(el => el.classList.remove('uses-img--open'))
				hideEquipmentElement.forEach(el => el.classList.remove('uses-equipment__hidden-group--open'))
				hideLinterElement.forEach((el, index) => {
					el.style.height = 0
					linterCode[index].removeAttribute('style')

					if (isLinterOpen[index].timeout) {
						clearTimeout(isLinterOpen[index].timeout)

						isLinterOpen[index].timeout = null
					}

					if (isLinterOpen[index].isOpen) {
						isLinterOpen[index].isOpen = false
					}
				})

				document.removeEventListener('click', openHiddenEquipmentOnClick)
				document.removeEventListener('click', openHiddenLinterOnClick)
				document.removeEventListener('click', climbUpLinterBtn)
				window.removeEventListener('resize', closeBtnsOnResize)
			}

			createAnimation(setId.ids, setId.elementKeys, setId.startingHeight, animate, reset)
		}

		btnsAnimate()

		function copyText() {
			const btns = [...copyBtn]
			const texts = [...code]
			const hmpName = document.getElementById('hmp-getting-name')

			let isClicked = false

			function showModalWindow(message, classes) {
				if (isModalVisible) return
				isModalVisible = true

				const modalWindow = document.createElement('div')
				modalWindow.classList.add(...classes)
				modalWindow.textContent = message
				modalWindow.style.cssText = hmpName.style.cssText
				document.body.appendChild(modalWindow)

				setTimeout(() => {
					modalWindow.remove()
					isModalVisible = false
				}, 2000)
			}

			function cleanText(text) {
				let cleanedText = text.replace(/<\/?[^>]+(>|$)/g, '')
				cleanedText = cleanedText.replace(/\s+/g, ' ').trim()
				return cleanedText
			}

			btns.forEach((element, index) => {
				element.addEventListener('click', () => {
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
							const message = isLanguageRussian ? 'Текст скопирован' : 'Text Copied'
							const font = isLanguageRussian ? ['uses-linters__modal-window', 'russian-font', 'uses-linters__modal-window--rus-lang'] : ['uses-linters__modal-window']
							showModalWindow(message, font)
						})
						.catch(() => {
							const message = isLanguageRussian ? 'Ошибка копирования' : 'Copy Error'
							const font = isLanguageRussian ? ['uses-linters__modal-window', 'russian-font', 'uses-linters__modal-window--rus-lang'] : ['uses-linters__modal-window']
							showModalWindow(message, font)
						})
						.finally(() => {
							setTimeout(() => {
								isClicked = false
							}, 2000)
						})
				})
			})
		}

		copyText()
	}

	function resumePageEvents() {
		sameElementsAnimation('.resume-title', 'resume-title', ['resume-title--animate'], 80, null)
		sameElementsAnimation('.resume-btn-box', 'resume-btn', ['resume-btn-box--animate'], 80, null)
		sameElementsAnimation('.resume-feedback__input-box', 'resume-feedback-input-box', ['resume-feedback__input-box--animate'], 20, null)
		sameElementsAnimation('.resume-subtitle', 'resume-subtitle', ['resume-subtitle--animate'], 80, null)

		function gettingAnimate() {
			singleElementsAnimation('resume-getting-title', 80, ['resume-getting__title--animate'], null)

			function subtitle() {
				const subtitles = document.querySelectorAll('.resume-getting__subtitle')
				const setIds = addId(subtitles, 'resume-getting-subtitle', 80)

				const isAnimation = {}

				function animate() {
					subtitles.forEach((element, index) => {
						if (seenElements.has(setIds.elementKeys[index])) {
							if (!isAnimation[index]) {
								isAnimation[index] = { animated: false, timeout: null }
							}

							if (!isAnimation[index].animated) {
								isAnimation[index].animated = true

								isAnimation[index].timeout = setTimeout(() => {
									element.classList.add('resume-getting__subtitle--animate')
								}, 300 * index)
							}
						}
					})
				}

				function reset() {
					subtitles.forEach((element, index) => {
						if (isAnimation[index]?.timeout) {
							clearTimeout(isAnimation[index].timeout)
							isAnimation[index].timeout = null
						}

						if (isAnimation[index]?.animated) {
							isAnimation[index].animated = false
						}

						element.classList.remove('resume-getting__subtitle--animate')
					})
				}

				createAnimation(setIds.ids, setIds.elementKeys, setIds.startingHeight, animate, reset)
			}

			subtitle()
		}

		gettingAnimate()

		function scrollText() {
			const container = document.getElementById('resume-scroll-text')
			const letters = document.querySelectorAll('.resume-scroll__letter')

			const ids = [container]
			const elementKeys = ['resume-scroll-text']
			const startHeight = 0

			letters.forEach((element, index) => {
				element.classList.add(index % 2 !== 0 ? 'resume-scroll__letter--top' : 'resume-scroll__letter--bottom')
			})

			function animate() {
				letters.forEach(element => {
					if (element.classList.contains('resume-scroll__letter--top')) {
						element.classList.add('resume-scroll__letter--animate-top')
					}

					if (element.classList.contains('resume-scroll__letter--bottom')) {
						element.classList.add('resume-scroll__letter--animate-bottom')
					}
				})
			}

			function reset() {
				letters.forEach(element => {
					element.classList.remove('resume-scroll__letter--animate-top', 'resume-scroll__letter--animate-bottom')
				})
			}

			createAnimation(ids, elementKeys, startHeight, animate, reset)
		}

		scrollText()

		function feedbackAnimate() {
			function textWrite() {
				const texts = document.querySelectorAll('.resume-feedback__text')
				const form = document.getElementById('resume-feedback-form')

				const setId = addId(texts, 'resume-feedback-text', 80)

				const en = ['Name', 'Email', 'Message']
				const ru = ['Имя', 'Email', 'Сообщение']

				const handleTextWrite = writeAndResetText(setId.ids, en, ru, 70, setId.elementKeys, null, null)

				function animate() {
					form.classList.add('resume-feedback__form--animate')
					handleTextWrite.writeAll()
				}

				function reset() {
					handleTextWrite.resetAll()

					form.classList.remove('resume-feedback__form--animate')
				}

				createAnimation(setId.ids, setId.elementKeys, setId.startingHeight, animate, reset)
			}

			textWrite()

			function autoResizeTextarea() {
				const textarea = document.getElementById('resume-feedback-message')

				textarea.style.height = 'auto'
				textarea.style.height = textarea.scrollHeight + 'px'
			}

			document.addEventListener('input', autoResizeTextarea)
		}

		feedbackAnimate()

		function sendMail() {
			const form = document.getElementById('resume-feedback-form')
			const nameInput = document.getElementById('resume-feedback-name')
			const emailInput = document.getElementById('resume-feedback-email')
			const messageInput = document.getElementById('resume-feedback-message')
			const btn = document.getElementById('resume-feedback-btn')
			const page = document.getElementById('page')
			const hmpName = document.getElementById('hmp-getting-name')

			function sanitizeInput(value) {
				const htmlTagRegex = /<[^>]*>?/gm
				if (htmlTagRegex.test(value)) {
					showModal('Get away', 'Убирайся прочь')
					setTimeout(() => {
						window.location.href = 'about:blank'
						nameInput.value = ''
						emailInput.value = ''
						messageInput.value = ''
					}, 2950)
					return null
				}

				return value.replace(/<[^>]*>/g, '').trim()
			}

			function showModal(ruMessage, enMessage) {
				const modalWindow = document.createElement('div')
				modalWindow.classList.add('feedback-modal-window')
				modalWindow.style.cssText = hmpName.style.cssText
				if (isLanguageRussian) modalWindow.classList.add('russian-font', 'feedback-modal-window--rus-lang')

				modalWindow.textContent = !isLanguageRussian ? ruMessage : enMessage
				page.appendChild(modalWindow)
				setTimeout(() => {
					btn.innerHTML = !isLanguageRussian ? '<span class="resume-feedback__form-btn-text">Send</span>' : '<span class="resume-feedback__form-btn-text russian-font">Отправить</span>'

					const element = document.querySelector('.resume-feedback__form-btn-text')
					element.dataset.en = 'Send'
					element.dataset.ru = 'Отправить'

					element.addEventListener('animationend', event => {
						if (event.animationName === 'fedback-form-btn-text') {
							btn.textContent = !isLanguageRussian ? 'Send' : 'Отправить'
							btn.dataset.en = 'Send'
							btn.dataset.ru = 'Отправить'
						}
					})

					modalWindow.remove()
				}, 3000)
			}

			form.addEventListener('submit', async event => {
				event.preventDefault()

				Object.keys(btn.dataset).forEach(key => delete btn.dataset[key])

				const name = sanitizeInput(nameInput.value)
				const email = sanitizeInput(emailInput.value)
				const message = sanitizeInput(messageInput.value)

				if (!name || !email || !message) return

				btn.disabled = true

				try {
					await sendEmail(name, email, message)
					showModal('Message sent', 'Сообщение отправлено')
					form.reset()
				} catch (error) {
					showModal(`Error: Please try again later`, `Ошибка: Попробуйте снова позже`)
					console.error('Error details:', error)
					if (error.response) {
						console.error('Server response:', await error.response.text())
					}
				} finally {
					setTimeout(() => {
						btn.disabled = false
					}, 4000)
				}
			})

			async function sendEmail(name, email, message) {
				btn.innerHTML = '<span class="resume-feedback__sending"></span> <span class="resume-feedback__sending"></span> <span class="resume-feedback__sending"></span>'

				const elements = document.querySelectorAll('.resume-feedback__sending')
				elements.forEach(element => {
					element.style.cssText = hmpName.style.cssText
				})

				const response = await fetch('http://127.0.0.1:3000/api/send-email', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ name, email, message }),
				})

				if (!response.ok) {
					const errorText = await response.text()
					throw new Error(errorText || 'Ошибка отправки сообщения.')
				}
			}
		}

		sendMail()
	}

	function aboutMePageEvents() {
		const myselfItem = document.querySelectorAll('.about-me-self__links-item')

		myselfItem.forEach((element, index) => element.classList.add(index % 2 === 0 ? 'about-me-self__links-item--left' : 'about-me-self__links-item--right'))
		sameElementsAnimation('.about-me-exp__text', 'about-me-exp-text', ['about-me-exp__text--animate'], 50, null)
		sameElementsAnimation('.about-me-exp__box-line', 'about-me-exp-box-line', ['about-me-exp__box-line--animate'], 50, null)
		sameElementsAnimation('.about-me-title', 'about-me-title', ['about-me-title--animate'], 50, null)
		sameElementsAnimation('.about-me-section-line', 'about-me-section-line', ['about-me-section-line--animate'], 50, null)
		sameElementsAnimation('.about-me-self__links-item', 'about-me-self-links-item', ['about-me-self__links-item--animate'], 50, null)

		singleElementsAnimation('about-me-getting-title', 50, ['about-me-getting__title--animate'], 'about-me-getting-hide-box')
		singleElementsAnimation('about-me-exp-total-exp', 50, ['about-me-exp__total-exp--animate'], null)
		singleElementsAnimation('about-me-self-img-box', 50, ['about-me-self__img-box--animate'], null)
		singleElementsAnimation('about-me-self-accent-text', 50, ['about-me-self__accent-text--animate'], 'about-me-self-inner-text')
		singleElementsAnimation('about-me-self-text', 50, ['about-me-self__text--animate'], 'about-me-self-inner-text')

		function gettingSubtitleAnimate() {
			const container = document.getElementById('about-me-getting-subtitle')
			const elements = document.querySelectorAll('.about-me-getting__span')
			const timeouts = []

			function animate() {
				elements.forEach((element, index) => {
					const timeout = setTimeout(() => element.classList.add('about-me-getting__span--animate'), 100 * index)

					timeouts.push(timeout)
				})
			}

			function reset() {
				elements.forEach(element => element.classList.remove('about-me-getting__span--animate'))
				timeouts.forEach(timeout => clearTimeout(timeout))
				timeouts.length = 0
			}

			createAnimation([container], ['about-me-getting-subtitle'], 0, animate, reset)
		}

		gettingSubtitleAnimate()

		function scrollLettersAnimate() {
			const container = document.getElementById('about-me-scroll-text')
			const letters = document.querySelectorAll('.about-me-scroll__letters')
			const timeouts = []

			function animate() {
				letters.forEach((letter, index) => {
					const timeout = setTimeout(() => letter.classList.add('about-me-scroll__letters--animate'), index * 60)

					timeouts.push(timeout)
				})
			}

			function reset() {
				letters.forEach(letter => letter.classList.remove('about-me-scroll__letters--animate'))
				timeouts.forEach(timeout => clearTimeout(timeout))
				timeouts.length = 0
			}

			createAnimation([container], ['about-me-scroll-text'], 0, animate, reset)
		}

		scrollLettersAnimate()

		function writeText() {
			const proffeson = document.querySelectorAll('.about-me-exp__profession')
			const date = document.querySelectorAll('.about-me-exp__date')
			const company = document.querySelectorAll('.about-me-exp__company')
			const email = document.getElementById('about-me-self-img-text')

			const setProfId = addId(proffeson, 'about-me-exp-profession', 50)
			const setDateId = addId(date, 'about-me-exp-date', 50)
			const setCompanyId = addId(company, 'about-me-exp__company', 50)

			const enProf = ['Freelance projects (independent practice)']
			const ruProf = ['Фриланс проекты (самостоятельная практика)']

			const enDate = ['July 2023 - present time']
			const ruDate = ['Июль 2023 - настоящее время']

			const enCompany = ['Education']
			const ruCompany = ['Обучение']

			const handleTextProfWrite = writeAndResetText(setProfId.ids, enProf, ruProf, 40, setProfId.elementKeys, ['about-me-exp__profession--rus-lang'], null)
			const handleTextDateWrite = writeAndResetText(setDateId.ids, enDate, ruDate, 50, setDateId.elementKeys, ['about-me-exp__date--rus-lang'], null)
			const handleTextCompanyWrite = writeAndResetText(setCompanyId.ids, enCompany, ruCompany, 60, setCompanyId.elementKeys, ['about-me-exp__company--rus-lang'], null)
			const handleEmailTextWrite = writeAndResetText([email], ['sunnatbackidjanov@gmail.com'], ['sunnatbackidjanov@gmail.com'], 40, ['about-me-self-img-text'], ['about-me-self__img-text--rus-lang'])

			createAnimation(setProfId.ids, setProfId.elementKeys, setProfId.startingHeight, handleTextProfWrite.writeAll, handleTextProfWrite.resetAll)
			createAnimation(setDateId.ids, setDateId.elementKeys, setDateId.startingHeight, handleTextDateWrite.writeAll, handleTextDateWrite.resetAll)
			createAnimation(setCompanyId.ids, setCompanyId.elementKeys, setCompanyId.startingHeight, handleTextCompanyWrite.writeAll, handleTextCompanyWrite.resetAll)
			createAnimation([email], ['about-me-self-img-text'], 50, handleEmailTextWrite.writeAll, handleEmailTextWrite.resetAll)
		}

		writeText()
	}

	function calculateExp() {
		const expList = document.querySelectorAll('.about-me-exp__period')
		const monthText = document.getElementById('about-me-exp-total-exp-month-text')
		const yearText = document.getElementById('about-me-exp-total-exp-year-text')
		const monthDate = document.getElementById('about-me-exp-total-exp-month-date')
		const yearDate = document.getElementById('about-me-exp-total-exp-year-date')

		let totalMonths = 0

		expList.forEach(element => {
			const startDate = new Date(element.dataset.start)
			const endDate = element.dataset.end === 'present' ? new Date() : new Date(element.dataset.end)

			const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth())
			totalMonths += months
		})

		const years = Math.floor(totalMonths / 12)
		const months = totalMonths % 12

		function declension(number, one, few, many) {
			const mod10 = number % 10
			const mod100 = number % 100

			if (mod100 >= 11 && mod100 <= 19) return many
			if (mod10 === 1) return one
			if (mod10 >= 2 && mod10 <= 4) return few
			return many
		}

		if (!isLanguageRussian) {
			yearText.textContent = years === 1 ? 'year' : 'years'
			monthText.textContent = months === 1 ? 'month' : 'months'
		}

		if (isLanguageRussian) {
			yearText.textContent = declension(years, 'год', 'года', 'лет')
			monthText.textContent = declension(months, 'месяц', 'месяца', 'месяцев')
		}

		monthDate.textContent = months
		yearDate.textContent = years
	}

	function setCurrentDate() {
		const date = document.getElementById('footer-current-date')
		const setCurrentDate = new Date()
		const langState = !isLanguageRussian ? 'en-US' : 'ru-RU'

		date.classList[isLanguageRussian ? 'add' : 'remove']('russian-font', 'footer__date--rus-lang')

		const options = { year: 'numeric', month: 'long' }
		date.textContent = setCurrentDate.toLocaleString(langState, options)
	}

	function footerEvents() {
		const date = document.getElementById('footer-current-date')
		const name = document.getElementById('footer-name')
		const version = document.getElementById('footer-version')
		const wrapper = document.getElementById('footer-wrapper')
		const symbol = document.getElementById('footer-symbol')
		const line = document.getElementById('footer-line')

		const ids = [wrapper, name, version]
		const elementKeys = ['footer-wrapper', 'footer-name', 'footer-version']
		const startHeight = 0

		const timeouts = []

		const handleTextWrite = [
			writeAndResetText([name], ['Bakidjanov Sunnat'], ['Бакиджанов Суннат'], 50, ['footer-name'], ['footer__name--rus-lang'], null),
			writeAndResetText([version], ['Version 1.0.0'], ['Версия 1.0.0'], 50, ['footer-version'], ['footer__version--rus-lang'], null),
		]

		function animate() {
			wrapper.classList.add('footer__wrapper--animate')
			symbol.classList.add('footer__symbol--animate')

			const textTimeout = setTimeout(() => {
				handleTextWrite[0].writeAll()
			}, 300)

			const dateTimeout = setTimeout(() => {
				date.classList.add('footer__date--animate')
				line.classList.add('footer__line--animate')
			}, 600)

			const versionTimeout = setTimeout(() => {
				handleTextWrite[1].writeAll()
			}, 1200)

			timeouts.push(textTimeout, dateTimeout, versionTimeout)
		}

		function reset() {
			wrapper.classList.remove('footer__wrapper--animate')
			symbol.classList.remove('footer__symbol--animate')
			date.classList.remove('footer__date--animate')
			line.classList.remove('footer__line--animate')

			handleTextWrite.forEach(text => {
				text.resetAll()
			})

			timeouts.forEach(timeout => {
				clearTimeout(timeout)
			})
		}

		createAnimation(ids, elementKeys, startHeight, animate, reset)
	}

	window.addEventListener('load', () => {
		setCurrentDate()
		calculateExp()
		backgroundColorChange()

		headerEvents()
		homePageEvents()
		usesPageEvents()
		resumePageEvents()
		aboutMePageEvents()
		footerEvents()

		// switchPages()
		climbUp()
		asideMenu()
	})

	// window.addEventListener('beforeunload', () => {
	// 	pageUpdate()
	// })

	changeLanguageButton.addEventListener('click', () => {
		isLanguageRussian = !isLanguageRussian
		const currentLanguage = isLanguageRussian ? 'ru' : 'en'

		translateText(currentLanguage, 'russian-font')

		setCurrentDate()
		calculateExp()
		updateAnimationText()

		function homePageTextEdit() {
			const cardsText = document.querySelectorAll('.hmp-cards__progress-text')

			manageClasses(cardsText, ['russian-font'], null)

			manageClasses(null, ['hmp-getting__title--rus-lang'], '.hmp-getting__title')
			manageClasses(null, ['hmp-cards__title--rus-lang'], '.hmp-cards__title')
			manageClasses(null, ['hmp-projects__title--rus-lang'], '.hmp-projects__title')
			manageClasses(null, ['hmp-projects__text--rus-lang'], '.hmp-projects__text')
			manageClasses(null, ['hmp-way__title--rus-lang'], '.hmp-way__title')
			manageClasses(null, ['hmp-way__btn--rus-lang'], '.hmp-way__btn')
		}

		homePageTextEdit()

		function resumeTextEdit() {
			const subtitlesGetting = document.querySelectorAll('.resume-getting__subtitle')
			const subtitles = document.querySelectorAll('.resume-subtitle')
			const titles = document.querySelectorAll('.resume-title')
			const label = document.querySelectorAll('.resume-feedback__label')
			const copyBtn = document.querySelectorAll('.uses-linters__copy-btn')
			const pasteTextSpan = document.querySelectorAll('.uses-linters__paste-text--accent')
			const pasteText = document.querySelectorAll('.uses-linters__paste-text')

			manageClasses(subtitlesGetting, ['resume-getting__subtitle--rus-lang'], null)
			manageClasses(subtitles, ['resume-subtitle--rus-lang'], null)
			manageClasses(titles, ['resume-title--rus-lang'], null)
			manageClasses(label, ['resume-feedback__label--rus-lang'], null)
			manageClasses(copyBtn, ['uses-linters__copy-btn--rus-lang'], null)
			manageClasses(pasteTextSpan, ['russian-font'], null)
			manageClasses(pasteText, ['uses-linters__paste-text--rus-lang'], null)

			manageClasses(null, ['resume-feedback__form-btn--rus-lang'], '.resume-feedback__form-btn')
			manageClasses(null, ['resume-download__link--rus-lang'], '.resume-download__link')
			manageClasses(null, ['resume-getting__title--rus-lang'], '.resume-getting__title')
			manageClasses(null, ['resume-feedback__label--textarea-rus-lang'], '.resume-feedback__label--textarea')
		}

		resumeTextEdit()

		function usesTextEdit() {
			const titles = document.querySelectorAll('.uses-title')
			const equipmentHideText = document.querySelectorAll('.uses-equipment__hidden-text')
			const softwareText = document.querySelectorAll('.uses-software__text')
			const linterTasksText = document.querySelectorAll('.uses-linters__task')

			manageClasses(titles, ['uses-title--rus-lang'], null)
			manageClasses(equipmentHideText, ['uses-equipment__hidden-text--rus-lang'], null)
			manageClasses(softwareText, ['uses-software__text--rus-lang', 'russian-font'], null)
			manageClasses(linterTasksText, ['uses-linters__task--rus-lang'], null)

			manageClasses(null, ['uses-getting__title--rus-lang'], '.uses-getting__title')
			manageClasses(null, ['uses-getting__subtitle--rus-lang'], '.uses-getting__subtitle')
			manageClasses(null, ['uses-linters__settings-title--rus-lang'], '.uses-linters__settings-title')

			function settingToggleClasses() {
				const fontText = document.querySelector('.uses-linters__settings-subtitle--font-color')
				const accentText = document.querySelector('.uses-linters__settings-subtitle--span')

				fontText.classList.toggle('uses-linters__settings-subtitle--accent-color', isLanguageRussian)
				accentText.classList.toggle('uses-linters__settings-subtitle--accent-color', !isLanguageRussian)
			}

			settingToggleClasses()
		}

		usesTextEdit()

		function aboutMeTextEdit() {
			const expText = document.querySelectorAll('.about-me-exp__text')
			const totalText = document.querySelectorAll('.about-me-exp__total-text')
			const linksText = document.querySelectorAll('.about-me-self__links-text')

			manageClasses(expText, ['about-me-exp__text--rus-lang'], null)
			manageClasses(totalText, ['russian-font'], null)
			manageClasses(linksText, ['russian-font', 'about-me-self__links-text--rus-lang'], null)

			manageClasses(null, ['about-me-getting__title--rus-lang'], '.about-me-getting__title')
			manageClasses(null, ['about-me-getting__subtitle--rus-lang'], '.about-me-getting__subtitle')
			manageClasses(null, ['about-me-exp__total-exp--rus-lang', 'russian-font'], '.about-me-exp__total-exp')
			manageClasses(null, ['about-me-self__text--rus-lang'], '.about-me-self__text')
			manageClasses(null, ['about-me-self__accent-text--rus-lang'], '.about-me-self__accent-text')
		}

		aboutMeTextEdit()
	})
}

main()
