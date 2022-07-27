import { ReactNode } from 'react';
import { IconProps } from 'phosphor-react-native';
import { HStack, useTheme, VStack, Text, Box } from 'native-base';

type Props = {
  title: string;
  description?: string;
  footer?: string;
  icon?: React.ElementType<IconProps>;
  children?: ReactNode;
};

export function CardDetails({
  title,
  description,
  footer,
  icon: Icon,
  children,
}: Props) {
  const { colors } = useTheme();

  return (
    <VStack bg="gray.600" p={5} mt={5} rounded="sm">
      <HStack alignItems="center" mb={4}>
        <Icon color={colors.primary[700]} />
        <Text color="gray.300" fontSize="sm" textTransform="uppercase" ml={2}>
          {title}
        </Text>
      </HStack>

      {!!description && (
        <Text color="gray.100" fontSize="md">
          {description}
        </Text>
      )}

      {children}

      {!!footer && (
        <Box borderTopWidth={1} borderTopColor="gray.400" mt={3}>
          <Text color="gray.300" fontSize="sm">
            {footer}
          </Text>
        </Box>
      )}
    </VStack>
  );
}
