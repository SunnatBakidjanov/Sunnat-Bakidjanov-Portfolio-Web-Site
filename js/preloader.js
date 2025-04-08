function trackResources() {
	'use strict'

	const images = document.querySelectorAll('img')
	const scripts = document.querySelectorAll('script[src]')
	const styles = document.querySelectorAll('link[rel="stylesheet"]')

	const preloader = document.getElementById('preloader')

	const totalResources = images.length + scripts.length + styles.length
	let loadedResources = 0

	function updateProgress() {
		loadedResources++
		const progress = (loadedResources / totalResources) * 100

		document.getElementById('progress-bar').innerHTML = `<div style="width:${progress}%"></div>`

		let message = ''
		let state = 'img'

		switch (state) {
			case 'img':
				if (loadedResources < images.length) state = 'script'

				message = 'Загружаем изображения...'
				console.log('Грузятся изображения')
				break
			case 'script':
				if (loadedResources < images.length + scripts.length) state = 'style'

				message = 'Загружаем скрипты...'
				console.log('Грузятся скрипты')
				break
			case 'style':
				message = 'Загружаем стили...'
				console.log('Грузятся стили')
				break
			default:
				message = 'Загружаем ресурсы...'
				break
		}

		document.getElementById('preloader-message').innerText = message

		if (loadedResources === totalResources) {
			preloader.style.display = 'none'
		}
	}

	images.forEach(img => {
		img.onload = updateProgress
		img.onerror = updateProgress
	})

	scripts.forEach(script => {
		if (script.complete) {
			updateProgress()
		} else {
			script.onload = updateProgress
			script.onerror = updateProgress
		}
	})

	styles.forEach(style => {
		if (style.sheet) {
			updateProgress()
		} else {
			style.onload = updateProgress
			style.onerror = updateProgress
		}
	})
}

trackResources()
