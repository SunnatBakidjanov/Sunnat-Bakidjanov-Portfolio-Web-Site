function main() {
	'use strict'
	const logo = document.getElementById('logo')

	const START_PAGE_POSITION = 3
	const START_PAGE_NAME = 'about-me'

	const pageIds = {
		'home-page-btn': 'home',
		'uses-page-btn': 'uses',
		'resume-page-btn': 'resume',
		'about-me-page-btn': 'about-me',
		[logo.id]: 'home',
	}

	let isAnimationStopped = false

	const languageCallbacks = []
	const animatedElements = new Set()
	let isLanguageRussian = false

	function updateLanguageContent(callback) {
		const changeLanguageButton = document.getElementById('translator')

		if (callback) languageCallbacks.push(callback)

		if (updateLanguageContent.initialized) return
		updateLanguageContent.initialized = true

		const elements = document.querySelectorAll('[data-ru][data-en]')

		changeLanguageButton.addEventListener('click', () => {
			isLanguageRussian = !isLanguageRussian
			const language = isLanguageRussian ? 'ru' : 'en'

			elements.forEach(element => {
				const text = element.dataset[language]
				if (text) element.textContent = text
			})

			languageCallbacks.forEach(callback => callback())
		})
	}

	function resetAnimations(resetCallback, pageName) {
		let currentPage = START_PAGE_NAME

		function handleClick(event) {
			const target = event.target
			const targetPage = pageIds[target.id]

			if (!targetPage) return

			if (currentPage === pageName) resetCallback()

			currentPage = targetPage
		}

		document.addEventListener('click', handleClick)
	}

	function removeAnimateClasses(elementsArray, hideElementsArray, pageName) {
		let currentPage = START_PAGE_NAME

		function handleClick(event) {
			const target = event.target
			const targetPage = pageIds[target.id]

			if (!targetPage) return

			if (currentPage === pageName) {
				animatedElements.clear()

				if (elementsArray) {
					elementsArray.forEach(element => {
						;[...element.classList].forEach(className => {
							if (className.includes('--animate')) element.classList.remove(className)
						})
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

			currentPage = targetPage
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

	function animateVisibleElements(elements, callbackAnimate, thresholdElement = 1) {
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
					if (entry.isIntersecting && !animatedElements.has(entry.target)) {
						callbackAnimate(entry.target)
						setTimeout(() => animatedElements.add(entry.target), 50)
					}
				})
			},
			{
				root: null,
				rootMargin: '0px',
				threshold: thresholdElement,
			}
		)

		elements.forEach(element => observer.observe(element))
	}

	function pageUpdate() {
		window.scrollTo(0, 0)
	}

	function climbUp() {
		const button = document.getElementById('climb-up')
		const img = document.getElementById('climb-img')
		const circle = document.getElementById('climb-circle')
		const footer = document.querySelector('footer')

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
			const footerRect = footer.getBoundingClientRect()
			const windowHeight = window.innerHeight
			const overlap = windowHeight - footerRect.top

			overlap > 0 ? (button.style.transform = `translateY(-${overlap + 5}%)`) : (button.style.transform = 'translateY(0)')

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

	function backgroundColorChange() {
		const root = document.querySelector('.main-page')
		const buttons = document.querySelectorAll('.aside-menu__colors')
		const classes = ['bg-color--1', 'bg-color--2', 'bg-color--3', 'bg-color--4']
		const colors = ['#12a34e', '#26aaa4', '#d65a21', '#5dade2']

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

					document.documentElement.style.setProperty('--change-color', color)

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

		function updateAnimationText() {
			const element = document.getElementById('aside-menu-animation-state')
			const state = isLanguageRussian ? (isAnimationStopped ? 'ВЫКЛ' : 'ВКЛ') : isAnimationStopped ? 'OFF' : 'ON'
			element.textContent = state
		}

		updateLanguageContent(updateAnimationText)

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
				startDelayIsHidden: 100,
			}

			function stopAnimationIsOutVisability() {
				if (observer) return

				observer = new IntersectionObserver(
					entries => {
						const entry = entries[0]

						if (entry.isIntersecting) {
							if (isHidden && state === 'nextString') {
								timeout = setTimeout(() => {
									startTyping()
								}, cfg.startDelayIsHidden)
							}
							isHidden = false
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

			function handleLanguageChangeOnTextWrited() {
				if (!blink.classList.contains('hmp-getting__blink--animate')) return

				const currentTexts = isLanguageRussian ? texts.ru : texts.en
				const previousTexts = isLanguageRussian ? texts.en : texts.ru

				if (state === 'waiting') {
					const newIndex = previousTexts.indexOf(text.textContent.trim())
					if (newIndex !== -1) {
						textIndex = newIndex
						text.textContent = currentTexts[textIndex]
						letterIndex = currentTexts[textIndex].length
					}
				}
			}

			updateLanguageContent(handleLanguageChangeOnTextWrited)

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
			const lines = document.querySelectorAll('.uses-line')
			const titles = document.querySelectorAll('.uses-title')
			const btn = document.querySelectorAll('.uses-btn')

			const mainTitle = document.getElementById('uses-getting-title')
			const mainSubtitle = document.getElementById('uses-getting-subtitle')
			const gear = document.getElementById('uses-gear')
			const scrollLine = document.getElementById('uses-scroll-line')
			const scrollText = document.getElementById('uses-scroll-text')
			const softWearItem = document.querySelectorAll('.uses-software__item')
			const lintersTasks = document.querySelectorAll('.uses-linters__task')
			const linterTitle = document.getElementById('uses-linters-settings-title')
			const linterSubitile = document.getElementById('uses-linters-settings-subtitle')

			const elements = [mainTitle, scrollLine, ...lintersTasks, linterTitle, ...lines, ...titles, ...btn]
			const hideElements = [mainSubtitle, scrollText, gear, linterSubitile, ...btn, ...softWearItem]

			animateVisibleElements(elements, addAnimateClasses)
			animateVisibleElements(hideElements, addAnimateClassesInHideElements)
			animateVisibleElements([gear], addAnimateClassesInHideElements, 0.5)
			removeAnimateClasses(elements, hideElements, 'uses')
		}

		function controlButtonAndContent() {
			const imgs = document.querySelectorAll('.uses-img')
			const btn = document.querySelectorAll('.uses-btn')
			const hideGroup = document.querySelectorAll('.uses-hide-group')
			const equipmentHideBox = document.querySelectorAll('.uses-hide-box')

			const status = {}
			const timeouts = []

			const timers = {
				disabledTimer: 300,
				resizeTimer: 1000,
				endResizeTimer: 500,
			}

			let lastResizeTime = 0
			let resizeTimeout = null
			let isAnimated = false

			function toggleUIElements(event) {
				const index = [...btn].indexOf(event.target)

				if (index === -1) return
				if (!status[index]) status[index] = { isOpen: false }

				btn[index].disabled = true
				clearTimeout(timeouts[index])
				timeouts[index] = setTimeout(() => (btn[index].disabled = false), timers.disabledTimer)

				const transitionDuration = Math.min(0.8, Math.max(0.4, hideGroup[index].scrollHeight / 800))
				hideGroup[index].style.transition = `all ${transitionDuration.toFixed(2)}s ease-out`

				if (!status[index].isOpen) {
					imgs[index].classList.add(`${imgs[index].classList[0]}--open`)
					hideGroup[index].classList.add(`${hideGroup[index].classList[0]}--open`)
					hideGroup[index].style.height = `${hideGroup[index].scrollHeight}px`

					equipmentHideBox[index]?.classList.add(`${equipmentHideBox[index].classList[0]}--open`)

					status[index].isOpen = true
					return
				}

				imgs[index].classList.remove(`${imgs[index].classList[0]}--open`)
				hideGroup[index].classList.remove(`${hideGroup[index].classList[0]}--open`)
				hideGroup[index].style.height = 0
				equipmentHideBox[index]?.classList.remove(`${equipmentHideBox[index].classList[0]}--open`)

				status[index].isOpen = false
			}

			function changeScrollWidth() {
				hideGroup.forEach((element, index) => {
					if (equipmentHideBox[index] && equipmentHideBox[index]?.classList.contains(`${equipmentHideBox[index].classList[0]}--open`)) element.style.height = `${equipmentHideBox[index].scrollHeight}px`
				})
			}

			function handleChangeOnResize() {
				const now = Date.now()

				if (now - lastResizeTime >= timers.resizeTimer) {
					changeScrollWidth()
					lastResizeTime = now
				}

				clearTimeout(resizeTimeout)
				resizeTimeout = setTimeout(() => changeScrollWidth(), timers.endResizeTimer)
			}

			function animate() {
				if (isAnimated) return
				isAnimated = true

				window.addEventListener('resize', handleChangeOnResize)
				handleChangeOnResize()
			}

			function reset() {
				isAnimated = false
				lastResizeTime = 0
				timeouts.forEach(timeout => clearTimeout(timeout))

				if (resizeTimeout) {
					clearTimeout(resizeTimeout)
					resizeTimeout = null
				}

				hideGroup.forEach((box, index) => {
					box.classList.remove(`${box.classList[0]}--open`)
					box.style.height = 0

					if (status[index]) status[index].isOpen = false
				})

				btn.forEach(btn => (btn.disabled = false))
				imgs.forEach(img => img.classList.remove(`${img.classList[0]}--open`))
				equipmentHideBox.forEach(box => box.classList.remove(`${box.classList[0]}--open`))

				window.removeEventListener('resize', handleChangeOnResize)
			}

			animateVisibleElements([...hideGroup], animate)
			resetAnimations(reset, 'uses')
			document.addEventListener('click', toggleUIElements)
		}

		function lintersEvents() {
			const btn = document.querySelectorAll('.uses-linters__btn')
			const upBtn = document.querySelectorAll('.uses-linters__up-btn')

			const state = {}
			const timeouts = []

			const timers = {
				scrollTimer: 500,
			}

			function lintersBtnClick(event) {
				const index = [...btn].indexOf(event.target)

				if (index === -1) return
				if (!state[index]) state[index] = { isOpen: false }

				if (!state[index].isOpen) {
					clearTimeout(timeouts[index])
					timeouts[index] = setTimeout(() => btn[index].scrollIntoView({ behavior: 'smooth', block: 'start' }), timers.scrollTimer)

					state[index] = { isOpen: true }
					return
				}

				state[index] = { isOpen: false }
			}

			function handleUpOnClick(event) {
				const index = [...upBtn].indexOf(event.target)

				if (index === -1) return

				btn[index + 1].scrollIntoView({ behavior: 'smooth', block: 'start' })
			}

			document.addEventListener('click', event => {
				lintersBtnClick(event)
				handleUpOnClick(event)
			})
		}

		function copyText() {
			const copyButtons = document.querySelectorAll('.uses-linters__copy-btn')
			const infoCopyButtons = document.querySelectorAll('.uses-linters__info-copy-btn')
			const codeBlocks = document.querySelectorAll('.uses-linters__code')
			const infoTexts = document.querySelectorAll('.uses-linters__info-text--accent-color')

			let isClicked = false
			let isModalVisible = false
			const visibleTimer = 2000

			function showModalWindow(message, type) {
				if (isModalVisible) {
					const modalWindow = document.querySelector('.uses-linters__modal-window')
					modalWindow.textContent = message
					modalWindow.dataset.message = type
					return
				}

				isModalVisible = true

				const modalWindow = document.createElement('div')
				modalWindow.classList.add('uses-linters__modal-window')
				modalWindow.textContent = message
				modalWindow.dataset.message = type
				document.body.appendChild(modalWindow)

				setTimeout(() => {
					modalWindow.remove()
					isModalVisible = false
				}, visibleTimer)
			}

			function updateModalText() {
				const modalWindow = document.querySelector('.uses-linters__modal-window')
				if (!modalWindow) return

				const messageType = modalWindow.dataset.message

				let newMessage = ''
				switch (messageType) {
					case 'success':
						newMessage = isLanguageRussian ? 'Текст скопирован' : 'Text Copied'
						break
					case 'error':
						newMessage = isLanguageRussian ? 'Ошибка копирования' : 'Copy Error'
						break
					default:
						newMessage = modalWindow.textContent
				}

				modalWindow.textContent = newMessage
			}

			updateLanguageContent(updateModalText)

			function cleanText(text) {
				return text
					.replace(/<\/?[^>]+(>|$)/g, '')
					.replace(/\s+/g, ' ')
					.trim()
			}

			function handleCodeCopy(index) {
				if (isClicked) return
				isClicked = true

				let textToCopy = codeBlocks[index]?.textContent || ''
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
						showModalWindow(message, 'success')
					})
					.catch(() => {
						const message = isLanguageRussian ? 'Ошибка копирования' : 'Copy Error'
						showModalWindow(message, 'error')
					})
					.finally(() => {
						setTimeout(() => (isClicked = false), visibleTimer)
					})
			}

			function handleInfoCopy(index) {
				if (isClicked) return
				isClicked = true

				let textToCopy = infoTexts[index]?.textContent || ''
				textToCopy = cleanText(textToCopy)

				navigator.clipboard
					.writeText(textToCopy)
					.then(() => {
						const message = isLanguageRussian ? 'Текст скопирован' : 'Text Copied'
						showModalWindow(message, 'success')
					})
					.catch(() => {
						const message = isLanguageRussian ? 'Ошибка копирования' : 'Copy Error'
						showModalWindow(message, 'error')
					})
					.finally(() => {
						setTimeout(() => (isClicked = false), visibleTimer)
					})
			}

			copyButtons.forEach((button, index) => {
				button.addEventListener('click', () => handleCodeCopy(index))
			})

			infoCopyButtons.forEach((button, index) => {
				button.addEventListener('click', () => handleInfoCopy(index))
			})
		}

		animateUsesPageElements()
		controlButtonAndContent()
		lintersEvents()
		copyText()
	}

	function resumePageEvents() {
		function animateResumePageElements() {
			const lines = document.querySelectorAll('.resume-line')
			const title = document.querySelectorAll('.resume-hide-title')
			const subtitle = document.querySelectorAll('.resume-hide-subtitle')
			const btn = document.querySelectorAll('.resume-btn-box')

			const mainTitle = document.getElementById('resume-getting-title')
			const mainSubtitles = document.querySelectorAll('.resume-getting__subtitle-container')
			const animationMonitor = document.getElementById('resume-animation-monitor')
			const animateKeyboard = document.getElementById('resume-animation-inner-keyboard')
			const scrollLine = document.getElementById('resume-scroll-line')
			const scrollText = document.getElementById('resume-scroll-text')
			const form = document.getElementById('resume-feedback-form')
			const inputBox = document.querySelectorAll('.resume-feedback__input-box')

			const elements = [scrollLine, animationMonitor, animateKeyboard, ...lines, ...btn, ...inputBox]
			const hideElements = [mainTitle, scrollText, animationMonitor, ...mainSubtitles, ...title, ...subtitle]

			animateVisibleElements(elements, addAnimateClasses)
			animateVisibleElements([form], addAnimateClasses, 0.1)
			animateVisibleElements(hideElements, addAnimateClassesInHideElements)
			removeAnimateClasses(elements, hideElements, 'resume')
		}

		function resumeAnimation() {
			const monitor = document.getElementById('resume-animation-monitor')
			const rocket = document.getElementById('resume-animation-rocket')
			const rocketContainer = document.getElementById('resume-animation-rocket-container')

			let lightInterval = null
			let rocketInterval = null
			let monitorObserver = null
			let isRocketStarted = false

			const timers = {
				rocketChangeDircetion: 1000,
				lightCreateTimer: 300,
			}

			function stopAnimationIsMonitorOutVisability() {
				if (monitorObserver) monitorObserver.disconnect()

				monitorObserver = new IntersectionObserver(
					entries => {
						const entry = entries[0]

						if (entry.isIntersecting) {
							if (!rocketInterval) rocketInterval = setInterval(changeDirection, timers.rocketChangeDircetion)

							if (!lightInterval) lightAnimate()
						} else {
							if (rocketInterval) {
								clearInterval(rocketInterval)
								rocketInterval = null
							}

							rocket.style.transform = 'translate(0, 0)'

							if (lightInterval) {
								clearInterval(lightInterval)
								lightInterval = null
							}
						}
					},
					{ root: null, rootMargin: '0px', threshold: 0 }
				)

				monitorObserver.observe(monitor)
			}

			function changeDirection() {
				const offsetX = Math.random() * 50 - 25
				const offsetY = Math.random() * 50 - 25

				rocket.style.transform = `translate(${offsetX}%, ${offsetY}%)`

				stopAnimationIsMonitorOutVisability()
			}

			const handleRocketAnimationEnd = () => {
				if (rocketInterval) return

				rocket.style.animation = 'none'
				rocket.style.transform = 'translate(0, 0)'

				clearInterval(rocketInterval)
				rocketInterval = setInterval(changeDirection, timers.rocketChangeDircetion)

				rocket.removeEventListener('animationend', handleRocketAnimationEnd)
			}

			function lightAnimate() {
				if (lightInterval) return

				function createLight() {
					const light = document.createElement('span')
					light.classList.add('resume-animation__light')
					rocketContainer.append(light)
					light.style.top = `${Math.ceil(Math.max(2, Math.random() * 98))}%`
					light.style.width = `${Math.ceil(Math.max(2, Math.random() * 7))}%`

					light.addEventListener('animationend', event => {
						if (event.animationName === 'light') light.remove()
					})
				}

				lightInterval = setInterval(createLight, timers.lightCreateTimer)
			}

			const handleRocketTransitionEnd = event => {
				if (event.propertyName === 'transform' && !isRocketStarted) {
					isRocketStarted = true
					rocket.classList.add(`${rocket.classList[0]}--animate`)

					lightAnimate()

					rocket.addEventListener('animationend', handleRocketAnimationEnd)
				}
			}

			function handleVisabilityHidden() {
				if (document.hidden) {
					clearInterval(lightInterval)
					clearInterval(rocketInterval)

					rocketInterval = null
					lightInterval = null

					rocket.style.animation = 'none'
					rocket.style.transform = 'translate(0, 0)'
				} else {
					if (!rocketInterval) rocketInterval = setInterval(changeDirection, timers.rocketChangeDircetion)

					if (!lightInterval) lightAnimate()
				}
			}

			function reset() {
				const lights = document.querySelectorAll('.resume-animation__light')

				if (rocketInterval) {
					rocket.removeAttribute('style')
					clearInterval(rocketInterval)
					rocketInterval = null
				}

				if (lightInterval) {
					clearInterval(lightInterval)
					lightInterval = null
				}

				lights.forEach(light => light.remove())

				monitor.removeEventListener('transitionrun', handleRocketTransitionEnd)
				document.removeEventListener('visibilitychange', handleVisabilityHidden)

				if (monitorObserver) {
					monitorObserver.unobserve(monitor)
					monitorObserver = null
				}

				isRocketStarted = false
			}

			resetAnimations(reset, 'resume')
			animateVisibleElements([monitor], () => {
				monitor.addEventListener('transitionrun', handleRocketTransitionEnd)
				document.addEventListener('visibilitychange', handleVisabilityHidden)
			})
		}

		function writeFormTexts() {
			const texts = document.querySelectorAll('.resume-feedback__text')
			const ruTexts = ['Имя', 'Email', 'Сообщение']
			const enTexts = ['Name', 'Email', 'Message']
			const typeSpeed = 70

			let observer = null

			const letterIndices = new Array(texts.length).fill(0)
			const wasVisible = new Array(texts.length).fill(false)

			observer = new IntersectionObserver((entries, observer) => {
				entries.forEach(entry => {
					if (entry.isIntersecting) {
						const index = [...texts].indexOf(entry.target)
						if (index !== -1 && !wasVisible[index]) {
							wasVisible[index] = true
							write(index)
						}
					}
				})
			})

			texts.forEach(text => observer.observe(text))

			function write(index) {
				const element = texts[index]
				const currentText = isLanguageRussian ? ruTexts[index] : enTexts[index]

				if (letterIndices[index] > currentText.length) return

				element.textContent = currentText.substring(0, letterIndices[index])
				letterIndices[index]++
				setTimeout(() => write(index), typeSpeed)
			}

			function restartWriting() {
				texts.forEach((text, index) => {
					if (wasVisible[index]) {
						letterIndices[index] = 0
						text.textContent = ''
						write(index)
					}
				})
			}

			function reset() {
				texts.forEach((text, index) => {
					if (wasVisible[index]) {
						text.textContent = ''
						letterIndices[index] = 0
						wasVisible[index] = false
					}
				})
			}

			resetAnimations(reset, 'resume')
			updateLanguageContent(restartWriting)
		}

		function sendMail() {
			const form = document.getElementById('resume-feedback-form')
			const nameInput = document.getElementById('resume-feedback-name')
			const emailInput = document.getElementById('resume-feedback-email')
			const messageInput = document.getElementById('resume-feedback-message')
			const btn = document.getElementById('resume-feedback-btn')
			const page = document.getElementById('main-page')
			const hmpName = document.getElementById('hmp-getting-name')

			const showModalTimer = 3000

			function sanitizeInput(value) {
				const htmlTagRegex = /<[^>]*>?/gm
				if (htmlTagRegex.test(value)) {
					const message = isLanguageRussian ? 'Убирайся прочь' : 'Get away'
					showModal(message, 'bad-request')
					setTimeout(() => {
						window.location.href = 'about:blank'
						nameInput.value = ''
						emailInput.value = ''
						messageInput.value = ''
					}, showModalTimer)
					return null
				}

				return value.replace(/<[^>]*>/g, '').trim()
			}

			function showModal(message, type) {
				const modalWindow = document.createElement('div')
				modalWindow.classList.add('feedback-modal-window')
				modalWindow.style.cssText = hmpName.style.cssText
				if (isLanguageRussian) modalWindow.classList.add('russian-font', 'feedback-modal-window--rus-lang')

				modalWindow.textContent = message
				modalWindow.dataset.message = type
				page.appendChild(modalWindow)

				updateLanguageContent(updateModalText)

				setTimeout(() => {
					btn.innerHTML = !isLanguageRussian ? '<span class="resume-feedback__form-btn-text">Send</span>' : '<span class="resume-feedback__form-btn-text">Отправить</span>'

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
				}, showModalTimer)
			}

			function updateModalText() {
				const modalWindow = document.querySelector('.feedback-modal-window')
				if (!modalWindow) return

				const messageType = modalWindow.dataset.message

				let newMessage = ''
				switch (messageType) {
					case 'success':
						newMessage = isLanguageRussian ? 'Сообщение отправлено' : 'Message sent'
						break
					case 'error':
						newMessage = isLanguageRussian ? 'Ошибка: Попробуйте снова позже' : 'Error: Please try again later'
						break
					case 'bad-request':
						newMessage = isLanguageRussian ? 'Убирайся прочь' : 'Get away'
						break
					default:
						newMessage = modalWindow.textContent
				}

				modalWindow.textContent = newMessage
			}

			updateLanguageContent(updateModalText)

			async function sendEmail(name, email, message) {
				btn.innerHTML = '<span class="resume-feedback__sending"></span> <span class="resume-feedback__sending"></span> <span class="resume-feedback__sending"></span>'

				const elements = document.querySelectorAll('.resume-feedback__sending')
				elements.forEach(element => {
					element.style.cssText = hmpName.style.cssText
				})

				const response = await fetch('http://127.0.0.1:3000/', {
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
					const modalMessage = isLanguageRussian ? 'Сообщение отрпавлено' : 'Message sent'
					showModal(modalMessage, 'success')
					form.reset()
				} catch (error) {
					const modalMessage = isLanguageRussian ? 'Ошибка: Попробуйте снова позже' : 'Error: Please try again later'
					showModal(modalMessage, 'error')
					console.error('Error details:', error)
					if (error.response) {
						console.error('Server response:', await error.response.text())
					}
				} finally {
					setTimeout(() => {
						btn.disabled = false
					}, showModalTimer)
				}
			})
		}

		animateResumePageElements()
		resumeAnimation()
		writeFormTexts()
		sendMail()
	}

	function aboutMePageEvents() {
		function animateAboutMePageElements() {
			const mainTitle = document.getElementById('about-me-getting-hide-box')
			const mainSubtitle = document.getElementById('about-me-getting-subtitle')
			const animationElement = document.getElementById('about-me-animation')
			const lines = document.querySelectorAll('.about-me-line')

			const hideElements = [mainTitle, mainSubtitle]
			const elements = [animationElement, ...lines]

			removeAnimateClasses(elements, hideElements, 'about-me')
			animateVisibleElements(hideElements, addAnimateClassesInHideElements)
			animateVisibleElements(elements, addAnimateClasses)
		}

		function aboutMeAnimation() {
			const centralEl = document.getElementById('about-me-animation')
			const lines = document.querySelectorAll('.about-me-animation__line')
			const progressAnimation = document.getElementById('about-me-progress-animation')
			const pupilLeft = document.getElementById('pupil-left')
			const pupilRight = document.getElementById('pupil-right')
			const eyes = document.querySelectorAll('.about-me-animation__eye')
			const mouth = document.getElementById('about-me-animation-mouth')
			const waves = document.querySelectorAll('.about-me-animation__wave')

			const timeouts = []

			let heightValue = 0
			let mouseX = 0
			let mouseY = 0

			let isIntcrement = true
			let isEyesVisible = false
			let isHeadVisible = false

			let headObserver = null
			let eyesObserver = null

			function updateEyes() {
				if (!isEyesVisible) return

				eyes.forEach((eye, index) => {
					const rect = eye.getBoundingClientRect()
					const centerX = rect.left + rect.width / 2
					const centerY = rect.top + rect.height / 2

					const dx = mouseX - centerX
					const dy = mouseY - centerY

					const angle = Math.atan2(dy, dx)
					const radius = 12

					const pupil = index === 0 ? pupilLeft : pupilRight
					const x = Math.cos(angle) * radius
					const y = Math.sin(angle) * radius

					pupil.style.transform = `translate(${x}px, ${y}px)`
				})

				requestAnimationFrame(updateEyes)
			}

			function eyesObserve() {
				eyesObserver = new IntersectionObserver(
					entryes => {
						const entry = entryes[0]

						if (entry.isIntersecting) {
							isEyesVisible = true
							updateEyes()
						} else {
							isEyesVisible = false
						}
					},
					{
						threshold: 0.5,
						rootMargin: '0px',
						root: null,
					}
				)

				eyesObserver.observe(eyes[0])
			}

			function headObserve() {
				headObserver = new IntersectionObserver(
					entries => {
						const entry = entries[0]

						if (entry.isIntersecting && centralEl.classList.contains(`${centralEl.classList[0]}--animate`)) {
							isHeadVisible = false
							heightChange()
						} else {
							isHeadVisible = false
						}
					},
					{
						root: null,
						rootMargin: '0px',
						threshold: 1,
					}
				)

				headObserver.observe(centralEl)
			}

			function handleTransitionEnd(event) {
				if (event.propertyName === 'opacity') {
					lines.forEach((line, index) => {
						const timeout = setTimeout(() => {
							line.classList.add(`${line.classList[0]}--animate`)
						}, index * 100)

						timeouts.push(timeout)
					})
				}

				headObserve()
				eyesObserve()
			}

			function heightChange() {
				if (isHeadVisible) return

				switch (heightValue) {
					case 0:
						isIntcrement = true
						waves.forEach((wave, index) => (index < waves.length / 2 ? (wave.style.animationName = 'wave-left-in') : (wave.style.animationName = 'wave-right-in')))
						break

					case 25:
						mouth.style.borderRadius = `0px`
						break

					case 50:
						mouth.style.borderRadius = `0 0 10px 10px`
						break

					case 75:
						mouth.style.borderRadius = `0 0 15px 15px`
						break

					case 100:
						isIntcrement = false
						mouth.style.borderRadius = `0 0 30px 30px`
						waves.forEach((wave, index) => (index < waves.length / 2 ? (wave.style.animation = 'wave-left-out 0.6s ease-out infinite') : (wave.style.animation = 'wave-right-out 0.6s ease-out infinite')))
						break

					default:
						isIntcrement = true
						mouth.style.borderRadius = `0px`
						waves.forEach((wave, index) => (index < waves.length / 2 ? (wave.style.animationName = 'wave-left-in') : (wave.style.animationName = 'wave-right-in')))
						break
				}

				isIntcrement ? (heightValue += 1) : (heightValue -= 1)
				progressAnimation.style.setProperty('--about-me-animation-progress-height', `${heightValue}%`)

				setTimeout(() => heightChange(), 1000)
			}

			setTimeout(() => heightChange(), 2500)

			document.addEventListener('mousemove', event => {
				mouseX = event.clientX
				mouseY = event.clientY
			})
			centralEl.addEventListener('transitionend', handleTransitionEnd)
		}

		aboutMeAnimation()
		animateAboutMePageElements()
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

	function footerEvents() {
		const versionValue = document.getElementById('footer-varsion-value')
		const versionContainer = document.getElementById('footer-version')
		const date = document.getElementById('footer-current-date')

		let value = parseInt(versionValue.innerHTML)

		let isAnimated = false

		const timers = {
			start: 1000,
			nextFrameWait: 10,
		}

		function setCurrentDate() {
			const setCurrentDate = new Date()
			const langState = !isLanguageRussian ? 'en-US' : 'ru-RU'

			const options = { year: 'numeric', month: 'long' }
			date.textContent = setCurrentDate.toLocaleString(langState, options)
		}

		function delay(ms) {
			return new Promise(resolve => setTimeout(resolve, ms))
		}

		function waitForTransition(element, propertyName) {
			return new Promise(resolve => {
				const handler = event => {
					if (event.propertyName === propertyName) {
						element.removeEventListener('transitionend', handler)
						resolve()
					}
				}
				element.addEventListener('transitionend', handler)
			})
		}

		function getTextWidth(text, referenceElement) {
			const span = document.createElement('span')
			const style = window.getComputedStyle(referenceElement)

			span.innerText = text
			span.style.font = style.font
			span.style.fontSize = style.fontSize
			span.style.fontFamily = style.fontFamily

			document.body.appendChild(span)
			const width = span.offsetWidth
			document.body.removeChild(span)

			return width
		}

		async function animateVersionValue() {
			if (isAnimated) return
			isAnimated = true

			await delay(timers.start)

			versionValue.style.transition = 'transform 0.6s ease-out'
			versionValue.style.transform = 'translateY(-100%)'

			await waitForTransition(versionValue, 'transform')

			value++

			versionValue.style.transition = 'none'
			const oldWidth = versionValue.offsetWidth
			const newWidth = getTextWidth(value.toString(), versionValue)

			versionValue.style.width = oldWidth + 'px'
			versionValue.innerText = value
			versionValue.style.transform = 'translateY(100%)'

			await delay(timers.nextFrameWait)

			versionValue.style.width = newWidth + 'px'
			versionValue.style.transition = 'transform 0.6s ease-out 0.2s, width 0.3s linear'
			versionValue.style.transform = 'translateY(0)'
		}

		setCurrentDate()
		updateLanguageContent(setCurrentDate)
		animateVisibleElements([versionContainer], animateVersionValue)
	}

	window.addEventListener('load', () => {
		calculateExp()
		backgroundColorChange()

		headerEvents()
		homePageEvents()
		usesPageEvents()
		resumePageEvents()
		aboutMePageEvents()
		footerEvents()

		climbUp()
		asideMenu()
	})

	// window.addEventListener('beforeunload', () => {
	// 	pageUpdate()
	// })
}

main()
