import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../../../config/config';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from "@react-navigation/native";

interface Servico {
  id: number;
  nome: string;
  valor: string;
  tempo: number;
  imagem_url?: string;
  status: boolean; // ✅ adicionado
}

export default function Servicos({ navigation }: any) {
  const [servicos, setServicos] = useState<Servico[]>([]);

  useFocusEffect(
    useCallback(() => {
      carregarServicos();
      return () => {
        console.log("Saiu da tela");
      };
    }, [])
  );

  const carregarServicos = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const idEstabelecimento = await AsyncStorage.getItem('id_estabelecimento');

      if (!token || !idEstabelecimento) {
        Alert.alert('Erro', 'Token ou estabelecimento não encontrado');
        navigation.navigate('Login');
        return;
      }

      const response = await axios.post(`${API_URL}/servicos/list`,
        { id_estabelecimento: idEstabelecimento },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setServicos(response.data);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
      Alert.alert('Erro', 'Não foi possível carregar os serviços');
    }
  };

  // ✅ Função para inverter status
  const handleToggleStatus = async (servico: Servico) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert("Erro", "Token não encontrado");
        return;
      }

      const novoStatus = !servico.status;

      await axios.put(`${API_URL}/servicos/update/status`,
        { id: servico.id, status: novoStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Atualiza estado local
      setServicos((prev) =>
        prev.map((s) => s.id === servico.id ? { ...s, status: novoStatus } : s)
      );
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      Alert.alert("Erro", "Não foi possível atualizar o status");
    }
  };

  const handleEdit = (servico: Servico) => {
    navigation.navigate('ServicoEdit', { servico });
  };

  const renderServico = ({ item }: { item: Servico }) => {
    return (
      <View style={styles.card}>
        <Image
          source={
            item.imagem_url
              ? { uri: item.imagem_url }
              : require('../../../assets/sem-imagem.png')
          }
          style={styles.imagem}
        />
        <View style={styles.info}>
          <Text style={styles.nome}>{item.nome}</Text>
          <Text>Valor: R$ {item.valor}</Text>
          <Text>Tempo: {item.tempo} min</Text>

          <View style={{ flexDirection: "row", marginTop: 10 }}>
            <TouchableOpacity style={styles.btnEditar} onPress={() => handleEdit(item)}>
              <Ionicons name="create-outline" size={16} color="#fff" />
              <Text style={styles.txtEditar}>Editar</Text>
            </TouchableOpacity>

            {/* ✅ Botão check */}
            <TouchableOpacity
              style={[styles.btnEditar, { backgroundColor: item.status ? "green" : "gray", marginLeft: 10 }]}
              onPress={() => handleToggleStatus(item)}
            >
              <Ionicons name={item.status ? "checkmark-circle" : "close-circle"} size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Serviços</Text>

      <TouchableOpacity
        style={styles.btnAdd}
        onPress={() => navigation.navigate('NewServico')}
      >
        <Ionicons name="add-circle-outline" size={20} color="#fff" />
        <Text style={styles.txtAdd}>Adicionar Serviço</Text>
      </TouchableOpacity>

      <FlatList
        data={servicos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderServico}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <TouchableOpacity style={styles.btnVoltar} onPress={() => navigation.goBack()}>
        <Text style={styles.txtVoltar}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  btnAdd: {
    flexDirection: 'row',
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  txtAdd: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  imagem: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#ccc',
  },
  info: {
    flex: 1,
  },
  nome: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  btnEditar: {
    marginTop: 10,
    backgroundColor: '#007bff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  txtEditar: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '600',
  },
  btnCheck: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginLeft: 10,
  },
  btnCheckAtivo: {
    backgroundColor: 'green',
  },
  btnCheckInativo: {
    backgroundColor: 'gray',
  },
  txtCheck: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '600',
  },
  btnVoltar: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#dc3545',
    borderRadius: 8,
    alignItems: 'center',
  },
  txtVoltar: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
