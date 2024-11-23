import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Divider,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  useToast,
  Flex,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  VStack,
} from '@chakra-ui/react';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { CheckCircleIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { useTranslation } from 'react-i18next';

//@ts-expect-error expected
const MotionBox = motion(Box);
//@ts-expect-error expected
const MotionButton = motion(Button);

const Login: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [isRecoveryEmailSent, setIsRecoveryEmailSent] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.access_token);
      toast({
        title: t('auth.login.loginSuccess'),
        description: t('auth.login.welcomeBack'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: t('auth.login.loginFailed'),
        description: t('auth.login.checkCredentials'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleForgotPassword = () => {
    setIsOpen(true);
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/auth/forgot-password', { email: recoveryEmail });
      setIsRecoveryEmailSent(true);
      toast({
        title: 'Password Recovery',
        description: `Recovery email sent to ${recoveryEmail}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Password recovery error:', error);
      toast({
        title: 'Password Recovery Failed',
        description: 'Please check your email and try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCloseRecoveryModal = () => {
    setIsOpen(false);
    setRecoveryEmail('');
    setIsRecoveryEmailSent(false);
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <Box width="100%" minHeight="100vh" bg="transparent" pt={8} pb={24}>
      <Container maxW="container.xl">
        <VStack spacing={12} align="stretch">
          <Heading as="h1" size="2xl" textAlign="center" color="#10B981" fontWeight="bold">
            {t('auth.login.title')}
          </Heading>
          <Text textAlign="center" mb={8} color="gray.600">
            {t('auth.login.subtitle')}
          </Text>
          <Flex
            bg="white"
            boxShadow="2xl"
            borderRadius="3xl"
            overflow="hidden"
          >
            <Box flex={1.2} bg="#10B981" p={0} display={{ base: 'none', lg: 'block' }}>
              <video
                src="src/assets/login_casty.mp4"
                autoPlay
                loop
                muted
                playsInline
                style={{
                  objectFit: 'cover',
                  width: '100%',
                  height: '100%',
                }}
              />
            </Box>
            <Box flex={1} p={16}>
              <MotionBox
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <form onSubmit={handleEmailLogin}>
                  <Stack spacing={6}>
                    <FormControl id="email" isRequired>
                      <FormLabel color="#10B981">{t('auth.login.email')}</FormLabel>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        borderRadius="full"
                        borderColor="gray.300"
                        _focus={{ borderColor: '#10B981', boxShadow: '0 0 0 1px #10B981' }}
                        pl="10"
                        placeholder={t('auth.login.enterEmail')}
                        color="black"
                      />
                      <Box position="relative" width="0">
                        <FaEnvelope
                          color="#10B981"
                          style={{ position: 'absolute', top: '-30px', left: '12px' }}
                        />
                      </Box>
                    </FormControl>
                    <FormControl id="password" isRequired>
                      <FormLabel color="#10B981" fontWeight="medium">
                        {t('auth.login.password')}
                      </FormLabel>
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        borderRadius="full"
                        borderColor="gray.300"
                        _focus={{ borderColor: '#10B981', boxShadow: '0 0 0 1px #10B981' }}
                        pl="10"
                        placeholder={t('auth.login.enterPassword')}
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
                      {t('auth.login.signIn')}
                    </MotionButton>
                  </Stack>
                </form>
                <Flex justifyContent="space-between" alignItems="center" mt={4}>
                  <Button
                    variant="link"
                    color="#10B981"
                    size="sm"
                    onClick={handleForgotPassword}
                    fontWeight="medium"
                  >
                    {t('auth.login.forgotPassword')}
                  </Button>
                  <Button
                    variant="link"
                    color="#10B981"
                    size="sm"
                    onClick={handleRegister}
                    fontWeight="medium"
                  >
                    {t('auth.login.createAccount')}
                  </Button>
                </Flex>
                <Divider my={6} />
              </MotionBox>
            </Box>
          </Flex>
        </VStack>
      </Container>
      <Modal isOpen={isOpen} onClose={handleCloseRecoveryModal}>
        <ModalOverlay />
        <ModalContent bg="white">
          <ModalHeader color="#10B981">{t('auth.passwordRecovery.title')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {!isRecoveryEmailSent ? (
              <form onSubmit={handleRecoverySubmit}>
                <FormControl id="recovery-email" isRequired>
                  <FormLabel color="#10B981">{t('auth.passwordRecovery.email')}</FormLabel>
                  <Input
                    type="email"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    placeholder={t('auth.passwordRecovery.enterEmail')}
                    borderRadius="full"
                    borderColor="gray.300"
                    _focus={{ borderColor: '#10B981', boxShadow: '0 0 0 1px #10B981' }}
                    color="black"
                  />
                </FormControl>
                <Button
                  type="submit"
                  bg="#10B981"
                  color="white"
                  mt={4}
                  borderRadius="full"
                  _hover={{ bg: '#0E9F6E' }}
                >
                  {t('auth.passwordRecovery.sendRecoveryEmail')}
                </Button>
              </form>
            ) : (
              <Flex direction="column" align="center">
                <CheckCircleIcon boxSize="50px" color="#10B981" />
                <Text mt={4} textAlign="center" color="gray.600">
                  {t('auth.passwordRecovery.recoveryEmailSent', { email: recoveryEmail })}
                </Text>
              </Flex>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              onClick={handleCloseRecoveryModal}
              variant="outline"
              borderColor="#10B981"
              color="#10B981"
              borderRadius="full"
            >
              {t('auth.passwordRecovery.close')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Login;