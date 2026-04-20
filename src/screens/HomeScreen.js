import React from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
} from "react-native";

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#185FA5" />
      <View style={styles.header}>
        <Text style={styles.logo}>SoporteRemoto</Text>
        <Text style={styles.subtitle}>Soporte técnico en tiempo real</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.question}>¿Cómo deseas conectarte?</Text>
        <TouchableOpacity style={[styles.card, styles.agentCard]} onPress={() => navigation.navigate("Agent")}>
          <Text style={styles.cardTitle}>Soy el Agente</Text>
          <Text style={styles.cardDesc}>Ver la pantalla del cliente en tiempo real</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.card, styles.clientCard]} onPress={() => navigation.navigate("Client")}>
          <Text style={styles.cardTitleDark}>Soy el Cliente</Text>
          <Text style={styles.cardDescDark}>Compartir mi pantalla con el agente</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6FA" },
  header: { backgroundColor: "#185FA5", paddingVertical: 40, paddingHorizontal: 24, alignItems: "center" },
  logo: { fontSize: 26, fontWeight: "700", color: "#fff", marginBottom: 6 },
  subtitle: { fontSize: 14, color: "rgba(255,255,255,0.8)" },
  body: { flex: 1, padding: 24, justifyContent: "center", gap: 16 },
  question: { fontSize: 18, fontWeight: "600", color: "#1a1a2e", marginBottom: 8, textAlign: "center" },
  card: { borderRadius: 16, padding: 24, alignItems: "center" },
  agentCard: { backgroundColor: "#185FA5" },
  clientCard: { backgroundColor: "#fff", borderWidth: 1.5, borderColor: "#185FA5" },
  cardTitle: { fontSize: 18, fontWeight: "700", marginBottom: 6, color: "#fff" },
  cardDesc: { fontSize: 14, color: "rgba(255,255,255,0.85)", textAlign: "center" },
  cardTitleDark: { fontSize: 18, fontWeight: "700", marginBottom: 6, color: "#185FA5" },
  cardDescDark: { fontSize: 14, color: "#185FA5", textAlign: "center" },
});
