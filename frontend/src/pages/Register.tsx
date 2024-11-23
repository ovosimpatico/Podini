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
  VStack,
} from '@chakra-ui/react';
import { FaEnvelope, FaLock, FaUser } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { useTranslation } from 'react-i18next';

//@ts-expect-error expected
const MotionBox = motion(Box);
//@ts-expect-error expected
const MotionButton = motion(Button);

const Register: React.FC = () => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const toast = useToast();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: t('auth.register.passwordsMismatch'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    try {
      const response = await axios.post('/auth/register', {
        email,
        username: name,
        password,
        initial_credits: 0,
      });
      console.log(response.data);

      localStorage.setItem('token', response.data.access_token);

      toast({
        title: t('auth.register.registrationSuccess'),
        description: t('auth.register.registrationSuccessDesc'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: t('auth.register.registrationFailed'),
        description: t('auth.register.registrationFailedDesc'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  return (
    <Box width="100%" minHeight="100vh" bg="transparent" pt={8} pb={24}>
      <Container maxW="container.xl">
        <VStack spacing={12} align="stretch">
          <Heading as="h1" size="2xl" textAlign="center" color="#10B981" fontWeight="bold">
            {t('auth.register.title')}
          </Heading>
          <Text textAlign="center" mb={8} color="gray.600">
            {t('auth.register.subtitle')}
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
                <Text textAlign="center" mb={8} color="gray.600">
                  {t('auth.register.subtitle')}
                </Text>
                <form onSubmit={handleRegister}>
                  <Stack spacing={6}>
                    <FormControl id="name" isRequired>
                      <FormLabel color="#10B981" fontWeight="medium">{t('auth.register.fullName')}</FormLabel>
                      <Input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        borderRadius="full"
                        borderColor="gray.300"
                        _focus={{ borderColor: '#10B981', boxShadow: '0 0 0 1px #10B981' }}
                        pl="10"
                        placeholder={t('auth.register.enterName')}
                        color="black"
                      />
                      <Box position="relative" width="0">
                        <FaUser color="#10B981" style={{ position: 'absolute', top: '-30px', left: '12px' }} />
                      </Box>
                    </FormControl>
                    <FormControl id="email" isRequired>
                      <FormLabel color="#10B981" fontWeight="medium">{t('auth.register.email')}</FormLabel>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        borderRadius="full"
                        borderColor="gray.300"
                        _focus={{ borderColor: '#10B981', boxShadow: '0 0 0 1px #10B981' }}
                        pl="10"
                        placeholder={t('auth.register.enterEmail')}
                        color="black"
                      />
                      <Box position="relative" width="0">
                        <FaEnvelope color="#10B981" style={{ position: 'absolute', top: '-30px', left: '12px' }} />
                      </Box>
                    </FormControl>
                    <FormControl id="password" isRequired>
                      <FormLabel color="#10B981" fontWeight="medium">{t('auth.register.password')}</FormLabel>
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        borderRadius="full"
                        borderColor="gray.300"
                        _focus={{ borderColor: '#10B981', boxShadow: '0 0 0 1px #10B981' }}
                        pl="10"
                        placeholder={t('auth.register.enterPassword')}
                        color="black"
                      />
                      <Box position="relative" width="0">
                        <FaLock color="#10B981" style={{ position: 'absolute', top: '-30px', left: '12px' }} />
                      </Box>
                    </FormControl>
                    <FormControl id="confirmPassword" isRequired>
                      <FormLabel color="#10B981" fontWeight="medium">{t('auth.register.confirmPassword')}</FormLabel>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        borderRadius="full"
                        borderColor="gray.300"
                        _focus={{ borderColor: '#10B981', boxShadow: '0 0 0 1px #10B981' }}
                        pl="10"
                        placeholder={t('auth.register.confirmYourPassword')}
                        color="black"
                      />
                      <Box position="relative" width="0">
                        <FaLock color="#10B981" style={{ position: 'absolute', top: '-30px', left: '12px' }} />
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
                      {t('auth.register.signUp')}
                    </MotionButton>
                  </Stack>
                </form>
                <Divider my={6} />
                <Flex justifyContent="center" alignItems="center" mt={4}>
                  <Button
                    variant="link"
                    color="#10B981"
                    size="sm"
                    onClick={handleLoginRedirect}
                    fontWeight="medium"
                  >
                    {t('auth.register.haveAccount')}
                  </Button>
                </Flex>
              </MotionBox>
            </Box>
          </Flex>
        </VStack>
      </Container>
    </Box>
  );
};

export default Register;