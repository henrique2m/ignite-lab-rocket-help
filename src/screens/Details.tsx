import { useState, useEffect } from 'react';
import {
  VStack,
  Text,
  ScrollView,
  HStack,
  useTheme,
  Box,
  Image,
} from 'native-base';
import { Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useRoute, useNavigation } from '@react-navigation/native';

import { Header } from '../components/Header';
import { Loading } from '../components/Loading';
import { dateFormat } from '../utils/FirestoreDateFormat';
import { OrderProps } from '../components/Order';
import { OrderFirestoreDTO } from '../DTOs/OrderFirestoreDTO ';
import { CardDetails } from '../components/CardDetails';
import {
  DesktopTower,
  ClipboardText,
  CircleWavyCheck,
  Hourglass,
  Image as IconImage,
} from 'phosphor-react-native';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

type RouteParams = {
  orderId: string;
};

type OrderDetails = OrderProps & {
  description: string;
  solution: string;
  urlImage: string;
  closed: string;
};

export function Details() {
  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState<OrderDetails>({} as OrderDetails);
  const [solution, setSolution] = useState('');

  const { colors } = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const { orderId } = route.params as RouteParams;

  useEffect(() => {
    firestore()
      .collection<OrderFirestoreDTO>('orders')
      .doc(orderId)
      .get()
      .then(doc => {
        const {
          patrimony,
          description,
          status,
          created_at,
          closed_at,
          solution,
          urlImage,
        } = doc.data();

        const closed = closed_at ? dateFormat(closed_at) : null;

        setOrder({
          id: doc.id,
          patrimony,
          description,
          status,
          urlImage,
          solution,
          when: dateFormat(created_at),
          closed,
        });

        setIsLoading(false);
      })
      .catch(error => {
        Alert.alert('Detalhes', 'Não foi possível carregar os detalhes.');
      });
  }, []);

  function handleOrderClose() {
    if (solution === '') {
      return Alert.alert('Solicitação', 'Por favor, informe a solução.');
    }

    firestore()
      .collection<OrderFirestoreDTO>('orders')
      .doc(orderId)
      .update({
        status: 'closed',
        solution,
        closed_at: firestore.FieldValue.serverTimestamp(),
      })
      .then(() => {
        Alert.alert('Solicitação', 'Solicitação encerrada');
        navigation.goBack();
      })
      .catch(() => {
        Alert.alert('Solicitação', 'Não foi possível encerrar a solicitação.');
      });
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <VStack flex={1} bg="gray.700">
      <Box px={6} bg="gray.600">
        <Header title="Solicitações" />
      </Box>

      <HStack bg="gray.500" justifyContent="center" p={4}>
        {order.status === 'closed' ? (
          <CircleWavyCheck size={22} color={colors.green[300]} />
        ) : (
          <Hourglass size={22} color={colors.secondary[700]} />
        )}

        <Text
          fontSize="sm"
          color={
            order.status === 'closed'
              ? colors.green[300]
              : colors.secondary[700]
          }
          ml={2}
          textTransform="uppercase"
        >
          {order.status === 'closed' ? 'Finalizado' : 'Em andamento'}
        </Text>
      </HStack>

      <ScrollView
        mx={5}
        showsVerticalScrollIndicator={false}
        p={4}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <CardDetails
          title="Equipamento"
          description={`Patrimônio: ${order.patrimony}`}
          icon={DesktopTower}
        />

        {order.urlImage && (
          <CardDetails title="Imagem do problema" icon={IconImage}>
            <Image
              source={{ uri: order.urlImage }}
              w={300}
              h={300}
              alt="Imagem do problema"
              rounded="lg"
            />
          </CardDetails>
        )}

        <CardDetails
          title="Descrição do problema"
          description={order.description}
          icon={ClipboardText}
          footer={`Registrador em ${order.when}`}
        />

        <CardDetails
          title="Solução"
          icon={DesktopTower}
          description={order.solution}
          footer={order.closed && `Encerrado em: ${order.closed}`}
        >
          {order.status === 'open' && (
            <Input
              placeholder="Descrição da solução"
              onChangeText={setSolution}
              textAlignVertical="top"
              multiline
              h={24}
            />
          )}
        </CardDetails>
      </ScrollView>

      <Box p={4}>
        {order.status === 'open' && (
          <Button
            title="Encerrar solicitação"
            m={5}
            onPress={handleOrderClose}
          />
        )}
      </Box>
    </VStack>
  );
}
