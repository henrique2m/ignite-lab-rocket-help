import { Alert } from 'react-native';
import storage from '@react-native-firebase/storage';

export async function uploadImage(
  uriImage: string,
  folder?: string
): Promise<string> | null {
  const chunks = uriImage.split('.');

  if (chunks.length === 0) {
    Alert.alert(
      'Cadastro',
      'Ocorreu um problema com o carregamento da imagem.'
    );

    return null;
  }

  const fileName = new Date().getTime();

  const extensionImage = chunks[chunks.length - 1];

  const pathImageName = folder
    ? `/${folder}/${fileName}.${extensionImage}`
    : `${fileName}.${extensionImage}`;

  const storageReferenceImage = storage().ref(pathImageName);

  await storageReferenceImage.putFile(uriImage);

  return await storageReferenceImage.getDownloadURL();
}
