require('date-utils');
var nodemailer = require("nodemailer");
var mysql = require('mysql');

var EventProxy = require('eventproxy');

var DATA_BASE = '***_test';

// 创建连接
var client = mysql.createConnection({
	user : '*****',
	password : '***',
	host : '****'
});

client.connect();
client.query("use " + DATA_BASE);
var today = Date.today().toFormat('YYYY-MM-DD HH24:MI:SS');
var yesterday = Date.yesterday().toFormat('YYYY-MM-DD HH24:MI:SS');
var str = Date.yesterday().toFormat('YYYY-MM-DD');
//var sql = 'select count(distinct(i.user_id)) as total from invest_repay r,invest i where r.invest_id=i.id and repay_day>=\''
//		+ yesterday + '\' and repay_day<\'' + today + '\'';
var sql = 'select count(distinct(i.user_id)) as total from invest_repay r,invest i where r.invest_id=i.id and r.status=\'repaying\' ';
console.log(sql);
var total = 0;
var ep = EventProxy.create('query_complete',function(results){
	console.log("zongshu:"+results[0].total);
});
client.query(sql,function selectCb(err, results, fields) {
				ep.emit('query_complete',results);
				if (err) {
					throw err;
				}
				if (results) {
					for (var i = 0; i < results.length; i++) {
						total = results[i].total;
						
						// 开启一个 SMTP 连接池
						var smtpTransport = nodemailer.createTransport({
							host : "smtp.mxhichina.com", // 主机
							secure : true, // 使用 SSL
							port : 465,
							auth : {
								user : "***@***.com", // 账号
								pass : "***" // 密码
							}
						});
						// 设置邮件内容
						var mailOptions = {
							from : "***.service <***@***.com>", // 发件地址
							to : "**@**,***@***", // 收件列表
							subject : "***", // 标题
							html : "用户数" + total // html 内容
						}
						// 发送邮件
						//smtpTransport.sendMail(mailOptions, function(error,
						//		response) {
						//	if (error) {
						//		console.log(error);
						//	} else {
						//		console.log("Message sent: "
						//				+ response.message);
						//	}
						//	smtpTransport.close(); // 如果没用，关闭连接池
						//});
						break;
						}
					}
					client.end();
					
			});


