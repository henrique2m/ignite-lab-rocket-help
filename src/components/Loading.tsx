import { Center, Spinner, ICenterProps } from 'native-base';

export function Loading({ ...rest }: ICenterProps) {
  return (
    <Center flex={1} bg="gray.700" {...rest}>
      <Spinner color="secondary.700" />
    </Center>
  );
}
