const express = require('express')
const nodemailer = require('nodemailer')
const cors = require('cors')
const bodyParser = require('body-parser')
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

	if (!name || !email || !message) {
		return res.status(400).send('Все поля обязательны для заполнения.')
	}

	const transporter = nodemailer.createTransport({
		host: 'smtp.elasticemail.com',
		port: 2525,
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASS,
		},
	})

	const mailOptions = {
		from: process.env.EMAIL_USER,
		to: process.env.EMAIL_USER,
		subject: `Новое сообщение от ${name}\n`,
		text: `Имя: ${name}\nEmail: ${email}\nСообщение:\n${message}`,
	}

	try {
		await transporter.sendMail(mailOptions)
		res.status(200).send('Сообщение отправлено успешно.')

		try {
			await transporter.sendMail({
				from: process.env.EMAIL_USER,
				to: email,
				subject: 'Ваше сообщение принято',
				text: `Здравствуйте, ${name}!\n\nВаше сообщение получено. Мы свяжемся с вами в ближайшее время.\n\nСпасибо!`,
			})
		} catch (error) {
			console.error('Ошибка при отправке автоматического ответа:', error)
		}
	} catch (error) {
		console.error('Ошибка при отправке письма:', error)
		res.status(500).send('Попробуйте снова позже.')
	}
})

app.listen(PORT, () => {
	console.log(`Сервер запущен на http://localhost:${PORT}`)
})
