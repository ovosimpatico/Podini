import { Box, VStack, Heading, Text, Button, SimpleGrid, Icon, Flex, useToast } from '@chakra-ui/react';
import { FaCoins, FaCreditCard } from 'react-icons/fa';
import axios from '../api/axios';
import { useTranslation } from 'react-i18next';

const CREDIT_VALUE = 9;

interface CreditOption {
  credits: number;
  isPopular?: boolean;
}

const CreditOption = ({ credits, isPopular = false, onClick }: CreditOption & { onClick: (credits: number) => void }) => {
  const { t } = useTranslation();
  return (
    <Box
      bg="rgba(255, 255, 255, 0.7)"
      borderRadius="20px"
      p={6}
      textAlign="center"
      position="relative"
      transition="all 0.3s ease"
      boxShadow="0 4px 12px 0 rgba(0, 0, 0, 0.05)"
      _hover={{ transform: 'translateY(-5px)', boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)' }}
      backdropFilter="blur(10px)"
    >
      {isPopular && (
        <Text
          position="absolute"
          top="-3"
          right="-3"
          bg="#10B981"
          color="white"
          fontSize="sm"
          fontWeight="bold"
          px={3}
          py={1}
          borderRadius="full"
        >
          {t('buyCredits.mostPopular')}
        </Text>
      )}
      <Icon as={FaCoins} w={10} h={10} color="#10B981" mb={4} />
      <Heading size="xl" mb={2} color="gray.800">
        {credits} {t('buyCredits.podcasts')}
      </Heading>
      <Text fontSize="3xl" fontWeight="bold" mb={4} color="gray.800">
        R$ {credits * CREDIT_VALUE}
      </Text>
      <Button
        onClick={() => onClick(credits)}
        leftIcon={<FaCreditCard />}
        bg="#10B981"
        color="white"
        _hover={{ bg: 'green.600' }}
        size="lg"
        width="full"
        fontWeight="bold"
        borderRadius="full"
        boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
      >
        {t('buyCredits.buyNow')}
      </Button>
    </Box>
  );
};

const BuyCredits = () => {
  const toast = useToast();
  const { t } = useTranslation();

  const handleBuyCredits = async (credits: number) => {
    try {
      const { data } = await axios.post(`/payment/create-checkout-session/${credits}`);
      window.location.href = data.url;
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as unknown as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to process payment request',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box width="100%" minHeight="100vh" bg="transparent" pt={8} pb={24}>
      <VStack spacing={12} align="stretch" maxW="container.xl" mx="auto" px={4}>
        <Flex direction="column" align="center">
          <Heading as="h1" size="2xl" mb={4} color="#10B981" fontWeight="bold">
            {t('buyCredits.topUp')}
          </Heading>
          <Text fontSize="xl" color="gray.600" textAlign="center">
            {t('buyCredits.choosePackage')}
          </Text>
        </Flex>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
          <CreditOption credits={3} onClick={handleBuyCredits} />
          <CreditOption credits={12} isPopular={true} onClick={handleBuyCredits} />
          <CreditOption credits={40} onClick={handleBuyCredits} />
        </SimpleGrid>
      </VStack>
    </Box>
  );
};

export default BuyCredits;
