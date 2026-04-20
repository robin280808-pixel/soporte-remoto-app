import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Alert, StatusBar,
} from "react-native";
import { RTCView } from "react-native-webrtc";
import { WebRTCManager, SIGNALING_SERVER } from "../utils/webrtc";

export default function AgentScreen({ navigation }) {
  const [status, setStatus] = useState("connecting");
  const [sessionCode, setSessionCode] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const managerRef = useRef(null);

  useEffect(() => {
    startSession();
    return () => managerRef.current?.disconnect();
  }, []);

  async function startSession() {
    try {
      const mgr = new WebRTCManager(
        (stream) => { setRemoteStream(stream); setStatus("screen_sharing"); },
        (state, data) => {
          if (state === "waiting") { setSessionCode(data); setStatus("waiting"); }
          else if (state === "peer_disconnected") { setStatus("waiting"); setRemoteStream(null); Alert.alert("Cliente desconectado", "El cliente cerró la sesión."); }
          else if (state === "error") { setStatus("error"); Alert.alert("Error", data || "Error de conexión"); }
        }
      );
      managerRef.current = mgr;
      await mgr.connectSignaling(SIGNALING_SERVER);
      await mgr.createSession();
    } catch (e) {
      setStatus("error");
      Alert.alert("Error", "No se pudo conectar al servidor.");
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#185FA5" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>← Salir</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Vista del Agente</Text>
        <View style={[styles.dot, status === "screen_sharing" ? styles.dotOn : styles.dotOff]} />
      </View>
      {status === "connecting" && <View style={styles.center}><ActivityIndicator size="large" color="#185FA5" /><Text style={styles.statusText}>Conectando...</Text></View>}
      {status === "waiting" && (
        <View style={styles.center}>
          <Text style={styles.waitTitle}>Código de sesión</Text>
          <Text style={styles.waitDesc}>Comparte este código con el cliente:</Text>
          <View style={styles.codeBox}><Text style={styles.code}>{sessionCode}</Text></View>
          <ActivityIndicator size="small" color="#185FA5" style={{ marginTop: 24 }} />
          <Text style={styles.waitingLabel}>Esperando al cliente...</Text>
        </View>
      )}
      {status === "screen_sharing" && remoteStream && (
        <View style={{ flex: 1 }}>
          <RTCView streamURL={remoteStream.toURL()} style={styles.stream} objectFit="contain" />
          <View style={styles.badge}><View style={styles.liveDot} /><Text style={styles.liveText}>EN VIVO</Text></View>
        </View>
      )}
      {status === "error" && (
        <View style={styles.center}>
          <Text style={styles.errorText}>No se pudo conectar</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={startSession}><Text style={styles.retryText}>Reintentar</Text></TouchableOpacity>
        </View>
      )}
      <View style={styles.bottomBar}>
        <Text style={styles.bottomText}>{status === "screen_sharing" ? "Viendo pantalla en tiempo real" : status === "waiting" ? `Código: ${sessionCode}` : "Iniciando..."}</Text>
        <TouchableOpacity style={styles.endBtn} onPress={() => { managerRef.current?.disconnect(); navigation.goBack(); }}><Text style={styles.endText}>Terminar</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d0d1a" },
  header: { flexDirection: "row", alignItems: "center", backgroundColor: "#185FA5", paddingHorizontal: 16, paddingVertical: 12 },
  back: { color: "#fff", fontSize: 14, paddingRight: 12 },
  headerTitle: { flex: 1, color: "#fff", fontSize: 16, fontWeight: "600" },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dotOn: { backgroundColor: "#4caf50" },
  dotOff: { backgroundColor: "#888" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  statusText: { marginTop: 16, color: "#aaa", fontSize: 15 },
  waitTitle: { fontSize: 22, fontWeight: "700", color: "#fff", marginBottom: 8 },
  waitDesc: { fontSize: 14, color: "#aaa", marginBottom: 20 },
  codeBox: { backgroundColor: "#185FA5", borderRadius: 16, paddingVertical: 20, paddingHorizontal: 40 },
  code: { fontSize: 42, fontWeight: "800", color: "#fff", letterSpacing: 8 },
  waitingLabel: { color: "#aaa", fontSize: 13, marginTop: 8 },
  stream: { flex: 1, backgroundColor: "#000" },
  badge: { position: "absolute", top: 12, right: 12, flexDirection: "row", alignItems: "center", backgroundColor: "rgba(0,0,0,0.6)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, gap: 6 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#f44336" },
  liveText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  errorText: { color: "#f44336", fontSize: 16, marginBottom: 20 },
  retryBtn: { backgroundColor: "#185FA5", borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  retryText: { color: "#fff", fontWeight: "600" },
  bottomBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#1a1a2e", padding: 14, gap: 12 },
  bottomText: { flex: 1, color: "#aaa", fontSize: 13 },
  endBtn: { backgroundColor: "#c62828", borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  endText: { color: "#fff", fontWeight: "600", fontSize: 13 },
});
