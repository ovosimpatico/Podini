import React from 'react';
import { Box, Select, Image, Flex } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', flag: 'GB' },
  { code: 'pt-BR', name: 'Português', flag: 'BR' },
  { code: 'es', name: 'Español', flag: 'ES' }
];

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (event: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(event.target.value);
  };

  const getCurrentFlag = () => {
    const currentLang = languages.find(lang => lang.code === i18n.language);
    return currentLang ? `https://flagsapi.com/${currentLang.flag}/flat/64.png` : '';
  };

  return (
    <Box
      position="relative"
      width="100%"
    >
      <Flex
        align="center"
        bg="rgba(255, 255, 255, 0.5)"
        borderRadius="full"
        p={2}
        boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
        backdropFilter="blur(5px)"
      >
        <Image
          src={getCurrentFlag()}
          alt="Selected language"
          boxSize="24px"
          mr={2}
          ml={2}
          borderRadius="full"
          objectFit="cover"
        />
        <Select
          value={i18n.language}
          onChange={changeLanguage}
          variant="unstyled"
          size="sm"
          width="full"
          icon={<></>} // Hide default select arrow
          sx={{
            paddingLeft: '0.5rem',
            cursor: 'pointer',
            '&:hover': {
              color: '#10B981',
            },
          }}
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </Select>
      </Flex>
    </Box>
  );
};

export default LanguageSwitcher;