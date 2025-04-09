function main() {
	'use strict'

	let isLanguageRussian = true

	let loadedResources = 0
	let totalResources = 0
	let lastResourceType = null

	const preloader = document.getElementById('preloader')
	const progressBar = document.getElementById('preloader-progress-bar')
	const preloaderMessage = document.getElementById('preloader-message')
	const preloaderValue = document.getElementById('preloader-value')
	const mainPage = document.getElementById('main-page')
	const btn = document.getElementById('preloader-change-language-btn')

	function updateProgress(type, onlyUpdateMessage = false) {
		if (!onlyUpdateMessage) loadedResources++
		lastResourceType = type

		const progress = (loadedResources / totalResources) * 100
		progressBar.style.setProperty('--preloader-progress', `${progress}%`)
		preloaderValue.textContent = progress.toFixed(0)

		let message = ''
		switch (type) {
			case 'image':
				message = isLanguageRussian ? 'Загружаем изображения...' : 'Loading images...'
				break
			case 'script':
				message = isLanguageRussian ? 'Загружаем скрипты...' : 'Loading scripts...'
				break
			case 'style':
				message = isLanguageRussian ? 'Загружаем стили...' : 'Loading styles...'
				break
		}

		preloaderMessage.dataset.ru = message
		preloaderMessage.dataset.en = message
		preloaderMessage.innerText = message

		if (loadedResources === totalResources && !onlyUpdateMessage) {
			const doneMsg = isLanguageRussian ? 'Все ресурсы загружены' : 'All resources loaded'
			preloaderMessage.dataset.ru = 'Все ресурсы загружены'
			preloaderMessage.dataset.en = 'All resources loaded'
			preloaderMessage.innerText = doneMsg

			setTimeout(() => {
				preloader.classList.add(`${preloader.classList[0]}--animate`)
				mainPage.classList.remove('main-page--open')
			}, 500)

			setTimeout(() => {
				preloader.style.display = 'none'
			}, 1800)
		}
	}

	function trackResources() {
		const images = document.querySelectorAll('img')
		const scripts = document.querySelectorAll('script[src]')
		const styles = document.querySelectorAll('link[rel="stylesheet"]')

		totalResources = images.length + scripts.length + styles.length

		images.forEach(img => {
			if (img.complete && img.naturalWidth !== 0) {
				updateProgress('image')
			} else {
				img.addEventListener('load', () => updateProgress('image'))
				img.addEventListener('error', () => updateProgress('image'))
			}
		})

		scripts.forEach(script => {
			if (script.readyState === 'complete') {
				updateProgress('script')
			} else {
				script.addEventListener('load', () => updateProgress('script'))
				script.addEventListener('error', () => updateProgress('script'))
			}
		})

		styles.forEach(style => {
			try {
				if (style.sheet && style.sheet.cssRules.length > 0) {
					updateProgress('style')
				} else {
					throw new Error()
				}
			} catch (e) {
				style.addEventListener('load', () => updateProgress('style'))
				style.addEventListener('error', () => updateProgress('style'))
			}
		})
	}

	function setLanguage() {
		const text = document.querySelectorAll('.preloader__change-language-text')

		function initializeLanguage() {
			const language = isLanguageRussian ? 'ru' : 'en'

			btn.dataset.lang = isLanguageRussian

			text.forEach(el => el.classList.remove('preloader__change-language-text--active'))
			text[!isLanguageRussian ? 0 : 1].classList.add('preloader__change-language-text--active')

			if (lastResourceType) {
				updateProgress(lastResourceType, true)
			} else {
				preloaderMessage.dataset.en = 'Loading resources...'
				preloaderMessage.dataset.ru = 'Загружаем ресурсы...'
				preloaderMessage.textContent = preloaderMessage.dataset[language]
			}

			const elements = document.querySelectorAll('[data-ru][data-en]')
			elements.forEach(el => {
				const content = el.dataset[language]
				if (content) el.textContent = content
			})
		}

		function changeLanguage() {
			isLanguageRussian = !isLanguageRussian
			initializeLanguage()
		}

		initializeLanguage()
		btn.addEventListener('click', changeLanguage)
	}

	trackResources()
	setLanguage()
}

main()
