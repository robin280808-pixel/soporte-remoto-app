import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  mediaDevices,
} from "react-native-webrtc";

export const SIGNALING_SERVER = "wss://soporte-remoto.onrender.com";

const RTC_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export class WebRTCManager {
  constructor(onRemoteStream, onConnectionState) {
    this.pc = null;
    this.ws = null;
    this.onRemoteStream = onRemoteStream;
    this.onConnectionState = onConnectionState;
    this.localStream = null;
    this.role = null;
    this.sessionCode = null;
  }

  connectSignaling(url = SIGNALING_SERVER) {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(url);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (e) => reject(e);
      this.ws.onmessage = (e) => this._handleSignal(JSON.parse(e.data));
      this.ws.onclose = () => this.onConnectionState?.("disconnected");
    });
  }

  async _handleSignal(msg) {
    switch (msg.type) {
      case "session_created": this.sessionCode = msg.code; this.onConnectionState?.("waiting", msg.code); break;
      case "joined": this.onConnectionState?.("joined"); break;
      case "client_joined": await this._createOffer(); break;
      case "offer": await this._handleOffer(msg.payload); break;
      case "answer": await this.pc.setRemoteDescription(new RTCSessionDescription(msg.payload)); break;
      case "ice_candidate": if (msg.payload) await this.pc.addIceCandidate(new RTCIceCandidate(msg.payload)); break;
      case "screen_share_started": this.onConnectionState?.("screen_sharing"); break;
      case "screen_share_stopped": this.onConnectionState?.("connected"); break;
      case "peer_disconnected": this.onConnectionState?.("peer_disconnected"); break;
      case "error": this.onConnectionState?.("error", msg.message); break;
    }
  }

  _initPC() {
    this.pc = new RTCPeerConnection(RTC_CONFIG);
    this.pc.onicecandidate = (e) => { if (e.candidate) this._send({ type: "ice_candidate", payload: e.candidate }); };
    this.pc.ontrack = (e) => { if (e.streams?.[0]) this.onRemoteStream?.(e.streams[0]); };
  }

  async createSession() { this.role = "agent"; this._initPC(); this._send({ type: "create_session" }); }
  async joinSession(code) { this.role = "client"; this._initPC(); this._send({ type: "join_session", code }); }

  async startScreenShare() {
    const stream = await mediaDevices.getDisplayMedia({ video: true, audio: false });
    this.localStream = stream;
    stream.getTracks().forEach((track) => this.pc.addTrack(track, stream));
    this._send({ type: "screen_share_started" });
    return stream;
  }

  stopScreenShare() {
    this.localStream?.getTracks().forEach((t) => t.stop());
    this.localStream = null;
    this._send({ type: "screen_share_stopped" });
  }

  async _createOffer() {
    const offer = await this.pc.createOffer({ offerToReceiveVideo: true });
    await this.pc.setLocalDescription(offer);
    this._send({ type: "offer", payload: offer });
  }

  async _handleOffer(offer) {
    await this.pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    this._send({ type: "answer", payload: answer });
  }

  _send(msg) { if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(msg)); }

  disconnect() { this.stopScreenShare(); this.pc?.close(); this.ws?.close(); }
}
