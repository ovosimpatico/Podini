import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      50: '#E6FFFA',
      100: '#B2F5EA',
      200: '#81E6D9',
      300: '#4FD1C5',
      400: '#38B2AC',
      500: '#319795',
      600: '#2C7A7B',
      700: '#285E61',
      800: '#234E52',
      900: '#1D4044',
    },
  },
  fonts: {
    heading: '"Inter", sans-serif',
    body: '"Inter", sans-serif',
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'semibold',
        borderRadius: 'md',
      },
      variants: {
        //@ts-expect-error theme passes but custom theme is not typed
        solid: (props) => ({
          bg: props.colorMode === 'dark' ? 'brand.200' : 'brand.500',
          color: props.colorMode === 'dark' ? 'gray.800' : 'white',
          _hover: {
            bg: props.colorMode === 'dark' ? 'brand.300' : 'brand.600',
          },
        }),
        //@ts-expect-error theme passes but custom theme is not typed
        outline: (props) => ({
          borderColor: props.colorMode === 'dark' ? 'brand.200' : 'brand.500',
          color: props.colorMode === 'dark' ? 'brand.200' : 'brand.500',
          _hover: {
            bg: props.colorMode === 'dark' ? 'brand.200' : 'brand.50',
          },
        }),
        glass: {
          bg: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          color: 'white',
          _hover: {
            bg: 'rgba(255, 255, 255, 0.2)',
          },
        },
      },
    },
    Input: {
      variants: {
        glass: {
          field: {
            bg: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            borderColor: 'transparent',
            _placeholder: { color: 'whiteAlpha.700' },
            _hover: { borderColor: 'whiteAlpha.400' },
            _focus: { borderColor: 'brand.500', boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)' },
          },
        },
      },
    },
    Heading: {
      baseStyle: {
        fontWeight: 'bold',
        letterSpacing: 'tight',
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: 'xl',
          boxShadow: 'xl',
        },
      },
    },
  },
  styles: {
    //@ts-expect-error theme passes but custom theme is not typed
    global: (props) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.900' : 'white',
        color: props.colorMode === 'dark' ? 'white' : 'gray.800',
      },
    }),
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
});

export default theme;