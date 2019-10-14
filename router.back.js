var express = require('express')
// var md5 = require('blueimp-md5')
// var renderer = require('vue-server-renderer').createRenderer({
// 	template: require('fs').readFileSync('./views/index.template.html', 'utf8')
// })
var router = express.Router()
// var User = require('./models/user.js')
var fs = require('fs')

// 首页
router.get('/', function(req, res) {
	console.log(req.session.user)
	var app = new Vue({
		template: `<p></p>`
	})
	var context = {
		nickname: '未登录'
	}
	if(req.session.user) context.nickname = req.session.user.nickname
	renderer.renderToString(app, context, function(err, html) {
		if(err) {
			res.sendStatus(500).send('err')
		}
		res.send(html)
	})
})

// 注册页
router.get('/register', function(req, res) {
	res.send(require('fs').readFileSync('./views/register.html', 'utf8'))
})

// 登录页
router.get('/login', function(req, res) {
	res.send(require('fs').readFileSync('./views/login.html', 'utf8'))
})

// 接收注册数据
router.post('/register', function(req, res) {
	var body = req.body
	console.log('收到用户注册数据，注册邮箱：' + body.email)
	// 加密密码
	body.password = md5(md5(body.password))
	// 判断用户是否存在
	User.findOne({
		$or: [
			{email: body.email},
			{nickname: body.nickname}
		]	
	}, function(err, data) {
		if(err) {
			console.log('用户查重失败')
			return res.status(500).json({
				fail_code: 0
			})
		} 
		if(data) {
			console.log('用户重复注册')
			return res.status(200).json({
				success_code: 1
			})
		}
		// 用户不存在，保存用户数据
		new User(body).save(function(err, user) {
			if(err) {
				console.log('保存用户数据失败')
				return res.status(500).json({
					fail_code: 1
				})
			}
			// 注册成功，记录用户登录状态
			req.session.user = user
			
			console.log('新用户注册成功')
			return res.status(200).json({
				success_code: 0
			})
		})
	})
})

// 用户登录
router.post('/login', function(req, res) {
	console.log(`用户:${req.body.email} 请求登录`)
	User.findOne({
		email: req.body.email,
		password: md5(md5(req.body.password))
	}, function(err, user) {
		if(err) {
			console.log('用户查找失败')
			return res.status(500).json({
				fail_code: 0
			})
		}
		
		if(!user) {
			console.log('用户无效登录')
			return res.status(200).json({
				success_code: 1
			})
		}
		
		// 注册成功，记录用户登录状态
		req.session.user = user
		
		console.log('用户登录成功')
		res.status(200).json({
			success_code: 0
		})
	})
})

// 退出登录
router.get('/logout', function(req, res) {
	req.session.user = null
	// delete req.session.user
	res.redirect('/public/img/banner/banner1.jpg')
})

// api
router.get('/topic', (req, res) => {
  fs.readFile('./public/json/topics.json', 'utf8', (err, data) => {
    if(err) console.log(err)
    res.status(200).json(JSON.parse(data))
  })
})

// 获取轮播图
router.get('/banner', (req, res) => {
  let banners = [
    '/public/img/banner/banner1.jpg',
    '/public/img/banner/banner2.jpg',
    '/public/img/banner/banner3.jpg'
  ]
  res.status(200).json(banners)
  console.log('发送了图片')
})

module.exports = router