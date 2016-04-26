require('date-utils');
var nodemailer = require("nodemailer");
var mysql = require('mysql');

var EventProxy = require('eventproxy');

var DATA_BASE = '****';

// 创建连接
var client = mysql.createConnection({
	user : 'htouhui',
	password : '****',
	host : '****'
});
var ep = EventProxy.create('query_complete',function(results){
	console.log("zongshu:"+results[0].total);
	var subject = '海投汇有待还金额的用户总数';
	var html = '用户总数'+results[0].total;
	var to = 'baoxing.peng@htouhui.com';
	sendEmail(html,subject,to);
});
var nowMonth = Date.today().toFormat('YYYY-MM'); 
var em = EventProxy.create('query_data_complete',function(results){
	console.log("zongshu:"+results[0]);
	console.log("size:"+results.length);
	var subject = nowMonth+'月老带新用户投资数据';
	var html ='<!-- CSS goes in the document HEAD or added to your external stylesheet --><style type="text/css">'+
		'table.gridtable {font-family: verdana,arial,sans-serif;font-size:11px;color:#333333;border-width: 1px;border-color: #666666;border-collapse: collapse;}'+
		'table.gridtable th {border-width: 1px;padding: 8px;border-style: solid;border-color: #666666;background-color: #dedede;}'+
		'table.gridtable td {border-width: 1px;padding: 8px;border-style: solid;border-color: #666666;background-color: #ffffff;}</style>'+
		'<table class="gridtable"><tr><th>用户id</th><th>注册时间</th><th>手机号</th><th>投资总额</th><th>推荐人</th></tr>';
	if(results!=null){
	 for(i=0;i<results.length;i++){
		html += '<tr>';
		html += '<td>'+results[i].id+'</td>';
		html += '<td>'+results[i].register_time.toFormat('YYYY-MM-DD HH24:MI:SS')+'</td>';
		html += '<td>'+results[i].mobile_number+'</td>';
		html += '<td>'+results[i].invest_total+'</td>';
		html += '<td>'+results[i].referrer+'</td>';
		html += '</tr>';
	 }
	}
	var to = 'baoxing.peng@htouhui.com';
	sendEmail(html,subject,to);
});
client.connect();
client.query("use " + DATA_BASE);
var today = Date.today().toFormat('YYYY-MM-DD HH24:MI:SS');
var yesterday = Date.yesterday().toFormat('YYYY-MM-DD HH24:MI:SS');
var str = Date.yesterday().toFormat('YYYY-MM-DD');
//var sql = 'select count(distinct(i.user_id)) as total from invest_repay r,invest i where r.invest_id=i.id and repay_day>=\''
//		+ yesterday + '\' and repay_day<\'' + today + '\'';
var sql = 'select count(distinct(i.user_id)) as total from *** r,*** i where r.invest_id=i.id and r.status=\'repaying\' ';
console.log(sql);
var total = 0;

client.query(sql,
	function selectCb(err, results, fields) {
		
		if (err) {
			throw err;
		}
				
		if (results) {
			ep.emit('query_complete',results);
		}
});

var monthFirstDay = nowMonth+'-01 00:00:00'; //获取当前月的第一天
sql = 'SELECT u.id,u.***,u.***,sum(i.invest_money) as invest_total,u.referrer FROM `***` i,'+
'*** u where i.status!=\'cancel\' and u.register_time>=\''+monthFirstDay+'\' and i.user_id=u.id and u.referrer in(SELECT id from user) GROUP BY u.id';

client.query(sql,
	function selectCb(err, results, fields) {
		
		if (err) {
			throw err;
		}
				
		if (results) {
		console.log('resultfirst:'+results);
			em.emit('query_data_complete',results);
			client.end();
		}
});
var sendEmail=function(html,subject,to){
	// 开启一个 SMTP 连接池
	var smtpTransport = nodemailer.createTransport({
		host : "smtp.mxhichina.com", // 主机
		secure : true, // 使用 SSL
		port : 465,
		auth : {
			user : "***@***.com", // 账号
			pass : "*********" // 密码
		}
	});
	// 设置邮件内容
	var mailOptions = {
		from : "htouhui.service <***@***.com>", // 发件地址
		to : to,  // 收件列表
		subject : subject,  // 标题
		html : html// html 内容
	}
	// 发送邮件
	smtpTransport.sendMail(mailOptions, function(error,
		response) {
		if (error) {
			console.log(error);
		} else {
			console.log("Message sent: "+ response.message);
		}
		smtpTransport.close(); // 如果没用，关闭连接池
	});
}		


