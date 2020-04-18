let base_url = 'http://192.168.10.234/karen/caveolae'
let userId = 1,//2
    token = 1;//1
// let userId = sessionStorage.getItem('userId'),//2
//     token = sessionStorage.getItem('token');//1
let chartid,
    minePhoto,
    mineName;
let roles_flag;//角色标识

/**
 * 请求加盟商头像及昵称
 * */
~function Franchisee_info(){
    $.ajax({
        url:base_url+'/queryFranchiseePhotoAndNickName',
        type:'get',
        headers:{
            userId:userId,
            token:token
        },
        dataType:'json',
        success:function(data){
            console.log(data.Value);
            mineName=data.Value.NickName
            minePhoto=data.Value.Photo

        }

    })
}()

/**
 * 封装：
 *   原型上封装获取当前时间并且格式化的方法
 * 用法：
 *   new Date().Format("yyyy-MM-dd HH:mm:ss")
 *  */
Date.prototype.Format = function (fmt) {
        let o = {
            "M+": this.getMonth() + 1, //月份 
            "d+": this.getDate(), //日 
            "H+": this.getHours(), //小时 
            "m+": this.getMinutes(), //分 
            "s+": this.getSeconds(), //秒 
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
            "S": this.getMilliseconds() //毫秒 
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (let k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }
/**
 * Date原型封装：timestampFormate
 *      自定义时间格式
 *      装换格式：
 *          1minute：刚刚
 *          1hour内：n分钟前
 *          当天：xx:xx
 *          昨天：昨天
 *          昨天之前：xxxx年xx月xx日
 * 使用方法：new Date().timestampFormate(xxxx-xx-xx xx:xx:xx) 
 *  */
Date.prototype.timestampFormate=function(in_timetamp){
    let timestamp=Date.parse(in_timetamp)/1000;
    console.log(timestamp)
    function add_zero(num){// 不足十位，补零
        return String(num).length==1?('0'+num):num;
    }   
    let currentTimestamp=parseInt(new Date().getTime()/1000)//当前时间戳(秒)
    let timestampDiff=currentTimestamp-timestamp;//传入时间戳与当前时间戳秒差

    let curDate=new Date(currentTimestamp*1000);//当前时间日期对象
    let paramDate=new Date(Date.parse(in_timetamp));//传入时间转换成日期对象
    console.log(currentTimestamp,timestampDiff,curDate,paramDate)

    let Y=paramDate.getFullYear(),M=paramDate.getMonth()+1,D=paramDate.getDate();//获取传入时间的年月日
    let H=paramDate.getHours(),I=paramDate.getMinutes(),S=paramDate.getSeconds();//获取当前时间时分秒

    if(timestampDiff<60){
        return '刚刚'
    }else if(timestampDiff<3600){
        return Math.floor(timestampDiff/60)+'分钟前'
    }else if(curDate.getFullYear() == Y && curDate.getMonth()+1 == M && curDate.getDate() == D ){
        return add_zero(H)+':'+add_zero(I);
    }else{
        let newDate=new Date((currentTimestamp-86400)*1000);//当前时间戳减一天转换成日起对象
        if(newDate.getFullYear()===Y&&newDate.getMonth()+1==M&&newDate.getDate()==D){
            return '昨天'
        }else if(curDate.getFullYear()==Y){
            return add_zero(M)+'/'+add_zero(D)
        }else{
            return Y+'/'+add_zero(M)+'/'+add_zero(D)
        }
    }

}
/**
 * 建立websocket
 *   接收推送消息并且渲染
 * */
~function wbs() {
    let websocket = new WebSocket("ws://192.168.10.234:8088/ws/web/" + userId);
    websocket.onopen = function () {
        console.log("欢迎你")
    };
    //接收到消息的回调方法
    websocket.onmessage = function (wewe) {
        console.log('socket推送消息',wewe)
        if(wewe.isTrusted==true){            
            let MessageContent = JSON.parse(wewe.data).MessageContent;
            let message_type=JSON.parse(wewe.data).MessageType=='InsideChat'?"commer":"user"//判断是用户消息还是客服台消息
            let identity_url=message_type=='user'?'/querySingleMessageHotel':'/querySingleChatMessage';//根据身份访问不同地址
            if (MessageContent.ChatId == chartid&&message_type==roles_flag) {//单条数据请求，更新内容框最新消息              
                $.ajax({
                    url: base_url + identity_url+'?messageId=' + MessageContent.ChatMessageId,
                    type: 'GET',
                    headers: {
                        userId: userId,
                        token: token
                    },
                    dataType: 'json',
                    success: function (data) {
                        console.log(data)
                        let data_detail = data.Value                        
                        if (data_detail.MessageSubject == "Me" || data_detail.MessageSubject == "Franchisee"){                            
                            if (data_detail.MessageType == "Written") {
                                console.log(data_detail.MessageSubject,data_detail.MessageType)
                                $("#chat_ul").append(`<li class="self">
                                                        <div class="avatar"><img src="${data_detail.Photo}" alt=""></div>
                                                        <div class="msg">
                                                            <p class="msg-name">${data_detail.NickName}</p>
                                                            <p class="msg-text">${data_detail.Message} <emoji class="pizza"></emoji>
                                                            </p>
                                                            <time>${data_detail.Date}</time>
                                                        </div>
                                                    </li>`)
                            }else if(data_detail.MessageType == "Picture"){
                                $("#chat_ul").append(`<li class="self">
                                                        <div class="avatar"><img src="${data_detail.Photo}" alt=""></div>
                                                        <div class="msg">
                                                            <p class="msg-name">${data_detail.NickName}</p>
                                                            <div class="msg-text" style="max-width:340px;">
                                                                <a href="javascript:;"><img src="${data_detail.Message}" alt="" srcset="" id="img_id${data_detail.MessageId}" data-messageId="${data_detail.MessageId}" onclick="imgPage(this)" style="width:100%;"></a>
                                                                <emoji class="pizza"></emoji>
                                                            </div>
                                                            <time>${data_detail.Date}</time>
                                                        </div>
                                                    </li>`)
                            }else if(data_detail.MessageType=="RoomInquiry"){//推荐房源
                                $("#chat_ul").append( `<li class="self">
                                                        <div class="avatar"><img src="${data_detail.Photo}" alt=""></div>
                                                        <div class="msg">
                                                            <p class="msg-name">${data_detail.NickName}</p>
                                                            <div style="display: flex;
                                                                        flex-direction: row;
                                                                        justify-content: space-evenly;
                                                                        align-items: center;
                                                                        background-color: bisque;
                                                                        width: 165px;
                                                                        height: 57px;
                                                                        border-radius: 10px;">
                                                                <div>
                                                                    <img src="${data_detail.Message.RoomPhoto}" style="width:60px">
                                                                </div>
                                                                <div style="display: flex;margin-left: 3px;flex-direction: column;align-items: end;">
                                                                    <p style="padding: 3px 0px;">${data_detail.Message.RoomType=="S1T1"?"一室一厅":data_detail.Message.RoomType=="HaoHuaBiaoZhunFang"?"豪华标准房":data_detail.Message.RoomType=="HuiYiShi"?"会议室":data_detail.Message.RoomType=="HaoHuaDaChuangFang"?"豪华大床房":"未知房型需查看"}</p>
                                                                    <span>¥ ${data_detail.Message.Price}</span>
                                                                </div>
                                                            </div>
                                                            <time>${data_detail.Date}</time>
                                                        </div>
                                                    </li>`)
                            }                                                   
                            $("#chat_ul").scrollTop($("#chat_ul")[0].scrollHeight); //滚动条到最底部
                        } else if(data_detail.MessageSubject == "Other" || data_detail.MessageSubject == "Desktop"){
                            if (data_detail.MessageType == "Written") {
                                $("#chat_ul").append(`<li class="other">
                                                        <div class="avatar"><img src="${data_detail.Photo}" alt=""></div>
                                                        <div class="msg">
                                                            <p class="msg-name">${data_detail.NickName}</p>
                                                            <p class="msg-text">${data_detail.Message}  <emoji class="pizza"></emoji>
                                                            </p>
                                                            <time>${data_detail.Date}</time>
                                                        </div>
                                                    </li>`)
                            }else if(data_detail.MessageType == "Picture"){
                                $("#chat_ul").append(`<li class="other">
                                                        <div class="avatar"><img src="${data_detail.Photo}" alt=""></div>
                                                        <div class="msg">
                                                            <p class="msg-name">${data_detail.NickName}</p>
                                                            <div class="msg-text" style="max-width:340px;">
                                                                <a href="javascript:;"><img src="${data_detail.Message}" alt="" srcset="" id="img_id${data_detail.MessageId}" data-messageId="${data_detail.MessageId}" onclick="imgPage(this)" style="width:100%;"></a>
                                                                <emoji class="pizza"></emoji>
                                                            </div>
                                                            <time>${data_detail.Date}</time>
                                                        </div>
                                                    </li>`)
                            }else if(data_detail.MessageType=="RoomInquiry"){//推荐房源
                                $("#chat_ul").append( `<li class="other">
                                                        <div class="avatar"><img src="${data_detail.Photo}" alt=""></div>
                                                        <div class="msg">
                                                            <p class="msg-name">${data_detail.NickName}</p>
                                                            <div style="display: flex;flex-direction: row;justify-content: space-evenly;align-items: center;background-color: bisque;width: 165px;height: 57px;border-radius: 10px;">
                                                                <div>
                                                                    <img src="${data_detail.Message.RoomPhoto}" style="width:60px">
                                                                </div>
                                                                <div style="display: flex;margin-left: 3px;flex-direction: column;align-items: end;">
                                                                    <p style="padding: 3px 0px;">${data_detail.Message.RoomType=="S1T1"?"一室一厅":data_detail.Message.RoomType=="HaoHuaBiaoZhunFang"?"豪华标准房":data_detail.Message.RoomType=="HuiYiShi"?"会议室":data_detail.Message.RoomType=="HaoHuaDaChuangFang"?"豪华大床房":"未知房型需查看"}</p>
                                                                    <span>¥ ${data_detail.Message.Price}</span>
                                                                </div>
                                                            </div>
                                                            <time>${data_detail.Date}</time>
                                                        </div>
                                                    </li>`)
                            }
                            $("#chat_ul").scrollTop($("#chat_ul")[0].scrollHeight); //滚动条到最底部
                        }
                    }
                })
            }else{
                console.log(message_type,MessageContent.ChatId)
                console.log("这是message_type",message_type+'-cirRed'+MessageContent.ChatId)
                console.log('这是未出现的会话',document.getElementById(message_type+'-cirRed'+MessageContent.ChatId))
                if(document.getElementById(message_type+'-cirRed'+MessageContent.ChatId)!==null&&document.getElementById(message_type+'-cirRed'+MessageContent.ChatId)!==undefined){
                    //未读消息显示红点
                    document.getElementById(message_type+'-cirRed'+MessageContent.ChatId).style.display='inline';
                    //未读消息累加，红点儿数字累加
                    document.getElementById(message_type+'-cirRed'+MessageContent.ChatId).value=Number(document.getElementById(message_type+'-cirRed'+MessageContent.ChatId).value)+1;
                    $.ajax({//单条数据请求,更新用户或加盟商列表数据
                        url: base_url + identity_url+'?messageId=' + MessageContent.ChatMessageId,
                        type: 'GET',
                        headers: {
                            userId: userId,
                            token: token
                        },
                        dataType: 'json',
                        success:function(data){
                            console.log(data.Value)
                            let data_detail=data.Value;
                            //对应用户和客服台列表消息更新
                            document.getElementById(message_type+'-listMessage'+MessageContent.ChatId).innerText=(data_detail.MessageType=="Written"?data_detail.Message:data_detail.MessageType=="RoomInquiry"?"房间咨询":data_detail.MessageType=="Voice"?"语音":data_detail.MessageType=="Picture"?"图片":data_detail.MessageType=="Expression"?"表情":"视频");
                            //对应用户和客服台列表时间更新
                            document.getElementById(message_type+'-messageTime'+MessageContent.ChatId).innerText=(new Date().timestampFormate(data_detail.Date))
                        }
                    })                    
                }else{
                    layui.use('layer',function(){
                        let $ = layui.jquery, layer = layui.layer;
                        layer.open({
                            type: 1
                            , title: '提示'
                            , fix: false //是否固定
                            , area: ['300px', '400px']
                            , content: '<div><h1>新消息，需刷新页面</h1></div>' //弹出层展示内容
                            , btn: ['取消','确定']
                            , yes: function (index, layero){
                                layer.close(layer.index)
                            } 
                            ,btn2:function(){
                                location.reload()
                            }
                        })    
                    })
                }
            }
        }
        // setMSGInHtml(event.data);
    }
    websocket.onerror = function () {
        //setMSGInHtml("连接时发生错误");
        console.log("连接失败")
    };

    websocket.onclose = function () {
        // setMSGInHtml("连接已经关闭")
        console.log('已关闭聊天')
    }

    // //即将离开当前页面（刷新或关闭）时触发
    // window.onbeforeunload = function () {
    //     closeWebSocket();
    // }

    // //close
    // function closeWebSocket() {
    //     websocket.close();
    // }

}()

/**
 *请求用户会话列表
 *请求客服台会话列表
 * */
~ function requestSession() {
    $.ajax({//查询用户会话列表
        url: base_url + '/queryHotel',
        type: 'GET',
        headers: {
            userId: userId,
            token: token
        },
        dataType: 'json',
        success: function (data) {
            // console.log(data)
            let session_list = data.Value;
            let data_list = '';
            if(session_list!==null){
                session_list.map((item) => {
                    data_list += `<li onclick="list_detail(this)"data-er="user" data-name="${item.NickName}" data-chartId="${item.ChatId}" data-timeStamp="${item.Date}">
                                <input type="text" id="user-cirRed${item.ChatId}" class="cir-red">
                                <div class="list-box">                                
                                    <img class="chat-head" src="${item.UserPhoto}" alt="">
                                    <div class="chat-rig">
                                        <div class="title">
                                            <p>${item.ChatType=="Consultation"?'咨询':item.ChatType=="CheckIn"?'入住':'退房'}</p>
                                            <p>·</p>
                                            <p class="userName">${item.NickName}</p>
                                            <!--<div id="user-messageTime${item.ChatId}">${item.Date.split(' ')[0].substr(5)}</div>-->
                                            <div id="user-messageTime${item.ChatId}">${new Date().timestampFormate(item.Date)}</div>
                                        </div>
                                        <div class="text"><span id="user-listMessage${item.ChatId}">${item.LatMessageType=="Written"?item.LatMessage:item.LatMessageType=="RoomInquiry"?"房间咨询":item.LatMessageType=="Voice"?"语音":item.LatMessageType=="Picture"?"图片":item.LatMessageType=="Expression"?"表情":"视频"}</span></div>
                                        <div class="text">${item.RoomName}</div>
                                    </div>
                                </div>
                            </li>`
                })
                $('.chat-list').html(data_list)
            }
            
        }
    })

    $.ajax({//查询客服台列表
        url: base_url + '/hotelSessionList',
        type: 'GET',
        headers: {
            userId: userId,
            token: token
        },
        dataType: 'json',
        success: function (data) {
            // console.log(data)
            let session_list = data.Value;
            let data_list = '';
            if(session_list!=null){
                session_list.map((item) => {
                    data_list += `<li onclick="list_detail(this)"data-er="commer" data-name="${item.NickName}" data-chartId="${item.ChatId}" data-timeStamp="${item.Date}">
                                <input type="text" id="commer-cirRed${item.ChatId}" class="cir-red">
                                <div class="list-box">
                                    <img class="chat-head" src="${item.UserPhoto}" alt="">
                                    <div class="chat-rig">
                                        <div class="title">
                                            <!--<!--<p>${item.ChatType=="Consultation"?'咨询':item.ChatType=="CheckIn"?'入住':'退房'}</p>
                                            <p>·</p>-->
                                            <p class="userName">${item.NickName}</p>
                                            <!--<div id="commer-messageTime${item.ChatId}">${item.Date.split(' ')[0].substr(5)}</div>-->
                                            <div id="commer-messageTime${item.ChatId}">${new Date().timestampFormate(item.Date)}</div>
                                        </div>
                                        <div class="text"><span id="commer-listMessage${item.ChatId}">${item.LatMessageType=="Written"?item.LatMessage:item.LatMessageType=="RoomInquiry"?"房间咨询":item.LatMessageType=="Voice"?"语音":item.LatMessageType=="Picture"?"图片":item.LatMessageType=="Expression"?"表情":item.LatMessageType=="Video"?"视频":item.LatMessageType=="TaskProgress"?"任务进度":"抢单"}</span></div>
                                        <!--<div class="text">${item.RoomName}</div>-->
                                    </div>
                                </div>
                            </li>`
                })
                $('.chat-list-customer').html(data_list)
            }
        }
    })
}()

/* 打开聊天室，渲染记录 */
function setMSGInHtml(toHtml) {
    let chat_ul = document.getElementById('chat_ul');
    let message = toHtml;
    //按钮及输入框
    let send_btn = `<div class="but-nav">
                        <ul>
                            <!--<li class="font"></li>-->
                            <li id="emoji" class="face li_btn"></li>
                            <li id="fangyuan" class="fangyuan li_btn"></li>
                            <li class="page li_btn">
                                <input style="position:absolute; opacity:0;width: 25px;" type="file" name="file" id="album_img" accept="image/*"/> 
                            </li>
                            <li class="common_words li_btn" id="common_words"></li>
                            <li class="chat_record li_btn" id="chat_record"></li>
                        </ul>
                        <a href="#" class="button send_btn" onclick="send(chartid)">发送</a>
                    </div>
                    <div id="but_txt" class="but-text Input_Box">
                        <div name="send_txt" id="send_txt" class="Input_text" contenteditable="true" onkeydown=keydown(chartid)></div>                       
                    </div>`
    chat_ul.innerHTML = '' //清空数据
    $(".sendto").children().remove();
    message.map(item => { //用户,加盟商聊天记录
        if (item.MessageSubject == "Other"||item.MessageSubject == "Desktop") {
            if (item.MessageType == "Written") {//文字
                chat_ul.innerHTML += `<li class="other">
                                        <div class="avatar"><img src="${item.Photo}" alt=""></div>
                                        <div class="msg">
                                            <p class="msg-name">${item.NickName}</p>
                                            <p class="msg-text">${item.Message}<emoji class="pizza"></emoji>
                                            </p>
                                            <time>${item.Date}</time>
                                        </div>
                                    </li>`
            }else if(item.MessageType == "Picture"){//图片
                chat_ul.innerHTML += `<li class="other">
                                        <div class="avatar"><img src="${item.Photo}" alt=""></div>
                                        <div class="msg">
                                            <p class="msg-name">${item.NickName}</p>
                                            <div class="msg-text" style="max-width:340px;">
                                                <a href="javascript:;"><img src="${item.Message}" alt="" srcset="" id="img_id${item.MessageId}" data-messageId="${item.MessageId}" onclick="imgPage(this)" style="width:100%;"></a>
                                                <emoji class="pizza"></emoji>
                                            </div>
                                            <time>${item.Date}</time>
                                        </div>
                                    </li>`
            }else if(item.MessageType=="RoomInquiry"){//推荐房源
                chat_ul.innerHTML += `<li class="other">
                                        <div class="avatar"><img src="${item.Photo}" alt=""></div>
                                        <div class="msg">
                                            <p class="msg-name">${item.NickName}</p>
                                            <div style="display: flex;
                                                        flex-direction: row;
                                                        justify-content: space-evenly;
                                                        align-items: center;
                                                        background-color: bisque;
                                                        width: 165px;
                                                        height: 57px;
                                                        border-radius: 10px;">
                                                <div>
                                                    <img src="${item.Message.RoomPhoto}" style="width:60px">
                                                </div>
                                                <div style="display: flex;margin-left: 3px;flex-direction: column;align-items: end;">
                                                    <p style="padding: 3px 0px;">${item.Message.RoomType=="S1T1"?"一室一厅":item.Message.RoomType=="HaoHuaBiaoZhunFang"?"豪华标准房":item.Message.RoomType=="HuiYiShi"?"会议室":item.Message.RoomType=="HaoHuaDaChuangFang"?"豪华大床房":"未知房型需查看"}</p>
                                                    <span>¥ ${item.Message.Price}</span>
                                                </div>
                                            </div>
                                            <time>${item.Date}</time>
                                        </div>
                                    </li>`
            }
        } else { //加盟商聊天记录
            if (item.MessageType == "Written") {
                chat_ul.innerHTML += `<li class="self">
                                        <div class="avatar"><img src="${item.Photo}" alt=""></div>
                                        <div class="msg">
                                            <p class="msg-name">${item.NickName}</p>
                                            <p class="msg-text">${item.Message}
                                                <emoji class="pizza"></emoji>
                                            </p>
                                            <time>${item.Date}</time>
                                        </div>
                                    </li>`
            }else if(item.MessageType == "Picture"){
                chat_ul.innerHTML += `<li class="self">
                                        <div class="avatar"><img src="${item.Photo}" alt=""></div>
                                        <div class="msg">
                                            <p class="msg-name">${item.NickName}</p>
                                            <div class="msg-text" style="max-width:340px;">
                                                <a herf="javascript:;"><img src="${item.Message}" alt="" srcset="" id="img_id${item.MessageId}" data-messageId="${item.MessageId}" onclick="imgPage(this)" style="width:100%;"></a>
                                                <emoji class="pizza"></emoji>
                                            </div>
                                            <time>${item.Date}</time>
                                        </div>
                                    </li>`
            }else if(item.MessageType == "RoomInquiry"){
                chat_ul.innerHTML += `<li class="self">
                                        <div class="avatar"><img src="${item.Photo}" alt=""></div>
                                        <div class="msg">
                                            <p class="msg-name">${item.NickName}</p>
                                            <div style="display: flex;
                                                        flex-direction: row;
                                                        justify-content: space-evenly;
                                                        align-items: center;
                                                        background-color: bisque;
                                                        width: 165px;
                                                        height: 57px;
                                                        border-radius: 10px;">
                                                <div>
                                                    <img src="${item.Message.RoomPhoto}" style="width:60px">
                                                </div>
                                                <div style="display: flex;margin-left: 3px;flex-direction: column;align-items: end;">
                                                    <p style="padding: 3px 0px;">${item.Message.RoomType=="S1T1"?"一室一厅":item.Message.RoomType=="HaoHuaBiaoZhunFang"?"豪华标准房":item.Message.RoomType=="HuiYiShi"?"会议室":item.Message.RoomType=="HaoHuaDaChuangFang"?"豪华大床房":"未知房型需查看"}</p>
                                                    <span>¥ ${item.Message.Price}</span>
                                                </div>
                                            </div>
                                            <time>${item.Date}</time>
                                        </div>
                                    </li>`
            }
        }
    })
    $("#chat_ul").scrollTop($("#chat_ul")[0].scrollHeight); //滚动条到最底部
    $(".sendto").append(send_btn) //渲染输入框和发送按钮
    chatemoji() //聊天表情,常用语,聊天记录查询,推荐房源
}

/**
 * 主动创建客服台聊天
 * */
~function(){
    if(sessionStorage.getItem('chatid')!==null){
        chartid=sessionStorage.getItem('chatid');
        let currentTime = (new Date()).Format("yyyy-MM-dd HH:mm:ss") //时间格式化
        let session_click = {//保存data传送数据
            ChatId:chartid,
            Type: 'History',
            Date: currentTime
        }
        $.ajax({
            url: base_url+'/queryChatMessage',
            type: 'POST',
            headers: {
                token: token,
                userId: userId
            },
            data: JSON.stringify(session_click),
            dataType: 'json',
            contentType: 'application/json',
            success: function (data) {
                console.log(data)
                let session_message = data.Value;
                setMSGInHtml(session_message) //渲染页面数据
            }
        })
    }else{
        console.log('chatID为null')
    }
}()

/**
 * 点击会话列表
 *  */
function list_detail(e) {
    let time = (new Date()).Format("yyyy-MM-dd HH:mm:ss") //时间格式化
    console.log(e.dataset.chartid, e.dataset.timestamp,e.dataset.er)
    let ChatId = e.dataset.chartid;
    chartid = e.dataset.chartid;//保存到全局
    roles_flag=e.dataset.er;//保存到全局
    let url_list=e.dataset.er=="user"?"/queryHotelMessage":"/queryChatMessage";//判断路径
    let session_click = {//保存data传送数据
        ChatId: e.dataset.chartid,
        Type: 'History',
        Date: time
    }
    // console.log(session_click,url_list)
    //创建聊天室，聊天记录请求
    $.ajax({
        url: base_url+url_list,
        type: 'POST',
        headers: {
            token: token,
            userId: userId
        },
        data: JSON.stringify(session_click),
        dataType: 'json',
        contentType: 'application/json',
        success: function (data) {
            console.log(data)
            let session_message = data.Value;
            setMSGInHtml(session_message) //渲染页面数据
        }
    })
    //聊天房间请求
    if(e.dataset.er=="user"){//判断是不是用户
        $.ajax({
            url: base_url + '/queryByChatForRoomHotel?chatId=' + ChatId,
            headers: {
                userId: userId,
                token: token
            },
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                console.log(data.Value)
                let data_retail = data.Value;
                let roomInfo = `
                            <div class="room_img">
                                <img src="${data_retail.RoomPhoto}" alt="" srcset="">
                            </div>
                            <div class="room_detail">
                                <div>${data_retail.RoomName}</div>
                                <div>
                                    <span>${data_retail.ChatType=="Consultation"?'咨询':data_retail.ChatType=="CheckIn"?'入住':'退房'}</span>
                                    <span>·</span><span>${time}</span>
                                </div>
                            </div>
                            `
                $('.nav-top').html(roomInfo);
                $('.top').html(`<p>${data_retail.NickName}</p>`)
            }
        })
    }else{
        $('.top').html(`<p>${e.dataset.name}</p>`)
        $('.nav-top').html('');
    }
    //隐藏当前user/commer未读消息红点
    document.getElementById(roles_flag+'-cirRed'+ChatId).value='';
    document.getElementById(roles_flag+'-cirRed'+ChatId).style.display='none';//隐藏未读消息红点

}

/**
 * 发送数据
 *  */
function send(catid) {
    //获取输入框内容
    let message = $('#send_txt').html();
    // let message = replace_em($('#send_txt').html());
    let data_info = {
        ChatId: chartid,
        UserType: 'Franchisee',
        Message: message,
        MessageType: 'Written'
    }
    let url_list=roles_flag=="user"?"/sendMessage":"/hotelChat";//判断是用户请求还是客服请求
    console.log(data_info)
    if (message != '') {
        $.ajax({// send 信息
            url: base_url+url_list,
            type: 'post',
            dataType: 'json',
            headers: {
                token: token,
                userId: userId
            },
            data: JSON.stringify(data_info),
            contentType: 'application/json',
            success: function (data) {
                // console.log(data);
                if (data.Status == true) {
                    let newmessage;
                    if(roles_flag=="user"){
                            newmessage = `<li class="self">
                                            <div class="avatar"><img src="${minePhoto}" alt=""></div>
                                            <div class="msg">
                                                <p class="msg-name">${mineName}</p>
                                                <p class="msg-text">${message}<emoji class="pizza">
                                                    </emoji>
                                                </p>
                                                <time>${new Date().Format("yyyy-MM-dd HH:mm:ss")}</time>
                                            </div>
                                        </li>`
                    }                   
                    $("#chat_ul").append(newmessage) //发送数据渲染到页面
                    $('#send_txt').html(''); //输入框清空
                    $("#chat_ul").scrollTop($("#chat_ul")[0].scrollHeight); //滚动条在最底部
                }
            }
        })
    } else {
        alert("消息不能为空");
    }


}

/**
 * Enter发送;
 * Shift+Enter换行
 *  */
function keydown(catid) {
    if (!event.shiftKey && event.keyCode == 13) {
        event.preventDefault();
        event.stopPropagation();
        send(catid)
    }
}

/**
 * 聊天表情；
 * 图片:
 *   正常传输和
 *   拖拽传输及
 *   粘贴传输；
 * 文本：
 *   文本粘贴
 * 常用语增删改查；
 * 聊天记录
 * */
function chatemoji() {
    $(function () {
        /**
         * 表情处理
         *  */
        $('#emoji').qqFace({
            id: 'facebox',
            assign: 'send_txt',
            path: './drawable-xxhdpi' //表情存放的路径
        });

        /**
         * 图片传输(点击图片选择按钮)
         *  */
        $('.page').on('change','#album_img',function(){
            console.log(this.files)
            handle_picture("filelist",this.files);         
        })

        /**
         * 图片拖拽
         *  */
        let but_txt=document.getElementById('but_txt');
        // let Input_text=document.getElementById('send_txt')
        console.log("我是but_txt",but_txt)
        but_txt.addEventListener("dragenter",function(e){//当拖动元素或选中的文本到一个可释放目标时触发
            e.stopPropagation();//阻止冒泡
            e.preventDefault();//阻止默认行为
        },false)
        but_txt.addEventListener("dragover",function(e){//当元素或选中的文本被拖到一个可释放目标上时触发（每100毫秒触发一次）
            e.stopPropagation();
            e.preventDefault();
        },false)
        but_txt.addEventListener("drop",function(e){//当元素或选中的文本在可释放目标上被释放时触发
            e.stopPropagation();
            e.preventDefault();
            console.log(e)
            console.log(e.dataTransfer)
            let dt = e.dataTransfer;
			let files = dt.files;
            console.log(files)
			handle_picture("filelist",files);

        },false)

        /**
         * 图片粘贴;
         * 文本粘贴
         * */
        but_txt.addEventListener("paste",function(event){
            console.log('这是粘贴输出',event.clipboardData,event.clipboardData.items)
            let paste_items= event.clipboardData && event.clipboardData.items
            console.log(paste_items.length)
            let files = null;
            if (paste_items && paste_items.length) {
                // 检索剪切板paste_items中的image
                for (let i = 0; i < paste_items.length; i++) {
                    if (paste_items[i].type.indexOf('image') !== -1) {
                        files = {0:paste_items[i].getAsFile()}; //getAsFile()此方法是在浏览器下才会有的方法，
                        break;
                    }
                }
            }
            if(files==null){//文本文字粘贴
                handle_text(event)
            }else{//图片粘贴
                handle_picture("filelist",files);
            }
            
        })

        /**
         * 封装：handle_picture
         *     图片转码
         *     图片发送
         * param:
         *    data: 对象类型
         * */
        function handle_picture(type,data){        		
			// 处理结果			
            let reader = new FileReader();
            // reader.readAsText(file); //.txt文件转base64码
            reader.readAsDataURL(data[0]);//图片转base64码
            reader.onload = function(e){
                // console.log(e.target.result)
                console.log( reader.result);  //或者 e.target.result都是一样的，都是base64码
                let base64_pic_code_all=reader.result
                let base64_pic_code=reader.result.split(',')[1];//code码截取
                let data_info = {
                    ChatId: chartid,
                    UserType: 'Franchisee',
                    Message: base64_pic_code,
                    MessageType: 'Picture'
                }
                let url_list=roles_flag=="user"?"/sendMessage":"/hotelChat";//判断是用户请求还是客服请求
                $.ajax({//base64码提交后台
                    url: base_url+url_list,
                    type: 'post',
                    dataType: 'json',
                    headers: {
                        token: token,
                        userId: userId
                    },
                    data: JSON.stringify(data_info),
                    contentType: 'application/json',
                    success:function(data){
                        // console.log(data)
                        if (data.Status == true) {
                            let newmessage = `<li class="self">
                                                    <div class="avatar">
                                                        <img src="${minePhoto}" alt="">
                                                    </div>
                                                    <div class="msg">
                                                        <p class="msg-name">${mineName}</p>
                                                        <div class="msg-text" style="max-width:340px;">
                                                            <img src="${base64_pic_code_all}" alt="" srcset="" id="img_id${data.Value}" data-messageId="${data.Value}" onclick="imgPage(this)" style="width:100%;">
                                                            <emoji class="pizza">
                                                            </emoji>
                                                        </div>
                                                        <time>${new Date().Format("yyyy-MM-dd HH:mm:ss")}</time>
                                                    </div>
                                                </li>`
                            roles_flag=="user"?($("#chat_ul").append(newmessage)):'';                           
                            $('#send_txt').html('');
                            $("#chat_ul").scrollTop($("#chat_ul")[0].scrollHeight); //滚动条在最底部
                        }
                    }
                })

            };                                    
        };

        /**
         * 常用语增删改查 
         * */
        $('.common_words').click(function(){          
            $.ajax({ //查询常用语 
                url: base_url + '/queryAdminLanguage',
                type: 'GET',
                headers: {
                    userId: userId,
                    token: token
                },
                dataType: 'json',
                success:function(data){
                    console.log("这是查询常用语",data.Value)
                    let common_words;
                    if(data.Value!== null){ //常用语不为空
                        // console.log(data.Value)
                        let words_list='';
                        let common_words_All=data.Value;
                        console.log(common_words_All.length)
                        common_words_All.map((item,index)=>{
                            if(item!==null&&item!=""){
                                console.log(item)
                            words_list+=`                                            
                                        <li style="display:flex;justify-content: space-around;align-items: center;flex-direction: row; margin-top:2px">
                                            <div type="text" style=" height:20px;width:60%; outline-style: none ;border: 1px solid #ccc; border-radius: 3px;padding: 4px 5px;font-size: 14px; font-weight: 700;font-family: Microsoft soft;outline: 0;-webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,.075),0 0 8px rgba(102,175,233,.6);" onclick="send_words('${item.Language}')">${item.Language}</div>
                                            <div style="width:35%; display:flex;justify-content: space-around;align-items: center;flex-direction: row; margin-top:2px">
                                                <button class="layui-btn layui-btn-sm layui-btn-normal" data-words="${item.Language}" data-id="${item.LanguageId}" onclick="edit_words(this,${item.LanguageId})">编辑</button>
                                                <button class="layui-btn layui-btn-sm layui-btn-danger" data-id="${item.LanguageId}" onclick="delete_words(this,${item.LanguageId})">删除</button>
                                            </div>
                                            
                                        <li>                                        
                                        `
                            }
                            
                        })
                        common_words=`<ul id="words_list">${words_list}</ul>`
                        
                    }else{//'value===null'时
                        common_words=`<div style="width:100%;height:100%;display:flex;justify-content: center;align-items: center;flex-direction: column">                                        
                                        <p>你可以创建一些常用语，</p>
                                        <p>用于回答一些对方提出的常见问题</p>
                                    </div>`
                    }                    
                    layui.use('layer',function(){//常用语弹出层                        
                        let $ = layui.jquery, layer = layui.layer;
                        layer.open({
                            type: 1
                            , title: '常用回复'
                            , fix: false //是否固定
                            , area: ['300px', '400px']
                            , content: common_words //弹出层展示内容
                            , btn: ['添加一条常用回复']
                            , yes: function (index, layero) {//添加一条常用语
                                layui.use('layer',function(){
                                    let $ = layui.jquery, layer = layui.layer;
                                    layer.open({
                                    type: 1
                                    , title: '编辑常用回复'
                                    , fix: false //是否固定
                                    , area: ['300px', '400px']
                                    , content: `
                                                <form  class="layui-form">
                                                    <div class="layui-form-item">
                                                        <label class="layui-form-label" style="width: auto;">内容</label>
                                                        <div class="layui-input-block" style="margin-left: auto;">
                                                        <input type="text" name="title" required  lay-verify="required" placeholder="常用回复的内容" autocomplete="off" class="layui-input" id="edit_common_words_content">
                                                        </div>
                                                    </div> 
                                                </form >                                               
                                                `
                                    , btn: ['保存']
                                    , yes: function (index, layero) {
                                        let edit_content=$('#edit_common_words_content').val();//内容
                                        console.log(edit_content)
                                        let common_words_info=JSON.stringify({
                                            Language:edit_content
                                        })
                                        console.log(common_words_info)
                                        $.ajax({ //提交添加内容
                                            url:base_url+'/saveAdminLanguage',
                                            type:'POST',
                                            headers:{
                                                userId:userId,
                                                token: token
                                            },
                                            contentType: 'application/json',
                                            data:common_words_info,
                                            dataType:'json',
                                            success:function(data){
                                                console.log("这是提交添加数据",data)
                                                if(data.Value===true){                                                   
                                                    console.log("走通了")
                                                    layer.closeAll(); //关闭所有层
                                                }else{
                                                    console.log("没走通")
                                                }
                                            }

                                        })

                                    }
                                })
                                })
                                
                            }
                        })
                    })
                }
            })
            
        })

        /**
         * 房源推荐
         * */
        $('.fangyuan').click(function(){
            let listing_data;
            if(roles_flag==='user'){
                $.ajax({
                    url:base_url+'/queryFranchiseeRoom?chatId='+chartid,
                    type:'GET',
                    headers:{
                        userId:userId,
                        token:token
                    },
                    dataType:'json',
                    success:function(data){
                        console.log("此乃推荐房源",data);
                        let listing_data_All=data.Value
                        if(listing_data_All!==null&&listing_data_All!=false){
                            listing_list=''
                            listing_data_All.map((item,index)=>{
                                listing_list+=`<li>
                                                <div class="listing_container">
                                                    <div class="listing_img">
                                                        <img src="${item.RoomPhoto}" style="width:80px">
                                                    </div>
                                                    <div class="listing_info">
                                                        <p>${item.RoomType=="S1T1"?"一室一厅":item.RoomType=="HaoHuaBiaoZhunFang"?"豪华标准房":item.RoomType=="HuiYiShi"?"会议室":item.RoomType=="HaoHuaDaChuangFang"?"豪华大床房":"未知房型需查看"}</p>
                                                        <span>¥ ${item.Price}</span>
                                                    </div>
                                                    <button class="layui-btn layui-btn-warm" data-pic="${item.RoomPhoto}" data-room_type='${item.RoomType=="S1T1"?"一室一厅":item.RoomType=="HaoHuaBiaoZhunFang"?"豪华标准房":item.RoomType=="HuiYiShi"?"会议室":item.RoomType=="HaoHuaDaChuangFang"?"豪华大床房":"未知房型需查看"}' data-price="${item.Price}" onclick="listing_send(this,${item.RoomId})">发送</button>
                                                </div>
                                            </li>`
                            })
                            listing_data=`<ul class="listing_data">${listing_list}</ul>`
                        }else{
                            listing_data=`<div style="width:100%;height:100%;display:flex;justify-content: center;align-items: center;flex-direction: column"> <p>当前没有可选房型</p></div>`
                        }
                        house_alert()//弹框
                    }
                })
            }else{
                listing_data=`<div style="width:100%;height:100%;display:flex;justify-content: center;align-items: center;flex-direction: column">  <p>当前没有可选房型</p></div>`
                house_alert()//弹框 
            }
            function house_alert(){//房源推荐弹框
                layui.use('layer',function(){
                    let $ = layui.jquery, layer = layui.layer;
                    layer.open({
                        type: 1
                        , title: '可推荐房型'
                        , fix: false //是否固定
                        , area: ['400px', '500px']
                        , content:listing_data 
                    
                    })
                })
            }            
        })

        /**
         * 聊天记录 
         * */
        $('.chat_record').click(function(){
            let chat_content_area=
                `<form class="layui-form">
                    <div class="layui-form-item">
                        <label class="layui-form-label">时间选择</label>
                        <div class="layui-input-block">
                            <input type="text" name="title" required lay-verify="required" placeholder="请选择时间" autocomplete="off" class="layui-input" id=test1>
                        </div>
                    </div>
                    <div class="layui-form-item"></div>
                    <div class="layui-form-item" id="box_content"></div>
                </form>`
            layui.use('layer',function(){
                let $ = layui.jquery, layer = layui.layer;
                layer.open({
                    type: 1
                    , title: '聊天记录'
                    , fix: false //是否固定
                    , area: ['550px', '555px']
                    , content:chat_content_area
                    , btn: ['关闭']
                    ,success:function(){                        
                        layui.use('laydate', function(){//时间选择控件
                            let laydate = layui.laydate;
                            //执行一个laydate实例
                            laydate.render({
                                elem: '#test1' //指定元素
                                ,type: 'datetime' //控件类型
                                ,done: function(value,){
                                    console.log("我是选好的时间",value);
                                    requsteInfo(value)//请求历史记录
                                }
                            });
                            function requsteInfo(timer){//请求历史记录
                                let post_data={//需上传数据
                                    ChatId: chartid,
                                    Type: 'Update',
                                    Date: timer
                                }
                                console.log(JSON.stringify(post_data))
                                let change_url=roles_flag==='user'?"/queryHotelMessage":"/queryChatMessage";//判断请求路径
                                $.ajax({
                                    url: base_url+change_url,
                                    type: 'POST',
                                    headers: {
                                        token: token,
                                        userId: userId
                                    },
                                    data: JSON.stringify(post_data),
                                    dataType: 'json',
                                    contentType: 'application/json',
                                    success:function(data){
                                        console.log("这是查询的聊天记录",data)
                                        let session_message = data.Value;
                                        if(session_message!==null){
                                            let chatList_content=''
                                            session_message.map(item => {
                                                if (item.MessageSubject == "Other"||item.MessageSubject == "Desktop") { //用户和客服台的聊天记录
                                                    if (item.MessageType == "Written") {//文字
                                                        chatList_content +=
                                                            `<li class="other">
                                                                <div class="avatar">
                                                                    <img src="${item.Photo}" alt="">
                                                                </div>
                                                                <div class="msg">
                                                                    <p class="msg-name">${item.NickName}</p>
                                                                    <p class="msg-text">${item.Message}<emoji class="pizza"></emoji>
                                                                    </p>
                                                                    <time>${item.Date}</time>
                                                                </div>
                                                            </li>`
                                                    }else if(item.MessageType == "Picture"){//图片
                                                        chatList_content += 
                                                            `<li class="other">
                                                                <div class="avatar">
                                                                    <img src="${item.Photo}" alt="">
                                                                </div>
                                                                <div class="msg">
                                                                    <p class="msg-name">${item.NickName}</p>
                                                                    <div class="msg-text" style="max-width:340px;">
                                                                        <img src="${item.Message}" alt="" srcset="" id="img_id${item.MessageId}" data-messageId="${item.MessageId}" onclick="imgPage(this)" style="width:100%;">
                                                                        <emoji class="pizza"></emoji>
                                                                    </div>
                                                                    <time>${item.Date}</time>
                                                                </div>
                                                            </li>`
                                                    }else if(item.MessageType=="RoomInquiry"){//推荐房源
                                                        chatList_content += 
                                                            `<li class="other">
                                                                <div class="avatar">
                                                                    <img src="${item.Photo}" alt="">
                                                                </div>
                                                                <div class="msg">
                                                                    <p class="msg-name">${item.NickName}</p>
                                                                    <div style="display:flex;flex-direction: row;
                                                                    justify-content: space-between;">
                                                                        <div>
                                                                            <img src="${item.Message.RoomPhoto}" style="width:60px">
                                                                        </div>
                                                                        <div style="display: flex;margin-left: 3px;flex-direction: column;align-items: end;">
                                                                            <p style="padding: 3px 0px;">${item.Message.RoomType=="S1T1"?"一室一厅":item.Message.RoomType=="HaoHuaBiaoZhunFang"?"豪华标准房":item.Message.RoomType=="HuiYiShi"?"会议室":item.Message.RoomType=="HaoHuaDaChuangFang"?"豪华大床房":"未知房型需查看"}</p>
                                                                            <span>¥ ${item.Message.price}</span>
                                                                        </div>
                                                                    </div>
                                                                    <time>${item.Date}</time>
                                                                </div>
                                                            </li>`
                                                    }
                                                } else { //加盟商和管理员的聊天记录
                                                    if (item.MessageType == "Written") {
                                                        chatList_content += 
                                                            `<li class="self">
                                                                <div class="avatar">
                                                                    <img src="${item.Photo}" alt="">
                                                                </div>
                                                                <div class="msg">
                                                                    <p class="msg-name">${item.NickName}</p>
                                                                    <p class="msg-text">${item.Message}
                                                                        <emoji class="pizza"></emoji>
                                                                    </p>
                                                                    <time>${item.Date}</time>
                                                                </div>
                                                            </li>`
                                                    }else if(item.MessageType == "Picture"){
                                                        chatList_content += 
                                                            `<li class="self">
                                                                <div class="avatar">
                                                                    <img src="${item.Photo}" alt="">
                                                                </div>
                                                                <div class="msg">
                                                                    <p class="msg-name">${item.NickName}</p>
                                                                    <div class="msg-text" style="max-width:340px;">
                                                                        <img src="${item.Message}" alt="" srcset="" id="img_id${item.MessageId}" data-messageId="${item.MessageId}" onclick="imgPage(this)" style="width:100%;">
                                                                        <emoji class="pizza"></emoji>
                                                                    </div>
                                                                    <time>${item.Date}</time>
                                                                </div>
                                                            </li>`
                                                    }else if(item.MessageType == "RoomInquiry"){
                                                        chatList_content += 
                                                            `<li class="self">
                                                                <div class="avatar">
                                                                    <img src="${item.Photo}" alt="">
                                                                </div>
                                                                <div class="msg">
                                                                    <p class="msg-name">${item.NickName}</p>
                                                                    <div style="display: flex;
                                                                                flex-direction: row;
                                                                                justify-content: space-evenly;
                                                                                align-items: center;
                                                                                background-color: bisque;
                                                                                width: 165px;
                                                                                height: 57px;
                                                                                border-radius: 10px;">
                                                                        <div>
                                                                            <img src="${item.Message.RoomPhoto}" style="width:60px">
                                                                        </div>
                                                                        <div style="display: flex;margin-left: 3px;flex-direction: column;align-items: end;">
                                                                            <p style="padding: 3px 0px;">${item.Message.RoomType=="S1T1"?"一室一厅":item.Message.RoomType=="HaoHuaBiaoZhunFang"?"豪华标准房":item.Message.RoomType=="HuiYiShi"?"会议室":item.Message.RoomType=="HaoHuaDaChuangFang"?"豪华大床房":"未知房型需查看"}</p>
                                                                            <span>¥ ${item.Message.Price}</span>
                                                                        </div>
                                                                    </div>
                                                                    <time>${item.Date}</time>
                                                                </div>
                                                            </li>`
                                                    }
                                                }
                                            })
                                            $('#box_content').append(`<ul class="chatrecord_list">${chatList_content}</ul>`); 
                                        } else{
                                            $('#box_content').append(`<div class="chatrecord_list">当前无记录</div>`)
                                        }
                                    }
                                })
                            }
                        });
                    }
                })
            })
        })
    });
}

/**
 * DELETE常用语
 *  */
function delete_words(e,data){
    console.log(e.dataset.id,data)
    let words_id=e.dataset.id
    if(words_id==data){
        console.log(true)
        let aa={LanguageId:words_id}
        let info=JSON.stringify(aa)
        $.ajax({
            url:base_url+'/deleteLanguage',
            type:'PUT',
            contentType: 'application/json',
            headers:{
                userId:userId,
                token:token
            },
            data:info,
            dataType: 'json',
            success:function(data){
                if(data.Value==true){
                    console.log("删除成功")
                    layer.closeAll(); //疯狂模式，关闭所有层
                }
            }
        })
    }
}

/**
 * UPDATE常用语
 * */
function edit_words(ev,data){
    // console.log(ev.dataset.words,ev.dataset.id)
    layui.use('layer',function(){
        let $ = layui.jquery, layer = layui.layer;
        layer.open({
            type: 1
            , title: '编辑常用回复'
            , fix: false //是否固定
            , area: ['300px', '400px']
            , content: `
                        <form  class="layui-form">                        
                            <div class="layui-form-item">
                                <label class="layui-form-label" style="width: auto;">内容</label>
                                <div class="layui-input-block" style="margin-left: auto;">
                                <input type="text" name="title" required  lay-verify="required" value="${ev.dataset.words}" autocomplete="off" class="layui-input" id="update_common_words_content">
                                </div>
                            </div> 
                        </form >                                               
                        `
            , btn: ['保存']
            , yes: function (index, layero) {
                console.log('保存')
                let update_content=$('#update_common_words_content').val();//内容
                console.log(update_content)
                let common_words_info=JSON.stringify({
                    LanguageId:ev.dataset.id,
                    Language:update_content
                })
                $.ajax({ //提交修改内容
                    url:base_url+'/updateLanguage',
                    type:'PUT',
                    headers:{
                        userId:userId,
                        token: token
                    },
                    contentType: 'application/json',
                    data:common_words_info,
                    dataType:'json',
                    success:function(data){
                        console.log("这是提交添加数据",data)
                        if(data.Value===true){
                            layer.closeAll(); //疯狂模式，关闭所有层
                        }else{
                            console.log("没走通")
                        }
                    }
                })
            }
        })
    })
}

/**
 * 将常用语添加到输入框
 * */
function send_words(words){
    $('#send_txt').append(`<span>${words}</span>`)
    layer.closeAll()
}

/**
 * 房源推荐发送
 * */
function listing_send(ev_info,roomId){
    let data_info={
        ChatId: chartid,
        UserType: 'Franchisee',
        Message: roomId,
        MessageType: 'RoomInquiry'
    }
    let url_list=roles_flag=="user"?"/sendMessage":"/hotelChat";//判断是用户请求还是客服请求
    console.log(data_info)
    $.ajax({
        url:base_url+url_list,
        type: 'post',
        dataType: 'json',
        headers: {
            token: token,
            userId: userId
        },
        data: JSON.stringify(data_info),
        contentType: 'application/json',
        success:function(data){
            // console.log("推荐房源是否成功？",data,ev_info.dataset)
            let roomInfo=ev_info.dataset;
            let newmessage = `<li class="self">
                                    <div class="avatar"><img src="${minePhoto}" alt=""></div>
                                    <div class="msg">
                                        <p class="msg-name">${mineName}</p>
                                            <div style="display: flex;
                                                        flex-direction: row;
                                                        justify-content: space-evenly;
                                                        align-items: center;
                                                        background-color: bisque;
                                                        width: 165px;
                                                        height: 57px;
                                                        border-radius: 10px;">
                                                <div>
                                                    <img src="${roomInfo.pic}" style="width:60px">
                                                </div>
                                                <div style="display: flex;margin-left: 3px;flex-direction: column;align-items: end;">
                                                    <p style="padding: 3px 0px;">${roomInfo.room_type}</p>
                                                    <span>¥ ${roomInfo.price}</span>
                                                </div>
                                            </div>
                                        <time>${new Date().Format("yyyy-MM-dd HH:mm:ss")}</time>
                                    </div>
                                </li>`
                            roles_flag=="user"?($("#chat_ul").append(newmessage)):'';                                
                            $('#send_txt').html('');
                            $("#chat_ul").scrollTop($("#chat_ul")[0].scrollHeight); //滚动条在最底部
                            layer.closeAll()
        }
    })
}

/**
 * 封装：handle_text
 *    文本文字复制粘贴，
 *    且去除标签及样式。
 * */
function handle_text(event){
    event.preventDefault();//去除默认样式
    let text;
    let clp = (event.originalEvent || event.clipboardData);
    // console.log(clp,event.originalEvent,event.clipboardData)
    if (clp === undefined || clp === null) {
        text = window.clipboardData.getData("text") || "";
        if (text !== "") {
            if (window.getSelection) {
                let newNode = document.createElement("span");
                newNode.innerHTML = text;
                window.getSelection().getRangeAt(0).insertNode(newNode);
            } else {
                document.selection.createRange().pasteHTML(text);
            }
        }
    } else {
        text = clp.getData('text/plain') || "";
        // console.log(text)
        if (text !== "") {
            document.execCommand('insertText', false, text);
        }
    }
}

/**
 * 用户消息原图访问；
 * 客服台消息原图访问
 * */
function imgPage(imgParam){
    let messageId=imgParam.dataset.messageid
    let url_list=roles_flag==='user'?'/queryMessagePhoto?messageId=':'/queryHotelPhoto?messageId=';
    $.ajax({
        url:base_url+url_list+messageId,
        headers:{
            token:token,
            userId:userId
        },
        type:'GET',
        dataType:'json',
        success:function(data){
            // console.log(data)
            data.Value!==null||data.Value!==undefined||data.Value!==false?window.open(data.Value,'_blank'):'';
            
        }
    })
}

//发送输入框信息时格式化
function replace_em(str) {
    str = str.replace(/\</g, '&lt;');
    str = str.replace(/\>/g, '&gt;');
    str = str.replace(/\n/g, '<br/>');
    // str = str.replace(/\[em_([0-9]*)\]/g, '<img src="arclist/$1.gif" border="0" />');
    str = str.replace(/\[(.*)\]/g, '<img src="drawable-xxhdpi/$1.png" border="0"  style="width:20px;height:20px"/>');
    return str;
}