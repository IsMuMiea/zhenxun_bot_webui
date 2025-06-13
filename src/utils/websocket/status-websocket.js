// import router from "@/router/routers" //引入router, 作页面跳转
// import store from "@/store" //引入store, 作聊天消息存储
import { getBaseUrl, getPort } from "@/utils/api"
import vue from "@/main"

var ws = null
var heartbeatInterval = null

function startHeartbeat() {
  heartbeatInterval = setInterval(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send("ping") // 发送心跳消息
    }
  }, 5000)
}

function stopHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval) // 停止心跳检测定时器
  }
}

export default {
  ws: null,
  //初始化ws
  initWebSocket: function (onMessage) {
    if (!ws) {
      console.log("STATUS_WS_URL WebSocket 正在连接...")

      const isSecure = window.location.protocol === 'https:'; // 判断当前页面是否使用 HTTPS
      const protocol = isSecure ? 'wss://' : 'ws://'; // 根据页面协议选择 WebSocket 协议
      const baseUrlSplit = getBaseUrl().split("//");
      const baseUrl = baseUrlSplit[1];
      const STATUS_WS_URL = `${protocol}${baseUrl}/zhenxun/socket/system_status`; // 动态选择 ws 或 wss

      const websocket = new WebSocket(STATUS_WS_URL);
      startHeartbeat();
      websocket.onopen = () => {
        console.log("STATUS_WS_URL WebSocket 已连接...");
      };
      websocket.onmessage = onMessage;
      websocket.onclose = () => {
        vue.$message.warning("STATUS_WS_URL WebSocket 已断开...");
        stopHeartbeat();
        setTimeout(() => {
          this.initWebSocket(onMessage); // 重连时传递回调函数
        }, 3000);
      };
      ws = websocket;
    }
  },
  //断开socked方法
  closeWebSocket: function () {
    console.log("关闭ws");
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
    }
  },
}