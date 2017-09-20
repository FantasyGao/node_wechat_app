var socketIo = require('socket.io');

var we_chat = {
	userName:[],
	//在线的房间对象
	userCount:0,
    currentRoom:{},
	initialize:function(server){         //初始化聊天（将server加入socket）
		this.io = socketIo(server);	
		var _ = this;                     //保持在统一作用域
		this.io.on('connection',function(socket){
		   //有用户进入则总人数加一	
		    _.userCount++;
			_.adminEnterRoom(socket);
			_.userEnterRoom(socket);
			_.messageFromRoom(socket);
       });
	},
	//管理员进入客服主页
	adminEnterRoom:function(socket){
		var _ = this;
		socket.on('adminFlag',function(username){
			_.userName[socket.id] = username;
		});
		//在线所有人都在currentRoom里直接取即可
		this.io.emit('adminEnterRoom', this.currentRoom,this.userCount);
		//客服创建房间
		socket.on('adminCreatRoom', function(name){
			//根据选择的信息确定进入房间
			socket.join(name,function(){
				_.currentRoom[socket.id] = name;
				_.io.emit('createRoom', _.currentRoom,_.userCount);
			});
		})
	},
	//用户进入客服页面
	userEnterRoom:function(socket) {
		var _ = this;
		socket.on('userFlag',function(username){
			_.userName[socket.id] = username;
			console.log(_.userName[socket.id]);
		});
		//用户进入触发返回在线客服房间
		this.io.emit('userEnterRoom', this.currentRoom);
		//挂载用户选择事件
		socket.on('chooseRoom', function(roomNo){
			//用户离开初始页面进入客服房间
			socket.leave(_.currentRoom[socket.id], function(){
				socket.join(roomNo);
				_.currentRoom[socket.id] = roomNo;
				var userNameFlag = _.userName[socket.id];
				//用户选择房间触发
				_.io.to(_.currentRoom[socket.id]).emit('userChooseRoomToadmin',userNameFlag);
				_.io.to(_.currentRoom[socket.id]).emit('userChooseRoom',roomNo);
				//刷新在线客服房间列表
				_.io.emit('flashRoomList', _.currentRoom, _.userCount);
			});
		});
	},
	//有消息发出
	messageFromRoom:function(socket){
		var _ = this;
		socket.on('sendMessage', function(info){
			message = info;
			_.io.to(_.currentRoom[socket.id]).emit('sendMessage',_.userName[socket.id],message);
		});
		socket.on('systemMessage', function(msg){
			_.io.to(_.currentRoom[socket.id]).emit('systemMessage', msg);
		});
		socket.on('disconnect', function(){
			//离开信息返回给客服
			_.userCount--;
			_.io.to(_.currentRoom[socket.id]).emit('exitRoom',_.userName[socket.id]);
			_.io.to(_.currentRoom[socket.id]).emit('userLeave' ,_.userCount);
			delete _.userName[socket.id];
			socket.leave(_.currentRoom[socket.id]);
			_.io.emit('flashRoomList', _.currentRoom, _.userCount);
			delete _.currentRoom[socket.id];
		});
	}
};

module.exports = we_chat;


