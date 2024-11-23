import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  useToast,
  Text,
  VStack,
  Flex,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../api/axios';
import { FaLock } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

//@ts-expect-error expected
const MotionBox = motion(Box);
//@ts-expect-error expected
const MotionButton = motion(Button);

const ResetPassword: React.FC = () => {
  const { t } = useTranslation();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token');

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: t('auth.resetPassword.passwordsMismatch'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await axios.post('/auth/reset-password', { token, new_password: newPassword });
      toast({
        title: t('auth.resetPassword.resetSuccess'),
        description: t('auth.resetPassword.resetSuccessDesc'),
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      navigate('/login');
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        title: t('auth.resetPassword.resetFailed'),
        description: t('auth.resetPassword.resetFailedDesc'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (!token) {
    return (
      <Container color="#10B981" maxW="lg" py={10}>
        <Text>{t('auth.resetPassword.invalidToken')}</Text>
      </Container>
    );
  }

  return (
    <Box width="100%" minHeight="100vh" bg="transparent" pt={8} pb={24}>
      <Container maxW="container.xl">
        <VStack spacing={12} align="stretch">
          <Heading as="h1" size="2xl" textAlign="center" color="#10B981" fontWeight="bold">
            {t('auth.resetPassword.title')}
          </Heading>
          <Text textAlign="center" mb={8} color="gray.600">
            {t('auth.resetPassword.subtitle')}
          </Text>
          <Flex
            bg="white"
            boxShadow="2xl"
            borderRadius="3xl"
            overflow="hidden"
          >
            <Box flex={1} p={16}>
              <MotionBox
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <form onSubmit={handleResetPassword}>
                  <Stack spacing={6}>
                    <FormControl id="new-password" isRequired>
                      <FormLabel color="#10B981">{t('auth.resetPassword.newPassword')}</FormLabel>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        borderRadius="full"
                        borderColor="gray.300"
                        _focus={{ borderColor: '#10B981', boxShadow: '0 0 0 1px #10B981' }}
                        pl="10"
                        placeholder={t('auth.resetPassword.enterNewPassword')}
                        color="black"
                      />
                      <Box position="relative" width="0">
                        <FaLock
                          color="#10B981"
                          style={{ position: 'absolute', top: '-30px', left: '12px' }}
                        />
                      </Box>
                    </FormControl>
                    <FormControl id="confirm-password" isRequired>
                      <FormLabel color="#10B981">{t('auth.resetPassword.confirmNewPassword')}</FormLabel>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        borderRadius="full"
                        borderColor="gray.300"
                        _focus={{ borderColor: '#10B981', boxShadow: '0 0 0 1px #10B981' }}
                        pl="10"
                        placeholder={t('auth.resetPassword.confirmNewPasswordPlaceholder')}
                        color="black"
                      />
                      <Box position="relative" width="0">
                        <FaLock
                          color="#10B981"
                          style={{ position: 'absolute', top: '-30px', left: '12px' }}
                        />
                      </Box>
                    </FormControl>
                    <MotionButton
                      type="submit"
                      bg="#10B981"
                      color="white"
                      size="lg"
                      fontSize="md"
                      borderRadius="full"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      boxShadow="md"
                      _hover={{ bg: '#0E9F6E' }}
                    >
                      {t('auth.resetPassword.resetPassword')}
                    </MotionButton>
                  </Stack>
                </form>
              </MotionBox>
            </Box>
          </Flex>
        </VStack>
      </Container>
    </Box>
  );
};

export default ResetPassword;