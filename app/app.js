const express = require('express')
const nodemailer = require('nodemailer')
const cors = require('cors')
const bodyParser = require('body-parser')
const xss = require('xss')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(bodyParser.json())

app.get('/', (req, res) => {
	res.send('Сервер работает! Добро пожаловать Суннат')
})

app.post('/api/send-email', async (req, res) => {
	const { name, email, message } = req.body

	function sanitizeInput(value) {
		return xss(value).trim()
	}

	function detectRussianLanguage(message) {
		const russianPattern = /[а-яА-ЯёЁ]/
		return russianPattern.test(message) ? 'ru' : 'not-ru'
	}

	const sanitizedName = sanitizeInput(name)
	const sanitizedEmail = sanitizeInput(email)
	const sanitizedMessage = sanitizeInput(message)

	if (!sanitizedName || !sanitizedEmail || !sanitizedMessage) {
		return res.status(400).send('Все поля обязательны для заполнения.')
	}

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	if (!emailRegex.test(sanitizedEmail)) {
		return res.status(400).send('Некорректный формат email.')
	}

	const transporter = nodemailer.createTransport({
		host: 'smtp.elasticemail.com',
		port: 465,
		secure: true,
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASS,
		},
	})

	const mailOptions = {
		from: process.env.EMAIL_USER,
		to: process.env.EMAIL_USER,
		subject: `Новое сообщение от ${sanitizedName}\n`,
		text: `Имя: ${sanitizedName}\nEmail: ${sanitizedEmail}\nСообщение:\n${sanitizedMessage}`,
	}

	try {
		await transporter.sendMail(mailOptions)
		res.status(200).send()

		try {
			const language = detectRussianLanguage(message)

			let subject = language === 'ru' ? 'Ваше сообщение принято' : 'Your message has been received.'
			let text = language === 'ru' ? `Здравствуйте, ${sanitizedName}!\nВаше сообщение получено. Я свяжусь с вами в ближайшее время.\nСпасибо!\n\n` : `Hello, ${sanitizedName}!\nYour message has been received. I will contact you shortly.\nThank you!\n`

			await transporter.sendMail({
				from: process.env.EMAIL_USER,
				to: sanitizedEmail,
				subject,
				text,
			})
		} catch (error) {
			console.error('Ошибка при определении языка или отправке ответа:', error)
		}
	} catch (error) {
		console.error('Ошибка при отправке письма:', error)
		res.status(500).send('Ошибка при отправке письма')
	}
})

app.listen(PORT, () => {
	console.log(`Сервер запущен на http://127.0.0.1:${PORT}`)
})
