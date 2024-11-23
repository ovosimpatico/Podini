import React from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  Box,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Spinner,
  Flex,
  Image,
  ButtonGroup
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { useTranslation } from 'react-i18next';

interface PodcastFormProps {
  theme: string;
  setTheme: (theme: string) => void;
  handleGeneratePodcast: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
}

const languageOptions = [
  { code: 'en', name: 'English', flag: 'GB' },
  { code: 'pt', name: 'Português', flag: 'BR' },
  { code: 'es', name: 'Español', flag: 'ES' }
];

const PodcastForm: React.FC<PodcastFormProps> = ({
  theme,
  setTheme,
  handleGeneratePodcast,
  isLoading,
  selectedLanguage,
  onLanguageChange
}) => {
  const { t } = useTranslation();

  return (
    <Box
      bg="rgba(255, 255, 255, 0.7)"
      p={4}
      borderRadius="20px"
      boxShadow="0 4px 12px 0 rgba(0, 0, 0, 0.05)"
      backdropFilter="blur(2px)"
    >
      <form onSubmit={handleGeneratePodcast}>
        <VStack spacing={6} align="stretch">
          <FormControl id="theme">
            <FormLabel color="gray.800" fontWeight="medium">{t('podcast.theme')}</FormLabel>
            <Input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder={t('podcast.enterTheme')}
              bg="rgba(241, 241, 241, 0.7)"
              border="none"
              borderRadius="full"
              p={3}
              color="gray.800"
              _placeholder={{ color: "gray.600" }}
              _focus={{ boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
            />
          </FormControl>
          <ButtonGroup spacing={2} width="100%">
            <Button
              type="submit"
              bg="#10B981"
              color="white"
              _hover={{ bg: 'green.600' }}
              size="lg"
              flex="1"
              borderRadius="full"
              boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
              disabled={isLoading}
            >
              {isLoading ? <Spinner /> : t('podcast.generate')}
            </Button>
            <Menu placement="top-end">
              <MenuButton
                as={Button}
                bg="#10B981"
                color="white"
                _hover={{ bg: 'green.600' }}
                size="lg"
                borderRadius="full"
                boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
                width="auto"
                px={4}
              >
                <Flex align="center" justify="center">
                  <Image
                    src={`https://flagsapi.com/${languageOptions.find(lang => lang.code === selectedLanguage)?.flag}/flat/24.png`}
                    alt={selectedLanguage}
                    boxSize="20px"
                  />
                  <ChevronDownIcon ml={2} />
                </Flex>
              </MenuButton>
              <MenuList zIndex={1400}>
                {languageOptions.map((lang) => (
                  <MenuItem
                    key={lang.code}
                    onClick={() => onLanguageChange(lang.code)}
                    display="flex"
                    alignItems="center"
                  >
                    <Image
                      src={`https://flagsapi.com/${lang.flag}/flat/24.png`}
                      alt={lang.name}
                      boxSize="20px"
                      mr={2}
                    />
                    {lang.name}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
          </ButtonGroup>
        </VStack>
      </form>
    </Box>
  );
};

export default PodcastForm;