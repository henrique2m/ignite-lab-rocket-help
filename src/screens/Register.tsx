import { useState } from 'react';
import { Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';

import {
  VStack,
  HStack,
  Image,
  Box,
  useTheme,
  Icon,
  ScrollView,
} from 'native-base';
import {
  launchCameraAsync,
  MediaTypeOptions,
  useCameraPermissions,
} from 'expo-image-picker';

import { Camera, Trash } from 'phosphor-react-native';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Loading } from '../components/Loading';
import { Header } from '../components/Header';
import { uploadImage } from '../utils/UploadImage';

export function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [patrimony, setPatrimony] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);

  const [permissions, setPermissions] = useCameraPermissions();

  const { colors } = useTheme();
  const navigation = useNavigation();

  async function handlePickImage() {
    const { granted } = permissions;

    try {
      setImage(null);
      setIsLoadingImage(true);

      const result = await launchCameraAsync({
        mediaTypes: MediaTypeOptions.Images,
        aspect: [3, 4],
        quality: 0.5,
      });

      if (!granted) {
        Alert.alert(
          'Erro',
          'Você precisa fornecer permissão de acesso a câmera.'
        );
      }

      if (result.cancelled === false) {
        setImage(result.uri);
      }

      setIsLoadingImage(false);
    } catch (error) {
      setIsLoadingImage(false);
      Alert.alert('Erro', 'Não foi possível acessar a câmera.');
    }
  }

  function removeImage() {
    setImage(null);
  }

  async function handleNewOrderRegister() {
    if (!patrimony || !description) {
      return Alert.alert('Cadastrar', 'Informe o patrimônio e a descrição.');
    }

    setIsLoading(true);

    let urlImage = null;

    if (image) {
      urlImage = await uploadImage(image, 'images');
    }

    firestore()
      .collection('orders')
      .add({
        patrimony,
        description,
        status: 'open',
        urlImage,
        created_at: firestore.FieldValue.serverTimestamp(),
      })
      .then(() => {
        Alert.alert('Solicitação', 'Solicitação registrada com sucesso.');
        navigation.goBack();
      })
      .catch(error => {
        setIsLoading(false);
        return Alert.alert(
          'Solicitação',
          'Não foi possível registrar a solicitação.'
        );
      });
  }
  return (
    <VStack flex={1} bg="gray.600">
      <Header title="Solicitação" />

      <ScrollView
        mx={5}
        showsVerticalScrollIndicator={false}
        p={0}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <Box
          w="full"
          minH={48}
          borderWidth={2}
          borderStyle="dotted"
          justifyContent="center"
          alignItems="center"
          borderColor={colors.green[300]}
          rounded="lg"
          p={4}
        >
          {isLoadingImage && <Loading bg={colors.gray[600]} />}

          {image && !isLoadingImage
            ? !isLoading && (
                <HStack
                  w="full"
                  justifyContent="center"
                  alignItems="center"
                  pb={4}
                >
                  <TouchableOpacity onPress={removeImage}>
                    <Icon
                      as={<Trash size={32} color={colors.gray[300]} />}
                      ml={4}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={handlePickImage}>
                    <Icon
                      as={<Camera size={32} color={colors.gray[300]} />}
                      ml={4}
                    />
                  </TouchableOpacity>
                </HStack>
              )
            : !isLoadingImage && (
                <TouchableOpacity onPress={handlePickImage}>
                  <Icon
                    as={<Camera size={64} color={colors.green[300]} />}
                    ml={4}
                  />
                </TouchableOpacity>
              )}

          {image && !isLoadingImage && (
            <Image
              source={{ uri: image }}
              w={300}
              h={300}
              alt="Imagem da solicitação"
              rounded="lg"
            />
          )}
        </Box>

        <Input
          placeholder="Número do patrimônio"
          mt={4}
          onChangeText={setPatrimony}
        />

        <Input
          placeholder="Descrição do problema"
          flex={1}
          mt={6}
          multiline
          textAlignVertical="top"
          onChangeText={setDescription}
          minH={24}
        />
      </ScrollView>

      <Box p={4}>
        <Button
          title="Cadastrar"
          mt={5}
          onPress={handleNewOrderRegister}
          isLoading={isLoading}
        />
      </Box>
    </VStack>
  );
}
