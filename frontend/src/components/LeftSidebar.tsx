import React from 'react';
import { Box, VStack, Icon, Text, Flex, Button, Tooltip, keyframes } from '@chakra-ui/react';
import { FaMicrophone, FaCreditCard, FaSignOutAlt, FaCoins } from 'react-icons/fa';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { useState, useEffect } from 'react';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const sparkleAnimation = keyframes`
  0% { opacity: 0; transform: translate(0, 0); }
  50% { opacity: 1; transform: translate(-5px, -5px); }
  100% { opacity: 0; transform: translate(-10px, -10px); }
`;

const LeftSidebar: React.FC = () => {
  const location = useLocation();
  const bgColor = 'rgba(255, 255, 255, 0.7)';
  const cardBgColor = 'rgba(255, 255, 255, 0.5)';
  const selectedBgColor = 'rgba(16, 185, 129, 0.2)';
  const textColor = 'gray.800';
  const iconColor = '#10B981';
  const [credits, setCredits] = useState(0);
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get('auth/user-info');
        setUserName(response.data.data.username);
        setCredits(response.data.data.credits);
      } catch (error) {
        console.error('Failed to fetch user info:', error);
        setUserName('ERROR');
      }
    };

    fetchUserInfo();
  }, []);

  const menuItems = [
    { icon: FaMicrophone, text: t('sidebar.generate'), path: '/' },
    { icon: FaCreditCard, text: t('sidebar.buyCredits'), path: '/buy-credits' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Box
      as="nav"
      pos="fixed"
      top="6"
      left="6"
      h="calc(100vh - 160px)"
      w="200px"
      bg={bgColor}
      color={textColor}
      boxShadow="0 4px 12px 0 rgba(0, 0, 0, 0.05)"
      zIndex={20}
      overflowY="auto"
      p={4}
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      borderRadius="20px"
      backdropFilter="blur(2px)"
    >
      <VStack spacing={6} align="stretch">
        <Box
          fontSize="2xl"
          fontWeight="bold"
          textAlign="center"
          py={4}
          position="relative"
        >
          <Text
            as="span"
            bgGradient="linear(45deg, #10B981, #3B82F6, #10B981)"
            bgClip="text"
            backgroundSize="200% 200%"
            animation={`${gradientAnimation} 3s ease infinite`}
            position="relative"
            zIndex="1"
          >
            Podini
          </Text>
          {[...Array(5)].map((_, i) => (
            <Text
              key={i}
              as="span"
              position="absolute"
              top={`${20 + Math.random() * 60}%`}
              left={`${20 + Math.random() * 60}%`}
              fontSize="0.3em"
              opacity={0}
              animation={`${sparkleAnimation} ${3 + Math.random() * 2}s ease-in-out infinite ${Math.random() * 2}s`}
              zIndex="0"
            >
              ✨
            </Text>
          ))}
        </Box>
        <Flex align="center" justify="center" p={3}>
          <Icon as={FaCoins} boxSize={5} mr={2} color={iconColor} />
          <Text color={textColor} fontWeight="medium" fontSize="lg">{credits} {t('sidebar.credits')}</Text>
        </Flex>
        {menuItems.map((item, index) => (
          <Link to={item.path} key={index}>
            <Box
              bg={location.pathname === item.path ? selectedBgColor : cardBgColor}
              p={3}
              borderRadius="full"
              transition="all 0.3s ease"
              backdropFilter="blur(5px)"
              boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
            >
              <Flex align="center">
                <Icon as={item.icon} boxSize={5} mr={4} color={iconColor} />
                <Text color={textColor} fontWeight="medium">{item.text}</Text>
              </Flex>
            </Box>
          </Link>
        ))}
        <LanguageSwitcher />
      </VStack>
      <VStack spacing={4} mt={8}>
        <Text fontWeight="medium" color={textColor}>{userName}</Text>
        <Tooltip label={t('sidebar.logout')} aria-label="Logout">
          <Button
            leftIcon={<FaSignOutAlt />}
            bg={iconColor}
            color="white"
            _hover={{ bg: 'green.600' }}
            size="sm"
            width="100%"
            borderRadius="full"
            boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
            onClick={handleLogout}
          >
            {t('sidebar.logout')}
          </Button>
        </Tooltip>
      </VStack>
    </Box>
  );
};

export default LeftSidebar;
