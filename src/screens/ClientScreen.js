import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, StatusBar, ActivityIndicator,
} from "react-native";
import { WebRTCManager, SIGNALING_SERVER } from "../utils/webrtc";

export default function ClientScreen({ navigation }) {
  const [step, setStep] = useState("code");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("");
  const managerRef = useRef(null);

  useEffect(() => { return () => managerRef.current?.disconnect(); }, []);

  async function connect() {
    if (code.length !== 6) { Alert.alert("Código inválido", "El código debe tener 6 dígitos."); return; }
    setStep("connecting");
    try {
      const mgr = new WebRTCManager(null, (state, data) => {
        if (state === "joined") { setStatus("Conectado. Iniciando captura..."); startSharing(mgr); }
        else if (state === "peer_disconnected") { Alert.alert("Agente desconectado"); navigation.goBack(); }
        else if (state === "error") { Alert.alert("Error", data || "Error de conexión"); setStep("code"); }
      });
      managerRef.current = mgr;
      await mgr.connectSignaling(SIGNALING_SERVER);
      await mgr.joinSession(code);
    } catch (e) {
      Alert.alert("Error", "No se pudo conectar al servidor.");
      setStep("code");
    }
  }

  async function startSharing(mgr) {
    try {
      setStatus("Solicitando permiso de captura...");
      await mgr.startScreenShare();
      setStep("sharing");
    } catch (e) {
      Alert.alert("Permiso requerido", "Debes aceptar el permiso de captura de pantalla.");
      setStep("code");
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F6FA" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>← Volver</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Cliente</Text>
        <View style={{ width: 50 }} />
      </View>
      {step === "code" && (
        <View style={styles.body}>
          <Text style={styles.title}>Ingresa el código de sesión</Text>
          <Text style={styles.desc}>El agente te dará un código de 6 dígitos</Text>
          <TextInput style={styles.codeInput} value={code} onChangeText={(t) => setCode(t.replace(/\D/g, "").slice(0, 6))} keyboardType="number-pad" placeholder="000000" placeholderTextColor="#ccc" maxLength={6} textAlign="center" />
          <TouchableOpacity style={[styles.connectBtn, code.length !== 6 && styles.btnDisabled]} onPress={connect} disabled={code.length !== 6}>
            <Text style={styles.connectBtnText}>Conectar y compartir pantalla</Text>
          </TouchableOpacity>
        </View>
      )}
      {step === "connecting" && (
        <View style={styles.body}>
          <ActivityIndicator size="large" color="#185FA5" />
          <Text style={styles.title}>Conectando...</Text>
          <Text style={styles.desc}>{status}</Text>
        </View>
      )}
      {step === "sharing" && (
        <View style={styles.body}>
          <Text style={styles.sharingTitle}>Compartiendo pantalla</Text>
          <Text style={styles.desc}>El agente puede ver tu pantalla en tiempo real</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>✓ Conexión cifrada</Text>
            <Text style={styles.infoText}>✓ Solo el agente puede verte</Text>
            <Text style={styles.infoText}>✓ Puedes detener en cualquier momento</Text>
          </View>
          <TouchableOpacity style={styles.stopBtn} onPress={() => { managerRef.current?.disconnect(); navigation.goBack(); }}>
            <Text style={styles.stopBtnText}>Detener y salir</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6FA" },
  header: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: "#e0e0e0" },
  back: { color: "#185FA5", fontSize: 14, width: 50 },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: "600", textAlign: "center" },
  body: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  title: { fontSize: 20, fontWeight: "700", color: "#1a1a2e", marginBottom: 10, textAlign: "center", marginTop: 20 },
  desc: { fontSize: 14, color: "#666", textAlign: "center", lineHeight: 20, marginBottom: 32 },
  codeInput: { width: "100%", fontSize: 36, fontWeight: "800", letterSpacing: 12, borderWidth: 2, borderColor: "#185FA5", borderRadius: 16, paddingVertical: 16, paddingHorizontal: 20, backgroundColor: "#fff", color: "#1a1a2e", marginBottom: 20 },
  connectBtn: { width: "100%", backgroundColor: "#185FA5", borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  btnDisabled: { opacity: 0.4 },
  connectBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  sharingTitle: { fontSize: 22, fontWeight: "700", color: "#1a1a2e", marginBottom: 8 },
  infoBox: { width: "100%", backgroundColor: "#e8f5e9", borderRadius: 14, padding: 20, marginBottom: 32 },
  infoText: { fontSize: 14, color: "#2e7d32", marginBottom: 4 },
  stopBtn: { width: "100%", backgroundColor: "#c62828", borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  stopBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
